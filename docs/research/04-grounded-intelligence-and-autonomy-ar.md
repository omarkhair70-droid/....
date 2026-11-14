# الجولة البحثية الثالثة — هندسة الذكاء والتكوين والإرادة
14 نوفمبر 2026. امتداد 02 و03 والمعمارية 05. هذه مراجعة أولية لملخصات الأبحاث وصفحات الوثائق، لا قراءة كاملة لكل ورقة، ولا تنفيذ أو benchmark أو ادعاء جدة. الغرض تضييق الاختيارات لا إضافة تبعيات لمجرد وجودها.

## 1. المراجع والنتائج القابلة للنقل
- [Doyle — A Truth Maintenance System (1979)](https://doi.org/10.1016/0004-3702(79)90008-0): الحفاظ على مبررات الاعتقاد ومراجعة الاستنتاج عند تغيرها.
- [de Kleer — An Assumption-based TMS (1986)](https://doi.org/10.1016/0004-3702(86)90080-9): تمثيل مجموعات الافتراضات والسياقات المتعارضة. تطبيق ATMS كامل قد ينمو توافقيًا؛ نبدأ باعتمادات محدودة ومقيدة بالنطاق.
- [Provenance-Aware Knowledge Representation survey](https://doi.org/10.1007/s41019-020-00118-0): سياق الادعاء، أصل المعلومة والتعارض. الأصل ليس تصديقًا.
- [A Primer on Provenance](https://doi.org/10.1145/2602649.2602651): تتبع سلسلة التحويلات والمصادر.
- [Belnap's four-valued model — Oxford research report, chapter 5](https://www.cs.ox.ac.uk/files/3411/PRG88.pdf): إلهام لتمييز الدعم والمعارضة مع إمكانية غياب كليهما أو وجودهما معًا. لا ندعي أننا طبقنا كل جبر Belnap.
- [Soufflé Datalog provenance](https://www.souffle-lang.com/provenance): اشتقاقات قابلة للتفسير؛ مرشح عند زيادة القواعد، لا يمثل كل المعرفة الاحتمالية.
- [PDDL 2.1 — Fox and Long, 2003](https://www.cs.cmu.edu/afs/cs/project/jair/pub/volume20/fox03a-html/JAIRpddl.html): تمثيل التخطيط الزمني والموارد.
- [Multiagent Planning with Partially Ordered Temporal Plans](https://ijcai.org/proceedings/2003/255): التخطيط المتزامن مع اختلاف المعرفة والسيطرة على الأفعال.
- [A First-Order Formalization of Commitments and Goals for Planning](https://cdn.aaai.org/ojs/8632/8632-13-12160-1-2-20201228.pdf): تمثيل الالتزامات مع عدم إلغاء استقلال الأطراف. ليس بديلًا عن العقد القانوني أو التفويض الحقيقي.
- [Unified Planning](https://github.com/aiplan4eu/unified-planning/blob/master/docs/getting_started/introduction.md): واجهة Python محايدة بالنسبة للمخطط ومحولات PDDL؛ ندرسها إذا كبر مجال التخطيط.
- [ALCE — Enabling LLMs to Generate Text with Citations](https://arxiv.org/abs/2305.14627): قياس صحة الاستشهاد وتغطيته منفصلًا عن جودة النص، وليس دليلا على أن كل مخرج موثق صحيح.
- [pgvector hybrid retrieval](https://github.com/pgvector/pgvector/blob/master/README.md): البحث النصي والمتجهي مع دمج الرتب؛ الوسيلة ليست حكمًا بالصدق.
- [CaMeL — Defeating Prompt Injections by Design](https://arxiv.org/abs/2503.18813) و[research artifact](https://github.com/google-research/camel-prompt-injection): فصل السلطة عن البيانات وتتبع تدفق المعلومات. الكود بحثي وليس مكون أمن إنتاجيًا مضمونًا.
- [OWASP prompt injection prevention](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html) و[AI Agent Security](https://cheatsheetseries.owasp.org/cheatsheets/AI_Agent_Security_Cheat_Sheet.html): حدود الأدوات والتحقق والتفويض والميزانية خارج النموذج. لا prompt أو guardrail منفرد يضمن الأمان.

## 2. المعرفة: الادعاءات لا الحقائق المطلقة
Claim = (id, subject, predicate, object, context, valid_interval, recorded_at, source_refs, origin, scope, revision).
Source artifact يحفظ locator, fetched_at, version/hash, source class, extraction span, authorization and retention. لا نخزن محتوى محميًا أو خاصًا دون أساس مناسب. رمز القرب المتجهي ليس دليلًا.
لكل قضية محددة في السياق، S+(q) مجموعة أدلة داعمة نشطة، S-(q) أدلة معارضة نشطة. حالة المعرفة K(q) = (1[S+ nonempty], 1[S- nonempty]).
(0,0) غياب أساس كافٍ؛ (1,0) دعم دون معارضة معروفة؛ (0,1) معارضة دون دعم معروف؛ (1,1) تعارض. الحالة ليست احتمالًا ولا تصويتًا بالأغلبية ولا وصفًا لحقيقة العالم المطلقة. المصدر الذي يكرر مصدرًا آخر لا يعد تأكيدًا مستقلًا. نميز نطاق الزمن والمكان والمعنى قبل تسجيل التعارض. القواعد المحلية قد تستخدم closed world فقط عندما يوجد عقد اكتمال صريح (مثل سجل الأذونات الرسمي)، لا في المعرفة العامة.
الحقيقة الإجرائية (مثلاً وصل رد موثق) تختلف عن صدق محتوى الرد. لا يُعامل تصريح عام على أنه موافقة على عرض معين. نحتاج إثبات هوية وتفويض مطابق لنطاق القرار.

## 3. اختراع مسار التكوين Evidence → Composition → Action
Pipeline منطقية وليست مراحل منفصلة على واجهة المنتج:
A. البحث ضمن سياق مأذون: normalize، إزالة التكرار، مطابقة الهوية مع أسماء بديلة ومعرفات موثقة، بحث نصي ومتجهي ومرشحات سياق وزمن. نتائج مجهولة الهوية لا تدمج تلقائيًا.
B. استخراج claims صغيرة مع موضع دليل؛ LLM output untrusted. تسجيل مصدر دون اختراع citation؛ التحقق من وجود المقطع وانطباق المعنى عليه، وفرز ما يحتاج مراجعة. لا تعتمد على LLM واحد ليحكم بصحة نفسه.
C. توليد تراكيب من احتياج حقيقي/هدف إنساني + قدرات + أطراف/موارد + ظرف زمني ومكاني. لا نختزل العالم في مطابقة أشخاص، ولا نحجب الأفكار التي يولدها الناس بأنفسهم. نحفظ اختلاف الاقتراح عن الواقع.
D. حساب قيود صلبة (وقت، موارد، تعارض، إذن، شروط موثقة) وقيود مجهولة. محرك القيود يقرر consistency تحت النموذج، لا رغبة الشريك أو الجدوى السوقية. إذا لم تتوفر الأرقام لا يخترعها. لا يرفض unknown باعتباره false؛ يقترح سؤالًا مفيدًا إن لزم.
E. ربط كل مخرج بمراجع واعتمادات وإصدارات متنوعة. تحديد ما تغيّر ولماذا عند وصول حدث؛ لا تغيير تلقائي لهوية العمل أو نص إنساني.
F. تقديم المعنى والفعل المحتمل ضمن نفس التعبير؛ السماح للتفاعل البشري دون AI. أي فعل خارجي يمر بعقد تفويض مستقل.

## 4. رياضيات التكوين المقترحة
C = set of candidate configurations. Each candidate = (participants with roles, intended outcome, relevant claim refs, assumption set, resource constraints, time windows, proposed actions).
Evaluate(c,W) -> (hard violations, unresolved conditions, supported conditions, objective intervals when known, evidence trace). فصل feasible-under-model عن live/attested/implemented. احتمالات رقمية فقط بعد وجود بيانات معايرة مناسبة؛ لا نضع درجة 97% للتعاون لأن النموذج واثق.
نستبعد المرشح من المسار التنفيذي عندما ينتهك قيدًا صلبًا معلومًا، مع الاحتفاظ به كتاريخ أو تصور غير قابل للتنفيذ إذا اختار الإنسان. نحافظ على المرشحات الشرطية التي لها معنى إن حُل الغموض. مقارنة Pareto للأهداف المدعومة: تكلفة ووقت ونطاق ومخاطر، مع اتجاه ووحدة ومدى عدم يقين. لا أوزان عامة تحكم جميع البشر. توليد مرشحات محدود بالميزانية وتنوع المصادر وتكلفة التحقق، لا enumeration لجميع تركيبات الشركات.
D(d) = dependencies on claim version/rule/assumption/scope/time interval. عند تغير X: invalidate reverse-reachable descendants within authorized scope; recalculate affected subset; compare with full calculation under same snapshot. إعادة فحص صلاحية الوقت حتى في غياب تسجيل واقعة جديدة عبر job حقيقي في التنفيذ المستقبلي. تعارض أو سحب دليل لا يمحو التزامًا سبق صدوره؛ قد يغير إمكانية تنفيذه أو يستدعي مراجعة. لا ينعكس نقص المعلومة على بيانات طرف غير مشارك.
للتأكد من معنى السؤال: لا نطلب مزيدًا من المعلومات بلا هدف. نفضل السؤال الذي يميز بين مسارات قرار مختلفة ويستحق وقت الإنسان، دون ادعاء expected value رقمي قبل معايرة.

## 5. تخطيط بين إرادات مستقلة
Proposed action = actor/controller, target, preconditions, desired effects, estimated duration/interval, resource use, evidence, exact scope/revision. يميز plan step الذي يستطيع الإنسان تنفيذه عن حدث بيئي خارج التحكم أو التزام مقترح على طرف آخر. CP-SAT قد يحل الجدولة العددية؛ PDDL/Unified Planning مرشح عند نشوء تخطيط شرطي ومتعدد الخطوات. التفاعل الحر والتكوين غير التجاري الأساسيان لا ينتظران المخطط.
Commitment = (issuer, beneficiary, exact shared subject revision, scope, condition, promised action/outcome, timing, auth evidence, lifecycle). نموذج تقني للتعبير عن الالتزام، ليس نصًا قانونيًا نهائيًا. حالات مقترحة: proposed / attested / withdrawn / fulfilled / disputed / expired؛ الدلالة مفصولة عن ما إذا كان الانسحاب مشروعًا تعاقديًا. رفض أو توقف الاتصال لا يساوي إلغاء التزام قانوني. كل قبول يحتاج فاعلًا مأذونًا، ولا يكفي استنتاج LLM أو تشابه رسالتين. القبول القديم محفوظ لنطاقه؛ لا يُرحّل إلى نسخة جديدة تلقائيًا.
مثال افتراضي: ثلاث شركات، واحدة تملك قدرة، ثانية قناة، ثالثة ترخيصًا مطلوبًا. خطة مشروطة محتملة قبل اكتمال الموافقات؛ كل طرف يرى ما أتيح له ويمكنه رفض أو تعديل أو بدء حوار مستقل. دخول رد مؤكد يغيّر حالة الخطوة المعنية ولا يخلق موافقات الآخرين. اختلاف اللغة أو المنطقة لا يغير الدلالة أو نطاق القبول. لا يفترض العالم أن جميع الشركات مسجلة أو يمكن الاتصال بها.

## 6. عقد التنفيذ خارج العالم
Action request immutable after approval: command id, actor, permission/approval reference, canonical target, exact arguments or digest displayed in review, revision, expiration, idempotency key, data sensitivity and recipient scope. تعيد الخدمة فحص authority/revocation/revision قبل التنفيذ، بما في ذلك queue المتأخرة. النموذج لا يمتلك أسرار المزود ولا ينفذ كتابة SQL أو إخراج شبكة اعتباطي.
النتائج tracked: requested / authorized / queued / provider-acknowledged / failed / uncertain / outcome-confirmed؛ هذه حالات داخلية لا قائمة واجهة ملزمة. قبول المزود لإرسال لا يثبت قراءة الشخص أو قبوله. عند timeout بعد احتمال حدوث الأثر: reconcile باستخدام provider id قبل retry؛ لا نضمن exactly-once بين أنظمة مستقلة. إلغاء التفويض يوقف ما لم ينفذ، ولا يدّعي إلغاء ما تم بالفعل. حفظ سجل metadata وفق الخصوصية، لا نصوص حساسة في logs.
Untrusted evidence منفصل عن سلطة الأدوات؛ اقتراحات النموذج تتحقق deterministic عند الحدود. قراءة ضمن grants، عزل سياق المستخدمين، منع SSRF، سقوف طلبات وتكاليف/زمن وتوكنات، وحماية من إخراج أسرار عبر responses/embeddings/cache/notifications. لا يتم إرسال أي مراسلة دون التفويض الملائم، ولا test على أطراف حقيقية قبل الإذن.

## 7. اختيارات بعد البحث — baseline موصى به، لا تثبيت
- Rust/serde typed core + PostgreSQL transactional store + TypeScript web؛ Python worker على عقود versioned.
- PostgreSQL lexical + pgvector عند الحاجة وبعد مقارنة lexical-only وhybrid على dataset عربي/إنجليزي. قاعدة واحدة أولًا؛ لا GraphDB أو vector service منفصلة افتراضيًا.
- نصنع طبقة claim/context/evidence/dependency بأنفسنا؛ explicit rule evaluation bounded أولًا. Soufflé/Differential Dataflow مرشحان بعد اختبار حجم وتعقيد.
- نموذج أو أكثر خلف provider-neutral typed adapter؛ اختيار نماذج لاحق بالـevaluation على الحقائق والتكوين، الخصوصية والتكلفة؛ no uncontrolled swarm. worker jobs قابلة للإلغاء وإعادة المحاولة ضمن قواعد.
- CP-SAT أداة جاهزة لمشكلة عددية واضحة عندما توجد قيودها الحقيقية؛ Unified Planning/PDDL اختياري بعد ظهور مسألة تخطيط تتجاوز الجدولة، لا LLM planner وحده.
- نبتكر Composition semantics وscoped commitments وevidence-driven invalidation وexternal action gate. لا نبني solver أو model foundation أو security protocol عام. لا ندعي جدة هذه التركيبات قبل prior-art study وتحقيق مادي.

## 8. Evaluation قبل تثبيت Stack
Build a consented, synthetic/public-grounded bilingual benchmark for actual product requirements. كل fixture يحمل نسخة المصادر وتاريخها وإذن استخدامها والنتيجة المقبولة. بيانات الاختبار ليست فرصًا حقيقية.
- Retrieval recall@k وprecision@k على evidence IDs؛ identity resolution false merges/splits. Arabic/English transliteration, same name, dated/conflicting sources, OCR-noise fixtures حيث يلزم.
- Claim entailment review: صحة موضع المصدر، دعم الادعاء، coverage، unsupported claim rate، contradiction recognition، calibrated abstention; بشر مستقلون يراجعون عينة. ALCE inspiration؛ ليست الأرقام نتائج حالية.
- Composition: هل القيود الصلبة سليمة؟ هل الاقتراح جديد ومفيد بالنسبة للسياق وليس إعادة سرد مصدر؟ هل قابل للخطوة التالية؟ blind human rubric مع أدلة. لا نجعل نسبة الردود التجارية وحدها مقياس جودة أو نرسل رسائل لأجل القياس.
- Change: same revision deterministic outputs for deterministic engine, impacted dependency set, no stale facts on expiry/revoke; replay مقارنة كاملة. Model outputs nondeterministic and versioned as candidates, not rerun during replay.
- Autonomy: two independent actors, revision-bound consent, denied actor, stale approval, refused share, no-action free conversation, duplicate external receipts, uncertain provider timeout.
- Security: adversarial documents in Arabic/English, hidden instructions, poisoned retrieval, cross-tenant and stale permission, egress and logging via synthetic secrets. instrumented tools; zero observed violations target not proof of safety. benign false-positive rate as well.
- Cost: tokens, provider usage, storage, ingest time, p50/p95 retrieval/validation, budget overruns, per-work cost. Separate interactive operations from asynchronous research, define stop conditions. No pricing or measurements claimed until actual run.

## 9. القرار التالي
الجولات الثلاث حددت three areas: state/consent, semantics/expression, grounded composition/actions. الجولة الختامية تجمع مصفوفة قرار Stack واحدة، وأسباب رفض الاختيارات المبكرة، وميزانية هندسية وتكلفة قابلة للقياس، وخريطة تبعيات وCI وإصدارات مرشحة بعد التحقق من المصادر. بعدها نفتح تنفيذ first production foundation، لا نبدأ عشرات تجارب أو شاشات. كل ما سبق اقتراح محفوظ ولم يُنفذ أو يُbenchmarked. 
