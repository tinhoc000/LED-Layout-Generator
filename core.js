(function(root){
'use strict';
const Effects=root.LayoutEffects||(typeof require!=='undefined'?require('./effects.js'):null);
const defaults={app:'LED Layout Generator',version:'3.15',test_color1:"#F00058",test_color2:"#530022",test_line:"#C5D4FF",test_text:"#A7E8FF",test_badge:"#080D18",test_title:"",test_crosses:true,test_circle:true,test_centerlines:true,test_centerlabel:true,test_modules:false,test_labels:false,cabinet_dark1:'#D71920',cabinet_dark2:'#137E36',cabinet_dark3:'#154FC2',cabinet_light1:'#E64F55',cabinet_light2:'#369A55',cabinet_light3:'#4778CE',cabinet_text:'#FFFFFF',cabinet_grid:'#FFFFFF',layout_style:'classic',show_cabinet_labels:true,projectName:'Untitled layout',revision:'1',modules_wide:168,row_groups:'9,9,9,8,8',col_groups:Array(28).fill(6).join(','),sections_per_alpha_block:7,horizontal_view:'Front',vertical_order:'Bottom to Top',color1:'#F4CCCC',color2:'#FFF2CC',text_color:'#111827',grid_color:'#475569',module_width:60,module_height:60,grid_thickness:1,section_thickness:3,block_thickness:5,show_labels:true,show_headings:true,section_colors:{},module_status:{},section_labels:{},module_labels:{},module_colors:{},paper:'A3',landscape:true,margin:12,tile_cols:24,tile_rows:18};
const clone=o=>JSON.parse(JSON.stringify(o));
function list(v){const parts=Array.isArray(v)?v:String(v).split(','),a=[];for(const part of parts){const m=String(part).trim().match(/^(\d+)(?:\s*[x×]\s*(\d+))?$/i);if(!m)throw Error('Use positive numbers separated by commas, or repeats such as 6x28.');const n=Number(m[1]),count=Number(m[2]||1);if(!Number.isSafeInteger(n)||n<1||n>10000||!Number.isSafeInteger(count)||count<1||a.length+count>10000)throw Error('Section sizes and counts must be from 1 to 10,000.');for(let j=0;j<count;j++)a.push(n);}if(!a.length)throw Error('Enter at least one section.');return a;}
function compact(a){const out=[];for(let i=0;i<a.length;){let j=i+1;while(j<a.length&&a[j]===a[i])j++;out.push(j-i>1?a[i]+'x'+(j-i):String(a[i]));i=j;}return out.join(', ');}
function splitEven(total,count){integer(total,'Total modules',1,10000);integer(count,'Section count',1,total);const base=Math.floor(total/count),extra=total%count;return Array.from({length:count},(_,i)=>base+(i<extra?1:0));}
function integer(v,name,min=1,max=100000){const n=Number(v);if(!Number.isSafeInteger(n)||n<min||n>max)throw Error(name+' must be a whole number from '+min+' to '+max+'.');return n}
function hex(v){if(!/^#[0-9a-f]{6}$/i.test(v))throw Error('Colors must use six-digit HEX values, such as #F4CCCC.');return v.toUpperCase()}
function alpha(i){let s='';for(let n=i+1;n>0;n=Math.floor((n-1)/26))s=String.fromCharCode(65+(n-1)%26)+s;return s}
function normalize(input){
 if(!input||typeof input!=='object'||Array.isArray(input))throw Error('This file is not a layout project.');
 if(input.app&&input.app!=='LED Layout Generator')throw Error('This file belongs to a different application.');
 if(!('row_groups' in input)&&!('rowGroups' in input))throw Error('This file has no layout sections.');
 const o=Object.assign(clone(defaults),input);
 const aliases={modulesWide:'modules_wide',rowGroups:'row_groups',colGroups:'col_groups',sectionsPerBlock:'sections_per_alpha_block',horizontalView:'horizontal_view',verticalOrder:'vertical_order',moduleWidth:'module_width',moduleHeight:'module_height',showLabels:'show_labels'};
 for(const [a,b] of Object.entries(aliases))if(input[a]!==undefined&&input[b]===undefined)o[b]=input[a];
 if(input.cell_size!==undefined){if(input.module_width===undefined&&input.moduleWidth===undefined)o.module_width=input.cell_size;if(input.module_height===undefined&&input.moduleHeight===undefined)o.module_height=input.cell_size;}
 return validate(o).o;
}
function validate(input,nested=false){
 const o=clone(input),rg=list(o.row_groups),cg=list(o.col_groups),rows=rg.reduce((a,b)=>a+b,0),cols=cg.reduce((a,b)=>a+b,0);
 for(const k of ['physical_width','physical_height','units','assignments','route','show_route'])delete o[k];
 integer(cols,'Total columns',1,10000);integer(rows,'Total rows',1,10000);
 if(cols*rows>150000)throw Error('This layout exceeds 150,000 modules. Split it into smaller projects.');
 integer(o.modules_wide,'Modules wide',1,10000);
 if(Number(o.modules_wide)!==cols)throw Error('Width mismatch: '+o.modules_wide+' modules requested, but sections total '+cols+'. Adjust sections or use their total.');
 o.modules_wide=cols;o.row_groups=rg.join(',');o.col_groups=cg.join(',');
 o.sections_per_alpha_block=integer(o.sections_per_alpha_block,'Sections per alphabet block',1,10000);
 o.module_width=integer(o.module_width,'Module width',2,2000);o.module_height=integer(o.module_height,'Module height',2,2000);
 for(const k of ['grid_thickness','section_thickness','block_thickness'])o[k]=integer(o[k],k.replaceAll('_',' '),0,30);
 for(const k of ["cabinet_dark1","cabinet_dark2","cabinet_dark3","cabinet_light1","cabinet_light2","cabinet_light3","cabinet_text","cabinet_grid"])o[k]=hex(o[k]===undefined?defaults[k]:o[k]);
 for(const k of ["test_color1","test_color2","test_line","test_text","test_badge"])o[k]=hex(o[k]===undefined?defaults[k]:o[k]);
 for(const k of ["test_crosses","test_circle","test_centerlines","test_centerlabel","test_modules","test_labels"]){if(o[k]===undefined)o[k]=defaults[k];if(typeof o[k]!=='boolean')throw Error('Invalid test pattern option: '+k);}
 if(o.test_title===undefined)o.test_title='';if(typeof o.test_title!=='string'||o.test_title.length>40||/[\x00-\x1f\x7f]/.test(o.test_title))throw Error('Test pattern title must be 0-40 characters on one line.');
 for(const k of ['color1','color2','text_color','grid_color'])o[k]=hex(o[k]);
 if(!['Front','Rear'].includes(o.horizontal_view)||!['Bottom to Top','Top to Bottom'].includes(o.vertical_order))throw Error('Choose a valid viewing direction.');
 for(const k of ['show_labels','show_headings','landscape'])if(typeof o[k]!=='boolean')throw Error('Invalid project option: '+k);
 if(!['A4','A3','Letter','Tabloid'].includes(o.paper))throw Error('Choose a supported paper size.');
 o.margin=integer(o.margin,'Page margin',5,40);o.tile_cols=integer(o.tile_cols,'Columns per detail page',1,1000);o.tile_rows=integer(o.tile_rows,'Rows per detail page',1,1000);
 o.projectName=String(o.projectName||'Untitled layout').slice(0,100);o.revision=String(o.revision||'1').slice(0,30);o.version='3.15';
 if(o.layout_style===undefined)o.layout_style='classic';if(!['classic','cabinet','test'].includes(o.layout_style))throw Error('Choose a supported label and layout style.');if(o.show_cabinet_labels===undefined)o.show_cabinet_labels=true;if(typeof o.show_cabinet_labels!=='boolean')throw Error('Invalid cabinet label option.');
 for(const field of ['section_labels','module_labels']){if(o[field]===undefined)o[field]={};if(!o[field]||typeof o[field]!=='object'||Array.isArray(o[field]))throw Error('Invalid custom labels.');for(const [key,value] of Object.entries(o[field])){if(!(field==='section_labels'?/^[A-Z]+[1-9]\d*$/:/^[A-Z]+[1-9]\d*\/[1-9]\d*:[1-9]\d*$/).test(key))throw Error('Invalid custom-label address.');o[field][key]=labelText(value);}}
 if(o.module_colors===undefined)o.module_colors={};
 for(const k of ['section_colors','module_status','module_colors'])if(!o[k]||typeof o[k]!=='object'||Array.isArray(o[k]))throw Error('Invalid project data: '+k);
 for(const k of Object.keys(o.module_colors)){if(!/^[A-Z]+[1-9]\d*\/[1-9]\d*:[1-9]\d*$/.test(k))throw Error("Invalid module highlight address.");o.module_colors[k]=hex(o.module_colors[k]);}
 for(const k of Object.keys(o.section_colors))o.section_colors[k]=hex(o.section_colors[k]);
 for(const v of Object.values(o.module_status))if(!['planned','installed','tested','replace'].includes(v))throw Error('Invalid module status.');
 const s={o,rg,cg,rows,cols,W:cols*o.module_width,H:rows*o.module_height};
 s.cx=[0];cg.forEach(n=>s.cx.push(s.cx.at(-1)+n));s.ry=[0];rg.forEach(n=>s.ry.push(s.ry.at(-1)+n));if(!nested)o.workspace=validateWorkspace(o.workspace,s);else delete o.workspace;return s;
}
function index(pos,arr){let lo=0,hi=arr.length-2;while(lo<hi){const mid=Math.ceil((lo+hi)/2);if(arr[mid]<=pos)lo=mid;else hi=mid-1;}return lo}
function info(s,c,r){const x=s.o.horizontal_view==='Rear'?c:s.cols-1-c,y=s.o.vertical_order==='Top to Bottom'?r:s.rows-1-r,sx=index(x,s.cx),sy=index(y,s.ry),li=Math.floor(sx/s.o.sections_per_alpha_block)*s.rg.length+sy,label=alpha(li)+(sx%s.o.sections_per_alpha_block+1);return {label,letter:alpha(li),li,sx,sy,lc:x-s.cx[sx]+1,lr:y-s.ry[sy]+1,key:label+'/'+(x-s.cx[sx]+1)+':'+(y-s.ry[sy]+1),x,y};}
function locate(s,key){
 const numeric=String(key).trim().match(/^(\d+)\s*(?:\/\s*(\d+)\s*:\s*(\d+))?$/);
 if(numeric){const digits=cabinetDigits(s);if(numeric[1].length!==digits.row+digits.col)throw Error('Use the complete cabinet ID, such as '+cabinetId(s,0,0)+'.');const sy=Number(numeric[1].slice(0,digits.row))-1,sx=Number(numeric[1].slice(digits.row))-1,lc=Number(numeric[2]||1),lr=Number(numeric[3]||1);if(sx<0||sy<0||sx>=s.cg.length||sy>=s.rg.length||lc<1||lr<1||lc>s.cg[sx]||lr>s.rg[sy])throw Error('That cabinet or module is outside this layout.');const x=s.cx[sx]+lc-1,y=s.ry[sy]+lr-1;return {c:s.o.horizontal_view==='Rear'?x:s.cols-1-x,r:s.o.vertical_order==='Top to Bottom'?y:s.rows-1-y};}
 const m=String(key).trim().toUpperCase().match(/^([A-Z]+\d+)\s*(?:\/\s*(\d+)\s*:\s*(\d+))?$/);if(!m)throw Error('Use a cabinet ID such as 0101 / 2:7, or a classic address such as F3 / 2:7.');for(let sy=0;sy<s.rg.length;sy++)for(let sx=0;sx<s.cg.length;sx++){const li=Math.floor(sx/s.o.sections_per_alpha_block)*s.rg.length+sy,label=alpha(li)+(sx%s.o.sections_per_alpha_block+1);if(label!==m[1])continue;const lc=Number(m[2]||1),lr=Number(m[3]||1);if(lc<1||lr<1||lc>s.cg[sx]||lr>s.rg[sy])throw Error('That module is outside section '+label+'.');const x=s.cx[sx]+lc-1,y=s.ry[sy]+lr-1;return {c:s.o.horizontal_view==='Rear'?x:s.cols-1-x,r:s.o.vertical_order==='Top to Bottom'?y:s.rows-1-y};}throw Error('Section not found in this layout.');}
function rects(s){const a=[];for(let sy=0;sy<s.rg.length;sy++)for(let sx=0;sx<s.cg.length;sx++){const x=s.o.horizontal_view==='Rear'?s.cx[sx]:s.cols-s.cx[sx+1],y=s.o.vertical_order==='Top to Bottom'?s.ry[sy]:s.rows-s.ry[sy+1],i=info(s,x,y);a.push({x,y,w:s.cg[sx],h:s.rg[sy],sx,sy,label:i.label,letter:i.letter,displayLabel:displayLabel(s,i),fill:isTest(s)?((sx+sy)%2?s.o.test_color2:s.o.test_color1):isCabinet(s)?cabinetColor(sx,sy,s.o):s.o.section_colors[i.label]||s.o.section_colors[i.letter]||(i.li%2?s.o.color2:s.o.color1)});}return a;}
function isTest(s){return s.o.layout_style==='test';}
function isCabinet(s){return s.o.layout_style==='cabinet';}
 function cabinetDigits(s){return {row:Math.max(2,String(s.rg.length).length),col:Math.max(2,String(s.cg.length).length)};}
 function cabinetId(s,sx,sy){const d=cabinetDigits(s);return String(sy+1).padStart(d.row,'0')+String(sx+1).padStart(d.col,'0');}
 function addressLabel(s,i){return isCabinet(s)?cabinetId(s,i.sx,i.sy):i.label;}
function displayLabel(s,i){return s.o.section_labels[i.label]||addressLabel(s,i);}
function moduleText(s,i){return s.o.module_labels[i.key]||i.lc+':'+i.lr;}
function moduleFont(s,i){return Math.min(typography(s).fs,s.o.module_width*.86/(Math.max(displayLabel(s,i).length,moduleText(s,i).length)*.6));}
 function displayKey(s,i){return addressLabel(s,i)+'/'+i.lc+':'+i.lr;}
 function cabinetColor(sx,sy,o=defaults){const key='cabinet_'+(sy%2?'light':'dark')+(sx%3+1);return o[key]||defaults[key];}
 function palette(s){return isTest(s)?{text:s.o.test_text,grid:s.o.test_line}:isCabinet(s)?{text:s.o.cabinet_text,grid:s.o.cabinet_grid}:{text:s.o.text_color,grid:s.o.grid_color};}
 // Cabinet captions are centered over the module grid. On PDF detail pages,
 // each visible cabinet fragment gets a caption so split cabinets remain identifiable.
 function cabinetLabels(s,clip){const mw=s.o.module_width,mh=s.o.module_height;return rects(s).map(q=>{const x=Math.max(q.x,clip?clip.c:q.x),y=Math.max(q.y,clip?clip.r:q.y),right=Math.min(q.x+q.w,clip?clip.c+clip.cols:q.x+q.w),bottom=Math.min(q.y+q.h,clip?clip.r+clip.rows:q.y+q.h);if(right<=x||bottom<=y)return null;const w=(right-x)*mw,h=(bottom-y)*mh,fs=Math.min(w/(q.displayLabel.length*.6+1),h*.36);return {text:q.displayLabel,x:(x+right)/2*mw,y:(y+bottom)/2*mh,fs};}).filter(Boolean);}
 function highlights(s){const a=[];for(let r=0;r<s.rows;r++)for(let c=0;c<s.cols;c++){const fill=s.o.module_colors[info(s,c,r).key];if(fill)a.push({x:c,y:r,w:1,h:1,fill});}return a;}
function typography(s){const b=Math.min(s.o.module_width,s.o.module_height),maxChars=Math.max(4,(alpha(Math.ceil(s.cg.length/s.o.sections_per_alpha_block)*s.rg.length-1)+s.o.sections_per_alpha_block).length,(Math.max(...s.cg)+':'+Math.max(...s.rg)).length);return {fs:Math.min(b*.24,s.o.module_width*.86/(maxChars*.6)),off:b*.18};}
const xml=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
function svgSingle(s,layoutName){const o=s.o,mw=o.module_width,mh=o.module_height,{fs,off}=typography(s),a=[`<svg xmlns="http://www.w3.org/2000/svg" width="${s.W}" height="${s.H}" viewBox="0 0 ${s.W} ${s.H}"><title>${xml(o.projectName)} — ${o.horizontal_view}, ${o.vertical_order}</title><rect width="100%" height="100%" fill="white"/>`];
 for(const q of [...rects(s),...highlights(s)])a.push(`<rect x="${q.x*mw}" y="${q.y*mh}" width="${q.w*mw}" height="${q.h*mh}" fill="${q.fill}"/>`);
 const line=(x1,y1,x2,y2,w)=>{if(w)a.push(`<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${palette(s).grid}" stroke-width="${w}"/>`)};
 grid(s,line);
 if(!isCabinet(s)&&!isTest(s)&&o.show_labels){a.push(`<g fill="${o.text_color}" font-family="Courier New,monospace" font-weight="bold" font-size="${fs}" text-anchor="middle">`);for(let r=0;r<s.rows;r++)for(let c=0;c<s.cols;c++){const i=info(s,c,r),x=(c+.5)*mw,y=(r+.5)*mh,f=moduleFont(s,i);a.push(`<text x="${x}" y="${y-off+f*.3}" font-size="${f}">${xml(displayLabel(s,i))}</text><text x="${x}" y="${y+off+f*.3}" font-size="${f}">${xml(moduleText(s,i))}</text>`);}a.push('</g>');}
 if(!isCabinet(s)&&!isTest(s)&&o.show_headings)for(const q of rects(s)){const f=Math.min(Math.min(mw,mh)*.15,q.w*mw/(q.displayLabel.length*.6+1.4)),x=q.x*mw+Math.min(mw,mh)*.02,y=q.y*mh+Math.min(mw,mh)*.02,w=(q.displayLabel.length*.6+1)*f;a.push(`<rect x="${x}" y="${y}" width="${w}" height="${f*1.3}" fill="white"/><text x="${x+f*.4}" y="${y+f}" fill="#111827" font-family="Courier New,monospace" font-weight="bold" font-size="${f}">${xml(q.displayLabel)}</text>`);}
 if(isCabinet(s)&&o.show_cabinet_labels)for(const t of cabinetLabels(s))a.push(`<text x="${t.x}" y="${t.y+t.fs*.3}" fill="${palette(s).text}" stroke="#263238" stroke-width="${t.fs*.07}" stroke-linejoin="round" paint-order="stroke" font-family="Courier New,monospace" font-weight="bold" font-size="${t.fs}" text-anchor="middle">${xml(t.text)}</text>`);
 if(isCabinet(s))for(const t of moduleLabelPositions(s))a.push(`<text x="${t.x}" y="${t.y}" font-size="${t.fs}" fill="${palette(s).text}" stroke="#263238" stroke-width="${t.fs*.06}" paint-order="stroke" text-anchor="middle" font-family="Courier New,monospace" font-weight="bold">${xml(t.text)}</text>`);
 if(isTest(s))a.push(testSvg(s,layoutName));
 a.push('</svg>');return a.join('\n');}
function grid(s,line){const o=s.o,mw=o.module_width,mh=o.module_height,moduleLine=isTest(s)&&!o.test_modules?0:o.grid_thickness;for(let c=0;c<=s.cols;c++)line(c*mw,0,c*mw,s.H,moduleLine);for(let r=0;r<=s.rows;r++)line(0,r*mh,s.W,r*mh,moduleLine);for(let j=0;j<s.cx.length;j++){const x=(o.horizontal_view==='Rear'?s.cx[j]:s.cols-s.cx[j])*mw;line(x,0,x,s.H,isCabinet(s)||isTest(s)?o.section_thickness:j%o.sections_per_alpha_block===0||j===s.cx.length-1?o.block_thickness:o.section_thickness);}for(const y0 of s.ry){const y=(o.vertical_order==='Top to Bottom'?y0:s.rows-y0)*mh;line(0,y,s.W,y,o.section_thickness);}}
function csvCell(v){return '"'+String(v??'').replace(/^[=+@\-\t\r]/,"'$&").replaceAll('"','""')+'"';}
function moduleRows(s){const a=[[isCabinet(s)?'Cabinet':'Section','Local column','Local row','Address','Display column','Display row','Status','Module label']];for(let r=0;r<s.rows;r++)for(let c=0;c<s.cols;c++){const i=info(s,c,r);a.push([displayLabel(s,i),i.lc,i.lr,displayKey(s,i),c+1,r+1,s.o.module_status[i.key]||'planned',s.o.module_labels[i.key]||'']);}return a;}
function sectionRows(s){if(isCabinet(s))return [['Cabinet','Cabinet row','Modules wide','Modules high','Module quantity','Cabinet column'],...rects(s).map(q=>[q.displayLabel,q.sy+1,q.w,q.h,q.w*q.h,q.sx+1])];return [['Section','Letter','Modules wide','Modules high','Module quantity'],...rects(s).map(q=>[q.displayLabel,q.letter,q.w,q.h,q.w*q.h])];}
function csv(s){return '\uFEFF'+(s.o.workspace.items.length>1?canvasModuleRows(s):moduleRows(s)).map(a=>a.map(csvCell).join(',')).join('\r\n');}
function sectionCsv(s){return '\uFEFF'+(s.o.workspace.items.length>1?canvasSectionRows(s):sectionRows(s)).map(a=>a.map(csvCell).join(',')).join('\r\n');}

function labelText(value){if(typeof value!=='string')throw Error('Labels must be text.');const t=value.trim();if(!t||t.length>40||/[\x00-\x1f\x7f]/.test(t))throw Error('Use 1-40 characters on one line, or Restore automatic.');return t;}
function flat(o){const v=clone(o);delete v.workspace;return v;}
function validateWorkspace(value,s){const w=value===undefined?{activeId:'layout1',items:[{id:'layout1',name:'Layout 1',x:0,y:0,layout:null}]}:clone(value);if(!w||!Array.isArray(w.items)||w.items.length<1||w.items.length>20)throw Error('A canvas needs 1-20 layouts.');const ids=new Set();let total=s.cols*s.rows,active=false;for(const item of w.items){if(!item||!/^layout[1-9]\d*$/.test(item.id)||ids.has(item.id))throw Error('Invalid or duplicate layout ID.');ids.add(item.id);item.name=labelText(item.name);if(!Number.isSafeInteger(item.x)||!Number.isSafeInteger(item.y))throw Error('Layout positions must be whole numbers.');item.x=integer(item.x,'Layout X',-1000000,1000000);item.y=integer(item.y,'Layout Y',-1000000,1000000);if(item.id===w.activeId){active=true;item.layout=null;}else{if(!item.layout||!('row_groups' in item.layout)||item.layout.workspace!==undefined)throw Error('Invalid nested layout.');const child=validate(Object.assign(clone(defaults),item.layout),true);child.o.projectName=s.o.projectName;child.o.revision=s.o.revision;item.layout=child.o;total+=child.cols*child.rows;}}if(!active)throw Error('Active layout not found.');if(total>150000)throw Error('The canvas exceeds 150,000 modules.');w.grid=Effects.validateGrid(w.grid);w.effects=Effects.validate(w.effects);return w;}
function canvasScenes(s){return s.o.workspace.items.map(item=>({...item,scene:item.id===s.o.workspace.activeId?s:validate(item.layout,true)}));}
function canvasBounds(s){const items=canvasScenes(s),minX=Math.min(...items.map(i=>i.x)),minY=Math.min(...items.map(i=>i.y)),maxX=Math.max(...items.map(i=>i.x+i.scene.W)),maxY=Math.max(...items.map(i=>i.y+i.scene.H));return {items,minX,minY,maxX,maxY,W:maxX-minX,H:maxY-minY};}
function activateLayout(o,id){const next=clone(o),w=next.workspace;if(id===w.activeId)return next;const target=w.items.find(i=>i.id===id);if(!target)throw Error('Layout not found.');w.items.find(i=>i.id===w.activeId).layout=flat(next);const layout=target.layout;target.layout=null;w.activeId=id;return {...layout,projectName:o.projectName,revision:o.revision,workspace:w};}
function svg(s){const b=canvasBounds(s);if(b.items.length===1)return svgSingle(s,b.items[0].name);return `<svg xmlns="http://www.w3.org/2000/svg" width="${b.W}" height="${b.H}" viewBox="0 0 ${b.W} ${b.H}"><title>${xml(s.o.projectName)}</title><rect width="100%" height="100%" fill="white"/>`+b.items.map(i=>svgSingle(i.scene,i.name).replace('<svg ',`<svg x="${i.x-b.minX}" y="${i.y-b.minY}" `)).join('')+'</svg>';}
function moduleLabelPositions(s){const a=[];for(let r=0;r<s.rows;r++)for(let c=0;c<s.cols;c++){const i=info(s,c,r),text=s.o.module_labels[i.key];if(text){const fs=Math.min(s.o.module_height*.16,s.o.module_width*.85/(text.length*.6));a.push({text,x:(c+.5)*s.o.module_width,y:(r+.5)*s.o.module_height+fs*.3,fs});}}return a;}
function canvasModuleRows(s){return [['Layout','Section / cabinet label','Local column','Local row','Address','Display column','Display row','Status','Module label'],...canvasScenes(s).flatMap(i=>moduleRows(i.scene).slice(1).map(r=>[i.name,...r]))];}
function canvasSectionRows(s){return [['Layout','Section / cabinet label','Modules wide','Modules high','Module quantity'],...canvasScenes(s).flatMap(i=>rects(i.scene).map(q=>[i.name,q.displayLabel,q.w,q.h,q.w*q.h]))];}

// Shared drawing primitives keep preview, SVG/PNG and PDF geometry identical.
function testGeometry(s,layoutName){
 if(!isTest(s))return [];
 const o=s.o,a=[],mw=o.module_width,mh=o.module_height,b=Math.min(s.W,s.H),width=Math.max(.5,b/700),cx=s.W/2,cy=s.H/2;
 const line=(x1,y1,x2,y2,w=width)=>a.push({type:'line',x1,y1,x2,y2,width:w,color:o.test_line});
 const text=(value,x,y,fs)=>a.push({type:'text',text:value,x,y,fs,color:o.test_text});
 if(o.test_crosses)for(const q of rects(s)){const x=q.x*mw,y=q.y*mh,w=q.w*mw,h=q.h*mh;line(x,y,x+w,y+h);line(x+w,y,x,y+h);}
 if(o.test_centerlines){line(cx,0,cx,s.H,width*1.4);line(0,cy,s.W,cy,width*1.4);}
 if(o.test_circle){const radius=b*.48;for(let dash=0;dash<48;dash++)for(let j=0;j<6;j++){const angle=(dash+(j/6)*.56)*Math.PI*2/48,next=(dash+((j+1)/6)*.56)*Math.PI*2/48;line(cx+Math.cos(angle)*radius,cy+Math.sin(angle)*radius,cx+Math.cos(next)*radius,cy+Math.sin(next)*radius,width*1.7);}}
 if(o.test_labels)for(const t of cabinetLabels(s))text(t.text,t.x,t.y+t.fs*.3,t.fs);
 for(const t of moduleLabelPositions(s))text(t.text,t.x,t.y,t.fs);
 if(o.test_centerlabel){
  const name=o.test_title.trim()||layoutName||s.o.workspace?.items.find(i=>i.id===s.o.workspace.activeId)?.name||o.projectName;
  const dimensions=`W ${s.W}  x  H ${s.H}`,w=Math.min(s.W*.68,Math.max(b*.42,Math.min(name.length,40)*b*.014)),h=b*.145,x=cx-w/2,y=cy-h/2;
  a.push({type:'rect',x,y,w,h,color:o.test_badge});
  line(x,y,x+w,y);line(x+w,y,x+w,y+h);line(x+w,y+h,x,y+h);line(x,y+h,x,y);
  const titleSize=Math.min(b*.038,w*.88/(Math.max(name.length,1)*.6)),dimSize=Math.min(b*.026,w*.88/(dimensions.length*.6));
  text(name,cx,y+h*.41+titleSize*.3,titleSize);text(dimensions,cx,y+h*.76+dimSize*.3,dimSize);
 }
 return a;
}
function testSvg(s,layoutName){return testGeometry(s,layoutName).map(t=>t.type==='line'?`<path d="M${t.x1} ${t.y1}L${t.x2} ${t.y2}" stroke="${t.color}" stroke-width="${t.width}"/>`:t.type==='rect'?`<rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" fill="${t.color}"/>`:`<text x="${t.x}" y="${t.y}" font-family="Courier New,monospace" font-weight="bold" font-size="${t.fs}" text-anchor="middle" fill="${t.color}">${xml(t.text)}</text>`).join('\n');}
function searchLabels(s,query){
 const q=String(query).trim().toLocaleLowerCase(),hits=[],seen=new Set();
 const add=key=>{try{const pos=locate(s,key),id=pos.c+":"+pos.r;if(!seen.has(id)){seen.add(id);hits.push(pos);}}catch(_){}};
 for(const [key,name] of Object.entries(s.o.module_labels))if(name.trim().toLocaleLowerCase()===q)add(key);
 for(const [key,name] of Object.entries(s.o.section_labels)){const label=name.trim().toLocaleLowerCase();if(label===q)add(key);else if(q.startsWith(label)){const suffix=q.slice(label.length).match(/^\s*\/\s*(\d+)\s*:\s*(\d+)$/);if(suffix)add(key+"/"+suffix[1]+":"+suffix[2]);}}
 add(query);return hits;
}
const API={Effects,isTest,testGeometry,testSvg,searchLabels,defaults,clone,list,validate,normalize,alpha,info,locate,rects,typography,svg,grid,csv,sectionCsv,moduleRows,sectionRows,compact,splitEven,highlights,isCabinet,cabinetDigits,cabinetId,displayLabel,displayKey,cabinetColor,palette,cabinetLabels,addressLabel,moduleText,moduleFont,moduleLabelPositions,labelText,flat,canvasScenes,canvasBounds,activateLayout,svgSingle,canvasModuleRows,canvasSectionRows};root.Layout=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
