// ---------- interrogation
const QUIRKS=[{n:'a softie',good:2,bad:-1,donut:2},{n:'a tough nut',good:-.5,bad:2,donut:1},{n:'a hungry type',good:1,bad:0,donut:3.5},{n:'a drama queen',good:1.2,bad:1.2,donut:1},{n:'a chatterbox',good:1.5,bad:.5,donut:1.5}];
function interrogate(h){const p=h.p,q=pick(QUIRKS);let coop=1,anger=0,round=0;const crime=CR[p.crime]||CR.shoplift;S.inter={p};
 const G=['"Look, we all make mistakes. Wanna talk?"','"Rough week? Mine too. Tell me about it."','"You seem decent, under all the crime."','"I believe in you. Do you believe in you?"'];
 const B=['*SLAMS TABLE* "TALK!"','"Your buddy already ratted you out!" (he did not)','*leans in uncomfortably close*','"I have ALL. NIGHT." (shift ends at 8)'];
 const UP=['"...okay, maybe I did a LITTLE crime."','"Fine! I was framed! By my own hands!"','*sobs* "It was the sprinkles, they MADE me!"','"Can I get that in writing? The donut, I mean."'];
 const DN=['"I want my lawyer. And a sandwich."','"I know my rights! I watched a TV show once!"','*stares at the wall*','"Is that mirror one-way? Hi mom!"'];
 function step(txt){const meter=`<div>Cooperation</div><div class="meter"><i style="width:${Math.min(100,coop*20)}%;background:#3c6"></i></div><div>Anger</div><div class="meter"><i style="width:${Math.min(100,anger*25)}%;background:#c33"></i></div>`;
  if(coop>=5){h.interrogated=true;h.conf=true;S.stats.conf++;let extra='';const C=S.case;
   if(C&&C.stage=='investigate'){const un=C.srcs.find(s=>!s.found);if(un&&R()<.7)extra=`<br><br>🕵 <i>"Also... about ${C.tpl.title}? ${un.src=='witness'?`There's a witness hanging round ${un.where}. Yellow cap.`:un.src=='scene'?`Check inside ${findBlock(C.tpl.scene).name}. Cops missed something.`:'Somebody dropped something on the sidewalk. It sparkles.'}"</i>`}
   SFX.success();dlg('Confession!',`${p.name} sings like a canary. +120 pts, +3 rep.${extra}`,[['To the paperwork... 😩',()=>{S.score+=120;repChange(3);S.inter=null}]]);return}
  if(anger>=4||round>=5){h.interrogated=true;dlg('Lawyered Up',`${p.name} refuses to say more. ${anger>=4?'You may have yelled a bit. -2 rep.':'Out of time.'}`,[['Ugh. Paperwork.',()=>{if(anger>=4)repChange(-2);S.inter=null}]]);return}
  dlg('🗣 Interrogation — '+p.name,`<i>Charge: ${crime.n}. Your gut says they're ${q.n}. Round ${round+1}/5</i><br><br>${txt}<br>${meter}`,[
   ['😇 Good cop: '+pick(G),()=>{round++;coop+=q.good;if(q.good<0)anger+=.5;step(say(p.name,q.good>0?pick(UP):pick(DN)))}],
   ['😠 Bad cop: '+pick(B),()=>{round++;coop+=q.bad;anger+=1;S.shake=.2;vib(40);SFX.stamp();step(say(p.name,q.bad>0?pick(UP):pick(DN)))}],
   ['🍩 Offer donut'+(S.donuts?` (${S.donuts})`:' (none)'),()=>{round++;if(S.donuts>0){S.donuts--;coop+=q.donut;anger=Math.max(0,anger-1);step(say(p.name,'"...is this... Boston Cream?" *eyes moisten*'))}else step('<i>You pat your pockets. No donuts. Awkward.</i>')}],
   ['🤐 Silent stare',()=>{round++;if(R()<.4){coop+=2;step(say(p.name,'"OKAY STOP LOOKING AT ME LIKE THAT."'))}else step('<i>They stare back. You both blink. Nobody wins.</i>')}],
   ['🚪 Skip (no bonus)',()=>{h.interrogated=true;S.inter=null}]])}
 step(`<i>${p.name} sits across the table, sweating. The lamp buzzes. The coffee machine gurgles ominously.</i>`)}
// ---------- paperwork
function typo(s){const a=s.split('');const i=ri(1,a.length-2);const m=ri(0,3);if(m==0)[a[i],a[i+1]]=[a[i+1],a[i]];else if(m==1)a[i]=pick('aeiouxzqk'.split(''));else if(m==2)a.splice(i,0,a[i]);else a.splice(i,1);return a.join('')}
function paperwork(h){const p=h.p;let errors=0,stage=0;const crime=CR[p.crime]||CR.shoplift;const t0=performance.now();
 const forms=['Form 27-B/6 (Arrest Report)','Form 99-Q (Feelings About Arrest)','Form 12-Z (Request For More Forms)','Form 404 (Form Not Found)'];
 const hdr=()=>`<small>⏱ ${((performance.now()-t0)/1000|0)}s · ❌ ${errors}</small><br>`;
 function next(){stage++;
  if(stage==1){const opts=[p.name];while(opts.length<4){const t=typo(p.name);if(!opts.includes(t))opts.push(t)}shuffle(opts);
   dlg('📝 '+forms[0],hdr()+'Box 1: Suspect\'s full legal name, spelled <b>correctly</b>:',opts.map(o=>[o,()=>{if(o!=p.name){errors++;SFX.error();floatTxt(me.x,me.y-24,'TYPO!','#f55')}else SFX.type();next()}]))}
  else if(stage==2){const codes=Object.values(CR).map(c=>c.code+' – '+c.n);codes.push('10-WTF – Unspecified Weirdness','10-4 – Copy That');
   dlg('📝 '+forms[0],hdr()+'Box 7c: Select the crime code. Sgt. Krupke is watching.',shuffle(codes).slice(0,5).concat([crime.code+' – '+crime.n]).filter((v,i,a)=>a.indexOf(v)==i).sort(()=>R()-.5).map(c=>[c,()=>{if(!c.startsWith(crime.code+' ')){errors++;SFX.error()}next()}]))}
  else if(stage==3){const tm=S.time;const real=`${String(tm/60|0).padStart(2,'0')}:${String(tm%60|0).padStart(2,'0')}`;const fake=[real,`${String((tm/60|0)+1).padStart(2,'0')}:${String(tm%60|0).padStart(2,'0')}`,`${String(tm/60|0).padStart(2,'0')}:${String((tm+17)%60|0).padStart(2,'0')}`,'25:61'];
   dlg('📝 '+forms[3],hdr()+'Box 0: Current time (see your watch, top-left):',shuffle(fake).map(f=>[f,()=>{if(f!=real){errors++;SFX.error()}next()}]))}
  else if(stage==4){dlg('📝 '+forms[1],hdr()+'On a scale of 1–5, how did this arrest make you feel?',[['1 – Nothing. I am the law.',next],['3 – Mild indigestion.',next],['5 – I need a donut.',next],['Leave blank',()=>{errors++;next()}]])}
  else if(stage==5){let stamps=0;const need=3,st0=performance.now();
   const draw=()=>dlg('📝 '+forms[2],hdr()+`STAMP IN TRIPLICATE! Fast, before the copier jams!<br><div style="font-size:30px;text-align:center">${'✅'.repeat(stamps)}${'⬜'.repeat(need-stamps)}</div>`,[['🔨 STAMP!',()=>{stamps++;SFX.stamp();vib(25);S.shake=.1;if(stamps>=need){if(performance.now()-st0>3500){errors++;SFX.error();floatTxt(me.x,me.y-24,'COPIER JAMMED','#f55')}next()}else draw()}]]);draw()}
  else{const secs=(performance.now()-t0)/1000|0;let pts=Math.max(0,crime.pts-errors*30)+(secs<20?50:0)+(h.conf?60:0);S.score+=pts;repChange(errors?-errors:2);S.arrests++;h.papered=true;S.papers++;if(!errors)S.stats.perfectForms++;
   SAVE.arrests=(SAVE.arrests||0)+1;persist();if(!errors)SFX.success();
   p.inRoom=null;peds=peds.filter(x=>x!=p);peds.push(mkPed());layoutHeld();
   dlg(errors?'📎 Filed (badly)':'🏅 Flawless Paperwork!',`Time: ${secs}s · Errors: ${errors}${h.conf?' · Confession bonus':''}<br>${errors?'The Sergeant sighs so hard his mustache moves.':'The Sergeant nods. Once. A rare honor.'} <b>+${pts} pts</b><br><br><i>${pick(['Only 46 more forms till retirement.','The coffee is cold. It was always cold.','Your pen dies. Every pen dies.','The printer says PC LOAD LETTER. You do not know what that means.'])}</i>`,[['Back to the beat 🚔']])}}
 dlg('🗂 Paperwork: '+p.name,`Charge: ${crime.n}. The city requires ${forms.length} forms. Typos are penalized. Speed is rewarded.`,[['Begin the suffering',next]])}
