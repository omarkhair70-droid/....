'use strict';
import {composePresence,expressionState} from './presence-law.mjs';
import {createVoiceCapture} from './voice-capture.mjs';
import {createLocalDictation} from './local-dictation.mjs';
import {createVoiceSurface} from './voice-surface.mjs';
import {captureFragment,validOrigin,formWork} from './formation.mjs';
import {VAULT_KEY,MAX_PACKET_BYTES,makeIdea,makeReply,parsePacket,serializePacket,parseVault,matchReply} from './encounter.mjs';
import {MAX_MARKS,emptyMind,validMind,makeMark,activeMark,correspondences,dismiss,validBasis,captureBasis} from './living-intelligence.mjs';
const $=id=>document.getElementById(id), KEY='one-world.local.v1';
const text={
 ar:{mode:'معاينة محلية',locale:'English',private:'هنا، لك',name:'اسم العمل',thought:'اكتب…',mic:'اتكلم',stop:'أنهِ التسجيل',requesting:'بانتظار إذن الميكروفون',cancelMic:'إلغاء الطلب',stopping:'لحظة، بنحتفظ بالتسجيل هنا',voiceLimit:'التسجيل تجاوز الحد المسموح. التسجيل السابق كما هو.',recording:'تسجيل محلي',ready:'التسجيل هنا على جهازك',noMic:'التسجيل غير متاح أو لم يُسمح به. تقدر تكتب.',clear:'امسح التسجيل',prepare:'ارمِ فكرة',resume:'استحضر اللقاء',save:'احتفظ هنا',recall:'استحضر',privateNote:'تقدر تكتب، أو تتكلم، أو تفضل ساكت.',prior:'تصوّر سابق',foot:'عالم قيد التشكّل · الكتابة والتسجيل على جهازك فقط',prepareLabel:'الفكرة قبل أن تغادر',recipientLabel:'إلى من؟',recipientHint:'شخص أو شركة',mask:'بدون إظهار اسمي',person:'الاسم الذي سيظهر',anonymous:'إنسان بلا اسم معلن',origin:'منك',object:'فكرة · من كتابتك',grip:'اسحب الفكرة نحو وجهتها',cast:'ارمها في المعاينة',target:'الوجهة',previewNote:'المستلم اسم تختاره للمعاينة فقط. النص الظاهر هو ما سيصل في التجربة؛ لا إرسال حقيقي ولا نقل للصوت.',receive:'منظور الطرف الآخر · أنت تؤدي الدور',returned:'رجعت لك الفكرة',meet:'المساحة بينكما · دورين محليين',cancel:'ارجع لمساحتك',exit:'أنه المعاينة',exchangeNote:'اختبار محلي بين دورين على نفس الجهاز، بلا أشخاص متصلين.',reply:'إيه اللي تحب تضيفه؟',replyOnly:'أعد الفكرة',replyMeet:'أعدها واقترح لقاءً',decline:'لا أريد المتابعة',declined:'اختار الطرف الآخر عدم المتابعة في المعاينة.',answer:'إضافة من الطرف الآخر في المعاينة',accept:'اقبل اللقاء',back:'استمر بمفردك',common:'ما الذي يمكن أن نصنعه معًا؟',commonHint:'اكتب ما أصبح ممكنًا بعد اللقاء…',keep:'احتفظ بالعمل الجديد هنا',leave:'ارجع لمساحتك',meetingNote:'النصان الأصليان باقيان. ما تكتبه هنا تأليف مشترك في المعاينة، وليس اتفاقًا.',memory:'استحضر شيئًا',close:'إغلاق',find:'ابحث في أعمالك المحلية',new:'مساحة لفكرة أخرى',forget:'امسح النسخ المحفوظة',memoryNote:'التخزين محلي، ليس حسابًا. اللقاءات والتسجيلات مؤقتة حتى تحفظ نص عملك.',empty:'لا توجد أعمال.',untitled:'فكرة بلا اسم',saved:'حُفظ النص على هذا الجهاز فقط.',failed:'تعذر الحفظ؛ النص لا يزال هنا.',need:'اكتب فكرة وحدد وجهة واسمًا ظاهرًا إن اخترته.',emptyThought:'اكتب شيئًا أولًا. التسجيل لا يتحول إلى نص تلقائيًا.',replyNeed:'اكتب إضافتك أولًا، أو اختر عدم المتابعة.',commonNeed:'اكتب ما تريد أن يصبح عملًا.',limit:'وصلت لحد الأعمال المحلية.',confirmForget:'امسح النسخ المحفوظة في هذا المتصفح؟',forgot:'أزيلت النسخ المحفوظة. ما في الذاكرة الحالية لا يزال هنا.',confirmEnd:'إنهاء هذه المعاينة؟ سيبقى عملك الأصلي.',confirmClip:'التسجيل محلي ومؤقت. امسحه قبل الانتقال إلى عمل آخر؟',localOnly:'لم يحدث إرسال حقيقي.',newMade:'نشأ عمل محلي جديد؛ الأصل محفوظ في الذاكرة.',mark:'معاينة لا إرسال',from:'من',to:'إلى',jointA:'الفكرة الأصلية',jointB:'إضافة الطرف الثاني',jointC:'العمل المتكوّن'},
 en:{mode:'Local review',locale:'العربية',private:'Here, for you',name:'Work name',thought:'Write…',mic:'Speak',stop:'Finish recording',requesting:'Waiting for microphone access',cancelMic:'Cancel request',stopping:'Finishing your recording',voiceLimit:'Recording exceeded the limit. Your previous recording is unchanged.',recording:'Local recording',ready:'Your recording stays on your device',noMic:'Recording is unavailable or permission was denied. You can write.',clear:'Remove recording',prepare:'Cast an idea',resume:'Recall the encounter',save:'Keep here',recall:'Recall',privateNote:'Write, speak, or simply stay.',prior:'Earlier possibility',foot:'A world taking form · writing and recording stay on your device',prepareLabel:'Before the idea leaves',recipientLabel:'To whom?',recipientHint:'A person or company',mask:'Without displaying my name',person:'Name to display',anonymous:'A person without a displayed name',origin:'From you',object:'An idea · your words',grip:'Pull the idea toward its destination',cast:'Cast in review',target:'Destination',previewNote:'A destination chosen for local review only. The visible text is what the other role sees; no real delivery or audio transfer.',receive:'Recipient perspective · you play this role',returned:'The idea has returned',meet:'The space between you · two local roles',cancel:'Return to your space',exit:'End review',exchangeNote:'Two roles on the same device, without connected people.',reply:'What would you add?',replyOnly:'Return the idea',replyMeet:'Return and propose a meeting',decline:'Do not continue',declined:'The other role chose not to continue in this review.',answer:'Contribution from the other role',accept:'Accept the meeting',back:'Continue alone',common:'What could you make together?',commonHint:'Write what became possible after the encounter…',keep:'Keep the new work here',leave:'Return to your space',meetingNote:'Both original contributions remain. This is local coauthoring, not an agreement.',memory:'Recall something',close:'Close',find:'Search local work',new:'Space for another idea',forget:'Remove saved copies',memoryNote:'Local storage is not an account. Encounters and recordings are temporary unless you keep the written work.',empty:'No works yet.',untitled:'Untitled thought',saved:'Text saved on this device only.',failed:'Could not save; your text is still here.',need:'Enter an idea, a destination, and a displayed name if chosen.',emptyThought:'Write something first. Recording does not create a transcript automatically.',replyNeed:'Write a contribution first, or choose not to continue.',commonNeed:'Write what should become a work.',limit:'Local work limit reached.',confirmForget:'Remove saved copies from this browser?',forgot:'Saved copies removed. In-memory writing is still here.',confirmEnd:'End this review? Your original work will remain.',confirmClip:'Recording is temporary and local. Clear it before changing work?',localOnly:'Nothing was actually sent.',newMade:'A new local work exists; the original stays in memory.',mark:'Review, not delivery',from:'From',to:'To',jointA:'Original idea',jointB:'Other contribution',jointC:'Emerging work'}
};
let lang='ar',works=[],active=null,phase='private',offer=null;
const automaticTitles=new Set();
let forming=null,minding=null,mindOpen=false,possibilityDraft=null;
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
function valid(v){return v&&v.version===1&&['ar','en'].includes(v.lang)&&Array.isArray(v.works)&&v.works.length<=100&&new Set(v.works.map(w=>w?.id)).size===v.works.length&&v.works.every(w=>w&&str(w.id,80)&&str(w.title,240)&&w.title.trim()&&str(w.body,12000)&&str(w.idea,6000)&&typeof w.ideaOpen==='boolean'&&(w.parent===null||str(w.parent,80))&&(w.origin===undefined||validOrigin(w.origin,w.parent))&&(w.mind===undefined||validMind(w.mind))&&(w.basis===undefined||validBasis(w.basis,w.parent)))&&(v.active===null||v.works.some(w=>w.id===v.active))}
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=2400000){const v=JSON.parse(raw);if(valid(v)){lang=v.lang;works=v.works.map(w=>({id:w.id,title:w.title,body:w.body,idea:w.idea,ideaOpen:w.ideaOpen,parent:w.parent,...(w.origin?{origin:{sourceId:w.origin.sourceId,start:w.origin.start,end:w.origin.end,excerpt:w.origin.excerpt}}:{}),...(w.mind?{mind:{marks:w.mind.marks.map(m=>({id:m.id,kind:m.kind,topic:m.topic,start:m.start,end:m.end,excerpt:m.excerpt})),dismissed:[...w.mind.dismissed]}}:{}),...(w.basis?{basis:w.basis.map(p=>({workId:p.workId,mark:{id:p.mark.id,kind:p.mark.kind,topic:p.mark.topic,start:p.mark.start,end:p.mark.end,excerpt:p.mark.excerpt}}))}:{})}));active=v.active}}}catch{}
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
 $('save').hidden=!hasWork;
 $('recall').hidden=!works.length&&!hasVault();
 $('resume').hidden=!hasOffer||!!forming||!!minding;
 renderFormation();renderMind();
 resizeThought();
}
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
const voiceSurface=createVoiceSurface({audio:$('clip'),player:$('voice-player'),play:$('voice-play'),playLabel:$('voice-play-label'),playIcon:$('voice-play-icon'),position:$('voice-position'),positionLabel:$('voice-position-label'),time:$('voice-position-time'),recordedPath:$('recorded-voice-path'),liveInk:$('live-voice-ink'),livePath:$('live-voice-path'),status:$('voice-player-status'),translate:k=>soundWords[lang][k]});
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
 put('mic-label',state==='requesting'?'cancelMic':live?'stop':state==='stopping'?'stopping':'mic');
 $('voice-state').textContent=error?t(error):['requesting','recording','stopping','ready'].includes(state)?t(state):'';
 $('clear-clip').hidden=!voiceURL||voiceBusy();
 $('clip').hidden=!voiceURL||voiceBusy();
 voiceSurface.sync({visible:!!voiceURL&&!voiceBusy()});
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
$('clear-clip').onclick=()=>{voice.clear();dictation.reset()};
$('mic').onclick=()=>voice.toggle();
window.addEventListener('pagehide',discardVoice);
// Formation belongs to the private authoring surface, not the recipient form.
function renderFormation(){
 const w=current(),visible=phase==='private'&&!!forming&&forming.fragment.sourceId===active;
 $('formation').hidden=!visible;document.body.dataset.forming=visible?'yes':'no';
 $('form-fragment-label').textContent=ft('form');
 for(const [id,k] of Object.entries({'formation-title':'title','formation-source-label':'source','formation-draft-label':'draft','formation-keep':'keep','formation-cancel':'cancel','formation-note':'note','lineage-label':'lineage','origin-excerpt-label':'excerpt'}))$(id).textContent=ft(k);
 $('formation-quote').textContent=visible?forming.fragment.excerpt:'';
 const draft=visible?forming.text:'';
 if($('formation-draft').value!==draft)$('formation-draft').value=draft;
 $('formation-keep').disabled=!visible||!draft.trim();
 const children=phase==='private'&&w?works.filter(child=>child.parent===w.id&&!!child.origin):[];
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
  const hint=document.createElement('small');hint.textContent=ft('child');
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
function renderMind(){
 const w=phase==='private'?current():null,visible=!!w&&!!minding&&minding.fragment.sourceId===w.id;
 const marks=w?.mind?.marks??[],result=w?correspondences(works,w.id):{links:[],limited:false};
 for(const [element,k] of Object.entries({'mind-mark':'mark','mind-title':'title','mind-note':'note','mind-need-label':'need','mind-ability-label':'ability','mind-topic-label':'topic','mind-keep':'keep','mind-cancel':'cancel','mind-limit':'limit'}))$(element).textContent=mt(k);
 const signal=!!w&&(marks.length>0||result.links.length>0);
 $('world-periphery').hidden=!signal||visible;
 $('world-periphery').setAttribute('aria-label',pt('memory'));
 $('mind-signal').textContent=result.links.length?pt('signal'):pt('memory');
 $('mind-signal-detail').textContent=mindOpen?pt('close'):pt('hint');
 $('mind-reveal').setAttribute('aria-expanded',String(mindOpen));
 $('mind-close').textContent=pt('close');
 $('mind-close').hidden=visible;
 $('mind').hidden=!w||(!visible&&(!signal||!mindOpen));
 if(possibilityDraft&&(!w||possibilityDraft.work!==w.id||!result.links.some(l=>l.key===possibilityDraft.key)))possibilityDraft=null;
 renderBasis(w);
 $('mind-compose').hidden=!visible;$('mind-passage').textContent=visible?minding.fragment.excerpt:'';
 const input=$('mind-topic'),topic=visible?minding.topic:'';
 if(input.value!==topic)input.value=topic;
 $('mind-need').checked=!visible||minding.kind==='need';$('mind-ability').checked=visible&&minding.kind==='ability';
 $('mind-keep').disabled=!visible||!topic.trim();$('mind-limit').hidden=!result.limited;
 const markRoot=$('mind-marks'),linkRoot=$('mind-links');
 markRoot.replaceChildren();linkRoot.replaceChildren();
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
  item.append(mindText('h3',mt('related')),material,mindText('p',link.title,'quiet'));
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
    works.push(child);possibilityDraft=null;renderMind();
    const open=mindButton(pt('source'),()=>switchWork(child.id));
    $('status').textContent=pt('created');open.textContent=child.title;open.className='possibility-open';$('status').append(' ',open);
   },'accent');
   keep.disabled=!input.value.trim();input.oninput=()=>{possibilityDraft.text=input.value;keep.disabled=!input.value.trim()};
   editor.append(label,input,keep,mindButton(pt('cancel'),()=>{possibilityDraft=null;renderMind();$('mind-reveal').focus()}));
   item.append(editor);
  }
  linkRoot.append(item)
 }
 document.body.dataset.correspondence=result.links.length?'present':'none';
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
$('mind-reveal').onclick=()=>{mindOpen=!mindOpen;renderMind()};
$('mind-close').onclick=()=>{mindOpen=false;renderMind();$('mind-reveal').focus()};
$('mind-mark').onclick=()=>{
 const w=current(),editor=$('thought');if(phase!=='private'||!w||forming||minding)return;
 if((w.mind?.marks.length??0)>=MAX_MARKS){mindStatus('full');return}
 let fragment;try{fragment=captureFragment(w,editor.selectionStart,editor.selectionEnd)}catch{mindStatus('invalid');return}
 if(!fragment||fragment.excerpt.length>1200){mindStatus('invalid');return}
 minding={fragment,kind:'need',topic:''};mindOpen=true;presence();$('mind-topic').focus()
};
$('mind-topic').oninput=()=>{if(minding){minding.topic=$('mind-topic').value;$('mind-keep').disabled=!minding.topic.trim()}};
$('mind-need').onchange=()=>{if(minding)minding.kind='need'};
$('mind-ability').onchange=()=>{if(minding)minding.kind='ability'};
$('mind-cancel').onclick=()=>{minding=null;presence();$('thought').focus()};
$('mind-keep').onclick=()=>{
 const w=current();if(phase!=='private'||!w||!minding||minding.fragment.sourceId!==w.id)return;
 const f=minding.fragment;if(w.body.slice(f.start,f.end)!==f.excerpt){mindStatus('changed');return}
 const mind=w.mind??emptyMind();if(mind.marks.length>=MAX_MARKS){mindStatus('full');return}
 let mark;try{mark=makeMark({id:crypto.randomUUID(),kind:minding.kind,topic:minding.topic,fragment:f})}catch{mindStatus('invalid');return}
 w.mind={...mind,marks:[...mind.marks,mark]};minding=null;presence();mindStatus('saved');$('mind-mark').focus()
};

function captureDraft(){if(!offer||phase!=='prepare')return;offer.draft=$('excerpt').value;offer.recipient=$('recipient').value;offer.masked=$('masked').checked;offer.sender=$('person-name').value}
function canCast(){return !!(offer&&offer.draft.trim()&&offer.recipient.trim()&&(offer.masked||offer.sender.trim()))}
function preparationUI(){captureDraft();$('person-name').hidden=$('masked').checked;$('person-label').hidden=$('masked').checked;$('destination-name').textContent=offer.recipient.trim()||t('target');$('cast').disabled=!canCast();$('grip').disabled=!canCast();$('export-idea').disabled=!canCast();$('destination').classList.toggle('ready',canCast())}
for(const id of ['excerpt','recipient','masked','person-name'])$(id).addEventListener('input',()=>{if(phase==='prepare')preparationUI()});
function animate(kind){const obj=$('idea-object');obj.classList.remove('arrive','return');void obj.offsetWidth;obj.classList.add(kind);obj.addEventListener('animationend',()=>obj.classList.remove(kind),{once:true})}
function setPhase(next,move){
 if(phase==='private'&&next!=='private'){voiceSurface.stopLive();if(voiceBusy())voice.cancel();if(voiceURL)$('clip').pause()}
 if(phase==='prepare')captureDraft();
 if(phase==='recipient'&&offer)offer.replyDraft=$('reply').value;
 if(phase==='meeting'&&offer)offer.common=$('common').value;
 phase=next;render();if(move)animate(move);
 const focus=next==='private'?'thought':next==='prepare'?'excerpt':next==='recipient'?'reply':next==='meeting'?'common':'back-private';$(focus).focus({preventScroll:true});
}
function exportPacket(packet){
 const blob=new Blob([serializePacket(packet)],{type:'application/json'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='telefshen-'+packet.kind+'-'+packet.id.slice(0,8)+'.telefshen';
 document.body.append(a);try{a.click()}finally{a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000)}
}
$('export-idea').onclick=()=>{
 if(phase!=='prepare')return;captureDraft();if(!canCast())return;
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
 const w={id:crypto.randomUUID(),title:titleFor(offer.exposed),body,idea:'',ideaOpen:false,parent};
 works.push(w);discardVoice();active=w.id;offer=null;phase='private';render();es('kept');$('thought').focus()
};
function displaySender(){return offer?.masked?t('anonymous'):offer?.sender||t('anonymous')}
function render(){
 document.body.dataset.phase=phase;document.body.dataset.transport=phase==='private'?'none':offer?.portable?'file':'review';
 $('open-encounter').hidden=phase!=='private';
 $('private').hidden=phase!=='private';$('exchange').hidden=phase==='private';
 portableLabels();
 if(phase==='private'){loadPrivate();return}
 renderFormation();renderMind();
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
 if(offer.portable){$('exchange-label').textContent=receiver?et('incoming'):et('returned');$('object-mark').textContent=et('mark')}
 if(prep){$('excerpt').value=offer.draft;$('recipient').value=offer.recipient;$('masked').checked=offer.masked;$('person-name').value=offer.sender;preparationUI()}
 else{$('carried-text').textContent=offer.exposed||'';$('excerpt').value='';$('recipient').value='';$('person-name').value='';$('reply').value=receiver?offer.replyDraft||'':'';$('answer-text').textContent=offer.declined?(offer.portable?et('declined'):t('declined')):offer.reply||'';$('common').value=meet?offer.common||'':''}
 // Remove hidden private input values from the receiving view; memory itself
 // remains in this local tab. This is not an authenticated access boundary.
 $('thought').value='';$('name').value='';$('prior-text').value='';
}
$('prepare').onclick=()=>{const w=current(),all=$('thought').value,selection=all.slice($('thought').selectionStart,$('thought').selectionEnd);if(forming||minding)return;if(possibilityDraft?.text.trim()&&!confirm(pt('discard')))return;if(!w||!all.trim()){status('emptyThought');return}const excerpt=selection.trim()?selection:all;if(excerpt.length>6000){es('long');return}if(offer&&!confirm(t('confirmEnd')))return;possibilityDraft=null;mindOpen=false;offer={id:crypto.randomUUID(),work:w.id,draft:excerpt,recipient:'',masked:true,sender:'',exposed:null,replyDraft:'',reply:null,invited:false,declined:false,common:'',accepted:false};$('idea-object').dataset.idea=offer.id;status(null);setPhase('prepare')};
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
$('keep').onclick=()=>{if(phase!=='meeting'||!offer?.accepted)return;const common=$('common').value;if(!common.trim()){status('commonNeed');return}if(works.length>=100){status('limit');return}const body=t('jointA')+'\n'+offer.exposed+'\n\n'+t('jointB')+'\n'+offer.reply+'\n\n'+t('jointC')+'\n'+common;if(body.length>12000){status('limit');return}const w={id:crypto.randomUUID(),title:titleFor(common),body,idea:'',ideaOpen:false,parent:offer.work};works.push(w);discardVoice();active=w.id;offer=null;phase='private';render();status('newMade');$('thought').focus()};
function translate(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('locale').lang=lang==='ar'?'en':'ar';
 for(const [id,k] of Object.entries({mode:'mode',locale:'locale','private-label':'private','name-label':'name','thought-label':'thought','clear-clip':'clear',prepare:'prepare',resume:'resume',save:'save',recall:'recall','private-note':'privateNote','prior-label':'prior','prior-input-label':'prior','foot-note':'foot','excerpt-label':'thought','grip-label':'grip','recipient-label':'recipientLabel','masked-label':'mask','person-label':'person',cast:'cast','preview-note':'previewNote','reply-label':'reply','reply-only':'replyOnly','reply-meet':'replyMeet',decline:'decline','answer-origin':'answer',accept:'accept','back-private':'back','common-label':'common',keep:'keep',leave:'leave','meeting-note':'meetingNote','exchange-note':'exchangeNote','memory-title':'memory','close-memory':'close','find-label':'find','new-work':'new',forget:'forget','memory-note':'memoryNote'}))put(id,k);
 for(const [id,k] of Object.entries({thought:'thought',name:'name',recipient:'recipientHint','person-name':'person',reply:'reply',common:'commonHint',find:'find'}))$(id).placeholder=t(k);
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
