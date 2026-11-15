'use strict';
import {composePresence,expressionState} from './presence-law.mjs';
import {createVoiceCapture} from './voice-capture.mjs';
const $=id=>document.getElementById(id), KEY='one-world.local.v1';
const text={
 ar:{mode:'معاينة محلية',locale:'English',private:'هنا، لك',name:'اسم العمل',thought:'ما الذي يشغلك؟',mic:'اتكلم',stop:'أنهِ التسجيل',requesting:'بانتظار إذن الميكروفون',cancelMic:'إلغاء الطلب',stopping:'لحظة، بنحتفظ بالتسجيل هنا',voiceLimit:'التسجيل تجاوز الحد المسموح. التسجيل السابق كما هو.',recording:'تسجيل محلي',ready:'صوتك هنا فقط · لم يتحول إلى نص',noMic:'التسجيل غير متاح أو لم يُسمح به. تقدر تكتب.',clear:'امسح التسجيل',prepare:'ارمِ فكرة',resume:'استحضر اللقاء',save:'احتفظ هنا',recall:'استحضر',privateNote:'تقدر تكتب، أو تتكلم، أو تفضل ساكت.',prior:'تصوّر سابق',foot:'عالم قيد التشكّل · الكتابة والتسجيل على جهازك فقط',prepareLabel:'الفكرة قبل أن تغادر',recipientLabel:'إلى من؟',recipientHint:'شخص أو شركة',mask:'بدون إظهار اسمي',person:'الاسم الذي سيظهر',anonymous:'إنسان بلا اسم معلن',origin:'منك',object:'فكرة · من كتابتك',grip:'اسحب الفكرة نحو وجهتها',cast:'ارمها في المعاينة',target:'الوجهة',previewNote:'المستلم اسم تختاره للمعاينة فقط. النص الظاهر هو ما سيصل في التجربة؛ لا إرسال حقيقي ولا نقل للصوت.',receive:'منظور الطرف الآخر · أنت تؤدي الدور',returned:'رجعت لك الفكرة',meet:'المساحة بينكما · دورين محليين',cancel:'ارجع لمساحتك',exit:'أنه المعاينة',exchangeNote:'اختبار محلي بين دورين على نفس الجهاز، بلا أشخاص متصلين.',reply:'إيه اللي تحب تضيفه؟',replyOnly:'أعد الفكرة',replyMeet:'أعدها واقترح لقاءً',decline:'لا أريد المتابعة',declined:'اختار الطرف الآخر عدم المتابعة في المعاينة.',answer:'إضافة من الطرف الآخر في المعاينة',accept:'اقبل اللقاء',back:'استمر بمفردك',common:'ما الذي يمكن أن نصنعه معًا؟',commonHint:'اكتب ما أصبح ممكنًا بعد اللقاء…',keep:'احتفظ بالعمل الجديد هنا',leave:'ارجع لمساحتك',meetingNote:'النصان الأصليان باقيان. ما تكتبه هنا تأليف مشترك في المعاينة، وليس اتفاقًا.',memory:'استحضر شيئًا',close:'إغلاق',find:'ابحث في أعمالك المحلية',new:'مساحة لفكرة أخرى',forget:'امسح النسخ المحفوظة',memoryNote:'التخزين محلي، ليس حسابًا. اللقاءات والتسجيلات مؤقتة حتى تحفظ نص عملك.',empty:'لا توجد أعمال.',untitled:'فكرة بلا اسم',saved:'حُفظ النص على هذا الجهاز فقط.',failed:'تعذر الحفظ؛ النص لا يزال هنا.',need:'اكتب فكرة وحدد وجهة واسمًا ظاهرًا إن اخترته.',emptyThought:'اكتب شيئًا أولًا. التسجيل لا يتحول إلى نص تلقائيًا.',replyNeed:'اكتب إضافتك أولًا، أو اختر عدم المتابعة.',commonNeed:'اكتب ما تريد أن يصبح عملًا.',limit:'وصلت لحد الأعمال المحلية.',confirmForget:'امسح النسخ المحفوظة في هذا المتصفح؟',forgot:'أزيلت النسخ المحفوظة. ما في الذاكرة الحالية لا يزال هنا.',confirmEnd:'إنهاء هذه المعاينة؟ سيبقى عملك الأصلي.',confirmClip:'التسجيل محلي ومؤقت. امسحه قبل الانتقال إلى عمل آخر؟',localOnly:'لم يحدث إرسال حقيقي.',newMade:'نشأ عمل محلي جديد؛ الأصل محفوظ في الذاكرة.',mark:'معاينة لا إرسال',from:'من',to:'إلى',jointA:'الفكرة الأصلية',jointB:'إضافة الطرف الثاني',jointC:'العمل المتكوّن'},
 en:{mode:'Local review',locale:'العربية',private:'Here, for you',name:'Work name',thought:'What’s on your mind?',mic:'Speak',stop:'Finish recording',requesting:'Waiting for microphone access',cancelMic:'Cancel request',stopping:'Finishing your recording',voiceLimit:'Recording exceeded the limit. Your previous recording is unchanged.',recording:'Local recording',ready:'Your voice stays here · not transcribed',noMic:'Recording is unavailable or permission was denied. You can write.',clear:'Remove recording',prepare:'Cast an idea',resume:'Recall the encounter',save:'Keep here',recall:'Recall',privateNote:'Write, speak, or simply stay.',prior:'Earlier possibility',foot:'A world taking form · writing and recording stay on your device',prepareLabel:'Before the idea leaves',recipientLabel:'To whom?',recipientHint:'A person or company',mask:'Without displaying my name',person:'Name to display',anonymous:'A person without a displayed name',origin:'From you',object:'An idea · your words',grip:'Pull the idea toward its destination',cast:'Cast in review',target:'Destination',previewNote:'A destination chosen for local review only. The visible text is what the other role sees; no real delivery or audio transfer.',receive:'Recipient perspective · you play this role',returned:'The idea has returned',meet:'The space between you · two local roles',cancel:'Return to your space',exit:'End review',exchangeNote:'Two roles on the same device, without connected people.',reply:'What would you add?',replyOnly:'Return the idea',replyMeet:'Return and propose a meeting',decline:'Do not continue',declined:'The other role chose not to continue in this review.',answer:'Contribution from the other role',accept:'Accept the meeting',back:'Continue alone',common:'What could you make together?',commonHint:'Write what became possible after the encounter…',keep:'Keep the new work here',leave:'Return to your space',meetingNote:'Both original contributions remain. This is local coauthoring, not an agreement.',memory:'Recall something',close:'Close',find:'Search local work',new:'Space for another idea',forget:'Remove saved copies',memoryNote:'Local storage is not an account. Encounters and recordings are temporary unless you keep the written work.',empty:'No works yet.',untitled:'Untitled thought',saved:'Text saved on this device only.',failed:'Could not save; your text is still here.',need:'Enter an idea, a destination, and a displayed name if chosen.',emptyThought:'Write something first. Recording does not create a transcript automatically.',replyNeed:'Write a contribution first, or choose not to continue.',commonNeed:'Write what should become a work.',limit:'Local work limit reached.',confirmForget:'Remove saved copies from this browser?',forgot:'Saved copies removed. In-memory writing is still here.',confirmEnd:'End this review? Your original work will remain.',confirmClip:'Recording is temporary and local. Clear it before changing work?',localOnly:'Nothing was actually sent.',newMade:'A new local work exists; the original stays in memory.',mark:'Review, not delivery',from:'From',to:'To',jointA:'Original idea',jointB:'Other contribution',jointC:'Emerging work'}
};
let lang='ar',works=[],active=null,phase='private',offer=null;
const automaticTitles=new Set();
const t=k=>text[lang][k], put=(id,k)=>{$(id).textContent=t(k)}, status=k=>{$('status').textContent=k?t(k):''}, current=()=>works.find(w=>w.id===active);
const str=(v,n)=>typeof v==='string'&&v.length<=n;
function valid(v){return v&&v.version===1&&['ar','en'].includes(v.lang)&&Array.isArray(v.works)&&v.works.length<=100&&new Set(v.works.map(w=>w?.id)).size===v.works.length&&v.works.every(w=>w&&str(w.id,80)&&str(w.title,240)&&w.title.trim()&&str(w.body,12000)&&str(w.idea,6000)&&typeof w.ideaOpen==='boolean'&&(w.parent===null||str(w.parent,80)))&&(v.active===null||v.works.some(w=>w.id===v.active))}
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=2400000){const v=JSON.parse(raw);if(valid(v)){lang=v.lang;works=v.works.map(w=>({id:w.id,title:w.title,body:w.body,idea:w.idea,ideaOpen:w.ideaOpen,parent:w.parent}));active=v.active}}}catch{}
function titleFor(body){const s=body.trim().split(/\r?\n/)[0];return Array.from(s||t('untitled')).slice(0,90).join('')}
function ensureWork(){let w=current();if(w)return w;if(works.length>=100){status('limit');return null}w={id:crypto.randomUUID(),title:t('untitled'),body:'',idea:'',ideaOpen:false,parent:null};works.push(w);automaticTitles.add(w.id);active=w.id;return w}
// Presence is not a step to dismiss. Controls derive from what actually exists.
function presence(){
 const w=current(),hasText=!!w?.body.trim(),hasWork=!!w,hasOffer=!!offer&&offer.work===active;
 document.body.dataset.presence=hasWork?'working':'still';
 updateExpression();
 $('prepare').hidden=!hasText;
 $('save').hidden=!hasWork;
 $('recall').hidden=!works.length;
 $('resume').hidden=!hasOffer;
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
function switchWork(id){if((voice.snapshot().clip||voiceBusy())&&!confirm(t('confirmClip')))return;discardVoice();active=id;offer=null;$('memory').close();loadPrivate();$('thought').focus();status(null)}
$('recall').onclick=()=>{$('find').value='';list();$('memory').showModal();$('find').focus()};$('find').oninput=list;$('close-memory').onclick=()=>$('memory').close();$('new-work').onclick=()=>switchWork(null);
$('forget').onclick=()=>{if(!confirm(t('confirmForget')))return;try{localStorage.removeItem(KEY);status('forgot');$('memory').close()}catch{status('failed')}};
let voiceURL='',displayedClip=null,voiceClock=null,voiceStarted=0;
const voice=createVoiceCapture({
 getStream:()=>navigator.mediaDevices.getUserMedia({audio:true}),
 makeRecorder:input=>new MediaRecorder(input),
 onChange:()=>micUI()
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
 }
 $('voice').dataset.capture=state;
 $('mic').setAttribute('aria-pressed',String(live));
 $('mic').setAttribute('aria-disabled',String(state==='stopping'));
 put('mic-label',state==='requesting'?'cancelMic':live?'stop':state==='stopping'?'stopping':'mic');
 $('voice-state').textContent=error?t(error):['requesting','recording','stopping','ready'].includes(state)?t(state):'';
 $('clear-clip').hidden=!voiceURL||voiceBusy();
 $('clip').hidden=!voiceURL||voiceBusy();
 updateExpression();
}
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
function discardVoice(){voice.discard()}
$('clear-clip').onclick=()=>voice.clear();
$('mic').onclick=()=>voice.toggle();
window.addEventListener('pagehide',discardVoice);
function captureDraft(){if(!offer||phase!=='prepare')return;offer.draft=$('excerpt').value;offer.recipient=$('recipient').value;offer.masked=$('masked').checked;offer.sender=$('person-name').value}
function canCast(){return !!(offer&&offer.draft.trim()&&offer.recipient.trim()&&(offer.masked||offer.sender.trim()))}
function preparationUI(){captureDraft();$('person-name').hidden=$('masked').checked;$('person-label').hidden=$('masked').checked;$('destination-name').textContent=offer.recipient.trim()||t('target');$('cast').disabled=!canCast();$('grip').disabled=!canCast();$('destination').classList.toggle('ready',canCast())}
for(const id of ['excerpt','recipient','masked','person-name'])$(id).addEventListener('input',()=>{if(phase==='prepare')preparationUI()});
function animate(kind){const obj=$('idea-object');obj.classList.remove('arrive','return');void obj.offsetWidth;obj.classList.add(kind);obj.addEventListener('animationend',()=>obj.classList.remove(kind),{once:true})}
function setPhase(next,move){
 if(phase==='private'&&next!=='private'){if(voiceBusy())voice.cancel();if(voiceURL)$('clip').pause()}
 if(phase==='prepare')captureDraft();
 if(phase==='recipient'&&offer)offer.replyDraft=$('reply').value;
 if(phase==='meeting'&&offer)offer.common=$('common').value;
 phase=next;render();if(move)animate(move);
 const focus=next==='private'?'thought':next==='prepare'?'excerpt':next==='recipient'?'reply':next==='meeting'?'common':'back-private';$(focus).focus({preventScroll:true});
}
function displaySender(){return offer?.masked?t('anonymous'):offer?.sender||t('anonymous')}
function render(){
 document.body.dataset.phase=phase;$('private').hidden=phase!=='private';$('exchange').hidden=phase==='private';
 if(phase==='private'){loadPrivate();return}
 if(!offer){phase='private';render();return}
 const prep=phase==='prepare',receiver=phase==='recipient',returned=phase==='returned',meet=phase==='meeting';
 $('exchange-label').textContent=t(prep?'prepareLabel':receiver?'receive':returned?'returned':'meet');
 $('idea-origin').textContent=prep?t('origin'):t('from')+' '+displaySender()+'  ·  '+t('to')+' '+offer.recipient;
 $('object-mark').textContent=t('mark');$('excerpt').hidden=!prep;$('carried-text').hidden=prep;$('grip').hidden=!prep;
 $('preparation').hidden=!prep;$('reception').hidden=!receiver;$('answer').hidden=!(returned||meet);$('return-actions').hidden=!returned;$('meeting').hidden=!meet;
 $('accept').hidden=!offer.invited;$('cancel').textContent=t(prep?'cancel':'exit');
 if(prep){$('excerpt').value=offer.draft;$('recipient').value=offer.recipient;$('masked').checked=offer.masked;$('person-name').value=offer.sender;preparationUI()}
 else{$('carried-text').textContent=offer.exposed||'';$('excerpt').value='';$('recipient').value='';$('person-name').value='';$('reply').value=receiver?offer.replyDraft||'':'';$('answer-text').textContent=offer.declined?t('declined'):offer.reply||'';$('common').value=meet?offer.common||'':''}
 // Remove hidden private input values from the receiving view; memory itself
 // remains in this local tab. This is not an authenticated access boundary.
 $('thought').value='';$('name').value='';$('prior-text').value='';
}
$('prepare').onclick=()=>{const w=current(),all=$('thought').value,selection=all.slice($('thought').selectionStart,$('thought').selectionEnd);if(!w||!all.trim()){status('emptyThought');return}if(offer&&!confirm(t('confirmEnd')))return;offer={id:crypto.randomUUID(),work:w.id,draft:(selection.trim()?selection:all).slice(0,6000),recipient:'',masked:true,sender:'',exposed:null,replyDraft:'',reply:null,invited:false,declined:false,common:'',accepted:false};$('idea-object').dataset.idea=offer.id;status(null);setPhase('prepare')};
function cast(){if(phase!=='prepare')return;captureDraft();if(!canCast()){status('need');return}offer.exposed=offer.draft;offer.recipient=offer.recipient.trim();offer.sender=offer.masked?'':offer.sender.trim();offer.resume='recipient';setPhase('recipient','arrive');status('localOnly')}
$('cast').onclick=cast;$('grip').onclick=e=>{if(e.detail===0)cast()};
let drag=null;const grip=$('grip'),obj=$('idea-object');
grip.addEventListener('pointerdown',e=>{if(e.button!==0||!canCast())return;drag={id:e.pointerId,x:e.clientX,y:e.clientY};grip.setPointerCapture(e.pointerId)});
grip.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;obj.style.transform='translate('+Math.max(-190,Math.min(190,e.clientX-drag.x))+'px,'+Math.max(-150,Math.min(150,e.clientY-drag.y))+'px)'});
function dragEnd(e,commit){if(!drag||drag.id!==e.pointerId)return;const target=$('destination').getBoundingClientRect(),distance=Math.hypot(e.clientX-drag.x,e.clientY-drag.y),hit=e.clientX>=target.left-30&&e.clientX<=target.right+30&&e.clientY>=target.top-28&&e.clientY<=target.bottom+28;drag=null;obj.style.transform='';if(commit&&distance>28&&hit)cast()}
grip.addEventListener('pointerup',e=>dragEnd(e,true));grip.addEventListener('pointercancel',e=>dragEnd(e,false));grip.addEventListener('lostpointercapture',e=>dragEnd(e,false));
function returnIdea(invite,decline){if(phase!=='recipient')return;const reply=$('reply').value;if(!decline&&!reply.trim()){status('replyNeed');return}offer.reply=decline?'':reply;offer.invited=invite&&!decline;offer.declined=decline;offer.resume='returned';setPhase('returned','return');status('localOnly')}
$('reply-only').onclick=()=>returnIdea(false,false);$('reply-meet').onclick=()=>returnIdea(true,false);$('decline').onclick=()=>returnIdea(false,true);
$('accept').onclick=()=>{if(phase!=='returned'||!offer?.invited)return;offer.accepted=true;offer.resume='meeting';setPhase('meeting');status(null)};
function goPrivate(){if(offer)offer.resume=phase;setPhase('private');status(null)}
$('back-private').onclick=goPrivate;$('leave').onclick=goPrivate;$('resume').onclick=()=>{if(offer&&offer.work===active)setPhase(offer.resume||'prepare')};
$('cancel').onclick=()=>{if(phase==='prepare'){offer=null;phase='private';render();$('thought').focus();return}if(confirm(t('confirmEnd'))){const prev=offer.work;offer=null;active=prev;phase='private';render();status(null);$('thought').focus()}};
$('keep').onclick=()=>{if(phase!=='meeting'||!offer?.accepted)return;const common=$('common').value;if(!common.trim()){status('commonNeed');return}if(works.length>=100){status('limit');return}const body=t('jointA')+'\n'+offer.exposed+'\n\n'+t('jointB')+'\n'+offer.reply+'\n\n'+t('jointC')+'\n'+common;if(body.length>12000){status('limit');return}const w={id:crypto.randomUUID(),title:titleFor(common),body,idea:'',ideaOpen:false,parent:offer.work};works.push(w);discardVoice();active=w.id;offer=null;phase='private';render();status('newMade');$('thought').focus()};
function translate(){
 document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('locale').lang=lang==='ar'?'en':'ar';
 for(const [id,k] of Object.entries({mode:'mode',locale:'locale','private-label':'private','name-label':'name','thought-label':'thought','clear-clip':'clear',prepare:'prepare',resume:'resume',save:'save',recall:'recall','private-note':'privateNote','prior-label':'prior','prior-input-label':'prior','foot-note':'foot','excerpt-label':'thought','grip-label':'grip','recipient-label':'recipientLabel','masked-label':'mask','person-label':'person',cast:'cast','preview-note':'previewNote','reply-label':'reply','reply-only':'replyOnly','reply-meet':'replyMeet',decline:'decline','answer-origin':'answer',accept:'accept','back-private':'back','common-label':'common',keep:'keep',leave:'leave','meeting-note':'meetingNote','exchange-note':'exchangeNote','memory-title':'memory','close-memory':'close','find-label':'find','new-work':'new',forget:'forget','memory-note':'memoryNote'}))put(id,k);
 for(const [id,k] of Object.entries({thought:'thought',name:'name',recipient:'recipientHint','person-name':'person',reply:'reply',common:'commonHint',find:'find'}))$(id).placeholder=t(k);
 micUI();
}
$('locale').onclick=()=>{if(phase==='prepare')captureDraft();if(phase==='recipient'&&offer)offer.replyDraft=$('reply').value;if(phase==='meeting'&&offer)offer.common=$('common').value;lang=lang==='ar'?'en':'ar';translate();render();status(null)};
translate();render();
/* The law is now used by the real scene. Layout remains native HTML. */
const presenceSVG=$('presence-material').querySelector('svg');
const presenceNarrow=matchMedia('(max-width:760px)');
const presenceMotion=matchMedia('(prefers-reduced-motion:reduce)');
function expressLight(){
 const focused=document.activeElement;
 const law=composePresence({phase:document.body.dataset.phase,focus:focused?.id||'none',narrow:presenceNarrow.matches,reducedMotion:presenceMotion.matches,capture:document.body.dataset.capture||'idle'});
 if(!law){document.body.dataset.attention='rest';return}
 presenceSVG.setAttribute('viewBox',law.frame);
 document.body.dataset.attention=law.attention;
 document.body.dataset.material=law.material;
}
presenceNarrow.addEventListener('change',expressLight);
presenceMotion.addEventListener('change',expressLight);
new MutationObserver(expressLight).observe(document.body,{attributes:true,attributeFilter:['data-phase','data-capture']});
document.addEventListener('focusin',expressLight);
document.addEventListener('focusout',()=>queueMicrotask(expressLight));
expressLight();
