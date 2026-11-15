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

// A remembered mention is weaker than a correspondence.
// Only active, explicitly marked local excerpts can be surfaced. No inferred role.
export function rememberedMentions(works,active){
 const w=works.find(x=>x.id===active);
 if(!w||typeof w.body!=='string'||!w.body.trim())return [];
 const body=topicKey(w.body),known=new Set(validMind(w.mind)?w.mind.marks.map(m=>topicKey(m.topic)):[]);
 const counts=new Map();
 for(const source of works)if(validMind(source.mind))for(const m of source.mind.marks)counts.set(m.id,(counts.get(m.id)||0)+1);
 const seen=new Set(),found=[];
 for(const source of works){
  if(source.id===active||!validMind(source.mind))continue;
  for(const m of source.mind.marks){
   const topic=topicKey(m.topic);
   if(topic.length<4||!/\p{L}/u.test(topic)||known.has(topic)||counts.get(m.id)!==1||!activeMark(source,m)||seen.has(m.id))continue;
   // Match whole Unicode word/phrase boundaries; no substring guesses.
   const word=/[\p{L}\p{N}\p{M}_]/u;
   let at=body.indexOf(topic),hit=false;
   while(at!==-1){
    const before=Array.from(body.slice(0,at)).pop()||'',after=Array.from(body.slice(at+topic.length))[0]||'';
    if(!word.test(before)&&!word.test(after)){hit=true;break}
    at=body.indexOf(topic,at+1);
   }
   if(!hit)continue;
   seen.add(m.id);found.push({key:m.id,workId:source.id,mark:{...m},kind:'mention'});
   if(found.length>=6)return found;
  }
 }
 return found;
}

// A composition retains only deliberately selected, disclosed text (never audio or private source bodies).
export function validFieldBasis(b){
 const txt=(s,n)=>typeof s==='string'&&s.length<=n&&!!s.trim();
 return !!b&&Object.keys(b).length===3&&Array.isArray(b.sources)&&b.sources.length>=2&&b.sources.length<=4&&new Set(b.sources.map(s=>s?.id)).size===b.sources.length&&b.sources.every(s=>!!s&&Object.keys(s).length===3&&txt(s.id,80)&&['local','scenario'].includes(s.kind)&&txt(s.text,6000))&&txt(b.question,2000)&&txt(b.initial,12000);
}
export function composeFieldWork({sources,question,body,id,title,parent=null}){
 const fieldBasis={sources:sources.map(({id,kind,text})=>({id,kind,text})),question,initial:body};
 if(!validFieldBasis(fieldBasis)||typeof id!=='string'||!id||id.length>80||typeof title!=='string'||!title.trim()||title.length>240||(parent!==null&&(typeof parent!=='string'||!parent||parent.length>80||parent===id)))throw new TypeError('Invalid field composition');
 return {id,title,body,idea:'',ideaOpen:false,parent,fieldBasis};
}

// Evidence is an authored observation, not verified external truth. The work changes only by an explicit human decision.
const realityText=(x,n)=>typeof x==='string'&&x.length<=n&&!!x.trim();
export function validReality(r){
 return Array.isArray(r)&&r.length<=12&&new Set(r.map(e=>e?.id)).size===r.length&&r.every(e=>!!e&&Object.keys(e).length===9&&['reported','scenario'].includes(e.kind)&&realityText(e.id,80)&&realityText(e.observation,2000)&&realityText(e.source,500)&&['supports','challenges','unclear'].includes(e.reading)&&['revise','hold','stop'].includes(e.decision)&&realityText(e.before,12000)&&realityText(e.after,12000)&&(e.decision==='revise'?e.before!==e.after:e.before===e.after)&&realityText(e.next,1000));
}
export function meetReality(work,{id,kind,observation,source,reading,decision,revision,next}){
 if(!work||!realityText(work.body,12000)||!validReality(work.reality??[])||(work.reality??[]).length>=12)throw new TypeError('Invalid reality history');
 const entry={id,kind,observation,source,reading,decision,before:work.body,after:decision==='revise'?revision:work.body,next};
 const reality=[...(work.reality??[]),entry];
 if(!validReality(reality))throw new TypeError('Invalid authored observation or decision');
 return {...work,body:entry.after,reality};
}
