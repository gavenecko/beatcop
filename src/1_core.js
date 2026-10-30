"use strict";
const VERSION='2.1.0';
const cv=document.getElementById('c'),ctx=cv.getContext('2d');
const T=16,P=12,N=75,BN=6,TAU=Math.PI*2;
let W=1,H=1,DPR=1,Z=3;
const R=Math.random,rnd=(a,b)=>a+R()*(b-a),ri=(a,b)=>Math.floor(rnd(a,b+1)),pick=a=>a[Math.floor(R()*a.length)];
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y),clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const angDiff=(a,b)=>{let d=b-a;while(d>Math.PI)d-=TAU;while(d<-Math.PI)d+=TAU;return d};
const $=id=>document.getElementById(id);
function mkCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.imageSmoothingEnabled=false;return[c,g]}
// ---------- 3x5 pixel font
const FONT={};(function(){const d={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','!':'010010010000010','?':'110001010000010','.':'000000000000010',',':'000000000010100',"'":'010010000000000','"':'101101000000000','-':'000000111000000','+':'000010111010000',':':'000010000010000','/':'001001010100100','$':'011110010011110','*':'101010101000000','(':'010100100100010',')':'010001001001010','#':'101111101111101','%':'101001010100101','&':'010101010101011',' ':'000000000000000','>':'100010001010100','<':'001010100010001','=':'000111000111000','_':'000000000000111'};for(const k in d)FONT[k]=d[k]})();
const textCache=new Map();
function textCanvas(s,col,shadow){const key=s+'|'+col+'|'+shadow;let c=textCache.get(key);if(c)return c;if(textCache.size>400)textCache.clear();
 s=String(s).toUpperCase();const w=s.length*4+1,h=7;const[cc,g]=mkCanvas(w,h);
 const draw=(ox,oy,cl)=>{g.fillStyle=cl;for(let i=0;i<s.length;i++){const gl=FONT[s[i]]||FONT['?'];for(let b=0;b<15;b++)if(gl[b]=='1')g.fillRect(ox+i*4+b%3,oy+(b/3|0),1,1)}};
 if(shadow)draw(1,1,shadow);draw(0,0,col);textCache.set(key,cc);return cc}
function ptext(g,s,x,y,col='#fff',sc=1,align='center',shadow='#000'){const c=textCanvas(s,col,shadow);const w=c.width*sc;const ox=align=='center'?x-w/2:align=='right'?x-w:x;g.drawImage(c,Math.round(ox),Math.round(y),w,c.height*sc)}
// ---------- save
const SAVE_KEY='beatcop_save_v2';
let SAVE={career:0,shifts:0,best:0,cases:0,arrests:0,muted:false,music:true,vib:true,caseIdx:0};
try{Object.assign(SAVE,JSON.parse(localStorage.getItem(SAVE_KEY)||'{}'))}catch(e){}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE))}catch(e){}}
const RANKS=[[0,'Cadet'],[800,'Patrol Officer'],[2500,'Senior Officer'],[5000,'Corporal'],[9000,'Sergeant'],[15000,'Detective'],[24000,'Lieutenant'],[36000,'Captain'],[55000,'Commissioner']];
function rankOf(x){let r=RANKS[0][1];for(const k of RANKS)if(x>=k[0])r=k[1];return r}
function nextRank(x){for(const k of RANKS)if(x<k[0])return k;return null}
// ---------- haptics
function vib(p){if(SAVE.vib&&navigator.vibrate)try{navigator.vibrate(p)}catch(e){}}
// ---------- audio
const AU={ctx:null,sfx:null,mus:null,master:null,nb:null,siren:null,step:0,next:0,intense:0};
function audioInit(){if(AU.ctx){if(AU.ctx.state!='running')AU.ctx.resume();return}
 const C=window.AudioContext||window.webkitAudioContext;if(!C)return;try{AU.ctx=new C()}catch(e){return}
 const a=AU.ctx;AU.master=a.createGain();AU.master.gain.value=SAVE.muted?0:0.7;AU.master.connect(a.destination);
 AU.sfx=a.createGain();AU.sfx.gain.value=0.8;AU.sfx.connect(AU.master);AU.mus=a.createGain();AU.mus.gain.value=SAVE.music?0.22:0;AU.mus.connect(AU.master);
 const len=a.sampleRate;AU.nb=a.createBuffer(1,len,a.sampleRate);const d=AU.nb.getChannelData(0);for(let i=0;i<len;i++)d[i]=R()*2-1;
 AU.next=a.currentTime+0.1;setInterval(musicTick,40)}
function setMuted(m){SAVE.muted=m;persist();if(AU.master)AU.master.gain.setTargetAtTime(m?0:0.7,AU.ctx.currentTime,.05)}
function tone(f,d,type='square',v=.15,f2=0,delay=0,dest){if(!AU.ctx)return;const a=AU.ctx,t=a.currentTime+delay;const o=a.createOscillator(),g=a.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);
 g.gain.setValueAtTime(0.0001,t);g.gain.linearRampToValueAtTime(v,t+0.005);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(dest||AU.sfx);o.start(t);o.stop(t+d+.03)}
function noise(d,v=.3,fc=1200,delay=0,ft='lowpass',dest){if(!AU.ctx)return;const a=AU.ctx,t=a.currentTime+delay;const s=a.createBufferSource();s.buffer=AU.nb;const f=a.createBiquadFilter();f.type=ft;f.frequency.value=fc;const g=a.createGain();
 g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);s.connect(f);f.connect(g);g.connect(dest||AU.sfx);s.start(t,R()*0.5);s.stop(t+d+.03)}
const SFX={
 tackle(){noise(.18,.6,500);tone(140,.18,'sine',.5,45)},
 whiff(){noise(.12,.2,2500,0,'bandpass')},
 cuff(){tone(2200,.04,'square',.12);tone(1600,.05,'square',.12,0,.06);tone(2600,.06,'square',.1,0,.13)},
 donut(){[523,659,784,1046].forEach((f,i)=>tone(f,.09,'square',.12,0,i*.06))},
 blip(){tone(1320,.04,'square',.07)},
 select(){tone(880,.03,'square',.07)},
 radio(){noise(.12,.15,1800,0,'bandpass');tone(1400,.05,'square',.06,0,.12);tone(1000,.05,'square',.06,0,.18)},
 crash(){noise(.45,.7,350);tone(90,.3,'sawtooth',.25,40)},
 stamp(){noise(.08,.6,300);tone(70,.12,'sine',.5,40)},
 ticket(){tone(660,.05,'square',.1);tone(990,.08,'square',.1,0,.06)},
 error(){tone(200,.25,'sawtooth',.15,90)},
 success(){[392,523,659,784,1046].forEach((f,i)=>tone(f,.12,'square',.12,0,i*.07))},
 fanfare(){[523,523,523,659,784,659,784,1046].forEach((f,i)=>tone(f,.14,'square',.13,0,i*.1))},
 honk(){tone(380,.22,'square',.08);tone(470,.22,'square',.08)},
 door(){tone(300,.08,'triangle',.2,500)},
 step(){noise(.03,.05,800)},
 hurt(){tone(300,.2,'square',.15,100);noise(.1,.3,800)},
 type(){tone(1800+R()*400,.015,'square',.03)}};
function sirenUpdate(on){if(!AU.ctx)return;const a=AU.ctx;
 if(on&&!AU.siren){const o=a.createOscillator(),g=a.createGain(),f=a.createBiquadFilter();o.type='sawtooth';f.type='lowpass';f.frequency.value=2200;g.gain.value=0;o.connect(f);f.connect(g);g.connect(AU.sfx);o.start();AU.siren={o,g}}
 if(AU.siren){const t=a.currentTime;AU.siren.g.gain.setTargetAtTime(on?0.07:0,t,.05);if(on){const ph=(t*0.9)%1;AU.siren.o.frequency.setTargetAtTime(ph<.5?650+ph*2*500:1150-(ph-.5)*2*500,t,.03)}}}
// chiptune: Am - F - C - G with a cop-show groove
const SONG={bass:[45,45,57,45,41,41,53,41,48,48,60,48,43,43,55,47],lead:[69,0,72,0,76,74,72,0,65,0,69,72,0,74,72,69,67,0,72,0,76,0,79,77,71,74,0,71,67,0,69,0]};
const mtof=m=>440*Math.pow(2,(m-69)/12);
function musicTick(){if(!AU.ctx||AU.ctx.state!='running')return;const a=AU.ctx;const bpm=AU.intense?150:112,s8=60/bpm/2;
 if(AU.next<a.currentTime-1)AU.next=a.currentTime+.05;
 while(AU.next<a.currentTime+0.25){const st=AU.step,t=AU.next-a.currentTime;const bar=(st>>3)%4;
  const bn=SONG.bass[bar*4+((st>>1)&3)];if(st%2==0||AU.intense)tone(mtof(bn-12+(st%4==2?12:0)),s8*.9,'triangle',.5,0,t,AU.mus);
  const ln=SONG.lead[st%32];if(ln&&(st%64<32||AU.intense))tone(mtof(ln),s8*.8,'square',.13,0,t,AU.mus);
  if(st%4==2)noise(.04,.25,7000,t,'highpass',AU.mus);if(st%8==0)noise(.12,.5,180,t,'lowpass',AU.mus);if(AU.intense&&st%8==4)noise(.1,.35,1500,t,'bandpass',AU.mus);
  AU.step++;AU.next+=s8}}
// ---------- input
const keys={};const IN={pressA:false,pressB:false,run:false,joy:{id:null,ox:0,oy:0,x:0,y:0,rx:0,ry:0,R:60}};
function inputVec(){let x=IN.joy.x,y=IN.joy.y;if(keys.KeyA||keys.ArrowLeft)x-=1;if(keys.KeyD||keys.ArrowRight)x+=1;if(keys.KeyW||keys.ArrowUp)y-=1;if(keys.KeyS||keys.ArrowDown)y+=1;const m=Math.hypot(x,y);if(m>1){x/=m;y/=m}return{x,y,m:Math.min(1,m)}}
function smoothJoy(dt){const j=IN.joy;let x=j.rx,y=j.ry;const m=Math.hypot(x,y),dz=0.15;let k=0;if(m>dz)k=Math.min(1,(m-dz)/(1-dz))/m;const tx=x*k,ty=y*k;const f=1-Math.exp(-dt*22);j.x+=(tx-j.x)*f;j.y+=(ty-j.y)*f;if(j.id===null&&Math.abs(j.x)<.01&&Math.abs(j.y)<.01){j.x=j.y=0}}
