# SIMULATED CASE STUDY — Northstar Labs

Northstar Labs is a fictional SaaS company preparing for a broader penetration test. Its goal is to understand external exposure first.

The controlled baseline contained four known local-lab assets. A later authorized discovery fixture introduced `staging.northstar.local` and `dev.northstar.local`. Classification marked the first as staging and the second as development. The intelligence view correlated a missing staging CSP and synthetic development debug metadata with exposure, ownership, and asset criticality.

The staging header signal was marked **Validated** because the local response fixture directly established the absent control. The development metadata signal remains **Needs Validation**: it is a credible lead, not a confirmed vulnerability. This separation prevents a scanner result from being represented as an established issue.

The historical TLS signal is marked **Remediated** after the reassessment fixture showed legacy protocol support was removed. The resulting deliverables are a prioritized asset inventory, findings with evidence, a remediation direction, and an explicit retest state.

All names, assets, observations, and evidence are simulated.
