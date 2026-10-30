// ---------- v2.1 extensions: settings, new crimes, traffic stops, events, partner, upgrades, goals, tutorial
const DEF={sfxVol:.8,musVol:.75,ctl:1,lefty:false,shiftLen:'normal',shake:true,cash:0,upg:{},tutDone:false,tutForce:false};
for(const k in DEF)if(SAVE[k]==null)SAVE[k]=DEF[k];
function applyVol(){if(!AU.ctx)return;AU.sfx.gain.value=SAVE.sfxVol;AU.mus.gain.value=SAVE.music?.3*SAVE.musVol:0}
const _audioInit=audioInit;audioInit=function(){_audioInit();applyVol()};
function rankIdx(){const c=SAVE.career+(S&&S.mode=='play'?S.score|0:0);let i=0;RANKS.forEach((r,j)=>{if(c>=r[0])i=j});return i}
Object.assign(CR,{speeding:{n:'Speeding',code:'10-SP',pts:90,minor:1,car:1},dui:{n:'Driving Under the Influence',code:'10-DUI',pts:220,car:1},brawl:{n:'Bar Fight',code:'10-BF',pts:150,flee:.45},
 pickpocket:{n:'Pickpocketing',code:'10-PP',pts:160,flee:1.2},robbery:{n:'Armed Robbery',code:'10-AR',pts:420,flee:.5},deal:{n:'Drug Deal',code:'10-DD',pts:280,flee:1}});
const UNLOCK={speeding:0,pickpocket:0,brawl:0,dui:1,deal:1,robbery:2};
function fleeSpd(p){if(!S)return 60;const prog=clamp((S.time-(S.start||720))/((S.end||1200)-(S.start||720)),0,1);let b=50+prog*12+Math.min(6,rankIdx()*1.2);if(S.tut)b-=7;return b+(({warrant:6,pickpocket:10,robbery:3,deal:4})[p.crime]||0)}
const TUT=['Drag on the left side of the screen to walk','Yellow ! = minor crime. Walk up, press A to TICKET','Press B next to your cruiser (blue dot on map) to drive','Red ! = arrest. Catch them: TACKLE (A), then CUFF (A)','Drive to POLICE, BOOKING desk, then PAPERWORK at your desk'];
const GOALS=[['Write 3 tickets',()=>S.tickets,3],['File 2 arrests',()=>S.arrests,2],['Eat 2 donuts',()=>S.stats.donutsEaten,2],['Radar 2 speeders',()=>S.stats.radar,2],['Make a traffic stop',()=>S.stats.stops,1],['Help 2 citizens',()=>S.stats.events,2],['File a perfect form',()=>S.stats.perfectForms,1],['Get a confession',()=>S.stats.conf,1],['Tase a runner',()=>S.stats.tased,1]];
function initExt(){S.x={ev:[],evT:rnd(25,40),closure:null,partner:null,backup:null,log:[],q:[],cur:null,taserCd:0,closeCd:0,hintCd:0};Object.assign(S.stats,{radar:0,stops:0,events:0,tased:0});
 S.goals=shuffle(GOALS.filter(g=>g[0]!='Tase a runner'||SAVE.upg.taser).slice()).slice(0,3).map(g=>({t:g[0],f:g[1],n:g[2],done:false}));
 S.tut=(!SAVE.tutDone&&SAVE.shifts==0)||SAVE.tutForce?{step:0,t:0,mx:me.x,my:me.y}:null;if(S.tut)S.spawnT=999}
const _newShift=newShift;newShift=function(){_newShift();initExt()};
const _radio=radio;radio=function(t,c){_radio(t,c);const X=S&&S.x;if(!X)return;X.log.unshift(t);if(X.log.length>25)X.log.pop();X.q.push({msg:t,c:c||'#7f7'});while(X.q.length>5){const i=X.q.findIndex(m=>m.c=='#9c9');X.q.splice(i>=0?i:0,1)}};
const _spawnCrime=spawnCrime;spawnCrime=function(force){if(!S.x)initExt();let ty=force;if(!ty&&!S.tut&&R()<.5)ty=pick(Object.keys(UNLOCK).filter(k=>UNLOCK[k]<=rankIdx()));
 if(ty&&UNLOCK[ty]!=null)return spawnNew(ty);return _spawnCrime(ty)};
function nearPeds(a,b){return peds.filter(p=>p.state=='walk'&&!p.crime&&!p.witness&&dist(p,me)<T*b&&dist(p,me)>T*a)}
function spawnNew(ty){const C=CR[ty];
 if(C.car){const c=pick(cars.filter(c=>!c.flee&&!c.busted&&!c.offense&&Math.hypot(c.x-me.x,c.y-me.y)>T*6&&Math.hypot(c.x-me.x,c.y-me.y)<T*30));if(!c)return;
  Object.assign(c,{offense:ty,done:false,pulled:false,baseMax:c.baseMax||c.maxv,maxv:ty=='speeding'?rnd(82,95):rnd(38,48),drvLook:randLook(),drvName:rname(),stopT:0,radChecked:false});const scan=SAVE.upg.scanner;crimes.push({t:ty,car:c,hidden:!scan});
  radio(`DISPATCH: ${C.code} ${ty=='dui'?'Erratic driver':'Speeder'} near ${where(c)}: ${colName(c.col)} ${c.type}. ${scan?'':'(Scanner upgrade marks it.) '}Siren on + tail it to pull over.`,'#ff8');SFX.radio();return c}
 if(ty=='brawl'){const c=nearPeds(4,28);const p=pick(c);if(!p)return;const q=c.filter(o=>o!=p).sort((a,b)=>dist(a,p)-dist(b,p))[0];if(!q)return;
  for(const o of[p,q]){o.crime='brawl';o.state='crime';o.ct=0;o.foe=o==p?q:p;crimes.push({t:'brawl',ped:o})}
  radio(`DISPATCH: ${C.code} Fist fight near ${where(p)}! ${p.name.split(' ')[0]} vs ${q.name.split(' ')[0]}.`,'#ff8');SFX.radio();return p}
 if(ty=='deal'){const p=pick(nearPeds(6,30));if(!p)return;const q=mkPed();q.x=p.x+10;q.y=p.y;q.L.hood='#333';moveCircle(q,0,0,4,solidCity);peds.push(q);
  for(const o of[p,q]){o.crime='deal';o.state='crime';o.ct=0;o.foe=o==p?q:p;o.stake=0;crimes.push({t:'deal',ped:o})}
  radio(`DISPATCH: ${C.code} Suspected deal near ${where(p)}. Stake out from a distance before busting for a bonus.`,'#ff8');SFX.radio();return p}
 const p=pick(nearPeds(5,30));if(!p)return;p.crime=ty;p.state='crime';p.ct=0;crimes.push({t:ty,ped:p});
 if(ty=='robbery'){p.L=Object.assign({},p.L,{mask:true,hat:null,hood:null,headph:null});p.armed=true;p.shootT=2;radio(`DISPATCH: ${C.code} ARMED ROBBERY near ${where(p)}! Use your cruiser as cover, call BACKUP, or tase.`,'#f88')}
 else radio(`DISPATCH: ${C.code} Pickpocket working the crowd near ${where(p)}. ${colName(p.L.shirt)} shirt.`,'#ff8');SFX.radio();return p}
const _crimeBehave=crimeBehave;crimeBehave=function(p,dt){const t=p.crime;
 if(t=='brawl'){p.ct+=dt;const f=p.foe;if(f&&f.crime=='brawl'&&f.state=='crime'){const d=dist(p,f);if(d>11){p.x+=(f.x-p.x)/d*30*dt;p.y+=(f.y-p.y)/d*30*dt;p.anim+=dt*8}else{p.anim+=dt*10;if(R()<dt*1.6){floatTxt((p.x+f.x)/2,p.y-24,pick(['POW!','BAM!','OOF!','SMACK!']),'#fa0',.8);spark((p.x+f.x)/2,p.y-10,3);SFX.whiff()}}p.dir=Math.atan2(f.y-p.y,f.x-p.x)}else p.anim=-1;
  if(dist(p,me)<T*4&&R()<dt*.8)startFlee(p);if(p.ct>80){p.crime=null;p.state='walk'}return}
 if(t=='deal'){p.ct+=dt;p.anim=-1;const f=p.foe;if(f)p.dir=Math.atan2(f.y-p.y,f.x-p.x);const d=dist(p,me);
  if((d<T*4.5&&!me.inCar)||d<T*2.5){startFlee(p);if(f&&f.state=='crime')startFlee(f);return}
  if(d<T*13&&p.stake<5){p.stake+=dt;if(p.stake>=5){p.staked=true;if(f){f.stake=5;f.staked=true}floatTxt(p.x,p.y-30,'EVIDENCE ON TAPE! BUST THEM','#6f6',2.5);SFX.success()}}
  if(p.ct>90){p.crime=null;p.state='walk'}return}
 if(t=='pickpocket'){p.ct+=dt;if(!p.mark||p.mark.crime||p.mark.state!='walk')p.mark=peds.find(q=>q!=p&&!q.crime&&q.state=='walk'&&dist(q,p)<T*8);
  if(p.mark){const m=p.mark,d=dist(p,m);if(d>6){p.x+=(m.x-p.x)/d*34*dt;p.y+=(m.y-p.y)/d*34*dt;p.dir=Math.atan2(m.y-p.y,m.x-p.x);p.anim+=dt*6}else{floatTxt(m.x,m.y-24,'MY WALLET!!','#f55');m.state='scared';m.wait=5;p.mark=null}}else p.anim=-1;
  if(dist(p,me)<T*6&&R()<dt*2)startFlee(p);if(p.ct>70){p.crime=null;p.state='walk'}return}
 if(t=='robbery'){p.ct+=dt;p.anim=-1;const d=dist(p,me);p.dir=Math.atan2(me.y-p.y,me.x-p.x);robberShoot(p,dt,d);if(R()<dt*.3)floatTxt(p.x,p.y-26,pick(['NOBODY MOVE!','HANDS UP!','BACK OFF COPPER!']),'#f55',1.2);
  if(p.ct>120){p.crime=null;p.state='walk';p.armed=false;repChange(-5);radio('DISPATCH: Robber escaped with the loot. Ouch.','#f88')}return}
 return _crimeBehave(p,dt)};
function robberShoot(p,dt,d){p.shootT=(p.shootT||2)-dt;if(d<T*6&&p.shootT<=0&&!(p.down>0)){p.shootT=rnd(1.2,1.8);noise(.08,.4,3000);const cov=!me.inCar&&dist(me,patrol)<22;const a=Math.atan2(me.y-p.y,me.x-p.x);for(let i=0;i<5;i++)parts.push({x:p.x+Math.cos(a)*i*12,y:p.y-10+Math.sin(a)*i*12,vx:0,vy:0,c:'#ff4',life:.15,s:2});
 if(me.inCar)floatTxt(patrol.x,patrol.y-14,'*PING*','#ccc');else if(cov)floatTxt(me.x,me.y-24,'IN COVER *PING*','#8cf');else if(R()<.55){hurt(9);floatTxt(me.x,me.y-24,'HIT! -9','#f55')}else floatTxt(me.x,me.y-24,'*MISSED*','#aaa')}}
const _flee=fleeBehave;fleeBehave=function(p,dt){if(p.ft==null)p.ft=0;_flee(p,dt);if(p.armed&&!p.cuffed)robberShoot(p,dt,dist(p,me))};
const _updPed=updPed;updPed=function(p,dt){if(p.surrender&&!p.cuffed){p.down=Math.max(p.down,.6);p.anim=-1;if(p.hitT)p.hitT-=dt;return}_updPed(p,dt)};
function surrender(p){p.surrender=true;p.down=1;floatTxt(p.x,p.y-26,'OK OK! I GIVE UP!','#6ff',2);radio('BACKUP: "Suspect is surrendering! Cuff \'em!"','#8cf');SFX.success()}
const _tackle=tackle;tackle=function(p){if(p.armed&&!p.surrender&&!(p.down>0)&&R()<.5){S.st-=12;hurt(6);floatTxt(me.x,me.y-24,'PISTOL-WHIPPED! -6','#f55');return}_tackle(p)};
const _cuff=cuff;cuff=function(p){const st=p.staked,foe=p.foe;_cuff(p);if(!p.cuffed)return;if(st){S.score+=200;floatTxt(p.x,p.y-34,'STAKEOUT BONUS +200','#6f6',2)}if(foe&&foe.crime&&!foe.cuffed&&foe.state=='crime')startFlee(foe);p.armed=false};
const _ate=ate;ate=function(t){_ate(t);if(SAVE.upg.glazers){S.hp=Math.min(100,S.hp+20);S.st=100}};
const _endShift=endShift;endShift=function(){SAVE.cash=(SAVE.cash||0)+Math.max(0,S.score|0);_endShift()};
// ---------- traffic & radar
const _updCar=updCar;updCar=function(c,dt){const Z=S&&S.x&&S.x.closure;if(Z&&!c.flee){const ax=c.x+DX[c.dir]*22,ay=c.y+DY[c.dir]*22,inZ=(x,y)=>x>Z.x0&&x<Z.x1&&y>Z.y0&&y<Z.y1;if(inZ(ax,ay)&&!inZ(c.x,c.y)){c.v=0;return}}
 _updCar(c,dt);if(c.offense=='dui'&&!c.pulled&&!c.done){c.ang+=Math.sin(simT*2.3+c.x*.01)*.03;if(R()<dt*.25)floatTxt(c.x,c.y-14,'*HIC*','#cf8',1)}};
function restoreCar(c){c.offense=null;c.done=true;c.pulled=false;c.stopped=0;c.maxv=c.baseMax||50}
function radarTarget(){const ca=Math.cos(patrol.a),sa=Math.sin(patrol.a);let best=null,bd=120;for(const c of cars){if(c.busted||c.radChecked)continue;const dx=c.x-patrol.x,dy=c.y-patrol.y,d=Math.hypot(dx,dy);if(d<bd&&d>10&&(dx*ca+dy*sa)/d>.7){bd=d;best=c}}return best}
function radar(c){c.radChecked=true;SFX.blip();const mph=Math.max(3,(c.offense=='speeding'?c.maxv:c.v)*1.1|0);const k=crimes.find(k=>k.car==c);
 if(c.offense=='speeding'){c.radared=true;S.stats.radar++;if(k)k.hidden=false;floatTxt(c.x,c.y-18,mph+' MPH! SPEEDER','#f55',2.2);SFX.success()}
 else if(c.offense=='dui'){if(k)k.hidden=false;floatTxt(c.x,c.y-18,mph+' MPH - WEAVING!','#fa0',2.2)}else floatTxt(c.x,c.y-18,mph+' MPH - OK','#aaa',1.4)}
function trafficStop(c){const mph=(c.maxv*1.1)|0;
 if(c.offense=='speeding')dlg('🚦 Traffic Stop',say(c.drvName,pick(['"Was I going fast? I was going fast."','"My wife is in labor! ...In two months."','"I thought the speed limit was a suggestion."']))+`<br><br>Radar: ${c.radared?`<b>${mph} MPH</b> in a 30 zone (confirmed)`:'not clocked (use RADAR from your cruiser for a bonus)'}`,
  [['🎫 Write ticket'+(c.radared?' (+radar bonus)':''),()=>{const pts=CR.speeding.pts+(c.radared?60:0);S.score+=pts;S.tickets++;repChange(1);SFX.ticket();floatTxt(c.x,c.y-18,'TICKET +'+pts,'#6f6');restoreCar(c)}],['🙏 Verbal warning',()=>{repChange(4);S.score+=30;floatTxt(c.x,c.y-18,'WARNING +30','#6f6');restoreCar(c)}]]);
 else dlg('🚦 Traffic Stop',say(c.drvName,pick(['"Offisher, I\'ve only had... *counts fingers*... nine."','"Ish not my car. Ish my car. Hic."','"Who put the road there?"'])),
  [['🧪 Breathalyzer',()=>{const bac=rnd(.09,.21).toFixed(2);dlg('🧪 Breathalyzer',`BAC: <b>${bac}</b> (legal limit 0.08)`,[['🔗 Arrest driver',()=>arrestDriver(c)],['🚕 Call them a taxi (+rep)',()=>{repChange(5);S.score+=60;floatTxt(c.x,c.y-18,'SAFE RIDE +60','#6f6');restoreCar(c);c.busted=true}]])}],
   ['🚶 Walk-the-line test',()=>dlg('Field Sobriety Test',say(c.drvName,'"*walks directly into a mailbox*"'),[['🔗 Arrest driver',()=>arrestDriver(c)]])]])}
function arrestDriver(c){const p=mkPed(c.drvLook);p.name=c.drvName;p.x=c.x;p.y=c.y+14;moveCircle(p,0,0,4,solidCity);p.crime='dui';p.state='crime';p.ct=0;peds.push(p);crimes.push({t:'dui',ped:p});restoreCar(c);c.busted=true;p.down=2;cuff(p)}
// ---------- events
function spawnEvent(type){const X=S.x;type=type||pick(['cat','kid','party'].concat(rankIdx()>=1&&!X.closure?['parade']:[]).filter(t=>!X.ev.some(e=>e.type==t)));if(!type)return;
 if(type=='cat'){const t=randTile((v,x,y)=>v==3&&Math.hypot((x+.5)*T-me.x,(y+.5)*T-me.y)<T*30);const e={type,x:(t.x+.5)*T,y:(t.y+.5)*T,t:120};X.ev.push(e);radio(`DISPATCH: Cat stuck in a tree near ${where(e)}. Yes, the same cat.`,'#9cf')}
 if(type=='kid'){const t=randTile((v,x,y)=>v==1&&Math.hypot((x+.5)*T-me.x,(y+.5)*T-me.y)<T*25);const t2=randTile((v,x,y)=>v==1&&Math.hypot(x-t.x,y-t.y)>14&&Math.hypot(x-t.x,y-t.y)<32);
  const L=randLook();Object.assign(L,{ht:0,build:0,beard:false,stache:false,old:false});const e={type,x:(t.x+.5)*T,y:(t.y+.5)*T,L,dir:Math.PI/2,anim:-1,follow:false,px:(t2.x+.5)*T,py:(t2.y+.5)*T,PL:randLook(),t:180};X.ev.push(e);radio(`DISPATCH: Lost kid crying near ${where(e)}. Find their parent.`,'#9cf')}
 if(type=='party'){const b=findBlock('apart'),d=doorOf(b.bx,b.by);X.ev.push({type,x:d.x,y:d.y,t:150});radio('DISPATCH: Noise complaint at the apartments. Loud polka. Knock on the door.','#9cf')}
 if(type=='parade')spawnParade();SFX.radio()}
function spawnParade(){const ky=ri(1,5),kx=clamp(Math.floor(me.x/PP)+ri(-1,1),0,5);const Z={x0:kx*PP+48,x1:(kx+1)*PP,y0:ky*PP,y1:ky*PP+48,t:90,m:[]};
 for(let i=0;i<9;i++){const L=randLook();L.hat=pick(['#c22','#fd3','#fff','#36c']);Z.m.push({L,o:i*15+rnd(0,6),lane:i%3})}
 cars=cars.filter(c=>!(c.x>Z.x0-6&&c.x<Z.x1+6&&c.y>Z.y0&&c.y<Z.y1&&!c.flee&&!c.offense));S.x.closure=Z;S.x.ev.push({type:'parade',x:(Z.x0+Z.x1)/2,y:Z.y0+24,t:90});
 radio(`DISPATCH: Parade near ${where({x:Z.x0+60,y:Z.y0-20})}. Road closed 90s. Do NOT drive through it.`,'#9cf')}
function party(e){dlg('🎺 Noise Complaint',say('PARTY HOST','"It\'s a POLKA party, officer! Polka is a lifestyle!"'),[['🙂 Ask nicely to turn it down',()=>evDone(e,'QUIET +60',60,2)],['🎫 Write noise citation',()=>{S.tickets++;evDone(e,'CITATION +90',90,-1)}]])}
function evDone(e,txt,pts,rep){e.done=true;S.score+=pts;repChange(rep);S.stats.events++;SFX.success();vib(25);const x=e.type=='kid'?e.px:e.x,y=e.type=='kid'?e.py:e.y;floatTxt(x,y-24,txt,'#6f6',2);for(let i=0;i<10;i++)parts.push({x,y:y-10,vx:rnd(-40,40),vy:rnd(-50,0),c:pick(['#6f6','#ff0','#fff']),life:.7,s:2})}
function callBackup(p){S.x.backup={delay:S.x.partner?2:6,target:p,L:COP2_LOOK,x:0,y:0,anim:-1,dir:0};radio('YOU: "Shots fired! Requesting backup!"','#8cf');SFX.radio()}
function tase(p){const X=S.x;X.taserCd=7;X.zap={x1:me.x,y1:me.y-10,x2:p.x,y2:p.y-10,t:.3};p.down=p.armed?5:3.5;p.hitT=.3;if(p.state=='crime')p.state='flee';S.hitstop=.08;S.shake=.25;tone(1400,.25,'sawtooth',.12,300);vib(60);S.stats.tased++;floatTxt(p.x,p.y-24,'ZZZAP!','#6ff')}
// ---------- partner & upgrades
const PARTNER_LOOK={skin:'#c88a5a',hair:'#1a1410',hs:2,shirt:'#2c4cb0',pants:'#1a2550',shoes:'#111',build:0,ht:1,cop:true};
const QUIPS=['"Donut o\'clock yet?"','"I\'ve seen worse driving. At a derby."','"Is it legal to arrest a mime?"','"Sarge says I talk too much. Anyway-"','"Nice siren. Very... loud."','"I call shotgun. Forever."','"You ever REALLY think about donuts?"','"My mom said I\'d never be a cop."'];
function copDesk(){const X=S.x;dlg('Officer Ramirez',say('OFFICER RAMIREZ',X.partner?'"Partner! Need something?"':'"Rookie Ramirez reporting. Want a partner? I chase runners and I know ALL the jokes."')+`<br><br>Requisition budget: <b>$${SAVE.cash|0}</b>`,
 [[X.partner?'👋 Dismiss partner':'🤝 Ride along with me',()=>{if(X.partner){X.partner=null;toast('Ramirez stays at the station')}else{X.partner={x:me.x+10,y:me.y,L:PARTNER_LOOK,cd:0,anim:-1,dir:0,quipT:8,scene:S.scene};toast('🤝 Ramirez joins your patrol');SFX.success()}}],['🛒 Requisitions (upgrades)',shop],['Bye']])}
const UPG=[['engine','🏎 Interceptor engine (+18% car speed)',800],['taser','⚡ Taser (A: TASE runners at range)',600],['glazers','🍩 Gourmet glazers (donuts +20 HP & full stamina)',400],['scanner','📡 Radio scanner (speeders & DUIs on map)',500]];
function shop(){dlg('🛒 Requisitions',`Budget: <b>$${SAVE.cash|0}</b> (every shift's score is added to the budget)`,UPG.map(u=>[SAVE.upg[u[0]]?'✅ '+u[1]:`${u[1]} - $${u[2]}`,()=>{if(SAVE.upg[u[0]])return shop();if(SAVE.cash<u[2]){SFX.error();toast('Not enough budget');return shop()}
  SAVE.cash-=u[2];SAVE.upg[u[0]]=true;persist();SFX.fanfare();toast('Installed: '+u[1]);shop()}]).concat([['Done']]),true)}
// ---------- actions
const _getAction=getAction;getAction=function(){const X=S.x;if(!X)return _getAction();
 if(S.scene=='station'&&Math.hypot(me.x-21*T,me.y-14.3*T)<30)return{label:'RAMIREZ',fn:copDesk};
 if(S.scene!='city')return _getAction();
 if(me.inCar){const rc=radarTarget();return rc?{label:'RADAR',fn:()=>radar(rc)}:_getAction()}
 for(const k of crimes){const c=k.car;if(c&&c.pulled&&!c.done&&Math.hypot(c.x-me.x,c.y-me.y)<28)return{label:'DRIVER',fn:()=>trafficStop(c)}}
 if(nearestPed(18,p=>p.down>0&&p.crime&&!p.cuffed))return _getAction();
 const rob=crimes.find(k=>k.t=='robbery'&&k.ped&&!k.ped.surrender&&dist(k.ped,me)<T*16);if(rob&&!X.backup)return{label:'BACKUP',fn:()=>callBackup(rob.ped)};
 if(SAVE.upg.taser&&X.taserCd<=0){const tp=nearestPed(80,p=>p.crime&&!p.cuffed&&!(p.down>0)&&p.state!='witness'&&dist(p,me)>22);if(tp)return{label:'TASE',fn:()=>tase(tp)}}
 for(const e of X.ev){const d=Math.hypot(e.x-me.x,e.y-me.y);
  if(e.type=='cat'&&d<24)return{label:'RESCUE',fn:()=>evDone(e,'MEOW! +80',80,3)};
  if(e.type=='kid'){if(!e.follow&&d<20)return{label:'HELP KID',fn:()=>{e.follow=true;floatTxt(e.x,e.y-20,'"I WANT MY MOM!"','#fff',2);SFX.blip()}};if(e.follow&&Math.hypot(e.px-me.x,e.py-me.y)<28)return{label:'REUNITE',fn:()=>evDone(e,'REUNITED! +150',150,6)}}
  if(e.type=='party'&&d<22)return{label:'KNOCK',fn:()=>party(e)}}
 return _getAction()};
// ---------- per-frame
const _update=update;update=function(dt){_update(dt);if(S.mode=='play'&&!S.modal&&S.x)extUpdate(dt)};
function tutSpawn(ty){const t=S.tut;if(t.last&&performance.now()-t.last<4000)return;t.last=performance.now();_spawnCrime(ty)}
function tutUpdate(){const t=S.tut;const adv=()=>{t.step++;t.t=0;SFX.success();vib(30);if(t.step>=TUT.length){S.tut=null;SAVE.tutDone=true;SAVE.tutForce=false;persist();S.score+=200;toast('🎓 Tutorial complete! +200. Normal patrol begins.',3000);S.spawnT=4;return}toast('✅ '+TUT[t.step],3200)};
 if(t.step==0){if(Math.hypot(me.x-t.mx,me.y-t.my)>40)adv()}
 else if(t.step==1){if(S.tickets>0)adv();else if(!crimes.length&&t.t>2)tutSpawn('litter')}
 else if(t.step==2){if(me.inCar)adv()}
 else if(t.step==3){if(S.carry.length||S.arrests)adv();else if(!crimes.some(k=>k.ped&&!CR[k.t].minor)&&t.t>2)tutSpawn('shoplift')}
 else if(t.step==4&&(S.arrests>0||t.t>240))adv()}
function extUpdate(dt){const X=S.x;X.taserCd=Math.max(0,X.taserCd-dt);X.closeCd=Math.max(0,X.closeCd-dt);X.hintCd=Math.max(0,X.hintCd-dt);if(X.zap)X.zap.t-=dt;
 if(X.cur){X.cur.t-=dt;if(X.cur.t<=0)X.cur=null}if(!X.cur&&X.q.length){const m=X.q.shift();m.t=clamp(2+m.msg.length*.05,3.5,8)*(X.q.length>1?.7:1);m.dur=m.t*.9;m.id=Math.random();X.cur=m}
 if(S.tut){S.tut.t+=dt;tutUpdate()}
 for(const g of S.goals)if(!g.done&&g.f()>=g.n){g.done=true;S.score+=150;SFX.fanfare();toast('🎯 Goal complete: '+g.t+' +150',2600)}
 const P=X.partner;if(P){P.cd=Math.max(0,P.cd-dt);P.quipT-=dt;
  if(me.inCar&&S.scene=='city'){P.x=patrol.x;P.y=patrol.y;P.hide=true}
  else{P.hide=false;let tg=null;if(S.scene=='city'&&P.cd<=0)tg=peds.find(p=>p.crime&&p.state=='flee'&&!p.cuffed&&!(p.down>0)&&dist(p,P)<T*6);
   const tp=tg||trail[Math.min(trail.length-1,14+S.carry.length*7)]||me;const d=Math.hypot(tp.x-P.x,tp.y-P.y);
   if(d>T*12||P.scene!=S.scene){P.x=me.x+8;P.y=me.y+4;P.scene=S.scene}
   else if(d>3){const s=Math.min(d,(tg?74:Math.max(50,d*6))*dt);P.dir=Math.atan2(tp.y-P.y,tp.x-P.x);if(tg)moveCircle(P,(tp.x-P.x)/d*s,(tp.y-P.y)/d*s,4,solidCity);else{P.x+=(tp.x-P.x)/d*s;P.y+=(tp.y-P.y)/d*s}P.anim=(P.anim<0?0:P.anim)+dt*(tg?14:8)}else P.anim=-1;
   if(tg&&dist(tg,P)<10){tg.down=3;tg.hitT=.25;P.cd=14;SFX.tackle();S.shake=.2;floatTxt(tg.x,tg.y-24,'RAMIREZ TACKLE!','#6f6');floatTxt(P.x,P.y-32,'"GOT \'EM!"','#8cf',1.6)}}
  if(P.quipT<=0){P.quipT=rnd(25,45);const q=pick(QUIPS);if(P.hide)floatTxt(patrol.x,patrol.y-20,q,'#8cf',2.6);else if(P.scene==S.scene)floatTxt(P.x,P.y-28,q,'#8cf',2.6)}}
 if(S.scene!='city')return;
 for(const k of crimes){const c=k.car;if(!c||!c.offense||c.pulled||c.done)continue;const d=Math.hypot(c.x-patrol.x,c.y-patrol.y);
  if(me.inCar&&d<55){if(S.siren){c.stopT+=dt;if(c.stopT>1.4){c.pulled=true;c.stopped=1e6;c.v=0;S.stats.stops++;k.hidden=false;floatTxt(c.x,c.y-16,'PULLING OVER','#8cf',2);SFX.blip();radio(`YOU: "Traffic stop, ${colName(c.col)} ${c.type}." Get out and talk to the driver.`,'#8cf')}}else if(X.hintCd<=0){X.hintCd=6;floatTxt(patrol.x,patrol.y-20,'SIREN ON (H/🚨) TO PULL OVER','#ff6',2)}}else c.stopT=Math.max(0,c.stopT-dt*.5);
  if(d>T*50){restoreCar(c);repChange(-2);radio('DISPATCH: Lost the traffic offender. Eh.','#f88')}}
 X.evT-=dt;if(X.evT<=0){X.evT=rnd(35,60);if(!S.tut&&X.ev.length<2)spawnEvent()}
 for(const e of X.ev){e.t-=dt;if(e.type=='kid'&&e.follow){if(me.inCar){e.x=patrol.x;e.y=patrol.y}else{const d=Math.hypot(me.x-e.x,me.y-e.y);if(d>14){const s=Math.min(d,Math.max(40,d*3)*dt);e.dir=Math.atan2(me.y-e.y,me.x-e.x);e.x+=(me.x-e.x)/d*s;e.y+=(me.y-e.y)/d*s;e.anim=(e.anim<0?0:e.anim)+dt*10}else e.anim=-1}}}
 X.ev=X.ev.filter(e=>!e.done&&(e.t>0||(e.type=='kid'&&e.follow)));
 const Z=X.closure;if(Z){Z.t-=dt;if(me.inCar&&Math.hypot(patrol.vx,patrol.vy)>30&&patrol.x>Z.x0&&patrol.x<Z.x1&&patrol.y>Z.y0&&patrol.y<Z.y1&&X.closeCd<=0){X.closeCd=4;Z.bad=true;repChange(-3);S.score-=40;floatTxt(patrol.x,patrol.y-20,'YOU DROVE THROUGH THE PARADE! -40','#f55',2)}
  if(Z.t<=0){X.closure=null;if(!Z.bad){S.score+=100;S.stats.events++;radio('DISPATCH: Parade went off without a hitch. +100','#9cf')}else radio('DISPATCH: Parade over. Tuba player filed a complaint.','#f88')}}
 const B=X.backup;if(B){const tg=B.target;if(B.delay>0){B.delay-=dt;if(B.delay<=0){const a=Math.atan2(me.y-tg.y,me.x-tg.x)+rnd(-.6,.6);B.x=tg.x+Math.cos(a)*110;B.y=tg.y+Math.sin(a)*110;radio('BACKUP: "Unit 7 on scene!"','#8cf')}}
  else{const done=!tg||tg.cuffed||!tg.crime||!peds.includes(tg);if(done){B.leave=(B.leave||0)+dt;if(B.leave>4)X.backup=null}
   else{const d=dist(B,tg);if(d>28){B.x+=(tg.x-B.x)/d*64*dt;B.y+=(tg.y-B.y)/d*64*dt;B.dir=Math.atan2(tg.y-B.y,tg.x-B.x);B.anim=(B.anim<0?0:B.anim)+dt*10}else{B.anim=-1;B.dir=Math.atan2(tg.y-B.y,tg.x-B.x)}
    if(d<40&&tg.armed&&!tg.surrender)surrender(tg)}}}}
// ---------- drawing hooks
function drawTree(e,now){ctx.fillStyle='#5a3a1a';ctx.fillRect(e.x-2,e.y-16,4,16);ctx.fillStyle='#1f5f2a';ctx.beginPath();ctx.arc(e.x,e.y-24,11,0,7);ctx.fill();ctx.fillStyle='#2f8a3a';ctx.beginPath();ctx.arc(e.x-3,e.y-27,7,0,7);ctx.fill();
 const w=(now/300|0)%2;ctx.fillStyle='#f93';ctx.fillRect(e.x+3,e.y-31,5,3);ctx.fillRect(e.x+3,e.y-33,1,2);ctx.fillRect(e.x+7,e.y-33,1,2);ctx.fillRect(e.x+8,e.y-30+w,1,3);ctx.fillStyle='#000';ctx.fillRect(e.x+4,e.y-31,1,1);ctx.fillRect(e.x+6,e.y-31,1,1)}
function extEnts(ents,vis,now){const X=S&&S.x;if(!X)return;const P=X.partner;
 if(P&&!P.hide&&P.scene==S.scene)ents.push({y:P.y,d:()=>drawPerson(ctx,P.L,P.x,P.y,P.dir,P.anim,'')});
 if(S.scene!='city')return;const B=X.backup;if(B&&B.delay<=0&&vis(B))ents.push({y:B.y,d:()=>drawPerson(ctx,B.L,B.x,B.y,B.dir,B.anim,'')});
 for(const e of X.ev){if(e.type=='cat'&&vis(e))ents.push({y:e.y,d:()=>drawTree(e,now)});
  if(e.type=='kid'){if(!(e.follow&&me.inCar)&&vis(e))ents.push({y:e.y,d:()=>drawPerson(ctx,e.L,e.x,e.y,e.dir,e.anim,'')});if(vis({x:e.px,y:e.py}))ents.push({y:e.py,d:()=>drawPerson(ctx,e.PL,e.px,e.py,Math.PI/2,e.follow?(now/200)%4:-1,'')})}
  if(e.type=='party'&&vis(e)&&(now/250|0)%2)ents.push({y:e.y,d:()=>{ptext(ctx,'♪',e.x+rnd(-8,8),e.y-30,pick(['#f6f','#6ff','#ff6']),1)}})}
 const Z=X.closure;if(Z&&vis({x:(Z.x0+Z.x1)/2,y:Z.y0+24})){const len=Z.x1-Z.x0;for(const m of Z.m){const x=Z.x0+((m.o*len/140+now*.014)%len),y=Z.y0+12+m.lane*14;ents.push({y,d:()=>drawPerson(ctx,m.L,x,y,0,(now/140)%4,'')})}
  for(const cx of[Z.x0+3,Z.x1-3])for(let y=Z.y0+4;y<Z.y1;y+=9)ents.push({y,d:()=>{ctx.fillStyle='#f80';ctx.fillRect(cx-2,y-5,4,5);ctx.fillStyle='#fff';ctx.fillRect(cx-2,y-3,4,1)}})}}
function extOverlay(now,vis){const X=S&&S.x;if(!X||S.mode!='play')return;
 if(X.zap&&X.zap.t>0){const z=X.zap;ctx.strokeStyle='#8ff';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(z.x1,z.y1);for(let i=1;i<6;i++){const k=i/6;ctx.lineTo(z.x1+(z.x2-z.x1)*k+rnd(-3,3),z.y1+(z.y2-z.y1)*k+rnd(-3,3))}ctx.lineTo(z.x2,z.y2);ctx.stroke()}
 if(S.scene!='city')return;
 for(const e of X.ev){if(e.type=='kid'){if(!e.follow&&vis(e))qmark(e.x,e.y-26,now);if(e.follow&&vis({x:e.px,y:e.py}))qmark(e.px,e.py-30,now)}else if(e.type!='parade'&&vis(e))qmark(e.x,e.y-(e.type=='cat'?44:30),now)}
 for(const p of peds)if(p.crime=='deal'&&p.state=='crime'&&p.stake>0&&vis(p)){ctx.fillStyle='#000';ctx.fillRect(p.x-8,p.y-35,16,4);ctx.fillStyle=p.staked?'#6f6':'#fd3';ctx.fillRect(p.x-7,p.y-34,14*Math.min(1,p.stake/5),2)}
 const Z=X.closure;if(Z){const c={x:(Z.x0+Z.x1)/2,y:Z.y0-2};if(vis(c))ptext(ctx,'PARADE - ROAD CLOSED',c.x,c.y,'#fd3',1,'center','#000')}
 const B=X.backup;if(B&&B.delay<=0&&vis(B))ptext(ctx,'BACKUP',B.x,B.y-30,'#8cf',1,'center','#000');
 for(const k of crimes){const c=k.car;if(c&&c.pulled&&!c.done&&vis(c)){ctx.fillStyle=(now/200|0)%2?'#f33':'#36f';ctx.fillRect(c.x-1,c.y-12,3,3)}}}
function extLights(glow){const X=S.x;if(!X)return;const P=X.partner;if(P&&!P.hide&&S.scene=='city')glow(P.x,P.y-6,22,.6);if(X.backup&&X.backup.delay<=0)glow(X.backup.x,X.backup.y,24,.6);for(const e of X.ev)if(e.type=='party')glow(e.x,e.y,30,.8);const Z=X.closure;if(Z)glow((Z.x0+Z.x1)/2,Z.y0+24,60,.7)}
function extArrows(){const X=S.x;if(!X)return;for(const e of X.ev){if(e.type=='kid'&&e.follow)edgeArrow(e.px,e.py,'#6cf','MOM');else if(e.type!='kid'||!e.follow)edgeArrow(e.x,e.y,'#6cf')}}
function extMinimap(){const X=S.x;if(!X)return;const r=mmRect();const span=r.big?N:30;let cx=me.x/T,cy=me.y/T;if(r.big){cx=N/2;cy=N/2}const sx=clamp(cx-span/2,0,N-span),sy=clamp(cy-span/2,0,N-span),k=r.s/span;
 ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.s,r.s);ctx.clip();const Z=X.closure;if(Z){ctx.fillStyle='rgba(255,140,0,.85)';ctx.fillRect(r.x+(Z.x0/T-sx)*k,r.y+(Z.y0/T-sy)*k,(Z.x1-Z.x0)/T*k,(Z.y1-Z.y0)/T*k)}
 const dot=(wx,wy,c,s)=>{const x=r.x+(wx/T-sx)*k,y=r.y+(wy/T-sy)*k;ctx.fillStyle='#000';ctx.fillRect(x-s/2-1,y-s/2-1,s+2,s+2);ctx.fillStyle=c;ctx.fillRect(x-s/2,y-s/2,s,s)};
 for(const e of X.ev){if(e.type=='kid'&&e.follow)dot(e.px,e.py,'#6cf',5);else if(e.type!='parade')dot(e.x,e.y,'#6cf',5)}const P=X.partner;if(P&&!P.hide)dot(P.x,P.y,'#8cf',3);ctx.restore()}
function extObj(o){if(!S.x)return o;if(S.tut)return '🎓 '+TUT[S.tut.step];if(o)return o;const g=(S.goals||[]).find(g=>!g.done);return g?`🎯 ${g.t} (${Math.min(g.n,g.f())}/${g.n})`:''}
// ---------- settings / log
function settings(fromTitle){const pct=v=>Math.round(v*100)+'%',cyc=(a,v)=>a[(a.indexOf(v)+1)%a.length],re=()=>{persist();applyVol();layout();settings(fromTitle)};
 dlg('⚙ Settings','Tap an option to change it.',[
 ['🔊 Sound FX: '+pct(SAVE.sfxVol),()=>{SAVE.sfxVol=cyc([0,.25,.5,.75,1],SAVE.sfxVol);re();SFX.blip()}],
 ['🎵 Music: '+(SAVE.music?pct(SAVE.musVol):'OFF'),()=>{if(!SAVE.music){SAVE.music=true;SAVE.musVol=.25}else if(SAVE.musVol>=1)SAVE.music=false;else SAVE.musVol=cyc([.25,.5,.75,1],SAVE.musVol);re()}],
 ['🎮 Button size: '+({0.8:'S',1:'M',1.2:'L',1.4:'XL'})[SAVE.ctl],()=>{SAVE.ctl=cyc([.8,1,1.2,1.4],SAVE.ctl);re()}],
 ['✋ Layout: '+(SAVE.lefty?'LEFT-handed (buttons on left)':'RIGHT-handed (buttons on right)'),()=>{SAVE.lefty=!SAVE.lefty;re()}],
 ['⏱ Shift length: '+({short:'SHORT ~5 min',normal:'NORMAL ~8 min',long:'LONG ~12 min'})[SAVE.shiftLen]+' (next shift)',()=>{SAVE.shiftLen=cyc(['short','normal','long'],SAVE.shiftLen);re()}],
 ['📳 Vibration: '+(SAVE.vib?'ON':'OFF'),()=>{SAVE.vib=!SAVE.vib;re()}],
 ['💥 Screen shake: '+(SAVE.shake?'ON':'OFF'),()=>{SAVE.shake=!SAVE.shake;re()}],
 ['🎓 Tutorial next shift: '+(SAVE.tutForce||!SAVE.tutDone?'YES':'NO'),()=>{SAVE.tutForce=!(SAVE.tutForce||!SAVE.tutDone);if(!SAVE.tutForce)SAVE.tutDone=true;re()}],
 [fromTitle?'✔ Done':'◀ Back',()=>{if(fromTitle)S.modal=false;else{S.paused=false;togglePause()}}]],true)}
function radioLog(){dlg('📻 Radio Log',(S.x.log.length?S.x.log.map(t=>'• '+t).join('<br>'):'Quiet night.'),[['Close']],true)}
$('radio').onclick=()=>{if(S&&S.x&&S.mode=='play'&&!S.modal)radioLog()};
{const b=document.createElement('button');b.id='tSet';b.textContent='⚙ Settings';$('tHelp').after(b);b.onclick=()=>{audioInit();settings(true)}}
if(S&&!S.x)initExt();layout();
Object.assign(window.__bc,{spawnNew,spawnEvent,spawnParade,trafficStop,copDesk,shop,settings,tase,callBackup,radar,radarTarget,extUpdate,togglePause,save:()=>SAVE});
