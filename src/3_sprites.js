// ---------- people sprites (v2.3): locked looks, fingerprint cache, detailed heads
// Canvas sheet: 14x24 frames × 10 (3 dirs × 3 frames + lying). Feet at y=23, origin at feet.
const SKINS=['#ffdbb5','#f0c090','#d4a574','#c88a5a','#8a5a3a','#5e3a22'];
const HAIRC=['#1a1410','#3a2210','#5a3a1a','#a0602a','#c8a050','#c03020','#6a6a70','#d0d0d4','#2a2a6a'];
const SHIRTS=['#c33','#3a3','#cc3','#c6c','#3cc','#f93','#eee','#555','#36c','#933','#7a5','#f7a','#fa0','#468','#264','#814'];
const PANTS=['#2a3350','#224','#543','#444','#8a7a5a','#1a2550','#633','#666','#3a4a3a'];
const FW=['hat','beanie','cap','hood','mask']; // mutually exclusive headwear

function randLook(arch){
  const L={skin:pick(SKINS),hair:pick(HAIRC),hs:ri(1,5),shirt:pick(SHIRTS),pants:pick(PANTS),
    shoes:pick(['#1a1a1a','#fff','#a52','#333','#c33']),build:ri(0,2),ht:R()<.12?0:R()<.82?1:2,
    glasses:R()<.18,bag:R()<.18?pick(['#a52','#c3c','#333','#246']):null,
    beard:R()<.12,stache:R()<.1,old:R()<.08,headph:null,hat:null,beanie:null,cap:null,hood:null,mask:null,vest:false,apron:null,cop:false,who:null};
  // one headwear at most
  const r=R();
  if(r<.12)L.hat=pick(['#c22','#228','#ec3','#333','#fff']);
  else if(r<.20)L.beanie=pick(['#c33','#264','#333','#e90','#36c']);
  else if(r<.26)L.cap=pick(['#c22','#228','#fff','#333']);
  else if(r<.32)L.hood=pick(['#555','#933','#246','#333']);
  if(R()<.06&&!L.hat&&!L.hood)L.headph=pick(['#f33','#3cf','#fff','#222']);
  if(arch==='worker'){L.vest=true;L.beanie=L.beanie||pick(['#c33','#264','#e90']);L.hat=null;L.hood=null;L.cap=null;L.shirt=pick(['#555','#666','#468']);}
  if(arch==='hoodie'){L.hood=pick(['#333','#555','#246','#622']);L.hat=null;L.beanie=null;L.cap=null;L.shirt=L.hood;}
  if(arch==='mugger'){L.hood='#333';L.mask=true;L.hat=null;L.beanie=null;L.cap=null;L.headph=null;L.shirt=pick(['#333','#222','#555']);}
  if(arch==='kid'){L.ht=0;L.build=0;L.beard=false;L.stache=false;L.old=false;L.hat=null;L.hood=null;L.mask=null;L.glasses=false;L.hs=ri(1,3);}
  if(L.old){L.hair=pick(['#aaa','#ccc','#ddd']);L.hs=ri(0,2);L.beard=R()<.4;}
  return L;
}
function lookKey(L){return[L.who||'',L.skin,L.hair,L.hs|0,L.shirt,L.pants,L.shoes,L.build|0,L.ht|0,
  L.glasses?1:0,L.bag||'',L.beard?1:0,L.stache?1:0,L.old?1:0,L.headph||'',L.hat||'',L.beanie||'',
  L.cap||'',L.hood||'',L.mask?1:0,L.vest?1:0,L.apron||'',L.cop?1:0].join('|')}
function mutateLook(target,chg){const base=target.L||target;const L=Object.assign({},base,chg);
  // enforce exclusive headwear — setting any one clears the others unless explicitly kept
  const set=FW.filter(k=>k in chg&&chg[k]);
  if(set.length){for(const k of FW)if(!(k in chg))L[k]=k==='mask'?false:null}
  if('mask' in chg)L.mask=!!chg.mask;
  if(target.L!==undefined)target.L=L;else Object.assign(target,L);
  if(target.L!==undefined)target.L._sk=null;else target._sk=null;return L}
// player: blue uniform, peaked cap, badge, fair skin, short brown hair
const COP_LOOK={skin:'#f0c090',hair:'#3a2a1a',hs:1,shirt:'#2a4aa0',pants:'#1a2550',shoes:'#111',build:1,ht:1,cop:true,who:'you',glasses:false,bag:null,beard:false,stache:false,old:false,hat:null,beanie:null,cap:null,hood:null,mask:false,vest:false,headph:null};
// Ramirez: darker skin, thicker build, no peak (sideways black hair), gold name bar vibe
const PARTNER_LOOK={skin:'#c88a5a',hair:'#1a1410',hs:2,shirt:'#2a4aa0',pants:'#1a2550',shoes:'#111',build:2,ht:1,cop:true,who:'ramirez',glasses:false,bag:null,beard:false,stache:true,old:false,hat:null,beanie:null,cap:null,hood:null,mask:false,vest:false,headph:null};
const COP2_LOOK={skin:'#c88a5a',hair:'#1a1410',hs:2,shirt:'#2a4aa0',pants:'#1a2550',shoes:'#111',build:2,ht:1,cop:true,who:'backup',stache:false,beard:false};
const SGT_LOOK={skin:'#f0c090',hair:'#888',hs:0,shirt:'#1a2a6a',pants:'#1a2550',shoes:'#111',build:2,ht:1,cop:true,who:'sgt',stache:true,beard:false,glasses:false};
const DEE_LOOK={skin:'#8a5a3a',hair:'#1a1410',hs:4,shirt:'#2a4aa0',pants:'#1a2550',shoes:'#111',build:1,ht:1,cop:false,who:'dee',glasses:true,stache:false};
const CLERK_LOOK={skin:'#ffdbb5',hair:'#a0602a',hs:2,shirt:'#5a6a9a',pants:'#333',shoes:'#111',build:0,ht:1,glasses:true,who:'clerk'};

// ---- pixel helpers ----
function drawPersonFrame(g,L,dir,fr,ox,oy){
  const p=(x,y,w,h,c)=>{if(w<=0||h<=0)return;g.fillStyle=c;g.fillRect(ox+x,oy+y,w,h)};
  const outline=(x,y,w,h)=>{p(x,y,w,1,'#0a0a12');p(x,y+h-1,w,1,'#0a0a12');p(x,y,1,h,'#0a0a12');p(x+w-1,y,1,h,'#0a0a12')};
  const legL=[3,4,5][L.ht],torso=[5,6,7][L.ht],bw=[5,6,7][L.build];
  const feet=23,legTop=feet-legL,tTop=legTop-torso,hTop=tTop-6; // head is 6px tall
  const tx=7-Math.ceil(bw/2); // body left
  const hx=4; // head left (6 wide → centered in 14)
  // shadow
  p(3,feet,8,1,'rgba(0,0,0,.35)');
  // ---- legs ----
  const s1=fr===1?-1:0,s2=fr===2?-1:0;
  if(dir===2){
    const lx=6+(fr===1?1:fr===2?-1:0);
    p(lx,legTop,3,legL+s1,L.pants);p(lx,feet-1,3,1,L.shoes);
    if(fr){p(lx+(fr===1?-2:2),legTop,2,legL-1,shade(L.pants,.78));p(lx+(fr===1?-2:2),feet-2,2,1,L.shoes)}
  }else{
    p(tx+1,legTop,2,legL+s1,L.pants);p(tx+bw-3,legTop,2,legL+s2,L.pants);
    p(tx+1,feet-1+s1,2,1,L.shoes);p(tx+bw-3,feet-1+s2,2,1,L.shoes);
  }
  // ---- torso ----
  p(tx,tTop,bw,torso,L.shirt);p(tx,tTop,bw,1,shade(L.shirt,1.18));p(tx,tTop+torso-1,bw,1,shade(L.shirt,.7));
  if(L.vest){p(tx,tTop,bw,torso-1,'#e07010');p(tx,tTop+2,bw,1,'#ff6');if(torso>5)p(tx,tTop+4,bw,1,'#ff6');p(tx+1,tTop+1,1,torso-3,'#222');p(tx+bw-2,tTop+1,1,torso-3,'#222')}
  if(L.apron)p(tx+1,tTop+1,bw-2,torso-1,L.apron);
  if(L.cop){p(tx,tTop+torso-2,bw,1,'#111'); // belt
    if(dir===0){p(tx+1,tTop+1,1,1,'#fd3');p(tx+bw-2,tTop+1,1,1,'#cfd8'); // badge + radio
      p(tx+Math.floor(bw/2)-1,tTop+3,2,1,'#1a1a2a')} // name plate
    if(L.who==='ramirez'&&dir===0)p(tx+1,tTop+3,bw-2,1,'#c9a227')}
  // arms
  const sw=fr===1?1:fr===2?-1:0;
  if(dir===2){p(5-sw,tTop+1,2,torso-2,shade(L.shirt,.88));p(5-sw,tTop+torso-2,2,1,L.skin)}
  else{p(tx-1,tTop+1+sw,2,torso-2,shade(L.shirt,.88));p(tx+bw-1,tTop+1-sw,2,torso-2,shade(L.shirt,.88));
    p(tx-1,tTop+torso-2+sw,2,1,L.skin);p(tx+bw-1,tTop+torso-2-sw,2,1,L.skin)}
  if(L.bag&&dir!==1)p(tx+bw,tTop+2,2,4,L.bag);
  // cane for elders
  if(L.old&&dir!==1)p(dir===2?11:tx+bw+1,tTop+1,1,feet-tTop-1,'#7a5a3a');

  // ---- HEAD (locked, exclusive headwear) ----
  drawHead(p,L,dir,hx,hTop,tx,bw);
}
function drawHead(p,L,dir,hx,hy,tx,bw){
  const skin=L.skin,hc=L.hair;
  // silhouette outline first (behind head)
  p(hx-1,hy,1,6,'#0a0a12');p(hx+6,hy,1,6,'#0a0a12');p(hx,hy-1,6,1,'#0a0a12');
  // head base 6×6
  p(hx,hy,6,6,skin);
  if(dir===2)p(hx+6,hy+2,1,2,shade(skin,.88)); // ear
  // face
  if(dir===0){
    p(hx+1,hy+2,1,1,'#1a1020');p(hx+4,hy+2,1,1,'#1a1020');
    p(hx+2,hy+3,1,1,shade(skin,.78)); // nose
    p(hx+2,hy+4,2,1,shade(skin,.9)); // mouth hint
    if(L.glasses){p(hx,hy+2,2,1,'#222');p(hx+4,hy+2,2,1,'#222');p(hx+1,hy+2,1,1,'#8cf');p(hx+4,hy+2,1,1,'#8cf');p(hx+2,hy+2,2,1,'#222')}
    if(L.stache)p(hx+1,hy+4,4,1,shade(hc,.65));
    if(L.beard){p(hx+1,hy+5,4,1,hc);p(hx,hy+4,1,2,hc);p(hx+5,hy+4,1,2,hc)}
  }else if(dir===2){
    p(hx+4,hy+2,1,1,'#1a1020');
    p(hx+5,hy+3,1,1,shade(skin,.78));
    if(L.glasses){p(hx+3,hy+2,3,1,'#222');p(hx+4,hy+2,1,1,'#8cf')}
    if(L.stache)p(hx+3,hy+4,3,1,shade(hc,.65));
    if(L.beard)p(hx+2,hy+5,4,1,hc);
  }
  // headwear — exclusive
  if(L.mask){
    p(hx,hy+1,6,5,'#151515');
    if(dir===0){p(hx+1,hy+2,1,1,'#1a1020');p(hx+4,hy+2,1,1,'#1a1020');p(hx+2,hy+4,2,1,'#333')}
    else if(dir===2){p(hx+4,hy+2,1,1,'#1a1020');p(hx+3,hy+1,3,1,skin)}
    if(L.hood){p(hx-1,hy-1,8,2,L.hood);p(hx-1,hy,1,6,L.hood);p(hx+6,hy,1,6,L.hood);if(dir===1)p(hx-1,hy-1,8,8,L.hood)}
    else{p(hx,hy-1,6,1,'#151515')}
  }else if(L.cop&&L.who==='ramirez'){
    // Ramirez: flat black patrol cap (not peaked) + thick stache already drawn
    p(hx-1,hy-1,8,2,'#1a1a22');p(hx,hy-2,6,1,'#1a1a22');
    if(dir===0){p(hx+2,hy-1,2,1,'#c9a227');p(hx,hy+1,1,1,hc);p(hx+5,hy+1,1,1,hc)}
    else if(dir===2){p(hx+4,hy+1,3,1,'#0a0a12');p(hx+3,hy-1,1,1,'#c9a227')}
    else p(hx-1,hy-1,8,3,'#1a1a22');
  }else if(L.cop){
    // player / backup / sgt: peaked cap
    p(hx,hy-1,6,2,'#1a2550');p(hx,hy-2,6,1,'#1a2550');
    if(dir===0){p(hx-1,hy+1,8,1,'#0a1020');p(hx+2,hy-1,2,1,'#fd3');p(hx,hy+1,1,1,hc);p(hx+5,hy+1,1,1,hc)}
    else if(dir===2){p(hx+3,hy+1,5,1,'#0a1020');p(hx+2,hy-1,1,1,'#fd3');p(hx,hy,2,2,hc)}
    else{p(hx,hy-2,6,4,'#1a2550')}
  }else if(L.hood){
    p(hx-1,hy-1,8,2,L.hood);p(hx-1,hy,1,6,L.hood);p(hx+6,hy,1,6,L.hood);
    if(dir===1)p(hx-1,hy-1,8,8,L.hood);
    if(dir===0){p(hx,hy,6,1,shade(L.hood,.8))}
  }else if(L.hat){
    p(hx,hy-1,6,2,L.hat);p(hx,hy-2,6,1,L.hat);
    if(dir===0)p(hx-1,hy+1,8,1,shade(L.hat,.7));
    else if(dir===2)p(hx+3,hy+1,5,1,shade(L.hat,.7));
    if(dir===0){p(hx,hy+1,1,1,hc);p(hx+5,hy+1,1,1,hc)}
  }else if(L.beanie){
    p(hx,hy-2,6,3,L.beanie);p(hx-1,hy-1,1,2,L.beanie);p(hx+6,hy-1,1,2,L.beanie);
    p(hx,hy+1,6,1,shade(L.beanie,.72));
    if(dir===1)p(hx,hy-2,6,5,L.beanie);
  }else if(L.cap){
    p(hx,hy-1,6,2,L.cap);p(hx,hy-2,6,1,L.cap);
    if(dir===0)p(hx-1,hy+1,8,1,shade(L.cap,.7));
    else if(dir===2)p(hx+4,hy+1,4,1,shade(L.cap,.7));
    else p(hx,hy-1,6,3,L.cap);
  }else{
    const hs=L.hs|0;
    if(hs===1){p(hx,hy-1,6,2,hc);if(dir===1)p(hx,hy,6,4,hc);if(dir===2)p(hx,hy,2,3,hc)}
    else if(hs===2){p(hx,hy-1,6,2,hc);p(hx-1,hy,1,4,hc);p(hx+6,hy,1,4,hc);if(dir===1)p(hx-1,hy-1,8,6,hc);if(dir===2)p(hx,hy,2,4,hc)}
    else if(hs===3){p(hx,hy-1,6,2,hc);p(hx+2,hy-3,2,2,hc);if(dir===1)p(hx,hy,6,3,hc)}
    else if(hs===4){p(hx,hy-1,6,2,hc);p(hx+1,hy-3,4,2,hc);if(dir===1)p(hx,hy,6,4,hc);if(dir===2)p(hx,hy,2,3,hc)}
    else if(hs>=5){p(hx,hy-1,6,2,hc);p(hx-1,hy,1,5,hc);p(hx+6,hy,1,5,hc);if(dir===1)p(hx-1,hy-1,8,7,hc);if(dir===2){p(hx,hy,2,4,hc);p(hx-1,hy+2,1,4,hc)}if(dir===0){p(hx,hy+4,1,2,hc);p(hx+5,hy+4,1,2,hc)}}
  }
  if(L.headph&&!L.cop&&!L.mask){p(hx-1,hy+1,1,3,L.headph);p(hx+6,hy+1,1,3,L.headph);p(hx,hy-1,6,1,'#222')}
}

const sprCache=new Map();
function personSprite(L){
  const key=lookKey(L);let s=sprCache.get(key);if(s){L._sk=key;return s}
  const FW_=14,FH=24;
  const[c,g]=mkCanvas(FW_*10,FH);
  for(let d=0;d<3;d++)for(let f=0;f<3;f++)drawPersonFrame(g,L,d,f,(d*3+f)*FW_,0);
  // lying frame (index 9)
  const[t,tg]=mkCanvas(FW_,FH);drawPersonFrame(tg,L,0,0,0,0);
  g.save();g.translate(9*FW_+7,14);g.rotate(Math.PI/2);g.drawImage(t,-12,-7);g.restore();
  sprCache.set(key,c);L._sk=key;return c;
}
function drawPerson(g,L,x,y,dir,anim,state){
  if(L._sk&&L._sk!==lookKey(L))L._sk=null; // look mutated in place → rebuild sheet
  const s=personSprite(L);const FW_=14,FH=24;let fi,flip=false;
  if(state==='down'){fi=9}
  else{let d=0;if(Math.abs(Math.cos(dir))>.7){d=2;flip=Math.cos(dir)<0}else d=Math.sin(dir)<0?1:0;
    const f=anim<0?0:[1,0,2,0][(anim|0)%4];fi=d*3+f}
  // whole-sprite bob keeps head locked to body (no independent head jitter)
  const bob=(state!=='down'&&anim>=0&&((anim|0)%2===1))?-1:0;
  x=Math.round(x);y=Math.round(y);
  if(flip){g.save();g.translate(x,0);g.scale(-1,1);g.drawImage(s,fi*FW_,0,FW_,FH,-7,y-22+bob,FW_,FH);g.restore()}
  else g.drawImage(s,fi*FW_,0,FW_,FH,x-7,y-22+bob,FW_,FH);
}
function portraitURL(L){
  const[c,g]=mkCanvas(14,24);drawPersonFrame(g,L,0,0,0,0);
  const[b,bg]=mkCanvas(48,64);bg.fillStyle='#7a8aaa';bg.fillRect(0,0,48,64);
  for(let i=0;i<8;i++){bg.fillStyle='#6a7a9a';bg.fillRect(0,i*8,48,1)}
  bg.imageSmoothingEnabled=false;bg.drawImage(c,0,0,14,24,0,-2,48,68);return b.toDataURL();
}
// ---------- cars: drawn facing east, canvas 24x14
const CARCOL=['#c22','#25b','#eb2','#2a5','#ddd','#93c','#f80','#333','#7ad','#a63','#5c5','#e5a'];
function carSprite(type,col){const key='car:'+type+col;let s=sprCache.get(key);if(s)return s;const[c,g]=mkCanvas(26,16);const p=(x,y,w,h,cl)=>{g.fillStyle=cl;g.fillRect(x,y,w,h)};
 const L=type=='van'||type=='truck'?24:type=='sport'?20:22,Wd=type=='van'||type=='truck'?12:10,ox=(26-L)/2|0,oy=(16-Wd)/2|0;
 p(ox+1,oy+Wd,L-1,2,'rgba(0,0,0,.35)');
 p(ox+2,oy-1,4,1,'#111');p(ox+L-6,oy-1,4,1,'#111');p(ox+2,oy+Wd,4,1,'#111');p(ox+L-6,oy+Wd,4,1,'#111');
 p(ox,oy,L,Wd,col);p(ox,oy,L,1,shade(col,1.3));p(ox,oy+Wd-1,L,1,shade(col,.65));
 if(type=='police'){p(ox,oy,L,Wd,'#f4f4f4');p(ox,oy,6,Wd,'#18182a');p(ox+L-5,oy,5,Wd,'#18182a');p(ox+6,oy+Wd/2-1,10,2,'#2848b8')}
 if(type=='taxi'){p(ox+9,oy+Wd/2-2,4,4,'#222');p(ox+10,oy+Wd/2-1,2,2,'#ff8')}
 if(type=='truck'){p(ox,oy,9,Wd,shade(col,.85));p(ox+10,oy+1,L-11,Wd-2,'#8a6a40');p(ox+10,oy+3,L-11,1,'#6a4a20')}
 else{const wsx=type=='van'?ox+L-8:ox+L-9;p(wsx,oy+1,3,Wd-2,'#9cd8f0');p(wsx+1,oy+2,1,2,'#e0f8ff');p(ox+3,oy+1,2,Wd-2,'#6a9ab8');if(type!='van')p(ox+6,oy+1,wsx-ox-6,Wd-2,shade(col,1.1))}
 if(type=='sport'){p(ox+8,oy+Wd/2,6,1,'#111')}
 p(ox+L-1,oy+1,1,2,'#ffe');p(ox+L-1,oy+Wd-3,1,2,'#ffe');p(ox,oy+1,1,2,'#c00');p(ox,oy+Wd-3,1,2,'#c00');
 sprCache.set(key,c);return c}
function drawCarSpr(g,c,type,col,ang,extra){g.save();g.translate(Math.round(c.x),Math.round(c.y));g.rotate(ang);g.drawImage(carSprite(type,col),-13,-8);
 if(type=='police'){const on=(performance.now()/130|0)%2;const sir=extra&&extra.siren;g.fillStyle=sir?(on?'#f22':'#511'):'#622';g.fillRect(-1,-4,2,4);g.fillStyle=sir?(on?'#226':'#33f'):'#226';g.fillRect(-1,0,2,4);if(extra&&extra.passenger){g.fillStyle='#000';g.fillRect(-6,-2,3,4)}}
 if(extra&&extra.busted){g.fillStyle='#444';g.fillRect(-6,-3,4,3);g.fillRect(3,1,3,2)}
 g.restore()}
