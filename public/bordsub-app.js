/* Bòrd Sub : interface reprise du prototype validé (UI-UX/prototype/index.html). */
const GP="M87 22L61.5 42L44.5 59L28.5 80.5L14 105.5L.5 147L0 203.5L117 810L129 854.5L146.5 889L160.5 907.5L177.5 924.5L203 944.5L228.5 957.5L265.5 968.5L293.5 973L318 973L333.5 969.5L350 968.5L590.5 919.5L643 901.5L663 891L697.5 868L741 825L755 806L780 760.5L794 724.5L803 692.5L811 651.5L811.5 635L815.5 615.5L815.5 567L811.5 547.5L811.5 527L798 454.5L786 414L772 378L749 332L730.5 303.5L715 283L678 246L640.5 218L607 201L582 191L548.5 182.5L522 178L469.5 177.5L454 181L437.5 182L214 225L203 224.5L197 219.5L192.5 206L153.5 4.5L147 0L129 3L112.5 9Z";
const gimic=(color,h)=>`<svg class="gimic" viewBox="0 0 816 973.5" width="${Math.round(h*816/973.5)}" height="${h}" aria-hidden="true"><path d="${GP}" fill="${color}"/></svg>`;
const C={nuit:'#10243F',creme:'#F5F2EA',prune:'#6B3FA0'};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MOIS=['JANV.','FÉVR.','MARS','AVR.','MAI','JUIN','JUIL.','AOÛT','SEPT.','OCT.','NOV.','DÉC.'];
const MOISL=['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre'];
const today=(()=>{const d=new Date();d.setHours(0,0,0,0);return d;})();
const parse=iso=>{if(!iso)return null;const [y,m,d]=iso.split('-').map(Number);return new Date(y,m-1,d);};
const days=iso=>{const d=parse(iso);return d?Math.round((d-today)/864e5):null;};
const fmtDate=iso=>{const d=parse(iso);return d?`${String(d.getDate()).padStart(2,'0')} ${MOIS[d.getMonth()]} ${d.getFullYear()}`:'';};

let DB={aides:[],departements:[]};
const store={get(k,d){try{const v=localStorage.getItem('bordsub:'+k);return v?JSON.parse(v):d;}catch(e){return d;}},set(k,v){try{localStorage.setItem('bordsub:'+k,JSON.stringify(v));}catch(e){}}};
let S=Object.assign({dep:null,profil:null,projets:[],suivies:['REG-054','DRA-057','SPE-001','DRA-056','CNM-001'],rappel:true},store.get('state',{}));
const save=()=>store.set('state',S);

const PROFILS=[['artiste','Artiste ou groupe','en solo ou à plusieurs'],['compagnie','Compagnie ou ensemble','spectacle, théâtre musical, orchestre'],['lieu','Association ou lieu','salle, scène, café-concert'],['festival','Festival','une ou plusieurs éditions par an'],['label','Label ou producteur','disque, spectacle, tournée'],['compositeur','Compositeur·rice','écriture, commande d\'œuvre']];
const PROJETS=[['spectacle','Créer un spectacle','création, reprise, résidence',/scéni|spectacle|résidence|création \/ production|création \(/i],['disque','Enregistrer un disque','production, édition, promotion',/phonograph|enregistr|disque|édition|promotion/i],['tournee','Partir en tournée','en France ou à l\'étranger',/export|tournée|diffusion|déplacement|international/i],['festival','Organiser un festival','une édition ou une saison',/festival|saison/i],['composer','Composer une œuvre','commande, écriture, bande originale',/compos|commande|écriture|auteur|bande originale|musique originale/i],['video','Faire un clip ou une vidéo','audiovisuel, musique à l\'image',/audiovisuel|image|clip|vidéo/i],['structurer','Se structurer, se former','emploi, formation, développement',/structur|formation|emploi|développement|accompagnement|fonctionnement|transition|investissement/i]];

function statusOf(a){
  const s=(a.statut||'').toLowerCase(), n=days(a.prochaine_date_limite);
  if(a.actif==='non'||s.startsWith('fermé')||s.startsWith('clôturé'))return {k:'fermee',w:'Fermée pour l\'instant'};
  if(s.startsWith('ouverture le')){return {k:'perm',w:'Ouvre le '+s.replace('ouverture le ','').split(' ')[0],n};}
  if(n!==null&&n>=0&&n<=14)return {k:'bientot',w:n===0?'Ferme aujourd\'hui':`dans ${n} jour${n>1?'s':''}`,n};
  if(n!==null&&n>14)return {k:'ouverte',w:`dans ${n} jours`,n};
  if(s.startsWith('permanent')||s.startsWith('automatique'))return {k:'perm',w:'Commissions régulières'};
  return {k:'verif',w:'Calendrier à vérifier'};
}
const ICON={ouverte:'<svg width="8" height="8"><circle cx="4" cy="4" r="3.5" fill="currentColor"/></svg>',bientot:'<svg width="10" height="9"><path d="M5 0L10 9H0z" fill="#E3A21A"/></svg>',fermee:'<svg width="8" height="8"><rect width="8" height="8" fill="currentColor"/></svg>',perm:'<svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',verif:'<svg width="10" height="10"><circle cx="5" cy="5" r="4" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 2"/></svg>'};
const stHTML=st=>`<span class="st ${st.k}">${ICON[st.k]}${esc(st.w)}</span>`;
const barHTML=st=>st.n!=null&&st.n>=0&&(st.k==='bientot'||st.k==='ouverte')?`<div class="bar ${st.k}"><i style="width:${Math.max(6,Math.min(100,100*(1-st.n/45)))}%"></i></div>`:'';
const REGS=()=>new Set(DB.departements.map(d=>d.region));
const orgName=a=>a.organisme==='Région'?'Région '+a.region:a.organisme==='DRAC'?(REGS().has(a.region)?'DRAC '+a.region:'DRAC (national)'):a.organisme;
const depObj=c=>DB.departements.find(d=>d.code===c);
function aidesDuDep(code){return DB.aides.filter(a=>!a.departements.length||a.departements.includes(code));}
function matchProjets(a){if(!S.projets.length)return true;const txt=a.type_projet+' '+a.programme+' '+a.description;return S.projets.some(p=>PROJETS.find(x=>x[0]===p)[3].test(txt));}
function sortAides(list){const rank=a=>{const st=statusOf(a);return st.k==='fermee'?3e6:(st.n!=null&&st.n>=0?st.n:(st.k==='perm'?1e6:2e6));};return list.slice().sort((x,y)=>rank(x)-rank(y));}

function nav(active){
  return `<div class="filet"><i></i><i></i><i></i><i></i><i></i></div><header class="topnav"><div class="wrap"><a class="brand" href="#accueil">${gimic(C.nuit,26)}Bòrd Sub</a>
  <nav class="navlinks" aria-label="Navigation"><a href="#resultats" class="${active==='aides'?'on':''}">Aides</a><a href="#calendrier" class="${active==='cal'?'on':''}">Calendrier</a><a href="#dossiers" class="${active==='dos'?'on':''}">Mes dossiers</a><a href="#offres">Offres</a></nav>
  <a class="btn btn-secondary" href="#compte" style="min-height:42px;padding:8px 16px">Se connecter</a></div></header>`;
}
function tabbar(active){
  const items=[['resultats','Aides','aides'],['calendrier','Calendrier','cal'],['dossiers','Dossiers','dos'],['compte','Compte','acc']];
  document.getElementById('tabbar').innerHTML=items.map(([h,l,k])=>`<a href="#${h}" class="${k===active?'on':''}">${k===active?gimic(C.creme,18):'<span class="ring"></span>'}${l}</a>`).join('');
  document.body.classList.add('has-tabbar');
}
function footer(){return `<footer><div class="filet"><i></i><i></i><i></i><i></i><i></i></div><div class="wrap"><span class="brand">${gimic(C.creme,20)}Bòrd Sub</span><span>Un service HopHopHop · se relie à Bòrd Pro · sources officielles relues chaque mois</span></div></footer>`;}

/* ---------- Accueil ---------- */
function vAccueil(){
  const dep=S.dep||'34', list=sortAides(aidesDuDep(dep)).filter(a=>{const st=statusOf(a);return st.k==='bientot'||st.k==='ouverte';}).slice(0,4), d=depObj(dep);
  return `<div class="hero"><div class="filet"><i></i><i></i><i></i><i></i><i></i></div>
  <div class="wrap topin"><a class="brand" href="#accueil">${gimic(C.creme,28)}Bòrd Sub</a><nav class="navlinks"><a href="#comment">Comment ça marche</a><a href="#financeurs">Les financeurs</a><a href="#offres">Offres</a></nav><a class="btn btn-ghost-dark" href="#compte" style="min-height:42px;padding:8px 16px">Se connecter</a></div>
  <div class="wrap hero-grid"><div><div class="pills"><span class="pill">GRATUIT</span><span class="pill">SANS COMPTE</span><span class="pill">RELU CHAQUE MOIS</span></div>
  <h1>Quelles aides pour votre musique&nbsp;?</h1><p class="lead">Trois questions, et vous voyez toutes les aides auxquelles vous pouvez prétendre : Adami, Spedidam, Sacem, CNM, votre DRAC et votre Région.</p></div>
  ${qStep1()}</div><div class="filigrane">${gimic(C.creme,430).replace('class="gimic"','class="gimic" style="width:100%;height:auto"')}</div></div>
  <section class="band" id="comment"><div class="wrap"><div class="eyebrow">Comment ça marche</div>
  <div class="how"><article><span class="n">01</span><h3>Vous répondez à 3 questions</h3><p class="muted">Votre département, ce que vous faites, votre projet. Rien d'autre.</p></article><article><span class="n">02</span><h3>Vous voyez vos aides</h3><p class="muted">Triées par date limite, avec le montant, les pièces et le lien officiel.</p></article><article><span class="n">03</span><h3>On vous rappelle les dates</h3><p class="muted">Suivez une aide : vous recevez un e-mail avant qu'elle ferme.</p></article></div></div></section>
  <section class="band creme"><div class="wrap"><div class="sechead"><div><div class="eyebrow">${esc(d?d.nom+' ('+d.code+')':'')} · ${esc(d?d.region:'')}</div><h2>Ça ferme bientôt</h2></div><a class="linkarrow" href="#calendrier">Voir tout le calendrier →</a></div>
  <div class="dl">${list.map(dlRow).join('')}</div></div></section>
  <section class="band" id="financeurs"><div class="wrap"><div class="eyebrow">Les financeurs suivis</div>
  <div class="stats"><div><b>${DB.aides.length}</b><span class="muted">aides recensées</span></div><div><b>${DB.departements.length}</b><span class="muted">départements</span></div><div><b>6</b><span class="muted">familles de financeurs</span></div></div>
  <div class="orgs"><span>Adami</span><span>Spedidam</span><span>Sacem</span><span>CNM</span><span>DRAC</span><span>Conseils régionaux</span></div></div></section>
  <section class="band creme" id="offres"><div class="wrap"><div class="eyebrow">Trois façons d'utiliser Bòrd Sub</div><h2 style="font-size:clamp(32px,4vw,44px);margin-top:8px">Gratuit pour chercher. Aidé pour déposer.</h2>
  <div class="offers">
   <div class="offer" style="background:var(--blanc)"><h3>Découverte</h3><span class="price">0 €</span><p class="muted" style="margin:0">Pour tout le monde.</p><ul><li>${gimic(C.nuit,14)}Toutes les aides de votre territoire</li><li>${gimic(C.nuit,14)}Fiches claires et liens officiels</li><li>${gimic(C.nuit,14)}Calendrier et rappels par e-mail</li></ul><a class="btn btn-secondary" href="#q1">Trouver mes aides</a></div>
   <div class="offer" style="background:var(--blanc)"><h3>Assistant <span class="tag soon">BIENTÔT</span></h3><span class="price">Prix à définir</span><p class="muted" style="margin:0">Pour monter vos dossiers vous-même, guidé.</p><ul><li>${gimic(C.nuit,14)}Textes rédigés avec vous, section par section</li><li>${gimic(C.nuit,14)}Budget équilibré au centime</li><li>${gimic(C.nuit,14)}Vérification des pièces avant dépôt</li></ul><a class="btn btn-secondary" href="#compte">Être prévenu·e</a></div>
   <div class="offer dark"><h3>Accompagnement <span class="tag">AU MOIS</span></h3><span class="price">Prix à définir</span><p class="muted" style="margin:0">Sans engagement, avec l'équipe HopHopHop.</p><ul><li>${gimic(C.creme,14)}Un point mensuel sur vos prochaines aides</li><li>${gimic(C.creme,14)}Relecture de vos dossiers avant dépôt</li><li>${gimic(C.creme,14)}L'assistant inclus</li></ul><a class="btn btn-ghost-dark" href="#compte">Être accompagné·e</a></div>
  </div></div></section>${footer()}`;
}
function dlRow(a){const st=statusOf(a),d=parse(a.prochaine_date_limite);return `<a class="dlrow" href="#aide-${a.id}"><div class="date"><b>${String(d.getDate()).padStart(2,'0')}</b><small>${MOIS[d.getMonth()]}</small></div><div style="min-width:0"><div class="org">${esc(orgName(a))}</div><div class="t">${esc(a.programme)}</div></div><div class="m mono muted" style="font-size:13px">${esc(shortMontant(a))}</div><div class="cd">${stHTML(st)}${barHTML(st)}</div></a>`;}
function shortMontant(a){let m=(a.montant_resume||'').replace(/^Indicatif\s*:\s*/i,'').split(/\.\s/)[0];return m.length>52?m.slice(0,50).replace(/[ ,;.(]+\S*$/,'')+'…':m;}

function qStep1(){
  const d=S.dep?depObj(S.dep):null;
  return `<form class="qcard" id="q1form" autocomplete="off"><div class="qhead"><span class="eyebrow">Étape 1 sur 3</span><span class="demo">30 SECONDES</span></div><div class="progress"><i class="on"></i><i></i><i></i></div>
  <h2>Où êtes-vous installé·e&nbsp;?</h2>
  <div class="field"><label for="depInput" class="demo" style="display:block;margin-bottom:6px">VOTRE DÉPARTEMENT</label><input id="depInput" placeholder="Tapez un nom ou un numéro, ex. 34" value="${d?esc(d.code+' · '+d.nom):''}" aria-autocomplete="list"><div class="suggest" id="sugg" hidden></div></div>
  <div class="quick">${['34','31','75','69','33'].map(c=>{const x=depObj(c);return x?`<button type="button" class="chip" data-dep="${c}" aria-pressed="${S.dep===c}">${c} · ${esc(x.nom)}</button>`:'';}).join('')}</div>
  <button class="btn btn-primary" type="submit" ${S.dep?'':'disabled'} id="q1next">Continuer →</button>
  <span class="muted" style="font-size:14px">Ensuite : qui vous êtes, puis votre projet.</span></form>`;
}
function bindQ1(){
  const f=document.getElementById('q1form');if(!f)return;const inp=f.querySelector('#depInput'),sg=f.querySelector('#sugg');
  const pick=c=>{S.dep=c;save();const d=depObj(c);inp.value=c+' · '+d.nom;sg.hidden=true;f.querySelector('#q1next').disabled=false;f.querySelectorAll('[data-dep]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.dep===c));};
  inp.addEventListener('input',()=>{const q=inp.value.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');if(!q){sg.hidden=true;return;}
    const m=DB.departements.filter(d=>d.code.toLowerCase().startsWith(q)||d.nom.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').includes(q)).slice(0,8);
    sg.innerHTML=m.map(d=>`<button type="button" data-c="${d.code}"><span><b class="mono">${d.code}</b> · ${esc(d.nom)}</span><span class="muted" style="font-size:13px">${esc(d.region)}</span></button>`).join('')||'<div style="padding:12px 16px" class="muted">Aucun département trouvé</div>';sg.hidden=false;});
  sg.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(b)pick(b.dataset.c);});
  f.querySelectorAll('[data-dep]').forEach(b=>b.addEventListener('click',()=>pick(b.dataset.dep)));
  f.addEventListener('submit',e=>{e.preventDefault();if(S.dep)location.hash='q2';});
}

/* ---------- Questionnaire 2 et 3 ---------- */
function vQuiz(step){
  const d=depObj(S.dep||'34');
  const multi=step===3, opts=step===2?PROFILS:PROJETS, sel=step===2?(S.profil?[S.profil]:[]):S.projets;
  return `<div class="filet"><i></i><i></i><i></i><i></i><i></i></div><header class="topnav"><div class="wrap"><a class="brand" href="#accueil">${gimic(C.nuit,26)}Bòrd Sub</a><a href="#accueil" class="muted" style="margin-left:auto;font-weight:500">${esc(d.nom)} (${d.code}) · modifier</a></div></header>
  <div class="wrap"><div class="quiz"><div class="qhead"><span class="eyebrow">Étape ${step} sur 3</span><span class="demo">${step===2?'ENCORE 2 QUESTIONS':'DERNIÈRE QUESTION'}</span></div><div class="progress"><i class="on"></i><i class="on"></i><i class="${step===3?'on':''}"></i></div>
  <h1>${step===2?'Vous êtes…':'Votre projet'}</h1><p class="muted" style="margin:0;font-size:18px">${step===2?'Choisissez ce qui vous décrit le mieux. Vous pourrez changer plus tard.':'Plusieurs choix possibles. Sans choix, vous voyez toutes vos aides.'}</p>
  <div class="choices" role="group" aria-label="${step===2?'Profil':'Projet'}">${opts.map(o=>{const on=sel.includes(o[0]);return `<button type="button" class="choice" data-v="${o[0]}" aria-pressed="${on}"><span class="ch-top">${gimic(on?C.creme:C.nuit,22)}<span class="ck"></span></span><b>${esc(o[1])}</b><span class="d">${esc(o[2])}</span></button>`;}).join('')}</div>
  <div class="quiznav"><a class="linkbtn" href="#${step===2?'accueil':'q2'}" style="text-decoration:none">← Retour</a><a class="btn btn-primary" href="#${step===2?'q3':'resultats'}">${step===2?'Continuer →':'Voir mes aides →'}</a></div></div></div>`;
}
function bindQuiz(step){
  document.querySelectorAll('.choice').forEach(b=>b.addEventListener('click',()=>{const v=b.dataset.v;
    if(step===2){S.profil=S.profil===v?null:v;}else{S.projets=S.projets.includes(v)?S.projets.filter(x=>x!==v):[...S.projets,v];}
    save();render();}));
}

/* ---------- Résultats ---------- */
let F={statut:new Set(['ouverte','bientot','perm','verif']),org:new Set(),q:'',shown:12};
function vResultats(){
  const dep=S.dep||'34',d=depObj(dep);
  let base=aidesDuDep(dep).filter(matchProjets);
  const orgs={};base.forEach(a=>{const o=orgName(a);orgs[o]=(orgs[o]||0)+1;});
  const q=F.q.trim().toLowerCase();
  let list=sortAides(base.filter(a=>{const st=statusOf(a);if(!F.statut.has(st.k==='verif'?'perm':st.k))return false;if(F.org.size&&!F.org.has(orgName(a)))return false;if(q&&!(a.programme+' '+a.description+' '+a.type_projet+' '+a.organisme).toLowerCase().includes(q))return false;return true;}));
  const prof=PROFILS.find(p=>p[0]===S.profil), proj=S.projets.map(p=>PROJETS.find(x=>x[0]===p)[1].toLowerCase());
  const titre=`${base.length} aides ${proj.length===1?'pour '+proj[0].replace(/^créer/,'créer'):'pour vous'}`;
  const cnt=k=>base.filter(a=>{const s=statusOf(a).k;return k==='perm'?(s==='perm'||s==='verif'):s===k;}).length;
  return nav('aides')+`<div class="summary"><div class="wrap"><div class="ans"><span class="demo" style="font-weight:600">VOS RÉPONSES</span><a class="chip" href="#accueil">${esc(d.nom)} (${d.code}) ✎</a><a class="chip" href="#q2">${esc(prof?prof[1]:'Profil : tous')} ✎</a><a class="chip" href="#q3">${esc(proj.length?S.projets.map(p=>PROJETS.find(x=>x[0]===p)[1]).join(', '):'Tous les projets')} ✎</a></div>
  <h1>${esc(titre)}</h1><p class="muted" style="margin:0">Aides nationales, de la DRAC ${esc(d.region)} et de la Région ${esc(d.region)}. Base vérifiée le 21/11/2026.</p></div></div>
  <div class="wrap results"><aside class="facets" aria-label="Filtres">
   <div class="facet"><h3>Statut</h3>${[['ouverte','Ouvertes en ce moment'],['bientot','Ferment dans 14 jours'],['perm','Permanentes, à vérifier'],['fermee','Fermées pour l\'instant']].map(([k,l])=>`<label><input type="checkbox" data-st="${k}" ${F.statut.has(k)?'checked':''}>${l}<span class="c">${cnt(k)}</span></label>`).join('')}</div>
   <div class="facet"><h3>Financeur</h3>${Object.entries(orgs).sort((a,b)=>b[1]-a[1]).map(([o,n])=>`<label><input type="checkbox" data-org="${esc(o)}" ${F.org.has(o)?'checked':''}>${esc(o)}<span class="c">${n}</span></label>`).join('')}</div>
  </aside><div class="list"><div class="listhead"><div class="search"><input id="q" type="search" placeholder="Rechercher : festival, disque, résidence…" value="${esc(F.q)}" aria-label="Rechercher une aide"></div><span class="muted" style="font-size:14px">${list.length} affichée${list.length>1?'s':''} · par date limite</span></div>
  ${list.length?list.slice(0,F.shown).map((a,i)=>cardHTML(a,i===0&&statusOf(a).k==='bientot')).join(''):'<div class="empty">Aucune aide avec ces filtres. Essayez d\'en retirer un.</div>'}
  ${list.length>F.shown?`<button class="btn btn-secondary more" id="more">Voir ${Math.min(12,list.length-F.shown)} aides de plus</button>`:''}</div></div>${footer()}`;
}
function cardHTML(a,hl){const st=statusOf(a),on=S.suivies.includes(a.id);
  return `<a class="card ${hl?'hl':''}" href="#aide-${a.id}"><div class="head"><span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><span class="org">${esc(orgName(a))}</span>${hl?'<span class="flag">À NE PAS MANQUER</span>':''}</span><button class="follow" data-follow="${a.id}" aria-pressed="${on}">${on?'★ Suivie':'☆ Suivre'}</button></div>
  <h3>${esc(a.programme)}</h3>${a.description?`<p>${esc(a.description.length>150?a.description.slice(0,148)+'…':a.description)}</p>`:''}
  <div class="foot"><div class="kv"><small>MONTANT</small><b>${esc(shortMontant(a)||'Selon le projet')}</b></div><div class="kv"><small>DATE LIMITE</small><b class="mono">${a.prochaine_date_limite?fmtDate(a.prochaine_date_limite):'—'}</b></div><div class="cd">${stHTML(st)}${barHTML(st)}</div></div></a>`;}
function bindResultats(){
  document.querySelectorAll('[data-st]').forEach(i=>i.addEventListener('change',()=>{i.checked?F.statut.add(i.dataset.st):F.statut.delete(i.dataset.st);render();}));
  document.querySelectorAll('[data-org]').forEach(i=>i.addEventListener('change',()=>{i.checked?F.org.add(i.dataset.org):F.org.delete(i.dataset.org);render();}));
  const q=document.getElementById('q');if(q){q.addEventListener('input',()=>{F.q=q.value;clearTimeout(q._t);q._t=setTimeout(()=>{render();const n=document.getElementById('q');n.focus();n.setSelectionRange(n.value.length,n.value.length);},250);});}
  const m=document.getElementById('more');if(m)m.addEventListener('click',()=>{F.shown+=12;render(true);});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-follow]');if(!b)return;e.preventDefault();e.stopPropagation();const id=b.dataset.follow;S.suivies=S.suivies.includes(id)?S.suivies.filter(x=>x!==id):[...S.suivies,id];save();render(true);});

/* ---------- Fiche ---------- */
function vFiche(id){
  const a=DB.aides.find(x=>x.id===id);if(!a)return nav('aides')+'<div class="wrap"><p class="empty" style="margin-top:40px">Aide introuvable.</p></div>';
  const st=statusOf(a),on=S.suivies.includes(a.id);
  const pieces=(a.pieces_a_fournir||'').replace(/^.*?:\s*/,'').replace(/\)\.?$/,'').split(/[,;]\s*/).map(s=>s.trim()).filter(s=>s.length>2&&s.length<90);
  const sec=(t,v)=>v?`<section><h2>${t}</h2><p>${esc(v)}</p></section>`:'';
  return nav('aides')+`<div class="wrap"><div class="crumb"><a href="#resultats">Mes aides</a> / ${esc(orgName(a))}</div>
  <div class="fiche-h"><span class="eyebrow">${esc(orgName(a))} · ${esc(a.type_projet)}</span><h1>${esc(a.programme)}</h1>
  <div class="keys"><div><span class="demo">MONTANT</span><b>${esc((a.montant_resume||'Selon le projet').replace(/^Indicatif\s*:\s*/i,''))}</b></div><div><span class="demo">DATE LIMITE</span><b class="mono">${a.prochaine_date_limite?fmtDate(a.prochaine_date_limite):'Pas de date fixe'}</b>${stHTML(st)}</div><div><span class="demo">DÉPÔT</span><b style="font-family:var(--f-text);font-size:17px">${esc((a.mode_depot||'Voir la fiche officielle').replace(/\s*\(.*$/,''))}</b></div></div></div>
  <div class="fiche-cols"><article>${sec('Pour qui ?',a.beneficiaires)}${sec('Ce qui est financé',a.description)}${sec('Calendrier',a.calendrier)}${sec('Conditions',a.conditions_cles)}
  ${pieces.length?`<section><h2>Pièces à fournir</h2><ul class="pieces">${pieces.map((p,i)=>`<li><label><input type="checkbox" id="pc-${a.id}-${i}">${esc(p.charAt(0).toUpperCase()+p.slice(1))}</label></li>`).join('')}</ul><p class="muted" style="font-size:14px;margin-top:10px">Liste à confirmer sur la fiche officielle. Cochez ce que vous avez déjà.</p></section>`:''}</article>
  <aside class="aside"><span class="demo">${a.prochaine_date_limite?'FERME LE '+fmtDate(a.prochaine_date_limite):'SANS DATE LIMITE FIXE'}</span>${stHTML(st)}${barHTML(st)}
  <button class="btn btn-primary" data-follow="${a.id}" aria-pressed="${on}">${on?'★ Aide suivie':'☆ Suivre cette aide'}</button>
  ${a.url_officielle?`<a class="btn btn-secondary" href="${esc(a.url_officielle)}" target="_blank" rel="noopener">Site officiel ↗</a>`:''}
  <div class="soonbox"><span class="eyebrow" style="font-size:10px">Assistant</span>Textes, budget équilibré, pièces vérifiées avant le dépôt.<a class="linkarrow" href="#nouveau-${a.id}" style="color:var(--prune)">Monter ce dossier →</a></div>
  <hr><div><b style="font-size:15px">Besoin d'un coup de main ?</b><br><a href="#offres" style="color:var(--prune);font-weight:600;font-size:14px;text-decoration:none">Accompagnement HopHopHop au mois →</a></div>
  <hr><span class="muted" style="font-size:13px">Vérifiée le ${esc((a.date_derniere_verification||'').split('-').reverse().join('/'))} sur la page officielle.</span></aside></div></div>${footer()}`;
}

/* ---------- Calendrier (espace connecté) ---------- */
function side(active){return `<aside class="side"><a class="brand" href="#accueil" style="background:none">${gimic(C.creme,26)}Bòrd Sub</a>${[['resultats','Aides','aides'],['calendrier','Calendrier','cal'],['dossiers','Mes dossiers','dos'],['compte','Ma structure','str']].map(([h,l,k])=>`<a href="#${h}" class="${k===active?'on':''}">${k===active?gimic(C.creme,16):'<span class="sp"></span>'}${l}${k==='str'?'<small>BIENTÔT</small>':''}</a>`).join('')}<div class="foot"><small>MODE AUTONOME</small>Rattacher à Bòrd Pro</div></aside>`;}
function vCalendrier(){
  const list=S.suivies.map(id=>DB.aides.find(a=>a.id===id)).filter(Boolean);
  const dated=list.filter(a=>a.prochaine_date_limite&&days(a.prochaine_date_limite)>=0).sort((a,b)=>a.prochaine_date_limite.localeCompare(b.prochaine_date_limite)), other=list.filter(a=>!dated.includes(a));
  let html='',cur='';
  for(const a of dated){const d=parse(a.prochaine_date_limite),m=MOISL[d.getMonth()]+' '+d.getFullYear();if(m!==cur){html+=`<div class="month">${m.toUpperCase()}</div>`;cur=m;}const st=statusOf(a);
    html+=`<a class="calrow ${st.k==='bientot'?'urgent':''}" href="#aide-${a.id}"><div class="date"><b>${String(d.getDate()).padStart(2,'0')}</b><small>${MOIS[d.getMonth()]}</small></div><div style="min-width:0"><div class="org">${esc(orgName(a))}</div><div class="t">${esc(a.programme)}</div></div><div class="cd">${stHTML(st)}${barHTML(st)}</div></a>`;}
  if(other.length){html+=`<div class="month">SANS DATE FIXE</div>`+other.map(a=>{const st=statusOf(a);return `<a class="calrow" href="#aide-${a.id}"><div class="date"><b>—</b></div><div style="min-width:0"><div class="org">${esc(orgName(a))}</div><div class="t">${esc(a.programme)}</div></div><div class="cd">${stHTML(st)}</div></a>`;}).join('');}
  return `<div class="filet"><i></i><i></i><i></i><i></i><i></i></div><div class="app">${side('cal')}<main class="main wrap" style="max-width:none">
  <div class="sechead" style="margin:0"><div><span class="demo">${list.length} AIDE${list.length>1?'S':''} SUIVIE${list.length>1?'S':''} · EXEMPLE</span><h1>Mes dates limites</h1></div><button class="btn btn-secondary" id="ics">Ajouter à mon agenda</button></div>
  <div class="toggle"><button class="switch" role="switch" aria-checked="${S.rappel}" id="rappel" aria-label="Rappel par e-mail"></button><span style="flex:1">Rappel par e-mail 7 jours avant chaque date limite</span></div>
  <div id="icsmsg" class="ok" hidden>Dans l'appli, ce bouton ajoutera vos dates à Google Agenda ou Apple Calendrier.</div>
  ${html||'<div class="empty">Vous ne suivez aucune aide pour l\'instant. <a href="#resultats">Trouver des aides</a></div>'}</main></div>`;
}
function bindCal(){const r=document.getElementById('rappel');if(r)r.addEventListener('click',()=>{S.rappel=!S.rappel;save();r.setAttribute('aria-checked',S.rappel);});const i=document.getElementById('ics');if(i)i.addEventListener('click',()=>{document.getElementById('icsmsg').hidden=false;});}

/* ---------- Compte ---------- */
function vCompte(){
  const d=depObj(S.dep||'34');
  return nav('')+`<div class="wrap acct"><div><h1>Gardez vos aides et vos dates.</h1><ul><li>${gimic(C.nuit,18)}Suivez les aides qui vous intéressent, au même endroit.</li><li>${gimic(C.nuit,18)}Recevez un e-mail avant chaque date limite.</li><li>${gimic(C.nuit,18)}Bientôt : montez vos dossiers avec l'assistant.</li></ul></div>
  <form class="acard" id="acct"><h2 style="font-size:26px">Créer mon compte</h2><label for="mail">Votre adresse e-mail<input id="mail" type="email" required placeholder="nom@structure.fr"></label>
  <label for="depsel">Votre département<select id="depsel">${DB.departements.map(x=>`<option value="${x.code}" ${x.code===d.code?'selected':''}>${x.code} · ${esc(x.nom)}</option>`).join('')}</select></label>
  <button class="btn btn-primary" type="submit">Recevoir mon lien de connexion</button><div class="ok" id="sent" hidden>C'est un prototype : aucun e-mail n'est envoyé. Dans l'appli, vous recevriez ici votre lien de connexion.</div>
  <span class="muted" style="font-size:14px">Pas de mot de passe à retenir : on vous envoie un lien par e-mail.</span><hr style="border:0;border-top:1px solid var(--rule);width:100%"><span style="font-size:14px">Déjà sur Bòrd Pro ? Connectez-vous avec le même compte, vos informations vous suivent.</span></form></div>${footer()}`;
}
function bindCompte(){const f=document.getElementById('acct');if(f)f.addEventListener('submit',e=>{e.preventDefault();S.dep=f.querySelector('#depsel').value;save();document.getElementById('sent').hidden=false;});}

/* ---------- Dossiers : modèle ---------- */
const eur=n=>new Intl.NumberFormat('fr-FR',{minimumFractionDigits:Number.isInteger(Math.round(n*100)/100)?0:2,maximumFractionDigits:2}).format(n).replace(/\u202f/g,'\u00a0')+'\u00a0€';
const cents=n=>Math.round((Number(n)||0)*100);
const MK=l=>`[À COMPLÉTER : ${l}]`;
const G_REGION=[
 {id:'equipe',titre:'L\'équipe et son parcours',min:700,aide:'Qui porte le projet et ce que l\'équipe a déjà créé et diffusé.',crit:'Niveau de reconnaissance de l\'équipe (régional, national, international) et repérage de ses projets précédents. La Région ne soutient pas une première création : l\'équipe doit avoir déjà créé et diffusé un spectacle, avec au moins 3 représentations d\'une création antérieure dans les réseaux professionnels de la région ces 4 dernières années (1 pour une équipe émergente).',qs:[['nom','Nom de la compagnie ou de l\'ensemble'],['annee','Année de création'],['membres','Les artistes et leur rôle'],['parcours','Créations précédentes et où elles ont été jouées'],['reconnaissance','Soutiens, résidences ou labels déjà obtenus']]},
 {id:'projet',titre:'Le projet artistique',min:900,aide:'Le propos, la forme et ce qui rend ce projet singulier.',crit:'Projet artistiquement affirmé et singulier, dans les écritures et formes contemporaines. Place du projet dans la création régionale et nationale : recherche, partis pris, interprétation, collaborations, capacité de renouvellement.',qs:[['titre','Titre du spectacle'],['propos','De quoi parle-t-il, en une ou deux phrases ?'],['forme','Forme : durée, nombre d\'interprètes, jauge, public'],['demarche','Votre démarche : partis pris, écriture, collaborations']]},
 {id:'calendrier',titre:'Calendrier de création et diffusion',min:500,aide:'Résidences, première confirmée, représentations prévues.',crit:'Première représentation dans les 2 ans suivant le dépôt, confirmée par un contrat (cession, engagement direct ; coréalisation possible pour une équipe émergente). Diffusion prévisionnelle : au moins 4 représentations dont 2 en Occitanie pour une création (2 dont 1 pour une émergente), 6 dont 3 pour une reprise. Dynamique de diffusion sur 4 ans, en région et hors région, dans des lieux identifiés.',qs:[['residences','Résidences : lieux et dates'],['premiere','Première : date, lieu, type de contrat'],['dates','Représentations prévues, dont en Occitanie'],['diffusion','Perspectives de diffusion hors région']]},
 {id:'economie',titre:'Économie et partenaires',min:500,aide:'Qui coproduit, qui finance, comment l\'équipe est payée.',crit:'Partenariat confirmé avec un opérateur culturel professionnel en région (apport en production, hors valorisation). Budget réaliste au regard des créations précédentes et de la structure. Autres financeurs publics présents (Ville, Département, intercommunalité, État) et sociétés civiles (Adami, Spedidam, CNM). Rémunération de l\'équipe artistique et technique pendant les répétitions.',qs:[['coprod','Coproducteurs en région et leur apport'],['publics','Autres financeurs publics sollicités ou acquis'],['civiles','Sociétés civiles sollicitées (Adami, Spedidam, CNM…)'],['remuneration','Comment l\'équipe est rémunérée pendant les répétitions']]},
 {id:'publics',titre:'Publics et actions culturelles',min:400,aide:'Les rencontres avec les publics, la jeunesse, la communication.',crit:'Implication auprès des publics, en particulier la jeunesse ; actions artistiques et culturelles autour de la création ; moyens de diffusion et de communication.',qs:[['actions','Actions avec les publics autour du spectacle'],['jeunesse','Actions avec la jeunesse ou les scolaires'],['communication','Moyens de communication et de diffusion']]},
 {id:'engagements',titre:'Écoresponsabilité et égalité',min:300,aide:'Vos engagements concrets, la Région les regarde.',crit:'Dimension écoresponsable du projet (déplacements, décor, consommation). Égalité femmes-hommes dans l\'écriture, la mise en scène et la distribution.',qs:[['eco','Mesures écoresponsables concrètes'],['egalite','Répartition femmes-hommes : écriture, mise en scène, plateau']]},
 {id:'territoire',titre:'Ancrage en Occitanie',min:300,aide:'Où l\'équipe travaille et avec qui, dans la région.',crit:'Implantation territoriale de l\'équipe et contribution à un aménagement équilibré du territoire régional.',qs:[['lieux','Communes ou lieux de la région concernés'],['liens','Liens durables avec des lieux ou des habitants']]}
];
const G_DEFAULT=[
 {id:'structure',titre:'Présentation de la structure',min:500,aide:'Qui vous êtes, depuis quand.',crit:'Présentation claire et factuelle de la structure porteuse.',qs:[['nom','Nom de la structure'],['annee','Année de création'],['activite','Votre activité en deux phrases']]},
 {id:'projet',titre:'Le projet',min:800,aide:'Ce que vous voulez faire avec cette aide.',crit:'Objectifs du projet, adéquation avec l\'objet de l\'aide.',qs:[['quoi','Le projet en deux phrases'],['pourquoi','Pourquoi maintenant ?']]},
 {id:'calendrier',titre:'Calendrier',min:300,aide:'Les grandes étapes et leurs dates.',crit:'Étapes datées et réalistes.',qs:[['etapes','Étapes et dates']]},
 {id:'partenaires',titre:'Partenaires et financements',min:300,aide:'Qui vous soutient déjà.',crit:'Partenaires engagés et diversité des financements.',qs:[['partenaires','Partenaires et apports']]}
];
const grille=d=>d.aide==='REG-054'?G_REGION:G_DEFAULT;
const tplOf=(s,r)=>s.qs.map(([k,q])=>`${q} : ${r[k]?r[k].trim().replace(/([^.!?…])$/,'$1.'):MK(q.charAt(0).toLowerCase()+q.slice(1))}`).join('\n');
const COND_REGION=[
 ['c1','L\'équipe a déjà créé et diffusé un spectacle (pas de première création).'],
 ['c2','Une création antérieure a fait 3 dates dans les réseaux professionnels de la région ces 4 dernières années (1 pour une équipe émergente).'],
 ['c3','La date de création est confirmée par un contrat : cession, engagement direct, ou coréalisation pour une équipe émergente.'],
 ['c4','Au moins 4 représentations sont prévues, dont 2 en Occitanie (2 dont 1 pour une équipe émergente).'],
 ['c5','Un partenaire de production en région est confirmé, avec un apport en production.'],
 ['c6','L\'équipe artistique et technique est rémunérée pendant les répétitions.'],
 ['c7','La structure n\'a pas reçu cette aide l\'an dernier.']];
const condOf=d=>d.aide==='REG-054'?COND_REGION:[];
const PIECES_REGION=['Statuts de la structure','RIB','Licence d\'entrepreneur de spectacles','Contrat confirmant la date de création (cession, engagement ou coréalisation)','Justificatifs de diffusion de la création précédente','Lettre d\'engagement du partenaire de production en région','Présentation du projet','Budget prévisionnel'];
function seedDossier(){return {id:'d1',aide:'REG-054',titre:'Création 2027 · « Les Veilleurs »',statut:'en cours',maj:'2026-11-22',
 rep:{equipe:{nom:'La Compagnie Exemple',annee:'2016',membres:'quatre musiciennes et musiciens et une metteuse en scène'},projet:{titre:'Les Veilleurs',propos:'raconte une nuit de garde dans un phare, en musique et en chansons',forme:'1 h 10, avec quatre interprètes au plateau, pour une jauge de 300 places',public:'à tous, dès 10 ans'}},
 txt:{equipe:{t:'La Compagnie Exemple, créée en 2016, réunit quatre musiciennes et musiciens et une metteuse en scène. L\'équipe s\'est fait connaître avec [À COMPLÉTER : deux ou trois réalisations].',by:'Paratge, accepté par vous'},
      projet:{t:'« Les Veilleurs » raconte une nuit de garde dans un phare, en musique et en chansons. Le spectacle dure 1 h 10, avec quatre interprètes au plateau, pour une jauge de 300 places. Il s\'adresse à tous, dès 10 ans.\n\nPour mener cette création, nous sollicitons 8 000 € auprès de la Région Occitanie.',by:'vous'}},
 budget:{charges:[{l:'Cachets de répétition (4 artistes)',q:48,u:180},{l:'Charges sociales employeur',q:1,u:5200},{l:'Régisseur, création lumière',q:10,u:220},{l:'Création lumière (forfait)',q:1,u:2500},{l:'Décor et accessoires',q:1,u:1800},{l:'Déplacements en résidence',q:4,u:350},{l:'Communication',q:1,u:900},{l:'Administration de production',q:1,u:1500}],
   produits:[{l:'Région Occitanie · aide demandée',m:9000,s:'sollicité',aide:true},{l:'Coproduction · Théâtre partenaire',m:6000,s:'confirmé'},{l:'Adami · aide au spectacle',m:5000,s:'sollicité'},{l:'Fonds propres de la compagnie',m:3000,s:'confirmé'}]},
 pieces:{'Statuts de la structure':'ok','RIB':'ok','Licence d\'entrepreneur de spectacles':'ok','Contrat confirmant la date de création (cession, engagement ou coréalisation)':'ok'},cond:{c1:'ok',c2:'ok',c3:'ok',c5:'ok',c6:'ok',c7:'ok'}};}
if(!S.dossiers||!S.dossiers.length){S.dossiers=[seedDossier()];}
const getD=id=>S.dossiers.find(d=>d.id===id);
function newDossier(aideId){const a=DB.aides.find(x=>x.id===aideId);if(!a)return 'd1';const ex=S.dossiers.find(d=>d.aide===aideId&&d.statut!=='déposé');if(ex)return ex.id;
 const id='d'+(Math.max(0,...S.dossiers.map(d=>+d.id.slice(1)||0))+1);
 S.dossiers.push({id,aide:aideId,titre:'Nouveau dossier · '+a.programme.slice(0,40),statut:'en cours',maj:new Date().toISOString().slice(0,10),rep:{},txt:{},budget:{charges:[{l:'',q:1,u:0}],produits:[{l:orgName(a)+' · aide demandée',m:0,s:'sollicité',aide:true}]},pieces:{}});
 if(!S.suivies.includes(aideId))S.suivies.push(aideId);save();return id;}
function piecesOf(d){const a=DB.aides.find(x=>x.id===d.aide)||{};
 const base=d.aide==='REG-054'?PIECES_REGION:(a.pieces_a_fournir||'').replace(/^.*?:\s*/,'').replace(/\)\.?$/,'').split(/[,;]\s*/).map(s=>s.trim()).filter(s=>s.length>2&&s.length<90).map(s=>s.charAt(0).toUpperCase()+s.slice(1));
 return base.map(l=>{const low=l.toLowerCase();const auto=low.includes('budget')?'budget':(low.includes('présentation')||low.includes('projet'))?'redaction':null;return {l,auto};});}
function budgetTotals(d){const ch=d.budget.charges.reduce((s,x)=>s+Math.round(cents(x.q)*cents(x.u)/100),0),pr=d.budget.produits.reduce((s,x)=>s+cents(x.m),0),aide=d.budget.produits.filter(x=>x.aide).reduce((s,x)=>s+cents(x.m),0),propres=d.budget.produits.filter(x=>/propre/i.test(x.l)).reduce((s,x)=>s+cents(x.m),0),conf=d.budget.produits.filter(x=>x.s==='confirmé').reduce((s,x)=>s+cents(x.m),0);return {ch:ch/100,pr:pr/100,ecart:(pr-ch)/100,aide:aide/100,propres:propres/100,conf:conf/100};}
function radarOf(d){const a=DB.aides.find(x=>x.id===d.aide)||{},out=[],G=grille(d),bt=budgetTotals(d);
 for(const s of G){const t=(d.txt[s.id]||{}).t||'';const n=(t.match(/\[À COMPLÉTER[^\]]*\]/g)||[]).length;
  if(!t.trim())out.push({niv:'bloquant',txt:`La section « ${s.titre} » est vide.`,why:'Une section vide rend souvent le dossier irrecevable.',go:`redaction-${s.id}`});
  else if(n)out.push({niv:'bloquant',txt:`« ${s.titre} » : ${n} élément${n>1?'s':''} à compléter.`,why:'Paratge a laissé une marque là où il lui manquait une information.',go:`redaction-${s.id}`});
  else if(t.length<s.min)out.push({niv:'finition',txt:`« ${s.titre} » est un peu courte (${t.length} caractères).`,why:`Visez au moins ${s.min} caractères pour être convaincant.`,go:`redaction-${s.id}`});}
 if(Math.abs(bt.ecart)>=0.005)out.push({niv:'bloquant',txt:`Le budget n'est pas équilibré : écart de ${eur(Math.abs(bt.ecart))}.`,why:`Charges ${eur(bt.ch)}, produits ${eur(bt.pr)}. Les deux totaux doivent être identiques au centime.`,go:'budget'});
 const plafond=Number(a.montant_max_eur)||0;if(plafond&&bt.aide>plafond)out.push({niv:'bloquant',txt:`L'aide demandée (${eur(bt.aide)}) dépasse le plafond de ${eur(plafond)}.`,why:'Le financeur ne peut pas accorder plus que son plafond.',go:'budget'});
 if(bt.ch>0&&bt.aide/bt.ch>0.5)out.push({niv:'couteux',txt:`L'aide demandée pèse ${Math.round(100*bt.aide/bt.ch)} % du budget.`,why:'Les financeurs regardent la diversité des financements. Au-delà de 50 %, le projet paraît fragile.',go:'budget'});
 if(bt.pr>0&&bt.conf===0)out.push({niv:'couteux',txt:'Aucune recette n\'est confirmée.',why:'Au moins un apport confirmé (coproduction, fonds propres) rassure le financeur.',go:'budget'});
 const amounts=new Set([...d.budget.charges.map(x=>Math.round(cents(x.q)*cents(x.u)/100)),...d.budget.produits.map(x=>cents(x.m)),cents(bt.ch),cents(bt.pr)]);
 for(const s of G){const t=(d.txt[s.id]||{}).t||'';for(const m of t.matchAll(/(\d[\d\s  .]*\d|\d)\s?€/g)){const v=cents(m[1].replace(/[\s  .]/g,''));if(!amounts.has(v))out.push({niv:'couteux',txt:`« ${s.titre} » cite ${m[0].trim()}, un montant absent du budget.`,why:`Le budget demande ${eur(bt.aide)} au financeur. Quand deux chiffres se contredisent, dites-moi lequel est juste.`,go:`redaction-${s.id}`});}}
 for(const [k,l] of condOf(d)){if((d.cond||{})[k]!=='ok')out.push({niv:'bloquant',txt:`Condition de la Région non confirmée : ${l.replace(/\.$/,'')}.`,why:'Sans elle, le dossier est irrecevable. Cochez-la dans l\'onglet Pièces quand c\'est le cas.',go:'pieces'});}
 if(d.aide==='REG-054'){const pub=d.budget.produits.some(x=>!x.aide&&/ville|commune|départ|depart|drac|état|etat|epci|communaut|agglo|métropole|metropole|intercommun/i.test(x.l));if(!pub)out.push({niv:'bloquant',txt:'Le budget ne montre pas d\'autre financeur public.',why:'La Région demande d\'autres financeurs publics : Ville, Département, intercommunalité ou État.',go:'budget'});
  const ind=d.budget.charges.filter(x=>/administr|communic|frais g/i.test(x.l)).reduce((t,x)=>t+Math.round(cents(x.q)*cents(x.u)/100),0)/100;if(bt.ch>0&&ind/bt.ch>0.25)out.push({niv:'bloquant',txt:`Les frais de fonctionnement (administration, communication) font ${Math.round(100*ind/bt.ch)} % du budget.`,why:'La Région les plafonne à 25 % des dépenses retenues.',go:'budget'});}
 for(const p of piecesOf(d)){if(p.auto)continue;if(d.pieces[p.l]!=='ok')out.push({niv:'bloquant',txt:`Pièce manquante : ${p.l}.`,why:'Ajoutez-la dans l\'onglet Pièces.',go:'pieces'});}
 const n=days(a.prochaine_date_limite);if(n!=null&&n>=0&&n<=10)out.push({niv:'couteux',txt:`Il reste ${n} jour${n>1?'s':''} avant la date limite.`,why:'Gardez une journée pour le dépôt en ligne : les portails ralentissent souvent la veille.',go:'export'});
 return out;}
function pctOf(d){const G=grille(d),bt=budgetTotals(d),a=DB.aides.find(x=>x.id===d.aide)||{},P=piecesOf(d).filter(p=>!p.auto),K=condOf(d);let tot=G.length+2+P.length+K.length,ok=0;for(const [k] of K)if((d.cond||{})[k]==='ok')ok++;
 for(const s of G){const t=(d.txt[s.id]||{}).t||'';if(t.trim()&&!/\[À COMPLÉTER/.test(t))ok++;}
 if(Math.abs(bt.ecart)<0.005&&bt.ch>0)ok++;const pl=Number(a.montant_max_eur)||0;if(!pl||bt.aide<=pl)ok++;for(const p of P)if(d.pieces[p.l]==='ok')ok++;return Math.round(100*ok/tot);}
const radarIcon=`<svg width="22" height="22" viewBox="0 0 22 22" aria-hidden="true"><circle cx="11" cy="11" r="10" fill="none" stroke="#10243F" stroke-width="1.6"/><circle cx="11" cy="11" r="5.5" fill="none" stroke="#10243F" stroke-width="1.6"/><circle cx="11" cy="11" r="1.8" fill="#FF695B"/><path d="M11 11L18 4" stroke="#10243F" stroke-width="1.6"/></svg>`;
const paratgeIcon=h=>gimic(C.nuit,h).replace('class="gimic"','class="gimic" style="transform:scaleY(-1)"');

/* ---------- IA : le compte Claude de l'utilisateur ---------- */
let AI=null,AI_OFF=false,AI_READY=false,PROPOSAL=null;
(async()=>{try{if(window.claude&&claude.use)AI=await claude.use('sample');}catch(e){AI=null;}AI_READY=true;setTimeout(()=>{if(/^#dossier-/.test(location.hash)&&!PROPOSAL)render(true);},0);})();
const aiOn=()=>!!AI&&!AI_OFF;
const AI_STOP=new Set(['not_granted','sampling_disabled','not_declared','capability_disabled','capability_removed']);
function aiMsg(e){const c=e&&e.code;if(AI_STOP.has(c))return 'L\'IA n\'est pas autorisée ici. Paratge repasse en mode modèle à trous.';if(c==='rate_limited')return 'Trop de demandes pour le moment. Réessayez dans un instant.';if(c==='session_expired')return 'Reconnectez-vous à Claude, puis réessayez.';if(c==='refused')return 'L\'IA a refusé cette demande. Reformulez vos réponses.';if(c==='cancelled')return '';return 'L\'IA n\'a pas répondu. Réessayez.';}
function paratgePrompt(d,s){const a=DB.aides.find(x=>x.id===d.aide)||{},G=grille(d),bt=budgetTotals(d),r=d.rep[s.id]||{},cur=(d.txt[s.id]||{}).t||'';
 const reps=s.qs.map(([k,q])=>`- ${q} : ${r[k]||'(pas de réponse)'}`).join('\n');
 const ctx=G.filter(x=>x.id!==s.id).map(x=>`- ${x.titre} : ${((d.txt[x.id]||{}).t||'(vide)').slice(0,700)}`).join('\n');
 return `Tu es Paratge, l'assistant de rédaction de Bòrd Sub, pour les dossiers de subvention du spectacle vivant en France.
Rédige la section « ${s.titre} » du dossier « ${d.titre} », demandé à : ${orgName(a)}, ${a.programme||''}.
Ce que le financeur regarde dans cette section : ${s.crit}

Règles :
1. Français, « nous » pour la structure, ton professionnel et concret, sans superlatifs creux.
2. N'invente aucun fait, nom, date, lieu, chiffre ni partenaire. Utilise seulement les réponses et le contexte ci-dessous.
3. Si une information utile au financeur manque, écris à sa place une marque exactement de la forme [À COMPLÉTER : ce qui manque].
4. Pour un montant, reprends seulement ceux du budget ci-dessous. Ne fais aucun calcul.
5. Environ ${s.min} à ${s.min+500} caractères, en paragraphes. Pas de titre, pas de markdown, pas de liste à puces.
6. Réponds uniquement par le texte de la section.

Réponses de la personne pour cette section :
${reps}
${cur.trim()?`\nTexte actuel de la section (garde ses faits, améliore la rédaction) :\n${cur.slice(0,3000)}\n`:''}
Budget calculé par l'appli : charges ${eur(bt.ch)}, produits ${eur(bt.pr)}, aide demandée à ce financeur ${eur(bt.aide)}, recettes confirmées ${eur(bt.conf)}.

Autres sections du dossier (contexte, ne pas recopier) :
${ctx}`;}
function relecturePrompt(d){const a=DB.aides.find(x=>x.id===d.aide)||{},G=grille(d),bt=budgetTotals(d);
 return `Tu es Radar, le relecteur de Bòrd Sub. Tu relis un dossier de subvention comme le ferait le service instructeur, et tu signales ce qui peut coûter des points. Tu ne réécris rien.
Financeur : ${orgName(a)}, ${a.programme||''}.
Grille et critères :
${G.map(x=>`- ${x.titre} : ${x.crit}`).join('\n')}

Dossier :
${G.map(x=>`### ${x.titre}\n${((d.txt[x.id]||{}).t||'(vide)').slice(0,2500)}`).join('\n\n')}

Budget calculé par l'appli : charges ${eur(bt.ch)}, produits ${eur(bt.pr)}, aide demandée ${eur(bt.aide)}.

Ignore les sections vides et les marques [À COMPLÉTER], déjà signalées ailleurs. Cherche plutôt : critère du financeur non traité, affirmation vague sans preuve, contradiction entre sections, phrase confuse.
Réponds uniquement par un tableau JSON de 6 objets au plus, du plus important au moins important :
[{"niveau":"couteux" ou "finition","section":"titre exact de la section","remarque":"ce qui coince, en une phrase","conseil":"quoi faire, en une phrase"}]`;}
const RELEC={};

/* ---------- Dossiers : vues ---------- */
function stPill(d){const b=radarOf(d).filter(x=>x.niv==='bloquant').length;if(d.statut==='déposé')return '<span class="pillst sent">DÉPOSÉ</span>';return b?`<span class="pillst block">${b} BLOQUANT${b>1?'S':''}</span>`:'<span class="pillst ready">PRÊT À DÉPOSER</span>';}
function vDossiers(){
 const sv=S.suivies.map(id=>DB.aides.find(a=>a.id===id)).filter(a=>a&&statusOf(a).k!=='fermee');
 return `<div class="filet"><i></i><i></i><i></i><i></i><i></i></div><div class="app">${side('dos')}<main class="main wrap" style="max-width:none">
 <div class="sechead" style="margin:0"><div><span class="demo">${S.dossiers.length} DOSSIER${S.dossiers.length>1?'S':''} · LE PREMIER EST UN EXEMPLE</span><h1>Mes dossiers</h1></div></div>
 <form class="newd" id="newd"><b>Monter un nouveau dossier pour</b><select id="newsel" aria-label="Aide">${sv.map(a=>`<option value="${a.id}">${esc(orgName(a))} · ${esc(a.programme.slice(0,60))}</option>`).join('')}</select><button class="btn btn-primary" type="submit">Commencer →</button></form>
 <div class="dgrid">${S.dossiers.map(d=>{const a=DB.aides.find(x=>x.id===d.aide)||{},st=statusOf(a),p=pctOf(d);return `<a class="dcard" href="#dossier-${d.id}-redaction"><div style="min-width:0;display:flex;flex-direction:column;gap:6px"><span class="org">${esc(orgName(a))}</span><b style="font-size:19px">${esc(d.titre)}</b><span class="muted" style="font-size:14px">${esc(a.programme||'')}</span><span>${stPill(d)}</span></div>
 <div class="jauge"><span class="demo">COMPLÉTUDE</span><b>${p} %</b><div class="bar"><i style="width:${p}%"></i></div></div><div class="cd" style="align-items:flex-start"><span class="demo">${a.prochaine_date_limite?'FERME LE '+fmtDate(a.prochaine_date_limite):'SANS DATE FIXE'}</span>${stHTML(st)}${barHTML(st)}</div></a>`;}).join('')}</div>
 <button class="linkbtn" id="reset" style="align-self:flex-start;color:var(--sec);font-weight:500;font-size:14px">Remettre l'exemple à zéro</button></main></div>`;}
function bindDossiers(){const f=document.getElementById('newd');if(f)f.addEventListener('submit',e=>{e.preventDefault();const v=f.querySelector('#newsel').value;if(v)location.hash='nouveau-'+v;});
 const r=document.getElementById('reset');if(r)r.addEventListener('click',()=>{S.dossiers=[seedDossier(),...S.dossiers.filter(d=>d.id!=='d1')];save();render();});}

function vDossier(id,tab,sec){
 const d=getD(id);if(!d)return `<div class="wrap"><p class="empty" style="margin-top:40px">Dossier introuvable. <a href="#dossiers">Mes dossiers</a></p></div>`;
 const a=DB.aides.find(x=>x.id===d.aide)||{},st=statusOf(a),p=pctOf(d),R=radarOf(d),nb=R.filter(x=>x.niv==='bloquant').length,bt=budgetTotals(d);
 const T=[['redaction','Rédaction',''],['budget','Budget',Math.abs(bt.ecart)<0.005&&bt.ch>0?'<span class="n ok">✓</span>':'<span class="n">!</span>'],['pieces','Pièces',''],['radar','Vérification',`<span class="n ${nb?'':'ok'}">${nb||'✓'}</span>`],['export','Export','']];
 let body='';
 if(tab==='budget')body=tBudget(d);else if(tab==='pieces')body=tPieces(d);else if(tab==='radar')body=tRadar(d,R);else if(tab==='export')body=tExport(d,R);else body=tRedac(d,sec);
 return `<div class="filet"><i></i><i></i><i></i><i></i><i></i></div><div class="app">${side('dos')}<main class="main wrap" style="max-width:none">
 <a href="#dossiers" class="muted" style="font-size:14px;text-decoration:none">← Mes dossiers</a>
 <div class="dhead"><div style="display:flex;flex-direction:column;gap:6px;min-width:0"><span class="org">${esc(orgName(a))} · ${esc(a.programme||'')}</span><h1>${esc(d.titre)}</h1></div>
 <div class="dmeta"><div class="jauge" style="width:180px"><span class="demo">COMPLÉTUDE ${p} %</span><div class="bar"><i style="width:${p}%"></i></div></div><div class="cd" style="align-items:flex-start"><span class="demo">${a.prochaine_date_limite?'FERME LE '+fmtDate(a.prochaine_date_limite):'SANS DATE FIXE'}</span>${stHTML(st)}</div>${stPill(d)}</div></div>
 <nav class="tabs" aria-label="Étapes du dossier">${T.map(([k,l,n])=>`<a href="#dossier-${d.id}-${k}" class="${tab===k?'on':''}">${l}${n}</a>`).join('')}</nav>${body}</main></div>`;}

function hl(t){return esc(t).replace(/\[À COMPLÉTER[^\]]*\]/g,m=>`<span class="hlmark">${m}</span>`).replace(/\n/g,'<br>');}
function tRedac(d,sec){
 const G=grille(d),s=G.find(x=>x.id===sec)||G[0],tx=d.txt[s.id]||{t:'',by:''},r=d.rep[s.id]||{},marks=(tx.t.match(/\[À COMPLÉTER[^\]]*\]/g)||[]);
 const P=PROPOSAL&&PROPOSAL.d===d.id&&PROPOSAL.s===s.id?PROPOSAL:null;
 return `<div class="redac"><nav class="secnav" aria-label="Sections">${G.map(x=>{const t=(d.txt[x.id]||{}).t||'';const c=!t.trim()?'':/\[À COMPLÉTER/.test(t)?'part':'ok';return `<a href="#dossier-${d.id}-redaction-${x.id}" class="${x.id===s.id?'on':''}"><span class="dotst ${c}"></span>${esc(x.titre)}</a>`;}).join('')}
 <span class="demo" style="padding:10px 12px">${d.aide==='REG-054'?'GRILLE ÉTABLIE D\'APRÈS LES CRITÈRES DE SÉLECTION DE LA RÉGION':'GRILLE GÉNÉRIQUE, À ADAPTER AU FINANCEUR'}</span></nav>
 <div class="editor"><h2>${esc(s.titre)}</h2><p class="muted" style="margin:0">${esc(s.aide)}</p>
 <textarea id="ed" aria-label="Texte de la section">${esc(tx.t)}</textarea>
 <div class="edfoot"><span><span id="cnt" class="mono">${tx.t.length}</span> caractères · visez ${s.min} et plus</span><span class="who">${tx.by?'ÉCRIT PAR : '+esc(tx.by).toUpperCase():''}</span></div>
 ${marks.length?`<div class="marks">${marks.map(m=>`<span class="mark">${esc(m.replace('[À COMPLÉTER : ','').replace(']',''))}</span>`).join('')}</div><p class="muted" style="margin:0;font-size:14px">Remplacez ces marques par l'information, ou répondez aux questions de Paratge.</p>`:''}</div>
 <aside class="paratge"><div class="ph">${paratgeIcon(24)}<div><b>Paratge</b><div class="demo">L'ASSISTANT DE RÉDACTION</div></div></div>
 <p style="margin:0;font-size:14px" class="muted">Répondez avec des faits. Je rédige, vous décidez. Je n'invente rien : ce qui manque reste marqué.</p>
 ${s.qs.map(([k,q])=>`<label for="q-${k}">${esc(q)}<textarea id="q-${k}" data-q="${k}">${esc(r[k]||'')}</textarea></label>`).join('')}
 <button class="btn btn-secondary" id="gen" ${P&&P.loading?'disabled':''}>${(d.txt[s.id]||{}).t?'Proposer une nouvelle version':'Proposer un texte'}</button>
 ${P?`<div class="proposal"><span class="demo">${P.loading?'PARATGE RÉDIGE…':P.ai?'PROPOSITION DE PARATGE':'PROPOSITION DE PARATGE · MODÈLE À TROUS'}</span><div id="propt">${P.t?hl(P.t):'<span class="muted">Paratge lit vos réponses et la grille du financeur…</span>'}</div>${P.err?`<p class="aierr">${esc(P.err)}</p>`:''}<div class="acts">${P.loading?'<button class="btn btn-secondary" id="stop">Arrêter</button>':P.t?'<button class="btn btn-primary" id="acc">Accepter</button><button class="btn btn-secondary" id="mod">Modifier</button><button class="btn btn-secondary" id="ref">Refuser</button>':'<button class="btn btn-secondary" id="ref">Fermer</button>'}</div></div>`:''}
 <div class="aistate"><span class="aidot ${aiOn()?'on':''}"></span><span>${aiOn()?'IA connectée : votre compte Claude. Paratge rédige selon la grille du financeur.':AI_READY?'IA non connectée : Paratge assemble un modèle à trous avec vos réponses.':'Connexion à l\'IA…'}</span></div></aside></div>`;}

function tBudget(d){const bt=budgetTotals(d),a=DB.aides.find(x=>x.id===d.aide)||{},pl=Number(a.montant_max_eur)||0,ok=Math.abs(bt.ecart)<0.005&&bt.ch>0;
 return `<div class="budget"><div style="display:flex;flex-direction:column;gap:14px;min-width:0">
 <h2 style="font-size:22px">Charges</h2><div class="btable"><table><thead><tr><th style="width:44%">POSTE</th><th>QUANTITÉ</th><th>COÛT UNITAIRE</th><th style="text-align:right">TOTAL</th><th></th></tr></thead><tbody>
 ${d.budget.charges.map((x,i)=>`<tr><td><input data-c="${i}" data-f="l" value="${esc(x.l)}" placeholder="Ex. cachets de répétition" aria-label="Poste"></td><td><input class="num" data-c="${i}" data-f="q" inputmode="decimal" value="${esc(x.q)}" aria-label="Quantité"></td><td><input class="num" data-c="${i}" data-f="u" inputmode="decimal" value="${esc(x.u)}" aria-label="Coût unitaire"></td><td class="tot">${eur(Math.round(cents(x.q)*cents(x.u)/100)/100)}</td><td><button class="del" data-delc="${i}" aria-label="Supprimer la ligne">×</button></td></tr>`).join('')}
 </tbody><tfoot><tr><td colspan="3">TOTAL DES CHARGES</td><td style="text-align:right">${eur(bt.ch)}</td><td></td></tr></tfoot></table></div><button class="addl" id="addc">+ Ajouter une charge</button>
 <h2 style="font-size:22px;margin-top:10px">Produits</h2><div class="btable"><table><thead><tr><th style="width:50%">FINANCEUR OU RECETTE</th><th>STATUT</th><th style="text-align:right">MONTANT</th><th></th></tr></thead><tbody>
 ${d.budget.produits.map((x,i)=>`<tr class="${x.aide?'aide':''}"><td><input data-p="${i}" data-f="l" value="${esc(x.l)}" aria-label="Financeur"></td><td><select data-p="${i}" data-f="s" aria-label="Statut">${['confirmé','sollicité','escompté'].map(o=>`<option ${o===x.s?'selected':''}>${o}</option>`).join('')}</select></td><td><input class="num" data-p="${i}" data-f="m" inputmode="decimal" value="${esc(x.m)}" aria-label="Montant"></td><td>${x.aide?'':`<button class="del" data-delp="${i}" aria-label="Supprimer la ligne">×</button>`}</td></tr>`).join('')}
 </tbody><tfoot><tr><td colspan="2">TOTAL DES PRODUITS</td><td style="text-align:right">${eur(bt.pr)}</td><td></td></tr></tfoot></table></div><button class="addl" id="addp">+ Ajouter un produit</button></div>
 <aside class="bsum"><div style="display:flex;gap:10px;align-items:center">${paratgeIcon(22)}<b style="font-family:var(--f-display);font-weight:800;font-stretch:112%;letter-spacing:-.04em;font-size:20px">Équilibre</b></div>
 <div class="row"><span>Total des charges</span><b>${eur(bt.ch)}</b></div><div class="row"><span>Total des produits</span><b>${eur(bt.pr)}</b></div>
 <div class="verdict ${ok?'ok':'ko'}">${ok?'Budget équilibré au centime.':bt.ch===0?'Saisissez vos charges.':`Écart de ${eur(Math.abs(bt.ecart))} : il manque ${bt.ecart<0?'des produits':'des charges'}.`}</div>
 <hr style="border:0;border-top:1px solid var(--rule);width:100%"><div class="row"><span>Aide demandée</span><b>${eur(bt.aide)}</b></div>
 <div class="row"><span>Part dans le budget</span><b>${bt.ch?Math.round(100*bt.aide/bt.ch):0} %</b></div>
 ${pl?`<div class="row"><span>Plafond du dispositif</span><b>${eur(pl)}</b></div>${bt.aide>pl?'<div class="verdict ko">Au-dessus du plafond.</div>':''}`:''}
 <div class="row"><span>Recettes confirmées</span><b>${eur(bt.conf)}</b></div>
 <p class="demo" style="margin:0">TOUS LES TOTAUX SONT CALCULÉS PAR L'APPLI, JAMAIS DE TÊTE PAR L'IA.</p></aside></div>`;}

function tPieces(d){const P=piecesOf(d),bt=budgetTotals(d),G=grille(d),redOk=G.every(s=>{const t=(d.txt[s.id]||{}).t||'';return t.trim()&&!/\[À COMPLÉTER/.test(t);});
 const K=condOf(d),cd=d.cond||{};
 const condH=K.length?`<h2 style="font-size:22px">Conditions de la Région</h2><p class="muted" style="margin:0">Cochez chaque condition remplie. Il faut toutes les remplir pour que le dossier soit recevable.</p><div class="plist">${K.map(([k,l])=>{const ok=cd[k]==='ok';return `<div class="prow"><div><b style="font-weight:500">${esc(l)}</b></div><span class="st ${ok?'ouverte':'fermee'}">${ok?ICON.ouverte+'Remplie':ICON.fermee+'À confirmer'}</span><button class="btn btn-secondary" data-cond="${k}">${ok?'Décocher':'C\'est le cas'}</button></div>`;}).join('')}</div><h2 style="font-size:22px;margin-top:10px">Pièces à fournir</h2>`:'';
 return `${condH}<p class="muted" style="margin:0">Les pièces demandées par ce financeur. Celles que Bòrd Sub fabrique se cochent toutes seules.</p><div class="plist">${P.map(p=>{
 if(p.auto){const ok=p.auto==='budget'?Math.abs(bt.ecart)<0.005&&bt.ch>0:redOk;return `<div class="prow"><div><b>${esc(p.l)}</b><div class="muted" style="font-size:14px">Fabriquée par Bòrd Sub depuis ${p.auto==='budget'?'l\'onglet Budget':'la rédaction'}.</div></div><span class="st ${ok?'ouverte':'bientot'}">${ok?ICON.ouverte+'Prête':ICON.bientot+'À terminer'}</span><a class="btn btn-secondary" href="#dossier-${d.id}-${p.auto==='budget'?'budget':'redaction'}">Ouvrir</a></div>`;}
 const ok=d.pieces[p.l]==='ok';return `<div class="prow"><div><b>${esc(p.l)}</b><div class="muted" style="font-size:14px">${ok?'Dans votre coffre de pièces.':'À ajouter.'}</div></div><span class="st ${ok?'ouverte':'fermee'}">${ok?ICON.ouverte+'Fournie':ICON.fermee+'Manquante'}</span><button class="btn btn-secondary" data-piece="${esc(p.l)}">${ok?'Retirer':'Ajouter le fichier'}</button></div>`;}).join('')}</div>
 <p class="demo">${d.aide==='REG-054'?'LISTE ÉTABLIE D\'APRÈS LA PAGE OFFICIELLE DE LA RÉGION (MAJ 06/10/2026). LE RÈGLEMENT PDF FAIT FOI. ':''}PROTOTYPE : « AJOUTER LE FICHIER » COCHE LA PIÈCE SANS ENVOYER DE FICHIER.</p>`;}

function tRadar(d,R){const groups=[['bloquant','Bloquant','À corriger avant le dépôt'],['couteux','Coûteux','Peut faire perdre des points'],['finition','Finition','Pour un dossier plus convaincant']];
 return `<div style="display:flex;gap:12px;align-items:center">${radarIcon}<div><b style="font-family:var(--f-display);font-weight:800;font-stretch:112%;letter-spacing:-.04em;font-size:22px">Radar · ce qui coince</b><div class="muted" style="font-size:14px">Radar relit tout le dossier et prévient. Il ne modifie rien.</div></div></div>
 ${(()=>{const L=RELEC[d.id];if(!aiOn()&&!L)return '';return `<div class="relec"><div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap"><div><b>Relecture approfondie</b><div class="muted" style="font-size:14px">Radar lit vos textes comme un instructeur, avec votre IA, et liste ce qui peut coûter des points.</div></div>${aiOn()?`<button class="btn btn-secondary" id="relec" ${L&&L.loading?'disabled':''}>${L&&L.loading?'Relecture en cours…':L&&L.items?'Relire à nouveau':'Lancer la relecture'}</button>`:''}</div>
 ${L&&L.err?`<p class="aierr">${esc(L.err)}</p>`:''}${L&&L.items?(L.items.length?L.items.map(x=>{const sx=grille(d).find(g=>g.titre===x.section);return `<div class="ritem ${x.niveau==='couteux'?'couteux':'finition'}"><div><b>${esc(x.section?x.section+' : ':'')}${esc(x.remarque)}</b><p>${esc(x.conseil)}</p></div>${sx?`<a class="btn btn-secondary" href="#dossier-${d.id}-redaction-${sx.id}">Corriger →</a>`:''}</div>`;}).join(''):'<p class="muted" style="margin:0">Radar n\'a rien relevé de plus.</p>'):''}</div>`;})()}
 <div class="radar">${groups.map(([k,l,s])=>{const it=R.filter(x=>x.niv===k);return `<div class="rgroup"><h2>${l} <span class="demo">${it.length} · ${s.toUpperCase()}</span></h2>${it.length?it.map(x=>`<div class="ritem ${k}"><div><b>${esc(x.txt)}</b><p>${esc(x.why)}</p></div><a class="btn btn-secondary" href="#dossier-${d.id}-${x.go}">Corriger →</a></div>`).join(''):'<p class="muted" style="margin:0">Rien à signaler.</p>'}</div>`;}).join('')}</div>`;}

function tExport(d,R){const nb=R.filter(x=>x.niv==='bloquant').length,a=DB.aides.find(x=>x.id===d.aide)||{};
 return `${nb?`<div class="verdict ko">Encore ${nb} point${nb>1?'s':''} bloquant${nb>1?'s':''}. <a href="#dossier-${d.id}-radar">Voir la vérification →</a></div>`:'<div class="verdict ok">Le dossier est complet. Vous pouvez le télécharger et le déposer.</div>'}
 <div class="exp"><div class="box"><b>Dossier rédigé</b><span class="muted" style="font-size:14px">Les sections dans l'ordre de la grille du financeur.</span><button class="btn btn-primary" data-exp ${nb?'disabled':''}>Télécharger (Word)</button></div>
 <div class="box"><b>Budget prévisionnel</b><span class="muted" style="font-size:14px">Charges et produits, équilibré, avec les statuts des recettes.</span><button class="btn btn-secondary" data-exp ${nb?'disabled':''}>Télécharger (tableur)</button></div>
 <div class="box"><b>Pack de dépôt</b><span class="muted" style="font-size:14px">Dossier, budget, liste des pièces prêtes, et le lien du portail.</span>${a.url_officielle?`<a class="btn btn-secondary" href="${esc(a.url_officielle)}" target="_blank" rel="noopener">Ouvrir le portail du financeur ↗</a>`:''}</div>
 <div class="box"><b>Après le dépôt</b><span class="muted" style="font-size:14px">Notez le dépôt pour suivre la réponse et le compte rendu à rendre.</span><button class="btn btn-secondary" id="depose">${d.statut==='déposé'?'Déposé le '+esc(d.depose||''):'Marquer comme déposé'}</button></div></div>
 <div class="ok" id="expmsg" hidden>Dans l'appli, le fichier se télécharge ici. Le prototype ne crée pas de fichier.</div>`;}

function bindDossier(id,tab,sec){const d=getD(id);if(!d)return;const touch=by=>{d.maj=new Date().toISOString().slice(0,10);save();};
 if(tab==='redaction'){const G=grille(d),s=G.find(x=>x.id===sec)||G[0];const ed=document.getElementById('ed');
  ed.addEventListener('input',()=>{d.txt[s.id]={t:ed.value,by:'vous'};document.getElementById('cnt').textContent=ed.value.length;touch();});
  ed.addEventListener('change',()=>render(true));
  document.querySelectorAll('[data-q]').forEach(q=>q.addEventListener('input',()=>{d.rep[s.id]=d.rep[s.id]||{};d.rep[s.id][q.dataset.q]=q.value.trim();touch();}));
  document.getElementById('gen').addEventListener('click',async()=>{const fb=()=>tplOf(s,d.rep[s.id]||{});
   if(!aiOn()){PROPOSAL={d:d.id,s:s.id,t:fb(),ai:false};render(true);return;}
   const ctl=new AbortController();const P=PROPOSAL={d:d.id,s:s.id,t:'',ai:true,loading:true,ctl};render(true);
   try{const res=await AI(paratgePrompt(d,s),{signal:ctl.signal,cache:false,onText:({text})=>{P.t=text;const el=document.getElementById('propt');if(el&&PROPOSAL===P)el.innerHTML=hl(text);}});P.t=res.text.trim();if(res.truncated)P.err='Texte coupé avant la fin : relancez ou complétez à la main.';}
   catch(e){P.t=(e&&e.text)||'';if(e&&AI_STOP.has(e.code)){AI_OFF=true;P.t=fb();P.ai=false;}P.err=aiMsg(e);}
   P.loading=false;if(PROPOSAL===P)render(true);});
  const st=document.getElementById('stop');if(st)st.addEventListener('click',()=>{if(PROPOSAL&&PROPOSAL.ctl)PROPOSAL.ctl.abort();});
  const acc=document.getElementById('acc');if(!acc){const rf=document.getElementById('ref');if(rf)rf.addEventListener('click',()=>{PROPOSAL=null;render(true);});}
  if(acc){acc.addEventListener('click',()=>{d.txt[s.id]={t:PROPOSAL.t,by:'Paratge, accepté par vous'};PROPOSAL=null;touch();render(true);});
   document.getElementById('mod').addEventListener('click',()=>{d.txt[s.id]={t:PROPOSAL.t,by:'Paratge, modifié par vous'};PROPOSAL=null;touch();render(true);setTimeout(()=>{const e=document.getElementById('ed');e.focus();},30);});
   document.getElementById('ref').addEventListener('click',()=>{PROPOSAL=null;render(true);});}}
 if(tab==='budget'){document.querySelectorAll('[data-c],[data-p]').forEach(inp=>inp.addEventListener('change',()=>{const isC=inp.dataset.c!=null,arr=isC?d.budget.charges:d.budget.produits,i=+(isC?inp.dataset.c:inp.dataset.p),f=inp.dataset.f;let v=inp.value;if(['q','u','m'].includes(f))v=Number(String(v).replace(/\s/g,'').replace(',','.'))||0;arr[i][f]=v;touch();render(true);}));
  document.querySelectorAll('[data-delc]').forEach(b=>b.addEventListener('click',()=>{d.budget.charges.splice(+b.dataset.delc,1);touch();render(true);}));
  document.querySelectorAll('[data-delp]').forEach(b=>b.addEventListener('click',()=>{d.budget.produits.splice(+b.dataset.delp,1);touch();render(true);}));
  document.getElementById('addc').addEventListener('click',()=>{d.budget.charges.push({l:'',q:1,u:0});touch();render(true);});
  document.getElementById('addp').addEventListener('click',()=>{d.budget.produits.push({l:'',m:0,s:'sollicité'});touch();render(true);});}
 if(tab==='pieces')document.querySelectorAll('[data-cond]').forEach(b=>b.addEventListener('click',()=>{d.cond=d.cond||{};const k=b.dataset.cond;d.cond[k]=d.cond[k]==='ok'?'':'ok';touch();render(true);}));
 if(tab==='radar'){const rb=document.getElementById('relec');if(rb)rb.addEventListener('click',async()=>{const L=RELEC[d.id]={loading:true};render(true);
  try{const v=await AI.json(relecturePrompt(d),{cache:false});L.items=(Array.isArray(v)?v:[]).filter(x=>x&&x.remarque).slice(0,6).map(x=>({niveau:String(x.niveau||''),section:String(x.section||''),remarque:String(x.remarque),conseil:String(x.conseil||'')}));}
  catch(e){if(e&&AI_STOP.has(e.code))AI_OFF=true;L.err=aiMsg(e)||null;}
  L.loading=false;if(/^#dossier-/.test(location.hash))render(true);});}
 if(tab==='pieces')document.querySelectorAll('[data-piece]').forEach(b=>b.addEventListener('click',()=>{const k=b.dataset.piece;d.pieces[k]=d.pieces[k]==='ok'?'':'ok';touch();render(true);}));
 if(tab==='export'){document.querySelectorAll('[data-exp]').forEach(b=>b.addEventListener('click',()=>{document.getElementById('expmsg').hidden=false;}));const dp=document.getElementById('depose');if(dp)dp.addEventListener('click',()=>{if(d.statut==='déposé'){d.statut='en cours';d.depose='';}else{d.statut='déposé';const t=new Date();d.depose=t.toLocaleDateString('fr-FR');}touch();render(true);});}
}

/* ---------- Routeur ---------- */
function render(keepScroll){
  const h=(location.hash||'#accueil').slice(1), app=document.getElementById('app'), y=window.scrollY;
  document.body.classList.remove('has-tabbar');document.getElementById('tabbar').innerHTML='';
  if(h==='q2'||h==='q3'){app.innerHTML=vQuiz(h==='q2'?2:3);bindQuiz(h==='q2'?2:3);}
  else if(h==='resultats'){app.innerHTML=vResultats();bindResultats();tabbar('aides');}
  else if(h.startsWith('aide-')){app.innerHTML=vFiche(h.slice(5));tabbar('aides');}
  else if(h==='calendrier'){app.innerHTML=vCalendrier();bindCal();tabbar('cal');}
  else if(h==='compte'){app.innerHTML=vCompte();bindCompte();tabbar('acc');}
  else if(h==='dossiers'){app.innerHTML=vDossiers();bindDossiers();tabbar('dos');}
  else if(h.startsWith('nouveau-')){const id=newDossier(h.slice(8));location.replace('#dossier-'+id+'-redaction');return;}
  else if(h.startsWith('dossier-')){const [,id,tab,sec]=h.split('-');app.innerHTML=vDossier(id,tab||'redaction',sec);bindDossier(id,tab||'redaction',sec);tabbar('dos');}
  else if(h==='q1'){app.innerHTML=vAccueil();bindQ1();setTimeout(()=>{const i=document.getElementById('depInput');if(i)i.focus();},50);}
  else {app.innerHTML=vAccueil();bindQ1();const t=document.getElementById(h);if(t&&!keepScroll)setTimeout(()=>t.scrollIntoView(),0);}
  if(keepScroll)window.scrollTo(0,y);else if(!['comment','financeurs','offres'].includes(h))window.scrollTo(0,0);
}
window.addEventListener('hashchange',()=>{F.shown=12;render();});
// Données : chargées depuis Supabase par app/page.js (window.chargerBase).
window.chargerBase().then(j=>{DB=j;render();}).catch(e=>{console.error(e);document.getElementById('app').innerHTML='<p class="wrap" style="padding:40px">Impossible de charger la base des aides. Vérifiez le fichier .env.local (adresse et clé publique Supabase).</p>';});
