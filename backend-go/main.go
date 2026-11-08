package main

import (
  "encoding/json"
  "errors"
  "fmt"
  "log"
  "math"
  "net/http"
  "os"
  "regexp"
  "strings"
  "sync"
  "time"
)

type Plan struct {
  VCPU int `json:"vcpu"`
  RAMGB int `json:"ramGb"`
  StorageGB int `json:"storageGb"`
  Region string `json:"region"`
  OS string `json:"os"`
  Term string `json:"term"`
}

type Request struct {
  Name string `json:"name"`
  Plan
}

type Quote struct {
  MonthlyINR int `json:"monthlyInr"`
  AnnualINR int `json:"annualInr"`
  Currency string `json:"currency"`
  ProvisioningMode string `json:"provisioningMode"`
}

type Order struct {
  ID string `json:"id"`
  Name string `json:"name"`
  Plan Plan `json:"plan"`
  Quote Quote `json:"quote"`
  Status string `json:"status"`
  CreatedAt time.Time `json:"createdAt"`
}

var (
  mu sync.Mutex
  orders = map[string]Order{}
  namePattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]{2,39}$`)
  regions = map[string]bool{"us-west":true,"us-east":true,"eu-west":true,"ap-southeast":true}
  images = map[string]bool{"ubuntu-24":true,"debian-12":true,"alpine":true}
)

func respond(w http.ResponseWriter, code int, value any) {
  w.Header().Set("Content-Type","application/json")
  w.WriteHeader(code)
  _ = json.NewEncoder(w).Encode(value)
}

func validate(p Plan) error {
  if p.VCPU < 1 || p.VCPU > 8 { return errors.New("vCPU must be between 1 and 8") }
  if p.RAMGB < 1 || p.RAMGB > 16 { return errors.New("RAM must be between 1 and 16 GB") }
  if p.StorageGB < 10 || p.StorageGB > 200 || p.StorageGB%10 != 0 { return errors.New("disk must be 10 to 200 GB in steps of 10") }
  if !regions[p.Region] { return errors.New("unknown region") }
  if !images[p.OS] { return errors.New("unknown image") }
  if p.Term != "monthly" && p.Term != "yearly" { return errors.New("term must be monthly or yearly") }
  return nil
}

func quote(p Plan) Quote {
  base := float64(149 + p.VCPU*110 + p.RAMGB*95) + float64(p.StorageGB)*3.5
  multiplier := 1.0
  if p.Region == "ap-southeast" { multiplier=1.12 }
  if p.Region == "eu-west" { multiplier=1.08 }
  if p.Term == "yearly" { multiplier *= 0.85 }
  price := int(math.Round(base*multiplier))
  return Quote{MonthlyINR:price,AnnualINR:price*12,Currency:"INR",ProvisioningMode:"demo-only"}
}

func readJSON(w http.ResponseWriter, r *http.Request, dest any) error {
  r.Body = http.MaxBytesReader(w,r.Body,1<<20)
  decoder := json.NewDecoder(r.Body)
  decoder.DisallowUnknownFields()
  return decoder.Decode(dest)
}

func main() {
  mux := http.NewServeMux()
  mux.HandleFunc("GET /health",func(w http.ResponseWriter,r *http.Request){
    respond(w,http.StatusOK,map[string]any{"status":"ok","service":"babiesiq-cloud-go-demo","demo":true})
  })
  mux.HandleFunc("GET /api/v1/meta",func(w http.ResponseWriter,r *http.Request){
    respond(w,http.StatusOK,map[string]any{
      "regions":[]string{"us-west","us-east","eu-west","ap-southeast"},
      "images":[]string{"ubuntu-24","debian-12","alpine"},
      "product":"container-hosting-preview",
      "dedicatedIPv4":false,
      "railwayProvisioning":false,
    })
  })
  mux.HandleFunc("POST /api/v1/quote",func(w http.ResponseWriter,r *http.Request){
    var p Plan
    if err:=readJSON(w,r,&p);err!=nil {respond(w,400,map[string]string{"error":"invalid JSON"});return}
    if err:=validate(p);err!=nil {respond(w,422,map[string]string{"error":err.Error()});return}
    respond(w,200,quote(p))
  })
  mux.HandleFunc("POST /api/v1/orders/demo",func(w http.ResponseWriter,r *http.Request){
    var req Request
    if err:=readJSON(w,r,&req);err!=nil {respond(w,400,map[string]string{"error":"invalid JSON"});return}
    if !namePattern.MatchString(req.Name) {respond(w,422,map[string]string{"error":"invalid hostname"});return}
    if err:=validate(req.Plan);err!=nil {respond(w,422,map[string]string{"error":err.Error()});return}
    now:=time.Now().UTC()
    id:=fmt.Sprintf("demo-%d",now.UnixNano())
    order:=Order{ID:id,Name:req.Name,Plan:req.Plan,Quote:quote(req.Plan),Status:"demo-requested",CreatedAt:now}
    mu.Lock()
    orders[id]=order
    mu.Unlock()
    respond(w,http.StatusCreated,order)
  })
  mux.HandleFunc("GET /api/v1/orders/demo/{id}",func(w http.ResponseWriter,r *http.Request){
    mu.Lock()
    order,exists:=orders[r.PathValue("id")]
    mu.Unlock()
    if !exists {respond(w,404,map[string]string{"error":"demo order not found"});return}
    respond(w,200,order)
  })
  mux.HandleFunc("POST /api/v1/domains/preview",func(w http.ResponseWriter,r *http.Request){
    var payload struct {Hostname string `json:"hostname"`}
    if err:=readJSON(w,r,&payload);err!=nil || !strings.Contains(payload.Hostname,".") {
      respond(w,422,map[string]string{"error":"valid hostname required"});return
    }
    respond(w,200,map[string]any{
      "hostname":payload.Hostname,
      "status":"awaiting-real-railway-assignment",
      "recordType":"CNAME",
      "recordValue":nil,
      "verified":false,
      "message":"A real target must be obtained from Railway after registering this custom domain.",
    })
  })
  port:=os.Getenv("PORT")
  if port=="" {port="8080"}
  log.Printf("BabiesIQ Cloud demo API listening on :%s",port)
  log.Fatal(http.ListenAndServe(":"+port,mux))
}
