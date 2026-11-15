'use strict';
import {composePresence,expressionState} from './presence-law.mjs';
import {attachLivingMaterial,inkPeaks} from './living-material.mjs';
import {createVoiceCapture} from './voice-capture.mjs';
import {createLocalDictation} from './local-dictation.mjs';
import {createVoiceSurface} from './voice-surface.mjs';
import {captureFragment,validOrigin,formWork} from './formation.mjs';
import {VAULT_KEY,MAX_PACKET_BYTES,makeIdea,makeReply,parsePacket,serializePacket,parseVault,matchReply} from './encounter.mjs';
import {MAX_MARKS,emptyMind,validMind,makeMark,activeMark,correspondences,dismiss,validBasis,captureBasis,rememberedMentions,validFieldBasis,composeFieldWork,validReality,meetReality} from './living-intelligence.mjs';
const $=id=>document.getElementById(id), KEY='one-world.local.v1';
const text={
 ar:{mode:'معاينة محلية',locale:'English',private:'هنا، لك',name:'اسم العمل',thought:'اكتب…',mic:'اتكلم',stop:'أنهِ التسجيل',requesting:'بانتظار إذن الميكروفون',cancelMic:'إلغاء الطلب',stopping:'لحظة، بنحتفظ بالتسجيل هنا',voiceLimit:'التسجيل تجاوز الحد المسموح. التسجيل السابق كما هو.',recording:'تسجيل محلي',ready:'التسجيل هنا على جهازك',noMic:'التسجيل غير متاح أو لم يُسمح به. تقدر تكتب.',clear:'امسح التسجيل',prepare:'ارمِ فكرة',resume:'استحضر اللقاء',save:'احتفظ هنا',recall:'استحضر',privateNote:'تقدر تكتب، أو تتكلم، أو تفضل ساكت.',prior:'تصوّر سابق',foot:'عالم قيد التشكّل · الكتابة والتسجيل على جهازك فقط',prepareLabel:'الفكرة قبل أن تغادر',recipientLabel:'إلى من؟',recipientHint:'شخص أو شركة',mask:'بدون إظهار اسمي',person:'الاسم الذي سيظهر',anonymous:'إنسان بلا اسم معلن',origin:'منك',object:'فكرة · من كتابتك',grip:'اسحب الفكرة نحو وجهتها',cast:'ارمها في المعاينة',target:'الوجهة',previewNote:'المستلم اسم تختاره للمعاينة فقط. النص الظاهر هو ما سيصل في التجربة؛ لا إرسال حقيقي ولا نقل للصوت.',receive:'منظور الطرف الآخر · أنت تؤدي الدور',returned:'رجعت لك الفكرة',meet:'المساحة بينكما · دورين محليين',cancel:'ارجع لمساحتك',exit:'أنه المعاينة',exchangeNote:'اختبار محلي بين دورين على نفس الجهاز، بلا أشخاص متصلين.',reply:'إيه اللي تحب تضيفه؟',replyOnly:'أعد الفكرة',replyMeet:'أعدها واقترح لقاءً',decline:'لا أريد المتابعة',declined:'اختار الطرف الآخر عدم المتابعة في المعاينة.',answer:'إضافة من الطرف الآخر في المعاينة',accept:'اقبل اللقاء',back:'استمر بمفردك',common:'ما الذي يمكن أن نصنعه معًا؟',commonHint:'اكتب ما أصبح ممكنًا بعد اللقاء…',keep:'احتفظ بالعمل الجديد هنا',leave:'ارجع لمساحتك',meetingNote:'النصان الأصليان باقيان. ما تكتبه هنا تأليف مشترك في المعاينة، وليس اتفاقًا.',memory:'استحضر شيئًا',close:'إغلاق',find:'ابحث في أعمالك المحلية',new:'مساحة لفكرة أخرى',forget:'امسح النسخ المحفوظة',memoryNote:'التخزين محلي، ليس حسابًا. اللقاءات والتسجيلات مؤقتة حتى تحفظ نص عملك.',empty:'لا توجد أعمال.',untitled:'فكرة بلا اسم',saved:'حُفظ النص على هذا الجهاز فقط.',failed:'تعذر الحفظ؛ النص لا يزال هنا.',need:'اكتب فكرة وحدد وجهة واسمًا ظاهرًا إن اخترته.',emptyThought:'اكتب شيئًا أولًا. التسجيل لا يتحول إلى نص تلقائيًا.',replyNeed:'اكتب إضافتك أولًا، أو اختر عدم المتابعة.',commonNeed:'اكتب ما تريد أن يصبح عملًا.',limit:'وصلت لحد الأعمال المحلية.',confirmForget:'امسح النسخ المحفوظة في هذا المتصفح؟',forgot:'أزيلت النسخ المحفوظة. ما في الذاكرة الحالية لا يزال هنا.',confirmEnd:'إنهاء هذه المعاينة؟ سيبقى عملك الأصلي.',confirmClip:'التسجيل محلي ومؤقت. امسحه قبل الانتقال إلى عمل آخر؟',localOnly:'لم يحدث إرسال حقيقي.',newMade:'نشأ عمل محلي جديد؛ الأصل محفوظ في الذاكرة.',mark:'معاينة لا إرسال',from:'من',to:'إلى',jointA:'الفكرة الأصلية',jointB:'إضافة الطرف الثاني',jointC:'العمل المتكوّن'},
 en:{mode:'Local review',locale:'العربية',private:'Here, for you',name:'Work name',thought:'Write…',mic:'Speak',stop:'Finish recording',requesting:'Waiting for microphone access',cancelMic:'Cancel request',stopping:'Finishing your recording',voiceLimit:'Recording exceeded the limit. Your previous recording is unchanged.',recording:'Local recording',ready:'Your recording stays on your device',noMic:'Recording is unavailable or permission was denied. You can write.',clear:'Remove recording',prepare:'Cast an idea',resume:'Recall the encounter',save:'Keep here',recall:'Recall',privateNote:'Write, speak, or simply stay.',prior:'Earlier possibility',foot:'A world taking form · writing and recording stay on your device',prepareLabel:'Before the idea leaves',recipientLabel:'To whom?',recipientHint:'A person or company',mask:'Without displaying my name',person:'Name to display',anonymous:'A person without a displayed name',origin:'From you',object:'An idea · your words',grip:'Pull the idea toward its destination',cast:'Cast in review',target:'Destination',previewNote:'A destination chosen for local review only. The visible text is what the other role sees; no real delivery or audio transfer.',receive:'Recipient perspective · you play this role',returned:'The idea has returned',meet:'The space between you · two local roles',cancel:'Return to your space',exit:'End review',exchangeNote:'Two roles on the same device, without connected people.',reply:'What would you add?',replyOnly:'Return the idea',replyMeet:'Return and propose a meeting',decline:'Do not continue',declined:'The other role chose not to continue in this review.',answer:'Contribution from the other role',accept:'Accept the meeting',back:'Continue alone',common:'What could you make together?',commonHint:'Write what became possible after the encounter…',keep:'Keep the new work here',leave:'Return to your space',meetingNote:'Both original contributions remain. This is local coauthoring, not an agreement.',memory:'Recall something',close:'Close',find:'Search local work',new:'Space for another idea',forget:'Remove saved copies',memoryNote:'Local storage is not an account. Encounters and recordings are temporary unless you keep the written work.',empty:'No works yet.',untitled:'Untitled thought',saved:'Text saved on this device only.',failed:'Could not save; your text is still here.',need:'Enter an idea, a destination, and a displayed name if chosen.',emptyThought:'Write something first. Recording does not create a transcript automatically.',replyNeed:'Write a contribution first, or choose not to continue.',commonNeed:'Write what should become a work.',limit:'Local work limit reached.',confirmForget:'Remove saved copies from this browser?',forgot:'Saved copies removed. In-memory writing is still here.',confirmEnd:'End this review? Your original work will remain.',confirmClip:'Recording is temporary and local. Clear it before changing work?',localOnly:'Nothing was actually sent.',newMade:'A new local work exists; the original stays in memory.',mark:'Review, not delivery',from:'From',to:'To',jointA:'Original idea',jointB:'Other contribution',jointC:'Emerging work'}
};
let lang='ar',works=[],active=null,phase='private',offer=null;
const automaticTitles=new Set();
let forming=null,minding=null,mindOpen=false,possibilityDraft=null;
const quietMentions=new Map();
let fieldOpen=false,fieldExamples=false,fieldItems=[],exchangeVoiceURL='',exchangeVoiceBlob=null;
let fieldSelected=[],intersectionEditing=false,intersectionDraft='',intersectionQuestion='';
const possibilityWords={
 ar:{signal:'في شيء قد يتصل بما تفكر فيه',memory:'معانٍ تركتها هنا',hint:'اقترب لو تحب',close:'ابتعد',explore:'شكّل ما يمكن حدوثه',prompt:'ماذا يمكن أن تصنع من هذه الصلة؟',keep:'اجعلها عملًا مستقلاً',cancel:'اتركها الآن',basis:'من أين بدأت الإمكانية؟',basisNote:'المقطعان كما كانا حين اخترت تكوين هذه الفكرة، لا دليل على صلاحية العلاقة اليوم.',source:'استحضر المصدر',missing:'المصدر غير موجود هنا',created:'تكوّن عمل خاص جديد من اقتراحك. لا حفظ تلقائي.',discard:'اترك الإمكانية التي لم تحتفظ بها؟'},
 en:{signal:'Something may connect to your thinking',memory:'Meaning you left here',hint:'Come closer if you wish',close:'Move away',explore:'Shape what might happen',prompt:'What could you make from this connection?',keep:'Make it a separate work',cancel:'Leave it for now',basis:'Where this possibility began',basisNote:'The passages as they were when you formed this idea, not evidence that the connection holds today.',source:'Recall source',missing:'Source not available here',created:'A new private work came from your proposal. Nothing saved automatically.',discard:'Leave the possibility you have not kept?'}
};
const pt=k=>possibilityWords[lang][k];
const mindWords={
 ar:{mark:'اترك معنىً للعالم',title:'ما يمكن أن يتصل',note:'يربط العالم بين احتياج وقدرة علّمتهما أنت في عملين مختلفين، على هذا الجهاز فقط. العلاقة فرضية وليست إثباتًا أو اقتراحًا من الإنترنت.',need:'احتياج',ability:'قدرة مقترحة',topic:'موضوع مشترك (كلمة أو عبارة قصيرة)',keep:'اسمح بهذه الصلة',cancel:'ارجع',remove:'اسحب المعنى',stale:'النص تغير؛ المعنى متوقف حتى تعيد اختياره.',related:'إمكانية تستحق النظر',open:'استحضر العمل الآخر',reject:'هذه الصلة غير مناسبة',limit:'هناك صلات أخرى لم تُعرض ضمن الحد الحالي.',invalid:'اختر مقطعًا واضحًا لا يزيد على ١٢٠٠ حرف وأضف موضوعًا قصيرًا.',full:'بلغت هذه المساحة حد المعاني أو الاعتراضات.',changed:'تغير النص؛ اختر المقطع مرة أخرى.',saved:'أُضيف المعنى إلى هذا العمل. يُحفظ فقط عندما تختار حفظ عملك.',dismissed:'لم تعد هذه الصلة تظهر بين العملين.',challenge:'اترك المعنى غير المكتمل؟'},
 en:{mark:'Leave meaning for the world',title:'What might connect',note:'The world connects a need and a capability you marked in different works, on this device only. A connection is a hypothesis, not proof or an internet suggestion.',need:'Need',ability:'Proposed capability',topic:'Shared subject (a short phrase)',keep:'Allow this connection',cancel:'Return',remove:'Withdraw meaning',stale:'The text changed; this meaning is inactive until marked again.',related:'A possibility worth considering',open:'Recall the other work',reject:'This connection is not relevant',limit:'More connections exist beyond the display limit.',invalid:'Choose a clear passage of up to 1,200 characters and a short subject.',full:'This work reached the meaning or challenge limit.',changed:'The text changed; select the passage again.',saved:'Meaning added to this work. It is retained only when you explicitly save your work.',dismissed:'This connection no longer appears between the two works.',challenge:'Leave the unfinished meaning?'}
};
const mt=k=>mindWords[lang][k];
const sensoryWords={
 ar:{kicker:'مساحة للحضور',arrival:'لا تحتاج أن تعرف إلى أين سيأخذك التفكير.',write:'ابدأ من أي مكان…',speak:'دع صوتك يبدأ',idle:'تقدر تتكلم من غير ما ترتّب كلامك.',requesting:'الميكروفون ينتظر إذنك.',recording:'خذ وقتك. صوتك هو المادة الآن.',stopping:'ينتهي الصوت، ويبقى أثره.',ready:'تقدر تضيف صوتًا جديدًا باختيارك.',trace:'أثر صوتك',traceNote:'استمع إليه أو امسحه. يظل مؤقتًا على جهازك.',gesture:'إلى أين يمكن أن يأخذك هذا التفكير؟',form:'شكّل فكرة',formNote:'افصل منها شيئًا يستحق أن يعيش.',mind:'اكتشف صلة',mindNote:'انظر إلى ما قد يتصل بها.',cast:'وجّهها إلى إنسان',castNote:'اختر ما يغادر مساحتك.'},
 en:{kicker:'A space for presence',arrival:'You need not know where your thinking will take you.',write:'Begin anywhere…',speak:'Let your voice begin',idle:'Speak without arranging your thoughts.',requesting:'The microphone is waiting for your permission.',recording:'Take your time. Your voice is the material now.',stopping:'The sound ends; its trace remains.',ready:'Begin another recording if you choose.',trace:'The trace of your voice',traceNote:'Listen or remove it. It remains temporary on this device.',gesture:'Where might this thinking take you?',form:'Shape a thought',formNote:'Give one part a life of its own.',mind:'Discover a connection',mindNote:'See what might connect to it.',cast:'Reach toward someone',castNote:'Choose what leaves your space.'}
};
const st=k=>sensoryWords[lang][k];
const connectionWords={
 ar:{mark:'اكتشف صلة',title:'من فكرة إلى إمكانية',source:'من كلامك',choice:'ما الذي تتحدث عنه؟',need:'شيء أحتاجه',ability:'شيء أستطيع تقديمه',needExample:'مثال: مصنع يحتاج نظامًا',abilityExample:'مثال: فريق يستطيع تطوير نظام',subject:'ما الموضوع المشترك؟',subjectHint:'مثال: إدارة المخزون',otherNeed:'هل تعرف قدرة قد تلبي هذا الاحتياج؟',otherAbility:'هل تعرف احتياجًا يناسب هذه القدرة؟',otherHint:'اكتب ما تعرفه فعلًا، أو اتركه فارغًا.',otherNote:'اختياري. إذا كتبت الطرف الثاني، يصبح عملًا مستقلًا خاصًا بك. لا نختلق أشخاصًا أو نرسل شيئًا.',choose:'اختر احتياجًا أو قدرة أولًا.',enter:'اكتب الموضوع لتجربة الربط.',waiting:'سنحتفظ بالمعنى ونبحث عن مقابل في أعمالك المعلّمة.',ready:'سنكوّن علاقة من المادتين اللتين كتبتهما.',keep:'احتفظ بالمعنى',connect:'أظهر الصلة',none:'لم نجد طرفًا مقابلًا في أعمالك المعلّمة. يمكنك إضافة معنى مقابل باستخدام الموضوع نفسه، أو كتابة الطرف الثاني مباشرة.',created:'اتصلت المادتان. دي فرضية من كلامك، مش فرصة مثبتة.',existing:'يحتفظ العالم بالمعنى الذي سمحت به. لا بحث خارجي هنا.'},
 en:{mark:'Discover a connection',title:'From a thought to a possibility',source:'From your words',choice:'What are you describing?',need:'Something needed',ability:'Something I can offer',needExample:'Example: a factory needs a system',abilityExample:'Example: a team can build a system',subject:'What is the shared subject?',subjectHint:'Example: inventory management',otherNeed:'Do you know a capability that might meet this need?',otherAbility:'Do you know a need that might fit this capability?',otherHint:'Write what you actually know, or leave this blank.',otherNote:'Optional. If written, the counterpart becomes a separate private work. No invented people or sending.',choose:'Choose a need or capability first.',enter:'Enter a subject to try the connection.',waiting:'We will retain the meaning and look for a counterpart in your marked works.',ready:'We will form a relationship from the two passages you authored.',keep:'Keep the meaning',connect:'Reveal the connection',none:'No counterpart in your marked works. Add an opposite meaning with the same subject, or write the counterpart directly.',created:'The two passages connect. This is a hypothesis from your words, not a verified opportunity.',existing:'The world retains meaning you allowed. No external search here.'}
};
const ct=k=>connectionWords[lang][k];
const formationWords={
 ar:{form:'شكّل فكرة',title:'شيء بدأ يتكوّن',source:'من كلامك الأصلي',draft:'ما تريد أن تصبح عليه هذه الفكرة',keep:'احتفظ بها كفكرة مستقلة',cancel:'ارجع',note:'الأصل كما هو. الفكرة الجديدة خاصة بك وغير مرسلة. الحفظ على جهازك يتم باختيارك.',lineage:'ما اتصل بهذا العمل',back:'ارجع إلى الأصل',excerpt:'الجزء الذي بدأت منه',child:'واصل في هذه الفكرة',missing:'الأصل غير متاح هنا',empty:'اختر كلامًا أو اكتب شيئًا أولًا.',discard:'اترك صياغة الفكرة التي لم تحتفظ بها؟',created:'تكوّنت فكرة مستقلة. يمكنك مواصلتها أو البقاء هنا.'},
 en:{form:'Shape a thought',title:'Something takes form',source:'From your original words',draft:'What this idea could become',keep:'Keep as a separate idea',cancel:'Return',note:'The original is unchanged. The new idea is private and unsent. Saving on this device is your choice.',lineage:'Connected to this work',back:'Return to the source',excerpt:'The passage it came from',child:'Continue this idea',missing:'Source unavailable here',empty:'Select words or write something first.',discard:'Leave this unfinished formation?',created:'A separate idea exists. Continue it or stay here.'}
};
const ft=k=>formationWords[lang][k];
const encounterWords={
 ar:{open:'استقبل فكرة',export:'أخرج الفكرة كملف',exportNote:'يحوي الملف النص الظاهر والوجهة واسم العرض إن اخترته. غير مشفّر؛ تشاركه بنفسك. نحفظ نسخة النص ومفتاح مطابقة الرد على هذا الجهاز عند إخراجه.',invalid:'الملف غير صالح أو أكبر من الحد.',unmatched:'هذا الرد لا يطابق فكرة أخرجتها من هذا المتصفح.',limit:'تعذر حفظ مرجع الرجوع؛ لم نطلب تنزيل الملف. احفظ نسخك ثم امسح المحفوظات إذا امتلأت.',out:'جهّزنا الملف للتنزيل. لم يصل لأحد بعد.',replyOut:'جهّزنا الرد للتنزيل. شاركه مع صاحب الفكرة بنفسك.',incoming:'فكرة وصلت في ملف',returned:'عاد إليك أثر الفكرة',mark:'نقل بالملف · الهوية غير موثقة',incomingNote:'أنت تقرأ ملفًا اختار صاحبه مشاركته. الاسم والوجهة غير موثقين. ردك يُنزّل كملف؛ لا إرسال أو لقاء حي.',returnedNote:'الرد يطابق مرجع الفكرة على هذا الجهاز. هذا لا يثبت هوية كاتب الرد.',proposal:'الرد يتضمن اقتراح لقاء. لا يوجد لقاء مباشر هنا بعد.',response:'إضافة في الملف الوارد',declined:'الملف الوارد يذكر عدم الرغبة في المتابعة.',replyOnly:'أخرج الرد',replyMeet:'أخرج الرد واقترح لقاءً',decline:'أخرج رفض المتابعة',keep:'احتفظ بالمساهمتين',leave:'ارجع لمساحتك',long:'المقطع أطول من ٦٠٠٠ حرفًا. حدّد جزءًا أقصر بنفسك.',replace:'اترك اللقاء أو التكوين الحالي وافتح هذا الملف؟',keepLimit:'المساهمتان أطول من مساحة عمل واحدة. لم يُحذف منهما شيء.',kept:'أصبحت المساهمتان عملًا خاصًا عندك. لا اتفاق ولا حفظ تلقائي.',review:'هذا انتقال للأثر عبر ملف، وليس اتصالًا حيًا.',vault:'يتضمن المسح مراجع الأفكار الخارجة المحفوظة محليًا. الملفات خارج المتصفح لا تتأثر.'},
 en:{open:'Receive an idea',export:'Release the idea as a file',exportNote:'The file contains the visible text, destination and chosen display name. It is not encrypted; you share it yourself. Releasing keeps a copy of the exposed text and a reply-matching key on this device.',invalid:'The file is invalid or exceeds the size limit.',unmatched:'This reply does not match an idea released from this browser.',limit:'Could not retain the return reference; no download was requested. Keep any copies before clearing storage if full.',out:'The file was prepared for download. It has not reached anyone yet.',replyOut:'The reply was prepared for download. Share it with the author yourself.',incoming:'An idea arrived in a file',returned:'The trace of an idea returned',mark:'File handoff · identity unverified',incomingNote:'You are reading a file someone chose to share. The name and destination are not verified. Your reply is downloaded as a file; no live delivery or meeting.',returnedNote:'The reply matches a reference on this device. This does not verify who wrote it.',proposal:'The reply proposes a meeting. No live meeting exists here yet.',response:'Contribution in the incoming file',declined:'The incoming file indicates a decision not to continue.',replyOnly:'Release reply',replyMeet:'Release reply and propose a meeting',decline:'Release a decline',keep:'Keep both contributions',leave:'Return to your space',long:'The passage exceeds 6,000 characters. Choose a shorter passage yourself.',replace:'Leave the current encounter or formation and open this file?',keepLimit:'Both contributions exceed one work’s capacity. Nothing has been removed.',kept:'Both contributions are now a private work. No agreement or automatic saving.',review:'A trace carried by a file, not a live connection.',vault:'Clearing includes locally stored return references. Files outside the browser are not affected.'}
};
const et=k=>encounterWords[lang][k];
function vault(){return parseVault(localStorage.getItem(VAULT_KEY))}
function hasVault(){try{return vault().length>0}catch{return false}}
function es(k){$('status').textContent=et(k)}
const t=k=>text[lang][k], put=(id,k)=>{$(id).textContent=t(k)}, status=k=>{$('status').textContent=k?t(k):''}, current=()=>works.find(w=>w.id===active);
const str=(v,n)=>typeof v==='string'&&v.length<=n;
// A birth is an immutable historical snapshot, not a contract or identity claim.
const validBirth=b=>!!b&&Object.keys(b).length===5&&['local-review','local-voice-review','file-reply'].includes(b.kind)&&str(b.first,6000)&&(b.kind==='local-voice-review'||!!b.first.trim())&&str(b.second,6000)&&!!b.second.trim()&&str(b.emergence,6000)&&(b.kind==='file-reply'?b.emergence==='':!!b.emergence.trim())&&str(b.id,80)&&!!b.id;
const birthOf=(kind,offer,emergence='')=>({kind,first:offer.exposed,second:offer.reply,emergence,id:offer.id});
const lifeWords={
 ar:{invitation:'ده عمل بدأ من لقاء. تقدر تغيّره من غير ما تمس الكلمات اللي ولد منها.',title:'من أين بدأ هذا الشيء؟',local:'أثر محفوظ من دورين في معاينة محلية، وليس اتفاقًا أو إثبات هوية.',file:'أثر تبادل بالملف، وليس لقاءً حيًا أو إثبات هوية.',first:'الكلمات التي غادرت',second:'الكلمات التي عادت',emergence:'ما تكوّن في تلك اللحظة',parent:'استحضر العمل الأول',missing:'العمل الأول غير موجود هنا',child:'عمل وُلد من لقاء',voice:'حوّل ما قلته إلى فكرة',voiceNote:'استمع واكتب خلاصتك، أو راجع النص المحلي إن كان متاحًا. لن نحوّل صوتك أو نرسله تلقائيًا.'},
 en:{invitation:'This work began in an encounter. Change it without changing the words that gave rise to it.',title:'Where did this begin?',local:'A retained trace of two roles in a local review, not an agreement or verified identity.',file:'A retained file exchange, not a live meeting or verified identity.',first:'The words that left',second:'The words that returned',emergence:'What emerged in that moment',parent:'Recall the original work',missing:'The original work is not here',child:'Work born in an encounter',voice:'Turn what you said into an idea',voiceNote:'Listen and write your own summary, or review local text if available. We will not automatically transcribe or send your voice.'}
};const lt=k=>lifeWords[lang][k];
const fieldWords={
 ar:{open:'العالم الآخر',close:'ارجع للتفكير',kicker:'المجال المشترك',title:'الإنسان يُعرف بما يفكر فيه',note:'معاينة محلية فقط. ما تختار إظهاره هنا يظل في هذه الصفحة؛ لا أشخاص متصلون ولا نشر عبر الإنترنت. لا أحد يرى أفكارك الخاصة.',samples:'عِش سيناريوهات العالم',sampleNote:'مادة تخيّلية · أدوار للمعاينة',ownNote:'مادة أظهرتها في المعاينة',empty:'المجال ينتظر ما تختار أن تتركه فيه.',approach:'اقترب من الفكرة',remove:'اسحب من المعاينة',anonymous:'إنسان بلا اسم معلن',world:'المجال المشترك',release:'اتركها في العالم · معاينة',releaseNote:'لا تحتاج لاختيار مستلم. تظهر المادة التي حددتها فقط في المجال المحلي؛ التسجيل إن اخترته يبقى مؤقتًا حتى تسحب المادة أو تغلق الصفحة، حتى لو مسحت التسجيل الأصلي. لا نشر فعلي.',released:'أصبحت المادة مرئية في المجال المحلي، ولم تُرسل إلى أحد.',full:'امتلأ المجال المحلي. اسحب مادة أولًا.',castVoice:'وجّه صوتك نفسه',voiceLabel:'الصوت كما سجّلته',voiceNote:'هذا التسجيل بقي في الذاكرة المؤقتة. لا إرسال ولا حفظ للصوت؛ لا يعمل تصدير النص هنا.',caption:'وصف اختياري للصوت، من كلماتك…',voiceOnly:'تسجيل صوتي · دون نص مرافق',voiceBirth:'نشأ هذا العمل من تسجيل في معاينة محلية. لا يُحفظ الصوت مع أثر النشأة؛ النص الأول إن وُجد وصف اختاره صاحبه.',voiceIntro:'حدد من تريد أن يسمع صوتك في المعاينة، أو اتركه في المجال المحلي. يمكنك إضافة وصف اختياري.',sampleOrigin:'دور تخيّلي، ليس شخصًا أو شركة حقيقية.'},
 en:{open:'The other world',close:'Return to thought',kicker:'The shared field',title:'A person is known by their thinking',note:'Local review only. What you reveal stays in this page; nobody is connected and nothing is published online. Your private thoughts remain private.',samples:'Experience world scenarios',sampleNote:'Fictional material · roles for review',ownNote:'Material you revealed in review',empty:'The field awaits what you choose to leave in it.',approach:'Approach this idea',remove:'Withdraw from review',anonymous:'A person without a displayed name',world:'The shared field',release:'Leave it in the world · review',releaseNote:'No recipient required. Only the selected material appears in this local field; selected audio stays temporarily until you withdraw the item or close the page, even if you clear the original recording. Nothing is actually published.',released:'The material is visible in this local field; nothing was sent.',full:'The local field is full. Withdraw an item first.',castVoice:'Cast your voice itself',voiceLabel:'Your recording as captured',voiceNote:'This recording stays in temporary memory. No delivery or audio persistence; text export is unavailable here.',caption:'Optional description of the recording, in your words…',voiceOnly:'Voice recording · no accompanying text',voiceBirth:'This work began with a recording in local review. The audio is not retained with its birth trace; any initial text is the chosen description.',voiceIntro:'Choose who would hear your voice in review, or leave it in the local field. You may add an optional description.',sampleOrigin:'A fictional role, not an actual person or company.'}
};const fw=k=>fieldWords[lang][k];
const scenarioMaterials={
 ar:[['أعرف كيف نحول بيانات المصانع إلى قرارات أبكر، لكن لا أعرف من يحتاج ذلك فعلًا.','مهندس في فريق صغير'],['لدينا وصول لمصانع كثيرة. نرى نفس المشكلة تتكرر ولا نملك المنتج الذي يحلها.','شركة متخصصة في التشغيل'],['أريد أن أبدأ شيئًا لا يتطلب انتظار وظيفة. لدي وقت وقدرة على التعلم، لكن أبحث عن مشكلة حقيقية.','شخص في بداية رحلته'],['لدي فريق قادر على بناء منتجات معقدة. ما ينقصنا ليس التقنية، بل معرفة ما يستحق البناء.','قائد شركة تقنية']],
 en:[['I know how to turn factory data into earlier decisions, but not who really needs it.','Engineer in a small team'],['We reach many factories. We see the same problem recur, but have no product that solves it.','Operations company'],['I want to start something without waiting for a job. I have time and can learn, but need a real problem.','Someone beginning their journey'],['My team can build complex products. What we lack is not technology but knowing what deserves to be built.','Technology company leader']]
};
const intersectionWords={
 ar:{pick:'ضمّها إلى احتمال',unpick:'أبعدها عن الاحتمال',kicker:'بين الأفكار',title:'شيء قد ينشأ من هنا',one:'اقترب من فكرة أخرى لتختبر ما يمكن أن ينشأ بينهما.',note:'هذه مواد اخترتها، لا اتفاق ولا علاقة مثبتة. لا تُنسب الفكرة الجديدة لأصحابها دون إذنهم.',open:'شكّل ما يمكن أن يحدث',clear:'أفرغ المساحة',draft:'ماذا يمكن أن يوجد بسبب هذه المواد؟',question:'ما أول شيء يلزم أن نتحقق منه؟',keep:'ابدأ حياة هذا العمل',back:'ارجع للمواد',example:'جرّب احتمالًا من السيناريوهات',sampleDraft:'فريق هندسي وشركة لها وصول إلى المصانع قد يختبران خدمة تتنبأ بالاحتياجات قبل التعطل، بدل بناء منتج كامل مسبقًا.',sampleQuestion:'هل يوجد مصنع واحد مستعد لاختبار هذه الخدمة وتأكيد أن المشكلة تستحق الحل؟',sample:'سيناريو تخيّلي، لا دليل واقعي',local:'نص أُظهر في المعاينة المحلية',history:'ما اجتمع ليولد هذا العمل',historyNote:'هذه لقطات تاريخية من مواد مختارة، وليست موافقة أصحابها أو دليلًا حاليًا. لا تُرسل هذه الآثار تلقائيًا مع عملك.',initial:'ما اقترحته في البداية',questionHistory:'السؤال عند بداية العمل',limit:'تتسع هذه المساحة لأربع مواد.',discard:'اترك الاحتمال الذي لم تحتفظ به؟',created:'نشأ عمل خاص من المواد المختارة. يمكنك تطويره أو رميه من جديد. لم يُحفظ تلقائيًا.',invalid:'اختر مادتين على الأقل واكتب احتمالًا وسؤالًا للتحقق.'},
 en:{pick:'Bring into a possibility',unpick:'Remove from possibility',kicker:'Between thoughts',title:'Something could emerge here',one:'Approach another thought to explore what could emerge between them.',note:'These are materials you selected, not an agreement or established relationship. The new idea is not attributed to their authors without permission.',open:'Shape what might happen',clear:'Clear this space',draft:'What could exist because of these materials?',question:'What is the first thing to verify?',keep:'Begin this work’s life',back:'Return to materials',example:'Try a possibility from the scenarios',sampleDraft:'An engineering team and a company with access to factories could test a service that anticipates needs before failures, rather than building a complete product first.',sampleQuestion:'Is there one factory willing to test the service and confirm the problem is worth solving?',sample:'Fictional scenario, not real evidence',local:'Text revealed in local review',history:'What came together to begin this work',historyNote:'These are historical snapshots of selected materials, not their authors’ consent or current proof. These traces are not automatically sent with your work.',initial:'What you proposed at the beginning',questionHistory:'The question at the birth of this work',limit:'This space holds up to four materials.',discard:'Leave the possibility you have not kept?',created:'A private work began from the selected materials. Develop it or cast it again. Nothing was automatically saved.',invalid:'Choose at least two materials and write a possibility and a question to verify.'}
};const iw=k=>intersectionWords[lang][k];
function fieldNotice(value){$('status').textContent=value}
function clearIntersection(){fieldSelected=[];intersectionEditing=false;intersectionDraft='';intersectionQuestion=''}
function toggleIntersection(item,sample){
 if(phase!=='private'||!fieldOpen||!item.text.trim())return;
 const found=fieldSelected.some(s=>s.id===item.id);
 if(found)fieldSelected=fieldSelected.filter(s=>s.id!==item.id);
 else{if(fieldSelected.length>=4){$('intersection-status').textContent=iw('limit');$('intersection-clear').focus();return}fieldSelected.push({id:item.id,kind:sample?'scenario':'local',text:item.text})}
 renderField();
 const pick=[...document.querySelectorAll('.field-pick')].find(b=>b.dataset.material===item.id);
 if(pick)pick.focus({preventScroll:true});
}
function intersectionReady(){return fieldSelected.length>=2&&!!intersectionDraft.trim()&&!!intersectionQuestion.trim()}
function renderIntersection(visible){
 const active=visible&&fieldSelected.length>0,editing=active&&fieldSelected.length>=2&&intersectionEditing;
 $('field-intersection').hidden=!active;
 $('intersection-compose').hidden=!editing;
 $('intersection-open').hidden=!active||fieldSelected.length<2||editing;
 for(const [el,k] of Object.entries({'intersection-kicker':'kicker','intersection-title':'title','intersection-clear':'clear','intersection-open':'open','intersection-draft-label':'draft','intersection-question-label':'question','intersection-keep':'keep','intersection-back':'back','intersection-example':'example'}))$(el).textContent=iw(k);
 $('intersection-note').textContent=active?iw(fieldSelected.length===1?'one':'note'):'';
 $('intersection-sources').replaceChildren();
 if(active)for(const source of fieldSelected)$('intersection-sources').append(intersectionPiece(source));
 $('intersection-draft').value=editing?intersectionDraft:'';$('intersection-question').value=editing?intersectionQuestion:'';
 $('intersection-keep').disabled=!intersectionReady();
 $('intersection-status').textContent='';
 $('intersection-example').hidden=!visible||!fieldExamples;
}
function intersectionPiece(source){
 const el=document.createElement('article');el.className='intersection-piece '+source.kind;
 el.append(mindText('p',iw(source.kind==='scenario'?'sample':'local')),mindText('blockquote',source.text));
 return el;
}
function showIntersection(){intersectionEditing=true;renderField();$('field-intersection').scrollIntoView({block:'start',behavior:'instant'});$('intersection-draft').focus({preventScroll:true})}
$('intersection-open').onclick=()=>{if(phase==='private'&&fieldOpen&&fieldSelected.length>=2)showIntersection()};
$('intersection-back').onclick=()=>{intersectionEditing=false;renderField();$('intersection-open').focus()};
$('intersection-clear').onclick=()=>{if((intersectionDraft.trim()||intersectionQuestion.trim())&&!confirm(iw('discard')))return;clearIntersection();renderField();$('field-scenarios').focus()};
$('intersection-example').onclick=()=>{
 if(phase!=='private'||!fieldOpen||!fieldExamples)return;
 if((intersectionDraft.trim()||intersectionQuestion.trim())&&!confirm(iw('discard')))return;
 fieldSelected=[0,1,3].map(i=>({id:'scenario-'+i,kind:'scenario',text:scenarioMaterials[lang][i][0]}));
 intersectionDraft=iw('sampleDraft');intersectionQuestion=iw('sampleQuestion');showIntersection();
};
$('intersection-draft').oninput=()=>{intersectionDraft=$('intersection-draft').value;$('intersection-keep').disabled=!intersectionReady()};
$('intersection-question').oninput=()=>{intersectionQuestion=$('intersection-question').value;$('intersection-keep').disabled=!intersectionReady()};
$('intersection-keep').onclick=()=>{
 if(phase!=='private'||!fieldOpen||!intersectionEditing||!intersectionReady())return;
 if(works.length>=100){$('intersection-status').textContent=t('limit');return}
 if(fieldSelected.some(s=>s.kind==='local'&&!fieldItems.some(i=>i.id===s.id&&i.text===s.text))){$('intersection-status').textContent=iw('invalid');return}
 if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;
 if(offer&&!confirm(t('confirmEnd')))return;
 if((voice.snapshot().clip||voiceBusy())&&!confirm(t('confirmClip')))return;
 let work;try{work=composeFieldWork({sources:fieldSelected,question:intersectionQuestion,body:intersectionDraft,id:crypto.randomUUID(),title:titleFor(intersectionDraft)})}catch{$('intersection-status').textContent=iw('invalid');return}
 works.push(work);clearIntersection();fieldOpen=false;offer=null;forming=null;minding=null;possibilityDraft=null;mindOpen=false;discardVoice();active=work.id;render();fieldNotice(iw('created'));$('thought').focus();
};
const realityWords={
 ar:{kicker:'خارج الفكرة',title:'حين يردّ الواقع',open:'قرّب هذا العمل من الواقع',close:'ارجع إلى العمل',invitation:'الممكن ليس وعدًا. دع ما يحدث خارج العالم يغيّر ما تصنعه هنا.',current:'ما نفكر في صنعه الآن',question:'آخر سؤال لم نحسمه',defaultQuestion:'ما أول اختبار يمكن أن يغيّر رأينا؟',observation:'ماذا حدث بالفعل؟',source:'كيف عرفت؟ اذكر مصدر ما لاحظته',reading:'ماذا تقول هذه الملاحظة للفكرة؟',supports:'تدعمها',challenges:'تتحدى افتراضًا',unclear:'لا نعرف بعد',decision:'ماذا تريد أن تفعل بما عرفته؟',revise:'أعيد تشكيلها',hold:'أتركها مفتوحة',stop:'أتوقف عن هذا المسار',revision:'ما الذي أصبحت عليه الفكرة؟',next:'ما الذي ستفعله أو تختبره بعد ذلك؟',keep:'احتفظ بما غيّره الواقع',cancel:'اترك هذه الملاحظة',example:'عِش اختبارًا تخيليًا',exampleObs:'في السيناريو، وافق مصنع واحد على تجربة قصيرة، لكنه لا يملك بيانات تاريخية كافية للتنبؤ. الحل المقترح يحتاج أن يبدأ دون الاعتماد على تلك البيانات.',exampleSource:'محاكاة مكتوبة — لم تحدث في الواقع.',exampleNext:'اختبار أسبوع واحد لجمع البيانات يدويًا قبل تطوير أي نموذج تنبؤ.',reported:'ملاحظة أدخلها الإنسان · غير متحقق منها',scenario:'اختبار تخيلي · لم يحدث',history:'أثر مما واجهه العمل',before:'قبل الملاحظة',after:'بعد قرار الإنسان',invalid:'أكمل الملاحظة ومصدرها وقراءتك وقرارك وخطوتك التالية. التعديل يتطلب نصًا مختلفًا.',kept:'احتُفظ بالملاحظة وقرارك في العمل. لم يُحفظ تلقائيًا.',limit:'بلغ العمل حد الملاحظات المحلية.',paused:'اختار صاحب العمل التوقف عن هذا المسار. لا شيء يمنعه من إعادة التفكير لاحقًا.'},
 en:{kicker:'Outside the idea',title:'When reality responds',open:'Bring this work toward reality',close:'Return to the work',invitation:'A possibility is not a promise. Let what happens outside the world change what you make here.',current:'What we are considering now',question:'The last unresolved question',defaultQuestion:'What first test could change our minds?',observation:'What actually happened?',source:'How do you know? Describe your source',reading:'What does this observation say about the idea?',supports:'Supports it',challenges:'Challenges an assumption',unclear:'We do not know yet',decision:'What will you do with what you learned?',revise:'Reshape it',hold:'Leave it open',stop:'Stop this direction',revision:'What has the idea become?',next:'What will you do or test next?',keep:'Keep what reality changed',cancel:'Leave this observation',example:'Experience a fictional test',exampleObs:'In this scenario one factory agrees to a short trial but lacks historical data for predictions. The proposed solution needs to begin without relying on that data.',exampleSource:'Written simulation — did not actually happen.',exampleNext:'Test one week of manual data collection before developing any prediction model.',reported:'Human-reported observation · unverified',scenario:'Fictional test · did not happen',history:'Traces of what the work encountered',before:'Before the observation',after:'After the human decision',invalid:'Complete the observation, source, reading, decision and next action. Revision requires different text.',kept:'The observation and your decision are part of the work. Not automatically saved.',limit:'This work has reached its local observation limit.',paused:'The author chose to stop this direction. They can reconsider later.'}
};const rw=k=>realityWords[lang][k];
const realityDrafts=new Map();let realityOpen=null;
function realityWork(){return phase==='private'?current():null}
function blankReality(w){return {kind:'reported',observation:'',source:'',reading:'',decision:'',revision:w.body,next:''}}
function realityDraft(w){if(!realityDrafts.has(w.id))realityDrafts.set(w.id,blankReality(w));return realityDrafts.get(w.id)}
function realityReady(w,d){return !!(w&&d&&d.observation.trim()&&d.source.trim()&&d.reading&&d.decision&&d.next.trim()&&(d.decision!=='revise'||(d.revision.trim()&&d.revision!==w.body)))}
function renderReality(w){
 const visible=phase==='private'&&!!w?.body.trim(),editing=visible&&realityOpen===w.id;
 $('reality').hidden=!visible;$('reality-compose').hidden=!editing;
 $('reality-open').setAttribute('aria-expanded',String(editing));
 for(const [id,k] of Object.entries({'reality-kicker':'kicker','reality-title':'title','reality-invitation':'invitation','reality-current-label':'current','reality-question-label':'question','reality-observation-label':'observation','reality-source-label':'source','reality-reading-label':'reading','reality-decision-label':'decision','reality-revision-label':'revision','reality-next-label':'next','reality-keep':'keep','reality-cancel':'cancel','reality-example':'example'}))$(id).textContent=rw(k);
 $('reality-open').textContent=rw(editing?'close':'open');
 const d=editing?realityDraft(w):null;
 $('reality-current-text').textContent=editing?w.body:'';
 $('reality-question-text').textContent=editing?(w.reality?.at(-1)?.next||w.fieldBasis?.question||rw('defaultQuestion')):'';
 for(const key of ['observation','source','revision','next']){const el=$('reality-'+key),value=d?.[key]||'';if(el.value!==value)el.value=value}
 for(const key of ['reading','decision'])for(const el of document.querySelectorAll('#reality [data-'+key+']')){const selected=el.dataset[key]===d?.[key];el.textContent=rw(el.dataset[key]);el.setAttribute('aria-pressed',String(selected))}
 $('reality-revision-wrap').hidden=!editing||d?.decision!=='revise';
 $('reality-example').hidden=!editing||!(w.fieldBasis?.sources.every(s=>s.kind==='scenario'));
 $('reality-keep').disabled=!realityReady(w,d);
 $('reality-status').textContent=d?.kind==='scenario'?rw('scenario'):'';
 if(editing){document.body.dataset.reality='open';document.body.dataset.realityReading=d.reading||'unread';document.body.dataset.realityDecision=d.decision||'undecided'}else{delete document.body.dataset.reality;delete document.body.dataset.realityReading;delete document.body.dataset.realityDecision}
 const history=$('reality-history');history.replaceChildren();
 if(!visible||!w.reality?.length)return;
 history.append(mindText('h3',rw('history')));
 for(const e of [...w.reality].reverse()){
  const card=document.createElement('article');card.className='reality-trace';card.dataset.reading=e.reading;
  card.append(mindText('p',rw(e.kind)+' · '+rw(e.reading),'reality-provenance'),mindText('blockquote',e.observation),mindText('p',e.source,'reality-source'),mindText('p',rw(e.decision),'reality-decision'),mindText('p',e.next));
  if(e.decision==='stop')card.append(mindText('p',rw('paused'),'quiet'));
  const details=document.createElement('details');details.append(mindText('summary',rw('before')+' / '+rw('after')),mindText('p',rw('before'),'quiet'),mindText('blockquote',e.before),mindText('p',rw('after'),'quiet'),mindText('blockquote',e.after));card.append(details);history.append(card)
 }
}
$('reality-open').onclick=()=>{const w=realityWork();if(!w?.body.trim()||forming||minding)return;if((w.reality??[]).length>=12){fieldNotice(rw('limit'));return}if(realityOpen===w.id){realityOpen=null;renderReality(w);return}realityOpen=w.id;renderReality(w);$('reality').scrollIntoView({block:'start',behavior:'instant'});$('reality-observation').focus({preventScroll:true})};
for(const key of ['observation','source','revision','next'])$('reality-'+key).oninput=()=>{const w=realityWork();if(!w||realityOpen!==w.id)return;const d=realityDraft(w);d[key]=$('reality-'+key).value;$('reality-keep').disabled=!realityReady(w,d)};
for(const key of ['reading','decision'])for(const el of document.querySelectorAll('#reality [data-'+key+']'))el.onclick=()=>{const w=realityWork();if(!w||realityOpen!==w.id)return;realityDraft(w)[key]=el.dataset[key];renderReality(w)};
$('reality-example').onclick=()=>{const w=realityWork();if(!w||realityOpen!==w.id||!w.fieldBasis?.sources.every(s=>s.kind==='scenario'))return;const d=realityDraft(w);if(d.observation.trim()||d.source.trim()||d.next.trim())return;Object.assign(d,{kind:'scenario',observation:rw('exampleObs'),source:rw('exampleSource'),reading:'challenges',decision:'',next:rw('exampleNext')});renderReality(w);$('reality-decisions').querySelector('button').focus()};
$('reality-cancel').onclick=()=>{const w=realityWork();if(!w)return;realityDrafts.delete(w.id);realityOpen=null;renderReality(w);$('reality-open').focus()};
$('reality-keep').onclick=()=>{const w=realityWork();if(!w||realityOpen!==w.id)return;const d=realityDraft(w);if(!realityReady(w,d))return;try{const updated=meetReality(w,{...d,id:crypto.randomUUID()});Object.assign(w,updated);realityDrafts.delete(w.id);realityOpen=null;loadPrivate();fieldNotice(rw('kept'));$('thought').focus()}catch{$('reality-status').textContent=rw('invalid')}};
function renderFieldHistory(w){
 const basis=phase==='private'?w?.fieldBasis:null;
 $('field-history').hidden=!basis;$('field-history-title').textContent=iw('history');$('field-history-note').textContent=basis?iw('historyNote'):'';
 $('field-history-initial-label').textContent=iw('initial');$('field-history-initial').textContent=basis?.initial||'';
 $('field-history-question-label').textContent=iw('questionHistory');$('field-history-question').textContent=basis?.question||'';
 const root=$('field-history-pieces');root.replaceChildren();if(basis)for(const source of basis.sources)root.append(intersectionPiece(source));
}

function syncExchangeVoice(blob){
 const player=$('exchange-audio');
 if(blob!==exchangeVoiceBlob){player.pause();player.removeAttribute('src');player.load();if(exchangeVoiceURL)URL.revokeObjectURL(exchangeVoiceURL);exchangeVoiceBlob=blob;exchangeVoiceURL=blob?URL.createObjectURL(blob):'';if(exchangeVoiceURL)player.src=exchangeVoiceURL}
 $('exchange-voice').hidden=!blob;$('exchange-voice-label').textContent=fw('voiceLabel');$('exchange-voice-note').textContent=fw('voiceNote');
}
function renderField(){
 const visible=phase==='private'&&fieldOpen;
 $('open-field').hidden=phase!=='private';$('open-field').textContent=fw('open');$('open-field').setAttribute('aria-expanded',String(visible));
 $('human-field').hidden=!visible;
 if(visible)document.body.dataset.humanField='open';else delete document.body.dataset.humanField;
 $('field-kicker').textContent=fw('kicker');$('field-title').textContent=fw('title');$('field-note').textContent=fw('note');$('field-close').textContent=fw('close');
 $('field-scenarios').textContent=fw('samples');$('field-scenarios').setAttribute('aria-expanded',String(visible&&fieldExamples));
 const own=$('field-own'),samples=$('field-samples');own.replaceChildren();samples.replaceChildren();samples.hidden=!visible||!fieldExamples;renderIntersection(visible);if(!visible)return;
 if(!fieldItems.length)own.append(mindText('p',fw('empty'),'field-empty'));
 const card=(item,sample)=>{
  const el=document.createElement('article');el.className='field-material';
  el.append(mindText('p',fw(sample?'sampleNote':'ownNote'),'field-provenance'),mindText('blockquote',item.text||fw('voiceOnly')),mindText('p',(item.sender||fw('anonymous'))+(sample?' · '+fw('sampleOrigin'):''),'field-person'));
  const actions=document.createElement('div');actions.className='actions';
  actions.append(mindButton(fw('approach'),()=>approachField(item,sample)));
  if(!sample)actions.append(mindButton(fw('remove'),()=>{fieldItems=fieldItems.filter(x=>x.id!==item.id);fieldSelected=fieldSelected.filter(x=>x.id!==item.id);if(offer?.fieldId===item.id)offer=null;renderField();presence();$('open-field').focus()}));
  if(item.text.trim()){const picked=fieldSelected.some(s=>s.id===item.id),pick=mindButton(iw(picked?'unpick':'pick'),()=>toggleIntersection(item,sample),'field-pick');pick.dataset.material=item.id;pick.setAttribute('aria-pressed',String(picked));actions.append(pick)}
  el.append(actions);return el;
 };
 for(const item of fieldItems)own.append(card(item,false));
 if(fieldExamples)for(const [i,[text,sender]] of scenarioMaterials[lang].entries())samples.append(card({id:'scenario-'+i,text,sender,voice:null,source:null},true));
}
function openField(){if(voiceBusy()||forming||minding){fieldNotice(lang==='ar'?'أنهِ التعبير أو التشكيل الحالي أولًا.':'Finish the current expression or formation first.');return}fieldOpen=true;renderField();$('human-field').scrollIntoView({block:'start',behavior:'instant'});$('field-close').focus({preventScroll:true})}
$('open-field').onclick=()=>{if(phase==='private'){if(fieldOpen){fieldOpen=false;renderField();resizeThought();$('thought').focus()}else openField()}};
$('field-close').onclick=()=>{fieldOpen=false;renderField();resizeThought();$('open-field').focus()};
$('field-scenarios').onclick=()=>{fieldExamples=!fieldExamples;renderField();$('field-scenarios').focus()};
function approachField(item,sample){
 if(phase!=='private'||forming||minding)return;
 if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;
 if(offer&&!confirm(t('confirmEnd')))return;
 possibilityDraft=null;mindOpen=false;
 offer={id:crypto.randomUUID(),fieldId:item.id,work:active,sourceWork:sample?null:item.source,fieldSample:sample,draft:item.text,recipient:fw('world'),masked:!item.sender,sender:item.sender||'',exposed:item.text,voice:item.voice||null,replyDraft:'',reply:null,invited:false,declined:false,common:'',accepted:false,resume:'recipient'};
 $('idea-object').dataset.idea=offer.id;status(null);setPhase('recipient','arrive');status('localOnly');
}
function releaseField(){
 if(phase!=='prepare'||!offer)return;captureDraft();
 if(!(offer.draft.trim()||offer.voice)||(!offer.masked&&!offer.sender.trim()))return;
 if(fieldItems.length>=12){fieldNotice(fw('full'));return}
 fieldItems.push({id:crypto.randomUUID(),text:offer.draft,voice:offer.voice||null,sender:offer.masked?null:offer.sender.trim(),source:offer.work});
 offer=null;phase='private';fieldOpen=true;render();fieldNotice(fw('released'));openField();
}
$('release-field').onclick=releaseField;

function valid(v){return v&&v.version===1&&['ar','en'].includes(v.lang)&&Array.isArray(v.works)&&v.works.length<=100&&new Set(v.works.map(w=>w?.id)).size===v.works.length&&v.works.every(w=>w&&str(w.id,80)&&str(w.title,240)&&w.title.trim()&&str(w.body,12000)&&str(w.idea,6000)&&typeof w.ideaOpen==='boolean'&&(w.parent===null||str(w.parent,80))&&(w.origin===undefined||validOrigin(w.origin,w.parent))&&(w.mind===undefined||validMind(w.mind))&&(w.basis===undefined||validBasis(w.basis,w.parent))&&(w.birth===undefined||validBirth(w.birth))&&(w.fieldBasis===undefined||validFieldBasis(w.fieldBasis))&&(w.reality===undefined||validReality(w.reality)))&&(v.active===null||v.works.some(w=>w.id===v.active))}
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=2400000){const v=JSON.parse(raw);if(valid(v)){lang=v.lang;works=v.works.map(w=>({id:w.id,title:w.title,body:w.body,idea:w.idea,ideaOpen:w.ideaOpen,parent:w.parent,...(w.reality?{reality:w.reality.map(e=>({...e}))}:{}),...(w.fieldBasis?{fieldBasis:{sources:w.fieldBasis.sources.map(s=>({id:s.id,kind:s.kind,text:s.text})),question:w.fieldBasis.question,initial:w.fieldBasis.initial}}:{}),...(w.birth?{birth:{kind:w.birth.kind,first:w.birth.first,second:w.birth.second,emergence:w.birth.emergence,id:w.birth.id}}:{}),...(w.origin?{origin:{sourceId:w.origin.sourceId,start:w.origin.start,end:w.origin.end,excerpt:w.origin.excerpt}}:{}),...(w.mind?{mind:{marks:w.mind.marks.map(m=>({id:m.id,kind:m.kind,topic:m.topic,start:m.start,end:m.end,excerpt:m.excerpt})),dismissed:[...w.mind.dismissed]}}:{}),...(w.basis?{basis:w.basis.map(p=>({workId:p.workId,mark:{id:p.mark.id,kind:p.mark.kind,topic:p.mark.topic,start:p.mark.start,end:p.mark.end,excerpt:p.mark.excerpt}}))}:{})}));active=v.active}}}catch{}
function titleFor(body){const s=body.trim().split(/\r?\n/)[0];return Array.from(s||t('untitled')).slice(0,90).join('')}
function ensureWork(){let w=current();if(w)return w;if(works.length>=100){status('limit');return null}w={id:crypto.randomUUID(),title:t('untitled'),body:'',idea:'',ideaOpen:false,parent:null};works.push(w);automaticTitles.add(w.id);active=w.id;return w}
// Presence is not a step to dismiss. Controls derive from what actually exists.
function presence(){
 const w=current(),hasText=!!w?.body.trim(),hasWork=!!w,hasOffer=!!offer&&offer.work===active;
 document.body.dataset.presence=hasWork?'working':'still';
 updateExpression();
 $('prepare').hidden=!hasText||!!forming||!!minding;
 $('form-fragment').hidden=!hasText||!!forming||!!minding;
 $('mind-mark').hidden=!hasText||!!forming||!!minding;
 $('material-actions').hidden=!hasText||!!forming||!!minding;
 $('arrival-note').hidden=hasText;
 $('save').hidden=!hasWork;
 $('recall').hidden=!works.length&&!hasVault();
 $('resume').hidden=!hasOffer||!!forming||!!minding;
 renderFormation();renderMind();renderWorkLife(w);renderFieldHistory(w);renderReality(w);
 resizeThought();
}
function renderWorkLife(w){
 const birth=w?.birth,visible=phase==='private'&&!!birth;
 $('work-birth').hidden=!visible;$('work-life-invitation').hidden=!visible;
 if(visible)document.body.dataset.workLife='born';else delete document.body.dataset.workLife;
 $('work-life-invitation').textContent=visible?lt('invitation'):'';
 $('work-birth-title').textContent=lt('title');
 $('work-birth-note').textContent=visible?(birth.kind==='local-voice-review'?fw('voiceBirth'):lt(birth.kind==='file-reply'?'file':'local')):'';
 $('birth-first-label').textContent=lt('first');$('birth-second-label').textContent=lt('second');
 $('birth-first').textContent=visible?(birth.first||(birth.kind==='local-voice-review'?fw('voiceOnly'):'')):'';$('birth-second').textContent=visible?birth.second:'';
 $('birth-emergence').hidden=!visible||!birth.emergence;
 $('birth-emergence-label').textContent=lt('emergence');
 $('birth-emergence-text').textContent=visible?birth.emergence:'';
 if(!visible)$('birth-emergence').open=false;
 const parent=visible&&works.find(x=>x.id===w.parent);
 $('birth-parent').hidden=!visible;$('birth-parent').disabled=!parent;
 $('birth-parent').textContent=parent?lt('parent'):lt('missing');
}
$('birth-parent').onclick=()=>{const w=current();if(phase==='private'&&w?.birth&&works.some(x=>x.id===w.parent))switchWork(w.parent)};
function loadPrivate(){const w=current();$('name').hidden=!w;$('name').value=w?.title||'';$('thought').value=w?.body||'';$('prior').hidden=!w?.idea;$('prior-text').value=w?.idea||'';$('resume').hidden=!offer;$('resume').disabled=offer?.work!==active;presence()}
function persist(){try{const raw=JSON.stringify({version:1,lang,works,active});if(raw.length>2400000)throw Error();localStorage.setItem(KEY,raw);status('saved');return true}catch{status('failed');return false}}
$('thought').addEventListener('input',()=>{
 const value=$('thought').value;
 if(!current()&&!value.trim()){presence();return}
 const w=ensureWork();if(!w){$('thought').value='';return}
 w.body=value;
 if(automaticTitles.has(w.id)){w.title=titleFor(value);$('name').value=w.title}
 $('name').hidden=false;presence();
});
$('name').addEventListener('input',()=>{const w=current();if(w){automaticTitles.delete(w.id);w.title=$('name').value.trim()||titleFor(w.body)}});
$('prior-text').addEventListener('input',()=>{if(current())current().idea=$('prior-text').value});
$('save').onclick=()=>{if(!current()&&!$('thought').value.trim()){status('emptyThought');return}persist()};
function list(){const root=$('works'),q=$('find').value.trim().toLowerCase();root.replaceChildren();for(const w of works.filter(w=>(w.title+' '+w.body).toLowerCase().includes(q))){const btn=document.createElement('button');btn.className='item';btn.dir='auto';btn.textContent=w.title;btn.onclick=()=>switchWork(w.id);root.append(btn)}if(!root.children.length){const p=document.createElement('p');p.textContent=t('empty');root.append(p)}}
function switchWork(id){if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;if(minding&&!confirm(mt('challenge')))return;if(forming&&!confirm(ft('discard')))return;if((voice.snapshot().clip||voiceBusy())&&!confirm(t('confirmClip')))return;forming=null;minding=null;possibilityDraft=null;mindOpen=false;discardVoice();active=id;offer=null;$('memory').close();loadPrivate();$('thought').focus();status(null)}
$('recall').onclick=()=>{$('find').value='';list();$('memory').showModal();$('find').focus()};$('find').oninput=list;$('close-memory').onclick=()=>$('memory').close();$('new-work').onclick=()=>switchWork(null);
$('forget').onclick=()=>{if(!confirm(t('confirmForget')))return;try{localStorage.removeItem(KEY);localStorage.removeItem(VAULT_KEY);status('forgot');presence();$('memory').close()}catch{status('failed')}};
const dictationText={
 ar:{options:'الصوت والكلمات',enable:'اقتراح نص محلي أثناء التسجيل',language:'لغة الكلام',checking:'نتحقق من توفر اللغة على جهازك',listening:'نص أولي · غير مراجع',finishing:'نستكمل النص الأولي',unavailable:'التفريغ المحلي غير متاح لهذه اللغة على جهازك. الصوت مستقل.',failed:'تعذر التفريغ المحلي. الصوت مستقل.',empty:'لا يوجد نص مقترح جديد.',ready:'راجع النص المقترح قبل إضافته إلى تفكيرك.',off:'',add:'أضف إلى تفكيري',draft:'النص المقترح من الصوت',limit:'النص أطول من حيز التأليف المتاح.'},
 en:{options:'Voice and words',enable:'Suggest text locally while recording',language:'Speech language',checking:'Checking on-device language availability',listening:'Preliminary text · unreviewed',finishing:'Finishing the preliminary text',unavailable:'On-device recognition for this language is unavailable. Your audio remains independent.',failed:'Local recognition failed. Your audio remains independent.',empty:'No new text suggested.',ready:'Review the suggested text before adding it to your work.',off:'',add:'Add to my thinking',draft:'Suggested text from voice',limit:'There is not enough room in the current work.'}
};
const dt=k=>dictationText[lang][k]||'';
const soundWords={ar:{play:'استمع إلى صوتك',pause:'أوقف الاستماع مؤقتًا',position:'موضع الاستماع',playError:'تعذر تشغيل الصوت على هذا الجهاز.'},en:{play:'Listen to your voice',pause:'Pause listening',position:'Listening position',playError:'Audio could not play on this device.'}};
let voiceURL='',displayedClip=null,voiceClock=null,voiceStarted=0;
const voiceSurface=createVoiceSurface({audio:$('clip'),player:$('voice-player'),play:$('voice-play'),playLabel:$('voice-play-label'),playIcon:$('voice-play-icon'),position:$('voice-position'),positionLabel:$('voice-position-label'),time:$('voice-position-time'),recordedPath:$('recorded-voice-path'),liveInk:$('live-voice-ink'),livePath:$('live-voice-path'),status:$('voice-player-status'),translate:k=>soundWords[lang][k],onInk:(kind,path)=>$(kind==='live'?'world-live-ink':'world-recorded-ink').setAttribute('d',path)});
const dictation=createLocalDictation({getRecognition:()=>window.SpeechRecognition,onChange:dictationUI});
const voice=createVoiceCapture({
 getStream:()=>navigator.mediaDevices.getUserMedia({audio:true}),
 makeRecorder:input=>new MediaRecorder(input),
 onChange:()=>micUI(),
 onStart:stream=>{voiceSurface.startLive(stream);dictation.start(stream,$('dictation-language').value,$('dictation-opt').checked)},
 onStop:()=>{voiceSurface.stopLive();dictation.stop()},
 onComplete:clip=>{voiceSurface.stopLive();dictation.stop();dictation.complete(clip)},
 onCancel:()=>{voiceSurface.stopLive();dictation.cancel()}
});
const voiceBusy=()=>['requesting','recording','stopping'].includes(voice.snapshot().state);
function micUI(){
 const {state,error,clip}=voice.snapshot(),live=state==='recording';
 if(voiceBusy())$('clip').pause();
 updateVoiceClock(live);
 if(displayedClip!==clip){
  $('clip').pause();$('clip').removeAttribute('src');$('clip').load();
  if(voiceURL)URL.revokeObjectURL(voiceURL);
  displayedClip=clip;voiceURL=clip?URL.createObjectURL(clip):'';
  if(voiceURL)$('clip').src=voiceURL;
  voiceSurface.setClip(clip);
 }
 $('voice').dataset.capture=state;
 $('mic').setAttribute('aria-pressed',String(live));
 $('mic').setAttribute('aria-disabled',String(state==='stopping'));
 $('mic-label').textContent=state==='requesting'?t('cancelMic'):live?t('stop'):state==='stopping'?t('stopping'):st('speak');
 $('voice-intent').textContent=st(state);
 $('voice-trace-label').textContent=st('trace');
 $('voice-trace-note').textContent=st('traceNote');
 $('voice-state').textContent=error?t(error):['requesting','recording','stopping','ready'].includes(state)?t(state):'';
 $('clear-clip').hidden=!voiceURL||voiceBusy();
 $('clip').hidden=!voiceURL||voiceBusy();
 voiceSurface.sync({visible:!!voiceURL&&!voiceBusy()});
 $('voice-next').hidden=!voiceURL||voiceBusy();
 $('voice-to-thought-label').textContent=lt('voice');$('voice-next-note').textContent=lt('voiceNote');$('cast-voice').textContent=fw('castVoice');
 updateExpression();dictationUI();
}
function dictationUI(){
 const {status,live,draft}=dictation.snapshot(),busy=voiceBusy(),clip=voice.snapshot().clip;
 $('dictation-options').hidden=!dictation.supported()&&!$('dictation-opt').checked;
 $('dictation-options-label').textContent=dt('options');
 $('dictation-opt-wrap').hidden=!dictation.supported()&&!$('dictation-opt').checked;
 $('dictation-opt').disabled=busy;
 $('dictation-language-wrap').hidden=!$('dictation-opt').checked;
 $('dictation-language').disabled=busy;
 $('dictation-opt-label').textContent=dt('enable');
 $('dictation-language-label').textContent=dt('language');
 $('dictation-status').textContent=dt(status);
 $('dictation-preview').textContent=live;
 $('dictation-preview').hidden=!live;
 const available=!!draft&&draft.clip===clip&&!!draft.text&&!busy;
 // Keep an empty edited draft visible until explicitly consumed.
 const editing=!busy&&!!draft&&draft.clip===clip&&draft.status==='ready';
 $('dictation-review').hidden=!(available||editing);
 $('dictation-label').textContent=dt('draft');
 $('dictation-add').textContent=dt('add');
 if($('dictation-draft').value!==(draft?.text||''))$('dictation-draft').value=draft?.text||'';
 $('dictation-add').disabled=!available||!draft.text.trim();
}
$('voice-to-thought').onclick=()=>{if(phase!=='private'||voiceBusy()||!voice.snapshot().clip)return;const review=$('dictation-review');if(!review.hidden){$('dictation-draft').focus();review.scrollIntoView({block:'nearest',behavior:'instant'})}else{$('thought').focus();$('thought').scrollIntoView({block:'center',behavior:'instant'})}};
$('dictation-opt').onchange=dictationUI;
$('dictation-draft').oninput=()=>dictation.edit($('dictation-draft').value);
$('dictation-add').onclick=()=>{
 const d=dictation.snapshot().draft;
 if(phase!=='private'||!d||d.clip!==voice.snapshot().clip||!d.text.trim()||voiceBusy())return;
 const target=$('thought'),joined=target.value+(target.value.trim()?'\n\n':'')+d.text.trim();
 if(joined.length>target.maxLength){$('dictation-status').textContent=dt('limit');return}
 if(!ensureWork())return;
 target.value=joined;target.dispatchEvent(new Event('input',{bubbles:true}));dictation.consume();target.focus();
};
function updateExpression(){
 const {state,clip}=voice.snapshot();
 const fact=expressionState({hasText:!!current()?.body.trim(),capture:state,hasClip:!!clip});
 document.body.dataset.expression=fact.material;
 document.body.dataset.capture=fact.capture;
}
function updateVoiceClock(live){
 const output=$('voice-duration');
 if(!live){if(voiceClock!==null)clearInterval(voiceClock);voiceClock=null;output.hidden=true;return}
 if(voiceClock!==null)return;
 voiceStarted=performance.now();output.hidden=false;
 const tick=()=>{const s=Math.floor((performance.now()-voiceStarted)/1000);output.textContent=Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
 tick();voiceClock=setInterval(tick,250);
}
function discardVoice(){voiceSurface.stopLive();voice.discard();dictation.reset()}
$('clear-clip').onclick=()=>{const clip=voice.snapshot().clip;if(offer?.voice===clip&&!offer.fieldId)offer=null;voice.clear();dictation.reset();presence()};
$('mic').onclick=()=>voice.toggle();
window.addEventListener('pagehide',()=>{discardVoice();syncExchangeVoice(null);fieldItems=[];clearIntersection();realityDrafts.clear();realityOpen=null;if(offer?.voice||offer?.fieldId)offer=null;});
window.addEventListener('pageshow',e=>{if(e.persisted){fieldOpen=false;fieldExamples=false;phase='private';render()}});
// Formation belongs to the private authoring surface, not the recipient form.
function renderFormation(){
 const w=current(),visible=phase==='private'&&!!forming&&forming.fragment.sourceId===active;
 $('formation').hidden=!visible;document.body.dataset.forming=visible?'yes':'no';
 $('form-fragment-label').textContent=st('form');
 for(const [id,k] of Object.entries({'formation-title':'title','formation-source-label':'source','formation-draft-label':'draft','formation-keep':'keep','formation-cancel':'cancel','formation-note':'note','lineage-label':'lineage','origin-excerpt-label':'excerpt'}))$(id).textContent=ft(k);
 $('formation-quote').textContent=visible?forming.fragment.excerpt:'';
 const draft=visible?forming.text:'';
 if($('formation-draft').value!==draft)$('formation-draft').value=draft;
 $('formation-keep').disabled=!visible||!draft.trim();
 const children=phase==='private'&&w?works.filter(child=>child.parent===w.id&&(!!child.origin||!!child.birth||!!child.basis)):[];
 const parent=phase==='private'&&w?.origin?works.find(x=>x.id===w.parent):null;
 const showOrigin=phase==='private'&&!!w?.origin;
 $('formation-lineage').hidden=!showOrigin&&!children.length;
 $('origin-trace').hidden=!showOrigin;
 $('origin-excerpt').textContent=showOrigin?w.origin.excerpt:'';
 $('origin-back').disabled=!parent;
 $('origin-back').textContent=parent?ft('back'):ft('missing');
 $('formed-works').replaceChildren();
 for(const child of children){
  const node=document.createElement('button');node.type='button';node.className='formed-work';node.dir='auto';
  const name=document.createElement('span');name.textContent=child.title;
  const hint=document.createElement('small');hint.textContent=child.birth?lt('child'):ft('child');
  node.append(name,hint);node.onclick=()=>switchWork(child.id);$('formed-works').append(node);
 }
}
$('form-fragment').onclick=()=>{
 const w=current(),editor=$('thought');
 if(phase!=='private'||!w||forming||minding)return;
 let fragment;try{fragment=captureFragment(w,editor.selectionStart,editor.selectionEnd)}catch{ $('status').textContent=ft('empty');return }
 if(!fragment){$('status').textContent=ft('empty');return}
 forming={fragment,text:fragment.excerpt};
 presence();$('formation-draft').focus();
};
$('formation-draft').oninput=()=>{if(forming){forming.text=$('formation-draft').value;$('formation-keep').disabled=!forming.text.trim()}};
$('formation-cancel').onclick=()=>{forming=null;presence();$('thought').focus();status(null)};
$('formation-keep').onclick=()=>{
 if(phase!=='private'||!forming||forming.fragment.sourceId!==active)return;
 if(works.length>=100){status('limit');return}
 const w=current();const body=$('formation-draft').value;
 if(!body.trim())return;
 const child=formWork({source:w,fragment:forming.fragment,text:body,id:crypto.randomUUID(),title:titleFor(body)});
 works.push(child);forming=null;presence();$('status').textContent=ft('created');
 const buttons=$('formed-works').querySelectorAll('button');buttons[buttons.length-1]?.focus();
};
$('origin-back').onclick=()=>{const w=current();if(w?.origin&&works.some(x=>x.id===w.parent))switchWork(w.parent)};

function mindButton(label,action,cls=''){
 const b=document.createElement('button');b.type='button';b.textContent=label;if(cls)b.className=cls;b.onclick=action;return b;
}
function mindText(tag,value,cls=''){
 const n=document.createElement(tag);n.textContent=value;n.dir='auto';if(cls)n.className=cls;return n;
}
function mindStatus(k){$('status').textContent=mt(k)}
const echoWords={
 ar:{signal:'شيء مما تعرفه يقترب من هذا التفكير',title:'أثر من معرفتك',note:'تذكّر، لا استنتاج. الموضوع نفسه ظهر في كلامك الحالي وفي مقطع سبق أن علّمته. لم يثبت وجود علاقة أو فرصة.',open:'استحضر مصدر الأثر',connect:'هل يمكن أن يتصلا؟',ignore:'اترك هذا الأثر الآن',why:'سبب ظهور الصلة',whyNote:'احتياج وقدرة علّمتهما بنفسك تحت الموضوع نفسه. الصلة احتمال يحتاج إلى تحقق، وليست إثباتًا.',label:'فرضية قابلة للرفض',mark:'المعنى الذي سمحت به'},
 en:{signal:'Something you know is near this thought',title:'A trace of your knowledge',note:'Recall, not inference. The same subject appears in your current words and in a passage you marked earlier. No relationship or opportunity is established.',open:'Recall the source',connect:'Could they connect?',ignore:'Leave this trace for now',why:'Why this connection appears',whyNote:'A need and capability you marked under the same subject. This is a hypothesis to investigate, not proof.',label:'A challengeable hypothesis',mark:'Meaning you allowed'}
};const ew=k=>echoWords[lang][k];
function echoesFor(w){return w?rememberedMentions(works,w.id).filter(x=>!quietMentions.get(w.id)?.has(x.key)):[]}

function renderMind(){
 const w=phase==='private'?current():null,visible=!!w&&!!minding&&minding.fragment.sourceId===w.id;
 const marks=w?.mind?.marks??[],result=w?correspondences(works,w.id):{links:[],limited:false},echoes=echoesFor(w);
 for(const [element,k] of Object.entries({'mind-mark-label':'mark','mind-title':'title','mind-note':'note','mind-need-label':'need','mind-ability-label':'ability','mind-topic-label':'topic','mind-keep':'keep','mind-cancel':'cancel','mind-limit':'limit'}))$(element).textContent=mt(k);
 const signal=!!w&&(marks.length>0||result.links.length>0||echoes.length>0);
 $('world-periphery').hidden=!signal||visible;
 $('world-periphery').setAttribute('aria-label',result.links.length?pt('signal'):echoes.length?ew('signal'):pt('memory'));
 $('mind-signal').textContent=result.links.length?pt('signal'):echoes.length?ew('signal'):pt('memory');
 $('mind-signal-detail').textContent=mindOpen?pt('close'):pt('hint');
 $('mind-reveal').setAttribute('aria-expanded',String(mindOpen));
 $('mind-close').textContent=pt('close');
 $('mind-close').hidden=visible;
 if(!visible&&echoes.length&&!result.links.length)$('mind-note').textContent=ew('note');
 $('mind').hidden=!w||(!visible&&(!signal||!mindOpen));
 $('mind-mark-label').textContent=st('mind');$('mind-title').textContent=ct('title');
 for(const [element,k] of Object.entries({'mind-source-caption':'source','mind-choice-label':'choice','mind-need-label':'need','mind-ability-label':'ability','mind-need-example':'needExample','mind-ability-example':'abilityExample','mind-topic-label':'subject','mind-counterpart-note':'otherNote','mind-empty':'none'}))$(element).textContent=ct(k);
 $('mind-topic').placeholder=ct('subjectHint');
 $('mind-counterpart').placeholder=ct('otherHint');
 $('mind-empty').hidden=!w||visible||!marks.length||!!result.links.length||!!echoes.length;
 if(possibilityDraft&&(!w||possibilityDraft.work!==w.id||!result.links.some(l=>l.key===possibilityDraft.key)))possibilityDraft=null;
 renderBasis(w);
 $('mind-compose').hidden=!visible;$('mind-passage').textContent=visible?minding.fragment.excerpt:'';
 const input=$('mind-topic'),topic=visible?minding.topic:'';
 if(input.value!==topic)input.value=topic;
 const counterpart=visible?minding.counterpart:'',other=$('mind-counterpart');
 if(other.value!==counterpart)other.value=counterpart;
 updateMindComposer();$('mind-limit').hidden=!result.limited;
 const markRoot=$('mind-marks'),linkRoot=$('mind-links');
 markRoot.replaceChildren();linkRoot.replaceChildren();
 const echoRoot=$('mind-echoes');echoRoot.replaceChildren();echoRoot.hidden=!mindOpen||visible||!echoes.length;
 if(mindOpen&&!visible)for(const e of echoes){
  const item=document.createElement('article');item.className='mind-echo';
  item.append(mindText('h3',ew('title')),mindText('p',ew('note'),'quiet'),mindText('p',mt(e.mark.kind)+' · '+e.mark.topic,'mind-subject'),mindText('blockquote',e.mark.excerpt));
  const actions=document.createElement('div');actions.className='actions';
  actions.append(mindButton(ew('open'),()=>switchWork(e.workId)),mindButton(ew('ignore'),()=>{
   if(phase!=='private'||current()!==w)return;
   const ignored=quietMentions.get(w.id)??new Set();ignored.add(e.key);quietMentions.set(w.id,ignored);renderMind();
   if($('world-periphery').hidden)$('thought').focus();else $('mind-reveal').focus();
  }),mindButton(ew('connect'),()=>{
   if(phase!=='private'||current()!==w||!echoesFor(w).some(x=>x.key===e.key))return;
   $('mind-mark').click();
   if(minding){minding.topic=e.mark.topic;renderMind();$('mind-need').focus()}
  },'accent'));
  item.append(actions);echoRoot.append(item);
 }
 for(const m of marks){
  const item=document.createElement('div');item.className='mind-mark';
  item.append(mindText('p',mt(m.kind)+' · '+m.topic,'mind-subject'),mindText('blockquote',m.excerpt));
  if(!activeMark(w,m))item.append(mindText('p',mt('stale'),'quiet'));
  item.append(mindButton(mt('remove'),()=>{if(phase!=='private'||current()!==w)return;w.mind={...w.mind,marks:w.mind.marks.filter(x=>x.id!==m.id)};renderMind();$('mind-mark').focus()}));
  markRoot.append(item)
 }
 for(const link of result.links){
  const item=document.createElement('article');item.className='mind-link';
  const material=document.createElement('div');material.className='mind-material';
  for(const m of [link.local,link.other]){
   const piece=document.createElement('div');piece.className='mind-piece '+m.kind;
   piece.append(mindText('p',mt(m.kind)+' · '+m.topic,'mind-subject'),mindText('blockquote',m.excerpt));
   material.append(piece)
  }
  const why=document.createElement('details');why.className='mind-why';why.append(mindText('summary',ew('why')),mindText('p',ew('whyNote'),'quiet'));
  item.append(mindText('p',ew('label'),'mind-hypothesis'),mindText('h3',mt('related')),material,why);
  const actions=document.createElement('div');actions.className='actions';
  actions.append(mindButton(mt('open'),()=>switchWork(link.workId)),mindButton(mt('reject'),()=>{if(phase!=='private'||current()!==w)return;try{w.mind=dismiss(w,link.key);renderMind();mindStatus('dismissed');$('mind-mark').focus()}catch{mindStatus('full')}}));
  actions.append(mindButton(pt('explore'),()=>{
   if(phase!=='private'||current()!==w)return;
   if(possibilityDraft&&possibilityDraft.key!==link.key&&possibilityDraft.text.trim()&&!confirm(pt('discard')))return;
   if(!possibilityDraft||possibilityDraft.key!==link.key)possibilityDraft={work:w.id,key:link.key,text:''};
   mindOpen=true;renderMind();$('possibility-draft')?.focus();
  }));
  item.append(actions);
  if(possibilityDraft?.key===link.key){
   const editor=document.createElement('div');editor.className='possibility-editor';
   const label=mindText('label',pt('prompt'));label.htmlFor='possibility-draft';
   const input=document.createElement('textarea');input.id='possibility-draft';input.maxLength=12000;input.rows=3;input.dir='auto';input.value=possibilityDraft.text;
   const keep=mindButton(pt('keep'),()=>{
    if(phase!=='private'||current()!==w||possibilityDraft?.key!==link.key||!input.value.trim())return;
    if(works.length>=100){status('limit');return}
    const live=correspondences(works,w.id).links.find(l=>l.key===link.key);if(!live){renderMind();return}
    const body=input.value,child={id:crypto.randomUUID(),title:titleFor(body),body,idea:'',ideaOpen:false,parent:w.id,basis:captureBasis(w.id,live)};
    works.push(child);possibilityDraft=null;renderMind();renderFormation();
    const open=mindButton(pt('source'),()=>switchWork(child.id));
    $('status').textContent=pt('created');open.textContent=child.title;open.className='possibility-open';$('status').append(' ',open);
   },'accent');
   keep.disabled=!input.value.trim();input.oninput=()=>{possibilityDraft.text=input.value;keep.disabled=!input.value.trim()};
   editor.append(label,input,keep,mindButton(pt('cancel'),()=>{possibilityDraft=null;renderMind();$('mind-reveal').focus()}));
   item.append(editor);
  }
  linkRoot.append(item)
 }
 document.body.dataset.correspondence=result.links.length?'present':echoes.length?'echo':'none';
}
function renderBasis(w){
 const root=$('basis-pieces');root.replaceChildren();
 $('possibility-basis').hidden=!w?.basis;
 $('basis-title').textContent=pt('basis');$('basis-note').textContent=pt('basisNote');
 if(!w?.basis)return;
 for(const p of w.basis){
  const piece=document.createElement('div');piece.className='mind-piece '+p.mark.kind;
  piece.append(mindText('p',mt(p.mark.kind)+' · '+p.mark.topic,'mind-subject'),mindText('blockquote',p.mark.excerpt));
  const source=works.find(x=>x.id===p.workId);
  if(source)piece.append(mindButton(pt('source'),()=>switchWork(source.id)));else piece.append(mindText('p',pt('missing'),'quiet'));
  root.append(piece);
 }
}
$('mind-reveal').onclick=()=>{mindOpen=!mindOpen;renderMind();if(mindOpen&&!$('mind').hidden){$('mind').scrollIntoView({block:'start',behavior:'instant'});$('mind-close').focus({preventScroll:true})}};
$('mind-close').onclick=()=>{mindOpen=false;renderMind();$('mind-reveal').focus()};
$('mind-mark').onclick=()=>{
 const w=current(),editor=$('thought');if(phase!=='private'||!w||forming||minding)return;
 if((w.mind?.marks.length??0)>=MAX_MARKS){mindStatus('full');return}
 let fragment;try{fragment=captureFragment(w,editor.selectionStart,editor.selectionEnd)}catch{mindStatus('invalid');return}
 if(!fragment||fragment.excerpt.length>1200){mindStatus('invalid');return}
 minding={fragment,kind:null,topic:'',counterpart:''};mindOpen=true;status(null);presence();$('mind-need').focus();$('mind-compose').scrollIntoView({block:'nearest',behavior:'instant'})
};
function updateMindComposer(){
 const choice=minding?.kind,topic=minding?.topic??'',other=minding?.counterpart??'';
 $('mind-need').setAttribute('aria-pressed',String(choice==='need'));
 $('mind-ability').setAttribute('aria-pressed',String(choice==='ability'));
 $('mind-counterpart-label').textContent=ct(choice==='ability'?'otherAbility':'otherNeed');
 $('mind-counterpart').disabled=!choice;
 $('mind-keep').textContent=ct(other.trim()?'connect':'keep');
 $('mind-keep').disabled=!choice||!topic.trim();
 $('mind-next').textContent=choice?(topic.trim()?ct(other.trim()?'ready':'waiting'):ct('enter')):ct('choose');
}
$('mind-topic').oninput=()=>{if(minding){minding.topic=$('mind-topic').value;updateMindComposer()}};
$('mind-counterpart').oninput=()=>{if(minding){minding.counterpart=$('mind-counterpart').value;updateMindComposer()}};
$('mind-need').onclick=()=>{if(minding){minding.kind='need';updateMindComposer()}};
$('mind-ability').onclick=()=>{if(minding){minding.kind='ability';updateMindComposer()}};
$('mind-cancel').onclick=()=>{minding=null;presence();$('thought').focus()};
$('mind-keep').onclick=()=>{
 const w=current();if(phase!=='private'||!w||!minding||minding.fragment.sourceId!==w.id)return;
 const f=minding.fragment;if(w.body.slice(f.start,f.end)!==f.excerpt){mindStatus('changed');return}
 const mind=w.mind??emptyMind();if(mind.marks.length>=MAX_MARKS){mindStatus('full');return}
 let mark,child;
 try{
  mark=makeMark({id:crypto.randomUUID(),kind:minding.kind,topic:minding.topic,fragment:f});
  const body=minding.counterpart;
  if(body.trim()){
   if(works.length>=100){status('limit');return}
   const id=crypto.randomUUID();
   const otherMark=makeMark({id:crypto.randomUUID(),kind:mark.kind==='need'?'ability':'need',topic:mark.topic,fragment:{start:0,end:body.length,excerpt:body}});
   child={id,title:titleFor(body),body,idea:'',ideaOpen:false,parent:null,mind:{marks:[otherMark],dismissed:[]}};
  }
 }catch{mindStatus('invalid');return}
 w.mind={...mind,marks:[...mind.marks,mark]};if(child)works.push(child);
 minding=null;mindOpen=true;presence();
 if(child){$('status').textContent=ct('created');$('mind-links').scrollIntoView({block:'nearest',behavior:'instant'});$('mind-links').querySelector('button')?.focus({preventScroll:true})}
 else{mindStatus('saved');$('mind-empty').scrollIntoView({block:'nearest',behavior:'instant'});$('mind-reveal').focus({preventScroll:true})}
};

function captureDraft(){if(!offer||phase!=='prepare')return;offer.draft=$('excerpt').value;offer.recipient=$('recipient').value;offer.masked=$('masked').checked;offer.sender=$('person-name').value}
function canCast(){return !!(offer&&(offer.draft.trim()||offer.voice)&&offer.recipient.trim()&&(offer.masked||offer.sender.trim()))}
function preparationUI(){captureDraft();$('person-name').hidden=$('masked').checked;$('person-label').hidden=$('masked').checked;$('destination-name').textContent=offer.recipient.trim()||t('target');$('cast').disabled=!canCast();$('grip').disabled=!canCast();$('export-idea').disabled=!canCast()||!!offer.voice;$('release-field').disabled=!(offer.draft.trim()||offer.voice)||(!offer.masked&&!offer.sender.trim());$('destination').classList.toggle('ready',canCast())}
for(const id of ['excerpt','recipient','masked','person-name'])$(id).addEventListener('input',()=>{if(phase==='prepare')preparationUI()});
function animate(kind){const obj=$('idea-object');obj.classList.remove('arrive','return');void obj.offsetWidth;obj.classList.add(kind);obj.addEventListener('animationend',()=>obj.classList.remove(kind),{once:true})}
function setPhase(next,move){
 if(phase==='private'&&next!=='private'){voiceSurface.stopLive();if(voiceBusy())voice.cancel();if(voiceURL)$('clip').pause()}
 if(phase==='prepare')captureDraft();
 if(phase==='recipient'&&offer)offer.replyDraft=$('reply').value;
 if(phase==='meeting'&&offer)offer.common=$('common').value;
 phase=next;render();if(move)animate(move);
 const focus=next==='private'?(fieldOpen?'field-close':'thought'):next==='prepare'?'excerpt':next==='recipient'?'reply':next==='meeting'?'common':'back-private';$(focus).focus({preventScroll:true});
 if(next!=='private')window.scrollTo({top:0,behavior:'instant'});
}
function exportPacket(packet){
 const blob=new Blob([serializePacket(packet)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='telefshen-'+packet.kind+'-'+packet.id.slice(0,8)+'.telefshen';
 document.body.append(a);try{a.click()}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
}
$('export-idea').onclick=()=>{
 if(phase!=='prepare')return;captureDraft();if(!canCast()||offer.voice)return;
 try{
  const idea=makeIdea({id:crypto.randomUUID(),token:crypto.randomUUID(),text:offer.draft,recipient:offer.recipient.trim(),sender:offer.masked?null:offer.sender.trim()});
  const records=vault();if(records.length>=24)throw new Error('Return vault full');
  serializePacket(idea);
  localStorage.setItem(VAULT_KEY,JSON.stringify([...records,{idea,sourceId:offer.work}]));
  exportPacket(idea);es('out');
 }catch{es('limit')}
};
$('open-encounter').onclick=()=>{if(phase==='private')$('encounter-file').click()};
$('encounter-file').onchange=async()=>{
 const file=$('encounter-file').files?.[0];$('encounter-file').value='';
 if(!file||phase!=='private')return;
 const activeAtRead=active,offerAtRead=offer,formingAtRead=forming,mindingAtRead=minding,possibilityAtRead=possibilityDraft;
 let packet,record;
 try{
  if(file.size>MAX_PACKET_BYTES)throw new RangeError();
  packet=parsePacket(await file.text());
  if(packet.kind==='reply'){record=matchReply(packet,vault());if(!record){es('unmatched');return}}
 }catch{es('invalid');return}
 if(phase!=='private'||active!==activeAtRead||offer!==offerAtRead||forming!==formingAtRead||minding!==mindingAtRead||possibilityDraft!==possibilityAtRead)return;
 if((offer||forming||minding||possibilityDraft)&&!confirm(et('replace')))return;
 const idea=packet.kind==='idea'?packet:record.idea;
 forming=null;minding=null;possibilityDraft=null;mindOpen=false;
 offer={id:idea.id,work:active,sourceWork:record?.sourceId??null,draft:idea.text,recipient:idea.recipient,masked:idea.sender===null,sender:idea.sender??'',exposed:idea.text,replyDraft:'',reply:packet.kind==='reply'?packet.text:null,invited:packet.kind==='reply'&&packet.outcome==='invite',declined:packet.kind==='reply'&&packet.outcome==='decline',common:'',accepted:false,portable:packet.kind==='idea'?'incoming':'returned',packet:idea};
 offer.resume=packet.kind==='idea'?'recipient':'returned';
 $('idea-object').dataset.idea=offer.id;status(null);setPhase(offer.resume,packet.kind==='idea'?'arrive':'return');
};
function portableLabels(){
 $('open-encounter').textContent=et('open');
 $('export-idea').textContent=et('export');
 $('portable-note').textContent=et('exportNote');
 $('portable-keep').textContent=et('keep');
 $('memory-note').textContent=t('memoryNote')+' '+et('vault');
}
function portableReply(invite,decline){
 const reply=$('reply').value;
 if(!decline&&!reply.trim()){status('replyNeed');return}
 try{const packet=makeReply(offer.packet,decline?'decline':invite?'invite':'contribution',reply);exportPacket(packet);es('replyOut')}catch{es('invalid')}
}
$('portable-keep').onclick=()=>{
 if(phase!=='returned'||offer?.portable!=='returned'||offer.declined)return;
 if(works.length>=100){status('limit');return}
 const body=t('jointA')+'\n'+offer.exposed+'\n\n'+t('jointB')+'\n'+offer.reply;
 if(body.length>12000){es('keepLimit');return}
 if((voice.snapshot().clip||voiceBusy())&&!confirm(t('confirmClip')))return;
 const parent=works.some(w=>w.id===offer.sourceWork)?offer.sourceWork:null;
 const birth=birthOf('file-reply',offer);if(!validBirth(birth)){es('invalid');return}
 const w={id:crypto.randomUUID(),title:titleFor(offer.exposed),body,idea:'',ideaOpen:false,parent,birth};
 works.push(w);discardVoice();active=w.id;offer=null;phase='private';fieldOpen=false;render();es('kept');$('thought').focus()
};
function displaySender(){return offer?.masked?t('anonymous'):offer?.sender||t('anonymous')}
// Cinematic language follows explicit human actions, never invents a remote person.
const encounterSceneWords={
 ar:{
  prepare:['١ / العبور','ما الذي تريد أن يغادر منك؟','اختر الجزء الذي تريد إظهاره والوجهة والاسم الظاهر. الأصل يبقى في مساحتك.'],
  recipient:['٢ / الاستقبال','شيء بين عالمين','انظر إلى الفكرة كما يراها الطرف الآخر في هذه المعاينة. يمكنك إضافة شيء أو اختيار عدم المتابعة.'],
  incoming:['٢ / الاستقبال','شيء وصل إليك','اقرأ ما اختار صاحبه مشاركته في الملف. أنت من يقرر إن كان يستحق إضافة أو لقاءً.'],
  returned:['٣ / الرجوع','عاد إليك أثر','هذه مساهمة جديدة، لا تعديل على كلماتك. يمكنك اختيار الاستمرار وحدك.'],
  returnedFile:['٣ / الرجوع','عاد إليك أثر','وصل الرد بملف فتحته بنفسك. يمكنك الاحتفاظ بالمساهمتين، ولا يوجد لقاء حي هنا.'],
  declined:['٣ / الرجوع','اختار الطرف الآخر ألا يكمل','عدم المتابعة قرار قائم بذاته. تظل فكرتك لك، ولا يتكوّن لقاء.'],
  meeting:['٤ / ما بينكما','شيء لم يكن موجودًا','الفكرة والإضافة تظلان مستقلتين. هنا تبدأ مساحة ثالثة لما يمكن أن تصنعاه معًا في المعاينة.'],
  reply:'ما الذي تستطيع أن تضيفه؟',local:'معاينة محلية · أنت تؤدي الدورين',file:'تبادل بالملف · لا اتصال حي'
 },
 en:{
  prepare:['01 / Crossing','What do you want to let leave?','Choose the passage, its destination and your display name. The original stays in your space.'],
  recipient:['02 / Receiving','Something between two worlds','See the idea from the other role in this review. Add something or choose not to continue.'],
  incoming:['02 / Receiving','Something has reached you','Read what its author chose to share in the file. You decide whether to contribute or propose a meeting.'],
  returned:['03 / Return','A trace has returned','This is a new contribution, not a change to your words. You can choose to continue alone.'],
  returnedFile:['03 / Return','A trace has returned','You opened a reply file. You may retain both contributions; no live meeting is available here.'],
  declined:['03 / Return','The other role chose not to continue','Not continuing is a decision in its own right. Your idea remains yours; no meeting forms.'],
  meeting:['04 / In between','Something that did not exist','The idea and the reply remain distinct. A third space is here for what the two roles could make in this review.'],
  reply:'What could you contribute?',local:'Local review · you play both roles',file:'File exchange · no live connection'
 }
};
function narrateEncounter(){
 const words=encounterSceneWords[lang];
 const key=phase==='recipient'&&offer.portable==='incoming'?'incoming':phase==='returned'&&offer.declined?'declined':phase==='returned'&&offer.portable==='returned'?'returnedFile':phase;
 const [stage,title,intro]=words[key];
 $('exchange-stage').textContent=stage+' · '+(offer.portable?words.file:words.local);
 $('exchange-label').textContent=title;
 $('exchange-intro').textContent=intro;
 $('reply-prompt').textContent=words.reply;
 document.body.dataset.encounterOutcome=offer.declined?'declined':offer.reply?'contribution':'open';
}
function render(){
 document.body.dataset.phase=phase;document.body.dataset.transport=phase==='private'?'none':offer?.portable?'file':'review';
 $('open-encounter').hidden=phase!=='private';
 $('private').hidden=phase!=='private';$('exchange').hidden=phase==='private';
 portableLabels();renderField();
 if(phase==='private'){syncExchangeVoice(null);delete document.body.dataset.encounterOutcome;loadPrivate();return}
 renderFormation();renderMind();renderWorkLife(null);renderFieldHistory(null);renderReality(null);
 if(!offer){phase='private';render();return}
 const prep=phase==='prepare',receiver=phase==='recipient',returned=phase==='returned',meet=phase==='meeting';
 $('exchange-label').textContent=t(prep?'prepareLabel':receiver?'receive':returned?'returned':'meet');
 $('idea-origin').textContent=prep?t('origin'):t('from')+' '+displaySender()+'  ·  '+t('to')+' '+offer.recipient;
 $('object-mark').textContent=t('mark');$('excerpt').hidden=!prep;$('carried-text').hidden=prep;$('grip').hidden=!prep;
 $('preparation').hidden=!prep;$('reception').hidden=!receiver;$('answer').hidden=!(returned||meet);$('return-actions').hidden=!returned;$('meeting').hidden=!meet;
 $('accept').hidden=!offer.invited||!!offer.portable;
 $('portable-keep').hidden=!(returned&&offer.portable==='returned'&&!offer.declined);
 $('portable-context').hidden=!offer.portable;
 $('portable-context').textContent=offer.portable==='incoming'?et('incomingNote'):offer.portable==='returned'?et('returnedNote')+(offer.invited?' '+et('proposal'):''):'';
 $('reply-only').textContent=offer.portable?et('replyOnly'):t('replyOnly');
 $('reply-meet').textContent=offer.portable?et('replyMeet'):t('replyMeet');
 $('decline').textContent=offer.portable?et('decline'):t('decline');
 $('answer-origin').textContent=offer.portable?et('response'):t('answer');
 $('back-private').textContent=offer.portable?et('leave'):t('back');
 $('exchange-note').textContent=offer.portable?et('review'):t('exchangeNote');
 $('cancel').textContent=offer.portable?et('leave'):t(prep?'cancel':'exit');
 if(offer.portable){$('object-mark').textContent=et('mark')}
 narrateEncounter();syncExchangeVoice(offer.voice||null);
 $('release-field').textContent=fw('release');$('release-note').textContent=fw('releaseNote');$('excerpt').placeholder=offer.voice?fw('caption'):'';
 if(offer.voice&&prep)$('exchange-intro').textContent=fw('voiceIntro');
 if(prep){$('excerpt').value=offer.draft;$('recipient').value=offer.recipient;$('masked').checked=offer.masked;$('person-name').value=offer.sender;preparationUI()}
 else{$('carried-text').textContent=offer.exposed||'';$('excerpt').value='';$('recipient').value='';$('person-name').value='';$('reply').value=receiver?offer.replyDraft||'':'';$('answer-text').textContent=offer.declined?(offer.portable?et('declined'):t('declined')):offer.reply||'';$('common').value=meet?offer.common||'':''}
 // Remove hidden private input values from the receiving view; memory itself
 // remains in this local tab. This is not an authenticated access boundary.
 $('thought').value='';$('name').value='';$('prior-text').value='';
}
$('prepare').onclick=()=>{const w=current(),all=$('thought').value,selection=all.slice($('thought').selectionStart,$('thought').selectionEnd);if(forming||minding)return;if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;if(!w||!all.trim()){status('emptyThought');return}const excerpt=selection.trim()?selection:all;if(excerpt.length>6000){es('long');return}if(offer&&!confirm(t('confirmEnd')))return;possibilityDraft=null;mindOpen=false;offer={id:crypto.randomUUID(),work:w.id,draft:excerpt,recipient:'',masked:true,sender:'',exposed:null,replyDraft:'',reply:null,invited:false,declined:false,common:'',accepted:false};$('idea-object').dataset.idea=offer.id;status(null);setPhase('prepare')};
$('cast-voice').onclick=()=>{if(phase!=='private'||voiceBusy()||!voice.snapshot().clip||forming||minding)return;if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;if(offer&&!confirm(t('confirmEnd')))return;possibilityDraft=null;mindOpen=false;offer={id:crypto.randomUUID(),work:active,draft:'',recipient:'',masked:true,sender:'',exposed:null,voice:voice.snapshot().clip,replyDraft:'',reply:null,invited:false,declined:false,common:'',accepted:false};$('idea-object').dataset.idea=offer.id;status(null);setPhase('prepare')};
function cast(){if(phase!=='prepare')return;captureDraft();if(!canCast()){status('need');return}offer.exposed=offer.draft;offer.recipient=offer.recipient.trim();offer.sender=offer.masked?'':offer.sender.trim();offer.resume='recipient';setPhase('recipient','arrive');status('localOnly')}
$('cast').onclick=cast;$('grip').onclick=e=>{if(e.detail===0)cast()};
let drag=null;const grip=$('grip'),obj=$('idea-object');
grip.addEventListener('pointerdown',e=>{if(e.button!==0||!canCast())return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};grip.setPointerCapture(e.pointerId)});
grip.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;obj.style.transform='translate('+Math.max(-190,Math.min(190,e.clientX-drag.x))+'px,'+Math.max(-150,Math.min(150,e.clientY-drag.y))+'px)'});
function dragEnd(e,commit){if(!drag||drag.id!==e.pointerId)return;const target=$('destination').getBoundingClientRect(),distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y),hit=e.clientX>=target.left-30&&e.clientX<=target.right+30&&e.clientY>=target.top-28&&e.clientY<=target.bottom+28;drag=null;obj.style.transform='';if(commit&&distance>28&&hit)cast()}
grip.addEventListener('pointerup',e=>dragEnd(e,true));grip.addEventListener('pointercancel',e=>dragEnd(e,false));grip.addEventListener('lostpointercapture',e=>dragEnd(e,false));
function returnIdea(invite,decline){if(phase!=='recipient')return;if(offer.portable==='incoming'){portableReply(invite,decline);return}const reply=$('reply').value;if(!decline&&!reply.trim()){status('replyNeed');return}offer.reply=decline?'':reply;offer.invited=invite&&!decline;offer.declined=decline;offer.resume='returned';setPhase('returned','return');status('localOnly')}
$('reply-only').onclick=()=>returnIdea(false,false);$('reply-meet').onclick=()=>returnIdea(true,false);$('decline').onclick=()=>returnIdea(false,true);
$('accept').onclick=()=>{if(phase!=='returned'||!offer?.invited||offer.portable)return;offer.accepted=true;offer.resume='meeting';setPhase('meeting');status(null)};
function goPrivate(){if(offer)offer.resume=phase;setPhase('private');status(null)}
$('back-private').onclick=goPrivate;$('leave').onclick=goPrivate;$('resume').onclick=()=>{if(!forming&&!minding&&offer&&offer.work===active){if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;possibilityDraft=null;mindOpen=false;setPhase(offer.resume||'prepare')}};
$('cancel').onclick=()=>{if(offer?.portable){goPrivate();return}if(phase==='prepare'){offer=null;phase='private';render();$('thought').focus();return}if(confirm(t('confirmEnd'))){const prev=offer.work;offer=null;active=prev;phase='private';render();status(null);$('thought').focus()}};
$('keep').onclick=()=>{if(phase!=='meeting'||!offer?.accepted)return;const common=$('common').value;if(!common.trim()){status('commonNeed');return}if(works.length>=100){status('limit');return}const birth=birthOf(offer.voice?'local-voice-review':'local-review',offer,common);if(!validBirth(birth)){status('limit');return}const w={id:crypto.randomUUID(),title:titleFor(common),body:common,idea:'',ideaOpen:false,parent:offer.fieldId?offer.sourceWork:offer.work,birth};works.push(w);discardVoice();active=w.id;offer=null;phase='private';fieldOpen=false;render();status('newMade');$('thought').focus()};
function translate(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('locale').lang=lang==='ar'?'en':'ar';
 for(const [id,k] of Object.entries({mode:'mode',locale:'locale','private-label':'private','name-label':'name','thought-label':'thought','clear-clip':'clear','prepare-label':'prepare',resume:'resume',save:'save',recall:'recall','private-note':'privateNote','prior-label':'prior','prior-input-label':'prior','foot-note':'foot','excerpt-label':'thought','grip-label':'grip','recipient-label':'recipientLabel','masked-label':'mask','person-label':'person',cast:'cast','preview-note':'previewNote','reply-label':'reply','reply-only':'replyOnly','reply-meet':'replyMeet',decline:'decline','answer-origin':'answer',accept:'accept','back-private':'back','common-label':'common',keep:'keep',leave:'leave','meeting-note':'meetingNote','exchange-note':'exchangeNote','memory-title':'memory','close-memory':'close','find-label':'find','new-work':'new',forget:'forget','memory-note':'memoryNote'}))put(id,k);
 for(const [id,k] of Object.entries({thought:'thought',name:'name',recipient:'recipientHint','person-name':'person',reply:'reply',common:'commonHint',find:'find'}))$(id).placeholder=t(k);
 for(const [element,key] of Object.entries({'presence-kicker':'kicker','arrival-note':'arrival','gesture-title':'gesture','prepare-label':'cast','form-gesture-note':'formNote','mind-gesture-note':'mindNote','cast-gesture-note':'castNote'}))$(element).textContent=st(key);
 $('thought').placeholder=st('write');
 micUI();renderFormation();renderMind();portableLabels();
}
$('locale').onclick=()=>{if(phase==='prepare')captureDraft();if(phase==='recipient'&&offer)offer.replyDraft=$('reply').value;if(phase==='meeting'&&offer)offer.common=$('common').value;lang=lang==='ar'?'en':'ar';translate();render();status(null)};
translate();render();
// Older engines without field-sizing still grow the original native editor.
// No clone, contenteditable mirror or internal scroll viewport.
function resizeThought(){
 const editor=$('thought');
 if(CSS.supports('field-sizing','content')||editor.getClientRects().length===0)return;
 editor.style.height='auto';editor.style.height=editor.scrollHeight+'px';
}
window.addEventListener('resize',resizeThought);
if(document.fonts?.ready)document.fonts.ready.then(resizeThought);
resizeThought();
/* The law is now used by the real scene. Layout remains native HTML. */
const presenceSVG=$('presence-material').querySelector('svg');
const presenceNarrow=matchMedia('(max-width:760px)');
const presenceMotion=matchMedia('(prefers-reduced-motion:reduce)');
function expressLight(){
 const focused=document.activeElement;
 const law=composePresence({phase:document.body.dataset.phase,focus:focused?.id||'none',narrow:presenceNarrow.matches,reducedMotion:presenceMotion.matches,capture:document.body.dataset.capture||'idle',expression:document.body.dataset.expression||'none'});
 if(!law){document.body.dataset.attention='rest';return}
 presenceSVG.setAttribute('viewBox',law.frame);
 document.body.dataset.attention=law.attention;
 document.body.dataset.material=law.material;
 document.body.dataset.scene=law.scene;
}
presenceNarrow.addEventListener('change',expressLight);
presenceMotion.addEventListener('change',expressLight);
new MutationObserver(expressLight).observe(document.body,{attributes:true,attributeFilter:['data-phase','data-capture','data-expression']});
document.addEventListener('focusin',expressLight);
document.addEventListener('focusout',()=>queueMicrotask(expressLight));
expressLight();


/* CONTINUUM: an optional original sonic gesture, not a soundtrack or simulated human. */
const soundToggle=$('sound-world');
let worldSound=null,soundEnabled=false,soundRevision=0,voices=new Set(),lastScore='';
function soundLabel(){
 soundToggle.textContent=lang==='ar'?(soundEnabled?'صوت العالم · يعمل':'صوت العالم · صامت'):(soundEnabled?'World sound · on':'World sound · silent');
 soundToggle.setAttribute('aria-pressed',String(soundEnabled));
}
function silenceScore(){
 for(const node of voices){try{node.stop()}catch{}}
 voices.clear()
}
function scoreScene(){
 const d=document.body.dataset;
 if(d.phase==='prepare')return 'crossing';
 if(d.phase==='recipient')return 'receipt';
 if(d.phase==='returned')return d.encounterOutcome==='declined'?'refusal':'return';
 if(d.phase==='meeting')return 'meeting';
 if(d.humanField==='open')return 'field';
 if(d.reality==='open')return 'reality';
 if(d.forming==='yes')return 'formation';
 if(!$('mind').hidden&&d.correspondence==='present')return 'discovery';
 if(d.workLife==='born')return 'born';
 return 'presence';
}
const scoreNotes={presence:[196,293.66],crossing:[196,261.63,293.66],receipt:[220,329.63],return:[293.66,246.94],refusal:[196],meeting:[196,246.94,293.66],field:[174.61,261.63,349.23],reality:[196,207.65],formation:[196,261.63],discovery:[261.63,392],born:[196,293.66,392]};
function playScore(scene){
 if(!soundEnabled||!worldSound||worldSound.state!=='running'||voiceBusy()||!$('clip').paused||!$('exchange-audio').paused||document.hidden)return;
 silenceScore();
 for(const [i,hz] of (scoreNotes[scene]||[]).entries()){
  try{
   const oscillator=worldSound.createOscillator(),gain=worldSound.createGain(),at=worldSound.currentTime+.02+i*.08;
   oscillator.type='sine';oscillator.frequency.value=hz;
   gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(.018,at+.09);gain.gain.exponentialRampToValueAtTime(.0001,at+.62);
   oscillator.connect(gain);gain.connect(worldSound.destination);voices.add(oscillator);
   oscillator.onended=()=>{voices.delete(oscillator);oscillator.disconnect();gain.disconnect()};
   oscillator.start(at);oscillator.stop(at+.65)
  }catch{silenceScore();break}
 }
}
function updateScore(){
 const next=scoreScene();
 if(voiceBusy()||!$('clip').paused||!$('exchange-audio').paused){silenceScore();lastScore=next;return}
 if(next!==lastScore){lastScore=next;playScore(next)}
}
soundToggle.onclick=async()=>{
 const token=++soundRevision;
 if(soundEnabled){soundEnabled=false;silenceScore();soundLabel();return}
 try{
  const C=window.AudioContext||window.webkitAudioContext;if(!C)throw Error();
  worldSound??=new C();
  await worldSound.resume();if(token!==soundRevision)return;
  soundEnabled=worldSound.state==='running';lastScore=scoreScene();soundLabel();if(soundEnabled)playScore(lastScore)
 }catch{soundEnabled=false;soundLabel()}
};
$('locale').addEventListener('click',soundLabel);
for(const id of ['clip','exchange-audio'])$(id).addEventListener('play',silenceScore);
document.addEventListener('visibilitychange',()=>{if(document.hidden)silenceScore()});
window.addEventListener('pagehide',()=>{soundEnabled=false;silenceScore();soundLabel();if(worldSound)worldSound.suspend().catch(()=>{})});
new MutationObserver(updateScore).observe(document.body,{attributes:true,attributeFilter:['data-phase','data-human-field','data-reality','data-forming','data-correspondence','data-work-life','data-capture','data-encounter-outcome']});
new MutationObserver(updateScore).observe($('mind'),{attributes:true,attributeFilter:['hidden']});
soundLabel();lastScore=scoreScene();

// THE WORLD IS ALIVE: only visible, deliberate acts can shape the material.
attachLivingMaterial({document,matchMedia:window.matchMedia.bind(window),read:()=>{
 const d=document.body.dataset,privateSpace=d.phase==='private',opened=privateSpace&&d.humanField==='open';
 const ink=privateSpace&&!opened?$(d.capture==='recording'?'world-live-ink':'world-recorded-ink').getAttribute('d')||'':'';
 const visibleText=id=>{const el=$(id);return el&&!el.closest('[hidden]')?(el.value??el.textContent??'').trim().length:0};
 return {phase:d.phase,capture:d.capture,length:opened?0:privateSpace?visibleText('thought'):visibleText('carried-text')||visibleText('excerpt'),peaks:inkPeaks(ink),
 field:opened,count:opened?document.querySelectorAll('#human-field .field-material').length:0,
 selected:opened?document.querySelectorAll('#human-field .field-pick[aria-pressed="true"]').length:0,
 formation:d.forming==='yes',related:!$('mind').hidden&&d.correspondence==='present',
 born:d.workLife==='born',reality:d.reality==='open'?d.realityReading||'unread':'',
 outcome:d.encounterOutcome,otherLength:privateSpace?0:visibleText('answer-text')||visibleText('reply'),commonLength:d.phase==='meeting'?visibleText('common'):0};
}});
