// ---------- v2.2: Harbor District, alleys & vaulting, photos, court, weather, partner abilities, scanner, accessibility
const DEF2={bigText:false,weather:true,pAbil:'chase',convictions:0,harborSeen:false};for(const k in DEF2)if(SAVE[k]==null)SAVE[k]=DEF2[k];
const HARBOR_RANK=2,HB=(BN-1)*P+3;
function harborLocked(){return rankIdx()<HARBOR_RANK}
HLOCK=(x,y)=>(x>=HB*T||y>=HB*T)&&harborLocked();
CLIM=()=>harborLocked()?BN-1:BN;
const inHarbor=o=>o.x>=(HB-3)*T||o.y>=(HB-3)*T;
function applyText(){document.body.classList.toggle('big',!!SAVE.bigText)}applyText();
// world: warehouse interior + case
INTERIORS.wharf={name:'Pier 9 Warehouse',grid:['##############','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','#bbbbbbbbbbbb#','######DD######']};
IOBJ.wharf=[{k:'crate',x:1.2,y:1,w:2,h:2,solid:1},{k:'crate',x:3.4,y:1,w:2,h:2,solid:1},{k:'crate',x:1.2,y:3.2,w:2,h:1.6,solid:1},{k:'crate',x:9,y:1,w:3.6,h:1.6,solid:1},{k:'crate',x:9.5,y:5,w:2.5,h:2,solid:1},{k:'forklift',x:6,y:4,w:1.4,h:2,solid:1},{k:'chicken',x:4,y:7,w:.8,h:.6}];
ENTERABLE.wharf='wharf';
const _dIO=drawIObj;drawIObj=function(g,o,key){if(o.k=='crate'){const X=o.x*T,Y=o.y*T,w=o.w*T,h=o.h*T;g.fillStyle='rgba(0,0,0,.3)';g.fillRect(X+2,Y+h,w,3);g.fillStyle='#8a6a3a';g.fillRect(X,Y,w,h);g.fillStyle='#6a4a22';for(let y=Y+5;y<Y+h;y+=6)g.fillRect(X,y,w,1);g.fillRect(X,Y,1,h);g.fillRect(X+w-1,Y,1,h);g.fillStyle='#000';ptext(g,'TUNA',X+w/2,Y+h/2-3,'#222',1,'center',null);return}
 if(o.k=='forklift'){const X=o.x*T,Y=o.y*T;g.fillStyle='#e0a020';g.fillRect(X,Y+6,o.w*T,o.h*T-6);g.fillStyle='#333';g.fillRect(X+2,Y,2,8);g.fillRect(X+o.w*T-4,Y,2,8);g.fillStyle='#222';g.fillRect(X-1,Y+12,3,8);g.fillRect(X+o.w*T-2,Y+12,3,8);return}return _dIO(g,o,key)};
CASES.push({title:'The Fishy Shipment',scene:'wharf',intro:'A whole container of premium tuna vanished from the Pier 9 Warehouse overnight. Every cat in the city looks suspiciously well fed.',thing:'tuna crate',finale:'"Do you know what tuna COSTS these days?!"'});
const _newCase=newCase;newCase=function(){if(CASES[(SAVE.caseIdx||0)%CASES.length].scene=='wharf'&&harborLocked())SAVE.caseIdx=(SAVE.caseIdx||0)+1;return _newCase.apply(this,arguments)};
const _randTile=randTile;randTile=function(test){return _randTile((v,x,y)=>test(v,x,y)&&!HLOCK((x+.5)*T,(y+.5)*T))};
// sprites
const _randLook=randLook;randLook=function(arch){if(!arch&&R()<.1)arch='hoodie';if(!arch&&R()<.08)arch='worker';return _randLook(arch)};
const _mkPed=mkPed;mkPed=function(L){if(!L&&arguments.length==0){/*harbor bias applied after position*/}const p=_mkPed(L);if(!L&&inHarbor(p)&&R()<.45)p.L=randLook('worker');return p};
// crimes
Object.assign(CR,{cargo:{n:'Cargo Theft',code:'10-CT',pts:300,flee:1},trespass:{n:'Trespassing',code:'10-TP',pts:60,flee:.35,minor:1},race:{n:'Street Racing',code:'10-SR',pts:260,car:1}});
const BIG={robbery:1,deal:1,gta:1,cargo:1,dui:1,mug:1,warrant:1,race:1};
let HOLDR=0;const _radio2=radio;radio=function(t,c){if(HOLDR&&S&&S.x2){S.x2.delayed.push({t:5,a:[t,c]});return}_radio2(t,c)};
function spawnHarbor(){const pool=['cargo','cargo','trespass','race'];const ty=pick(pool);
 if(ty=='race'){const cs=cars.filter(c=>!c.flee&&!c.busted&&!c.offense&&inHarbor(c)&&Math.hypot(c.x-me.x,c.y-me.y)<T*40&&Math.hypot(c.x-me.x,c.y-me.y)>T*6);if(cs.length<2)return null;const pair=shuffle(cs).slice(0,2);
  for(const c of pair){Object.assign(c,{offense:'race',done:false,pulled:false,baseMax:c.baseMax||c.maxv,maxv:rnd(95,110),drvLook:randLook(),drvName:rname(),stopT:0,radChecked:false,runRed:true,type:'sport',col:pick(['#f2f','#2f6','#ff2','#f60'])});c.spr=null;crimes.push({t:'race',car:c,hidden:false})}
  radio(`DISPATCH: ${CR.race.code} Street race tearing through ${where(pair[0])}! Neon sports cars. Siren + tail to pull over.`,'#f88');SFX.radio();return pair[0]}
 const cand=peds.filter(p=>p.state=='walk'&&!p.crime&&inHarbor(p)&&dist(p,me)<T*32&&dist(p,me)>T*5);const p=pick(cand);if(!p)return null;p.crime=ty;p.state='crime';p.ct=0;crimes.push({t:ty,ped:p});
 if(ty=='cargo'){p.crate=3;mutateLook(p,{beanie:'#222',vest:false,hat:null,hood:null,cap:null,mask:false});radio(`DISPATCH: ${CR.cargo.code} Someone's lifting crates near ${where(p)}. Snap a 📷 photo before the bust for court.`,'#ff8')}
 else radio(`DISPATCH: ${CR.trespass.code} Trespasser on a restricted pier near ${where(p)}.`,'#cf8');SFX.radio();return p}
const _spawnCrime2=spawnCrime;spawnCrime=function(force){if(!S.x2)initX2();const n0=crimes.length;let r;
 const hold=!force&&!S.tut&&!SAVE.upg.scanner;HOLDR=hold?1:0;
 try{if(!force&&!S.tut&&!harborLocked()&&(inHarbor(me)?R()<.6:R()<.12))r=spawnHarbor();if(!r)r=_spawnCrime2(force)}finally{HOLDR=0}
 const nw=crimes.slice(n0);for(const k of nw){if(k.car&&(k.car.offense=='speeding'||k.car.offense=='dui'))k.car.runRed=true;if(hold){k.hidden=true;k.revealT=5}
  else if(SAVE.upg.scanner&&!force&&!S.tut){const o=k.ped||k.car;if(o&&S.x2.scanT<=0){S.x2.scanT=3;floatTxt(me.x,me.y-34,'📡 SCANNER PICKED IT UP EARLY','#c9f',1.6)}}}
 for(const k of nw)if(S.x.partner&&SAVE.pAbil=='spotter'){k.hidden=false;k.revealT=0}
 return r};
const _crimeBehave2=crimeBehave;crimeBehave=function(p,dt){if(p.crime=='cargo'){p.ct+=dt;p.anim=-1;if(R()<dt*.4)floatTxt(p.x,p.y-26,pick(['*heave*','*grunt*','"Just one more..."']),'#ddd',1);
  if(dist(p,me)<T*(me.inCar?3:5)&&R()<dt*2.5)startFlee(p);if(p.ct>100){p.crime=null;p.state='walk';p.crate=0;radio('DISPATCH: Cargo thief got away with the goods.','#f88')}return}return _crimeBehave2(p,dt)};
const _spawnNew=spawnNew;spawnNew=function(ty){const r=_spawnNew(ty);if(r&&r.offense)r.runRed=true;return r};
const _restoreCar=restoreCar;restoreCar=function(c){_restoreCar(c);c.runRed=false};
const _trafficStop=trafficStop;trafficStop=function(c){if(c.offense!='race')return _trafficStop(c);
 dlg('🏁 Street Racer',say(c.drvName,pick(['"Officer, I was merely... testing the brakes. At 110."','"Is this about the nitrous? Because that\'s for whipped cream."','"You\'ll never take me ali- oh, you already did."'])),
  [['🚚 Impound the car (+'+CR.race.pts+')',()=>{S.score+=CR.race.pts;S.tickets++;repChange(2);SFX.ticket();floatTxt(c.x,c.y-18,'IMPOUNDED +'+CR.race.pts,'#6f6');restoreCar(c);c.busted=true}],['🎫 Reckless driving ticket (+150)',()=>{S.score+=150;S.tickets++;repChange(1);SFX.ticket();floatTxt(c.x,c.y-18,'TICKET +150','#6f6');restoreCar(c)}]])};
// photos & court
function photoTargets(){if(S.scene!='city'||me.inCar)return null;let best=null,bd=T*8;for(const p of peds){if(!p.crime||p.photo||p.cuffed||p.inCar||!(p.state=='crime'||p.state=='flee'||p.down>0))continue;const d=dist(p,me);if(d<bd){bd=d;best=p}}
 if(!best)for(const it of S.x2.items){if(it.photo)continue;const d=Math.hypot(it.x-me.x,it.y-me.y);if(d<bd){bd=d;best=it}}return best}
function snap(o){o.photo=true;S.x2.flash=.25;S.stats.photos=(S.stats.photos||0)+1;S.score+=25;noise(.06,.35,5000);tone(1800,.04,'square',.08);vib(20);floatTxt(o.x,o.y-30,o.isItem?'EVIDENCE PHOTO +25':'📷 CAUGHT IN THE ACT +25','#fff',1.6);if(o.isItem&&o.owner)o.owner.photo=true}
const bP=mkBtn('bP','📷');hold(bP,()=>{if(S&&S.mode=='play'&&!S.modal){const t=photoTargets();if(t)snap(t)}});
const _layout=layout;layout=function(){_layout();const land=W>H;const s=clamp(Math.min(W,H)*(land?.2:.19),64,120)*(SAVE.ctl||1);const side=SAVE.lefty?'left':'right',other=SAVE.lefty?'right':'left';const pad=Math.max(12,s*.15);const k=.6;
 bP.style.width=bP.style.height=(s*k)+'px';bP.style[side]=(pad+s*1.4)+'px';bP.style[other]='auto';bP.style.bottom=(pad+s*1.95)+'px';bP.style.fontSize=(s*k*.42)+'px'};
function courtOdds(h){const p=h.p;let o=.35;if(p.photo)o+=.3;if(h.conf)o+=.25;if(p.staked)o+=.2;if(h.perfect)o+=.08;o+=(S.rep-50)/250;if(S.x.partner&&SAVE.pAbil=='smooth')o+=.15;return clamp(o,.08,.97)}
function court(h){const p=h.p;h.court=true;const C=CR[p.crime]||CR.shoplift;const o=courtOdds(h);const ev=[p.photo?'📷 Photo evidence':'❌ No photos',h.conf?'🗣 Signed confession':'❌ No confession',p.staked?'🎥 Stakeout tape':null].filter(Boolean).join('<br>');
 const verdict=(bonus)=>{const r=R(),oo=clamp(o+bonus,.02,.99);let t,pts,rep;if(r<oo){t='⚖ GUILTY! The gavel slams. Justice (and donuts) for all.';pts=Math.round(C.pts*.6);rep=3;SAVE.convictions++;S.stats.convictions=(S.stats.convictions||0)+1;SFX.fanfare()}else if(r<oo+.18){t='🤝 PLEA DEAL. Lesser charge, but it sticks.';pts=Math.round(C.pts*.25);rep=1;SFX.success()}else{t='🙅 NOT GUILTY. The defense lawyer smirks. Bring photos and confessions next time.';pts=0;rep=-3;SFX.error()}
  S.score+=pts;repChange(rep);persist();dlg('⚖ Verdict',`<b>${p.name}</b> - ${C.n}<br><br>${t}<br><br>${pts?'+'+pts+' pts':''}`,[['Back to the beat']])};
 dlg('⚖ Courtroom: The People v. '+p.name,`Charge: <b>${C.n}</b><br>Judge Honey Crullerman presiding.<br><br>${ev}<br><br>Conviction odds: <b>${Math.round(o*100)}%</b>`,[['📋 Stick to the facts',()=>verdict(0)],['🎭 Dramatic testimony (risky: ±20%)',()=>verdict(R()<.5?.2:-.2)],...(S.x.partner?[['👮 Ramirez testifies (+10%)',()=>{floatTxt(me.x,me.y-30,'"He did it. Also, nice robe, judge."','#8cf',2);verdict(.1)}]]:[])],true)}
const _paperwork=paperwork;paperwork=function(h){const pf=S.stats.perfectForms;_paperwork(h);h._pf=pf};
// partner
const QUIPS2={rain:['"Rain makes the donuts soggy. It\'s a tragedy."','"Wet roads. Brake early, hero."','"I forgot my umbrella. And my dignity."'],night:['"Night shift. Prime donut hours."','"Is it me or do streetlights hum in B-flat?"'],harbor:['"Smells like fish and bad decisions."','"Every crate here says TUNA. Suspicious."','"I get seasick on piers. Don\'t judge."'],chase:['"Cut through the alley!"','"Hop that fence! I\'ll go around!"','"They\'re faster than they look!"'],court:['"Photos win trials, rookie. Snap snap."']};
const ABIL={chase:'🏃 Chaser: tackles nearby runners',spotter:'👁 Spotter: reveals crimes instantly & snaps photos',smooth:'🗣 Smooth talker: +15% court odds, +rep on tickets'};
const _copDesk=copDesk;copDesk=function(){_copDesk();const b=$('box');const e=document.createElement('button');e.innerHTML='🎯 Partner focus: '+ABIL[SAVE.pAbil];e.onclick=ev=>{ev.stopPropagation();const ks=Object.keys(ABIL);SAVE.pAbil=ks[(ks.indexOf(SAVE.pAbil)+1)%ks.length];persist();SFX.select();closeDlg();copDesk()};b.insertBefore(e,b.querySelectorAll('button')[1]||null)};
const _ticket=ticket;ticket=function(p){_ticket(p);if(S.x&&S.x.partner&&SAVE.pAbil=='smooth'){repChange(1);floatTxt(S.x.partner.x,S.x.partner.y-28,'"Have a nice day!" +rep','#8cf',1.4)}};
function unstick(o,px,py,solid){const dx=o.x-px,dy=o.y-py;if(Math.hypot(dx,dy)>40){if(solid(o.x,o.y))free(o,solid);return}o.x=px;o.y=py;const h=moveCircle(o,dx,dy,4,solid);
 if(h){const m=Math.hypot(dx,dy)||1;o.side=o.side||(R()<.5?1:-1);const h2=moveCircle(o,-dy/m*m*o.side,dx/m*m*o.side,4,solid);if(h2)o.side*=-1}if(solid(o.x,o.y))free(o,solid)}
function free(o,solid){for(let r=4;r<80;r+=6)for(let i=0;i<12;i++){const a=i*TAU/12,x=o.x+Math.cos(a)*r,y=o.y+Math.sin(a)*r;if(!solid(x-4,y-4)&&!solid(x+4,y+4)&&!solid(x+4,y-4)&&!solid(x-4,y+4)){o.x=x;o.y=y;return}}}
function initX2(){S.x2={delayed:[],items:[],scanT:0,flash:0,rain:0,rainT:0,wantRain:SAVE.weather&&R()<.4,rainAt:rnd(S.start+30,S.end-90),drops:[],thunder:0,unl:harborLocked(),lastTile:0};S.wet=false;Object.assign(S.stats,{photos:0,convictions:0})}
const _newShift2=newShift;newShift=function(){_newShift2();initX2()};
GOALS.push(['Snap 2 evidence photos',()=>S.stats.photos||0,2],['Win a conviction',()=>S.stats.convictions||0,1]);
const _extUpdate=extUpdate;extUpdate=function(dt){const X=S.x,Y=S.x2||(initX2(),S.x2);const P=X.partner,B=X.backup;const pp=P?[P.x,P.y]:null,bp=B?[B.x,B.y]:null;
 if(P&&SAVE.pAbil!='chase')P.cd=Math.max(P.cd,1);
 _extUpdate(dt);
 const solid=S.scene=='city'?solidCity:(x,y)=>iSolid(S.scene,x,y);
 if(P&&X.partner==P&&!P.hide&&P.scene==S.scene)unstick(P,pp[0],pp[1],solid);
 if(B&&X.backup==B&&S.scene=='city'&&B.delay<=0){if(solidCity(B.x,B.y))free(B,solidCity);else if(bp&&Math.hypot(B.x-bp[0],B.y-bp[1])<40)unstick(B,bp[0],bp[1],solidCity);else if(solidCity(B.x,B.y))free(B,solidCity)}
 // delayed dispatch (no scanner)
 for(const d of Y.delayed){d.t-=dt;if(d.t<=0)_radio2(d.a[0],d.a[1])}Y.delayed=Y.delayed.filter(d=>d.t>0);
 for(const k of crimes)if(k.revealT>0){k.revealT-=dt;if(k.revealT<=0)k.hidden=false}
 Y.scanT-=dt;Y.flash=Math.max(0,Y.flash-dt);
 // harbor unlock
 if(Y.unl&&!harborLocked()){Y.unl=false;S.x2.unlockMsg=6;toast('⚓ HARBOR DISTRICT UNLOCKED! Southeast of the city.',3500);radio('SGT KRUPKE: "Congrats on the promotion. You\'re cleared for the Harbor District. Watch the pier."','#fd6');SFX.fanfare();MM=null}
 // crimes extras
 for(const p of peds){if(p.crime=='cargo'&&p.state=='flee'&&p.crate>0&&R()<dt*.6){p.crate--;Y.items.push({x:p.x,y:p.y,isItem:true,owner:p,t:60});floatTxt(p.x,p.y-24,'*CRASH* crate dropped','#da6',1)}
  if(S.wet&&p.state=='flee'&&!(p.down>0)&&R()<dt*.07){p.down=1.1;p.hitT=.2;floatTxt(p.x,p.y-24,'SLIPPED!','#8cf',1.2)}}
 Y.items=Y.items.filter(i=>(i.t-=dt)>0);
 for(const k of crimes){const c=k.car;if(!c||!c.offense||c.pulled||c.done||c.rabbit!=null)continue;if(me.inCar&&S.siren&&Math.hypot(c.x-patrol.x,c.y-patrol.y)<55){c.rabbit=R()<(c.offense=='race'?.6:.25);
  if(c.rabbit){c.offense=null;c.flee=true;c.hp=3;c.thiefLook=c.drvLook;c.thiefName=c.drvName;k.t='gta';k.hidden=false;floatTxt(c.x,c.y-18,'HE\'S RUNNING!','#f55',2);radio('YOU: "Driver is NOT stopping! Pursuit! Ram the vehicle!"','#f88');S.shake=.2}}}
 // vault feedback
 const t=S.scene=='city'&&!me.inCar?tile(me.x/T,me.y/T):0;if(t==7&&Y.lastTile!=7){floatTxt(me.x,me.y-26,'VAULT!','#fff',.8);SFX.whiff&&SFX.whiff();for(let i=0;i<6;i++)parts.push({x:me.x,y:me.y,vx:rnd(-30,30),vy:rnd(-40,-5),c:'#bbb',life:.4,s:2})}Y.lastTile=t;
 // weather
 if(Y.wantRain&&S.time>=Y.rainAt&&!Y.rainOn){Y.rainOn=true;radio('DISPATCH: Heavy rain moving in. Roads are slick, drive careful.','#9cf')}
 Y.rain=clamp(Y.rain+(Y.rainOn?dt*.08:-dt*.1),0,1);S.wet=Y.rain>.3;
 if(Y.rain>.5&&darkness().night>.3){Y.thunder-=dt;if(Y.thunder<=0){Y.thunder=rnd(18,40);Y.flash=.35;setTimeout(()=>noise(1.2,.35,180),400)}}
 // contextual partner banter
 if(P&&P.quipT<.05&&P.quipT>0){const pool=[].concat(S.wet?QUIPS2.rain:[],darkness().night>.5?QUIPS2.night:[],inHarbor(me)?QUIPS2.harbor:[],peds.some(p=>p.state=='flee'&&p.crime)?QUIPS2.chase:[],S.held.length?QUIPS2.court:[]);if(pool.length&&R()<.7){P.quipT=rnd(25,45);const q=pick(pool);if(P.hide)floatTxt(patrol.x,patrol.y-20,q,'#8cf',2.6);else if(P.scene==S.scene)floatTxt(P.x,P.y-28,q,'#8cf',2.6)}}
 if(P&&SAVE.pAbil=='spotter'&&S.scene=='city'){P.snapT=(P.snapT||8)-dt;if(P.snapT<=0){P.snapT=12;const tg=peds.find(p=>p.crime&&!p.photo&&!p.cuffed&&dist(p,P.hide?patrol:P)<T*7);if(tg){snap(tg);floatTxt(P.hide?patrol.x:P.x,(P.hide?patrol.y:P.y)-34,'"Got a shot of \'em!"','#8cf',1.6)}}}
 // court after paperwork
 if(!S.modal){const h=S.held.find(h=>h.papered&&!h.court&&BIG[h.p.crime]);if(h&&S.scene=='station'){h.perfect=S.stats.perfectForms>(h._pf||0);court(h)}}};
const _fleeBehave2=fleeBehave;fleeBehave=function(p,dt){const tx=p.x/T|0,ty=p.y/T|0;let al=null;for(let r=1;r<=2&&!al;r++)for(const[dx,dy]of D4){const t=tile(tx+dx*r,ty+dy*r);if((t==6||t==7)&&(dx*(p.x-me.x)+dy*(p.y-me.y))>0){al=Math.atan2(dy,dx);break}}if(al!=null&&R()<.6)p.lastA=al;
 const was=tile(p.x/T,p.y/T);VAULT=1;try{_fleeBehave2(p,dt)}finally{VAULT=0}if(tile(p.x/T,p.y/T)==7&&was!=7)floatTxt(p.x,p.y-26,'HOP!','#fd6',.7)};
// HUD goals
{const g=document.createElement('div');g.id='goals';document.body.appendChild(g)}
extObj=function(o){if(!S.x)return o;if(S.tut)return '🎓 '+TUT[S.tut.step];return o};
const _hud=hud;hud=function(){_hud();const g=$('goals'),show=S&&S.mode=='play'&&S.goals;g.style.display=show?'':'none';
 const t=S&&S.mode=='play'?photoTargets():null;bP.style.display=t&&!S.modal?'':'none';if(!show)return;
 const txt='🎯 '+S.goals.map(q=>q.done?'✔ '+q.t:`${q.t} ${Math.min(q.n,q.f())}/${q.n}`).join(' · ');if(g._t!==txt){g._t=txt;g.textContent=txt}
 const r=$('radio');const top=(r.offsetTop||58)+(r.offsetHeight||18)+3;if(g._top!==top){g._top=top;g.style.top=top+'px'}};
// drawing
const _extEnts2=extEnts;extEnts=function(ents,vis,now){_extEnts2(ents,vis,now);if(!S.x2||S.scene!='city')return;
 for(const it of S.x2.items)if(vis(it))ents.push({y:it.y,d:()=>{ctx.fillStyle='#8a6a3a';ctx.fillRect(it.x-5,it.y-8,10,8);ctx.fillStyle='#6a4a22';ctx.fillRect(it.x-5,it.y-5,10,1);if(!it.photo){ctx.fillStyle=(now/300|0)%2?'#fff':'#fd3';ctx.fillRect(it.x-1,it.y-14,2,3)}}});
 for(const p of peds)if(p.crate>0&&!p.cuffed&&vis(p))ents.push({y:p.y+.1,d:()=>{ctx.fillStyle='#8a6a3a';ctx.fillRect(p.x-5,p.y-28,10,7);ctx.fillStyle='#6a4a22';ctx.fillRect(p.x-5,p.y-25,10,1)}})};
const _extOverlay2=extOverlay;extOverlay=function(now,vis){_extOverlay2(now,vis);if(!S||!S.x2||S.mode!='play'||S.scene!='city')return;
 if(harborLocked()){ctx.fillStyle='#f80';for(let k=0;k<BN;k++){for(const[x,y,w,h]of[[HB*T-4,k*PP+2,4,44],[k*PP+2,HB*T-4,44,4]]){if(!vis({x,y})&&!vis({x:x+w,y:y+h}))continue;for(let i=0;i<Math.max(w,h);i+=8){ctx.fillStyle=(i/8)%2?'#fff':'#f60';if(w>h)ctx.fillRect(x+i,y,Math.min(8,w-i),h);else ctx.fillRect(x,y+i,w,Math.min(8,h-i))}
   if(vis({x:x+w/2,y:y+h/2}))ptext(ctx,'HARBOR: '+RANKS[HARBOR_RANK][1].toUpperCase()+'+',x+w/2+(w>h?0:-34),y+h/2+(w>h?-12:-3),'#fd3',1,'center','#000')}}}
 for(const p of peds)if(p.photo&&p.crime&&!p.cuffed&&vis(p))ptext(ctx,'📷',p.x+9,p.y-34,'#fff',1,'center',null)};
function extGlowAdd(dk,vis){const n=dk.night;if(n<=0)return;const Y=S.x2;
 for(const k in blocks){const b=blocks[k];if(b.type=='park'||b.type=='park2'||b.type=='dock')continue;const sx=(b.bx*P+7.5)*T,sy=(b.by*P+10)*T+2;if(!vis({x:sx,y:sy}))continue;const s=worldToScreen(sx,sy),rr=30*cam.z;const col=b.type=='police'?'80,140,255':b.type=='donut'?'255,110,200':b.ind?'120,220,255':['255,90,90','90,255,140','255,200,80','180,120,255'][(b.bx*3+b.by)%4];
  const g=ctx.createRadialGradient(s.x,s.y,0,s.x,s.y,rr);g.addColorStop(0,`rgba(${col},${.28*n})`);g.addColorStop(1,`rgba(${col},0)`);ctx.fillStyle=g;ctx.fillRect(s.x-rr,s.y-rr,rr*2,rr*2)}
 if(Y&&S.wet)for(const l of LAMPS)if(vis(l)){const s=worldToScreen(l.x,l.y+10);const h=34*cam.z,w=5*cam.z;const g=ctx.createLinearGradient(s.x,s.y,s.x,s.y+h);g.addColorStop(0,`rgba(255,210,120,${.3*n*Y.rain})`);g.addColorStop(1,'rgba(255,210,120,0)');ctx.fillStyle=g;ctx.fillRect(s.x-w/2,s.y,w,h)}}
function extScreenFx(now,dk){const Y=S.x2;if(!Y)return;if(Y.rain>0){ctx.fillStyle=`rgba(30,40,60,${Y.rain*.18})`;ctx.fillRect(0,0,W,H);const n=Y.rain*140|0;while(Y.drops.length<n)Y.drops.push({x:R()*W,y:R()*H,v:rnd(500,800)});Y.drops.length=n;
  ctx.strokeStyle=`rgba(180,200,255,${.35+.2*dk.night})`;ctx.lineWidth=1;ctx.beginPath();for(const d of Y.drops){d.y+=d.v/60;d.x-=d.v/600;if(d.y>H){d.y=-10;d.x=R()*W*1.1}ctx.moveTo(d.x,d.y);ctx.lineTo(d.x-1.5,d.y+9)}ctx.stroke()}
 if(Y.flash>0){ctx.fillStyle=`rgba(255,255,255,${Y.flash*1.6})`;ctx.fillRect(0,0,W,H)}}
const _extMinimap2=extMinimap;extMinimap=function(){_extMinimap2();if(!S.x2)return;const r=mmRect();const span=r.big?N:30;let cx=me.x/T,cy=me.y/T;if(r.big){cx=N/2;cy=N/2}const sx=clamp(cx-span/2,0,N-span),sy=clamp(cy-span/2,0,N-span),k=r.s/span;
 ctx.save();ctx.beginPath();ctx.rect(r.x,r.y,r.s,r.s);ctx.clip();if(harborLocked()){ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(r.x+(HB-sx)*k,r.y,(N-HB)*k,r.s);ctx.fillRect(r.x,r.y+(HB-sy)*k,(HB-sx)*k,(N-HB)*k)}
 for(const it of S.x2.items){ctx.fillStyle='#da6';ctx.fillRect(r.x+(it.x/T-sx)*k-1,r.y+(it.y/T-sy)*k-1,3,3)}ctx.restore()};
// settings (adds text size + weather)
settings=function(fromTitle){const pct=v=>Math.round(v*100)+'%',cyc=(a,v)=>a[(a.indexOf(v)+1)%a.length],re=()=>{persist();applyVol();applyText();layout();settings(fromTitle)};
 dlg('⚙ Settings','Tap an option to change it.',[
 ['🔊 Sound FX: '+pct(SAVE.sfxVol),()=>{SAVE.sfxVol=cyc([0,.25,.5,.75,1],SAVE.sfxVol);re();SFX.blip()}],
 ['🎵 Music: '+(SAVE.music?pct(SAVE.musVol):'OFF'),()=>{if(!SAVE.music){SAVE.music=true;SAVE.musVol=.25}else if(SAVE.musVol>=1)SAVE.music=false;else SAVE.musVol=cyc([.25,.5,.75,1],SAVE.musVol);re()}],
 ['🎮 Button size: '+({0.8:'S',1:'M',1.2:'L',1.4:'XL'})[SAVE.ctl],()=>{SAVE.ctl=cyc([.8,1,1.2,1.4],SAVE.ctl);re()}],
 ['🔠 Large UI text: '+(SAVE.bigText?'ON':'OFF'),()=>{SAVE.bigText=!SAVE.bigText;re()}],
 ['✋ Layout: '+(SAVE.lefty?'LEFT-handed (buttons on left)':'RIGHT-handed (buttons on right)'),()=>{SAVE.lefty=!SAVE.lefty;re()}],
 ['⏱ Shift length: '+({short:'SHORT ~5 min',normal:'NORMAL ~8 min',long:'LONG ~12 min'})[SAVE.shiftLen]+' (next shift)',()=>{SAVE.shiftLen=cyc(['short','normal','long'],SAVE.shiftLen);re()}],
 ['🌧 Weather: '+(SAVE.weather?'ON (rain some shifts)':'OFF'),()=>{SAVE.weather=!SAVE.weather;re()}],
 ['📳 Vibration: '+(SAVE.vib?'ON':'OFF'),()=>{SAVE.vib=!SAVE.vib;re()}],
 ['💥 Screen shake: '+(SAVE.shake?'ON':'OFF'),()=>{SAVE.shake=!SAVE.shake;re()}],
 ['🎓 Tutorial next shift: '+(SAVE.tutForce||!SAVE.tutDone?'YES':'NO'),()=>{SAVE.tutForce=!(SAVE.tutForce||!SAVE.tutDone);if(!SAVE.tutForce)SAVE.tutDone=true;re()}],
 [fromTitle?'✔ Done':'◀ Back',()=>{if(fromTitle)S.modal=false;else{S.paused=false;togglePause()}}]],true)};
if(S&&!S.x2)initX2();layout();
Object.assign(window.__bc,{spawnHarbor,harborLocked,court,snap,photoTargets,courtOdds,settings,copDesk,trafficStop,x2:()=>S.x2,setRain:v=>{S.x2.rainOn=v;S.x2.rain=v?1:0},HB});
