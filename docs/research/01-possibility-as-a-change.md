# 01 — Possibility as a change / الإمكانية بوصفها تغيرًا
2026-11-14. Research synthesis, not an approved design or stack. Read the founding conversation first. This is not an alternative product or a visual prototype.

## Research
- Sarasvathy's effectuation: people shape entrepreneurial futures from available means, affordable downside and voluntary stakeholder commitments rather than relying on prediction. https://effectuation.org/the-five-principles-of-effectuation and https://www.darden.virginia.edu/effectuation
- Ecological psychology: affordances concern the relation between an agent's capacities and the environment, not merely objects in isolation. https://pmc.ncbi.nlm.nih.gov/articles/PMC6280920/
- Temporal planning: action preconditions, durations, effects, time windows and resources can be reasoned about explicitly. https://doi.org/10.1146/ANNUREV-CONTROL-082619-100135 and https://ijcai.org/proceedings/2015/237
- Constraint programming: feasible combinations can be distinguished from infeasible ones under modeled constraints. https://developers.google.com/optimization/cp
- Event sourcing: a history of state changes can reconstruct prior state. https://www.martinfowler.com/eaaDev/EventSourcing.html
- Bret Victor's Inventing on Principle: a creator should perceive the effect of changes directly. https://jamesclear.com/great-speeches/inventing-on-principle-by-bret-victor

These are sources of principles, not evidence that combining them creates a commercially validated or unprecedented product.

## Proposed synthesis: the world changes what can be done
The unit of value is not an item or a generated idea. It is a defensible change in what the human can do given their capabilities, real relationships, constraints and time. An opportunity can begin with a single action that enables a subsequent action. A new external event or verified human decision changes the reachable set of actions. Generating text alone does not change real-world state.

The world retains an identity. Its history distinguishes observation, inference, proposed action, authorization and confirmed outcome. A counterfactual is a temporary view of possible consequences in that same world, not a second product, not a claim that the future happened. Commitments and actual outcomes must be explicitly verified. A rejected or expired route remains explainable; it cannot silently become feasible without a relevant change. Do not imply causality merely from correlation.

## Mechanism to investigate
Represent claims with provenance and validity, actions with preconditions/effects/duration and permissions, and propositions with assumptions, resource constraints and affected parties. Use retrieval and language models to find and suggest plausible combinations; use explicit checks and, where appropriate, constraint solvers to reject inconsistent combinations. Distinguish mathematical feasibility under modeled assumptions from market viability and stakeholder consent. Track why a possibility changes instead of silently regenerating a list. Event-led persistence is a candidate, not a mandatory implementation: retention, privacy and correction/deletion have to be designed.

## Illustrative scenario (fictional, not customer data)
A software firm can integrate an existing product but lacks access to clinics. A distributor has clinic relationships but lacks software delivery capacity. A new compliance requirement has a real deadline in this fictional world. A licensed partner can deliver the missing component. The proposed outcome is a jointly offered service, not an established contract.
If the partner cannot participate before the deadline, the route becomes infeasible under that assumption. If a different delivery scope meets the constraints, the system can propose the narrower route and explain the tradeoff. A commitment made in the real world, rather than an AI suggestion, changes the actual state. A first actionable step may be to obtain consent to a tightly scoped joint pilot. If nobody confirms the need, do not claim an opportunity has been verified.

## Design consequence
The human should interact with the thing being created and see what changes, rather than submitting successive prompts and reading disconnected replies. When a condition is edited, preserve identity and human work while changing the relevant consequences. Actual and hypothetical states must remain distinguishable without expecting the user to learn technical vocabulary. Asynchronous research must not pretend to be instantaneous; show real progress only when useful. A specific proposed action and its rationale should be intelligible without exposing the underlying machinery. No visual layout, interaction widget, compulsory metaphor, or technology is approved by this note.

## Open questions before production
How to ground external claims; how to model causal assumptions without overclaiming; how to represent people and consent; which constraint model is sufficiently useful; how to distinguish a proposal from a real event; how to preserve corrections and deletion; how to create a clear, beautiful continuous representation. Use a real, consented commercial case to validate the first meaningful outcome when appropriate. No mock demo or deployment was created.
