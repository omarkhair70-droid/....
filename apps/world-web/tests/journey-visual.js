'use strict';
// This is a CI-only fixture; none of these files are in the Vercel package.
// Actual app controls and state transitions, synthetic input only. No speakers.
const frame=document.getElementById('app'),state=new URLSearchParams(location.search).get('state')||'choices';
const tick=ms=>new Promise(r=>setTimeout(r,ms));
function wav(w){
 const rate=16000,count=rate*4,buf=new ArrayBuffer(44+count*2),v=new DataView(buf);
 const s=(i,t)=>{for(let j=0;j<t.length;j++)v.setUint8(i+j,t.charCodeAt(j))};
 s(0,'RIFF');v.setUint32(4,36+count*2,true);s(8,'WAVE');s(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,rate,true);v.setUint32(28,rate*2,true);v.setUint16(32,2,true);v.setUint16(34,16,true);s(36,'data');v.setUint32(40,count*2,true);
 for(let i=0;i<count;i++){const t=i/rate,env=Math.pow(Math.max(0,Math.sin(t*6.9)*Math.cos(t*2.2)),.65);const y=Math.sin(2*Math.PI*(142+23*Math.sin(t*3))*t)*env*.75;v.setInt16(44+i*2,Math.round(y*32767),true)}
 return new w.Blob([buf],{type:'audio/wav'});
}
frame.addEventListener('load',async()=>{
 try{
 const w=frame.contentWindow,d=frame.contentDocument,$=id=>d.getElementById(id),click=id=>$(id).click(),set=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new w.Event('input',{bubbles:true}))};
 if(state==='recording'||state==='trace'||state==='voice-cast'){
  const track={stop(){}};
  Object.defineProperty(w.navigator,'mediaDevices',{configurable:true,value:{getUserMedia:async()=>({getTracks:()=>[track]})}});
  class Recorder{constructor(){this.state='inactive';this.mimeType='audio/wav'}start(){this.state='recording'}stop(){this.state='inactive';this.ondataavailable({data:wav(w)});this.onstop()}}
  w.MediaRecorder=Recorder;click('mic');await tick(150);
  if(d.body.dataset.capture!=='recording')throw Error('recording was not entered');
  if(state==='trace'||state==='voice-cast'){click('mic');await tick(400);if(d.body.dataset.capture!=='ready')throw Error('trace unavailable');if(state==='voice-cast'){click('cast-voice');set('recipient','طرف في المعاينة');if($('exchange-voice').hidden)throw Error('voice crossing unavailable')}}
 }else{
  set('thought','ماذا لو استطعنا صناعة نظام يجعل المصانع ترى احتياجاتها قبل أن تتعطل؟');
  if(state==='field'){click('prepare');click('release-field');click('field-scenarios');if($('human-field').hidden)throw Error('field unavailable')}
  if(state==='formation'){click('form-fragment');set('formation-draft','نظام يتنبأ بنقص المخزون ويربط المصنع بالشريك المناسب.');$('formation').scrollIntoView({block:'start',behavior:'instant'})}
  if(state==='connection'){click('mind-mark');click('mind-need');set('mind-topic','إدارة المخزون');set('mind-counterpart','فريق يستطيع تطوير نظام ذكي لإدارة المخزون.');click('mind-keep');$('mind').scrollIntoView({block:'start',behavior:'instant'})}
  if(['cast','receive','returned','meeting','declined','born'].includes(state)){
   click('prepare');set('recipient','فريق هندسي مستقل');
   if(state!=='cast'){
    click('cast');
    if(state==='declined')click('decline');
    else if(state!=='receive'){
     set('reply','لدينا فريق يعمل على التنبؤ بالاحتياجات. يمكننا اختبار الفكرة مع مصنع واحد.');
     click('reply-meet');
     if(state==='meeting'||state==='born'){click('accept');set('common','نعمل معًا على تجربة أولى تحوّل إشارات المخزون إلى قرار مبكر.');if(state==='born')click('keep')}
    }
   }
   const expected={cast:'prepare',receive:'recipient',returned:'returned',meeting:'meeting',declined:'returned',born:'private'}[state];
   if(d.body.dataset.phase!==expected)throw Error('encounter scene was not entered');
   if(state==='meeting')$('meeting').scrollIntoView({block:'center',behavior:'instant'});
   if(state==='born'){if($('work-birth').hidden)throw Error('historical birth is missing');$('work-birth').scrollIntoView({block:'center',behavior:'instant'})}
  }
 }
 document.body.dataset.fixture='ready';
 }catch(e){const err=document.getElementById('fixture-error');err.hidden=false;err.textContent='Synthetic scene could not be rendered: '+e.message;document.body.dataset.fixture='error'}
});
frame.src='../index.html';
