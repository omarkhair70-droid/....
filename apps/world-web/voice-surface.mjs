// Sound is a source, not an ornamental animation. No audio output from analysis.
export function peakEnvelope(channels,bins=96){
 if(!Array.isArray(channels)||!channels.length||!Number.isInteger(bins)||bins<2||bins>512)throw new TypeError('Invalid audio envelope');
 const n=channels[0].length;
 if(!Number.isInteger(n)||n<1||!channels.every(x=>x.length===n))throw new TypeError('Inconsistent audio channels');
 const out=[];
 for(let i=0;i<bins;i++){
  const first=Math.min(n-1,Math.floor(i*n/bins)),last=Math.min(n,Math.max(first+1,Math.floor((i+1)*n/bins)));let p=0;
  for(const data of channels)for(let j=first;j<last;j++){const v=Math.abs(data[j]);if(Number.isFinite(v)&&v>p)p=v}
  out.push(Math.min(1,p))
 }
 return out;
}
export function voiceInk(peaks,width=360,height=48){
 if(!Array.isArray(peaks)||peaks.length<2||!peaks.every(x=>Number.isFinite(x)&&x>=0&&x<=1))return '';
 const half=height/2, y=(p,side)=>(half+side*p*(half-1)).toFixed(2),x=i=>(width*i/(peaks.length-1)).toFixed(2);
 return 'M'+peaks.map((p,i)=>x(i)+' '+y(p,-1)).join('L')+'L'+peaks.map((p,i)=>x(i)+' '+y(p,1)).reverse().join('L')+'Z';
}
const clock=s=>Number.isFinite(s)&&s>=0?Math.floor(s/60)+':'+String(Math.floor(s)%60).padStart(2,'0'):'—:—';
export function createVoiceSurface({audio,player,play,playLabel,playIcon,position,positionLabel,time,recordedPath,liveInk,livePath,status,translate}){
 let clip=null,length=0,generation=0,context=null,frame=0,source=null,analyser=null,playbackError=false;
 const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const duration=()=>Number.isFinite(audio.duration)&&audio.duration>0?audio.duration:length;
 function render(){
  const d=duration(),playing=!audio.paused&&!audio.ended;
  playLabel.textContent=translate(playing?'pause':'play');positionLabel.textContent=translate('position');
  playIcon.setAttribute('d',playing?'M7 5H11V19H7ZM15 5H19V19H15Z':'M8 4 20 12 8 20Z');
  position.disabled=!(d>0);
  position.value=String(d>0?Math.round(Math.max(0,Math.min(1,audio.currentTime/d))*1000):0);
  time.textContent=clock(audio.currentTime)+' / '+(d>0?clock(d):'—:—');
  status.textContent=playbackError?translate('playError'):'';
 }
 for(const event of ['play','pause','ended','timeupdate','loadedmetadata','durationchange','seeking'])audio.addEventListener(event,render);
 audio.addEventListener('error',()=>{if(clip){playbackError=true;render()}});
 play.addEventListener('click',async()=>{if(!clip)return;const requested=clip;try{playbackError=false;if(audio.paused||audio.ended){if(audio.ended)audio.currentTime=0;await audio.play()}else audio.pause()}catch{if(clip===requested)playbackError=true}if(clip===requested)render()});
 position.addEventListener('input',()=>{const d=duration();if(d>0){try{audio.currentTime=d*Number(position.value)/1000}catch{playbackError=true}render()}});
 function setClip(next){
  if(next===clip)return;clip=next;length=0;playbackError=false;recordedPath.setAttribute('d','');const token=++generation;render();if(!next)return;
  // Offline decode only, no upload or rendered playback.
  (async()=>{try{
   if(typeof OfflineAudioContext!=='function')return;
   const decoder=new OfflineAudioContext(1,1,22050),decoded=await decoder.decodeAudioData(await next.arrayBuffer());
   if(generation!==token||next!==clip)return;
   length=decoded.duration;
   const channels=Array.from({length:decoded.numberOfChannels},(_,i)=>decoded.getChannelData(i));
   recordedPath.setAttribute('d',voiceInk(peakEnvelope(channels)));render();
  }catch{/* Native playback may still work; no invented waveform. */}})();
 }
 function stopLive(){
  if(frame)cancelAnimationFrame(frame);frame=0;liveInk.hidden=true;livePath.setAttribute('d','');
  try{source?.disconnect();analyser?.disconnect()}catch{}source=null;analyser=null;
  if(context){const old=context;context=null;try{old.close().catch(()=>{})}catch{}}
 }
 function startLive(stream){
  stopLive();
  if(reduced()||typeof AudioContext!=='function')return;
  try{
   context=new AudioContext();source=context.createMediaStreamSource(stream);analyser=context.createAnalyser();analyser.fftSize=1024;source.connect(analyser);
   const own=context,buf=new Float32Array(analyser.fftSize),history=Array(72).fill(0);let previous=0;
   own.resume().catch(()=>{});
   const tick=now=>{
    if(context!==own)return;
    if(reduced()){stopLive();return}
    if(own.state==='running'&&now-previous>=45){previous=now;analyser.getFloatTimeDomainData(buf);let peak=0;for(const v of buf)peak=Math.max(peak,Math.abs(v));history.shift();history.push(Math.min(1,peak));liveInk.hidden=false;livePath.setAttribute('d',voiceInk(history))}
    frame=requestAnimationFrame(tick)
   };
   frame=requestAnimationFrame(tick)
  }catch{stopLive()}
 }
 function sync({visible}){player.hidden=!visible;render()}
 return {setClip,startLive,stopLive,sync};
}
