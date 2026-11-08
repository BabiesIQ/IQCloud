FROM golang:1.23-alpine AS builder
WORKDIR /src
COPY go.mod .
COPY main.go .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /babiesiq-api main.go

FROM alpine:3.20
RUN adduser -D -u 10001 cloud
USER cloud
COPY --from=builder /babiesiq-api /usr/local/bin/babiesiq-api
ENV PORT=8080
EXPOSE 8080
ENTRYPOINT ["/usr/local/bin/babiesiq-api"]
