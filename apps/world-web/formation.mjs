// A fragment is authored, not inferred. Offsets are UTF-16, as in native textarea selection.
const MAX=12000;
export function captureFragment(work,start,end){
 if(!work||typeof work.id!=='string'||!work.id||typeof work.body!=='string'||work.body.length>MAX)throw new TypeError('Invalid source work');
 const body=work.body;
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<0||end<start||end>body.length)throw new RangeError('Invalid selection');
 if(start===end){start=0;end=body.length}
 const splitsPair=i=>i>0&&i<body.length&&/[\uD800-\uDBFF]/.test(body[i-1])&&/[\uDC00-\uDFFF]/.test(body[i]);
 if(splitsPair(start)||splitsPair(end))throw new RangeError('Selection splits a character');
 const excerpt=body.slice(start,end);
 if(!excerpt.trim())return null;
 return Object.freeze({sourceId:work.id,start,end,excerpt});
}
export function validOrigin(o,parent){
 return !!o&&typeof parent==='string'&&parent.length>0&&parent.length<=80&&o.sourceId===parent&&Number.isInteger(o.start)&&Number.isInteger(o.end)&&o.start>=0&&o.end<=MAX&&o.end>o.start&&typeof o.excerpt==='string'&&!!o.excerpt.trim()&&o.excerpt.length===o.end-o.start;
}
export function formWork({source,fragment,text,id,title}){
 if(!source||!validOrigin(fragment,source.id)||typeof id!=='string'||!id||id===source.id||id.length>80||typeof title!=='string'||!title.trim()||title.length>240||typeof text!=='string'||!text.trim()||text.length>MAX)throw new TypeError('Invalid authored formation');
 // The captured excerpt remains exactly as selected even if the original is later revised.
 return {id,title,body:text,idea:'',ideaOpen:false,parent:source.id,origin:{...fragment}};
}
