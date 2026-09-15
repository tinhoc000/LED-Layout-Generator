(function(root){
'use strict';
function format(Recorder=root.MediaRecorder){if(!Recorder||!Recorder.isTypeSupported)return null;for(const type of ['video/mp4;codecs=avc1.42001E','video/mp4','video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'])if(Recorder.isTypeSupported(type))return {mime:type,ext:type.startsWith('video/mp4')?'mp4':'webm'};return null;}
function dimensions(w,h,max){const scale=Math.min(1,max/Math.max(w,h));return {width:Math.max(2,Math.floor(w*scale/2)*2),height:Math.max(2,Math.floor(h*scale/2)*2)};}
function record(canvas,drawFrame,seconds,onProgress,signal){return new Promise((resolve,reject)=>{
 const f=format();if(!f){reject(Error('Video recording is unavailable in this browser.'));return;}let stream,recorder,frame=0,timer,done=false,failure=null;const chunks=[];
 function stop(error){if(done)return;failure=error||null;if(recorder&&recorder.state!=='inactive')recorder.stop();else finish();}
 function finish(){if(done)return;done=true;cancelAnimationFrame(frame);clearTimeout(timer);signal?.removeEventListener('abort',cancel);document.removeEventListener('visibilitychange',visibility);stream?.getTracks().forEach(t=>t.stop());if(failure)reject(failure);else if(!chunks.length)reject(Error('The browser produced an empty video.'));else resolve({blob:new Blob(chunks,{type:recorder.mimeType||f.mime}),ext:f.ext});}
 function cancel(){stop(Error('Video export cancelled.'));}
 function visibility(){if(document.hidden)stop(Error('Video export stopped because the app was hidden. Keep it visible while recording.'));}
 if(signal?.aborted){reject(Error('Video export cancelled.'));return;}
 try{drawFrame(0);stream=canvas.captureStream(30);recorder=new MediaRecorder(stream,{mimeType:f.mime,videoBitsPerSecond:8000000});recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};recorder.onerror=e=>stop(Error(e.error?.message||'Video encoder failed.'));recorder.onstop=finish;signal?.addEventListener('abort',cancel,{once:true});document.addEventListener('visibilitychange',visibility);recorder.start(200);const start=performance.now();let last=-Infinity;
 const tick=now=>{if(done||recorder.state==='inactive')return;try{const elapsed=(now-start)/1000;if(elapsed>=seconds){drawFrame(seconds);onProgress(1);stop();return;}if(now-last>=1000/30){drawFrame(elapsed);onProgress(elapsed/seconds);last=now;}frame=requestAnimationFrame(tick);}catch(e){stop(e);}};frame=requestAnimationFrame(tick);timer=setTimeout(()=>stop(Error('Video recording timed out.')),seconds*1000+15000);
 }catch(e){stop(e);}
 });}
const API={format,dimensions,record};root.LayoutVideo=API;if(typeof module!=='undefined')module.exports=API;
})(typeof globalThis!=='undefined'?globalThis:this);
