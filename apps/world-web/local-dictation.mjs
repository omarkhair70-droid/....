// Explicit, optional on-device speech recognition. No remote fallback or pack installation.
// The recording remains the source; recognition output is never authoritative.
export function createLocalDictation({getRecognition,onChange=()=>{},schedule=setTimeout,unschedule=clearTimeout}){
 let session=null,draft=null;
 const terminal=s=>['off','ready','empty','unavailable','failed'].includes(s.status);
 const publish=()=>onChange(snapshot());
 const snapshot=()=>({status:session?.status??draft?.status??'off',live:session?.preview??'',draft:session?null:draft});
 const supported=()=>{try{const C=getRecognition();return typeof C==='function'&&typeof C.available==='function'&&'processLocally' in C.prototype}catch{return false}};
 function dispose(s){if(s.timer!==null){unschedule(s.timer);s.timer=null}try{s.recognizer?.abort()}catch{}}
 function settle(s){
  if(session!==s||!s.clip||!terminal(s))return;
  if(s.timer!==null)unschedule(s.timer);
  draft={clip:s.clip,text:s.final,status:s.status};session=null;
 }
 function finish(s,status){
  if(session!==s||terminal(s))return;
  if(s.timer!==null){unschedule(s.timer);s.timer=null}
  s.status=status;s.preview='';settle(s);publish();
 }
 function cancel(){const old=session;session=null;if(old)dispose(old);publish()}
 async function start(stream,lang,enabled){
  cancel();const s={status:enabled?'checking':'off',clip:null,preview:'',final:'',recognizer:null,timer:null,stopped:false};session=s;publish();
  if(!enabled)return;
  try{
   const C=getRecognition(),track=stream.getAudioTracks?.()[0];
   if(!supported()||!track||track.kind!=='audio'||track.readyState!=='live'){finish(s,'unavailable');return}
   const availability=await C.available({langs:[lang],processLocally:true,quality:'dictation'});
   if(session!==s||s.stopped||terminal(s))return;
   if(availability!=='available'){finish(s,'unavailable');return}
   const r=new C();s.recognizer=r;r.processLocally=true;
   if(r.processLocally!==true){finish(s,'unavailable');return}
   r.lang=lang;r.continuous=true;r.interimResults=true;
   r.onresult=e=>{
    if(session!==s||terminal(s))return;
    const results=Array.from(e.results);
    s.final=results.filter(x=>x.isFinal).map(x=>x[0].transcript).join(' ').trim().slice(0,12000);
    s.preview=results.map(x=>x[0].transcript).join(' ').trim().slice(0,12000);publish()
   };
   r.onerror=()=>finish(s,s.final?'ready':'failed');
   r.onend=()=>finish(s,s.final?'ready':'empty');
   s.status='listening';r.start(track);publish();
  }catch{finish(s,'failed')}
 }
 function stop(){
  const s=session;if(!s||terminal(s))return;s.stopped=true;
  if(!s.recognizer){finish(s,'empty');return}
  s.status='finishing';publish();
  s.timer=schedule(()=>{if(session!==s||terminal(s))return;finish(s,s.final?'ready':'empty');try{s.recognizer.abort()}catch{}},3000);
  try{s.recognizer.stop()}catch{finish(s,s.final?'ready':'failed');try{s.recognizer.abort()}catch{}}
 }
 function complete(clip){if(!session)return;if(!clip){cancel();return}session.clip=clip;settle(session);publish()}
 function reset(){const old=session;session=null;draft=null;if(old)dispose(old);publish()}
 function edit(value){if(!session&&draft&&typeof value==='string'&&value.length<=12000){draft={...draft,text:value};publish()}}
 function consume(){if(!session&&draft){draft={...draft,text:'',status:'empty'};publish()}}
 return {snapshot,supported,start,stop,complete,cancel,reset,edit,consume};
}
