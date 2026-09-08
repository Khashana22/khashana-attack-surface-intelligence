# Architecture

## Platform architecture

```mermaid
flowchart LR
  L[Authorized local lab] --> P[Controlled collectors / fixtures]
  P --> N[Parser & normalizer]
  N --> D[(PostgreSQL data model)]
  D --> R[Risk correlation engine]
  R --> U[Security intelligence dashboard]
  U --> H[Researcher review]
  H --> E[Evidence, reports, remediation & retest]
```

The included runnable demo uses deterministic fixture data and an in-memory reviewer state so it can run without dependencies. `database/schema.sql` is the PostgreSQL persistence model for the Docker deployment path.

## Finding lifecycle

```mermaid
stateDiagram-v2
  [*] --> Detected
  Detected --> Needs_Validation
  Needs_Validation --> Validated
  Needs_Validation --> False_Positive
  Validated --> Accepted_Risk
  Validated --> Remediated
  Remediated --> Retest_Required
  Retest_Required --> Closed
```

## Change detection

The baseline consists of asset identity, services, technologies, HTTP/TLS behavior, auth surfaces, findings, and risk score. A new scan is diffed against that state to create additions, removals, and changed observations. The dashboard demonstrates two newly observed synthetic assets and one remediated TLS finding.

## API design

The REST contract is available in [openapi.yaml](openapi.yaml). Mutating operations should require authenticated, authorized users in production; the portfolio demo deliberately does not claim to implement a production identity provider.
