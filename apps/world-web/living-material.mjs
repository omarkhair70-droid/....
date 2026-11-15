// Event-shaped material. No prediction, profiling, timers, network or persistence.
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const bounded=n=>Number.isFinite(n)?clamp(Math.floor(n),0,12000):0;
const f=n=>Number(n.toFixed(2));
export function inkPeaks(ink){
 // Only accept the closed geometry emitted by voiceInk. No invented signal on failure.
 if(typeof ink!=='string'||ink.length>30000||!ink.startsWith('M')||!ink.endsWith('Z'))return [];
 const points=ink.slice(1,-1).split('L').map(p=>p.trim().split(/\s+/).map(Number));
 if(points.length<4||points.length>1024||points.length%2||points.some(p=>p.length!==2||!p.every(Number.isFinite)))return [];
 const top=points.slice(0,points.length/2);
 if(top.some(([x,y],i)=>x<0||x>360||y<1||y>24||(i>0&&x<top[i-1][0])))return [];
 return top.map(([,y])=>clamp((24-y)/23,0,1));
}
export function livingFact({phase='private',capture='idle',length=0,peaks=[],field=false,count=0,selected=0,formation=false,related=false,born=false,reality='',outcome='',otherLength=0,commonLength=0}={}){
 const n=bounded(length), other=bounded(otherLength), common=bounded(commonLength);
 const safe=Array.isArray(peaks)?peaks.filter(Number.isFinite).slice(0,512).map(p=>clamp(p,0,1)):[];
 const materials=clamp(bounded(count),0,12), chosen=clamp(bounded(selected),0,Math.min(materials,4));
 const scene=phase==='prepare'?'crossing':phase==='recipient'?'receipt':phase==='returned'?(outcome==='declined'?'refusal':'return'):phase==='meeting'?'meeting':field?(chosen>=2?'intersection':'field'):reality?'reality':formation?'formation':born?'born':capture==='recording'||safe.length?'voice':related?'discovery':n?'expression':'rest';
 // Private microphone geometry is never represented in a crossing or shared field.
 return {scene,n:field?0:n,other,common,materials,chosen,peaks:scene==='voice'?safe:[],reality};
}
function ribbon(x,y,w,h,bend,lean){
 return 'M'+f(x)+' '+f(y)+' C'+f(x-w*1.06)+' '+f(y+h*.26)+' '+f(x+w*.2+lean)+' '+f(y+h*.42)+' '+f(x+bend)+' '+f(y+h*.52)+' S'+f(x+w*.85+lean)+' '+f(y+h*.88)+' '+f(x-w*.22)+' '+f(y+h)+' C'+f(x+w*.65+lean)+' '+f(y+h*.72)+' '+f(x-w*.24+bend)+' '+f(y+h*.56)+' '+f(x+w*.24)+' '+f(y+h*.36)+' S'+f(x-w*.45)+' '+f(y+h*.12)+' '+f(x)+' '+f(y)+'Z';
}
const density=n=>Math.log1p(n)/Math.log(12001);
export function livingForms(fact){
 const {scene,n,other,common,materials,chosen,peaks,reality}=fact;
 const forms=[],add=(d,fill,opacity,stroke='none',width=1)=>forms.push({d,fill,opacity,stroke,width});
 if(scene==='rest')return forms;
 if(scene==='field'||scene==='intersection'){
  // One strand per visible material, no invented peers; capped for rendering only.
  for(let i=0;i<materials;i++){
   const t=materials===1?.5:i/(materials-1),x=100+t*320,y=135+t*115;
   add(ribbon(x,y,30+12*(i%3),465-t*75,-35+95*t,65-100*t),'none',.58,['#66867b','#ac785b','#8d9670'][i%3],1.6);
   add(ribbon(x+9,y+18,34,450-t*75,32-66*t,30),'#9db4a0',.12);
  }
  if(chosen>=2){
   // A space of potential, not an already composed third work.
   add('M190 418C230 350 342 334 422 407C350 472 269 510 190 418Z','none',.8,'#ad785c',2);
   for(let i=0;i<chosen;i++)add('M'+(155+i*55)+' 250Q'+(225+i*22)+' 380 307 425','none',.65,'#ad785c',1.25);
  }
  return forms;
 }
 if(['receipt','return','meeting','refusal','born'].includes(scene)){
  const a=55+density(n)*80,b=50+density(other)*95;
  add(ribbon(154,195,a,540,105,100),'#315455',.78,'#6c8e83',1.5);
  add(ribbon(343,156,b,545,scene==='refusal'?145:-76,-95),'#bb8969',scene==='refusal'?.22:.69,'#e1bf95',1.4);
  for(let i=0;i<5;i++){
   const offset=i*12;
   add('M'+(120+offset)+' 247 Q'+(80+offset)+' 398 '+(232+offset)+' 465 T'+(220+offset)+' 740','none',.48,'#9bb3a2',1);
   add('M'+(324+offset)+' 213 Q'+(414-offset)+' 380 '+(scene==='refusal'?420:292)+ ' 482 T'+(scene==='refusal'?445:258+offset)+' 690','none',scene==='refusal'?.19:.55,'#b98061',1);
  }
  if(scene==='meeting')add('M186 461C232 395 332 395 383 454C332 520 243 529 186 461Z','none',.72,'#a38160',1.6);
  // A formed third material requires actual common text or an already-born work.
  if((scene==='meeting'&&common>0)||scene==='born'){
   add(ribbon(281,330,78+density(common||n)*96,415,-84,21),'#82a89c',.91,'#e3d8b6',1.3);
   add('M280 370C192 464 349 514 265 704','none',.78,'#f1dbad',2);
  }
  return forms;
 }
 if(scene==='voice'){
  if(!peaks.length)return forms;
  // Actual recorded or microphone peaks modulate each filament, including silence.
  const samples=Array.from({length:32},(_,i)=>peaks[Math.min(peaks.length-1,Math.floor(i*peaks.length/32))]);
  for(let k=0;k<9;k++){
   const points=samples.map((p,i)=>[80+i*11,250+k*18+(k-4)*p*11+Math.sin(i/31*Math.PI)*p*70]);
   add('M'+points.map(([x,y])=>f(x)+' '+f(y)).join('L'),'none',.38+k*.045,k%3===0?'#e2ad77':'#a6c2ac',k%3===0?1.7:1);
  }
  return forms;
 }
 const d=density(n);
 const opening=scene==='crossing'?130:scene==='formation'?65:scene==='discovery'?90:scene==='reality'?reality==='challenges'?-75:35:38;
 const h=420+d*120;
 for(let i=0;i<7;i++){
  const x=84+i*(18+d*8),y=150+i*19;
  add(ribbon(x,y,30+d*35,h-i*9,opening+i*7,15+i*4),'none',.32+i*.055,i%3===0?'#cfaa77':'#99b5a3',i%3===0?1.8:1.05);
 }
 if(scene==='formation'||scene==='discovery'||scene==='crossing'||scene==='reality'){
  add(ribbon(254,185,70+d*55,490,opening,90),scene==='reality'&&reality==='challenges'?'#ba886b':'#8eaca0',.38,'#bda481',1);
 }
 return forms;
}
export function attachLivingMaterial({document,matchMedia,read}){
 const svg=document.getElementById('presence-material')?.querySelector('svg');
 if(!svg)return null;
 const ns='http://www.w3.org/2000/svg',group=document.createElementNS(ns,'g');
 group.id='living-material';group.setAttribute('aria-hidden','true');group.setAttribute('pointer-events','none');
 // One layer in the canonical SVG, below the reading surface.
 svg.insertBefore(group,document.getElementById('continuum-nodes'));
 const narrow=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)'),forced=matchMedia('(forced-colors:active)');
 let previous='',lastScene='',nodes=[];
 function sync(){
  if(document.hidden)return;
  const fact=livingFact(read()),forms=livingForms(fact),mobile=narrow.matches;
  const signature=JSON.stringify([fact.scene,mobile,forced.matches,forms]);
  if(signature===previous)return;previous=signature;
  group.dataset.scene=fact.scene;
  group.setAttribute('transform',mobile?'translate(5 77) scale(.25)':'translate(0 0)');
  group.setAttribute('visibility',forced.matches?'hidden':'visible');
  const count=forced.matches?0:forms.length;
  while(nodes.length<count){const p=document.createElementNS(ns,'path');p.setAttribute('stroke-linecap','round');p.setAttribute('stroke-linejoin','round');group.append(p);nodes.push(p)}
  while(nodes.length>count)nodes.pop().remove();
  for(let i=0;i<count;i++){
   const p=nodes[i],o=forms[i];
   for(const [k,v] of Object.entries({d:o.d,fill:o.fill,opacity:o.opacity,stroke:o.stroke,'stroke-width':o.width}))p.setAttribute(k,String(v));
  }
  if(lastScene!==fact.scene){
   group.getAnimations?.().forEach(a=>a.cancel());
   if(count&&!reduced.matches)group.animate?.([{opacity:.25},{opacity:1}],{duration:480,easing:'cubic-bezier(.2,.65,.3,1)'});
   lastScene=fact.scene;
  }
 }
 const observer=new MutationObserver(sync);
 observer.observe(document.body,{attributes:true,attributeFilter:['data-phase','data-presence','data-expression','data-capture','data-human-field','data-forming','data-work-life','data-reality-reading','data-reality','data-encounter-outcome','data-correspondence']});
 for(const id of ['world-live-ink','world-recorded-ink']){
  const el=document.getElementById(id);if(el)observer.observe(el,{attributes:true,attributeFilter:['d']});
 }
 const field=document.getElementById('human-field');if(field)observer.observe(field,{subtree:true,childList:true,attributes:true,attributeFilter:['aria-pressed','hidden']});
 const mind=document.getElementById('mind');if(mind)observer.observe(mind,{attributes:true,attributeFilter:['hidden']});
 document.addEventListener('input',sync);
 document.addEventListener('visibilitychange',sync);
 for(const media of [narrow,reduced,forced])media.addEventListener('change',()=>{previous='';if(reduced.matches)group.getAnimations?.().forEach(a=>a.cancel());sync()});
 sync();return {sync};
}

// A visual object for an explicitly disclosed thought. This is not a biometric or semantic signature.
// Geometry varies with the number of disclosed words/lines and its position in the current field.
export function materialContour({text='',voice=false,position=0,selected=false}={}){
 const s=typeof text==='string'?text.trim().slice(0,6000):'',words=s?s.split(/\s+/u).length:0;
 const lines=s?s.split(/\r?\n/u).length:0,rank=bounded(position)%5;
 const span=clamp(24+Math.log1p(words)*11,24,80),bias=(rank-2)*7, lift=clamp(11+lines*3,11,26);
 const palette=voice?['#ad7959','#edd1a0','#36585a']:rank%3===1?['#ac785b','#e7c399','#4e7270']:['#365b59','#b6c9ae','#b98560'];
 const marks=[],put=(d,fill,stroke='none',opacity=1,width=1)=>marks.push({d,fill,stroke,opacity,width});
 const center=100+bias;
 put(`M${center} 9 C${center-span} 18 ${center-span-9} 91 ${center-14} 117 C${center+span-3} 94 ${center+span+15} 28 ${center} 9Z`,palette[0],'none',.96);
 put(`M${center-6} 16 C${center-span*.58} 39 ${center-span*.64} 84 ${center-12} 109 C${center+span*.9} 76 ${center+span*.66} 32 ${center-6} 16Z`,palette[1],'none',.72);
 put(`M${center+lift} 21 C${center-span*.34} 31 ${center-span*.36} 87 ${center-6} 98 C${center+span*.62} 72 ${center+span*.49} 44 ${center+lift} 21Z`,palette[0],'none',.92);
 for(let i=0;i<9;i++){const off=i*4;put(`M${center-span*.72+off} 26 Q${center-span*.88+off} ${62+i*3} ${center+span*.46-off*.24} 103`,'none',palette[1],.56, .7);}
 // Selected matter keeps its own shape; a new path leaves it toward a potential intersection.
 if(selected)put(`M${center+span*.8} 57 Q${center+span+10} 55 198 61`,'none','#a77656',.96,2);
 return marks;
}
