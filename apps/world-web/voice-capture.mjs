// Voice is a local, explicit act. No upload, transcription or implicit storage.
export function createVoiceCapture({getStream,makeRecorder,onChange=()=>{},schedule=setTimeout,unschedule=clearTimeout,maxMs=90000,maxBytes=12*1024*1024}){
 let state='idle',error=null,clip=null,current=null;
 const snapshot=()=>({state,error,clip});
 const publish=()=>onChange(snapshot());
 function release(session){
  if(session.timer!==null){unschedule(session.timer);session.timer=null}
  const tracks=session.stream?.getTracks()||[];
  session.stream=null;
  for(const track of tracks){try{track.stop()}catch{}}
 }
 function abandon(reason=null,clear=false){
  const session=current;current=null;
  if(session){try{if(session.recorder&&session.recorder.state!=='inactive')session.recorder.stop()}catch{}release(session)}
  if(clear)clip=null;
  state=clip?'ready':'idle';error=reason;publish();
 }
 function stop(){
  const session=current;
  if(!session||state!=='recording')return;
  state='stopping';publish();
  try{if(session.recorder.state!=='inactive')session.recorder.stop();release(session)}catch{if(current===session)abandon('noMic')}
 }
 async function toggle(){
  if(state==='requesting'){abandon();return}
  if(state==='recording'){stop();return}
  if(state==='stopping')return;
  const session={stream:null,recorder:null,timer:null,chunks:[],size:0};current=session;state='requesting';error=null;publish();
  try{
   const stream=await getStream();
   if(current!==session){for(const track of stream.getTracks()){try{track.stop()}catch{}}return}
   session.stream=stream;
   const recorder=makeRecorder(stream);session.recorder=recorder;
   recorder.ondataavailable=event=>{
    if(current!==session)return;
    if(session.size+event.data.size>maxBytes){abandon('voiceLimit');return}
    session.size+=event.data.size;if(event.data.size)session.chunks.push(event.data);
   };
   recorder.onerror=()=>{if(current===session)abandon('noMic')};
   recorder.onstop=()=>{
    if(current!==session)return;
    current=null;release(session);
    if(session.size){clip=new Blob(session.chunks,{type:recorder.mimeType||session.chunks[0]?.type||''});error=null}
    else error='noMic';
    state=clip?'ready':'idle';publish();
   };
   recorder.start(500);
   if(current!==session)return;
   state='recording';
   session.timer=schedule(()=>{if(current===session)stop()},maxMs);publish();
  }catch{if(current===session)abandon('noMic')}
 }
 return {snapshot,toggle,stop,discard:()=>abandon(null,true),cancel:()=>{if(current)abandon()},clear:()=>{clip=null;if(!current){state='idle';error=null}publish()}};
}
