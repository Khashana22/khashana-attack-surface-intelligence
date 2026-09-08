# Security methodology

## Scope and authorization

Every assessment begins with documented scope and authorization. This demonstration locks automation to `.local` targets and identifies Northstar Labs as fictional training data.

## Workflow

1. **Discover** — collect authorized DNS, HTTP, TLS, and service observations from a local lab.
2. **Classify** — identify environment, asset type, owner, sensitive function, and authentication surface.
3. **Analyze** — normalize tool signals into assets, services, technologies, endpoints, and evidence.
4. **Correlate** — calculate risk in business context; signal severity is only one input.
5. **Validate** — a researcher determines whether a signal is validated, a false positive, accepted risk, or needs investigation.
6. **Report** — communicate exposure, impact, evidence, priorities, and remediation actions for technical and executive audiences.
7. **Retest** — compare the new observation with the baseline and preserve proof of remediation.

## Detection is not validation

Automation is useful for surfacing signals. It cannot by itself establish exploitability, business relevance, compensating controls, or client risk acceptance. The platform keeps scanner-like detection records separate from editable researcher reviews and status history.

## Controlled evidence

Evidence in the demo is synthetic and local: request/response metadata, timestamps, asset attribution, review fields, and state. No claims are made about real targets or real-world exploitability.
