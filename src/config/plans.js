
export const MONTHLY_COMPUTE_PRICES=[
 [49,65,85,105,125,145,165,185],[65,99,115,135,155,175,195,215],
 [85,120,150,170,190,210,230,250],[110,185,200,220,240,260,280,300],
 [130,195,215,240,260,280,300,320],[150,220,240,270,290,310,330,350],
 [175,245,270,300,325,350,375,400],[200,275,300,350,375,400,450,500],
];
export const isRecommended=(ram,cpu)=>Number(ram)===8&&Number(cpu)===4;
// Preserve every original 1–8 GB / 1–8 vCPU price.
// Only the Indian INR catalog discounts resources above the 8x8 table.
// All international currencies keep the original reference (+60/+90).
export const MAX_COMPUTE_RAM=24;
export const MAX_COMPUTE_CPU=24;
const priceWithExtras=(ram,cpu,extraRAM,extraCPU)=>{
 const r=Number(ram),c=Number(cpu);
 if(!Number.isInteger(r)||!Number.isInteger(c)||r<1||r>MAX_COMPUTE_RAM||c<1||c>MAX_COMPUTE_CPU)return null;
 const baseR=Math.min(r,8),baseC=Math.min(c,8);
 return MONTHLY_COMPUTE_PRICES[baseR-1][baseC-1]+(r-baseR)*extraRAM+(c-baseC)*extraCPU;
};
export const computePrice=(ram,cpu)=>priceWithExtras(ram,cpu,50,75);
export const computeInternationalPrice=(ram,cpu)=>priceWithExtras(ram,cpu,60,90);

export const BILLING_TERMS = [
 {months:1,discountPercent:0,label:'Monthly'},
 {months:3,discountPercent:7,label:'3 months'},
 {months:6,discountPercent:14,label:'6 months'},
 {months:12,discountPercent:30,label:'12 months'},
];
export const billingTerm = (months) => BILLING_TERMS.find(term=>term.months===Number(months)) || BILLING_TERMS[0];
export function termQuoteFromMonthlyPrice(monthlyPriceINR,months){
 const term=billingTerm(months);
 if(!Number.isSafeInteger(Number(monthlyPriceINR))||Number(monthlyPriceINR)<=0)return null;
 const subtotalPaise=monthlyPriceINR*term.months*100;
 const discountPaise=Math.floor((subtotalPaise*term.discountPercent+50)/100);
 return {months:term.months,discountPercent:term.discountPercent,monthlyPriceINR,
  subtotalPaise,discountPaise,totalPaise:subtotalPaise-discountPaise};
}
export function termQuote(ram,cpu,months,isInternational=false){
 const monthly=isInternational?computeInternationalPrice(ram,cpu):computePrice(ram,cpu);
 return termQuoteFromMonthlyPrice(monthly,months);
}
export const priceINR=(paise) => (Number(paise)/100).toLocaleString('en-IN',{
 style:'currency',currency:'INR',minimumFractionDigits:0,
 maximumFractionDigits:2
});
