'use strict';
const $=id=>document.getElementById(id), KEY='one-world.local.v1';
const words={ar:{recall:'استحضر',kicker:'بداية من شيء حقيقي',question:'بتشتغل على إيه؟',seed:'شيء تعمل عليه، اسم، أو رابط…',start:'ابدأ بالكتابة',local:'مساحة محلية · لا بحث خارجي',work:'عملك',title:'عنوان العمل',body:'اكتب ما تريد صنعه، أو ما تعرفه حتى الآن…',rename:'عدّل الاسم',compose:'أضف تصوّرًا',share:'جهّز جزءًا للمشاركة',save:'احفظ على هذا الجهاز',saved:'حُفظ على هذا الجهاز. لم يُرسل إلى خادم.',unsaved:'الكتابة في الذاكرة فقط حتى تختار الحفظ.',changed:'تغييرات محلية لم تُحفظ بعد.',thought:'تصوّر من كتابتك',idea:'ما الذي يمكن أن يوجد؟',ideaText:'اكتب التصوّر، لا حقيقة مؤكدة…',make:'اجعله عملًا جديدًا',discard:'أغلق التصوّر',close:'إغلاق',shareKicker:'جزء من العمل',shareTitle:'ما الذي تريد أن يصل؟',shareHelp:'هذه معاينة محلية فقط. لا يوجد إرسال أو تحقق من المستلم.',excerpt:'النص الذي سيظهر في المعاينة',receiver:'اسم المستلم المقترح',shareLimit:'عرض ورد — صلاحية مقترحة، لم تُمنح بعد.',prepare:'اعرض المعاينة',preview:'نص الإفصاح',previewNote:'لم يُرسل شيء. لا توجد مشاركة فعلية.',memory:'استحضر شيئًا',find:'ابحث في أعمالك المحلية',new:'ابدأ شيئًا آخر',forget:'امسح النسخة المحفوظة',memoryNote:'الأعمال المحلية ليست حسابًا أو مساحة مشتركة.',empty:'لا توجد أعمال مطابقة.',invalid:'اكتب بداية غير فارغة.',validTitle:'اكتب اسمًا للعمل.',failed:'تعذر الحفظ على الجهاز. محتواك لا يزال هنا.',capacity:'وصلت إلى حد الأعمال المحلية.',forgot:'أزيلت النسخة المحفوظة؛ الكتابة الحالية في الذاكرة.',confirmForget:'إزالة النسخة المحفوظة من هذا المتصفح؟',open:'تم استحضار العمل.',made:'نشأ عمل جديد من تصوّرك. الأصل باقٍ.',missing:'لا توجد معرفة خارجية مؤكدة هنا.',needed:'اكتب النص واسم المستلم أولًا.',return:'ارجع للأصل',locale:'English'},en:{recall:'Recall',kicker:'Begin with something real',question:'What are you working on?',seed:'Something you are working on, a name, or a link…',start:'Begin writing',local:'Local space · no external lookup',work:'Your work',title:'Work title',body:'Write what you want to make, or what you know so far…',rename:'Rename',compose:'Add a possibility',share:'Prepare an excerpt to share',save:'Save on this device',saved:'Saved on this device. Nothing sent to a server.',unsaved:'Writing stays in memory until you choose to save.',changed:'Local changes not yet saved.',thought:'A possibility you wrote',idea:'What could exist?',ideaText:'Write a possibility, not an established fact…',make:'Make it a new work',discard:'Close possibility',close:'Close',shareKicker:'Part of the work',shareTitle:'What should reach them?',shareHelp:'Local preview only. No sending or recipient verification.',excerpt:'Exactly what the preview will contain',receiver:'Proposed recipient name',shareLimit:'View and respond — proposed permission, not granted.',prepare:'Preview disclosure',preview:'Disclosure text',previewNote:'Nothing sent. No actual sharing.',memory:'Recall something',find:'Find your local work',new:'Begin something else',forget:'Remove saved copy',memoryNote:'Local works are not an account or shared space.',empty:'No matching works.',invalid:'Enter a nonempty starting point.',validTitle:'Enter a work title.',failed:'Could not save on this device. Your writing is still here.',capacity:'Local work limit reached.',forgot:'Saved copy removed; current writing remains in memory.',confirmForget:'Remove the saved copy from this browser?',open:'Work recalled.',made:'A new work grew from your possibility. The original remains.',missing:'No verified external knowledge here.',needed:'Enter both text and a proposed recipient.',return:'Return to original',locale:'العربية'}};
let lang='ar', works=[], active=null, saved=null, contextOpen=false;const t=k=>words[lang][k];
const validString=(v,n)=>typeof v==='string'&&v.length<=n;
function valid(v){return v&&v.version===1&&['ar','en'].includes(v.lang)&&Array.isArray(v.works)&&v.works.length<=100&&new Set(v.works.map(w=>w?.id)).size===v.works.length&&v.works.every(w=>w&&validString(w.id,80)&&validString(w.title,240)&&w.title.trim()&&validString(w.body,12000)&&validString(w.idea,6000)&&typeof w.ideaOpen==='boolean'&&(w.parent===null||validString(w.parent,80)))&&(v.active===null||v.works.some(w=>w.id===v.active))}
try{const raw=localStorage.getItem(KEY);if(raw&&raw.length<=2400000){const v=JSON.parse(raw);if(valid(v)){({lang,works,active}=v);saved=JSON.stringify({version:1,lang,works,active})}}}catch{/* storage may be unavailable */}
const current=()=>works.find(w=>w.id===active);const state=()=>({version:1,lang,works,active});const text=(id,k)=>$(id).textContent=t(k);const status=k=>$('status').textContent=k?t(k):'';
function note(){text('save-note',saved===JSON.stringify(state())?'saved':saved?'changed':'unsaved')}
function translate(){$('world-nav').setAttribute('aria-label',lang==='ar'?'العالم':'World');document.documentElement.lang=lang;document.documentElement.dir=lang==='ar'?'rtl':'ltr';$('locale').lang=lang==='ar'?'en':'ar';const map={recall:'recall',locale:'locale','birth-kicker':'kicker',question:'question','seed-label':'seed',start:'start','local-note':'local','work-kicker':'work','title-label':'title','body-label':'body',rename:'rename',compose:'compose',share:'share',save:'save','thought-label':'thought','thought-heading':'idea','thought-input-label':'ideaText',make:'make',discard:'discard','close-context':'close','memory-title':'memory','close-memory':'close','find-label':'find','new-work':'new',forget:'forget','memory-note':'memoryNote'};for(const [id,k] of Object.entries(map))text(id,k);$('seed').placeholder=t('seed');$('body').placeholder=t('body');$('thought-text').placeholder=t('ideaText');$('find').placeholder=t('find');note()}
function render(){const w=current();$('birth').hidden=!!w;$('living').hidden=!w;$('recall').hidden=!works.length;$('context').hidden=true;$('share').setAttribute('aria-expanded','false');contextOpen=false;$('context-content').replaceChildren();$('work-title').hidden=true;$('work-heading').hidden=false;if(!w)return;$('work-heading').textContent=w.title;$('body').value=w.body;$('thought').hidden=!w.ideaOpen;$('compose').setAttribute('aria-expanded',String(w.ideaOpen));$('thought-text').value=w.idea;const prev=$('back-parent');if(prev)prev.remove();if(w.parent&&works.some(a=>a.id===w.parent)){const b=document.createElement('button');b.id='back-parent';b.textContent=t('return');b.onclick=()=>open(w.parent);$('work-kicker').after(b)}note()}
function newWork(title,body='',parent=null){if(works.length>=100){status('capacity');return false}const id=crypto.randomUUID();works.push({id,title,body,idea:'',ideaOpen:false,parent});active=id;render();$('work-heading').focus();return true}
function open(id){if(!works.some(w=>w.id===id)||!commitTitle())return;active=id;render();$('work-heading').focus();status('open')}
$('begin').onsubmit=e=>{e.preventDefault();const v=$('seed').value.trim();if(!v){status('invalid');return}if(newWork(v)){$('seed').value='';status('missing')}};
$('body').oninput=()=>{current().body=$('body').value;note()};$('rename').onclick=()=>{const w=current();$('work-title').value=w.title;$('work-title').hidden=false;$('work-title').focus();$('work-title').select()};function commitTitle(){if($('work-title').hidden)return true;const s=$('work-title').value.trim();if(!s){status('validTitle');$('work-title').focus();return false}current().title=s;$('work-heading').textContent=s;$('work-title').hidden=true;note();return true}$('work-title').onkeydown=e=>{if(e.key==='Enter'&&!e.isComposing){e.preventDefault();if(commitTitle())$('rename').focus()}if(e.key==='Escape'){e.preventDefault();$('work-title').hidden=true;$('rename').focus()}};
$('compose').onclick=()=>{if(!commitTitle())return;current().ideaOpen=true;$('thought').hidden=false;$('compose').setAttribute('aria-expanded','true');$('thought-text').focus();note()};$('thought-text').oninput=()=>{current().idea=$('thought-text').value;note()};$('discard').onclick=()=>{current().ideaOpen=false;$('thought').hidden=true;$('compose').setAttribute('aria-expanded','false');$('compose').focus();note()};$('make').onclick=()=>{if(!commitTitle())return;const w=current(),v=w.idea.trim();if(!v){status('invalid');return}const title=Array.from(v).slice(0,120).join('');if(newWork(title,v,w.id))status('made')};
function closeContext(){contextOpen=false;$('share').setAttribute('aria-expanded','false');$('context').hidden=true;$('context-content').replaceChildren();$('share').focus()}
$('close-context').onclick=closeContext;$('share').onclick=()=>{if(contextOpen){closeContext();return}if(!commitTitle())return;const b=$('body'),sel=b.value.slice(b.selectionStart,b.selectionEnd).slice(0,6000);contextOpen=true;$('context').hidden=false;$('share').setAttribute('aria-expanded','true');text('context-kicker','shareKicker');text('context-title','shareTitle');text('context-help','shareHelp');$('context-content').replaceChildren($('share-template').content.cloneNode(true));for(const [id,k] of Object.entries({'excerpt-label':'excerpt','receiver-label':'receiver','share-limit':'shareLimit',prepare:'prepare','prepared-title':'preview','prepared-note':'previewNote'}))text(id,k);$('excerpt').value=sel;$('prepare').onclick=()=>{const excerpt=$('excerpt').value,receiver=$('receiver').value;if(!excerpt.trim()||!receiver.trim()){status('needed');return}$('preview-name').textContent=receiver;$('preview-text').textContent=excerpt;$('prepared').hidden=false;status('previewNote')};for(const id of ['excerpt','receiver'])$(id).oninput=()=>{$('prepared').hidden=true};$('excerpt').focus()};
$('save').onclick=()=>{if(!commitTitle())return;try{const raw=JSON.stringify(state());if(raw.length>2400000)throw Error();localStorage.setItem(KEY,raw);saved=raw;note();status('saved')}catch{status('failed')}};
function list(){const q=$('find').value.trim().toLowerCase(),target=$('works');target.replaceChildren();for(const w of works.filter(w=>w.title.toLowerCase().includes(q))){const b=document.createElement('button');b.className='item';b.dir='auto';b.textContent=w.title;b.onclick=()=>{$('memory').close();open(w.id)};target.append(b)}if(!target.children.length){const p=document.createElement('p');p.textContent=t('empty');target.append(p)}}$('recall').onclick=()=>{if(!commitTitle())return;$('find').value='';list();$('memory').showModal();$('find').focus()};$('find').oninput=list;$('close-memory').onclick=()=>$('memory').close();$('new-work').onclick=()=>{$('memory').close();active=null;render();$('seed').focus();status(null)};$('forget').onclick=()=>{if(!confirm(t('confirmForget')))return;try{localStorage.removeItem(KEY);saved=null;note();status('forgot');$('memory').close()}catch{status('failed')}};
$('locale').onclick=()=>{if(!commitTitle())return;if(contextOpen)closeContext();lang=lang==='ar'?'en':'ar';translate();render();status(null);$('locale').focus()};
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!e.isComposing&&contextOpen&&!$('memory').open){e.preventDefault();closeContext()}});
translate();render();


/* A single evolving work in the existing review surface. Fictional, local only. */
(() => {
  const scene = new URLSearchParams(location.search).get('scene') === 'formation';
  const copy={
    ar:{entry:'شاهد العمل',mark:'عمل مقترح · معاينة فنية افتراضية',title:'أثر الطين',exit:'الكتابة المحلية',exhibit:'تصوّر معماري لمجموعة خزفية',instruction:'اختر قطعة، ثم اختر سطح العرض الذي تريد وضعها عليه. يمكنك أيضًا استخدام الأزرار تحت العمل.',selected:'القطعة التي بين يديك',place:'ضعها في',piece:'اختر قطعة',surfaces:['سطح ١','سطح ٢','سطح ٣','التحضير'],types:['إناء طويل','وعاء مستدير','إناء واسع'],location:(name)=>'موضعها: '+name,full:'هذا السطح ممتلئ. انقل قطعة منه أولًا.',moved:'تغير موضع القطعة؛ باقي العمل كما كان.',caption:'مجموعة خزفية مشتركة',outcome:'معرض من ورشة خزف إلى مساحة عرض',count:(n)=>n+' من 9 قطع في العرض · '+(9-n)+' في التحضير',studio:'الورشة · التصنيع من يوم 3 إلى 21',gallery:'مساحة العرض · الاستقبال من يوم 11 إلى 27',start:'بداية نافذة العمل (10 أيام)',duration:'أقل مدة مطلوبة بالأيام',fit:(n,k)=>n>=k?'التوقيت: '+n+' أيام مشتركة، تكفي للمدة المقترحة.':'التوقيت: '+n+' أيام مشتركة، ينقص '+(k-n)+' أيام.',invalid:'التوقيت: أدخل قيمًا صحيحة داخل الحدود.',disclaimer:'التكوين والأطراف افتراضية. المجسم تصور للترتيب لا مخططًا تنفيذيًا بمقياس حقيقي. لا اتفاق أو حجز أو إرسال، ولا تغيير في أعمالك المحفوظة.',reset:'استعد التكوين الأصلي'},
    en:{entry:'See the work',mark:'Proposed work · fictional design preview',title:'Traces of clay',exit:'Local writing',exhibit:'Spatial composition for a ceramic collection',instruction:'Choose a piece, then the surface where it should live. You can also use the controls below the work.',selected:'The piece in your hands',place:'Place it on',piece:'Choose a piece',surfaces:['Plinth 1','Plinth 2','Plinth 3','Preparation'],types:['Tall vessel','Round vessel','Wide vessel'],location:name=>'Placement: '+name,full:'This surface is full. Move a piece away first.',moved:'The piece moved; the rest of the work remains.',caption:'A shared ceramic collection',outcome:'An exhibition from a studio to a gallery',count:n=>n+' of 9 pieces on display · '+(9-n)+' in preparation',studio:'Studio · production days 3–21',gallery:'Gallery · reception days 11–27',start:'Start of the 10-day work window',duration:'Minimum duration in days',fit:(n,k)=>n>=k?'Timing: '+n+' shared days, sufficient for the proposed duration.':'Timing: '+n+' shared days; '+(k-n)+' more needed.',invalid:'Timing: enter valid values within the limits.',disclaimer:'The composition and parties are fictional. The spatial representation is illustrative, not a construction plan to scale. No agreement, booking, sending, or change to saved work.',reset:'Restore original composition'}
  };
  const ns='http://www.w3.org/2000/svg', svg=$('exhibition'), pieces=$('ceramics'), architecture=$('architecture');
  const make=(name,attrs,parent)=>{const n=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))n.setAttribute(k,String(v));if(parent)parent.append(n);return n};
  const original=[[0,0],[0,1],[1,0],[1,1],[1,2],[2,0],[2,1],[3,0],[3,1]];
  const specs=[
    {kind:0,glaze:0,h:119,w:51},{kind:1,glaze:2,h:84,w:63},{kind:2,glaze:1,h:60,w:73},
    {kind:0,glaze:2,h:132,w:49},{kind:1,glaze:0,h:86,w:61},{kind:2,glaze:2,h:55,w:74},
    {kind:0,glaze:1,h:106,w:49},{kind:1,glaze:1,h:78,w:64},{kind:2,glaze:0,h:58,w:72}
  ];
  let positions=original.map(p=>[...p]),chosen=7,notice='',locations=[];
  const pots=[],surfaces=[],btns=[],options=[];
  const narrow=matchMedia('(max-width:680px)');
  function label(i){const c=copy[lang];return c.types[specs[i].kind]+' · '+String(i+1).padStart(2,'0')}
  function put(target){
    const before=positions[chosen];if(before[0]===target)return;
    const used=new Set(positions.filter(p=>p[0]===target).map(p=>p[1]));
    const limit=target===3?9:3;
    let spot=0;while(spot<limit&&used.has(spot))spot++;
    if(spot===limit){notice='full';refresh();return}
    positions[chosen]=[target,spot];notice='moved';refresh();
  }
  function choose(i){chosen=i;notice='';refresh()}
  function action(node,fn){node.addEventListener('click',fn);node.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();fn()}})}
  for(let i=0;i<4;i++){
    const g=make('g',{class:'surface',role:'button',tabindex:0,'data-surface':i},architecture);
    const shadow=make('ellipse',{fill:'#625849',opacity:'.16'},g);
    const face=make('path',{class:'surface-face'},g),side=make('path',{class:'surface-side'},g),top=make('path',{class:'surface-top'},g);
    const slots=[];for(let j=0;j<(i===3?9:3);j++)slots.push(make('ellipse',{class:'slot-marker',rx:20,ry:6},g));
    const number=make('text',{class:'surface-number'},g);
    surfaces.push({g,shadow,face,side,top,slots,number});
    action(g,()=>put(i));
    const btn=document.createElement('button');btn.type='button';btn.dataset.destination=String(i);btn.addEventListener('click',()=>put(i));$('place-actions').append(btn);btns.push(btn)
  }
  for(let i=0;i<specs.length;i++){
    const p=specs[i],w=p.w/2,h=p.h, kind=p.kind;
    const g=make('g',{class:'pot',role:'button',tabindex:0,'data-piece':String(i+1)},pieces);
    make('ellipse',{class:'pot-shadow',cx:5,cy:2,rx:w+8,ry:9},g);
    make('ellipse',{class:'pick-ring',cx:0,cy:2,rx:w+7,ry:11},g);
    const neck=kind===0?7:kind===1?14:w*.75;
    const d=kind===0
      ?'M'+(-neck)+' '+(-h)+' C'+(-neck-2)+' '+(-h*.72)+' '+(-w)+' '+(-h*.79)+' '+(-w)+' '+(-h*.43)+' C'+(-w)+' '+(-h*.13)+' '+(-w*.59)+' 0 0 0 C'+(w*.59)+' 0 '+w+' '+(-h*.13)+' '+w+' '+(-h*.43)+' C'+w+' '+(-h*.79)+' '+(neck+2)+' '+(-h*.72)+' '+neck+' '+(-h)+' Z'
      :kind===1
      ?'M'+(-neck)+' '+(-h)+' C'+(-w*.75)+' '+(-h*.87)+' '+(-w)+' '+(-h*.71)+' '+(-w)+' '+(-h*.42)+' C'+(-w)+' '+(-h*.09)+' '+(-w*.5)+' 0 0 0 C'+(w*.5)+' 0 '+w+' '+(-h*.09)+' '+w+' '+(-h*.42)+' C'+w+' '+(-h*.71)+' '+(w*.75)+' '+(-h*.87)+' '+neck+' '+(-h)+' Z'
      :'M'+(-w)+' '+(-h)+' C'+(-w*.98)+' '+(-h*.42)+' '+(-w*.55)+' 0 0 0 C'+(w*.55)+' 0 '+(w*.98)+' '+(-h*.42)+' '+w+' '+(-h)+' Z';
    make('path',{class:'piece-body',d,fill:'url(#clay-'+p.glaze+')',stroke:'#64503e','stroke-width':'.65'},g);
    make('ellipse',{class:'rim',cx:0,cy:-h,rx:kind===2?w:neck,ry:kind===2?8:4.5},g);
    if(kind!==2)for(const v of [.34,.41,.48])make('path',{class:'seam',d:'M'+(-w*.76)+' '+(-h*v)+' Q0 '+(-h*v+6)+' '+(w*.76)+' '+(-h*v)},g);
    pots.push(g);action(g,()=>choose(i));
    const opt=document.createElement('option');opt.value=String(i);$('piece-select').append(opt);options.push(opt);
  }
  function geometry(){
    const mobile=narrow.matches;
    const W=mobile?490:1080,H=mobile?720:560;
    svg.setAttribute('viewBox','0 0 '+W+' '+H);
    $('room-wall').setAttribute('width',W);$('room-wall').setAttribute('height',H);
    $('room-floor').setAttribute('d','M0 '+(mobile?160:256)+'H'+W+'V'+H+'H0Z');
    locations=mobile?[[125,232,210],[365,232,210],[245,436,265],[245,646,435]]:[[205,281,290],[540,281,290],[875,281,290],[540,486,690]];
    surfaces.forEach((s,i)=>{
      const [cx,y,width]=locations[i],x=cx-width/2,depth=i===3?30:39,height=i===3?22:76,slant=17,front=y+depth;
      s.shadow.setAttribute('cx',cx+12);s.shadow.setAttribute('cy',front+height+7);s.shadow.setAttribute('rx',width*.55);s.shadow.setAttribute('ry',17);
      s.face.setAttribute('d','M'+x+' '+front+'H'+(x+width)+'V'+(front+height)+'H'+x+'Z');
      s.side.setAttribute('d','M'+(x+width)+' '+front+'l'+slant+' '+(-depth)+'v'+height+'l'+(-slant)+' '+depth+'Z');
      s.top.setAttribute('d','M'+x+' '+front+'l'+slant+' '+(-depth)+'H'+(x+width+slant)+'l'+(-slant)+' '+depth+'Z');
      s.number.setAttribute('x',cx);s.number.setAttribute('y',front+height/2+4);
      s.slots.forEach((node,j)=>{const [px,py]=point(i,j);node.setAttribute('cx',px);node.setAttribute('cy',py)});
    });
    refresh();
  }
  function point(surface,slot){
    const [cx,y,w]=locations[surface],limit=surface===3?9:3;
    return [cx-w/2+12+(slot+.5)*(w-16)/limit,y+(surface===3?17:20)];
  }
  function validTime(input){if(input.value.trim()==='')return null;const v=Number(input.value);return Number.isInteger(v)&&v>=Number(input.min)&&v<=Number(input.max)?v:null}
  function time(){
    const c=copy[lang],s=validTime($('study-start')),k=validTime($('study-duration')),out=$('outcome-title');
    if(s===null||k===null){out.textContent=c.invalid;out.dataset.fits='false';return}
    const days=Math.max(0,Math.min(21,27,s+10)-Math.max(3,11,s));
    out.textContent=c.fit(days,k);out.dataset.fits=String(days>=k);
  }
  function translateScene(){
    const c=copy[lang];$('study-open').textContent=c.entry;
    if(!scene)return;
    for(const [id,key] of Object.entries({'study-mark':'mark','formation-title':'title','study-exit':'exit','exhibition-label':'exhibit','scene-instruction':'instruction','selected-label':'selected','place-label':'place','piece-label':'piece','work-caption':'caption','work-outcome':'outcome','party-a-detail':'studio','party-b-detail':'gallery','start-label':'start','duration-label':'duration','study-disclaimer':'disclaimer','study-reset':'reset'}))$(id).textContent=c[key];
  }
  function refresh(){
    if(!scene||!locations.length)return;
    const c=copy[lang];
    const counts=[0,0,0,0];positions.forEach(p=>counts[p[0]]++);
    for(let i=0;i<pots.length;i++){
      const [place,slot]=positions[i], [x,y]=point(place,slot);
      // Smaller preparation objects in the visual staging area; not a scale drawing.
      const scale=place===3?(narrow.matches?.62:.84):(narrow.matches?.83:1);
      const g=pots[i];g.setAttribute('transform','translate('+x+' '+y+') scale('+scale+')');g.dataset.place=String(place);g.classList.toggle('selected',i===chosen);g.setAttribute('aria-pressed',String(i===chosen));g.setAttribute('aria-label',label(i)+' — '+c.surfaces[place]);options[i].textContent=label(i);
    }
    surfaces.forEach((s,i)=>{s.number.textContent=i===3?'…':String(i+1).padStart(2,'0');s.g.setAttribute('aria-label',c.surfaces[i]);s.slots.forEach((node,j)=>{node.style.visibility=positions.some(p=>p[0]===i&&p[1]===j)?'hidden':'visible'})});
    btns.forEach((btn,i)=>{btn.textContent=c.surfaces[i]+' · '+counts[i]+(i===3?'':'/3');btn.setAttribute('aria-current',String(positions[chosen][0]===i));btn.disabled=positions[chosen][0]===i});
    $('piece-select').value=String(chosen);$('selected-piece').textContent=label(chosen);$('selected-location').textContent=c.location(c.surfaces[positions[chosen][0]]);
    $('placement-status').textContent=notice?c[notice]:'';
    $('work-count').textContent=c.count(9-counts[3]);time();
  }
  function activate(){
    translateScene();if(!scene)return;
    document.body.classList.add('formation-present');$('birth').hidden=true;$('living').hidden=true;$('recall').hidden=true;$('study-open').hidden=true;$('formation-study').hidden=false;
    geometry();
  }
  $('piece-select').addEventListener('change',()=>choose(Number($('piece-select').value)));
  $('study-start').addEventListener('input',time);$('study-duration').addEventListener('input',time);
  $('study-reset').addEventListener('click',()=>{positions=original.map(p=>[...p]);chosen=7;notice='';$('study-start').value='9';$('study-duration').value='7';refresh()});
  $('locale').addEventListener('click',activate);narrow.addEventListener('change',()=>{if(scene)geometry()});
  activate();
})();
