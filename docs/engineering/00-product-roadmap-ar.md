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
