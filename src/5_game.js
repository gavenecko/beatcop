// ---------- state
const CR={shoplift:{n:'Shoplifting',code:'10-SL',pts:120,flee:.9},jaywalk:{n:'Jaywalking',code:'10-JW',pts:40,flee:.15,minor:1},litter:{n:'Littering',code:'10-LT',pts:35,flee:.25,minor:1},
 noise:{n:'Boombox Disturbance',code:'10-BB',pts:45,flee:.1,minor:1},vandal:{n:'Vandalism',code:'10-VD',pts:100,flee:.7},mug:{n:'Mugging',code:'10-MG',pts:180,flee:1},gta:{n:'Grand Theft Auto',code:'10-GTA',pts:260},warrant:{n:'Outstanding Warrant',code:'10-WR',pts:500,flee:1}};
const FIRST=['Vinnie','Barb','Dusty','Gus','Marge','Skeeter','Tony','Lulu','Clem','Rex','Dolores','Chad','Brenda','Moose','Earl','Fran','Biff','Pearl','Otis','Nadia','Sal','Trixie','Leroy','Wanda','Hank','Ivy'];
const LAST=['Pastrami','McGillicuddy','Bonkowski','Fettucini','Schlotz','Wigglesworth','Dingle','Kowalczyk','Pfeiffer','Throckmorton','Noodleman','Crumb','Bagelstein','Snorkel','Puddlesworth','Grubb'];
const rname=()=>pick(FIRST)+' '+pick(LAST);
let S,me,patrol,peds,cars,parts,floaters,crimes,trail;
const cam={x:0,y:0,z:3};
function newShift(){S={mode:'play',time:14*60,start:14*60,end:22*60,tscale:({short:1.6,normal:1,long:.65})[SAVE.shiftLen]||1,score:0,rep:50,hp:100,st:100,donuts:1,arrests:0,tickets:0,booked:0,held:[],carry:[],scene:'city',cityRet:null,paused:false,modal:false,shake:0,msgs:[],boost:0,spawnT:6,banterT:20,caseDelay:0,complainT:0,crashT:0,papers:0,siren:false,bigMap:false,stats:{conf:0,perfectForms:0,donutsEaten:0,cases:0},lastMsg:''};
 me={x:STATION.x,y:STATION.y+10,dir:Math.PI/2,anim:-1,inCar:false,tackle:0,L:COP_LOOK};
 patrol={x:STATION.x+40,y:1*PP+PP+36,a:0,vx:0,vy:0,f:0};patrol.y=2*PP+36;patrol.x=1*PP+100;
 peds=[];cars=[];parts=[];floaters=[];crimes=[];trail=[];
 for(let i=0;i<60;i++)peds.push(mkPed());for(let i=0;i<30;i++){const c=mkCar();if(c)cars.push(c)}
 cam.x=me.x;cam.y=me.y;newCase();
 radio('DISPATCH: Afternoon, Unit 12. Shift runs 14:00 to 22:00, into the night. Try not to eat the evidence.','#8cf');
 setTimeout(()=>S&&radio(`SGT KRUPKE: New case on the evidence board: "${S.case.tpl.title}". Swing by the station.`,'#fd6'),3000)}
// ---------- peds
function randTile(test){for(let i=0;i<800;i++){const x=ri(1,N-2),y=ri(1,N-2);if(test(map[y*N+x],x,y))return{x,y}}return{x:4,y:3}}
function mkPed(L){const t=randTile(v=>v==1);return{x:(t.x+.5)*T,y:(t.y+.5)*T,tx:t.x,ty:t.y,dir:pick([0,Math.PI/2,Math.PI,-Math.PI/2]),L:L||randLook(),anim:0,spd:rnd(16,26),state:'walk',name:rname(),wait:0,crime:null,down:0,cuffed:false}}
const D4=[[1,0],[0,1],[-1,0],[0,-1]];
function pedNextTile(p){const cx=Math.floor(p.x/T),cy=Math.floor(p.y/T);const fd=[Math.round(Math.cos(p.dir)),Math.round(Math.sin(p.dir))];
 let opts=D4.filter(d=>!(d[0]==-fd[0]&&d[1]==-fd[1]));shuffle(opts);opts.sort((a,b)=>((b[0]==fd[0]&&b[1]==fd[1])?1:0)-((a[0]==fd[0]&&a[1]==fd[1])?1:0));if(R()<.25)shuffle(opts);
 for(const d of opts){const nx=cx+d[0],ny=cy+d[1];const t=tile(nx,ny);
  if(walkPed(t)){p.tx=nx;p.ty=ny;p.dir=Math.atan2(d[1],d[0]);return}
  if(t==0&&isCross(nx,ny)&&R()<.5){// crosswalk: wait for light
   let kx,ky,ok;if(d[1]==0){kx=Math.floor(nx/P);ky=Math.floor(ny/P)+(ny%P==P-1?1:0);ok=()=>light(kx,ky).ew=='g'}else{ky=Math.floor(ny/P);kx=Math.floor(nx/P)+(nx%P==P-1?1:0);ok=()=>light(kx,ky).ns=='g'}
   p.state='waitcross';p.cross={d,ok,tx:cx+d[0]*4,ty:cy+d[1]*4,t:0};p.dir=Math.atan2(d[1],d[0]);return}}
 p.tx=cx-fd[0];p.ty=cy-fd[1];p.dir+=Math.PI}
function updPed(p,dt){if(p.hitT)p.hitT-=dt;
 if(p.inCar)return;
 if(p.cuffed)return; // handled by follow
 if(p.down>0){p.down-=dt;if(p.down<=0){p.state=p.crime?'flee':'walk';if(p.crime)floatTxt(p.x,p.y-20,pick(['*WRIGGLES FREE*','LATER COPPER!','NOPE!']),'#fa0')}return}
 if(p.state=='freeze'){p.ft-=dt;p.anim=-1;if(p.ft<=0)p.state='flee';return}
 if(p.state=='witness'||p.state=='idle'){p.anim=-1;p.dir=Math.atan2(me.y-p.y,me.x-p.x);if(p.state=='idle'){p.wait-=dt;if(p.wait<=0)p.state='walk'}return}
 if(p.state=='scared'){p.wait-=dt;p.anim+=dt*6;if(p.wait<=0)p.state='walk';return}
 if(p.state=='crime')return crimeBehave(p,dt);
 if(p.state=='flee')return fleeBehave(p,dt);
 if(p.state=='waitcross'){p.anim=-1;p.cross.t+=dt;if(p.cross.ok()){p.state='cross';p.tx=p.cross.tx;p.ty=p.cross.ty}else if(p.cross.t>14){p.state='walk';p.dir+=Math.PI;p.tx=Math.floor(p.x/T)-Math.round(Math.cos(p.dir-Math.PI));p.ty=Math.floor(p.y/T)}return}
 const gx=(p.tx+.5)*T,gy=(p.ty+.5)*T,dx=gx-p.x,dy=gy-p.y,d=Math.hypot(dx,dy);const sp=p.spd*(p.state=='cross'?1.6:1);
 // dodge speeding car
 if(me.inCar&&Math.hypot(patrol.vx,patrol.vy)>60&&dist(p,patrol)<34&&!p.dodge){p.dodge=.5;const a=Math.atan2(p.y-patrol.y,p.x-patrol.x);p.x+=Math.cos(a)*6;p.y+=Math.sin(a)*6;if(R()<.3)floatTxt(p.x,p.y-20,pick(['WHOA!','HEY!','MY HIP!']),'#fff')}if(p.dodge){p.dodge-=dt;if(p.dodge<0)p.dodge=0}
 if(d<1.5){p.x=gx;p.y=gy;if(p.state=='cross')p.state='walk';if(R()<.03){p.state='idle';p.wait=rnd(1,4);return}pedNextTile(p)}
 else{p.x+=dx/d*sp*dt;p.y+=dy/d*sp*dt;p.dir=Math.atan2(dy,dx);p.anim+=dt*sp*.3}}
function crimeBehave(p,dt){p.ct+=dt;const c=CR[p.crime];p.anim=-1;
 if(p.crime=='jaywalk'){if(!p.jw){p.jw=nearestRoadPoint(p)}if(p.jw){const dx=p.jw.x-p.x,dy=p.jw.y-p.y,d=Math.hypot(dx,dy);if(d>2){p.x+=dx/d*14*dt;p.y+=dy/d*14*dt;p.dir=Math.atan2(dy,dx);p.anim+=dt*5}else if(R()<dt*.4){p.jw={x:p.x+rnd(-40,40),y:p.y+rnd(-40,40)};if(solidCity(p.jw.x,p.jw.y))p.jw=null}}}
 if(p.crime=='vandal'&&R()<dt*4)parts.push({x:p.x+rnd(-8,8),y:p.y-6+rnd(-5,5),vx:0,vy:0,c:pick(['#f0f','#0ff','#ff0','#0f0']),life:30,paint:1,s:2});
 if(p.crime=='litter'&&R()<dt*1.5)parts.push({x:p.x+rnd(-6,6),y:p.y+rnd(0,4),vx:0,vy:0,c:pick(['#fff','#c84','#aaa']),life:25,paint:1,s:2});
 if(p.crime=='noise'){p.anim+=dt*8;if(R()<dt*3)floatTxt(p.x+rnd(-8,8),p.y-22,pick(['♪','#','*']),pick(['#f6f','#6ff','#ff6']),.9)}
 if(p.crime=='shoplift'){p.anim+=dt*2}
 if(p.crime=='mug'&&!p.victim&&p.ct>.5){const v=peds.find(q=>q!=p&&!q.crime&&q.state=='walk'&&dist(q,p)<T*6);if(v){p.victim=v;v.state='scared';v.wait=8;floatTxt(v.x,v.y-22,'HELP! MUGGER!','#f55')}}
 if(p.victim&&p.ct>2){const d=dist(p,p.victim);if(d>12){p.x+=(p.victim.x-p.x)/d*30*dt;p.y+=(p.victim.y-p.y)/d*30*dt;p.anim+=dt*8}}
 const near=dist(p,me)<T*(me.inCar&&S.siren?10:5.5);if(near&&R()<(c.flee||0)*dt*3)startFlee(p);
 if(p.ct>75){p.crime=null;p.state='walk';repChange(-2);radio('DISPATCH: Suspect left the scene. Public is "mildly disappointed."','#f88')}}
function startFlee(p){p.state='flee';p.ft=0;floatTxt(p.x,p.y-22,pick(['RUN!','NOT TODAY!','YIKES!','*YEET*','COPS!']),'#fa0');SFX.whiff();if(p.victim){p.victim.state='walk';p.victim=null}}
function fleeBehave(p,dt){p.ft+=dt;const tired=clamp(1-p.ft/30,0.62,1);const spd=fleeSpd(p)*tired*(p.boostT>0?1.3:1);
 const ax=p.x-me.x,ay=p.y-me.y,d=Math.hypot(ax,ay)||1;let best=null,bs=-1e9;
 for(let i=0;i<8;i++){const a=i*TAU/8;const nx=p.x+Math.cos(a)*18,ny=p.y+Math.sin(a)*18;if(solidCity(nx,ny))continue;const s=(Math.cos(a)*ax+Math.sin(a)*ay)/d+(p.lastA!=null?Math.cos(a-p.lastA)*0.6:0)+R()*.2;if(s>bs){bs=s;best=a}}
 if(best!=null){p.lastA=best;moveCircle(p,Math.cos(best)*spd*dt,Math.sin(best)*spd*dt,4,solidCity);p.dir=best;p.anim+=dt*spd*.35}
 if(R()<dt*.7)parts.push({x:p.x,y:p.y,vx:rnd(-10,10),vy:-8,c:'#cbb',life:.4,s:2});
 if(d>T*32){if(p.crime!='warrant'){p.crime=null;p.state='walk';repChange(-3);radio('DISPATCH: You lost the suspect. Sergeant suggests "cardio".','#f88')}}}
function nearestRoadPoint(p){const tx=p.x/T|0,ty=p.y/T|0;for(let r=1;r<5;r++)for(const[dx,dy]of D4)if(tile(tx+dx*r,ty+dy*r)==0)return{x:(tx+dx*(r+1)+.5)*T,y:(ty+dy*(r+1)+.5)*T};return null}
function moveCircle(e,dx,dy,r,solid){let hit=0;const ok=(x,y)=>!solid(x-r,y-r)&&!solid(x+r,y-r)&&!solid(x-r,y+r)&&!solid(x+r,y+r);if(ok(e.x+dx,e.y))e.x+=dx;else hit|=1;if(ok(e.x,e.y+dy))e.y+=dy;else hit|=2;return hit}
// ---------- traffic
const DX=[1,0,-1,0],DY=[0,1,0,-1];
const CTYPES=['sedan','sedan','sedan','taxi','van','sport','truck'];
function laneCoord(dir,k){return k*PP+(dir==0?36:dir==2?12:dir==1?12:36)}
function mkCar(){for(let tries=0;tries<30;tries++){const dir=ri(0,3),k=ri(0,6),along=ri(0,6)*PP+rnd(70,PP-30);if(along>N*T-20)continue;
  const c={dir,ang:dir*Math.PI/2,v:0,maxv:rnd(40,58),type:pick(CTYPES),col:pick(CARCOL),inter:-1,turn:null,turnAt:0,blockT:0};if(c.type=='taxi')c.col='#eb2';
  if(dir%2==0){c.y=laneCoord(dir,k);c.x=along}else{c.x=laneCoord(dir,k);c.y=along}
  if(c.x>N*T-30||c.y>N*T-30)continue;if(cars.some(o=>Math.hypot(o.x-c.x,o.y-c.y)<40))continue;if(Math.abs(c.x-cam.x)<W/cam.z/2+30&&Math.abs(c.y-cam.y)<H/cam.z/2+30&&S.time>12*60+1)continue;return c}return null}
function entryDist(c){const d=c.dir;if(d==0){const f=c.x+11;return Math.ceil(f/PP)*PP-f}if(d==2){const f=c.x-11;return f-(Math.floor((f-48)/PP)*PP+48)}if(d==1){const f=c.y+11;return Math.ceil(f/PP)*PP-f}const f=c.y-11;return f-(Math.floor((f-48)/PP)*PP+48)}
function updCar(c,dt){if(c.stopped>0){c.stopped-=dt;return}if(c.busted){return}
 const flee=c.flee;let vt=flee?(me.inCar?105:80):c.maxv;
 const inter=(c.x%PP<48)&&(c.y%PP<48);const kx=Math.floor(c.x/PP),ky=Math.floor(c.y/PP),id=kx*10+ky;
 if(!inter){const ed=entryDist(c)-16;if(!flee&&ed>-4&&ed<34){const L=light(Math.floor((c.x+DX[c.dir]*40)/PP),Math.floor((c.y+DY[c.dir]*40)/PP));const st=c.dir%2==0?L.ew:L.ns;if(st=='r'||(st=='y'&&ed>10))vt=Math.min(vt,Math.max(0,(ed-1)*3))}}
 else if(c.inter!=id){c.inter=id;const opts=[];for(const nd of[c.dir,(c.dir+1)%4,(c.dir+3)%4]){if(nd==0&&kx>=6)continue;if(nd==2&&kx<=0)continue;if(nd==1&&ky>=6)continue;if(nd==3&&ky<=0)continue;opts.push(nd)}
  let nd=c.dir;if(opts.length){if(flee){opts.sort((a,b)=>{const sa=DX[a]*(c.x-me.x)+DY[a]*(c.y-me.y),sb=DX[b]*(c.x-me.x)+DY[b]*(c.y-me.y);return sb-sa+(R()-.5)*80});nd=opts[0]}else nd=R()<.55&&opts.includes(c.dir)?c.dir:pick(opts)}
  if(nd!=c.dir){c.turn=nd;c.turnAt=nd%2==0?laneCoord(nd,ky):laneCoord(nd,kx)}else c.turn=null}
 if(c.turn!=null){const passed=c.dir==0?c.x>=c.turnAt:c.dir==2?c.x<=c.turnAt:c.dir==1?c.y>=c.turnAt:c.y<=c.turnAt;if(passed){if(c.dir%2==0)c.x=c.turnAt;else c.y=c.turnAt;c.dir=c.turn;c.turn=null;if(c.dir%2==0)c.y=laneCoord(c.dir,ky);else c.x=laneCoord(c.dir,kx)}else vt=Math.min(vt,flee?70:30)}
 // queueing
 const fx=DX[c.dir],fy=DY[c.dir];let blockedByMe=false;
 if(!flee){const chk=(o,rng,lat,isMe)=>{const rx=o.x-c.x,ry=o.y-c.y,al=rx*fx+ry*fy,la=Math.abs(rx*fy-ry*fx);if(al>0&&al<rng&&la<lat){vt=Math.min(vt,Math.max(0,(al-rng+8)*3));if(isMe&&al<rng-4)blockedByMe=true}};
  for(const o of cars)if(o!=c)chk(o,30,9);chk(patrol,30,10,true);if(!me.inCar)chk(me,20,8,true);for(const p of peds)if(!p.inCar&&Math.abs(p.x-c.x)<30&&Math.abs(p.y-c.y)<30)chk(p,20,8)}
 else{for(const o of cars)if(o!=c&&!o.busted&&Math.hypot(o.x-c.x,o.y-c.y)<16){o.stopped=1.2;spark(o.x,o.y,6);if(R()<.05)SFX.crash()}}
 if(blockedByMe&&c.v<2){c.blockT+=dt;if(c.blockT>3){c.blockT=-rnd(2,5);if(Math.hypot(c.x-me.x,c.y-me.y)<200){SFX.honk();floatTxt(c.x,c.y-14,pick(['HONK!','MOVE IT!','BEEP BEEP']),'#fff')}}}else if(c.blockT>0)c.blockT=0;
 c.v+=clamp(vt-c.v,-220*dt,(flee?120:50)*dt);c.x+=fx*c.v*dt;c.y+=fy*c.v*dt;
 const ta=c.dir*Math.PI/2;c.ang+=angDiff(c.ang,ta)*Math.min(1,dt*8);
 if(flee&&R()<dt*8)parts.push({x:c.x-fx*12,y:c.y-fy*12,vx:rnd(-5,5),vy:rnd(-5,5),c:'#999',life:.6,s:3});
 // hits player on foot
 if(!me.inCar&&Math.hypot(c.x-me.x,c.y-me.y)<10&&c.v>15){hurt(flee?18:6);me.x+=fy*14;me.y-=fx*14;moveCircle(me,0,0,4,solidCity);floatTxt(me.x,me.y-22,'OOF!','#f55');c.v=0}}
function spark(x,y,n){for(let i=0;i<n;i++)parts.push({x,y,vx:rnd(-60,60),vy:rnd(-60,60),c:pick(['#ff0','#fa0','#fff']),life:rnd(.2,.5),s:1})}
// ---------- player car
function updPatrol(dt,iv,boost){const p=patrol;let hx=Math.cos(p.a),hy=Math.sin(p.a);let f=p.vx*hx+p.vy*hy,lat=-p.vx*hy+p.vy*hx;
 if(iv.m>.12){const ta=Math.atan2(iv.y,iv.x),d=angDiff(p.a,ta);
  if(Math.abs(d)>2.4&&f<25){f-=iv.m*120*dt;const d2=angDiff(p.a,ta+Math.PI);p.a+=clamp(d2*3,-2.4,2.4)*dt*Math.min(1,Math.abs(f)/25)}
  else{const thr=iv.m*(boost?280:180)*(SAVE.upg&&SAVE.upg.engine?1.2:1)*(Math.abs(d)>1.4?.35:1);f+=thr*dt;p.a+=clamp(d*4.5,-3.4,3.4)*dt*clamp(Math.abs(f)/40,.3,1)}}
 else f*=Math.pow(.25,dt);
 f*=Math.pow(boost?.7:.6,dt);f=clamp(f,-70,(boost?215:160)*(SAVE.upg&&SAVE.upg.engine?1.18:1));lat*=Math.pow(boost?.02:.002,dt);
 hx=Math.cos(p.a);hy=Math.sin(p.a);p.vx=hx*f-hy*lat;p.vy=hy*f+hx*lat;p.f=f;
 const pre={x:p.vx,y:p.vy};const hit=moveCircle(p,p.vx*dt,p.vy*dt,6,solidCity);
 if(hit){const imp=Math.abs(hit&1?pre.x:0)+Math.abs(hit&2?pre.y:0);if(hit&1)p.vx*=-.25;if(hit&2)p.vy*=-.25;if(imp>70&&S.crashT<=0){S.crashT=.4;SFX.crash();vib(50);S.shake=.35;spark(p.x+hx*10,p.y+hy*10,10);hurt(imp/30)}}
 if(boost&&Math.abs(f)>60&&R()<dt*20)parts.push({x:p.x-hx*12,y:p.y-hy*12,vx:-hx*30+rnd(-10,10),vy:-hy*30+rnd(-10,10),c:pick(['#fa0','#ff0','#888']),life:.35,s:2});
 for(const c of cars){const d=Math.hypot(c.x-p.x,c.y-p.y);if(d<15){const nx=(p.x-c.x)/(d||1),ny=(p.y-c.y)/(d||1);const rel=Math.hypot(p.vx-DX[c.dir]*c.v,p.vy-DY[c.dir]*c.v);
  moveCircle(p,nx*(15-d),ny*(15-d),6,solidCity);
  if(rel>45&&S.crashT<=0){S.crashT=.5;SFX.crash();vib(60);S.shake=.4;spark((p.x+c.x)/2,(p.y+c.y)/2,12);p.vx*=.35;p.vy*=.35;
   if(c.flee){c.hp=(c.hp||3)-1;floatTxt(c.x,c.y-14,c.hp>0?'CRUNCH! '+c.hp+' MORE':'DISABLED!','#fa0');if(c.hp<=0)bustCar(c)}
   else if(!c.busted){c.stopped=2;S.score-=15;floatTxt(c.x,c.y-14,'FENDER BENDER -15','#f88');if(R()<.4)floatTxt(c.x,c.y-24,pick(['MY INSURANCE!','SUE YOU!','UNBELIEVABLE']),'#fff')}}}}
 for(const pd of peds){if(pd.cuffed||pd.inCar||pd.down>0)continue;if(dist(pd,p)<9&&Math.hypot(p.vx,p.vy)>40){pd.down=2;pd.x+=p.vx*.1;pd.y+=p.vy*.1;moveCircle(pd,0,0,3,solidCity);SFX.hurt();vib(40);
  if(pd.crime&&pd.state=='flee'){floatTxt(pd.x,pd.y-20,'BUMPER TACKLE?!','#fa0');pd.down=3;repChange(-1)}else{repChange(-4);S.score-=40;floatTxt(pd.x,pd.y-20,'OW! -4 REP','#f55');if(S.complainT<=0){S.complainT=10;radio('DISPATCH: Complaint: "a cop hit me with a car." Please stop doing that.','#f88')}}}}}
function bustCar(c){c.busted=true;c.flee=false;c.v=0;SFX.fanfare();radio('YOU: "Vehicle disabled! Driver is bailing!"','#8cf');const th=mkPed(c.thiefLook);th.x=c.x+12;th.y=c.y;moveCircle(th,0,0,4,solidCity);th.crime='gta';th.name=c.thiefName;th.state='flee';th.down=2.2;th.ft=10;peds.push(th);crimes.forEach(k=>{if(k.car==c){k.car=null;k.ped=th}})}
function hurt(n){S.hp-=n;S.flash=.35;S.shake=Math.max(S.shake,.3);vib(30);SFX.hurt()}
function repChange(n){S.rep=clamp(S.rep+n,0,100)}
// ---------- crimes
function colName(c){return({'#c33':'red','#3a3':'green','#cc3':'yellow','#c6c':'purple','#3cc':'teal','#f93':'orange','#eee':'white','#555':'grey','#36c':'blue','#933':'maroon','#7a5':'olive','#f7a':'pink','#fa0':'orange','#468':'navy','#c22':'red','#25b':'blue','#eb2':'yellow','#2a5':'green','#ddd':'white','#93c':'purple','#f80':'orange','#333':'black','#7ad':'sky-blue','#a63':'brown','#5c5':'lime','#e5a':'pink'})[c]||'ugly'}
function where(o){const b=blockAt(o.x,o.y);return b?(b.type=='park'?'the park':b.type=='park2'?'the plaza':b.name.toLowerCase().replace('&',' & ')):'the edge of town'}
function spawnCrime(force){const hour=S.time/60;const pool=['shoplift','shoplift','jaywalk','jaywalk','litter','noise','vandal','mug','gta'];if(hour>17)pool.push('mug','vandal','gta');const ty=force||pick(pool);
 if(ty=='gta'){const c=pick(cars.filter(c=>!c.flee&&!c.busted&&Math.hypot(c.x-me.x,c.y-me.y)>T*8&&Math.hypot(c.x-me.x,c.y-me.y)<T*35));if(!c)return;c.flee=true;c.hp=3;c.thiefLook=randLook();c.thiefName=rname();crimes.push({t:'gta',car:c});
  radio(`DISPATCH: ${CR.gta.code}! Stolen ${colName(c.col)} ${c.type} near ${where(c)}. Ram it to stop it!`,'#f88');SFX.radio();return}
 const cand=peds.filter(p=>p.state=='walk'&&!p.crime&&dist(p,me)<T*32&&dist(p,me)>T*4);if(!cand.length)return;const p=pick(cand);p.crime=ty;p.state='crime';p.ct=0;
 crimes.push({t:ty,ped:p});radio(`DISPATCH: ${CR[ty].code} ${CR[ty].n} near ${where(p)}. Suspect: ${p.name.split(' ')[0]}, ${colName(p.L.shirt)} shirt.`,CR[ty].minor?'#cf8':'#ff8');SFX.radio()}
function radio(t,c){if(!S)return;if(S.lastMsg==t)return;S.lastMsg=t;S.msgs.unshift({t,c:c||'#7f7',life:10});if(S.msgs.length>3)S.msgs.pop()}
function floatTxt(x,y,t,c,life){floaters.push({x,y,t,c:c||'#ff0',life:life||1.6,scene:S.scene})}
function toast(t,ms){const e=$('toast');e.innerHTML=t;e.style.opacity=1;clearTimeout(toast.h);toast.h=setTimeout(()=>e.style.opacity=0,ms||1800)}
