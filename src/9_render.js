// ---------- render
let LC,LG;
function darkness(){const h=S?S.time/60:13;return{dusk:clamp(1-Math.abs(h-19.2)/1.3,0,1),night:clamp((h-18.8)/1.6,0,1)*.9}}
function worldToScreen(x,y){return{x:(x-cam.x)*cam.z+W/2,y:(y-cam.y)*cam.z+H/2}}
function render(dt){ctx.setTransform(1,0,0,1,0,0);ctx.imageSmoothingEnabled=false;ctx.fillStyle='#0b0d1a';ctx.fillRect(0,0,W,H);if(!S)return;
 const base=clamp(Math.min(W,H)/215,2,7);const zt=base*(S.scene=='city'?(me.inCar?.78:1):1.15)*(S.mode=='title'?.9:1);cam.z+=(zt-cam.z)*Math.min(1,dt*3);
 let tx=me.x,ty=me.y;if(me.inCar&&S.scene=='city'){tx+=patrol.vx*.45;ty+=patrol.vy*.45}
 const f=1-Math.exp(-dt*(me.inCar?5:8));cam.x+=(tx-cam.x)*f;cam.y+=(ty-cam.y)*f;
 const vw=W/cam.z,vh=H/cam.z;
 if(S.scene!='city'){const I=INTERIORS[S.scene];const iw=I.grid[0].length*T,ih=I.grid.length*T;cam.x=iw<vw?iw/2:clamp(cam.x,vw/2,iw-vw/2);cam.y=ih<vh?ih/2:clamp(cam.y,vh/2,ih-vh/2)}
 let sx=0,sy=0;if(S.shake>0&&SAVE.shake!==false){const a=Math.min(4,1+S.shake*7);sx=rnd(-a,a);sy=rnd(-a,a)}
 const ox=Math.round(W/2-(cam.x+sx)*cam.z),oy=Math.round(H/2-(cam.y+sy)*cam.z);ctx.setTransform(cam.z,0,0,cam.z,ox,oy);
 const x0=cam.x-vw/2-20,y0=cam.y-vh/2-20,x1=cam.x+vw/2+20,y1=cam.y+vh/2+20;const vis=e=>e.x>x0&&e.x<x1&&e.y>y0&&e.y<y1+20;
 const now=performance.now();
 if(S.scene=='city'){
  const sx0=clamp(Math.floor(x0),0,N*T),sy0=clamp(Math.floor(y0),0,N*T),sw=clamp(Math.ceil(x1),0,N*T)-sx0,sh=clamp(Math.ceil(y1),0,N*T)-sy0;
  if(sw>0&&sh>0)ctx.drawImage(CITY,sx0,sy0,sw,sh,sx0,sy0,sw,sh);
  for(const p of parts)if(p.paint&&vis(p)){ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.s,p.s)}
  // traffic lights
  for(let ky=0;ky<=6;ky++)for(let kx=0;kx<=6;kx++){const ix=kx*PP,iy=ky*PP;if(ix<x0-60||ix>x1||iy<y0-60||iy>y1)continue;const L=light(kx,ky);const lc=s=>s=='g'?'#3f6':s=='y'?'#fd3':'#f33';
   const box=(x,y,s)=>{ctx.fillStyle='#111';ctx.fillRect(x-2,y-2,5,5);ctx.fillStyle=lc(s);ctx.fillRect(x-1,y-1,3,3)};box(ix-6,iy-6,L.ns);box(ix+53,iy+53,L.ns);box(ix+53,iy-6,L.ew);box(ix-6,iy+53,L.ew)}
  // case items
  const C=S.case;if(C&&C.stage=='investigate')for(const s of C.srcs)if(s.src=='item'&&!s.found&&vis(s)){const b=Math.sin(now/200)*1.5;ctx.fillStyle='#fd3';ctx.fillRect(s.x-3,s.y-3+b,6,6);ctx.fillStyle='#fff';ctx.fillRect(s.x-1,s.y-6+b,2,2);if((now/300|0)%2){ctx.fillRect(s.x+4,s.y-4,1,1);ctx.fillRect(s.x-5,s.y+2,1,1)}}
  const ents=[];
  for(const p of peds)if(!p.inCar&&!p.inRoom&&vis(p))ents.push({y:p.y,d:()=>drawPed(p,now)});
  for(const c of cars)if(vis(c))ents.push({y:c.y,d:()=>{drawCarSpr(ctx,c,c.type,c.col,c.ang,{busted:c.busted});if(c.flee)bang(c.x,c.y-12,now)}});
  ents.push({y:patrol.y,d:()=>drawCarSpr(ctx,patrol,'police','#fff',patrol.a,{siren:S.siren&&me.inCar,passenger:S.carry.length&&me.inCar})});
  if(!me.inCar)ents.push({y:me.y,d:()=>drawPerson(ctx,me.L,me.x,me.y,me.dir,me.anim,me.tackle>0?'down':'')});
  extEnts(ents,vis,now);ents.sort((a,b)=>a.y-b.y);for(const e of ents)e.d();
  if(S.carry.length&&!me.inCar)for(const p of S.carry){ctx.strokeStyle='rgba(200,200,200,.6)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(me.x,me.y-8);ctx.lineTo(p.x,p.y-8);ctx.stroke()}
 }else{
  ctx.drawImage(interiorCanvas(S.scene),0,0);
  if(S.scene!='station'&&S.scene!='donut'){const C=S.case;if(C&&C.tpl.scene==S.scene&&C.stage=='investigate'){ctx.fillStyle='#fd3';for(let x=4*T;x<10*T;x+=8){ctx.fillRect(x,8.6*T,5,2)}ctx.fillStyle='#111';ctx.fillRect(4*T,8.6*T+2,6*T,1);
    ctx.strokeStyle='#fff';ctx.lineWidth=1;ctx.strokeRect(7*T,3.5*T,22,10);const ev=sceneEvidence();if(ev){const b=Math.sin(now/200)*1.5;ctx.fillStyle='#fd3';ctx.fillRect(ev.ix-3,ev.iy-3+b,6,6);if((now/300|0)%2){ctx.fillStyle='#fff';ctx.fillRect(ev.ix+4,ev.iy-5,1,1)}}}}
  const ents=[];const npc=(x,y,L,dir)=>ents.push({y,d:()=>drawPerson(ctx,L,x,y,dir,-1,'')});
  if(S.scene=='station'){npc(12.5*T,1.9*T,SGT_LOOK,Math.PI/2);npc(13*T,10.8*T,DEE_LOOK,Math.PI/2);npc(22.5*T,1.8*T,CLERK_LOOK,Math.PI/2);npc(21*T,14.3*T,COP2_LOOK,-Math.PI/2)}
  if(S.scene=='donut'){npc(5*T,1.9*T,GLAZIA_LOOK,Math.PI/2);npc(10.7*T,5*T,CRUMBS_LOOK,Math.PI)}
  if(['bank','jewel','apart','pawn'].includes(S.scene))npc(4*T,1.8*T,OWNER_LOOK[S.scene],Math.PI/2);
  for(const p of peds)if(p.inRoom&&S.scene=='station')ents.push({y:p.y,d:()=>{drawPerson(ctx,p.L,p.x,p.y,p.dir,-1,'');ctx.fillStyle='#ccc';ctx.fillRect(p.x-3,p.y-8,6,1)}});
  for(const p of S.carry)ents.push({y:p.y,d:()=>drawPed(p,now)});
  extEnts(ents,()=>true,now);ents.push({y:me.y,d:()=>drawPerson(ctx,me.L,me.x,me.y,me.dir,me.anim,me.tackle>0?'down':'')});ents.sort((a,b)=>a.y-b.y);for(const e of ents)e.d();
  if(S.scene=='station'){const lx=4*T,ly=2.6*T;const g=ctx.createRadialGradient(lx,ly,2,lx,ly,40);g.addColorStop(0,'rgba(255,240,150,.25)');g.addColorStop(1,'rgba(255,240,150,0)');ctx.fillStyle=g;ctx.fillRect(lx-40,ly-40,80,80)}}
 for(const p of parts)if(!p.paint&&vis(p)){ctx.globalAlpha=Math.min(1,p.life*3);ctx.fillStyle=p.c;ctx.fillRect(p.x,p.y,p.s,p.s)}ctx.globalAlpha=1;
 // lighting
 if(S.scene=='city'){const dk=darkness();ctx.setTransform(1,0,0,1,0,0);
  if(dk.dusk>0){ctx.fillStyle=`rgba(255,110,40,${dk.dusk*.16})`;ctx.fillRect(0,0,W,H)}
  if(dk.night>0){if(!LC||LC.width!=W||LC.height!=H){[LC,LG]=mkCanvas(W,H)}LG.globalCompositeOperation='source-over';LG.clearRect(0,0,W,H);LG.fillStyle=`rgba(6,8,30,${dk.night})`;LG.fillRect(0,0,W,H);LG.globalCompositeOperation='destination-out';
   const glow=(x,y,r,a)=>{const s=worldToScreen(x,y);const rr=r*cam.z;if(s.x<-rr||s.y<-rr||s.x>W+rr||s.y>H+rr)return;const g=LG.createRadialGradient(s.x,s.y,0,s.x,s.y,rr);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');LG.fillStyle=g;LG.fillRect(s.x-rr,s.y-rr,rr*2,rr*2)};
   for(const l of LAMPS)if(vis(l))glow(l.x,l.y,34,.95);
   const head=(c,a,len,wid,al)=>{const s=worldToScreen(c.x+Math.cos(a)*9,c.y+Math.sin(a)*9),L=len*cam.z,Wd=wid*cam.z;if(s.x<-L||s.y<-L||s.x>W+L||s.y>H+L)return;const ex=s.x+Math.cos(a)*L,ey=s.y+Math.sin(a)*L,px=-Math.sin(a)*Wd,py=Math.cos(a)*Wd;const g=LG.createLinearGradient(s.x,s.y,ex,ey);g.addColorStop(0,`rgba(0,0,0,${al})`);g.addColorStop(1,'rgba(0,0,0,0)');LG.fillStyle=g;LG.beginPath();LG.moveTo(s.x-py*.15,s.y+px*.15);LG.lineTo(ex+px,ey+py);LG.lineTo(ex-px,ey-py);LG.lineTo(s.x+py*.15,s.y-px*.15);LG.closePath();LG.fill()};
   for(const c of cars)if(vis(c)&&!c.busted)head(c,c.ang,58,20,.9);head(patrol,patrol.a,75,24,.95);glow(patrol.x,patrol.y,14,.5);
   if(!me.inCar){head({x:me.x,y:me.y-6},me.dir,70,22,.9);glow(me.x,me.y-6,16,.7)}if(window.extLights)extLights(glow);
   if(S.siren&&me.inCar){glow(patrol.x,patrol.y,40,.5)}
   ctx.drawImage(LC,0,0);ctx.globalCompositeOperation='lighter';for(const l of LAMPS)if(vis(l)){const s=worldToScreen(l.x,l.y),rr=26*cam.z;const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,rr);g.addColorStop(0,`rgba(255,200,90,${.22*dk.night})`);g.addColorStop(1,'rgba(255,200,90,0)');ctx.fillStyle=g;ctx.fillRect(s.x-rr,s.y-rr,rr*2,rr*2)}ctx.globalCompositeOperation='source-over';ctx.setTransform(cam.z,0,0,cam.z,ox,oy);ctx.globalAlpha=Math.min(1,dk.night*1.5);
   const sx0=clamp(Math.floor(x0),0,N*T),sy0=clamp(Math.floor(y0),0,N*T),sw=clamp(Math.ceil(x1),0,N*T)-sx0,sh=clamp(Math.ceil(y1),0,N*T)-sy0;if(sw>0&&sh>0)ctx.drawImage(WIN,sx0,sy0,sw,sh,sx0,sy0,sw,sh);ctx.globalAlpha=1}
  if(S.siren&&me.inCar){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle=(now/150|0)%2?'rgba(255,0,0,.07)':'rgba(0,60,255,.07)';ctx.fillRect(0,0,W,H)}
  ctx.setTransform(cam.z,0,0,cam.z,ox,oy)}
 // overhead markers
 if(S.scene=='city'){for(const p of peds){if(p.inCar||!vis(p))continue;if(p.crime&&!p.cuffed)bang(p.x,p.y-26,now,CR[p.crime].minor?'#fc3':'#f22');if(p.state=='witness')qmark(p.x,p.y-26,now)}
  for(const k in blocks){const b=blocks[k];if(!ENTERABLE[b.type])continue;const d=doorOf(b.bx,b.by);if(!vis(d))continue;const near=Math.hypot(d.x-me.x,d.y-me.y)<40;if(near&&!me.inCar){ctx.fillStyle='rgba(255,255,255,'+(.4+.3*Math.sin(now/200))+')';ctx.fillRect(d.x-6,d.y+2,12,2)}
   if(S.case&&S.case.stage=='investigate'&&b.type==S.case.tpl.scene&&!S.case.srcs.find(s=>s.src=='scene').found)qmark(d.x,d.y-30,now)}}
 extOverlay(now,vis);for(const f of floaters){if(f.scene!=S.scene)continue;ctx.globalAlpha=Math.min(1,f.life*2);ptext(ctx,f.t,f.x,f.y,f.c,1,'center','#000')}ctx.globalAlpha=1;
 ctx.setTransform(1,0,0,1,0,0);
 if(S.flash>0){ctx.fillStyle=`rgba(255,0,0,${(S.flash*.6).toFixed(2)})`;ctx.fillRect(0,0,W,H)}
 if(S.mode=='play'&&S.scene=='city'){drawArrows(now);extArrows();drawMinimap(now);extMinimap(now)}
 if(S.mode=='play'&&S.scene!='city'){ptext(ctx,INTERIORS[S.scene].name,W/2,H*0.12,'#fd6',Math.max(2,cam.z*.7|0),'center','#000')}
 drawJoy()}
function bang(x,y,now,c){const b=Math.round(Math.sin(now/130)*1.5);ctx.fillStyle='#000';ctx.fillRect(x-3,y-1+b,6,10);ctx.fillStyle=c||'#f22';ctx.fillRect(x-2,y+b,4,5);ctx.fillRect(x-2,y+6+b,4,2)}
function qmark(x,y,now){const b=Math.round(Math.sin(now/160)*1.5);ctx.fillStyle='#000';ctx.fillRect(x-4,y-1+b,8,10);ptext(ctx,'?',x,y+1+b,'#fd3',1,'center',null)}
function drawPed(p,now){const st=p.down>0?'down':'';drawPerson(ctx,p.L,p.x,p.y,p.dir,p.anim,st);
 if(p.down>0&&!p.cuffed){for(let i=0;i<3;i++){const a=now/200+i*2.1;ctx.fillStyle='#ff6';ctx.fillRect(p.x+Math.cos(a)*6,p.y-12+Math.sin(a)*2,1,1)}}
 if(p.hitT>0){ctx.globalAlpha=Math.min(1,p.hitT*4);ctx.fillStyle='#fff';ctx.fillRect(p.x-5,p.y-18,10,18);ctx.globalAlpha=1}if(p.cuffed){ctx.fillStyle='#ddd';ctx.fillRect(p.x-3,p.y-8,6,1)}if(p.state=='freeze'){ptext(ctx,'!',p.x,p.y-28,'#6ff',1)}}
function edgeArrow(x,y,col,label){const s=worldToScreen(x,y);if(s.x>20&&s.y>20&&s.x<W-20&&s.y<H-20)return;const a=Math.atan2(s.y-H/2,s.x-W/2);const m=Math.min(W,H)*.06+28;
 const ex=clamp(s.x,m,W-m),ey=clamp(s.y,m+60,H-m-20);ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle='#000';ctx.beginPath();ctx.moveTo(16,0);ctx.lineTo(-8,-11);ctx.lineTo(-8,11);ctx.fill();ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-6,-8);ctx.lineTo(-6,8);ctx.fill();ctx.restore();
 if(label){const d=Math.hypot(x-me.x,y-me.y)/T|0;ptext(ctx,label+' '+d+'M',ex,ey+12,col,2,'center','#000')}}
function drawArrows(now){for(const k of crimes){if(k.hidden)continue;const e=k.ped||k.car;if(e)edgeArrow(e.x,e.y,k.t=='warrant'?'#fd3':CR[k.t].minor?'#fc3':'#f44')}
 if(S.carry.length)edgeArrow(STATION.x,STATION.y,'#4af','JAIL');
 const C=S.case;if(C&&C.stage=='investigate'&&C.srcs.filter(s=>s.found).length==3)edgeArrow(STATION.x,STATION.y,'#fd6','BOARD');
 if(me.inCar==false&&dist(me,patrol)>T*12)edgeArrow(patrol.x,patrol.y,'#8cf')}
let MM;function minimapBase(){if(MM)return MM;const[c,g]=mkCanvas(N,N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=map[y*N+x];g.fillStyle=t==0?'#55586a':t==1?'#8a8a96':t==3?'#3a8a3a':t==4?'#a89a70':t==5?'#3a6ab8':'#25283a';const b=blocks[Math.floor(x/P)+','+Math.floor(y/P)];if(t==2&&b){if(b.type=='police')g.fillStyle='#3a5ad8';else if(b.type=='donut')g.fillStyle='#e86ab8';else if(ENTERABLE[b.type])g.fillStyle='#6a5a8a'}g.fillRect(x,y,1,1)}MM=c;return c}
function mmRect(){const big=!!(S&&S.bigMap);const ms=big?Math.min(W,H)*.9:clamp(Math.min(W,H)*.27,96,180);return{x:big?(W-ms)/2:W-ms-8,y:big?(H-ms)/2:8,s:ms,big}}
function drawMinimap(now){const r=mmRect();const span=r.big?N:30;let cx=me.x/T,cy=me.y/T;if(r.big){cx=N/2;cy=N/2}const sx=clamp(cx-span/2,0,N-span),sy=clamp(cy-span/2,0,N-span);const k=r.s/span;
 ctx.fillStyle='#000';ctx.fillRect(r.x-3,r.y-3,r.s+6,r.s+6);ctx.imageSmoothingEnabled=false;ctx.drawImage(minimapBase(),sx,sy,span,span,r.x,r.y,r.s,r.s);
 const dot=(wx,wy,c,s)=>{const x=r.x+(wx/T-sx)*k,y=r.y+(wy/T-sy)*k;if(x<r.x||y<r.y||x>r.x+r.s||y>r.y+r.s){return}ctx.fillStyle='#000';ctx.fillRect(x-s/2-1,y-s/2-1,s+2,s+2);ctx.fillStyle=c;ctx.fillRect(x-s/2,y-s/2,s,s)};
 const blink=(now/250|0)%2;const C=S.case;
 if(C&&C.stage=='investigate')for(const s of C.srcs){if(s.found)continue;if(s.src=='item')dot(s.x,s.y,'#fd3',5);if(s.src=='witness'&&s.ped)dot(s.ped.x,s.ped.y,'#fd3',5);if(s.src=='scene'){const b=findBlock(C.tpl.scene),d=doorOf(b.bx,b.by);dot(d.x,d.y,'#fd3',6)}}
 for(const kk of crimes){if(kk.hidden)continue;const e=kk.ped||kk.car;if(e)dot(e.x,e.y,blink?(kk.t=='warrant'?'#fd3':'#f33'):'#fff',6)}
 dot(STATION.x,STATION.y,'#4af',6);dot(DONUT.x,DONUT.y,'#f8c',6);dot(patrol.x,patrol.y,'#8cf',4);dot(me.x,me.y,'#fff',5);
 ptext(ctx,r.big?'CITY MAP - TAP TO CLOSE':'MAP',r.x+r.s/2,r.y+r.s+4,'#fff',r.big?2:1,'center','#000')}
function drawJoy(){const j=IN.joy;if(j.id!==null){ctx.globalAlpha=.35;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(j.ox,j.oy,j.R,0,TAU);ctx.fill();ctx.globalAlpha=.25;ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.stroke();ctx.globalAlpha=.85;ctx.fillStyle='#dde';ctx.beginPath();ctx.arc(j.ox+j.rx*j.R,j.oy+j.ry*j.R,j.R*.42,0,TAU);ctx.fill();ctx.globalAlpha=1}
 else if(S&&S.mode=='play'&&IS_TOUCH&&!S.modal){ctx.globalAlpha=.22;ctx.strokeStyle='#fff';ctx.lineWidth=3;const x=Math.max(90,W*.18),y=H-Math.max(110,H*.17);ctx.beginPath();ctx.arc(x,y,j.R,0,TAU);ctx.stroke();ctx.globalAlpha=.5;ptext(ctx,'DRAG HERE',x,y-5,'#fff',2,'center','#000');ctx.globalAlpha=1}}
const SGT_LOOK={skin:'#f0c090',hair:'#666',hs:0,shirt:'#2c4cb0',pants:'#1a2550',shoes:'#111',build:2,ht:1,cop:true,stache:true};
const DEE_LOOK={skin:'#8a5a3a',hair:'#1a1410',hs:4,shirt:'#2c4cb0',pants:'#1a2550',shoes:'#111',build:1,ht:1,glasses:true};
const CLERK_LOOK={skin:'#ffdbb5',hair:'#a0602a',hs:2,shirt:'#5a6a9a',pants:'#333',shoes:'#111',build:0,ht:1,glasses:true};
const COP2_LOOK=Object.assign({},COP_LOOK,{skin:'#c88a5a',build:2});
const GLAZIA_LOOK={skin:'#ffd0c0',hair:'#e0c060',hs:4,shirt:'#fff',apron:'#ff8ac8',pants:'#333',shoes:'#fff',build:1,ht:1};
const CRUMBS_LOOK={skin:'#f0c090',hair:'#ddd',hs:0,shirt:'#7a5',pants:'#543',shoes:'#333',build:1,ht:1,old:true,beard:true};
const OWNER_LOOK={bank:{skin:'#ffdbb5',hair:'#888',hs:1,shirt:'#333',pants:'#333',shoes:'#111',build:2,ht:1,glasses:true},jewel:{skin:'#c88a5a',hair:'#1a1410',hs:6,shirt:'#93c',pants:'#226',shoes:'#111',build:0,ht:2,stache:true},apart:{skin:'#ffdbb5',hair:'#e0c060',hs:1,shirt:'#c22',pants:'#226',shoes:'#111',build:2,ht:1,hat:'#333'},pawn:{skin:'#8a5a3a',hair:'#333',hs:3,shirt:'#7a5',pants:'#543',shoes:'#a52',build:1,ht:1,beard:true}};
