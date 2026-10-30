// ---------- people sprites: canvas 12x22, frames: [dir 0 down,1 up,2 side] x [0 stand,1 stepA,2 stepB] + lying
const SKINS=['#ffdbb5','#f0c090','#c88a5a','#8a5a3a','#5e3a22','#ffd0c0'];
const HAIRC=['#1a1410','#5a3a1a','#a0602a','#e0c060','#c03020','#888','#ddd','#2a2a6a'];
const SHIRTS=['#c33','#3a3','#cc3','#c6c','#3cc','#f93','#eee','#555','#36c','#933','#7a5','#f7a','#fa0','#468'];
const PANTS=['#335','#224','#543','#444','#8a7a5a','#226','#633','#999'];
function randLook(){return{skin:pick(SKINS),hair:pick(HAIRC),hs:ri(0,6),shirt:pick(SHIRTS),pants:pick(PANTS),shoes:pick(['#222','#fff','#a52','#333']),build:ri(0,2),ht:R()<.12?0:R()<.8?1:2,glasses:R()<.2,bag:R()<.2?pick(['#a52','#c3c','#333']):null,beard:R()<.15,hat:R()<.15?pick(['#c22','#228','#ec3','#333']):null,old:R()<.1,stache:R()<.12,headph:R()<.07?pick(['#f33','#3cf','#fff']):null,hood:R()<.08?pick(['#555','#933','#246']):null}}
const COP_LOOK={skin:'#f0c090',hair:'#3a2a1a',hs:1,shirt:'#2c4cb0',pants:'#1a2550',shoes:'#111',build:1,ht:1,cop:true};
function drawPersonFrame(g,L,dir,fr,ox,oy){const p=(x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(ox+x,oy+y,w,h)};
 const legL=[3,4,5][L.ht],torso=[4,6,7][L.ht],bw=[4,6,7][L.build],hx=6-2.5|0;const feet=21;const legTop=feet-legL+1,tTop=legTop-torso,hTop=tTop-5;const tx=6-Math.ceil(bw/2);
 // shadow
 p(2,feet,8,1,'rgba(0,0,0,.3)');
 // legs
 const s1=fr==1?-1:0,s2=fr==2?-1:0;
 if(dir==2){p(5+(fr==1?1:fr==2?-1:0),legTop,2,legL+s1+s2+ (fr?0:0),L.pants);p(5+(fr==1?1:fr==2?-1:0),feet-1,3,1,L.shoes);if(fr){p(5+(fr==1?-1:1),legTop,2,legL-1,shade(L.pants,.8))}}
 else{p(tx+1,legTop,2,legL+s1,L.pants);p(tx+bw-3,legTop,2,legL+s2,L.pants);p(tx+1,feet-1+s1,2,1,L.shoes);p(tx+bw-3,feet-1+s2,2,1,L.shoes)}
 // torso
 p(tx,tTop,bw,torso,L.shirt);p(tx,tTop+torso-1,bw,1,shade(L.shirt,.75));
 if(L.cop){p(tx,tTop+torso-2,bw,1,'#111');if(dir==0){p(tx+1,tTop+1,1,1,'#fd3');p(tx+bw-2,tTop+1,1,1,'#ccc')}}
 if(L.apron)p(tx+1,tTop+1,bw-2,torso-1,L.apron);
 // arms
 const sw=fr==1?1:fr==2?-1:0;if(dir==2){p(5-sw,tTop+1,2,torso-1,shade(L.shirt,.85));p(5-sw,tTop+torso-1,2,1,L.skin)}else{p(tx-1,tTop+1+sw,1,torso-2,shade(L.shirt,.85));p(tx+bw,tTop+1-sw,1,torso-2,shade(L.shirt,.85));p(tx-1,tTop+torso-1+sw,1,1,L.skin);p(tx+bw,tTop+torso-1-sw,1,1,L.skin)}
 if(L.bag&&dir!=1)p(tx+bw,tTop+2,2,3,L.bag);
 // head
 const hx0=3;p(hx0,hTop,6,5,L.skin);
 if(dir==0){p(hx0+1,hTop+2,1,1,'#111');p(hx0+4,hTop+2,1,1,'#111');if(L.glasses){p(hx0,hTop+2,6,1,'#222');p(hx0+1,hTop+2,1,1,'#8cf');p(hx0+4,hTop+2,1,1,'#8cf')}if(L.beard)p(hx0+1,hTop+4,4,1,L.hair);if(L.stache)p(hx0+1,hTop+3,4,1,'#3a2a1a')}
 if(dir==2){p(hx0+4,hTop+2,1,1,'#111');p(hx0+6,hTop+3,1,1,L.skin);if(L.glasses)p(hx0+3,hTop+2,3,1,'#222')}
 // hair / hats
 const hc=L.old?'#ddd':L.hair;
 if(L.cop){p(hx0-1,hTop-1,8,2,'#1a2550');p(hx0,hTop-2,6,1,'#1a2550');if(dir==0){p(hx0-1,hTop+1,8,1,'#111');p(hx0+2,hTop-1,2,1,'#fd3')}}
 else if(L.hat){p(hx0,hTop-1,6,2,L.hat);if(dir!=1)p(dir==2?hx0+4:hx0,hTop+1,dir==2?4:6,1,shade(L.hat,.7))}
 else{const hs=L.hs;if(hs==1||hs==2||hs==4||hs==5||hs==6){p(hx0,hTop-1,6,2,hc);if(dir==1)p(hx0,hTop,6,4,hc);if(dir==2)p(hx0,hTop,2,3,hc)}
  if(hs==2){p(hx0-1,hTop,1,5,hc);p(hx0+6,hTop,1,5,hc);if(dir==1)p(hx0-1,hTop,8,6,hc)}
  if(hs==3)p(hx0+2,hTop-2,2,3,hc);if(hs==4)p(hx0+2,hTop-3,2,2,hc);if(hs==6){p(hx0-1,hTop-2,8,2,hc)}}
 if(L.hood){p(hx0-1,hTop-1,8,2,L.hood);p(hx0-1,hTop,1,5,L.hood);p(hx0+6,hTop,1,5,L.hood);if(dir==1)p(hx0-1,hTop-1,8,6,L.hood)}
 if(L.mask){p(hx0,hTop-1,6,6,'#151515');if(dir==0){p(hx0+1,hTop+2,4,1,L.skin);p(hx0+1,hTop+2,1,1,'#111');p(hx0+4,hTop+2,1,1,'#111')}if(dir==2)p(hx0+3,hTop+2,3,1,L.skin)}
 if(L.headph&&!L.cop){p(hx0-1,hTop+1,1,3,L.headph);p(hx0+6,hTop+1,1,3,L.headph);p(hx0,hTop-2,6,1,'#222')}
 if(L.old&&dir!=1)p(dir==2?10:tx+bw+1,tTop+1,1,feet-tTop-1,'#7a5a3a')}
const sprCache=new Map();
function personSprite(L){let s=sprCache.get(L);if(s)return s;const[c,g]=mkCanvas(12*10,22);for(let d=0;d<3;d++)for(let f=0;f<3;f++)drawPersonFrame(g,L,d,f,(d*3+f)*12,0);
 // lying frame (index 9): rotate stand-side
 const[t,tg]=mkCanvas(12,22);drawPersonFrame(tg,L,0,0,0,0);g.save();g.translate(9*12+6,14);g.rotate(Math.PI/2);g.drawImage(t,-11,-6);g.restore();sprCache.set(L,c);return c}
function drawPerson(g,L,x,y,dir,anim,state){const s=personSprite(L);let fi,flip=false;
 if(state=='down'){fi=9}else{let d=0;if(Math.abs(Math.cos(dir))>.7){d=2;flip=Math.cos(dir)<0}else d=Math.sin(dir)<0?1:0;const f=anim<0?0:[1,0,2,0][(anim|0)%4];fi=d*3+f}
 const bob=(state!='down'&&anim>=0&&((anim|0)%2==1))?-1:0;x=Math.round(x);y=Math.round(y);
 if(flip){g.save();g.translate(x,0);g.scale(-1,1);g.drawImage(s,fi*12,0,12,22,-6,y-20+bob,12,22);g.restore()}else g.drawImage(s,fi*12,0,12,22,x-6,y-20+bob,12,22)}
function portraitURL(L){const[c,g]=mkCanvas(12,22);drawPersonFrame(g,L,0,0,0,0);const[b,bg]=mkCanvas(48,64);bg.fillStyle='#9ab';bg.fillRect(0,0,48,64);for(let i=0;i<8;i++){bg.fillStyle='#8a9aaa';bg.fillRect(0,i*8,48,1)}bg.drawImage(c,0,0,12,22,0,-4,48,88);return b.toDataURL()}
// ---------- cars: drawn facing east, canvas 24x14
const CARCOL=['#c22','#25b','#eb2','#2a5','#ddd','#93c','#f80','#333','#7ad','#a63','#5c5','#e5a'];
function carSprite(type,col){const key=type+col;let s=sprCache.get(key);if(s)return s;const[c,g]=mkCanvas(26,16);const p=(x,y,w,h,cl)=>{g.fillStyle=cl;g.fillRect(x,y,w,h)};
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
