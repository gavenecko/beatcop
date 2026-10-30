// ---------- MAP  0 road,1 sidewalk,2 building,3 grass,4 path,5 water
const PP=P*T;
const map=new Uint8Array(N*N);
const tile=(x,y)=>(x<0||y<0||x>=N||y>=N)?2:map[(y|0)*N+(x|0)];
for(let y=0;y<N;y++)for(let x=0;x<N;x++){const rx=x%P<3,ry=y%P<3;let t;if(rx||ry)t=0;else if(x%P==3||x%P==P-1||y%P==3||y%P==P-1)t=1;else t=2;map[y*N+x]=t}
const SPECIAL={'1,1':{type:'police',name:'POLICE',roof:'#3d4f8f',wall:'#27325e'},'3,3':{type:'donut',name:'DONUTS',roof:'#e88ab8',wall:'#a8507a'},'4,4':{type:'bank',name:'BANK',roof:'#c9c09a',wall:'#8a8060'},
 '2,4':{type:'jewel',name:'GLITTER&SONS',roof:'#7a5ca8',wall:'#4a3570'},'5,2':{type:'apart',name:'APARTMENTS',roof:'#9a6a4a',wall:'#5e3e2a'},'0,3':{type:'pawn',name:'PAWN SHOP',roof:'#6a7a5a',wall:'#45503a'},'4,1':{type:'park',name:'PARK'},'1,4':{type:'park2',name:'PLAZA'}};
const GENERIC=['LAUNDRY','PIZZA','ARCADE','TAXES','GYM','BOOKS','BODEGA','TATTOO','DINER','VIDEO','HAIR','KARATE','PETS','CLINIC','HOTEL','RECORDS','DELI','CAFE','BAR','THRIFT','GAMES','NAILS'];
const ROOFS=['#8a5a4a','#6e6e78','#5a6e8a','#8a7a5a','#5a7a6a','#9a8a7a','#7a5a7a','#6a5a4a','#4e5a6a','#a07050'];
const blocks={};{const gn=shuffle(GENERIC.slice());let gi=0;for(let by=0;by<BN;by++)for(let bx=0;bx<BN;bx++){const k=bx+','+by;const sp=SPECIAL[k];
 blocks[k]=sp?Object.assign({bx,by},sp):{bx,by,type:'shop',name:gn[gi++%gn.length],roof:pick(ROOFS),wall:null,split:R()<.55}}}
for(const k in blocks){const b=blocks[k];if(b.type=='park'||b.type=='park2'){for(let y=b.by*P+4;y<b.by*P+11;y++)for(let x=b.bx*P+4;x<b.bx*P+11;x++){const lx=x-b.bx*P,ly=y-b.by*P;let t=3;if(lx==7||ly==7)t=4;if(b.type=='park'&&lx>=8&&ly<=5&&lx<=9&&ly>=4)t=5;if(b.type=='park2')t=(lx==4||lx==10||ly==4||ly==10)?3:4;map[y*N+x]=t}}}
function doorOf(bx,by){return{x:(bx*P+7.5)*T,y:(by*P+11.5)*T-4}}
const blockAt=(x,y)=>blocks[Math.floor(x/PP)+','+Math.floor(y/PP)];
function findBlock(type){for(const k in blocks)if(blocks[k].type==type)return blocks[k]}
const STATION=doorOf(1,1),DONUT=doorOf(3,3);
const solidCity=(px,py)=>{const t=tile(px/T,py/T);return t==2||t==5};
const walkPed=t=>t==1||t==3||t==4;
const isCross=(tx,ty)=>tile(tx,ty)==0&&((tx%P<3&&(ty%P==3||ty%P==P-1))||(ty%P<3&&(tx%P==3||tx%P==P-1)));
// ---------- traffic lights (cycle 14s, green wave offsets)
const LCYC=14;let simT=0;
function light(kx,ky){const t=(simT+((kx*2.3+ky*3.7)%LCYC))%LCYC;return t<5.5?{ew:'g',ns:'r'}:t<7?{ew:'y',ns:'r'}:t<12.5?{ew:'r',ns:'g'}:{ew:'r',ns:'y'}}
// ---------- prerendered city
const LAMPS=[],PROPS=[];let CITY,WIN;
function noiseFill(g,x,y,w,h,base,cols,n){g.fillStyle=base;g.fillRect(x,y,w,h);for(let i=0;i<n;i++){g.fillStyle=pick(cols);g.fillRect(x+ri(0,w-1),y+ri(0,h-1),1,1)}}
function buildCity(){const[c,g]=mkCanvas(N*T,N*T);const[wc,wg]=mkCanvas(N*T,N*T);CITY=c;WIN=wc;
 for(let y=0;y<N;y++)for(let x=0;x<N;x++){const t=map[y*N+x],X=x*T,Y=y*T;
  if(t==0){noiseFill(g,X,Y,T,T,'#3b3d46',['#34363e','#43454f','#30323a'],10);}
  else if(t==1){g.fillStyle='#a8a8b2';g.fillRect(X,Y,T,T);g.fillStyle='#9898a3';g.fillRect(X,Y+7,T,1);g.fillRect(X+((y%2)?3:11),Y,1,7);g.fillRect(X+((y%2)?11:3),Y+8,1,8);
   if(R()<.15){g.fillStyle='#9e9ea8';g.fillRect(X+ri(1,12),Y+ri(1,12),2,1)}
   const curb=(dx,dy,rx,ry,rw,rh)=>{if(tile(x+dx,y+dy)==0){g.fillStyle='#d0d0d8';g.fillRect(X+rx,Y+ry,rw,rh)}};curb(-1,0,0,0,2,T);curb(1,0,T-2,0,2,T);curb(0,-1,0,0,T,2);curb(0,1,0,T-2,T,2)}
  else if(t==3){noiseFill(g,X,Y,T,T,'#4c9a3c',['#58aa46','#428a34','#62b450','#3e8030'],18)}
  else if(t==4){noiseFill(g,X,Y,T,T,'#c9b48a',['#bfa87c','#d4c098'],8)}
  else if(t==5){g.fillStyle='#3a7ac8';g.fillRect(X,Y,T,T);g.fillStyle='#6aa8e8';g.fillRect(X+ri(2,10),Y+ri(2,12),4,1)}}
 // road markings
 for(let k=0;k<=6;k++){const o=k*PP;
  for(let y=0;y<N*T;y+=PP)for(let s=48;s<PP-0;s+=1){} 
  for(let y=0;y<N*T;y++){const m=y%PP;if(m>=48+16&&m<PP-16){g.fillStyle='#e8c440';g.fillRect(o+22,y,1,1);g.fillRect(o+25,y,1,1)}}
  for(let x=0;x<N*T;x++){const m=x%PP;if(m>=48+16&&m<PP-16){g.fillStyle='#e8c440';g.fillRect(x,o+22,1,1);g.fillRect(x,o+25,1,1)}}}
 for(let ky=0;ky<=6;ky++)for(let kx=0;kx<=6;kx++){const ix=kx*PP,iy=ky*PP;g.fillStyle='#e6e6ea';
  const zebraV=(yy)=>{if(yy<0||yy>=N*T)return;for(let i=2;i<48;i+=5)g.fillRect(ix+i,yy+2,3,12)};const zebraH=(xx)=>{if(xx<0||xx>=N*T)return;for(let i=2;i<48;i+=5)g.fillRect(xx+2,iy+i,12,3)};
  zebraV(iy-16);zebraV(iy+48);zebraH(ix-16);zebraH(ix+48);
  if(iy-16>0)g.fillRect(ix+1,iy-18,23,2);if(iy+64<N*T)g.fillRect(ix+24,iy+64,23,2);if(ix-16>0)g.fillRect(ix-18,iy+24,2,23);if(ix+64<N*T)g.fillRect(ix+64,iy+1,2,23);
  g.fillStyle='#2e3038';for(let i=0;i<3;i++){const mx=ix+ri(6,40),my=iy+ri(6,40);g.fillRect(mx,my,4,4)}}
 // manholes & cracks
 for(let i=0;i<120;i++){const x=ri(0,N-1),y=ri(0,N-1);if(tile(x,y)!=0)continue;const X=x*T+ri(2,12),Y=y*T+ri(2,12);if(R()<.4){g.fillStyle='#2a2c33';g.fillRect(X,Y,5,5);g.fillStyle='#4a4c55';g.fillRect(X+1,Y+1,3,3)}else{g.fillStyle='#2c2e35';for(let j=0;j<5;j++)g.fillRect(X+j,Y+(j%2),1,1)}}
 // buildings
 for(const k in blocks){const b=blocks[k];if(b.type=='park'||b.type=='park2'){drawPark(g,b);continue}
  const x0=(b.bx*P+4)*T,y0=(b.by*P+4)*T;if(b.split){drawBuilding(g,wg,x0,y0,3*T,7*T,{roof:pick(ROOFS),name:pick(GENERIC)});drawBuilding(g,wg,x0+3*T,y0,4*T,7*T,b)}else drawBuilding(g,wg,x0,y0,7*T,7*T,b)}
 // street furniture
 for(let by=0;by<BN;by++)for(let bx=0;bx<BN;bx++){const sx=bx*PP,sy=by*PP;
  for(const[lx,ly]of[[3,3],[11,3],[3,11],[11,11],[7,3],[3,7],[11,7]]){const X=(sx/T+lx+.5)*T,Y=(sy/T+ly+.5)*T;LAMPS.push({x:X+(lx==3?-5:lx==11?5:0),y:Y+(ly==3?-5:ly==11?5:0)})}
  const spots=[];for(let i=4;i<=10;i++){spots.push([i,3],[3,i],[11,i])}shuffle(spots);
  for(let i=0;i<6;i++){const[lx,ly]=spots[i];if(lx==7&&ly==11)continue;const X=(bx*P+lx)*T,Y=(by*P+ly)*T;const kind=pick(['tree','tree','hydrant','bench','trash','mail','paper']);drawProp(g,kind,X,Y,lx,ly)}}
 for(const l of LAMPS){g.fillStyle='rgba(0,0,0,.3)';g.fillRect(l.x-1,l.y+1,4,3);g.fillStyle='#2a2a30';g.fillRect(l.x-2,l.y-2,4,4);g.fillStyle='#ffe9a0';g.fillRect(l.x-1,l.y-1,2,2)}}
function drawProp(g,kind,X,Y,lx,ly){const cx=X+8,cy=Y+8;
 if(kind=='tree'){g.fillStyle='#6a5030';g.fillRect(cx-4,cy-4,8,8);g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(cx+2,cy+3,7,0,TAU);g.fill();g.fillStyle='#2f7a2a';g.beginPath();g.arc(cx,cy,7,0,TAU);g.fill();g.fillStyle='#46a03a';g.beginPath();g.arc(cx-2,cy-2,4,0,TAU);g.fill();g.fillStyle='#6cc050';g.fillRect(cx-3,cy-4,2,2)}
 else if(kind=='hydrant'){g.fillStyle='#b01818';g.fillRect(cx-2,cy-2,5,5);g.fillStyle='#f03a3a';g.fillRect(cx-1,cy-1,3,3);g.fillStyle='#ddd';g.fillRect(cx,cy,1,1)}
 else if(kind=='bench'){const v=lx==3||lx==11;g.fillStyle='#6a4426';if(v)g.fillRect(cx-2,cy-6,5,12);else g.fillRect(cx-6,cy-2,12,5);g.fillStyle='#8a5a32';if(v)g.fillRect(cx-1,cy-6,1,12);else g.fillRect(cx-6,cy-1,12,1)}
 else if(kind=='trash'){g.fillStyle='#3a5a3a';g.fillRect(cx-3,cy-3,6,6);g.fillStyle='#5a7a5a';g.fillRect(cx-2,cy-2,4,1);g.fillStyle='#111';g.fillRect(cx-2,cy,4,1)}
 else if(kind=='mail'){g.fillStyle='#2848a8';g.fillRect(cx-3,cy-3,6,6);g.fillStyle='#4a6ad8';g.fillRect(cx-3,cy-3,6,2)}
 else{g.fillStyle='#c8a020';g.fillRect(cx-3,cy-3,6,6);g.fillStyle='#fff';g.fillRect(cx-2,cy-1,4,2)}}
function shade(hex,f){const n=parseInt(hex.slice(1),16);let r=n>>16,gg=(n>>8)&255,b=n&255;r=clamp(r*f|0,0,255);gg=clamp(gg*f|0,0,255);b=clamp(b*f|0,0,255);return'#'+((1<<24)|(r<<16)|(gg<<8)|b).toString(16).slice(1)}
function drawBuilding(g,wg,x0,y0,w,h,b){const roof=b.roof,wall=b.wall||shade(roof,.6),rh=h-T;
 // shadow
 g.fillStyle='rgba(0,0,0,.28)';g.fillRect(x0+w,y0+4,4,h);
 noiseFill(g,x0,y0,w,rh,roof,[shade(roof,.92),shade(roof,1.08)],w*rh/14|0);
 g.fillStyle=shade(roof,1.25);g.fillRect(x0,y0,w,2);g.fillRect(x0,y0,2,rh);g.fillStyle=shade(roof,.75);g.fillRect(x0+w-2,y0,2,rh);g.fillRect(x0,y0+rh-2,w,2);
 // rooftop items
 const items=b.type=='police'?['heli','ac','ac']:b.type=='donut'?['bigdonut']:b.type=='bank'?['vault','ac']:[pick(['ac','vent','tower','sky','dish']),pick(['ac','vent','sky']),'ac'];
 let ix=x0+8;for(const it of items){const iy=y0+ri(8,rh-26);
  if(it=='ac'){g.fillStyle='#8a8a92';g.fillRect(ix,iy,12,10);g.fillStyle='#5a5a62';g.fillRect(ix+2,iy+2,8,6);g.fillStyle='#aaa';g.fillRect(ix+3,iy+4,6,1);ix+=18}
  else if(it=='vent'){g.fillStyle='#707078';g.fillRect(ix,iy,6,6);g.fillStyle='#333';g.fillRect(ix+1,iy+1,4,4);ix+=12}
  else if(it=='tower'){g.fillStyle='#6a4a2a';g.beginPath();g.arc(ix+8,iy+8,8,0,TAU);g.fill();g.fillStyle='#8a6a3a';g.beginPath();g.arc(ix+8,iy+8,5,0,TAU);g.fill();ix+=22}
  else if(it=='sky'){g.fillStyle='#9ad0e8';g.fillRect(ix,iy,14,8);g.fillStyle='#d0f0ff';g.fillRect(ix+1,iy+1,5,2);ix+=20}
  else if(it=='dish'){g.fillStyle='#ddd';g.beginPath();g.arc(ix+5,iy+5,5,0,TAU);g.fill();g.fillStyle='#999';g.fillRect(ix+4,iy+4,2,2);ix+=14}
  else if(it=='heli'){const cx=x0+w/2,cy=y0+rh/2-4;g.fillStyle='#333';g.beginPath();g.arc(cx,cy,22,0,TAU);g.fill();g.fillStyle='#ee4';g.beginPath();g.arc(cx,cy,20,0,TAU);g.fill();g.fillStyle='#333';g.beginPath();g.arc(cx,cy,18,0,TAU);g.fill();ptext(g,'H',cx,cy-10,'#fff',4,'center',null);ix=x0+w-24}
  else if(it=='bigdonut'){const cx=x0+w/2,cy=y0+rh/2-2;g.fillStyle='#b07040';g.beginPath();g.arc(cx,cy,26,0,TAU);g.fill();g.fillStyle='#ff8ac8';g.beginPath();g.arc(cx,cy,23,0,TAU);g.fill();
   for(let i=0;i<40;i++){const a=R()*TAU,r=rnd(10,21);g.fillStyle=pick(['#fff','#ff0','#0cf','#6f6','#f44']);g.fillRect(cx+Math.cos(a)*r,cy+Math.sin(a)*r,2,1)}g.fillStyle=roof;g.beginPath();g.arc(cx,cy,8,0,TAU);g.fill();g.fillStyle='#000';g.beginPath();g.arc(cx,cy,7,0,TAU);g.fillStyle=shade(roof,.8);g.fill()}
  else if(it=='vault'){g.fillStyle='#ddc060';g.fillRect(x0+w/2-14,y0+20,28,28);ptext(g,'$',x0+w/2,y0+24,'#7a5a10',4,'center',null)}}
 // facade
 const fy=y0+rh;g.fillStyle=wall;g.fillRect(x0,fy,w,T);g.fillStyle=shade(wall,1.3);g.fillRect(x0,fy,w,1);g.fillStyle=shade(wall,.7);g.fillRect(x0,fy+T-2,w,2);
 const doorX=Math.floor((x0+w/2)/T)*T;const isShop=b.type!='apart';
 for(let x=x0+3;x<x0+w-6;x+=9){if(Math.abs(x+3-(doorX+8))<9)continue;g.fillStyle='#1c2638';g.fillRect(x,fy+4,6,7);g.fillStyle='#5a7aa0';g.fillRect(x,fy+4,6,2);g.fillStyle=shade(wall,1.2);g.fillRect(x-1,fy+11,8,1);if(R()<.65){wg.fillStyle=pick(['#ffd870','#ffe9a0','#ffc050','#fff0c0']);wg.fillRect(x,fy+4,6,7)}}
 g.fillStyle='#2a1a10';g.fillRect(doorX+4,fy+3,8,13);g.fillStyle='#6a4020';g.fillRect(doorX+5,fy+4,6,12);g.fillStyle='#ec4';g.fillRect(doorX+9,fy+10,1,1);wg.fillStyle='#ffcf70';wg.fillRect(doorX+4,fy+12,8,6);
 if(isShop&&w>=48){const ac=b.type=='police'?['#2850b0','#fff']:b.type=='donut'?['#ff8ac8','#fff']:pick([['#c02828','#fff'],['#208040','#fff'],['#2050a0','#fff'],['#d08020','#fff']]);for(let x=x0+2;x<x0+w-2;x+=4){g.fillStyle=ac[(x/4|0)%2];g.fillRect(x,fy-3,4,4)}g.fillStyle='rgba(0,0,0,.3)';g.fillRect(x0+2,fy+1,w-4,1)}
 // sign
 const name=b.name||'';const sw=name.length*4+5;const sx=x0+w/2-sw/2,sy=fy-13;g.fillStyle='#111';g.fillRect(sx-1,sy-1,sw+2,10);g.fillStyle=b.type=='police'?'#1a2a6a':b.type=='donut'?'#6a1a4a':'#2a2a3a';g.fillRect(sx,sy,sw,8);
 const sc=b.type=='police'?'#8cf':b.type=='donut'?'#fbe':b.type=='bank'?'#fd6':'#fff';ptext(g,name,x0+w/2,sy+1,sc,1,'center',null);wg.fillStyle=sc;wg.globalAlpha=.5;wg.fillRect(sx,sy,sw,8);wg.globalAlpha=1}
function drawPark(g,b){const x0=(b.bx*P+4)*T,y0=(b.by*P+4)*T;
 if(b.type=='park'){for(const[tx,ty]of[[1,1],[5,1],[1,5],[2,3],[5,5],[3,6],[6,3]]){drawProp(g,'tree',x0+tx*T-8+T/2,y0+ty*T-8+T/2)}drawProp(g,'bench',x0+3*T+T/2-8,y0+2*T,0,0);ptext(g,'PARK',x0+3.5*T,y0+6*T+4,'#fff',1)}
 else{const cx=x0+3.5*T,cy=y0+3.5*T;g.fillStyle='#888';g.beginPath();g.arc(cx,cy,18,0,TAU);g.fill();g.fillStyle='#3a7ac8';g.beginPath();g.arc(cx,cy,15,0,TAU);g.fill();g.fillStyle='#aaa';g.fillRect(cx-3,cy-3,6,6);g.fillStyle='#bfe';g.fillRect(cx-1,cy-6,2,4);
  for(const[tx,ty]of[[0,0],[6,0],[0,6],[6,6]])drawProp(g,'tree',x0+tx*T,y0+ty*T);ptext(g,'PLAZA',cx,y0+5*T+8,'#fff',1)}}
