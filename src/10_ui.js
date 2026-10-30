// ---------- UI / input wiring
const IS_TOUCH=('ontouchstart' in window)||navigator.maxTouchPoints>0;
function mkBtn(id,html,cls){const d=document.createElement('div');d.id=id;d.className=cls||'btn';d.innerHTML=html;document.body.appendChild(d);return d}
const bA=mkBtn('bA','A'),bB=mkBtn('bB','B'),bS=mkBtn('bS','RUN'),bH=mkBtn('bH','🚨');
const tP=mkBtn('tP','II','tb'),tM=mkBtn('tM','♪','tb'),tF=mkBtn('tF','⛶','tb');
function hold(el,down,up){el.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();audioInit();try{el.setPointerCapture(e.pointerId)}catch(_){}el.classList.add('on');vib(10);down()});
 const u=e=>{el.classList.remove('on');up&&up()};el.addEventListener('pointerup',u);el.addEventListener('pointercancel',u);el.addEventListener('lostpointercapture',u)}
hold(bA,()=>{if(S&&!S.modal)IN.pressA=true});hold(bB,()=>{if(S&&!S.modal)IN.pressB=true});hold(bS,()=>IN.run=true,()=>IN.run=false);
hold(bH,()=>{if(S&&me.inCar){S.siren=!S.siren;SFX.blip()}else if(S)shout()});
hold(tP,()=>togglePause());hold(tM,()=>{setMuted(!SAVE.muted);tM.textContent=SAVE.muted?'🔇':'♪'});
hold(tF,()=>{const d=document;if(!d.fullscreenElement&&!d.webkitFullscreenElement){const el=d.documentElement;(el.requestFullscreen||el.webkitRequestFullscreen||(()=>{})).call(el,{navigationUI:'hide'})?.catch?.(()=>{})}else (d.exitFullscreen||d.webkitExitFullscreen).call(d)});
tM.textContent=SAVE.muted?'🔇':'♪';
// joystick on canvas (pointer events)
cv.addEventListener('pointerdown',e=>{audioInit();if(!S||S.mode!='play'||S.modal)return;const r=mmRect();
 if(e.clientX>r.x&&e.clientX<r.x+r.s&&e.clientY>r.y&&e.clientY<r.y+r.s&&S.scene=='city'){S.bigMap=!S.bigMap;SFX.blip();return}if(S.bigMap){S.bigMap=false;return}
 const j=IN.joy;if(j.id===null&&((SAVE.lefty?e.clientX>W*.4:e.clientX<W*.6)||e.pointerType=='mouse')){j.id=e.pointerId;j.ox=e.clientX;j.oy=e.clientY;j.rx=j.ry=0;try{cv.setPointerCapture(e.pointerId)}catch(_){}}});
cv.addEventListener('pointermove',e=>{const j=IN.joy;if(e.pointerId!==j.id)return;let dx=e.clientX-j.ox,dy=e.clientY-j.oy;const m=Math.hypot(dx,dy);
 if(m>j.R*1.25){const k=(m-j.R*1.25)/m;j.ox+=dx*k;j.oy+=dy*k;dx=e.clientX-j.ox;dy=e.clientY-j.oy}const mm=Math.hypot(dx,dy);const c=Math.min(1,mm/j.R);j.rx=mm?dx/mm*c:0;j.ry=mm?dy/mm*c:0});
const jEnd=e=>{const j=IN.joy;if(e.pointerId!==j.id)return;j.id=null;j.rx=j.ry=0};cv.addEventListener('pointerup',jEnd);cv.addEventListener('pointercancel',jEnd);
// keyboard
addEventListener('keydown',e=>{audioInit();if(!keys[e.code]&&S&&S.mode=='play'){if(!S.modal){if(e.code=='Space'||e.code=='KeyJ'||e.code=='Enter')IN.pressA=true;if(e.code=='KeyE'||e.code=='KeyK')IN.pressB=true;if(e.code=='KeyH'){if(me.inCar)S.siren=!S.siren;else shout()}if(e.code=='KeyM'){S.bigMap=!S.bigMap}}
 if(e.code=='KeyP'||e.code=='Escape')togglePause()}
 if(S&&S.modal&&/^Digit[1-9]$/.test(e.code)){const bs=$('box').querySelectorAll('button');const b=bs[+e.code.slice(5)-1];if(b)b.click()}
 keys[e.code]=true;if(e.code.startsWith('Arrow')||e.code=='Space')e.preventDefault()});
addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>{for(const k in keys)keys[k]=false;IN.run=false;IN.joy.id=null;IN.joy.rx=IN.joy.ry=0});
// block browser gestures
document.addEventListener('touchmove',e=>{if(!e.target.closest('#box'))e.preventDefault()},{passive:false});
document.addEventListener('gesturestart',e=>e.preventDefault());document.addEventListener('dblclick',e=>e.preventDefault());document.addEventListener('contextmenu',e=>e.preventDefault());
let lastTouchEnd=0;document.addEventListener('touchend',e=>{const n=Date.now();if(n-lastTouchEnd<300&&!e.target.closest('#box,#title'))e.preventDefault();lastTouchEnd=n},{passive:false});
// layout
function resize(){W=innerWidth;H=innerHeight;DPR=1;cv.width=W;cv.height=H;layout()}
function layout(){const land=W>H;const s=clamp(Math.min(W,H)*(land?.2:.19),64,120)*(SAVE.ctl||1);const side=SAVE.lefty?'left':'right',other=SAVE.lefty?'right':'left';const pad=Math.max(12,s*.15);
 const set=(d,right,bottom,k,fs)=>{d.style.width=d.style.height=(s*k)+'px';d.style[side]=right+'px';d.style[other]='auto';d.style.bottom=bottom+'px';d.style.fontSize=(s*k*(fs||.26))+'px'};
 set(bA,pad,pad+s*.55,1.15,.24);set(bB,pad+s*1.3,pad,.9,.26);set(bS,pad+s*1.3,pad+s*1.05,.8,.24);set(bH,pad+s*.2,pad+s*1.85,.62,.36);
 IN.joy.R=clamp(Math.min(W,H)*.13,48,90);
 const r=mmRect();[tP,tM,tF].forEach((b,i)=>{b.style.right=(W-r.x+8+i*44)+'px';b.style.top='8px'});
 $('radio').style.width=Math.max(140,land?Math.min(W*.45,W-r.s-40):W-r.s-28)+'px';$('obj').style.bottom=(land?8:pad+s*2.6)+'px';
 if(land){$('obj').style.left='40%'}else $('obj').style.left='50%'}
addEventListener('resize',resize);addEventListener('orientationchange',()=>setTimeout(resize,200));
// pause/help
const HELP=`<b>Goal:</b> survive your shift (14:00–22:00, it gets DARK). Stop crimes, book perps, file paperwork, eat donuts, crack cases, hit your 🎯 shift goals. Score raises your career rank and your requisition budget (both saved).<br><br>
<b>Touch:</b> drag on the joystick side to move · <b>A</b> = context action (TACKLE / CUFF / TICKET / ENTER / TALK / RADAR / TASE / BACKUP…) · <b>B</b> = get in or out of the cruiser · <b>RUN</b> = sprint (car: turbo) · <b>🚨/📣</b> siren or shout · tap the minimap for the big map · tap the radio ticker for the log. ⚙ Settings: volumes, button size, left-handed layout, shift length.<br>
<b>Keys:</b> WASD/Arrows · Space/J = A · E/K = B · Shift = run · H = siren · M = map · P/Esc = pause · 1-9 = dialog option.<br><br>
<b>Crimes:</b> red <b>!</b> = arrest (tackle, cuff, drive to POLICE, BOOKING, PAPERWORK). Yellow <b>!</b> = ticket. Stolen cars: ram 3×.<br>
<b>Traffic:</b> in the cruiser, A = RADAR the car ahead. Siren on and tail a speeder/DUI to pull them over, then talk to the DRIVER.<br>
<b>Bar fights</b> come in pairs. <b>Pickpockets</b> are fast. <b>Armed robbers</b> shoot: stand by your cruiser for cover, call BACKUP (they surrender), or TASE. <b>Drug deals:</b> watch from a distance until the bar fills, then bust for +200.<br>
<b>Events</b> (blue): cat in tree, lost kid (lead them to their parent), noise complaint, parades (roads close; don't drive through).<br>
<b>Station:</b> Officer Ramirez (bottom right) rides along as your partner and sells upgrades: engine, taser, gourmet donuts, scanner. Higher ranks unlock DUIs, drug deals, parades, then armed robbery.<br>
<b>Cases:</b> 3 clues (crime scene, witness in a yellow cap, dropped evidence ✦). ACCUSE on the board in the Sergeant's office, then arrest and book.`;
function togglePause(){if(!S||S.mode!='play')return;if(S.modal&&!S.paused)return;if(S.paused){S.paused=false;closeDlg();return}S.paused=true;
 const goals=(S.goals||[]).map(g=>`${g.done?'✅':'⬜'} ${g.t} (${Math.min(g.n,g.f())}/${g.n})`).join('<br>');const up=Object.keys(SAVE.upg||{}).filter(k=>SAVE.upg[k]);
 dlg('⏸ Paused',`<b>Shift:</b> score ${S.score|0} · arrests ${S.arrests} · tickets ${S.tickets} · case: ${S.case?S.case.tpl.title+' ('+S.case.srcs.filter(s=>s.found).length+'/3)':'-'}<br><br><b>🎯 Shift goals</b> (+150 each)<br>${goals}<br><br><b>Upgrades:</b> ${up.join(', ')||'none yet (Officer Ramirez at the station)'} · Budget $${SAVE.cash|0}`,
 [['▶ Resume',()=>{S.paused=false}],['🕵 Case notes',()=>{S.paused=false;evidenceBoardNotes()}],['📻 Radio log',()=>{S.paused=false;radioLog()}],['❓ How to play',()=>{S.paused=false;dlg('How to Play',HELP,[['Back',()=>togglePause()]],true)}],['⚙ Settings',()=>settings(false)]]
 .concat(S.tut?[['⏭ Skip tutorial',()=>{S.paused=false;S.tut=null;SAVE.tutDone=true;SAVE.tutForce=false;persist();S.spawnT=3}]]:[]).concat([['🏠 Quit to title (shift lost)',()=>{S.paused=false;showTitle()}]]),true)}
function ticker(){const X=S.x,cur=X&&X.cur,key=cur?cur.id:'none';if(hudCache.tk===key)return;hudCache.tk=key;const el=$('radio');
 if(!cur){el.innerHTML='';return}el.innerHTML=`<div style="color:${cur.c}"><span class="tk">📻 ${X.q.length?`<b class="q">+${X.q.length}</b> `:''}${cur.msg}</span></div>`;
 const sp=el.querySelector('.tk'),ov=sp.scrollWidth-el.clientWidth+14;if(ov>0){sp.style.setProperty('--dx',-ov+'px');sp.style.animation=`tk ${cur.dur.toFixed(1)}s linear forwards`}
 const hb=$('hud').getBoundingClientRect();el.style.top=(hb.bottom+1)+'px'}
function evidenceBoardNotes(){const C=S.case;if(!C)return;dlg('Case Notes',`<b>${C.tpl.title}</b><br>${C.tpl.intro}<br><br>`+C.srcs.map(s=>s.found?'📌 '+s.text:'❓ ???').join('<br>')+'<br><br><i>Accuse at the Evidence Board in the station.</i>',[['Close']])}
// HUD
const hudCache={};function setH(id,v,prop){if(hudCache[id]===v)return;hudCache[id]=v;const e=$(id);if(prop)e.style[prop]=v;else e.innerHTML=v}
function hud(){const show=S&&S.mode=='play';for(const id of['hud','radio','obj','bA','bB','bS','bH','tP','tM','tF']){const v=show?'':'none';if(hudCache[id+'_d']!==v){hudCache[id+'_d']=v;$(id).style.display=v}}if(!show)return;
 const h=S.time/60|0,m=S.time%60|0;setH('clock','🕒'+String(h).padStart(2,'0')+':'+String(m).padStart(2,'0'));setH('score','★'+(S.score|0));setH('rank',rankOf(SAVE.career+S.score).toUpperCase());
 setH('hpb',S.hp+'%','width');setH('stb',S.st+'%','width');setH('rpb',S.rep+'%','width');
 setH('status',(me.inCar?'🚓 DRIVING':'🚶 ON FOOT')+(S.carry.length?' · 🔗'+S.carry.length:'')+(S.x&&S.x.partner?' · 👮':'')+' · 🍩'+S.donuts+(S.boost>0?' · ☕':'')+' · 🕵'+(S.case?(S.case.stage=='investigate'?S.case.srcs.filter(s=>s.found).length+'/3':S.case.stage=='warrant'?'WARRANT':'✔'):'-')+(S.held.some(h=>!h.papered)?' · 📝'+S.held.filter(h=>!h.papered).length:''));
 ticker();
 let o='';const C=S.case;if(S.carry.length&&S.scene=='city')o='Bring perp to POLICE (blue arrow)';else if(S.carry.length&&S.scene=='station')o='Go to BOOKING desk (top-right room)';else if(S.held.some(h=>!h.papered)&&S.scene=='station')o='Interrogate (top-left) or do PAPERWORK (bullpen)';else if(C&&C.stage=='investigate'&&C.srcs.every(s=>s.found))o='All clues! Evidence board in the station';else if(C&&C.stage=='warrant')o='Arrest '+C.culprit.name+' (yellow !)';else if(S.hp<35)o='Low HP — get donuts (pink on map)';else if(crimes.length&&S.scene=='city')o='Respond to crimes (red/yellow !)';
 o=extObj(o);setH('obj',o);$('obj').style.display=o?'':'none';
 if(S.act){const l=S.act.label;setH('bA',`A<small>${l}</small>`)}if(S.bAct){setH('bB',`B<small>${S.bAct.label}</small>`);$('bB').style.opacity=S.bAct.dim?.5:1}
 setH('bS',me.inCar?'TURBO':'RUN');setH('bH',me.inCar?'🚨':'📣')}
// title
function showTitle(){closeDlg();if(!S||S.mode!='title'){newShift()}S.mode='title';sirenUpdate(false);$('title').style.display='flex';
 const nr=nextRank(SAVE.career);$('career').innerHTML=`Rank: <b>${rankOf(SAVE.career)}</b> · Career ${SAVE.career} pts${nr?` (${nr[0]-SAVE.career} to ${nr[1]})`:''}<br>Shifts ${SAVE.shifts} · Best ${SAVE.best} · Cases ${SAVE.cases||0}`;$('tSnd').textContent='♪ Sound: '+(SAVE.muted?'off':'on')}
$('tStart').onclick=()=>{audioInit();SFX.success();$('title').style.display='none';newShift();if(IS_TOUCH)toast('Drag left side to move · A = action',2600)};
$('tHelp').onclick=()=>{audioInit();dlg('How to Play',HELP,[['Got it']],true);S.modal=false};
$('tSnd').onclick=()=>{audioInit();setMuted(!SAVE.muted);tM.textContent=SAVE.muted?'🔇':'♪';$('tSnd').textContent='♪ Sound: '+(SAVE.muted?'off':'on')};
function titleUpdate(dt){simT+=dt;const t=performance.now()/1000;me.x=PP*3+Math.cos(t*.05)*PP*1.6;me.y=PP*3+Math.sin(t*.05)*PP*1.6;for(const c of cars)updCar(c,dt);for(const p of peds)if(p.state=='walk'||p.state=='waitcross'||p.state=='cross'||p.state=='idle')updPed(p,dt)}
function drawTitle(){const s=Math.max(4,Math.min(W/40,H/22)|0);const y=H*.12;const t=performance.now();ctx.fillStyle='rgba(0,0,20,.45)';ctx.fillRect(0,0,W,H);
 ptext(ctx,'BEAT COP',W/2,y+Math.sin(t/400)*3,'#fd3',s,'center','#702');ptext(ctx,'DONUT JUSTICE',W/2,y+s*8,(t/300|0)%2?'#f8c':'#fff',Math.max(2,s/2|0),'center','#000');
 drawPerson(ctx,COP_LOOK,W/2,y+s*18,Math.PI/2,(t/150)%4,'');ctx.save();ctx.translate(W/2,y+s*12);ctx.scale(s/2,s/2);drawPerson(ctx,COP_LOOK,0,20,Math.PI/2,(t/180)%4,'');ctx.restore()}
// ---------- loop
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;
 try{if(S){if(S.mode=='play'&&!S.paused&&!S.modal)update(dt);else if(S.mode=='title')titleUpdate(dt);if(S.mode=='play'&&S.modal&&S.scene=='city'){for(const f of floaters)f.life-=dt*0}}
  render(dt);if(S&&S.mode=='title')drawTitle();hud()}catch(err){console.error(err);window.__err=String(err.stack||err)}
 requestAnimationFrame(loop)}
$('ver').textContent='v'+VERSION;
buildCity();resize();showTitle();requestAnimationFrame(loop);
// debug hooks for automated tests
window.__bc={get S(){return S},get me(){return me},get peds(){return peds},get cars(){return cars},spawnCrime,newShift,enterScene,exitScene,cuff,tackle,stationAct,accuse,findClue,
 tp:(x,y)=>{me.x=x;me.y=y;cam.x=x;cam.y=y},STATION,DONUT,patrol:()=>patrol,crimes:()=>crimes,setTime:t=>S.time=t};
