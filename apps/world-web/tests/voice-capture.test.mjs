import assert from 'node:assert/strict';
import {createVoiceCapture} from '../voice-capture.mjs';

const fake=()=>{const track={stops:0,stop(){this.stops++}};return {track,getTracks:()=>[track]}};
class FakeRecorder{constructor(){this.state='inactive';this.mimeType='audio/webm';this.stops=0}start(){this.state='recording'}stop(){this.state='inactive';this.stops++}data(s){this.ondataavailable({data:new Blob([s])})}finish(){this.onstop()}fail(){this.onerror()}}
let rec,stream=fake(),requested=0,scheduled;
const voice=createVoiceCapture({getStream:async()=>{requested++;return stream},makeRecorder:()=>rec=new FakeRecorder(),schedule:f=>{scheduled=f;return 1},unschedule:()=>{},maxBytes:8});
assert.equal(voice.snapshot().state,'idle');
await voice.toggle();assert.equal(voice.snapshot().state,'recording');rec.data('abc');await voice.toggle();
assert.equal(voice.snapshot().state,'stopping');assert.equal(stream.track.stops,1);await voice.toggle();assert.equal(requested,1);
rec.finish();assert.equal(voice.snapshot().state,'ready');assert.equal(voice.snapshot().clip.size,3);const first=voice.snapshot().clip;
stream=fake();await voice.toggle();rec.fail();rec.data('z');rec.finish();assert.equal(voice.snapshot().clip,first);assert.equal(voice.snapshot().error,'noMic');assert.equal(stream.track.stops,1);
stream=fake();await voice.toggle();rec.data('123456789');assert.equal(voice.snapshot().error,'voiceLimit');assert.equal(voice.snapshot().clip,first);assert.equal(stream.track.stops,1);
voice.clear();assert.equal(voice.snapshot().clip,null);
stream=fake();await voice.toggle();scheduled();assert.equal(voice.snapshot().state,'stopping');rec.data('ok');rec.finish();assert.equal(voice.snapshot().clip.size,2);
voice.discard();assert.equal(voice.snapshot().state,'idle');
let resolve;const late=fake();const pending=createVoiceCapture({getStream:()=>new Promise(r=>{resolve=r}),makeRecorder:()=>{throw Error('must not construct')}});
const start=pending.toggle();assert.equal(pending.snapshot().state,'requesting');await pending.toggle();resolve(late);await start;assert.equal(late.track.stops,1);assert.equal(pending.snapshot().state,'idle');
const denied=createVoiceCapture({getStream:async()=>{throw Error('denied')},makeRecorder:()=>{throw Error('must not construct')}});await denied.toggle();assert.equal(denied.snapshot().error,'noMic');
console.log('PASS: voice lifecycle, bounded recording, stop race, permission cancellation and prior clip preservation');

let observed=[];let hooked;
const hooks=createVoiceCapture({getStream:async()=>fake(),makeRecorder:()=>hooked=new FakeRecorder(),onStart:()=>observed.push('start'),onStop:()=>observed.push('stop'),onComplete:b=>observed.push(b?'clip':'empty'),onCancel:()=>observed.push('cancel'),schedule:()=>1,unschedule:()=>{}});
await hooks.toggle();hooked.data('x');hooks.stop();hooked.finish();assert.deepEqual(observed,['start','stop','clip']);
await hooks.toggle();hooks.cancel();assert.equal(observed.at(-1),'cancel');
