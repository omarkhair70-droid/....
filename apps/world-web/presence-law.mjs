// Presence expression foundation. Pure rules; not a renderer or a beauty metric.
// Current proposal values mirror Presence 01.2b; no new visual identity is approved.
export function relativeLuminance(rgb) {
  if (!Array.isArray(rgb) || rgb.length!==3 || !rgb.every(v=>Number.isInteger(v)&&v>=0&&v<=255)) throw new TypeError("Expected an opaque sRGB triplet");
  const linear=rgb.map(v=>{const t=v/255;return t<=0.04045?t/12.92:((t+0.055)/1.055)**2.4});
  return 0.2126*linear[0]+0.7152*linear[1]+0.0722*linear[2];
}

export function contrastRatio(a,b) {
  const x=relativeLuminance(a),y=relativeLuminance(b);
  return (Math.max(x,y)+0.05)/(Math.min(x,y)+0.05);
}

export function chooseReadableInk(candidates, backgrounds, minimum=4.5) {
  if (!Array.isArray(candidates)||!Array.isArray(backgrounds)||backgrounds.length===0||!Number.isFinite(minimum)||minimum<1||minimum>21) throw new TypeError("Invalid authored contrast constraints");
  for (const bg of backgrounds) relativeLuminance(bg);
  for (const ink of candidates) relativeLuminance(ink);
  for (const ink of candidates) {
    const worst=Math.min(...backgrounds.map(bg=>contrastRatio(ink,bg)));
    if(worst>=minimum) return {ink:[...ink],worst};
  }
  return null;
}

export function composePresence({phase,focus,narrow,reducedMotion}) {
  if(typeof phase!=="string"||typeof focus!=="string"||typeof narrow!=="boolean"||typeof reducedMotion!=="boolean") throw new TypeError("Invalid presence context");
  if(phase!=="private")return null;
  const attention=focus==="thought"||focus==="mic"?"express":"rest";
  return {material:"presence-01",frame:narrow?"155 0 570 900":"0 0 1440 900",attention,lightOpacity:attention==="express"?1:0.32,transitionMs:reducedMotion?0:620};
}
