// Private correspondences between explicitly authored needs and capabilities.
// An exact topic match is a hypothesis, not evidence of identity, ability or consent.
export const MAX_MARKS=12, MAX_DISMISSED=128, MAX_LINKS=32;
const id=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
export function topicKey(s){
 return typeof s==='string'?s.normalize('NFKC').toLowerCase().replace(/[\u064b-\u065f\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').trim().replace(/\s+/g,' '):'';
}
export function validMark(m){
 return !!m&&Object.keys(m).length===6&&id(m.id)&&['need','ability'].includes(m.kind)&&typeof m.topic==='string'&&m.topic.length<=80&&!!topicKey(m.topic)&&Number.isInteger(m.start)&&Number.isInteger(m.end)&&m.start>=0&&m.end>m.start&&m.end<=12000&&typeof m.excerpt==='string'&&!!m.excerpt.trim()&&m.excerpt.length<=1200&&m.excerpt.length===m.end-m.start;
}
const pairKey=(a,b)=>[a,b].sort().join(':');
export function validMind(m){
 return !!m&&Object.keys(m).length===2&&Array.isArray(m.marks)&&m.marks.length<=MAX_MARKS&&m.marks.every(validMark)&&new Set(m.marks.map(x=>x.id)).size===m.marks.length&&Array.isArray(m.dismissed)&&m.dismissed.length<=MAX_DISMISSED&&m.dismissed.every(x=>typeof x==='string'&&x.split(':').length===2&&x.split(':').every(id)&&x===pairKey(...x.split(':')))&&new Set(m.dismissed).size===m.dismissed.length;
}
export const emptyMind=()=>({marks:[],dismissed:[]});
export function makeMark({id,kind,topic,fragment}){
 const m={id,kind,topic:typeof topic==='string'?topic.trim():'',start:fragment?.start,end:fragment?.end,excerpt:fragment?.excerpt};
 if(!validMark(m))throw new TypeError('Invalid authored mark');return m;
}
export function activeMark(work,mark){return !!work&&typeof work.body==='string'&&validMark(mark)&&work.body.slice(mark.start,mark.end)===mark.excerpt}
export function correspondences(works,active){
 const w=works.find(x=>x.id===active);
 if(!w||!validMind(w.mind))return {links:[],limited:false};
 const links=[],dismissed=new Set(w.mind.dismissed),other=works.filter(x=>x.id!==active&&validMind(x.mind));
 const counts=new Map();
 for(const item of [w,...other])for(const m of item.mind.marks)counts.set(m.id,(counts.get(m.id)||0)+1);
 for(const a of w.mind.marks){
  if(!activeMark(w,a)||counts.get(a.id)!==1)continue;
  for(const source of other)for(const b of source.mind.marks){
   if(counts.get(b.id)!==1||!activeMark(source,b)||a.kind===b.kind||topicKey(a.topic)!==topicKey(b.topic))continue;
   const key=pairKey(a.id,b.id);if(dismissed.has(key)||source.mind.dismissed.includes(key))continue;
   if(links.length>=MAX_LINKS)return {links,limited:true};
   links.push({key,local:a,other:b,workId:source.id,title:source.title,kind:'hypothesis'});
  }
 }
 return {links,limited:false};
}
export function dismiss(work,key){
 const mind=work.mind??emptyMind();
 if(!validMind(mind)||typeof key!=='string'||!validMind({marks:[],dismissed:[key]}))throw new TypeError('Invalid challenge');
 if(mind.dismissed.includes(key))return mind;
 if(mind.dismissed.length>=MAX_DISMISSED)throw new RangeError('Challenge limit');
 return {marks:mind.marks,dismissed:[...mind.dismissed,key]};
}

// Historical snapshots are distinct from a currently supported relationship.
export function validBasis(basis,parent){
 if(!Array.isArray(basis)||basis.length!==2||typeof parent!=='string'||!parent)return false;
 if(!basis.every(p=>p&&Object.keys(p).length===2&&typeof p.workId==='string'&&p.workId.length>0&&p.workId.length<=80&&validMark(p.mark)))return false;
 const [a,b]=basis;
 return a.workId===parent&&a.workId!==b.workId&&a.mark.id!==b.mark.id&&a.mark.kind!==b.mark.kind&&topicKey(a.mark.topic)===topicKey(b.mark.topic);
}
export function captureBasis(workId,link){
 const basis=[{workId,mark:{...link.local}},{workId:link.workId,mark:{...link.other}}];
 if(!validBasis(basis,workId))throw new TypeError('Invalid historical basis');
 return basis;
}
