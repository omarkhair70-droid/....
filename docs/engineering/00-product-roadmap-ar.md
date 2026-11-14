# خريطة المنتج الواحد — من الفلسفة إلى الإطلاق
15 نوفمبر 2026. checkpoint من head 2f381d2a381ded706c8116a802b7d61ae3a4dfe4، push 43646902465 وPR 43646906735 ناجحان، Draft PR #1 مفتوح. لا نسبة اكتمال مختلقة. هذه خريطة تتبع وليست بديلًا عن الوثائق المؤسسة ولا اعتمادًا جديدًا للتصميم. تحديثها بعد كل slice مع دليل الاختبار والحدود. لا نعتبر code written أو CI pass أو research proposal مساويًا لاكتمال المحرك أو جاهزية الإنتاج.

## المصادر المرجعية بالترتيب
- ../FOUNDATION.md و../FOUNDING-CONVERSATION-AR.md: المبادئ المتفق عليها وسببها وما رُفض.
- ../design/01-birth.md: الميلاد؛ مقترح التجربة الأولى، لا UI معتمدة.
- ../design/02-the-work-that-did-not-exist-ar.md: العمل الذي لم يوجد، والسرد والتفاعل المباشر.
- ../design/03-the-world-contains-people-ar.md: الاستقلال والتواصل الحر، قبل العمل وبعده.
- ../design/04-inventing-the-means-ar.md: الهندسة كأداة للصناعة.
- ../design/05-one-world-production-architecture-ar.md: Continuous Surface، مقترح الألوان والخط والتكوين والقواعد الرياضية والمحركات.
- ../research/02-computational-synthesis-ar.md، 03-world-language-and-expression-ar.md، 04-grounded-intelligence-and-autonomy-ar.md، 05-stack-and-production-decision-ar.md: الأبحاث واختيارات baseline وبوابات G0–G6. لا ادعاء لجدّة عالمية أو bench كاملة.
- 01–08 داخل هذا المجلد: سجل التنفيذ الفعلي، لا بديل عن المصادر أعلاه.

## الحالة وما ينقص
| العنصر | الموجود عند checkpoint | الباقي قبل الاكتمال |
|---|---|---|
| فلسفة المنتج | مبادئ متفق عليها | تحقق بشري من فهم المنتج، الحفاظ على المبادئ عند اتخاذ القرارات |
| G0 reproducibility | Rust workspace، Cargo.lock، CI pinned checkout، schema fixtures | مراجعة تراخيص وثغرات وسلسلة توريد، تثبيت تبعيات Python validation |
| G1 World Language / Kernel | 5 commands، parsing، scope، identity/revision، replay، retries، scoped reply | باقي معاني المعرفة والتكوين والقرارات والإرادة والالتزامات والنتائج كأحداث دائمة، تطور schemas، invariant/security verification |
| G2 Memory / Access | PostgreSQL 18.7 isolated integration، atomic append، revocation، explicit projections، verifier port | هوية حقيقية وربط الأفراد والشركات، عضوية وصلاحيات، tenant safety/RLS وفق threat model، retention/deletion/export، TLS، backup and restore/crash/restart، transport، scalability، production operations |
| G4 Composition | four knowledge states، incremental direct dependency، bounded formation from capabilities/time/place، 12 tests | durable candidates and source versions، real-world constraints/resource capacity and planning، grounding/retrieval/identity، meaningful novelty and human evaluation، benchmarks and cost limits |
| G4 Knowledge | بدأت 03c في هذه الدفعة: exact source span and review-based admission | التخزين، provenance authenticity، real source acquisition and verification، grants/revocation، claim extraction, entity resolution، review experience، bilingual benchmark |
| G4 Intelligence | عقود بحثية فقط | provider-neutral worker، structured proposals untrusted، budget/cancel/evaluation، prompt injection/egress defenses، source checks، no autonomous action |
| G3 Expression + Human Experience | design 01/05 + research 03 فقط، لا web application | approved art direction، semantic Expression IR، actions, focus and continuity، layout/runtime، first scene ثم grow in place، RTL/LTR, keyboard, zoom, reduced motion, responsive، user testing |
| G5 Shared Aperture / people | snapshot share + interested/decline/request-change + revoke، scoped receipt؛ لا أعضاء حقيقيون | هوية وأدوار حقيقية، مشاركة متعددة/تعديل جزئي، تواصل عادي independent of AI or work، notifications/delivery, shared work and commitments، action consent and outcomes |
| G6 product release | لا نشر، لا app متصل | end-to-end actual workflow، usability، security، cost, observability, restore, performance, accessibility، approved release |

## التصميم ليس آخر خطوة
نستمر في تصميم التجربة بالتوازي مع الهندسة ولا نبرمج الشكل قبل مواصفة إنتاج واحدة مراجعة. المتفق عليه: عالم متصل لا feed/dashboard/chatbot أو تجارب بديلة؛ الإنسان يتعامل مع العمل نفسه؛ لا إعادة توليد لهويته عند كل فعل؛ لا حركة أو صوت ضروريان للفهم؛ لا تكليف الذكاء بتمثيل إرادة الطرف الآخر. 
المقترح غير المعتمد في 01/05: first seed + same surface، السؤال «بتشتغل على إيه؟»، Continuous Surface، اتجاه طباعي معماري، warm white #F6F5F0، ink #19201F، green #285A4B، IBM Plex Sans Arabic كمرشح، 160–300ms انتقال دلالي. لا نعامل هذه القيم كنهائية. نحتاج مواصفة art direction تشمل أول لحظة، بدء بلا حساب/lookup إن أمكن وفق السياسة، عودة، ظهور أول علاقة grounded، تعديل شرط وتغير أثره، مشاركة ومعاينة ورد/رفض، انتقال التركيز لعمل أو شخص أو مستند، حوار مستقل، خروج/استعادة السياق، حالات نقص الدليل والأخطاء، الكتابة العربية/الإنجليزية والإتاحة. حدد المقياس والهرمية والتباعد والخط واللون والمواد والحركة والصمت وكيف يعمل كل فعل، ثم مراجعة المؤسس قبل بناء الواجهة نفسها. لا HTML أو prototypes منفصلة.

## مسار العمل
A. إتمام المعرفة والربط الدائم للمحركات والنطاق؛ هوية حقيقية وtransport آمن قبل أي live access، آليات استرجاع وتقييد وقياس.
B. وثيقة إخراج فني/تفاعل كاملة للجزء الأول الفعلي (بالتوازي مع A؛ review before front-end code)، ثم Expression IR + runtime واختبار رحلات المعنى الفعلية؛ التقنيات تخدم التفاعل وليست بصريات مفروضة.
C. ذكاء قائم على الواقع + تقييم تكوينات حقيقية مأذون بها؛ لا تكاليف أو اتصال مزود دون اختيار وتحديد ميزانية.
D. توسيع الحياة البشرية: لقاء، تواصل حر، تأليف مشترك، اختلاف الرأي، إرادة وموافقة محددة ونتائج فعلية مع حدودها. 
E. ربط العالم كاملًا واختبار المشهد من أول دخول حتى العودة وقرار وتأثير حقيقي؛ G0–G6 review evidence، ثم staging/production بإذن. هذه dependency plan لا مواعيد أو نسب ولا بديل عن ترتيب G3/G4 المتداخل في وثيقة 05. لا تطبيقات منفصلة. الاسم النهائي والشكل النهائي غير محسومين في هذه الوثائق.

## Checkpoint 03d
النسخة `b22ced59756bedcf07ed5e9d45621080d2a0cf1c` نجحت في push/PR (43647305366 و43647309976). أُضيف عقد أرشيف تاريخي في Rust وربط مع PostgreSQL للمعرفة والتكوين والهوية الدلالية للمرشح، مع مراجعة الصلاحيات من boundary موثوق وارتباط بإصدار العمل. التنفيذ الجديد يحتاج CI. لا مصدر خارجي أو مزود AI ولا هوية حقيقية بعد. لا تغير للمواصفة البصرية. راجع 09-research-memory.md للحدود؛ تنفيذ الأرشيف لا يساوي اكتمال G1/G2/G4.

## Checkpoint 03e
النسخة `06bc5cda237857eadf7cefcae084d3b9aa21c80c` اجتازت push/PR (43647958723 و43647962594) مع تخزين واستعادة أرشيف البحث. أضيف الآن baseline بحث نصي محلي عربي/إنجليزي وإسناد دقيق للمقاطع، وفرضيات هوية لا تدمج الكيانات تلقائيًا. لا استرجاع خارجي حي ولا AI ولا اعتماد هوية أو حقيقة. الاختبارات الجديدة تحتاج CI. راجع 10-source-retrieval.md. التصميم والتفاعل لا يزالان بوابة مستقلة، ونسخة الأرشيف ليست بديلًا عن أحداث المعرفة الدائمة أو سياسة الخصوصية.

## Checkpoint 03f
النسخة `bfb9c0c812c6ee1f31c0e924d173e761f453c174` اجتازت الأربع فحوص في push 43648320058. أضيف مسار استيراد نص UTF-8 مأذون، وعقد اقتراحات استخراج غير موثوق مع حدود وإعادة تحقق عند الطلب والنتيجة وربط بمقطع موجود فعلاً. الاختبارات الجديدة تحتاج CI. لا اتصال حي أو إرسال إلى مزود AI أو ميزانية مدفوعة؛ التوثيق في 11-ingestion-and-extraction.md. التصميم لم يتغير ولم يُعتمد نهائيًا.

## Checkpoint 04a — التعبير والإخراج
النسخة `02b87dc0db6fd1bc23ce0d84b92cbe4aa9fed3c1` اجتازت push وPR بالكامل (43648499332، 43648504109). بدأ أول Expression IR فعلي من الإسقاطات المأذونة للمالك والطرف المشارك؛ لا renderer ولا واجهة بعد. أضيف اتجاه إخراج واحد مفصل للميلاد والاستمرار في ../design/06-born-and-continuing-ar.md، مقترح للمراجعة لا اعتماد، دون توريث تصميم قديم. يمتد مسار المعرفة والذكاء دون اتصال خارجي أو مزود مدفوع. راجع 12-expression-foundation.md؛ CI الجديد منتظر.

## Checkpoint D01 — فصل التصميم والهندسة
بناء على توجيه المؤسس 15 نوفمبر 2026: التصميم الكامل وسلوك العالم والإخراج الفني مسار مستقل في قراراته عن الهندسة، داخل نفس المنتج ونفس الفرع. أضيفت مواصفة إخراج واحدة محددة في ../design/07-art-direction-d01-ar.md (الميلاد، العمل، المعرفة، التكوين، التعديل، الشخص، التواصل الحر، الإفصاح، الرد، الفعل والعودة مع حالاتها المقاومة). القيم والنصوص والاسم الداخلي D01 مقترحة وليست اعتمادًا ولا واجهة مرئية؛ نراجعها قبل بناء الشكل. لا تغييرات برمجية في هذه الدفعة. Head السابق `843b0e809e1f865bda0edf5d4f9ac6a82082b4d3` CI push 43648694314: kernel/schema/postgres success، formatting failure. يحتاج إصلاح التنسيق والتحقق في المسار الهندسي، لا نعتبر أحدث كود مكتملًا ولا نخلط هذا مع قرار الشكل. لا نشر أو دمج.

## Checkpoint D01a — أول سطح مرئي
بناءً على توجيه الانطلاق، بدأ التنفيذ الفعلي في apps/world-web على نفس الفرع: كتابة محلية، تعديل، تصور بشري ينتج عملًا مرتبطًا بالأصل، استحضار متعدد، معاينة جزئية فقط، حفظ اختياري واستعادة محلية، RTL/LTR. Native DOM/CSS/JS دون تبعيات جديدة أو اتصال خارجي؛ قرار ضيق لا يلغي مرشح React/TS عند الربط. لا بيانات مثال تظهر كواقع، ولا بحث حي أو إرسال أو تسجيل دخول أو ربط النواة بعد. الدلالة الحالية محلية وليست سجلًا canonical؛ لا نعتبر G3/G5 مكتملين. اختبار متصفح آلي جديد يحتاج CI، والمراجعة البصرية الفعلية ما زالت مطلوبة. لا نشر أو دمج. 

## Checkpoint D01a — تحقق المتصفح
نجح اختبار الرحلة المحلية الفعلي في push 43649464846 وPR 43649469906 عند commit 701bb141ebd84df9edc2e4c29c7d112043ad528d. أُصلح التنسيق الهندسي السابق في f94b7044e650f8a181602b815b44ecfa93b1a12e بتطبيق فرقَي rustfmt. أضيف التقاط صور من المتصفح الفعلي (بداية خالية + عمل ببيانات اختبار اصطناعية فقط) لمراجعة الشكل، لا صور مولّدة. نتائج capture الجديدة لم تظهر بعد. لا ربط إنتاجي أو نشر.

## تصحيح 15 نوفمبر — البحث لا ينتهي عند بدء البرمجة
المؤسس رفض اختزال ONE WORLD إلى موقع أو شاشة افتتاحية. D01a local browser slice ليس تصميمًا معتمدًا للعالم، ولا يُبنى عليه شكل بقية التجربة تلقائيًا. راجع ../design/08-world-not-a-website-ar.md؛ سجل البحث والأسئلة والتكوينات مفتوح، والعلوم والفن أدوات فعالة للصناعة لا شعارات. نحافظ على التنفيذ السابق كتاريخ وأساس قابل للمراجعة، دون حذف أو نشر أو قرار شكل جديد في هذه الجولة.
