# 01 — Birth / الميلاد
Status: proposed canonical product design, pending human review before implementation.
Scope: first meaningful encounter, then continuity into the same world. Not a prototype, separate onboarding flow, or old product redesign.

## Intent
The human introduces one real starting point; the world grows around it. Complexity belongs in the production of meaningful results, not in the vocabulary or visible mechanism. A user does not need a company, an account profile, a taxonomy, or knowledge of AI to understand the first action.

## The actual first composition
A single continuous, responsive surface. No sidebar, feed, menu of capabilities, marketing hero, scrolling welcome page, or decorative animation. The product name is a discreet signature, not the main subject. A clear text focal point and a single editable line share one composition. The starting point stays recognizable in the same visual space as knowledge develops; do not replace the world with a new page when a query completes.
Proposed first copy (not a marketing headline):
- EN: "What are you working on?" / field: "A company, a product, a website…" / action: "Begin".
- AR: "بتشتغل على إيه؟" / field: "شركة، منتج، موقع…" / action: "ابدأ".
- A secondary text action permits beginning without external lookup or entering personal information; it opens the same editable space for a manually supplied starting point. No fabricated sample opportunities.
The text line is a seed, not an AI chat history, and not a global search results page. A submitted seed stays editable/correctable. Visual material, typography, palette and lighting are not yet locked. Design them as a coherent whole before production code.

## Event sequence
1. Human opens the world. If authorized prior state exists, restore it directly with no welcome ceremony. Otherwise show the first composition.
2. Human supplies a name, URL, product or sentence. Validate input. Do not treat an ambiguous name as identified. Ask only for the necessary disambiguation inline, not a survey. For URLs, show intended public-source access and respect permission and egress policies.
3. Commit the seed to current local/session state (persistent storage only as authorized). Acknowledge immediately. Maintain the current focus, visible cancellation, and accessible status. No fake progress or forced animation.
4. Evidence acquisition can continue while the human remains in the same editable world. Store provenance, source timestamps, collection time, access scope, and conflicting claims. Never silently infer identity, capability or consent. No scraping private resources or sending messages without authorization.
5. If there is a specific evidenced intersection, the world can bring that relationship into view beside the starting point, explaining what the two parties can contribute in plain language. Do not show a generic match score, a grid of leads, or a graph merely to illustrate computation. The next action should be specific to the proposed value.
6. A new commercial possibility is shown as a proposed creation, with a concise reason for why now and an inspectable evidence trail. It is not an established deal, a promise, or an unquestionable conclusion. The human can change assumptions or decline a relationship, and the world preserves that decision.
7. The proposed creation, its evidence and its human-authored changes belong to the same world as the seed. The first encounter is not thrown away after onboarding. Return restores the last meaningful state.

## Time and context
Timing is a causal input, not an animation timeline. An intersection may not be useful unless the needs, ability, location, constraints and timing align. Store the observation date separately from event validity and acquisition date. A previously rejected or expired proposition cannot silently reappear unchanged. Meaningful new evidence can open it again with an explanation.
No automatic conclusion when evidence is absent, stale or contradictory. A useful result can be "No grounded connection yet" plus a specific next step, rather than decorative filler.

## Motion, interaction and accessibility
First paint must contain intelligible controls without waiting for motion/audio. Keyboard Tab order: seed, primary action, secondary action; Enter submits only valid input; Escape cancels an ongoing cancelable operation without losing the seed. Focus is preserved through state changes; asynchronous updates use a polite status announcement and never steal focus. RTL and LTR use logical layout, not mirrored hardcoded positioning. Small screens preserve the same interaction and content priorities. Motion is tied to semantic state changes, optional under reduced motion, and never blocks input. Audio is off by default. Visual composition should support readability, WCAG 2.2 AA contrast and target sizing; final measurements await the visual production specification.

## Failure states
Invalid URL: inline correction, preserve typed text. Ambiguous entity: distinguish using grounded identifiers. Network or provider failure: say what failed, allow retry or continue manually. No result: no fake confidence or artificial example. Cancel: preserve draft and cancel requested work where possible. Access denied: no unauthorized fallback. Return: restore only authorized state. External actions: require explicit authorization as applicable.

## Production contract
One world with state-driven representation, not one immutable viewport. Underlying entities, evidence, temporal context, candidate relationships, propositions, decisions and actions must be separable, traceable, versionable and revisable. The engine may employ retrieval, relation inference, constraint reasoning, temporal analysis, generation and verification; technology/model/framework selection is intentionally deferred until the interaction and constraints justify it. Rendering technology is not a premise. No old files, no old visual language, no code or deployment created by this spec.

## Acceptance
- A first-time human can explain the purpose and complete the first action without onboarding instructions.
- A returning human resumes the same meaningful context.
- Async changes do not disrupt input; no action requires motion or audio.
- The first grounded relationship has specific evidence and temporal context; the proposal is distinct from fact.
- The entire journey stays within a continuous experience and is recoverable; no mock data is treated as real.
- No deployment or implementation until the canonical visual and interaction specification is reviewed.

## Next
Art-direct the actual first composition and its transformation into the first grounded relationship, in place, as a single production design. Resolve exact spatial hierarchy, type, visual language, input behavior and semantic transitions before implementing. Do not create competing prototypes.
