# 05 — التجميع النهائي وقرار هندسة الإنتاج
14 نوفمبر 2026. خط أساس هندسي مختار لبدء الصناعة بناء على طلب المؤسس. يحل هذا القرار محل قائمة المرشحات السابقة حيث يتعارض معها، لا محل فلسفة المنتج. لا يعني اكتمال بحث prior art أو ثبوت جدة عالمية أو نجاح اختبارات لم تُنفذ. لا قفل فعلي لاعتماديات أو نشر في هذه المرحلة.

## 1. القرار
نعمل على نفس العالم الواحد. نبدأ بنواة حتمية ذات سلطة، ولغة معنى موحدة، وتكوين قائم على الدليل، وتعبير قابل للتفاعل، ومشاركة حقيقية بين مستقلين. لا نُحوّل هذه إلى منتجات أو خدمات منفصلة. نختار أصغر تركيب قادر على حمل الفلسفة، ونزيده عندما يثبت احتياج العالم، لا عند توفر مكتبة جذابة.

## 2. مصفوفة القرار
| المجال | المختار | المؤجل أو المستبعد الآن | لماذا / شرط فتح القرار |
|---|---|---|---|
| المعنى | World IR بإصدارات وJSON Schema 2020-12 وأنواع Rust/TS | لغة نصية عامة، MLIR/MPS/Spoofax | JSON IR يكفي للعقد؛ نحو خاص إذا احتجنا تأليف قواعد معقدة والتحقق منها |
| النواة | Rust stable 1.100.0، edition 2024، Cargo، serde/serde_json | Python/Node كنواة ثانية، WASM كامل | سلطة واحدة وreplay حتمي؛ Rust نفسه لا يضمن صحة المنطق |
| HTTP | Axum + Tokio + Tower؛ SQLx مرشح مرجح عند طبقة التخزين | بوابة موزعة، gRPC | HTTP contracts أولًا؛ resolve/pin integration before merge |
| التخزين | PostgreSQL 18.7، SQL migrations، transactions وoutbox عند إدخال jobs | Graph DB، Kafka، Redis افتراضيًا | تمثيل العلاقات والزمن والصلاحيات في relational schema؛ لا خدمة إضافية دون bottleneck مقاس |
| الذكاء | Python 3.14 + uv + provider-neutral structured adapter | swarm، نموذج خاص، framework orchestration ضخم | تقييم الاسترجاع والتكوين والمصادر؛ lock exact patch/packages after CI |
| القواعد | dependency index وbounded evaluation مملوكة للمنتج | Differential Dataflow، Soufflé | قارن full recomputation عند 1k/10k/100k قبل تعقيد المحرك |
| التخطيط | قيود صريحة ثلاثية الحالة من النواة | OR-Tools CP-SAT إذا ظهر تخصيص عددي، Z3 أو PDDL إذا احتجنا | لا solver قبل وجود مسألة حقيقية؛ توافق Python wheels غير متحقق |
| البحث | PostgreSQL text/metadata first، adapters | pgvector وreranker conditional؛ vector SaaS | العربية والإنجليزية وidentity retrieval benchmark قبل إضافة |
| التأليف التعاوني | revision checks + human conflict resolution | Automerge أو Yjs للحقول التي تسمح بالدمج | لا CRDT على موافقة/إذن؛ مقارنة لاحقة على مستند حقيقي |
| التفويض | منح scoped داخل النواة وتخزين relational/RLS defense-in-depth | OpenFGA/Cedar إلى أن تظهر حاجة قابلة للقياس | لا تبني crypto/session protocol؛ OIDC موثوق عند طبقة الهوية |
| التعبير | Expression IR + React 19.3 + TypeScript + DOM/CSS/SVG؛ Node 24 LTS وVite مرشح البناء | CanvasKit/Rive/WebGPU/WGSL/Cassowary عند الحاجة | semantic access first؛ لا GPU إلزامي؛ Vite/TS exact versions unresolved |
| interop | schemas, HTTP, SSE لتحديثات مصرح بها عند الحاجة | Protobuf، brokers، WebSocket إذا أثبت التحرير المتزامن الحاجة | مرجع معنى واحد، كل schema لها مراجعة وتوافق قديم/جديد |
| التشغيل | monorepo, CI, isolated local DB ثم staging | Kubernetes، multi-region، production launch | Web/API/worker/Postgres عند توفر الطبقات؛ لا نشر حالي |

الإصدارات المختارة مبدئية قابلة للقفل وليست lockfiles. تحقق رسمي بتاريخ 14 نوفمبر: Rust 1.100.0، PostgreSQL 18.7، React 19.3، Node 24 و26 LTS، Python 3.14 و3.15 ضمن bugfix support. اختيار 24/3.14 لتقليل مخاطر تبعيات أحدث؛ لا ندعي التوافق قبل تثبيت الحزم. تحقق إصدارات Axum, Tokio, SQLx, serde, Vite, TypeScript, npm/uv وDocker image digests عند bootstrap عبر registries الرسمية ومصفوفة CI. لا تكتب lockfiles باليد. ثبّت exact toolchains والتبعيات المباشرة وانتقالات الحزم، مع تحديثات أمنية مراجعة. المصادر:
- rust: https://blog.rust-lang.org/2026/11/12/Rust-1.100.0/
- node: https://nodejs.org/en/about/previous-releases
- python: https://www.python.org/downloads/
- postgres: https://www.postgresql.org/support/versioning/
- react: https://react.dev/versions
- schema: https://json-schema.org/draft/2020-12
- axum: https://docs.rs/axum/latest/axum/
- uv: https://docs.astral.sh/uv/concepts/projects/sync/
- ortools: https://developers.google.com/optimization/install/python
- ci: https://docs.github.com/en/actions/reference/security/secure-use

## 3. اختراعاتنا الفعلية
World Kernel: admission حتمي للأوامر، هوية واستمرارية، سلطة وrevision/idempotency، فصل المعرفة والإرادة والتكوين.
World Language: versioned IR + typed command contract + accepted event contract. تتكلم المحركات مع النواة ولا تكتب في state مباشرة.
Composition Engine: توليد تراكيب ذات معنى تحت سياق وأدلة وقيود؛ تقييم supported/contradicted/unknown؛ dependency propagation وexplanation؛ solver جاهز إذا دعت الحاجة. نبدأ deterministic rules، ثم AI candidate adapter.
Expression Engine: authorized semantic projections + stable identities + explicit actions + semantic continuity. لا يولد النموذج arbitrary UI code. DOM first؛ الرياضيات والرسم يخدمان معنى محددًا.
Shared Aperture: الجزء الذي يتيحه طرف لطرف مستقل؛ revision-exact response + grants + private boundaries. free communication is allowed without a recommended deal. التنفيذ الخارجي له بوابة تفويض ومستند outcome مستقل.

## 4. خريطة التبعيات
contracts → world-language → world-kernel → world-api + postgres
world-kernel → composition (read-only snapshot + candidate commands; no cycle in source dependency)
world-api → authorized projections → expression → web
intelligence worker → authenticated scoped API/jobs → candidates → kernel
external adapter → authorized outbox → provider receipt/reconciliation → kernel
نطبق world-language كأنواع وعقود، لا خدمة شبكة. لا كتابة canonical state إلا عبر API transaction/admission. منع الاعتماد المعكوس من kernel إلى UI/LLM/DB. لا اعتماد على الوقت الحالي أو I/O في reducer. وقت الحدث ومعرفه يصدران من boundary موثوق ويحفظان قبل replay. revisions أعداد محدودة بحد JavaScript safe integer في العقد الأول؛ overflow يرفض أو migration إصدار قبل الحد.

## 5. Slice 01 — أول جزء من المنتج الفعلي
نبدأ بخلق عمل بشري حقيقي المعنى وتعديله ومشاركة جزء محدد منه، والرد على نسخة محددة، وحفظ أثر هذه الأحداث. ليس demo أو شاشة. الإصدار الأول للغة v0.1 يغطي CreateWork, ReviseWork, ShareWork, RespondToShare, RevokeShare. نبدأ بخمسة أوامر محددة بدل تعريف 15 نوعًا على عجلة. لا يشمل هذا slice AI، إثبات حقائق خارجية أو التزامات قانونية أو رسائل حقيقية أو واجهة جاهزة. أول contract مرفق في contracts/v0.1/command.schema.json، design contract لا تنفيذ.
- actor context من session موثق server-side؛ لا actor id في طلب العميل. يربط سجل التفويض command_id والفاعل؛ لا replay لنتيجة شخص آخر.
- IDs opaque lowercase UUID strings في العقد؛ JSON Schema تحقق syntax فقط، server يحكم الوجود والسلطة والنسخة.
- expected_revision per work: 0 لإنشاء عمل جديد؛ >=1 للعمليات اللاحقة. ShareWork يخلق snapshot محدد بعد فحص revision. snapshot_revision في الرد هو إصدار المعنى المشاهد، يختلف عن expected_revision (current aggregate revision). الرد على نسخة سابقة ممكن إن ظل grant صالحًا وهو رد على النسخة السابقة فقط؛ stale current aggregate revision يتطلب إعادة تحميل أو إعادة إرسال صريح. لا يُمدد رد قديم لنسخة جديدة.
- Share محتوى ظاهر explicit title/scope_text مُختار بواسطة المالك؛ لا يضم كامل notes أو evidence. immutable snapshot; revocation stops subsequent reads/replies, not retrieval of already seen material. recipients verified before grant. Share scope first version view/respond only, no editing private fields.
- Responses: interested_in_discussion / decline / request_change. ليست التزامًا بعقد أو تجربة؛ أي commitment يحتاج عقدًا لاحقًا مختلفًا وموافقة ذات نطاق. نص الرد الاختياري ليس ترقية تلقائية للحالة.
- canonical event shape and reducer still to implement. handle command id unique per actor; identical payload retry returns prior accepted result without new mutation (authorization recheck before response); differing payload collision rejected; no raw secret logs. Successful mutations advance revision once. Reject leaves domain state unchanged. private payload retention/deletion policy prerequisite for persisted events.
- contracts and types generation + fixtures, Rust tests for in-memory reducer first, then API persistence. UUID validity/normalization and JSON parser duplicate-key handling tested; integer safe range across languages. no arbitrary untrusted fields.

## 6. بوابات التحقق والإنتاج
G0: reproducible toolchain on Linux CI; rust fmt/clippy/test --locked; schema validity and fixtures; package version and license/security audit. Pin GitHub actions full commit SHA verified upstream, least privileges, no secrets on untrusted PR.
G1: pure kernel replay, stable IDs, permission denial, stale current revision, duplicate IDs, snapshot binding, revocation, no assumed acceptance, deterministic replay/property tests. fixtures include A/B/C and synthetic data. 0 observed invariant failures, record seed for property tests; not a formal proof.
G2: isolated PostgreSQL integration, SQLx migrations up, snapshot/restore, crash transaction, concurrency and idempotency, RLS under runtime role, negative authorization across all surfaces, privacy/delete retention. Test restore, not just backup. No production environment until approved.
G3: first real visual composition and direct manipulation, keyboard/reduced motion, RTL/LTR, font shaping and IME, 320/768/1440 viewport, zoom and screen reader; visual direction in 05 design remains proposal; complete first encounter production art direction before coding it. User understands action without learning engine names.
G4: grounded AI and composition evaluation from research 04, citation/error distributions, retrieval and identity tests, dependency benchmark, adverse docs and bounded jobs.
G5: independent people, shared aperture and free communication, consent exact revision, no leakage, outcomes/replies, outbound gate. Provider integration only after explicit authority and review; no unauthorized outreach.
G6: security/performance/cost/accessibility/human acceptance, approved release plan; optional instruments require measurable purpose. No claim of finished product from green unit tests alone.

## 7. ميزانية هندسية وتشغيلية
Effort planning (not a delivery estimate): 100 engineering effort units across contracts/kernel 20, persistence/auth 20, expression/direct interaction 23, grounded intelligence/composition 20, shared interaction/communication 12, release/observability 5. Testing is embedded in every unit, not deferred to the final 5. Revise after G1 and G2. No shipping dates.
Operating cost model per month: C_total = C_web + C_api + C_db + C_worker + C_storage + C_network + C_observability + sum(input_tokens/1e6 * p_in + output_tokens/1e6 * p_out + allowed_source_calls * p_call) + contingency. Provider pricing not selected or verified as a quote. Illustrative load only: 100 active accounts × 10 research runs × 10k input + 2k output tokens = 10M input + 2M output; 5 source calls/run = 5,000 calls. At hypothetical rates $2/M input, $8/M output, $0.01/call, fixed infra assumption $100/month, subtotal $186/month; with 25% contingency $232.50. NOT market pricing or estimate of actual usage; excludes paid datasets, taxes, labor and external delivery fees. No billing activated. Initial test budget proposed $0 external calls until provider selected and founder authorizes cap; use synthetic fixtures and local deterministic checks. Budget per job, account/global quotas, timeout, spend telemetry, no silent overage. Recalculate with actual rates, region, consumption after instrumentation.

## 8. تعريف ما تم وما بقي
هذه الجولة تثبت baseline وقرارات عدم البناء وتبعية التنفيذ وعقدًا آليًا أوليًا. لا توجد محركات implemented أو packages installed أو locked أو CI run أو benchmark أو إنتاج منشور. Rust toolchain غير متاح في بيئة المحادثة؛ لا يمكن ادعاء compile. Schema validation on CI remains required. Full prior-art and legal novelty search not done. The next implementation follows G0/G1; no more broad research rounds unless a specific dependency or semantic problem needs evidence. 
