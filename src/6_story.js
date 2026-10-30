// ---------- dialog system
function dlg(title,html,choices,full){S.modal=true;const m=$('modal');m.className=full?'full':'';m.style.display='flex';const b=$('box');b.innerHTML=(title?`<h2>${title}</h2>`:'')+html;
 for(const c of choices||[]){const e=document.createElement('button');e.innerHTML=c[0];if(c[2])e.className=c[2];e.onclick=ev=>{ev.stopPropagation();SFX.select();vib(8);closeDlg();c[1]&&c[1]()};b.appendChild(e)}b.scrollTop=0;SFX.blip()}
function closeDlg(){if(S)S.modal=false;$('modal').style.display='none'}
const say=(who,t)=>`<span class="who">${who}:</span> ${t}`;
// ---------- cases
const CASES=[
 {title:'The Great Donut Heist',scene:'bank',intro:"Someone cleaned out the Bank's employee donut fund: $400 in rolled pennies and one (1) Boston Cream.",thing:'vault door',finale:'"The sprinkles... they CALLED to me."'},
 {title:'The Glitter & Sons Jewel Job',scene:'jewel',intro:'The "Hope-ish Diamond" (cubic zirconia, huge sentimental value) vanished from its case overnight.',thing:'display case',finale:'"I just wanted something sparkly for my pet rock."'},
 {title:'The Purloined Poodle',scene:'apart',intro:"The Mayor's poodle, Sir Fluffington III, was dognapped from Apartment 4B. The Mayor is devastated (and up for re-election).",thing:'dog bed',finale:'"He was SO fluffy. I panicked."'},
 {title:'The Pawn Shop Phantom',scene:'pawn',intro:'Every night something at the Pawn Shop gets replaced with a rubber chicken. The owner is losing it.',thing:'rubber chicken',finale:'"It was ART. A statement. About chickens."'}];
const ATTR={hair:{label:'Hair',vals:['red','blonde','black','grey'],col:{red:'#c03020',blonde:'#e0c060',black:'#1a1410',grey:'#999'}},height:{label:'Height',vals:['tall','short']},shoes:{label:'Shoes',vals:['boots','sneakers','flip-flops']},habit:{label:'Habit',vals:['cigars','bubble gum','sunflower seeds']},ride:{label:'Ride',vals:['scooter','van','unicycle']}};
const HABITITEM={cigars:'A soggy cigar butt','bubble gum':'A wad of pink bubble gum','sunflower seeds':'A trail of sunflower seed shells'};
function clueText(src,cat,v,thing){
 if(src=='witness'){return{hair:`"I saw 'em running off! Hair was ${v}. Like, REALLY ${v}."`,height:`"They were ${v}. ${v=='tall'?'Hit their head on the awning.':'Had to jump to reach the door handle.'}"`,shoes:`"I heard ${v=='boots'?'clomp clomp clomp':v=='sneakers'?'squeak squeak squeak':'flip flop flip flop'}. ${v}, definitely."`,habit:`"They smelled like ${v}. Strongly."`,ride:`"Got away on a ${v}! ${v=='unicycle'?'Very skilled, honestly.':'Fast, too.'}"`}[cat]}
 if(src=='scene'){return{hair:`A ${v} hair caught on the ${thing}.`,height:`Scuff marks ${v=='tall'?'high up':'very low'} on the wall. The perp is ${v}.`,shoes:`A muddy ${v} print next to the ${thing}.`,habit:`${HABITITEM[v]} near the ${thing}.`,ride:`Tire marks inside?! From a ${v}.`}[cat]}
 return{hair:`A ski mask with ${v} hair stuck in it.`,height:`A dropped coat, size ${v=='tall'?'XXL-TALL':'KIDS M'} — perp is ${v}.`,shoes:`A single abandoned ${v=='flip-flops'?'flip-flop':v=='boots'?'boot':'sneaker'}.`,habit:`${HABITITEM[v]}. And a receipt for ${v}.`,ride:`A parking ticket for a ${v}. Hmm.`}[cat]}
const SUSNAMES=['Big Sal','"Sprinkles" McGee','Prof. Cruller','Lady Fritter','Johnny Two-Cones','Madame Eclair','Knuckles Kowalski','Granny Smash','Dr. Jelly','Tiny Tony','Countess Crumb','Slick Rick Pfeiffer'];
function newCase(){const tpl=CASES[(SAVE.caseIdx||0)%CASES.length];const cats=shuffle(Object.keys(ATTR)).slice(0,3);
 const base={};for(const k in ATTR)base[k]=pick(ATTR[k].vals);const names=shuffle(SUSNAMES.slice());
 const sus=[{name:names[0],attrs:Object.assign({},base)}];
 for(let i=0;i<3;i++){const a=Object.assign({},base);const cat=cats[i];a[cat]=pick(ATTR[cat].vals.filter(v=>v!=base[cat]));for(const k in ATTR)if(!cats.includes(k)&&R()<.5)a[k]=pick(ATTR[k].vals);sus.push({name:names[i+1],attrs:a})}
 shuffle(sus);for(const s of sus){const L=randLook();L.hair=ATTR.hair.col[s.attrs.hair];L.hs=ri(1,6);L.hat=null;L.ht=s.attrs.height=='tall'?2:0;L.old=false;s.L=L;s.img=null}
 const culprit=sus.find(s=>cats.every(c=>s.attrs[c]==base[c]));
 const srcs=shuffle(['scene','witness','item']).map((src,i)=>({src,cat:cats[i],val:base[cats[i]],found:false}));
 const C={tpl,sus,culprit,srcs,stage:'investigate',accused:[]};
 const sb=findBlock(tpl.scene);
 for(const s of C.srcs){s.text=clueText(s.src,s.cat,s.val,tpl.thing);
  if(s.src=='scene'){const I=INTERIORS[tpl.scene];s.ix=rnd(3,10)*T;s.iy=rnd(4,7)*T}
  if(s.src=='item'){let t;do{t=randTile(v=>v==1)}while(Math.hypot(t.x*T-sb.bx*PP,t.y*T-sb.by*PP)<PP*1.5);s.x=(t.x+.5)*T;s.y=(t.y+.5)*T}
  if(s.src=='witness'){const b=pick(Object.values(blocks).filter(b=>b!=sb&&b.type!='police'));const w=mkPed();const d=doorOf(b.bx,b.by);w.x=d.x+20;w.y=d.y+6;w.state='witness';w.witness=s;w.name=rname();w.L.hat='#fd3';s.ped=w;s.where=b.name;peds.push(w)}}
 S.case=C}
function evidenceBoard(){const C=S.case;if(!C){dlg('Evidence Board','<i>Board is empty. Krupke is "working on it."</i>',[['Close']]);return}
 const known=C.srcs.filter(s=>s.found);
 let h=`<div style="margin-bottom:6px"><b>${C.tpl.title}</b><br><small>${C.tpl.intro}</small></div><div class="board">`;
 h+=C.srcs.map(s=>`<div class="note">${s.found?'📌 '+s.text:`❓ <i>${s.src=='scene'?'Search the crime scene: '+findBlock(C.tpl.scene).name:s.src=='witness'?'Find the witness near '+s.where+' (yellow cap)':'Find dropped evidence (yellow ✦ on map)'}</i>`}</div>`).join('');
 h+='</div><div class="board" style="margin-top:6px">';
 C.sus.forEach((s,i)=>{if(!s.img)s.img=portraitURL(s.L);const out=known.some(k=>s.attrs[k.cat]!=k.val)||C.accused.includes(i);
  h+=`<div class="sus ${out?'out':''}"><img src="${s.img}"><br><b>${s.name}</b><br>${Object.keys(ATTR).map(k=>`${ATTR[k].label}: ${s.attrs[k]}`).join('<br>')}<button data-i="${i}">ACCUSE</button></div>`});
 h+='</div>';
 dlg('🕵 Evidence Board',h,[['Close']],true);
 if(C.stage!='investigate'){[...document.querySelectorAll('.sus button')].forEach(b=>b.remove());return}
 document.querySelectorAll('.sus button').forEach(b=>b.onclick=e=>{e.stopPropagation();closeDlg();accuse(+b.dataset.i)})}
function accuse(i){const C=S.case,s=C.sus[i];
 if(s==C.culprit){C.stage='warrant';SFX.fanfare();vib([40,40,80]);S.score+=400;repChange(5);
  const sb=findBlock(C.tpl.scene);const d=doorOf(sb.bx,sb.by);const p=mkPed(s.L);p.x=d.x;p.y=d.y+10;p.name=s.name;p.crime='warrant';p.state='crime';p.ct=-999;C.perp=p;peds.push(p);crimes.push({t:'warrant',ped:p});
  dlg('Warrant Issued!',say('SGT KRUPKE',`${s.name}?! The evidence is airtight. +400 pts. Go pick 'em up — last seen near ${sb.name}. Bring 'em in for booking to close the case.`),[['On it! 🚔']]);radio(`DISPATCH: ${CR.warrant.code} Warrant out for ${s.name}, near ${sb.name}. Approach with snacks.`,'#fd6')}
 else{C.accused.push(i);repChange(-6);SFX.error();vib(120);dlg('Wrong Suspect',say('SGT KRUPKE',`${s.name} has an alibi: ${pick(['they were at a book club for people who hate donuts','they were stuck in a revolving door all night','they were judging a pie contest. Twelve witnesses. All full.','they were literally in our holding cell'])}. -6 rep. Think, detective!`),[['Hmm...']])}}
function caseClosed(){const C=S.case;C.stage='closed';S.stats.cases++;SAVE.cases=(SAVE.cases||0)+1;SAVE.caseIdx=(SAVE.caseIdx||0)+1;persist();S.score+=1000;repChange(12);SFX.fanfare();vib([60,40,60,40,120]);
 dlg('🏅 Case Closed: '+C.tpl.title,`${C.culprit.name} confesses: <i>${C.tpl.finale}</i><br><br>+1000 pts, +12 rep. The Chief gives you a coupon for ONE (1) free coffee.`,[['Heck yeah']]);
 S.caseDelay=25}
// ---------- scenes
function enterScene(key){const prev=S.scene;S.cityRet={x:me.x,y:me.y+6};S.scene=key;const d=iDoor(key);me.x=d.x;me.y=d.y;me.dir=-Math.PI/2;trail=[];S.carry.forEach((p,i)=>{p.x=me.x;p.y=me.y+10+i*8});SFX.door();vib(15);
 cam.x=me.x;cam.y=me.y;
 if(key=='station'){if(S.carry.length)toast('Take suspects to BOOKING (top-right)');}
 if(key==S.case?.tpl.scene&&S.case.stage=='investigate')toast('CRIME SCENE: search for evidence ✦')}
function exitScene(){const key=S.scene;S.scene='city';me.x=S.cityRet.x;me.y=S.cityRet.y+4;me.dir=Math.PI/2;trail=[];S.carry.forEach((p,i)=>{p.x=me.x;p.y=me.y-6});SFX.door();cam.x=me.x;cam.y=me.y;
 if(key=='station'&&S.held.some(h=>!h.papered))radio("SGT KRUPKE: OFFICER! You've got UNFILED PAPERWORK!",'#fd6')}
const ENTERABLE={police:'station',donut:'donut',bank:'bank',jewel:'jewel',apart:'apart',pawn:'pawn'};
// ---------- station actions
function stationAct(a){
 if(a=='book'){if(!S.carry.length){dlg('Booking',say('OFFICER DEE',"Nobody to book, hon. Bring me a perp. Or a sandwich."),[['OK']]);return}
  for(const p of S.carry){S.held.push({p,interrogated:false,papered:false,conf:false});S.booked++;S.score+=50;floatTxt(me.x,me.y-24,'BOOKED +50','#6f6');p.inCar=false;p.follow=false;
   if(S.case&&S.case.stage=='warrant'&&p==S.case.perp){caseClosed()}}
  S.carry=[];SFX.stamp();vib(30);layoutHeld();if(S.case?.stage!='closed'||S.modal==false)toast('Booked! Interrogate (optional) then do PAPERWORK');return}
 if(a=='interrogate'){const h=S.held.find(h=>!h.interrogated);if(!h){dlg('Interrogation Room',"<i>The room is empty. The one-way mirror reflects a tired officer who needs a donut.</i>",[['Leave']]);return}
  me.x=4*T;me.y=3.9*T;me.dir=-Math.PI/2;h.p.x=4*T;h.p.y=1.7*T;h.p.inRoom='interro';interrogate(h);return}
 if(a=='paperwork'){const h=S.held.find(h=>!h.papered);if(!h){dlg('Your Desk',"<i>Your inbox is empty. This has never happened before. You feel uneasy.</i>",[['Enjoy it']]);return}me.x=20.8*T;me.y=12.9*T;me.dir=-Math.PI/2;paperwork(h);return}
 if(a=='board'){evidenceBoard();return}
 if(a=='frontdesk'){const n=S.held.filter(h=>!h.papered).length;dlg('Front Desk',say('OFFICER DEE',pick(["Krupke's in a mood. Someone ate his labeled yogurt.","Phones are ringing off the hook. Mostly about a cat.","You look tired. Have you tried being less tired?"])+(n?` Also you've got ${n} perp${n>1?'s':''} waiting on paperwork.`:'')+`<br><br>Career rank: <b>${rankOf(SAVE.career+S.score)}</b>`),[['Thanks, Dee'],['Talk to Sergeant Krupke',sergeant]])}
 if(a=='coffee'){S.st=100;S.boost=30;SFX.donut();floatTxt(me.x,me.y-24,'COFFEE! SPEED UP','#fc6');dlg('',say('COFFEE MACHINE','*gurgle* *hiss* *sad drip*. Burnt. Perfect. Stamina full + 30s speed.'),[['Sip']])}
 if(a=='evdonut'){if(S.donuts>=6){floatTxt(me.x,me.y-24,'POCKETS FULL','#aaa');return}dlg('Evidence Locker #42',"A box labeled EVIDENCE — DO NOT EAT. It's a dozen glazed.",[['Take one (-2 rep, +1 donut)',()=>{S.donuts++;repChange(-2);SFX.donut();floatTxt(me.x,me.y-24,'+1 DONUT (SHAME)','#f8c')}],['Respect the evidence']])}
 if(a=='vend'){dlg('Vending Machine',pick(['B4: "Mystery Chips". Out of order since 1997.','It eats your dollar. It always eats your dollar.','A single granola bar spins slowly but never falls.']),[['Shake it',()=>{if(R()<.3){S.hp=Math.min(100,S.hp+15);floatTxt(me.x,me.y-24,'FREE SNACK +15','#6f6')}else{hurt(3);floatTxt(me.x,me.y-24,'IT FELL ON YOU','#f55')}}],['Walk away']])}}
function sergeant(){const C=S.case;const nr=nextRank(SAVE.career+S.score);
 dlg("Sgt. Krupke's Office",say('SGT KRUPKE',(C&&C.stage=='investigate'?`About "${C.tpl.title}": ${C.tpl.intro} Clues found: ${C.srcs.filter(s=>s.found).length}/3. Check the board.`:C&&C.stage=='warrant'?`Why are you here? Go arrest ${C.culprit.name}!`:"No open case. Enjoy the quiet. It won't last.")+`<br><br>Rank: <b>${rankOf(SAVE.career+S.score)}</b>${nr?` — ${nr[0]-(SAVE.career+S.score)|0} pts to ${nr[1]}`:' — top brass!'}`),[['Evidence board',evidenceBoard],['Yes, Sarge']])}
function layoutHeld(){S.held.filter(h=>!h.papered).forEach((h,i)=>{h.p.x=(1.8+i*1.3%6)*T;h.p.y=(11+Math.floor(i/5))*T;h.p.inRoom='cell';h.p.dir=Math.PI/2})}
// ---------- donut shop
function donutShop(a){if(a!='buy')return;
 dlg('Donut Counter',say('GLAZIA',pick(['"Cops eat free. It\'s in the city charter. Probably."','"Back again? You\'re our best customer. Our ONLY customer."','"Try the new Sprinkle Supreme. It has... ambitions."'])),[
  ['🍩 Glazed — +40 HP, +1 pocket donut',()=>{S.hp=Math.min(100,S.hp+40);S.donuts=Math.min(6,S.donuts+1);ate('GLAZED!')}],
  ['☕ Coffee — full stamina + 30s speed',()=>{S.st=100;S.boost=30;ate('JAVA!')}],
  ['🌈 Sprinkle Supreme — full HP & ST, +2 donuts',()=>{S.hp=100;S.st=100;S.donuts=Math.min(6,S.donuts+2);repChange(-1);ate('SUPREME! (-1 REP, LOOKS BAD)')}],
  ['Ask about gossip',gossip],['Nothing, thanks']])}
function ate(t){S.stats.donutsEaten++;S.score+=5;SFX.donut();vib(20);floatTxt(me.x,me.y-24,t,'#f8c');for(let i=0;i<14;i++)parts.push({x:me.x,y:me.y-10,vx:rnd(-40,40),vy:rnd(-50,10),c:pick(['#f8c','#ff0','#8ff','#fff','#c97']),life:.8,s:2})}
function gossip(){const C=S.case;let t;if(C&&C.stage=='investigate'){const s=pick(C.srcs.filter(s=>!s.found).concat(C.srcs));t=s.src=='witness'?`"There's a nosy type in a yellow cap hanging around ${s.where}. Saw something, they say."`:s.src=='scene'?`"Nobody's checked inside ${findBlock(C.tpl.scene).name} properly yet. Amateurs."`:`"Someone dropped something weird on a sidewalk. Look for the sparkle on your map."`}else t=pick(['"Word is Krupke cries at dog food commercials."','"Somebody keeps jaywalking on purpose. For the thrill."','"The mayor has a poodle. A VERY expensive poodle. Just saying."']);
 dlg('Gossip',say('OLD MAN CRUMBS',t),[['Thanks, Crumbs']])}
// ---------- crime scene
function sceneEvidence(){const C=S.case;if(!C||C.stage!='investigate'||C.tpl.scene!=S.scene)return null;return C.srcs.find(s=>s.src=='scene'&&!s.found)}
function findClue(s){s.found=true;S.score+=150;SFX.success();vib([20,30,20]);const n=S.case.srcs.filter(x=>x.found).length;
 dlg(`🔍 Clue ${n}/3`,`${s.text}<br><br><small>${ATTR[s.cat].label}: <b>${s.val}</b>. Noted on the evidence board.</small>${n==3?'<br><br><b>All clues found! Go to the Evidence Board at the station (Sergeant\'s office) and ACCUSE.</b>':''}`,[['Noted 📓']]);
 radio(`YOU: "Found a clue for ${S.case.tpl.title}. ${n}/3."`,'#8cf')}
function talkWitness(p){const s=p.witness;if(s.found){dlg('Witness',say(p.name,'"I already told you everything! I have a dentist appointment."'),[['Thanks']]);return}
 if(p.sulk>0){dlg('Witness',say(p.name,'"Hmph. Not talking to YOU."'),[['...']]);return}
 dlg('Witness',say(p.name,pick(['"Oh! A cop! Finally! I saw something, but..."','"Psst. You working the case? I might know something."','"Are you here about the thing? The THING?"'])),[
  ['😇 "Take your time. Every detail helps."',()=>{if(R()<.8)witnessTell(p);else{dlg('Witness',say(p.name,'"Hmm... it\'ll come to me. Ask again?"'),[['OK']])}}],
  ['😠 "Spit it out, I don\'t have all day!"',()=>{if(R()<.45)witnessTell(p);else{p.sulk=15;repChange(-1);dlg('Witness',say(p.name,'"RUDE. I\'m not saying anything for at least 15 seconds."'),[['Oops']])}}],
  ['🍩 Offer a donut'+(S.donuts?'':' (none left)'),()=>{if(S.donuts>0){S.donuts--;witnessTell(p,true)}else dlg('Witness',say(p.name,'"You offered me... an empty hand?"'),[['Sorry']])}]])}
function witnessTell(p,donut){const s=p.witness;dlg('Witness',say(p.name,(donut?'"*munch* Okay okay. "':'')+s.text),[['Thanks! 📓',()=>{findClue(s);p.state='walk';p.L.hat=null}]])}
