import assert from 'node:assert/strict';
import {composePresence, contrastRatio, chooseReadableInk, expressionState} from '../presence-law.mjs';
const ctx={phase:'private',focus:'none',narrow:false,reducedMotion:false};
const rest=composePresence(ctx),focus=composePresence({...ctx,focus:'thought'}),mobile=composePresence({...ctx,narrow:true});
assert.deepEqual(rest,composePresence(ctx));
assert.equal(rest.material,focus.material); assert.equal(rest.frame,focus.frame);
assert.equal(focus.lightOpacity,1); assert.equal(rest.lightOpacity,.32);
assert.equal(composePresence({...ctx,focus:'locale'}).attention,'rest');
assert.equal(mobile.material,rest.material); assert.notEqual(mobile.frame,rest.frame);
assert.equal(composePresence({...ctx,focus:'mic',reducedMotion:true}).lightOpacity,1);
assert.equal(composePresence({...ctx,reducedMotion:true}).transitionMs,0);
for(const phase of ['prepare','recipient','returned','meeting']){
 const scene=composePresence({...ctx,phase});
 assert.equal(scene.material,rest.material);
 assert.equal(scene.frame,rest.frame);
 assert.equal(scene.attention,'rest');
}
assert.equal(composePresence({...ctx,phase:'meeting',focus:'common'}).attention,'express');
assert.equal(composePresence({...ctx,phase:'recipient',focus:'reply'}).attention,'express');
assert.equal(composePresence({...ctx,phase:'unknown'}),null);
assert.equal(contrastRatio([0,0,0],[255,255,255]),21);
assert.deepEqual(chooseReadableInk([[240,240,240],[41,39,45]],[[240,235,220],[217,204,217]]).ink,[41,39,45]);
assert.equal(chooseReadableInk([[127,127,127]],[[127,127,127]]),null);
assert.equal(chooseReadableInk([[0,0,0]],[[255,255,255],[0,0,0]]),null);
console.log('PASS: Presence expression invariants and declared contrast samples');

assert.deepEqual(expressionState({hasText:false}),{material:'none',capture:'idle',active:false});
assert.equal(expressionState({hasText:false,capture:'requesting'}).active,false);
assert.equal(expressionState({hasText:false,capture:'recording'}).active,true);
assert.equal(expressionState({hasText:true,capture:'ready',hasClip:true}).material,'mixed');
assert.equal(expressionState({hasText:false,capture:'ready',hasClip:true}).material,'voice');
assert.equal(composePresence({...ctx,capture:'recording'}).attention,'express');
assert.equal(composePresence({...ctx,capture:'requesting'}).attention,'rest');
assert.equal(composePresence({...ctx,phase:'recipient',capture:'recording'}).attention,'rest');
console.log('PASS: explicit expression facts, independent voice and text');
