// ---------- interiors
const INTERIORS={
 station:{name:'Police Station',grid:[
'##########################',
'#wwwwwww#cccccccc#ttttttt#',
'#wwwwwww#cccccccc#ttttttt#',
'#wwwwwww#cccccccc#ttttttt#',
'#wwwwwww#cccccccc#ttttttt#',
'###..#######..#######..###',
'#tttttttttttttttttttttttt#',
'#tttttttttttttttttttttttt#',
'#tttttttttttttttttttttttt#',
'#========mmmmmmmm#ttttttt#',
'#bbbbbbb=mmmmmmmm#ttttttt#',
'#bbbbbbb=mmmmmmmm.ttttttt#',
'#bbbbbbb=mmmmmmmm#ttttttt#',
'#bbbbbbb=mmmmmmmm#ttttttt#',
'#bbbbbbb=mmmmmmmm#ttttttt#',
'############DD############'],
 labels:[[4,0.2,'INTERROGATION'],[12.5,0.2,"SGT'S OFFICE"],[21.5,0.2,'BOOKING'],[4,8.2,'HOLDING'],[21.5,8.2,'BULLPEN']]},
 donut:{name:'Donut Shop',grid:[
'##############',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'#ffffffffffff#',
'######DD######']},
 bank:{name:'Bank',grid:['##############','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','#mmmmmmmmmmmm#','######DD######']},
 jewel:{name:'Glitter & Sons',grid:['##############','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','#cccccccccccc#','######DD######']},
 apart:{name:'Apartment 4B',grid:['##############','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','#wwwwwwwwwwww#','######DD######']},
 pawn:{name:'Pawn Shop',grid:['##############','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','#tttttttttttt#','######DD######']}};
// objects: x,y,w,h in tiles (top-left), kind, solid, act key
const IOBJ={
 station:[{k:'table',x:2.5,y:2,w:3,h:1.4,solid:1,act:'interrogate',label:'INTERROGATE'},{k:'chair',x:3.5,y:1.2,w:1,h:.8},{k:'chair',x:3.5,y:3.4,w:1,h:.8},{k:'mirror',x:1,y:.9,w:2.5,h:.4},{k:'lamp',x:4,y:2.4,w:.1,h:.1},
  {k:'desk',x:11,y:2,w:3,h:1.2,solid:1},{k:'board',x:9.3,y:.9,w:2.8,h:.6,act:'board',label:'EVIDENCE'},{k:'flag',x:15.4,y:1,w:.6,h:.8},{k:'plant',x:15.5,y:4,w:.8,h:.8,solid:1},{k:'file',x:9.2,y:3.8,w:.8,h:1,solid:1},
  {k:'chart',x:19,y:.9,w:2.5,h:.4},{k:'camera',x:20,y:3,w:1,h:1,solid:1},{k:'bookdesk',x:22,y:2,w:2.4,h:1.2,solid:1,act:'book',label:'BOOK'},
  {k:'bench',x:1.3,y:13.6,w:6,h:.8},{k:'toilet',x:6.6,y:10.2,w:.8,h:.8},
  {k:'counter',x:10.5,y:11,w:5,h:1,solid:1,act:'frontdesk',label:'TALK'},{k:'plant',x:9.2,y:14,w:.8,h:.8,solid:1},{k:'plant',x:15.9,y:14,w:.8,h:.8,solid:1},{k:'chairs',x:9.4,y:12.8,w:1,h:1},
  {k:'mydesk',x:19.5,y:11,w:2.6,h:1.3,solid:1,act:'paperwork',label:'PAPERWORK'},{k:'desk2',x:19.5,y:13.6,w:2.6,h:1.1,solid:1},{k:'coffee',x:24,y:9.2,w:.9,h:.9,solid:1,act:'coffee',label:'COFFEE'},
  {k:'donutbox',x:23,y:13.8,w:1.5,h:.8,solid:1,act:'evdonut',label:'EVIDENCE?'},{k:'file',x:24.1,y:11,w:.8,h:2,solid:1},{k:'vending',x:24.1,y:6.1,w:.9,h:1,solid:1,act:'vend',label:'VENDING'}],
 donut:[{k:'dcounter',x:1,y:2,w:10,h:1,solid:1,act:'buy',label:'ORDER'},{k:'dcase',x:2,y:1,w:3,h:.8},{k:'dcase',x:6,y:1,w:3,h:.8},{k:'fryer',x:11.2,y:1,w:1.6,h:1.6,solid:1},
  {k:'rtable',x:2,y:5,w:1.4,h:1.4,solid:1},{k:'rtable',x:6,y:5,w:1.4,h:1.4,solid:1},{k:'rtable',x:10,y:5,w:1.4,h:1.4,solid:1},{k:'neon',x:5,y:.1,w:4,h:.6}],
 bank:[{k:'teller',x:1,y:2,w:8,h:1,solid:1},{k:'vault',x:10,y:.6,w:3,h:2.2,solid:1},{k:'plant',x:1.2,y:7.8,w:.8,h:.8,solid:1},{k:'rope',x:3,y:5,w:6,h:.3}],
 jewel:[{k:'jcase',x:1.5,y:2,w:3,h:1.2,solid:1},{k:'jcase',x:6,y:2,w:3,h:1.2,solid:1},{k:'jcase',x:10,y:5,w:2.5,h:1.2,solid:1},{k:'jcase',x:2,y:6,w:3,h:1.2,solid:1},{k:'mirror2',x:11,y:.9,w:2,h:.5}],
 apart:[{k:'bed',x:1.2,y:1,w:2.4,h:3,solid:1},{k:'couch',x:6,y:4.5,w:3.5,h:1.2,solid:1},{k:'tv',x:6.5,y:1,w:2.5,h:.6,solid:1},{k:'dogbed',x:10.5,y:6.5,w:1.6,h:1.2},{k:'fridge',x:11.8,y:1,w:1,h:1.4,solid:1},{k:'rug',x:5,y:2.5,w:5,h:1.6}],
 pawn:[{k:'shelf',x:1.2,y:1,w:5,h:.9,solid:1},{k:'shelf',x:7.5,y:1,w:5,h:.9,solid:1},{k:'pcounter',x:8,y:5,w:4.5,h:1,solid:1},{k:'guitar',x:1.4,y:4,w:.6,h:1.6},{k:'chicken',x:4,y:6,w:.8,h:.6}]};
const FLOORS={w:['#8a5a32','#7a4c28'],c:['#7a2a3a','#6a2232'],t:['#c8c8d0','#b0b0bc'],b:['#6a6a70','#5e5e64'],m:['#e0dccc','#cfcab8'],f:['#ffd0e4','#fff0f6']};
const ICACHE={};
function interiorCanvas(key){if(ICACHE[key])return ICACHE[key];const I=INTERIORS[key],gw=I.grid[0].length,gh=I.grid.length;const[c,g]=mkCanvas(gw*T,gh*T);
 for(let y=0;y<gh;y++)for(let x=0;x<gw;x++){const ch=I.grid[y][x],X=x*T,Y=y*T;
  if(ch=='#'){g.fillStyle='#2a2a38';g.fillRect(X,Y,T,T);const below=y+1<gh&&I.grid[y+1][x]!='#'&&I.grid[y+1][x]!='=';if(below){g.fillStyle=key=='donut'?'#e070a8':key=='station'?'#5a6a8a':'#8a7a6a';g.fillRect(X,Y+6,T,10);g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X,Y+14,T,2);g.fillStyle='rgba(255,255,255,.15)';g.fillRect(X,Y+6,T,1)}else{g.fillStyle='#3a3a4c';g.fillRect(X+1,Y+1,T-2,T-2)}}
  else if(ch=='='){const fl=FLOORS.b;g.fillStyle=fl[0];g.fillRect(X,Y,T,T);g.fillStyle='#888';for(let i=1;i<T;i+=4){if(I.grid[y][x-1]=='='||I.grid[y][x+1]=='=')g.fillRect(X+i,Y+2,2,13);else g.fillRect(X+5,Y+i,6,2)}g.fillStyle='#aaa';g.fillRect(X,Y+2,T,2)}
  else if(ch=='D'){g.fillStyle='#5a3a1a';g.fillRect(X,Y,T,T);g.fillStyle='#a85';g.fillRect(X+1,Y+2,T-2,12);g.fillStyle='#c33';g.fillRect(X+2,Y+4,T-4,8)}
  else{const fl=FLOORS[ch]||FLOORS.t;const alt=ch=='w'?(x+(y>>1))%2:ch=='c'?0:(x+y)%2;g.fillStyle=fl[alt];g.fillRect(X,Y,T,T);if(ch=='w'){g.fillStyle='rgba(0,0,0,.12)';g.fillRect(X,Y+7,T,1);g.fillRect(X+((y*5)%T),Y,1,7)}if(ch=='c'&&R()<.3){g.fillStyle=fl[1];g.fillRect(X+ri(0,12),Y+ri(0,12),3,3)}if(ch=='m'){g.fillStyle='rgba(255,255,255,.25)';g.fillRect(X,Y,T,1);g.fillRect(X,Y,1,T)}}}
 for(const o of IOBJ[key]||[])drawIObj(g,o,key);
 for(const l of I.labels||[])ptext(g,l[2],l[0]*T,l[1]*T+1,'#fff',1,'center','#000');
 if(key!='station'&&key!='donut'){/* crime scene tape drawn dynamically */}
 ICACHE[key]=c;return c}
function drawIObj(g,o,key){const X=o.x*T,Y=o.y*T,w=o.w*T,h=o.h*T;const p=(x,y,ww,hh,c)=>{g.fillStyle=c;g.fillRect(X+x,Y+y,ww,hh)};const sh=()=>p(2,h,w,3,'rgba(0,0,0,.3)');
 switch(o.k){
 case'table':case'desk':case'desk2':case'mydesk':case'bookdesk':sh();p(0,0,w,h,'#6a4020');p(0,0,w,2,'#8a5a30');p(1,h-2,w-2,2,'#4a2a10');
  if(o.k=='mydesk'||o.k=='desk2'){for(let i=0;i<4;i++)p(3+i*2,-4-i*2,10,6,i%2?'#eee':'#ddd');p(w-14,2,10,7,'#222');p(w-13,3,8,4,'#4a8')}
  if(o.k=='desk'){p(4,3,8,5,'#eee');p(w-10,2,6,6,'#2a4');ptext(g,'SGT',X+w/2,Y+h-7,'#fd6',1)}if(o.k=='bookdesk'){p(4,2,10,6,'#ddd');p(18,3,6,4,'#333')}if(o.k=='table'){p(w/2-4,h/2-3,8,5,'#ccc')}break;
 case'chair':p(2,2,w-4,h-2,'#333');p(3,3,w-6,h-5,'#555');break;
 case'mirror':case'mirror2':p(0,0,w,h+2,'#223');p(1,1,w-2,h,'#7ac');p(3,1,4,h,'#bdf');break;
 case'lamp':break;
 case'board':p(0,0,w,h+6,'#6a4020');p(2,1,w-4,h+3,'#b08050');for(let i=0;i<5;i++)p(4+i*8,2+(i%2)*2,6,5,['#ffa','#fff','#aff','#faa','#ffa'][i]);p(5,4,30,1,'#c22');break;
 case'flag':p(0,0,2,h,'#555');p(2,0,8,6,'#2848b8');p(2,2,8,1,'#fff');break;
 case'plant':sh();p(2,6,w-4,h-6,'#8a4a2a');p(0,0,w,8,'#2a8a3a');p(3,-3,6,5,'#3aa04a');break;
 case'file':sh();p(0,0,w,h,'#6a6a78');for(let i=3;i<h;i+=8)p(2,i,w-4,1,'#3a3a44');break;
 case'chart':for(let i=0;i<5;i++){p(0,i*1.5-6,w,1,'#ccc')}ptext(g,"6'",X+w+2,Y-8,'#fff',1);break;
 case'camera':sh();p(4,4,8,8,'#222');p(6,6,4,4,'#68a');break;
 case'bench':p(0,0,w,h,'#5a4a3a');break;
 case'toilet':p(0,0,w,h,'#ddd');p(2,2,w-4,h-4,'#9ab');break;
 case'counter':case'dcounter':case'teller':case'pcounter':sh();p(0,0,w,h,o.k=='dcounter'?'#c05080':o.k=='teller'?'#a08040':'#5a4a6a');p(0,0,w,3,o.k=='dcounter'?'#ff9ac8':'#ccc');if(o.k=='teller')for(let i=8;i<w;i+=24)p(i,-6,1,8,'#bbb');if(o.k=='dcounter'){p(w-20,-4,8,6,'#333');p(w-19,-3,6,2,'#4f4')}break;
 case'chairs':p(0,0,T,T,'#3a4a6a');break;
 case'coffee':sh();p(0,0,w,h,'#333');p(3,3,8,5,'#a33');p(5,9,4,4,'#fff');break;
 case'vending':sh();p(0,0,w,h,'#a22');p(2,2,w-6,h-4,'#cdf');for(let i=0;i<3;i++)p(3,4+i*4,6,2,['#fd3','#3c3','#f6f'][i]);break;
 case'donutbox':sh();p(0,0,w,h,'#f8d0e0');p(2,2,w-4,h-4,'#fff');for(let i=0;i<3;i++){p(4+i*6,4,5,5,'#c97');p(5+i*6,5,3,3,'#f8c')}break;
 case'dcase':p(0,0,w,h,'#ccefff');for(let i=0;i<w-4;i+=6){p(2+i,3,5,5,'#c97');p(3+i,4,3,3,pick(['#f8c','#fff','#a62','#fd6']))}break;
 case'fryer':sh();p(0,0,w,h,'#999');p(3,3,w-6,h-6,'#c90');break;
 case'rtable':sh();g.fillStyle='#ddd';g.beginPath();g.arc(X+w/2,Y+h/2,w/2,0,TAU);g.fill();g.fillStyle='#fff';g.fillRect(X+w/2-2,Y+h/2-2,4,4);break;
 case'neon':ptext(g,'DONUTS',X+w/2,Y,'#ff6ac8',2,'center','#601040');break;
 case'vault':sh();p(0,0,w,h,'#777');g.fillStyle='#aaa';g.beginPath();g.arc(X+w/2,Y+h/2,h/2-2,0,TAU);g.fill();g.fillStyle='#555';g.fillRect(X+w/2-1,Y+4,2,h-8);g.fillRect(X+w/2-10,Y+h/2-1,20,2);break;
 case'rope':p(0,0,w,2,'#a22');for(let i=0;i<=w;i+=w/3)p(i-1,-3,3,6,'#cb4');break;
 case'jcase':sh();p(0,0,w,h,'#556');p(2,2,w-4,h-4,'#bdf');for(let i=4;i<w-4;i+=8)p(i,6,3,3,pick(['#f4f','#4ff','#ff4','#fff']));break;
 case'bed':sh();p(0,0,w,h,'#6a4020');p(2,2,w-4,h-4,'#ddd');p(2,2,w-4,10,'#fff');p(2,14,w-4,h-16,'#48a');break;
 case'couch':sh();p(0,0,w,h,'#7a3a3a');p(2,0,w-4,6,'#9a4a4a');break;
 case'tv':p(0,0,w,h+4,'#111');p(2,1,w-4,h+1,'#28c');break;
 case'dogbed':p(0,0,w,h,'#c8a');p(3,3,w-6,h-6,'#e8c');ptext(g,'FLUFF',X+w/2,Y-7,'#fff',1);break;
 case'fridge':sh();p(0,0,w,h,'#eee');p(w-3,4,1,6,'#999');break;
 case'rug':p(0,0,w,h,'#a64');p(3,3,w-6,h-6,'#c86');break;
 case'shelf':sh();p(0,0,w,h,'#6a4a2a');for(let i=2;i<w-4;i+=7)p(i,2,5,h-4,pick(['#c33','#3a3','#ec3','#38c','#999','#f8c']));break;
 case'guitar':p(2,0,2,h*.5,'#6a3a1a');g.fillStyle='#c84';g.beginPath();g.arc(X+3,Y+h*.7,5,0,TAU);g.fill();break;
 case'chicken':p(0,0,w,h,'#ec3');p(w-3,-2,3,3,'#ec3');p(w,-1,2,1,'#f80');break;}}
function iSolid(key,px,py){const I=INTERIORS[key];const tx=Math.floor(px/T),ty=Math.floor(py/T);const ch=(I.grid[ty]||'')[tx];if(ch===undefined||ch=='#'||ch=='=')return true;
 for(const o of IOBJ[key]||[])if(o.solid&&px>o.x*T&&px<(o.x+o.w)*T&&py>o.y*T&&py<(o.y+o.h)*T)return true;return false}
function iDoor(key){const I=INTERIORS[key];for(let y=0;y<I.grid.length;y++){const x=I.grid[y].indexOf('D');if(x>=0)return{x:(x+1)*T,y:(y-0.6)*T}}}
