'use strict';
const frame=document.getElementById('app'), result=document.getElementById('result');
const assert=(ok,name)=>{if(!ok)throw new Error(name)};
const load=(query='')=>new Promise(resolve=>{frame.addEventListener('load',resolve,{once:true});frame.src='../index.html'+query});
(async()=>{
 const key='one-world.local.v1';
 localStorage.removeItem(key);
 await load();
 let fresh=frame.contentDocument;
 assert(fresh.body.dataset.presence==='still','first presence without authored work');
 assert(fresh.getElementById('prepare').hidden&&fresh.getElementById('save').hidden&&fresh.getElementById('recall').hidden,'no premature business actions');
 assert(!fresh.getElementById('thought').hidden&&!fresh.getElementById('mic').hidden,'first expression remains available');
 assert(localStorage.getItem(key)===null,'no passive persistence');
 assert(fresh.body.dataset.expression==='none','presence is not material');
 fresh.getElementById('thought').value='   ';
 fresh.getElementById('thought').dispatchEvent(new Event('input',{bubbles:true}));
 assert(fresh.body.dataset.presence==='still'&&fresh.getElementById('name').hidden,'whitespace does not create a work');
 fresh.getElementById('thought').value='';
 fresh.getElementById('thought').dispatchEvent(new Event('input',{bubbles:true}));
 assert(fresh.getElementById('presence-material').querySelectorAll('svg').length===1,'one authored spatial composition');
 assert(fresh.documentElement.scrollWidth<=frame.clientWidth+1,'empty mobile bounds');
 assert(fresh.body.dataset.attention==='rest','quiet before deliberate focus');
 assert(fresh.body.dataset.material==='existence-field-a','same material law in app');
 const scene=fresh.getElementById('presence-material').querySelector('svg');
 assert(scene.getAttribute('viewBox')==='610 0 570 900','mobile frames same field');
 fresh.getElementById('thought').focus();
 assert(fresh.body.dataset.attention==='express','explicit focus changes local light');
 assert(frame.contentWindow.getComputedStyle(fresh.getElementById('thought')).outlineStyle==='none','focused writing does not become a rectangular form');
 assert(frame.contentWindow.getComputedStyle(fresh.getElementById('thought')).backgroundSize==='100% 3px','focused writing retains a visible line');
 fresh.getElementById('thought').blur();
 await Promise.resolve();
 assert(fresh.body.dataset.attention==='rest','light returns at rest');

 // Synthetic recorder exercises the real product controls, not a second interface.
 const voiceWindow=frame.contentWindow, get=id=>fresh.getElementById(id);
 const tick=()=>new Promise(resolve=>setTimeout(resolve,0));
 let pending, record, requests=0;
 const track={stops:0,stop(){this.stops++}};
 Object.defineProperty(voiceWindow.navigator,'mediaDevices',{configurable:true,value:{getUserMedia:()=>{requests++;return new Promise(resolve=>{pending=resolve})}}});
 class RecorderFixture {
  constructor(){this.state='inactive';this.mimeType='audio/webm';record=this}
  start(){this.state='recording'}
  stop(){this.state='inactive'}
  finish(){this.ondataavailable({data:new voiceWindow.Blob(['synthetic fixture'],{type:'audio/webm'})});this.onstop()}
 }
 voiceWindow.MediaRecorder=RecorderFixture;
 get('mic').click();assert(get('voice').dataset.capture==='requesting'&&requests===1,'explicit microphone request');
 get('mic').click();assert(get('voice').dataset.capture==='idle','cancel microphone permission request');
 pending({getTracks:()=>[track]});await tick();
 assert(track.stops===1&&!record,'late permission releases microphone');
 get('mic').click();pending({getTracks:()=>[track]});await tick();
 assert(get('voice').dataset.capture==='recording'&&get('mic').getAttribute('aria-pressed')==='true'&&!get('voice-duration').hidden,'recording indication and actual elapsed clock');
 await tick();
 assert(fresh.body.dataset.capture==='recording'&&fresh.body.dataset.attention==='express','actual capture stays present without focus');
 get('mic').click();assert(get('voice').dataset.capture==='stopping'&&get('mic').getAttribute('aria-disabled')==='true','waits for final data');
 get('mic').click();assert(requests===2,'no overlapping recording');
 record.finish();assert(get('voice').dataset.capture==='ready'&&!get('clip').hidden&&get('clip').src.startsWith('blob:'),'real local blob exposed to playback control');
 assert(get('thought').value===''&&localStorage.getItem(key)===null,'voice does not transcribe or persist implicitly');
 assert(fresh.body.dataset.expression==='voice','voice alone is a material fact');
 assert(!get('voice-player').hidden&&get('voice-play-label').textContent.length>0,'authored playback surface available, not a decorative wave');
 get('clear-clip').click();assert(get('clip').hidden&&!get('clip').hasAttribute('src'),'explicit removal of clip');
 assert(fresh.body.dataset.expression==='none','removal leaves no invented material');
 assert(get('voice-player').hidden&&get('recorded-voice-path').getAttribute('d')==='','removed audio has no residual ink');
 // The optional local recognition adapter is exercised with a fake browser service.
 let recognizer, secondCount=0;
 class RecognitionFixture {
  static async available(opts){assert(opts.processLocally===true&&opts.langs[0]==='ar-EG','local selected language only');return 'available'}
  get processLocally(){return this.local}set processLocally(v){this.local=v}
  start(track){assert(this.local===true&&track.kind==='audio','same explicit local track');recognizer=this;secondCount++}
  stop(){}abort(){}
 }
 voiceWindow.SpeechRecognition=RecognitionFixture;
 const audioTrack={kind:'audio',readyState:'live',stop(){}};
 get('dictation-opt').checked=true;get('dictation-opt').dispatchEvent(new Event('change'));
 get('mic').click();pending({getTracks:()=>[audioTrack],getAudioTracks:()=>[audioTrack]});await tick();await tick();
 assert(secondCount===1,'explicit local recognition');
 recognizer.onresult({results:[Object.assign([{transcript:'نص أولي'}],{isFinal:false})]});
 assert(get('dictation-preview').textContent==='نص أولي'&&get('thought').value==='','interim text never inserted');
 get('mic').click();record.finish();
 recognizer.onresult({results:[Object.assign([{transcript:'نص مقترح'}],{isFinal:true})]});recognizer.onend();
 assert(!get('dictation-review').hidden&&get('dictation-draft').value==='نص مقترح','final draft is linked to successful clip');
 get('dictation-draft').value='نص راجعه الإنسان';get('dictation-draft').dispatchEvent(new Event('input'));
 get('dictation-add').click();
 assert(get('thought').value==='نص راجعه الإنسان'&&get('dictation-review').hidden,'explicit reviewed insertion');
 assert(localStorage.getItem(key)===null,'approved passage is not implicit storage');
 get('clear-clip').click();get('dictation-opt').checked=false;get('dictation-opt').dispatchEvent(new Event('change'));
 // Fresh fixture preserves the existing blank-start assertions below.
 await load();fresh=frame.contentDocument;
 // End-to-end fixtures are not audio codec, speech accuracy or hardware tests.

 fresh.getElementById('thought').value='A new thought';
 fresh.getElementById('thought').dispatchEvent(new Event('input',{bubbles:true}));
 assert(fresh.body.dataset.presence==='working'&&!fresh.getElementById('prepare').hidden,'first act reveals relevant actions');
 assert(localStorage.getItem(key)===null,'authoring is not implicit storage');
 assert(fresh.body.dataset.expression==='text','written expression exists');
 fresh.getElementById('thought').value='A new thought developed';
 fresh.getElementById('thought').dispatchEvent(new Event('input',{bubbles:true}));
 assert(fresh.getElementById('name').value==='A new thought developed','provisional title follows the author until renamed');
 fresh.getElementById('name').value='Chosen title';
 fresh.getElementById('name').dispatchEvent(new Event('input',{bubbles:true}));
 fresh.getElementById('thought').value='More writing';
 fresh.getElementById('thought').dispatchEvent(new Event('input',{bubbles:true}));
 assert(fresh.getElementById('name').value==='Chosen title','explicit title is preserved');

 localStorage.setItem(key,JSON.stringify({version:1,lang:'ar',active:'prior-work',works:[{id:'prior-work',title:'Previous work',body:'Private fact. Shared thought.',idea:'Preserved earlier possibility',ideaOpen:false,parent:null}]}));
 await load();let d=frame.contentDocument;
 const $=id=>d.getElementById(id), click=id=>$(id).click(), set=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}))};
 assert(d.documentElement.dir==='rtl','Arabic direction');
 assert($('thought').value==='Private fact. Shared thought.'&&$('prior-text').value==='Preserved earlier possibility','old writing preserved');
 const before=localStorage.getItem(key);
 $('thought').setSelectionRange(14,29);click('prepare');
 assert($('excerpt').value==='Shared thought.','exact selection');
 set('recipient','Fictional company');assert(!$('cast').disabled,'prepared with anonymous display');
 const id=$('idea-object').dataset.idea;
 click('cast');assert(d.body.dataset.phase==='recipient','recipient review');
 assert(d.body.dataset.material==='existence-field-a'&&frame.contentWindow.getComputedStyle(d.getElementById('presence-material')).display!=='none','recipient inhabits the same material');
 assert($('carried-text').textContent==='Shared thought.','exact disclosed excerpt');
 assert($('idea-object').dataset.idea===id,'same idea identity');
 assert($('thought').value===''&&$('prior-text').value==='','private text not rendered in recipient view');
 assert(!$('idea-origin').textContent.includes('Previous work'),'no private title');
 assert(localStorage.getItem(key)===before,'no write or transmission');
 click('locale');assert(d.documentElement.dir==='ltr'&&d.body.dataset.phase==='recipient','language preserves role');
 set('reply','A second human contribution.');click('reply-meet');
 assert(d.body.dataset.phase==='returned'&&!$('accept').hidden,'independent invitation to meet');
 click('accept');assert(d.body.dataset.phase==='meeting','explicit mutual local entry');
 assert(d.body.dataset.material==='existence-field-a'&&frame.contentWindow.getComputedStyle(d.getElementById('presence-material')).display!=='none','meeting preserves the material');
 assert($('carried-text').textContent==='Shared thought.'&&$('answer-text').textContent==='A second human contribution.','original contributions remain');
 set('common','A jointly authored possibility.');click('leave');assert($('thought').value==='Private fact. Shared thought.','original restored');
 click('resume');assert($('common').value==='A jointly authored possibility.','same encounter resumes');
 click('keep');assert(d.body.dataset.phase==='private'&&$('thought').value.includes('A jointly authored possibility.'),'new work is written');
 assert(!$('thought').value.includes('Private fact.'),'new work excludes private excerpt');
 assert(localStorage.getItem(key)===before,'no automatic save');
 click('save');const saved=JSON.parse(localStorage.getItem(key));assert(saved.works.length===2&&saved.works[1].parent==='prior-work'&&saved.works[0].body==='Private fact. Shared thought.','new work retains origin');
 await load('?scene=formation');d=frame.contentDocument;assert(!d.getElementById('formation-study'),'retired scene');
 assert($('thought').value.includes('A jointly authored possibility.')&&d.documentElement.dir==='ltr','restore saved work');
 click('recall');set('find','Previous work');assert($('works').querySelectorAll('button').length===1,'recall');
 $('works').querySelector('button').click();assert($('thought').value==='Private fact. Shared thought.','recall original');
 click('prepare');set('recipient','Fictional recipient');$('masked').click();
 assert($('cast').disabled,'name required when unmasked');set('person-name','Chosen name');assert(!$('cast').disabled,'display name explicit');
 click('cast');assert($('idea-origin').textContent.includes('Chosen name'),'chosen name shown');
 click('decline');assert($('accept').hidden,'decline never creates a meeting');
 click('back-private');assert(d.body.dataset.phase==='private','continue alone');
 assert(d.documentElement.scrollWidth<=frame.clientWidth+1,'mobile bounds');
 localStorage.removeItem(key);
 result.textContent='PASS: local world, exact disclosure, distinct contributions, continuity, RTL/LTR, 320px';
})().catch(e=>{result.textContent='FAIL: '+e.message});
