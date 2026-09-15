(function(root){
'use strict';
const defaults={enabled:false,mode:'pulse',origin:'project',direction:'lr',color:'#FFFFFF',opacity:65,glow:60,cycle:7,width:2,pulseStyle:'filled',count:1,trail:50,fill:35},gridDefaults={show:true,snap:false,layouts:true,size:60};
const clone=o=>JSON.parse(JSON.stringify(o));
function number(value,name,min,max,whole=false){if(typeof value!=='number'||!Number.isFinite(value)||value<min||value>max||(whole&&!Number.isInteger(value)))throw Error(name+' must be '+(whole?'a whole number ':'')+'from '+min+' to '+max+'.');return value;}
function object(value){if(value===undefined)return {};if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Invalid canvas settings.');return value;}
function validate(value){const e={...defaults,...object(value)};if(typeof e.enabled!=='boolean')throw Error('Invalid effects toggle.');for(const [key,values] of Object.entries({mode:['pulse','sweep','wave','cross'],origin:['project','layout','top-left','top-right','bottom-left','bottom-right'],direction:['lr','rl','tb','bt'],pulseStyle:['ring','filled']}))if(!values.includes(e[key]))throw Error('Invalid effect '+key+'.');if(!/^#[0-9a-f]{6}$/i.test(e.color))throw Error('Effect color must be a six-digit HEX color.');e.color=e.color.toUpperCase();for(const key of ['opacity','glow','trail','fill'])number(e[key],key,0,100);number(e.cycle,'Cycle duration',.5,60);number(e.width,'Effect line width',.5,30);number(e.count,'Pulse count',1,8,true);return e;}
function validateGrid(value){const g={...gridDefaults,...object(value)};if(typeof g.show!=='boolean'||typeof g.snap!=='boolean'||typeof g.layouts!=='boolean')throw Error('Invalid canvas grid toggle.');number(g.size,'Grid spacing',1,10000,true);return g;}
function snap(value,g){const step=g.snap?g.size:1,limit=Math.floor(1000000/step)*step;return Math.max(-limit,Math.min(limit,Math.round(value/step)*step));}
function gridPlan(g,view){if(!g.show)return null;let multiplier=1;while(g.size*multiplier*view.scale<10)multiplier*=10;const step=g.size*multiplier;return {step,multiplier,left:Math.floor((-view.x/view.scale)/step)*step,top:Math.floor((-view.y/view.scale)/step)*step,right:(view.w-view.x)/view.scale,bottom:(view.h-view.y)/view.scale};}
function snapLayout(point,id,items,g,tolerance=10){
 const result={x:snap(point.x,g),y:snap(point.y,g)};
 if(!g.layouts)return result;
 const moving=items.find(i=>i.id===id);if(!moving)return result;
 const w=moving.scene.W,h=moving.scene.H,candidates={x:[],y:[]};
 const gap=(a,b,c,d)=>Math.max(c-b,a-d,0);
 const add=(axis,value,adjacent)=>{const distance=Math.abs(value-point[axis]);if(distance<=tolerance&&value>=-1000000&&value<=1000000)candidates[axis].push({value,distance,adjacent});};
 for(const other of items){if(other.id===id)continue;const right=other.x+other.scene.W,bottom=other.y+other.scene.H;
  if(gap(point.y,point.y+h,other.y,bottom)<=tolerance){add('x',right,true);add('x',other.x-w,true);add('x',other.x,false);add('x',right-w,false);}
  if(gap(point.x,point.x+w,other.x,right)<=tolerance){add('y',bottom,true);add('y',other.y-h,true);add('y',other.y,false);add('y',bottom-h,false);}
 }
 for(const axis of ['x','y']){candidates[axis].sort((a,b)=>a.distance-b.distance||Number(b.adjacent)-Number(a.adjacent));if(candidates[axis].length)result[axis]=candidates[axis][0].value;}
 return result;
}
function layoutRects(bounds){return bounds.items.map(i=>({x:i.x,y:i.y,w:i.scene.W,h:i.scene.H}));}
function layers(bounds,e){const rects=layoutRects(bounds),whole={x:bounds.minX,y:bounds.minY,w:bounds.W,h:bounds.H};return (e.origin==='layout'?rects:[whole]).map(b=>({bounds:b,clips:e.origin==='layout'?[b]:rects,origin:{x:b.x+(e.origin.endsWith('left')?0:e.origin.endsWith('right')?b.w:b.w/2),y:b.y+(e.origin.startsWith('top')?0:e.origin.startsWith('bottom')?b.h:b.h/2)}}));}
function phaseAt(seconds,e){return ((seconds/e.cycle)%1+1)%1;}
function sample(bounds,e,seconds){if(!e.enabled||!e.opacity)return [];const phase=phaseAt(seconds,e);return layers(bounds,e).map(layer=>{const b=layer.bounds,o=layer.origin,maxRadius=Math.max(...[b.x,b.x+b.w].flatMap(x=>[b.y,b.y+b.h].map(y=>Math.hypot(x-o.x,y-o.y)))),pulses=Array.from({length:e.count},(_,i)=>{const p=(phase+i/e.count)%1;return {radius:Math.max(.001,p*maxRadius),alpha:Math.min(1,(1-p)*5)};});return {...layer,phase,maxRadius,pulses};});}
const rgba=(hex,alpha)=>`rgba(${parseInt(hex.slice(1,3),16)},${parseInt(hex.slice(3,5),16)},${parseInt(hex.slice(5,7),16)},${Math.max(0,Math.min(1,alpha))})`;
function draw(ctx,bounds,e,seconds,scale=1){
 for(const layer of sample(bounds,e,seconds)){
  const b=layer.bounds,o=layer.origin;ctx.save();ctx.beginPath();for(const q of layer.clips)ctx.rect(q.x,q.y,q.w,q.h);ctx.clip();ctx.globalAlpha=e.opacity/100;ctx.strokeStyle=e.color;ctx.lineWidth=e.width;ctx.shadowColor=e.color;ctx.shadowBlur=Math.min(48,e.glow/100*18);ctx.lineCap='round';
  if(e.mode==='pulse')for(const pulse of layer.pulses){const r=pulse.radius;ctx.save();ctx.globalAlpha*=pulse.alpha;
   if(e.pulseStyle==='filled'&&e.fill>0){const g=ctx.createRadialGradient(o.x,o.y,0,o.x,o.y,r);g.addColorStop(0,rgba(e.color,0));g.addColorStop(Math.max(0,.96-e.trail*.007),rgba(e.color,.05*e.fill/100));g.addColorStop(1,rgba(e.color,e.fill/100));ctx.fillStyle=g;ctx.beginPath();ctx.arc(o.x,o.y,r,0,Math.PI*2);ctx.fill();}
   ctx.beginPath();ctx.arc(o.x,o.y,r,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
  else if(e.mode==='sweep'){
   const angle=layer.phase*Math.PI*2-Math.PI/2,tail=e.trail/100*Math.PI*1.5,r=layer.maxRadius;
   if(tail>0&&e.fill>0)for(let i=0;i<40;i++){const a=angle-tail*(i+1)/40,z=angle-tail*i/40;ctx.fillStyle=rgba(e.color,(1-i/40)*e.fill/100*.65);ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.arc(o.x,o.y,r,a,z);ctx.closePath();ctx.fill();}
   ctx.beginPath();ctx.moveTo(o.x,o.y);ctx.lineTo(o.x+Math.cos(angle)*r,o.y+Math.sin(angle)*r);ctx.stroke();
  }else{
   const vertical=e.direction==='tb'||e.direction==='bt',reverse=e.direction==='rl'||e.direction==='bt';
   const wave=(yAxis,backwards)=>{const span=yAxis?b.h:b.w,tail=Math.max(.001,span*e.trail/100*.5),start=yAxis?b.y:b.x,travel=layer.phase*(span+tail),head=start+(backwards?span-travel:travel),behind=head+(backwards?tail:-tail);if(e.fill>0&&e.trail>0){const g=yAxis?ctx.createLinearGradient(0,behind,0,head):ctx.createLinearGradient(behind,0,head,0);g.addColorStop(0,rgba(e.color,0));g.addColorStop(1,rgba(e.color,e.fill/100));ctx.fillStyle=g;if(yAxis)ctx.fillRect(b.x,Math.min(head,behind),b.w,tail);else ctx.fillRect(Math.min(head,behind),b.y,tail,b.h);}ctx.beginPath();if(yAxis){ctx.moveTo(b.x,head);ctx.lineTo(b.x+b.w,head);}else{ctx.moveTo(head,b.y);ctx.lineTo(head,b.y+b.h);}ctx.stroke();};
   wave(vertical,reverse);if(e.mode==='cross')wave(!vertical,!reverse);
  }
  ctx.restore();
 }
}
const API={defaults,gridDefaults,validate,validateGrid,snap,snapLayout,gridPlan,layers,phaseAt,sample,draw,clone};root.LayoutEffects=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
