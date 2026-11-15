import assert from 'node:assert/strict';
import {createLocalDictation} from '../local-dictation.mjs';
let instance,availability='available',calls=0, timer;
const track={kind:'audio',readyState:'live'},stream={getAudioTracks:()=>[track]};
class Recognition{
 static async available(options){assert.equal(options.processLocally,true);assert.equal(options.quality,'dictation');return availability}
 get processLocally(){return this.local}set processLocally(v){this.local=v}
 start(t){assert.equal(this.processLocally,true);assert.equal(t,track);instance=this;calls++}
 stop(){}abort(){this.aborted=true}
 result(items){this.onresult({results:items.map(([transcript,isFinal])=>Object.assign([{transcript}],{isFinal}))})}
}
const d=createLocalDictation({getRecognition:()=>Recognition,schedule:f=>{timer=f;return 1},unschedule:()=>{}});
assert.equal(d.supported(),true);
await d.start(stream,'ar-EG',false);assert.equal(calls,0);d.complete(new Blob(['off']));
await d.start(stream,'ar-EG',true);assert.equal(calls,1);
instance.result([['first',true],['not final',false]]);
assert.equal(d.snapshot().live,'first not final');assert.equal(d.snapshot().draft,null);
d.stop();const clip=new Blob(['audio']);d.complete(clip);assert.equal(d.snapshot().draft,null);
instance.result([['first',true],['second',true]]);instance.onend();
assert.equal(d.snapshot().draft.text,'first second');assert.equal(d.snapshot().draft.clip,clip);
d.edit('human correction');assert.equal(d.snapshot().draft.text,'human correction');
availability='downloadable';await d.start(stream,'ar-EG',true);assert.equal(calls,1);
d.cancel();assert.equal(d.snapshot().draft.text,'human correction');
availability='available';await d.start(stream,'en-US',true);const stale=instance;
d.cancel();stale.result([['stale',true]]);assert.equal(d.snapshot().draft.text,'human correction');
await d.start(stream,'en-US',true);instance.result([['final',true]]);d.stop();d.complete(new Blob(['next']));timer();assert.equal(d.snapshot().draft.text,'final');
d.consume();assert.equal(d.snapshot().draft.text,'');d.reset();assert.equal(d.snapshot().draft,null);
let resolve;
class Slow extends Recognition{static available(){return new Promise(r=>{resolve=r})}}
const late=createLocalDictation({getRecognition:()=>Slow});
const wait=late.start(stream,'ar-EG',true);late.stop();late.complete(new Blob(['short']));resolve('available');await wait;assert.equal(late.snapshot().status,'empty');
console.log('PASS: opt-in, device-only, results review, clip provenance, cancellation and timeout');
