# BabiesIQ Cloud Go API (demo)

An isolated API demo illustrating pricing, simulated orders and safe placeholder DNS instructions.
This is **not connected to Railway** and does not create VPS instances, issue IP addresses,
charge customers or verify DNS ownership.

## Local run
Run `go run .` from this directory (Go 1.22 or newer). It binds to `PORT` or 8080.

## Endpoints
- GET /health
- GET /api/v1/meta
- POST /api/v1/quote
- POST /api/v1/orders/demo
- GET /api/v1/orders/demo/{id}
- POST /api/v1/domains/preview

## Quote example
```bash
curl -sS http://localhost:8080/api/v1/quote \
  -H 'Content-Type: application/json' \
  -d '{"vcpu":2,"ramGb":4,"storageGb":50,"region":"ap-southeast","os":"ubuntu-24","term":"monthly"}'
```

## Production architecture still required
1. Real user auth, secure session verification and tenant ownership checks.
2. Durable Postgres tables for users, products, orders, reservations, resource quotas,
   invoices, payments, operations, audit events and DNS verification state.
3. Signed, idempotent gateway payment webhooks before provisioning after paid status.
4. Operator-owned Railway API secret, stored only in backend environment.
5. Queue and worker for provisioning, retry/backoff and compensating actions.
6. Actual Railway project/service and volume allocation, API reconciliation and
   service lifecycle management. Confirm supported regions and resource limits.
7. Verified ownership before attaching custom domains and a Railway-returned CNAME/TXT
   target. DNS checks alone should not falsely mark an account verified.
8. Hardened customer isolation, SSH proxy allocation, public-network routing,
   abuse prevention, backups, logging and resource usage metering.
9. Platform ToS, pricing, taxes, legal, customer support and refund review.
10. A dedicated KVM provider or permitted virtualization host if selling **full VPS**
    rather than clearly labeled managed Linux containers.

The current in-memory demo orders disappear on restart; don't use this service for payments.
The frontend preview runs separately on Apper and is not yet wired to these endpoints.
