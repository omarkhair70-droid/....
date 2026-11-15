// Portable exchange is plaintext, user-carried data, NOT authenticated delivery.
export const VAULT_KEY='telefshen.encounters.v1';
export const MAX_PACKET_BYTES=65536;
const uid=x=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
const word=(x,n)=>typeof x==='string'&&x.length<=n&&!!x.trim();
const exact=(x,keys)=>!!x&&typeof x==='object'&&!Array.isArray(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
export function validatePacket(p){
 if(!p||p.version!==1||!uid(p.id)||!uid(p.token))return false;
 if(p.kind==='idea')return exact(p,['version','kind','id','token','text','recipient','sender'])&&word(p.text,6000)&&word(p.recipient,160)&&(p.sender===null||word(p.sender,120));
 if(p.kind==='reply')return exact(p,['version','kind','id','token','outcome','text'])&&['contribution','invite','decline'].includes(p.outcome)&&(p.outcome==='decline'?p.text==='':word(p.text,6000));
 return false;
}
export function makeIdea({id,token,text,recipient,sender}){
 const p={version:1,kind:'idea',id,token,text,recipient,sender};if(!validatePacket(p))throw new TypeError('Invalid idea packet');return p;
}
export function makeReply(idea,outcome,text){
 if(!validatePacket(idea)||idea.kind!=='idea')throw new TypeError('Invalid original packet');
 const p={version:1,kind:'reply',id:idea.id,token:idea.token,outcome,text:outcome==='decline'?'':text};
 if(!validatePacket(p))throw new TypeError('Invalid reply');return p;
}
export function parsePacket(raw){
 if(typeof raw!=='string'||new TextEncoder().encode(raw).length>MAX_PACKET_BYTES)throw new RangeError('Packet too large');
 const p=JSON.parse(raw);if(!validatePacket(p))throw new TypeError('Unrecognized packet');return p;
}
export function serializePacket(p){if(!validatePacket(p))throw new TypeError('Invalid packet');const raw=JSON.stringify(p);if(new TextEncoder().encode(raw).length>MAX_PACKET_BYTES)throw new RangeError('Packet too large');return raw}
export function parseVault(raw){
 if(raw===null)return [];
 if(typeof raw!=='string'||raw.length>1500000)throw new TypeError('Invalid correspondence vault');
 const a=JSON.parse(raw);
 if(!Array.isArray(a)||a.length>24||!a.every(r=>exact(r,['idea','sourceId'])&&validatePacket(r.idea)&&r.idea.kind==='idea'&&word(r.sourceId,80))||new Set(a.map(r=>r.idea.id)).size!==a.length)throw new TypeError('Invalid correspondence vault');
 return a;
}
export function matchReply(reply,records){
 if(!validatePacket(reply)||reply.kind!=='reply')return null;
 return records.find(r=>r.idea.id===reply.id&&r.idea.token===reply.token)||null;
}
