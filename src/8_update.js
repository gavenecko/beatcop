// ---------- interaction resolution
function nearestPed(r,f){let b=null,bd=r;for(const p of peds){if(p.inCar||p.inRoom)continue;if(f&&!f(p))continue;const d=dist(p,me);if(d<bd){bd=d;b=p}}return b}
function getAction(){
 if(S.scene!='city'){const objs=IOBJ[S.scene]||[];let best=null,bd=26;
  const ev=sceneEvidence();if(ev&&Math.hypot(ev.ix-me.x,ev.iy-me.y)<22)return{label:'SEARCH',fn:()=>findClue(ev)};
  for(const o of objs){if(!o.act)continue;const cx=clamp(me.x,o.x*T,(o.x+o.w)*T),cy=clamp(me.y,o.y*T,(o.y+o.h)*T);const d=Math.hypot(cx-me.x,cy-me.y);if(d<bd){bd=d;best=o}}
  if(best)return{label:best.label,fn:()=>S.scene=='station'?stationAct(best.act):S.scene=='donut'?donutShop(best.act):0};
  if(S.scene=='donut'&&Math.hypot(me.x-10.7*T,me.y-5.2*T)<30)return{label:'TALK',fn:gossip};
  if(S.scene=='station'&&Math.hypot(me.x-12.5*T,me.y-1.6*T)<34)return{label:'SERGEANT',fn:sergeant};
  if(['bank','jewel','apart','pawn'].includes(S.scene)&&Math.hypot(me.x-4*T,me.y-1.8*T)<30)return{label:'TALK',fn:ownerTalk};
  return{label:'SHOUT',fn:shout}}
 if(me.inCar)return{label:S.siren?'SIREN OFF':'SIREN',fn:()=>{S.siren=!S.siren;SFX.blip()}};
 const downed=nearestPed(18,p=>p.down>0&&p.crime&&!p.cuffed);
 if(downed)return CR[downed.crime].minor?{label:'TICKET',fn:()=>ticket(downed)}:{label:'CUFF',fn:()=>cuff(downed)};
 const perp=nearestPed(26,p=>p.crime&&!p.cuffed&&p.state!='witness');
 if(perp){if(CR[perp.crime].minor&&perp.state=='crime'&&dist(perp,me)<22)return{label:'TICKET',fn:()=>ticket(perp)};return{label:'TACKLE',fn:()=>tackle(perp)}}
 for(const k in blocks){const b=blocks[k];if(!ENTERABLE[b.type])continue;const d=doorOf(b.bx,b.by);if(Math.hypot(d.x-me.x,d.y-me.y)<16)return{label:'ENTER',fn:()=>enterScene(ENTERABLE[b.type])}}
 const C=S.case;if(C&&C.stage=='investigate')for(const s of C.srcs)if(s.src=='item'&&!s.found&&Math.hypot(s.x-me.x,s.y-me.y)<18)return{label:'PICK UP',fn:()=>findClue(s)};
 const w=nearestPed(24,p=>p.state=='witness');if(w)return{label:'TALK',fn:()=>talkWitness(w)};
 const pd=nearestPed(20,p=>!p.crime);if(pd)return{label:'TALK',fn:()=>chat(pd)};
 return{label:'FREEZE!',fn:shout}}
function getB(){if(S.scene!='city')return{label:'—',fn:()=>{}};if(me.inCar)return{label:'EXIT',fn:exitCar};if(dist(me,patrol)<28)return{label:'CAR',fn:enterCar};return{label:'CAR',fn:()=>{floatTxt(me.x,me.y-24,'CAR TOO FAR (BLUE ON MAP)','#aaa');SFX.error()},dim:1}}
function ownerTalk(){const n={bank:'BANK MANAGER',jewel:'MR. GLITTER',apart:'THE MAYOR',pawn:'PAWN SHOP OWNER'}[S.scene];const C=S.case;
 dlg('',say(n,C&&C.tpl.scene==S.scene&&C.stage=='investigate'?pick(['"Please, officer, find who did this!"','"Look around! The evidence is RIGHT there somewhere!"']):pick(['"Business is fine. Suspiciously fine."','"Thanks for stopping by, officer. Want a lollipop?"','"Are you here to buy something? No? Okay."'])),[['Bye']])}
function chat(p){p.state='idle';p.wait=2;const C=S.case;let t=pick(['"Nice day, officer."','"I didn\'t do it! ...Do what?"','"Is that a donut crumb on your badge?"','"My cousin is a lawyer. Sort of."','"Have you tried the new maple bar?"','"Can you arrest my landlord?"','"I pay your salary! Well, 0.0001% of it."','"Love the hat."']);
 const cr=crimes.find(k=>k.ped&&k.ped.state=='crime');if(cr&&R()<.4)t=`"Saw something shady near ${where(cr.ped)}!"`;
 floatTxt(p.x,p.y-24,t.length>34?t.slice(0,33)+'"':t,'#fff',2.4);SFX.blip()}
function shout(){SFX.honk();vib(15);floatTxt(me.x,me.y-24,pick(['FREEZE!','STOP! POLICE!','HALT!','HEY YOU!']),'#ff6');
 for(const p of peds)if(p.state=='flee'&&dist(p,me)<T*7&&R()<.35){p.state='freeze';p.ft=1.6;floatTxt(p.x,p.y-24,'*FREEZES*','#6ff')}}
function tackle(p){if(S.st<12){floatTxt(me.x,me.y-24,'TOO TIRED... DONUT?','#aaa');SFX.error();return}S.st-=12;me.tackle=.22;me.dir=Math.atan2(p.y-me.y,p.x-me.x);
 const d=dist(p,me);if(d<19||R()<.45){p.down=p.state=='flee'?2.6:3.2;p.ft=(p.ft||0)+4;S.shake=.25;SFX.tackle();vib(70);spark(p.x,p.y-4,6);for(let i=0;i<8;i++)parts.push({x:p.x,y:p.y,vx:rnd(-30,30),vy:rnd(-30,30),c:'#cbb',life:.5,s:2});floatTxt(p.x,p.y-24,CR[p.crime].minor?'TACKLED! A: TICKET':'TACKLED! A: CUFF','#6f6')}
 else{SFX.whiff();floatTxt(me.x,me.y-24,'*WHIFF*','#aaa');if(p.state=='crime')startFlee(p)}}
function cuff(p){if(S.carry.length>=2){floatTxt(me.x,me.y-24,'HANDS FULL! BOOK THEM FIRST','#aaa');SFX.error();return}
 p.cuffed=true;p.down=0;p.state='cuffed';p.follow=true;S.carry.push(p);S.score+=50;SFX.cuff();vib([30,20,30]);floatTxt(p.x,p.y-24,'CUFFED! +50','#6f6');
 radio(`YOU: "Suspect ${p.name} in custody. Bringing them in."`,'#8cf');crimes=crimes.filter(k=>k.ped!=p);if(p.victim){p.victim.state='walk';p.victim=null}
 for(let i=0;i<12;i++)parts.push({x:p.x,y:p.y-10,vx:rnd(-50,50),vy:rnd(-60,0),c:pick(['#6f6','#ff0','#fff']),life:.7,s:2})}
function ticket(p){const c=CR[p.crime];S.tickets++;S.score+=c.pts;repChange(1);SFX.ticket();vib(20);
 floatTxt(p.x,p.y-24,`TICKET! +${c.pts}`,'#6f6');floatTxt(p.x,p.y-34,pick(['"THIS IS AN OUTRAGE!"','"Can I pay in exposure?"','"I\'ll frame it."','"Ugh, FINE."']),'#fff',2.2);
 crimes=crimes.filter(k=>k.ped!=p);p.crime=null;p.down=0;p.state='walk';p.jw=null;if(p.victim){p.victim.state='walk';p.victim=null}}
function enterCar(){me.inCar=true;SFX.door();vib(15);for(const p of S.carry){p.inCar=true}if(S.carry.length)floatTxt(me.x,me.y-24,'PERP IN BACK SEAT','#8cf')}
function exitCar(){const p=patrol;const sp=Math.hypot(p.vx,p.vy);if(sp>50){floatTxt(me.x,me.y-24,'SLOW DOWN FIRST','#aaa');return}
 me.inCar=false;S.siren=false;sirenUpdate(false);p.vx=p.vy=0;let ok=false;for(const a of[Math.PI/2,-Math.PI/2,Math.PI,0]){const x=p.x+Math.cos(p.a+a)*16,y=p.y+Math.sin(p.a+a)*16;if(!solidCity(x,y)){me.x=x;me.y=y;ok=true;break}}if(!ok){me.x=p.x;me.y=p.y}
 trail=[];S.carry.forEach((c,i)=>{c.inCar=false;c.x=p.x;c.y=p.y});SFX.door()}
// ---------- main update
function update(dt){
 S.time+=dt;if(S.boost>0)S.boost-=dt;if(S.complainT>0)S.complainT-=dt;if(S.crashT>0)S.crashT-=dt;
 if(S.time>=20*60){endShift();return}
 smoothJoy(dt);const iv=inputVec();const running=(keys.ShiftLeft||keys.ShiftRight||IN.run);
 const act=getAction(),bAct=getB();S.act=act;S.bAct=bAct;
 if(IN.pressA){IN.pressA=false;act.fn();if(S.modal)return}
 if(IN.pressB){IN.pressB=false;bAct.fn()}
 // player
 if(me.inCar&&S.scene=='city'){updPatrol(dt,iv,running);me.x=patrol.x;me.y=patrol.y}
 else{const canRun=running&&S.st>1;const sp=(canRun?82:46)*(S.st<10?0.65:1)*(S.boost>0?1.25:1);
  if(canRun&&iv.m>.1)S.st-=13*dt;else S.st=Math.min(100,S.st+(iv.m>.1?5:9)*dt);
  const solid=S.scene=='city'?solidCity:(x,y)=>iSolid(S.scene,x,y);
  if(me.tackle>0){me.tackle-=dt;moveCircle(me,Math.cos(me.dir)*150*dt,Math.sin(me.dir)*150*dt,4,solid)}
  else if(iv.m>.08){me.dir=Math.atan2(iv.y,iv.x);moveCircle(me,iv.x*sp*dt,iv.y*sp*dt,4,solid);const pa=me.anim;me.anim=(me.anim<0?0:me.anim)+dt*sp*.18;if((pa|0)!=(me.anim|0)&&(me.anim|0)%2==0)SFX.step();if(canRun&&R()<dt*10)parts.push({x:me.x,y:me.y,vx:rnd(-8,8),vy:-6,c:'#bbb',life:.35,s:2})}
  else me.anim=-1;
  if(S.scene!='city'){const I=INTERIORS[S.scene];const ty=Math.floor((me.y+4)/T),tx=Math.floor(me.x/T);if((I.grid[ty]||'')[tx]=='D')exitScene()}}
 S.st=clamp(S.st,0,100);
 // carried suspects follow trail
 const lt=trail[0];if(!lt||Math.hypot(lt.x-me.x,lt.y-me.y)>2){trail.unshift({x:me.x,y:me.y});if(trail.length>60)trail.pop()}
 S.carry.forEach((p,i)=>{if(p.inCar){p.x=patrol.x;p.y=patrol.y;return}const tp=trail[Math.min(trail.length-1,7+i*7)];if(tp){const d=Math.hypot(tp.x-p.x,tp.y-p.y);if(d>.5){const s=Math.min(d,Math.max(50,d*8)*dt);p.dir=Math.atan2(tp.y-p.y,tp.x-p.x);p.x+=(tp.x-p.x)/d*s;p.y+=(tp.y-p.y)/d*s;p.anim=(p.anim<0?0:p.anim)+dt*8}else p.anim=-1}});
 if(S.scene=='city')updCity(dt);
 sirenUpdate(me.inCar&&S.siren&&S.scene=='city');
 AU.intense=S.scene=='city'&&(crimes.some(k=>(k.ped&&k.ped.state=='flee')||(k.car&&k.car.flee))||(me.inCar&&S.siren))?1:0;
 // hp
 S.hp=Math.min(100,S.hp+dt*.4);if(S.hp<=0)passOut();
 for(const f of floaters){f.life-=dt;f.y-=14*dt}floaters=floaters.filter(f=>f.life>0);
 for(const p of parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.92;p.vy*=.92}parts=parts.filter(p=>p.life>0);if(parts.length>500)parts.splice(0,parts.length-500);
 for(const m of S.msgs)m.life-=dt;S.msgs=S.msgs.filter(m=>m.life>0);if(S.shake>0)S.shake-=dt}
function updCity(dt){simT+=dt;
 for(const p of peds)updPed(p,dt);for(const c of cars)updCar(c,dt);
 for(const p of peds)if(p.witness&&p.sulk>0)p.sulk-=dt;
 for(const p of peds)if(p.crime=='mug'&&p.state=='flee'&&!me.inCar&&dist(p,me)<11&&R()<dt*1.2){hurt(7);floatTxt(me.x,me.y-24,'*PURSE SWING* -7','#f55')}
 cars=cars.filter(c=>!(c.busted&&Math.hypot(c.x-me.x,c.y-me.y)>T*30));while(cars.length<30){const c=mkCar();if(!c)break;cars.push(c)}
 // flee car lost
 for(const c of cars)if(c.flee&&Math.hypot(c.x-me.x,c.y-me.y)>T*48){c.flee=false;crimes=crimes.filter(k=>k.car!=c);repChange(-4);radio('DISPATCH: Stolen vehicle lost. Insurance company sends a frowny face.','#f88')}
 crimes=crimes.filter(k=>k.ped?(k.ped.crime&&!k.ped.cuffed&&peds.includes(k.ped)):k.car&&k.car.flee);
 S.spawnT-=dt;if(S.spawnT<=0){const hour=S.time/60;S.spawnT=rnd(8,15)-(hour-12)*.6;if(crimes.length<3+(hour>17?1:0))spawnCrime()}
 S.banterT-=dt;if(S.banterT<=0){S.banterT=rnd(25,45);radio(pick(['DISPATCH: Cat stuck in tree on 5th. Again. Same cat.','DISPATCH: Report of a man "looking suspicious". He is just tall.','DISPATCH: Reminder: the break room microwave is NOT evidence.','DISPATCH: 10-DONUT, Sergeant wants a dozen. Glazed.','DISPATCH: Bagpipe noise complaint. Respond with empathy.','DISPATCH: Someone is selling "slightly used" parking meters.','DISPATCH: All units: the vending machine has won again.']),'#9c9');SFX.radio()}
 if(S.caseDelay>0){S.caseDelay-=dt;if(S.caseDelay<=0){for(const p of peds)if(p.state=='witness'){p.state='walk';p.witness=null}newCase();radio(`SGT KRUPKE: New case: "${S.case.tpl.title}". Check the evidence board!`,'#fd6');SFX.radio()}}}
function passOut(){S.hp=60;S.score-=150;repChange(-5);for(const p of S.carry){p.cuffed=false;p.follow=false;p.inCar=false;p.state='flee';p.ft=0;crimes.push({t:p.crime,ped:p})}S.carry=[];me.inCar=false;
 if(S.scene!='city'){S.scene='city'}me.x=STATION.x;me.y=STATION.y+12;cam.x=me.x;cam.y=me.y;dlg('🏥 You passed out!','You wake up outside the station holding a juice box. -150 pts, -5 rep. Eat more donuts.',[['Okay mom']])}
function endShift(){S.mode='end';sirenUpdate(false);const unfiled=S.held.filter(h=>!h.papered).length;const pen=unfiled*75;S.score-=pen;const before=SAVE.career;SAVE.career=Math.max(0,SAVE.career+Math.max(0,S.score|0));SAVE.shifts++;SAVE.best=Math.max(SAVE.best,S.score|0);persist();
 const rk=rankOf(SAVE.career),promoted=rankOf(before)!=rk;if(promoted)SFX.fanfare();
 dlg('🌙 End of Shift',`<b>Score:</b> ${S.score|0}<br><b>Arrests filed:</b> ${S.arrests} · <b>Tickets:</b> ${S.tickets}<br><b>Confessions:</b> ${S.stats.conf} · <b>Perfect forms:</b> ${S.stats.perfectForms}<br><b>Cases closed:</b> ${S.stats.cases}<br><b>Donuts eaten:</b> ${S.stats.donutsEaten}<br><b>Reputation:</b> ${S.rep|0}${unfiled?`<br><span style="color:#f88">Unfiled paperwork: ${unfiled} (-${pen})</span>`:''}<br><br>${S.rep>70?'Commissioner material!':S.rep>40?'Decent cop. Average mustache.':'Desk duty. Forever.'}<br><br>Career: ${SAVE.career} pts — <b>${rk}</b>${promoted?' 🎖 PROMOTED!':''}`,[['New shift',()=>{newShift()}],['Title screen',showTitle]],true)}
