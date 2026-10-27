/* AGRESOL v1.6 – rapport d'étude au format G.M.E.P (présentation du rapport GMEP-2026-EAU-4676-AGR)
   Constats uniquement : aucune prescription constructive. */
(function(){
'use strict';
const E=window.AGRESOL;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const br=s=>esc(s).replace(/\n/g,'<br>');
const nf=(x,d=1)=>x==null||!isFinite(x)?'—':Number(x).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const n0=x=>nf(x,0);
const sig=(x,p=3)=>x==null||!isFinite(x)?'—':(x===0?'0':(Math.abs(x)>=0.001&&Math.abs(x)<1e6?Number(x.toPrecision(p)).toLocaleString('fr-FR',{maximumFractionDigits:6}):x.toExponential(2).replace('.',',')));
const dfr=d=>{if(!d)return '';const m=String(d).match(/^(\d{4})-(\d{2})-(\d{2})/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(d)};
const CL=E.CLASSES;
const td=(c,txt)=>`<td class="c${c}">${txt==null?CL[c]:txt}</td>`;

let pay=null,started=false;
window.PagedConfig={auto:false};
/* Les données arrivent de la fenêtre AGRESOL (postMessage) ou d'un fichier d'étude JSON choisi par l'utilisateur. */
function start(d){if(started||!d||!d.etude)return;pay=d;started=true;wait.textContent='Mise en page du rapport…';
  const go=async()=>{if(!window.PagedPolyfill)return setTimeout(go,50);try{build();const r=await window.PagedPolyfill.preview();done(r)}catch(err){console.error(err);wait.textContent='Erreur de mise en page : '+err.message}};go()}
window.addEventListener('message',e=>{const d=e.data;if(d&&d.type==='agresol-rapport-data')start(d.payload)});
function askOpener(){try{if(window.opener&&!window.opener.closed)window.opener.postMessage({type:'agresol-rapport-pret'},'*')}catch(e){}}
function filePicker(){if(started)return;wait.innerHTML='Aucune étude transmise par AGRESOL.<br><br><label style="cursor:pointer;border:1px solid #2e9e5b;background:#2e9e5b;color:#fff;padding:7px 14px;border-radius:6px">Ouvrir un fichier d\'étude JSON<input type="file" accept=".json,application/json" hidden></label><br><br><span style="font-size:12px;color:#555">Fichier produit par « Enregistrer » dans AGRESOL (REF_INDICE_agresol.json). Le schéma conceptuel et les profils sont ajoutés quand le rapport est lancé depuis AGRESOL.</span>';
  wait.querySelector('input').addEventListener('change',ev=>{const f=ev.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);
    const et=o.format==='AGRESOL-etude'?o:(o.format==='AGRESOL-index'&&o.etudes&&o.etudes[0]&&o.etudes[0].projet?o.etudes[0]:null);
    if(!et){alert('Ce fichier n\'est pas une étude AGRESOL (format AGRESOL-etude).');return}start({etude:et,svg:null,inc:null})}catch(err){alert('Fichier illisible : '+err.message)}};rd.readAsText(f)})}
const bar=document.querySelector('.bar'),wait=document.querySelector('#wait');
askOpener();setTimeout(askOpener,400);setTimeout(filePicker,1500);

function build(){
  if(!pay||!pay.etude){wait.textContent='Aucune étude à éditer : lancez le rapport depuis AGRESOL (bouton « Rapport »).';throw new Error('pas de données')}
  const et=pay.etude,P=et.projet;E.migrate(P);const A=E.analyse(P);
  const pr=P.projet,R=Object.assign({},E.RAPPORT_DEF,P.rapport||{});
  const REF=pr.ref||'—',IND=R.indice||'V1',DATE=pr.date||new Date().toISOString().slice(0,10),DATEFR=dfr(DATE);
  const commune=pr.commune||((pr.site||'').match(/\d{5}\s+([^–,-]+)/)||[])[1]||'';
  const dep=pr.insee?String(pr.insee).slice(0,2):(((pr.site||'').match(/(\d{2})\d{3}/)||[])[1]||'');
  const titreCourt=R.titreCourt||`Agressivité eaux et gaz du sol – ${pr.nom||'projet'}${commune?', '+commune.trim():''}${dep?' ('+dep+')':''}`;
  const W=P.nappe.chimie,u=P.nappe.incert||0,uPH=P.nappe.incertPH||0;
  const pz=(P.piezos||[]).find(z=>z.ref)||(P.piezos||[])[0]||null;const pzId=pz?pz.id:'la nappe';
  const AE=(P.analyses&&P.analyses.eau)||null,AM=AE&&AE.meta||{};const LQ=AE&&AE.lq||{};
  const labo=[AM.labo,AM.echantillon].filter(Boolean).join(' ');
  const prelev=AM.prelevement||(pz&&pz.date?dfr(pz.date):'');
  const pied=R.pied||(`Rapport – ${labo?'analyses '+labo+(pzId?' ('+pzId+')':''):'agressivité des eaux souterraines et des gaz du sol'}`);
  const res=A.results,subs=A.subs;
  const cmax=res.length?Math.max(...res.map(r=>r.classe)):0;
  const TRM={aucun:'aucun traitement',venting:'venting',sparging:'sparging',vs:'venting-sparging'};
  const T=P.traitement,isco=T.isco&&T.isco.actif,mode=T.mode;
  const ventOn=mode==='venting'||mode==='vs',sparOn=mode==='sparging'||mode==='vs';
  const zoneEl=P.elements.filter(e=>e.zoneTraitement);
  const types=[...new Set(P.elements.map(e=>E.ELEM_TYPES[e.type].toLowerCase()))];
  const lt=a=>a.length<2?a.join(''):a.slice(0,-1).join(', ')+' et '+a[a.length-1];
  const zoneOf=r=>r.sat&&r.unsat?'ZNS + nappe':(r.sat?'nappe':'ZNS');
  const lq=k=>LQ[k]?'&lt; ':'';
  let fig=0;const F=()=>++fig;

  // ---------- numérotation et sommaire
  const toc=[];let c1=0,c2=0;
  const ch=(t,brk=true)=>{c1++;c2=0;const id='s'+c1;toc.push({l:1,id,t:`${c1}. ${t}`});return `<h1 class="${brk?'chap':''}" id="${id}">${c1}. ${esc(t)}</h1>`};
  const sec=t=>{c2++;const id=`s${c1}_${c2}`;toc.push({l:2,id,t:`${c1}.${c2} ${t}`});return `<h2 id="${id}">${c1}.${c2} ${esc(t)}</h2>`};
  const ann=(c,t,brk)=>{toc.push({l:'a',id:'a'+c,t:`${c} – ${t}`});return `<h1 class="${brk?'chap':''}" id="a${c}">${c} – ${esc(t)}</h1>`};
  const tbl=(hd,rows,cls='')=>`<table class="t ${cls}${rows.length<=12?' keep':''}${hd.length>8?' w':''}"><thead><tr>${hd.map(h=>typeof h==='string'?`<th>${h}</th>`:`<th class="${h[1]}">${h[0]}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
  const tr=cells=>`<tr>${cells.map(c=>/^<td/.test(c)?c:`<td>${c}</td>`).join('')}</tr>`;
  const tn=v=>`<td class="n">${v}</td>`;

  // ---------- classes de la nappe
  const wcls={},wpct={};for(const k in E.XA_WATER){const d=E.XA_WATER[k];const v=W[k];wcls[k]=v==null?null:E.clsOf(v,d);wpct[k]=v==null||d.dir<0?null:v/d.t[0]}
  const wmax=Math.max(0,...Object.values(wcls).filter(c=>c!=null));
  const so4env=W.so4!=null?W.so4*(1+u/100):null;const so4envC=so4env!=null?E.clsOf(so4env,E.XA_WATER.so4):null;
  const crit=res.filter(r=>r.classe===cmax);
  const gmax={};for(const k of ['TCE','PCE','DCE','CV','H2S']){let best=null;for(const p of P.points){const v=p.mesures&&p.mesures[k];if(v>0&&(!best||v>best.v))best={v,pt:p.id}}gmax[k]=best}
  const cwMax={};for(const k of subs){let b=null;for(const r of res){const v=r.subs[k]&&r.subs[k].cwContact;if(v!=null&&(!b||v>b.v))b={v,el:r.el.nom}}cwMax[k]=b}

  let h='';
  // ---------- couverture
  const cov=[['Maître d\'ouvrage',R.moa],['Maîtrise d\'œuvre',R.moe],['AMO',R.amo],['Bureau d\'études SSP / Hydrologie',R.bet+(R.etabli?`\nContact : ${R.etabli}${R.fonction?', '+R.fonction:''}${R.contact?' — '+R.contact:''}`:'')],
    ['Site',(pr.adresse||pr.site||'')+(pr.parcelle&&!(pr.site||'').includes(pr.parcelle)?' — parcelle '+pr.parcelle:'')],['Commune / Dép.',[commune.trim(),dep].filter(Boolean).join(' — ')],
    ['Projet',pr.nom+(types.length?` — ouvrages en contact avec les sols et les eaux souterraines : ${lt(types)}`:'')],['Prestations',R.prestations],['Campagne',R.campagne||[prelev?`${prelev} — ${pzId}${labo?' : '+labo:''}`:'',P.points.length?`gaz du sol : ${P.points.map(p=>p.id).join(', ')}`:''].filter(Boolean).join(' ; ')],
    ['Référence',`${REF} — Indice ${IND}`],['Date',DATE]].filter(r=>r[1]&&String(r[1]).trim());
  const intro=`Le présent rapport évalue l'agressivité chimique des eaux souterraines et des gaz du sol vis-à-vis des ouvrages de fondation en contact avec les terrains (${lt(types)||'fondations'}) du projet ${esc(pr.nom||'')}${pr.adresse||pr.site?', '+esc(pr.adresse||pr.site):''}. ${R.question?esc(R.question)+' ':''}Il modélise l'effet des composés volatils sur la chimie de l'eau au contact des ouvrages${mode!=='aucun'||isco?' et les effets du traitement ('+esc(TRM[mode]==='aucun traitement'?'ISCO':TRM[mode]+(isco?' et ISCO':''))+')':''}, et indique les classes d'exposition correspondant, au sens de la norme, à la chimie observée. Il a été établi conformément à la NF EN 206+A2/CN, au FD P18-011 et à la norme NF X31-620-2.`;
  h+=`<section class="cover"><div class="cband"><div class="g">G.M.E.P</div><div class="tag">Sites et sols pollués – Hydrogéologie – Évaluation des risques sanitaires</div>
  <div class="t">Agressivité des eaux souterraines et des gaz du sol<br>vis-à-vis des fondations (NF EN 206 / FD P18-011)</div>
  <div class="s">${esc(pr.nom||'')}${pr.adresse||pr.site?' – '+esc(pr.adresse||pr.site):''}<br>${esc(lt(P.elements.map(e=>e.nom)).slice(0,140))}${P.points.length?' – points de gaz '+esc(P.points.map(p=>p.id).join(', ')):''}<br>Modélisation AGRESOL : COHV → béton${mode!=='aucun'?', effets du '+esc(TRM[mode]):''}${isco?', ISCO persulfate':''}${pz?', suivi '+esc(pzId):''}</div></div>
  <div class="cbody"><p class="cref">Référence : ${esc(REF)} — Indice ${esc(IND)} — ${esc(DATE)}</p>
  <table class="cov"><thead><tr><th>Champ</th><th>Valeur</th></tr></thead><tbody>${cov.map(r=>`<tr><td>${esc(r[0])}</td><td>${br(r[1])}</td></tr>`).join('')}</tbody></table>
  <div class="rbox">${intro}</div>
  <div class="rbox"><table class="vis"><thead><tr><th>Indice</th><th>Date</th><th>Objet</th><th>Établi par</th><th>Visa</th></tr></thead><tbody><tr><td>${esc(IND)}</td><td>${esc(DATE)}</td><td style="color:#2a6bb0;width:50mm">${br(R.objet)}</td><td><b>${esc(R.etabli||pr.auteur||'')}</b><br><span style="font-size:6.8pt;color:#333">${esc(R.fonction||'')}</span></td><td><div class="sig">G.M.E.P<span>Signature</span></div></td></tr></tbody></table></div>
  <p class="cnote">Rapport édité avec AGRESOL v1.6 – à relire, valider et viser par l'ingénieur responsable avant diffusion.</p></div></section>`;
  // en-tête courant
  h+=`<div class="hdr"><b>G.M.E.P</b><span>${esc(titreCourt)}</span><span class="r">Réf. ${esc(REF)} – ${esc(IND)} – ${esc(DATEFR)}</span></div>`;
  h+=`<h1 style="margin-bottom:4mm">Sommaire</h1><ul class="toc" id="toc"></ul>`;
  // glossaire
  h+=`<h1 class="chap">Glossaire</h1>`+tbl(['Terme','Définition'],[
    ['XA1 / XA2 / XA3','Classes d\'exposition du béton aux attaques chimiques (faible, modérée, forte) — NF EN 206+A2/CN, tableau 2 ; FD P18-011'],
    ['&lt; XA1','Environnement non agressif au sens de la norme : aucun paramètre n\'atteint le seuil bas de XA1'],
    ['CO₂ agressif','CO₂ dissous en excès de l\'équilibre calco-carbonique, capable de dissoudre le carbonate de calcium (essai au marbre NF EN 13577)'],
    ['TAC','Titre alcalimétrique complet (alcalinité, mmol/L) — principal tampon acide-base de la nappe'],
    ['SI calcite','Indice de saturation de la calcite : &gt; 0 eau incrustante, &lt; 0 eau agressive vis-à-vis des carbonates'],
    ['COHV','Composés organo-halogénés volatils (TCE, PCE, DCE, chlorure de vinyle)'],['TCE / PCE','Trichloroéthylène / tétrachloroéthylène'],
    ['DNAPL','Phase organique dense non aqueuse (solvant chloré pur ou en mélange)'],['H\'','Constante de Henry adimensionnelle (rapport concentration gaz / concentration eau)'],
    ['ZNS','Zone non saturée (au-dessus du toit de la nappe)'],['Venting','Extraction sous vide des gaz de la zone non saturée'],
    ['Sparging','Injection d\'air sous le toit de la nappe pour volatiliser les COHV dissous et oxygéner l\'aquifère'],
    ['ISCO','Oxydation chimique in situ ; ici persulfate de sodium Na₂S₂O₈ activé (alcalin, fer, peroxyde ou thermique)'],
    ['PSA / ANC','Potentiel de production d\'acide des sulfures / capacité de neutralisation acide des carbonates du sol'],
    ['Lambert 93 / NGF','Système de coordonnées planes officiel (EPSG:2154) / nivellement général de la France (altitudes)'],
    ['BSS','Banque du sous-sol du BRGM (forages et logs géologiques)'],
    ['Pieu / micropieu / inclusion rigide','Fondations profondes ou éléments de renforcement en béton ou coulis traversant la zone non saturée puis, le cas échéant, la zone saturée'],
    ['Plot / longrine','Massif de fondation superficielle / poutre de fondation reliant les têtes de pieux, coulés au contact des terrains']].map(r=>tr([`<b>${r[0]}</b>`,r[1]])));

  // ================= 1. Note de synthèse
  h+=ch('Note de synthèse');
  h+=`<p><b>Objet.</b> ${R.question?esc(R.question)+' ':''}Le présent rapport évalue, à l'aide du logiciel AGRESOL, la chimie des eaux souterraines et des gaz du sol au contact de ${P.elements.length} ouvrage(s) de fondation (${esc(lt(types))}) et indique les classes d'exposition correspondant à cette chimie au sens du tableau 2 de la NF EN 206+A2/CN et du FD P18-011. ${pz?`L'analyse de référence est celle du piézomètre ${esc(pzId)}${labo?' ('+esc(labo)+')':''}${prelev?', prélevé le '+esc(prelev):''}.`:''}</p>`;
  const B=[];
  {const parts=[];if(W.so4!=null)parts.push(`SO₄²⁻ = ${n0(W.so4)} mg/L pour un seuil XA1 de 200 mg/L (${n0(wpct.so4*100)} % du seuil)`);if(W.pH!=null)parts.push(`pH ${nf(W.pH,1)}`);if(W.co2!=null)parts.push(`CO₂ agressif ${lq('co2')}${nf(W.co2,W.co2<10?1:0)} mg/L`);if(W.nh4!=null)parts.push(`NH₄⁺ ${lq('nh4')}${sig(W.nh4,2)} mg/L`);if(W.mg!=null)parts.push(`Mg²⁺ ${n0(W.mg)} mg/L`);
   B.push(`<b>La nappe ${pz?'au droit de '+esc(pzId):''} correspond à la classe ${CL[wmax]}</b> au sens du tableau 2 : ${parts.join(' ; ')}.`)}
  if(W.so4!=null&&u)B.push(`Avec l'incertitude analytique retenue (±${nf(u,0)} %), la valeur haute des sulfates atteint ${n0(so4env)} mg/L${so4envC>wcls.so4?`, ce qui <b>correspond à la classe ${CL[so4envC]}</b>`:`, qui reste en classe ${CL[so4envC]}`}${W.pH!=null&&uPH?` ; le pH bas atteint ${nf(W.pH-uPH,1)}`:''}.`);
  {const g=Object.keys(gmax).filter(k=>gmax[k]&&k!=='H2S');if(g.length)B.push(`<b>Gaz du sol</b> : teneurs maximales ${g.map(k=>`${k} ${n0(gmax[k].v)} µg/m³ (${esc(gmax[k].pt)})`).join(', ')}. Les composés volatils ne figurent pas parmi les paramètres du tableau 2 ; à l'équilibre, l'eau au contact des ouvrages contient au plus ${subs.filter(k=>cwMax[k]).map(k=>`${sig(cwMax[k].v,2)} µg/L de ${k}`).join(', ')||'des teneurs négligeables'}. Leur dégradation complète en HCl et CO₂ fait varier le pH de ${sig(Math.max(...res.filter(r=>r.water).map(r=>Math.abs(r.water.m.dpH||0)),0),2)} unité au plus.`)}
  {const by=[0,1,2,3].map(c=>res.filter(r=>r.classe===c));B.push(`<b>Ouvrages</b> : sur ${res.length} ouvrage(s) modélisé(s), ${by.map((l,c)=>l.length?`${l.length} en ${CL[c]}`:'').filter(Boolean).join(', ')}. Classe la plus élevée : <b>${CL[cmax]}</b> (${esc(crit.map(r=>r.el.nom).join(', '))})${crit[0]&&crit[0].agression.length?', paramètre(s) déterminant(s) : '+esc([...new Set(crit.flatMap(r=>r.agression))].join(', ')):''}.`)}
  if(mode!=='aucun'||isco){const rz=res.filter(r=>r.el.zoneTraitement);B.push(`<b>Traitement</b> : ${esc(TRM[mode]==='aucun traitement'?'ISCO':TRM[mode]+(isco?' et ISCO au persulfate activé':''))}, appliqué aux ouvrages situés dans la zone traitée${rz.length?' ('+esc(rz.map(r=>r.el.nom+' : '+CL[r.classe]).join(', '))+')':' (aucun ouvrage coché)'}.${sparOn?` L'oxydation de ${nf(T.sparging.pyrite,0)} mg/kg de pyrite du sol saturé est prise en compte (${nf(T.sparging.fOx,0)} % oxydés, dilution × ${nf(T.sparging.dilution,0)}).`:''}`)}
  if(res.some(r=>r.h2s))B.push(`<b>H₂S</b> : présence au contact d'ouvrages (corrosion biogène, agression non couverte par le tableau 2 ; voir § 8).`);
  if(W.cl>50)B.push(`Chlorures ${n0(W.cl)} mg/L : valeur supérieure à 50 mg/L, à porter à la connaissance des concepteurs (paramètre hors tableau 2).`);
  h+=`<h3>Principaux constats</h3><ul class="b">${B.map(b=>`<li>${b}</li>`).join('')}</ul>`;
  h+=`<h3>Réponse à la question posée</h3>`+tbl(['Ouvrage','Milieu au contact','Classe au sens de la NF EN 206 (constat)','Justification'],res.map(r=>{const w=r.water;const j=r.agression.length?r.agression.join(', '):'Tous les paramètres sous les seuils XA1';const ex=w?` ; SO₄²⁻ ${n0(w.nominal.so4)} mg/L (enveloppe ${n0(w.env.so4)}), pH ${nf(w.nominal.pH,2)}`:'';return tr([`<b>${esc(r.el.nom)}</b><br><span class="muted">${esc(E.ELEM_TYPES[r.el.type])}, ${nf(r.ct.z1,1)} – ${nf(r.ct.z2,1)} m</span>`,esc(zoneOf(r))+(r.pt?' – '+esc(r.pt):''),td(r.classe),esc(j)+ex])}));
  h+=`<div class="box"><p><b>Conclusion.</b> La chimie au contact des ouvrages correspond à la classe <b>${CL[cmax]}</b> pour ${esc(crit.map(r=>r.el.nom).join(', '))}${res.length>crit.length?` et à des classes inférieures ou égales pour les autres ouvrages`:''}. ${wmax<cmax?`Le classement de la nappe (${CL[wmax]}) ${pz?'sur '+esc(pzId)+' ':''}n'est donc pas représentatif de l'ensemble des ouvrages : l'écart provient ${esc([...new Set(crit.flatMap(r=>r.agression))].join(', ')||'des scénarios modélisés')}.`:`Le classement de la nappe (${CL[wmax]}) est cohérent avec celui des ouvrages.`} Ces classes sont des constats ; elles n'ont pas valeur de prescription.</p></div>`;
  h+=`<div class="box pale"><p><b>Périmètre de la mission.</b> G.M.E.P établit des constats sur la chimie des eaux souterraines et des gaz du sol et indique les classes d'exposition qui lui correspondent au sens de la NF EN 206+A2/CN et du FD P18-011. Le choix des classes d'exposition à retenir pour les ouvrages, la formulation des bétons, les enrobages et les dispositions constructives relèvent du géotechnicien, du bureau d'études structure et de l'entreprise de génie civil, auxquels les constats du présent rapport sont destinés.</p></div>`;

  // ================= 2. Cadre
  h+=ch('Cadre normatif et réglementaire, contexte et données');
  h+=sec('Missions codifiées par la norme NF X31-620-2');
  const ms=[['A210','Prélèvements, mesures, observations et/ou analyses sur les eaux souterraines',pz?`Exploitation des analyses du piézomètre ${esc(pzId)}${labo?' ('+esc(labo)+')':''}`:'Exploitation des analyses des eaux souterraines']];
  if(P.points.length)ms.push(['A230','Prélèvements, mesures, observations et/ou analyses sur les gaz du sol',`Exploitation des mesures des points ${esc(P.points.map(p=>p.id).join(', '))}`]);
  ms.push(['A270','Interprétation des résultats des investigations','Modélisation AGRESOL : chimie au contact des ouvrages et classes de la norme correspondantes']);
  if(mode!=='aucun'||isco)ms.push(['A320 / A330','Analyse des enjeux et des options de gestion (appui)','Effets du traitement sur l\'agressivité des eaux']);
  h+=tbl(['Code','Mission','Application au présent rapport'],ms.map(m=>tr([`<b>${m[0]}</b>`,m[1],m[2]])));
  h+=sec('Classes d\'exposition XA : NF EN 206+A2/CN et FD P18-011');
  h+=`<p>Le tableau 2 de la NF EN 206+A2/CN fixe les valeurs limites des classes d'exposition aux attaques chimiques des sols naturels et des eaux souterraines (température de l'eau comprise entre 5 et 25 °C, vitesse d'écoulement faible). La classe d'un environnement est celle de la caractéristique la plus défavorable. Le FD P18-011 précise la définition et la classification des environnements chimiquement agressifs, y compris les environnements particuliers non couverts par le tableau 2.</p>`;
  const thr=(d,k)=>`${d.dir>0?'≥ ':'≤ '}${nf(d.t[k],d.t[k]<10&&d.dir<0?1:0)}`;
  h+=tbl(['Caractéristique','Méthode','XA1','XA2','XA3'],[...Object.entries(E.XA_WATER).map(([k,d])=>tr([`Eau – ${d.lab}`,({so4:'EN 196-2',co2:'EN 13577',mg:'ISO 7980',nh4:'ISO 7150-1',pH:'ISO 4316'})[k]||'',thr(d,0),thr(d,1),thr(d,2)])),
    tr(['Sol – SO₄²⁻ total (mg/kg)','EN 196-2','≥ 2 000','≥ 3 000','≥ 12 000']),tr(['Sol – acidité Baumann-Gully (mL/kg)','prEN 16502','&gt; 200','Rare en pratique',''])]);
  h+=`<p class="small">Options de classement de la modélisation : enveloppe haute ${P.options.enveloppe?'retenue (valeurs × (1 + incertitude), pH − marge)':'non retenue'} ; règle des deux caractéristiques ${P.options.regle2?'appliquée (deux paramètres dans la même classe → classe supérieure)':'non appliquée'} ; oxydation des sulfures du sol ${P.acide&&P.acide.actif!==false?'prise en compte':'non prise en compte'}.</p>`;
  h+=sec('Site, géologie et fondations');
  h+=`<p>Le site est situé ${esc(pr.adresse||pr.site||'')}${pr.parcelle?`, parcelle cadastrale ${esc(pr.parcelle)}${pr.surface?' ('+n0(pr.surface)+' m²)':''}`:''}${pr.z!=null?`, à une altitude de ${nf(pr.z,2)} m NGF${pr.zSource?' ('+esc(pr.zSource)+')':''}`:''}. ${pr.feuille?`Il est couvert par la feuille n° ${esc(pr.feuille)} ${esc(pr.nomFeuille||'')} de la carte géologique à 1/50 000 du BRGM${pr.litho1M?' (lithologie à 1/1 000 000 : '+esc(pr.litho1M)+')':''}.`:''}</p>`;
  h+=`<h3>Coupe géologique de terrain${P.coupeSource?' – '+esc(P.coupeSource):''}</h3>`+tbl(['Couche','Toit (m)','Base (m)','Porosité','θa','θw','Calcaire','SO₄ sol (mg/kg)'].map((x,i)=>i>0&&i<6||i===7?[x,'n']:x),P.layers.map(L=>tr([esc(L.nom),tn(nf(L.top,1)),tn(nf(L.bottom,1)),tn(nf(L.n,2)),tn(nf(L.ta,2)),tn(nf(L.tw,2)),L.calcaire?'oui':'non',tn(L.so4s!=null?n0(L.so4s):'—')])));
  h+=`<p class="small">Toit de la nappe retenu : ${nf(P.nappe.zwt,2)} m sous le niveau de référence${P.nappe.battement?` ; battement ${nf(P.nappe.battement,1)} m`:''}. Température de la nappe : ${nf(P.nappe.T,1)} °C.</p>`;
  const G=P.geolLocale||{};
  if(G.layers&&G.layers.length)h+=`<h3>Géologie locale (BRGM)${G.source?' – '+esc(G.source):''}</h3>`+tbl(['Formation','Toit (m)','Base (m)','Stratigraphie'],G.layers.map(L=>tr([esc(L.nom||L.litho||''),tn(nf(L.top,1)),tn(nf(L.bottom,1)),esc(L.strat||'')])))+(G.zsol!=null?`<p class="small">Altitude du sol de l'ouvrage BSS : ${nf(G.zsol,2)} m NGF.</p>`:'');
  h+=`<h3>Ouvrages en contact avec les sols et les eaux souterraines</h3>`+tbl(['Ouvrage','Type','Tête (m)','Pied (m)','Diamètre / largeur (m)','Point de gaz','Zone traitée'].map((x,i)=>i>=2&&i<=4?[x,'n']:x),P.elements.map(e=>tr([`<b>${esc(e.nom)}</b>`,esc(E.ELEM_TYPES[e.type]),tn(nf(e.zTop,2)),tn(nf(e.zBase,2)),tn(nf(e.dim!=null?e.dim:e.largeur,2)),esc(e.point||''),e.zoneTraitement?'oui':'non'])));
  h+=sec('Données exploitées');
  const dd=[];
  dd.push([`Eaux souterraines – agressivité`,AE?`${esc(AE.fichier||'')}${labo?' – '+esc(labo):''}${AM.ouvrage?' – '+esc(AM.ouvrage):''}`:(pz?`Piézomètre ${esc(pzId)} (saisie)`:'Saisie'),esc(prelev||'')+(AM.classeLabo?` ; classe indiquée par le laboratoire : ${esc(AM.classeLabo)}`:'')]);
  const AC=P.analyses&&P.analyses.cohv;dd.push(['Eaux souterraines – composés dissous',AC?esc(AC.fichier||'')+(AC.meta&&AC.meta.labo?' – '+esc(AC.meta.labo):''):'Saisie',Object.entries(P.nappe.cohv||{}).filter(([k,v])=>v>0).map(([k,v])=>`${k} ${sig(v,3)} µg/L`).join(', ')||'—']);
  if(P.points.length)dd.push(['Gaz du sol',`Points ${esc(P.points.map(p=>p.id).join(', '))}`,R.campagne?br(R.campagne):'']);
  if(P.piezos&&P.piezos.length)dd.push(['Relevés piézométriques',esc(P.piezos.map(z=>z.id).join(', ')),P.piezos.map(z=>z.zNappe!=null?`${esc(z.id)} : nappe ${nf(z.zNappe,2)} m NGF${z.date?' ('+esc(dfr(z.date))+')':''}`:'').filter(Boolean).join(' ; ')]);
  if(pr.parcelle||pr.adresse)dd.push(['Localisation, cadastre, altitude','Géoplateforme IGN (géocodage, API Carto cadastre, RGE ALTI)',`${pr.x!=null?'X '+n0(pr.x)+' – Y '+n0(pr.y)+' (Lambert 93)':''}`]);
  if(G.source||pr.feuille)dd.push(['Géologie','BRGM – carte géologique 1/50 000, Banque du sous-sol (InfoTerre)',esc(G.source||'')]);
  h+=tbl(['Donnée','Source','Observations'],dd.map(d=>tr(d)));

  // ================= 3. Résultats analytiques
  h+=ch('Résultats analytiques');
  h+=sec(`Agressivité des eaux souterraines – ${pzId}${labo?' ('+labo+')':''}`);
  const rowsW=Object.entries(E.XA_WATER).map(([k,d])=>{const v=W[k];const c=wcls[k];return tr([d.lab,tn(v==null?'non mesuré':lq(k)+nf(v,k==='pH'?1:(v<10?2:0))),tn(thr(d,0)),tn(thr(d,1)),tn(thr(d,2)),c==null?'<td>—</td>':td(c),tn(wpct[k]!=null?n0(wpct[k]*100)+' %':(k==='pH'&&v!=null?'marge '+nf(v-6.5,1):'—'))])});
  const comp=[['Calcium Ca²⁺ (mg/L)',W.ca],['TAC (mmol/L)',W.tac],['Chlorures Cl⁻ (mg/L)',W.cl],['Nitrates NO₃⁻ (mg/L)',W.no3],['Sulfures dissous (mg/L S)',W.s2]].filter(r=>r[1]!=null).map(r=>tr([r[0],tn(nf(r[1],r[1]<10?1:0)),'<td colspan="5" class="muted">paramètre complémentaire (hors tableau 2)</td>']));
  h+=tbl(['Paramètre',['Résultat','n'],['XA1','n'],['XA2','n'],['XA3','n'],'Classe',['Part du seuil XA1','n']],rowsW.concat(comp));
  h+=`<p>${Object.keys(LQ).some(k=>LQ[k]&&!/^cohv_/.test(k))?'Les valeurs précédées de « &lt; » sont inférieures à la limite de quantification et sont retenues à cette limite. ':''}La classe de la nappe au sens du tableau 2 est <b>${CL[wmax]}</b>${W.so4!=null?` ; le paramètre le plus proche d'un seuil est ${Object.entries(wpct).filter(e=>e[1]!=null).sort((a,b)=>b[1]-a[1]).map(e=>E.XA_WATER[e[0]].lab.replace(/ \(.*\)/,'')+' ('+n0(e[1]*100)+' % du seuil XA1)')[0]}`:''}.</p>`;
  h+=sec('Composés volatils – points de gaz et nappe');
  h+=tbl(['Point','Sous bâtiment','Mesure (m)','Source (m)',['TCE','n'],['PCE','n'],['DCE','n'],['CV','n'],['H₂S','n']],P.points.map(p=>tr([`<b>${esc(p.id)}</b>`,p.sousBatiment?'oui':'non',`${nf(p.zm1,1)} – ${nf(p.zm2,1)}`,`${nf(p.src1,1)} – ${nf(p.src2,1)}`,...['TCE','PCE','DCE','CV','H2S'].map(k=>tn(p.mesures&&p.mesures[k]?n0(p.mesures[k]):'—'))])));
  h+=`<p class="small">Teneurs en µg/m³. Eau souterraine (µg/L) : ${Object.entries(P.nappe.cohv||{}).map(([k,v])=>`${k} ${LQ['cohv_'+k]?'&lt; ':''}${sig(v,3)}`).join(' ; ')}.</p>`;
  h+=sec('Incertitudes analytiques');
  const inc=pay.inc&&pay.inc.det;
  h+=`<p>Incertitude relative retenue : <b>±${nf(u,0)} %</b> sur les concentrations et <b>±${nf(uPH,1)} unité</b> sur le pH${P.nappe.incertAuto?' (renseignement automatique : incertitudes du rapport d\'analyses lorsqu\'elles sont indiquées, sinon valeurs usuelles des méthodes)':''}.</p>`;
  if(inc&&inc.length)h+=tbl(['Paramètre',['Incertitude','n'],'Origine'],inc.map(d=>tr([esc(d.k==='pH'?'pH':(E.XA_WATER[d.k]?E.XA_WATER[d.k].lab:d.k)),tn(d.u==null?'—':nf(d.u,d.k==='pH'?1:0)+' '+esc(d.unit||'')),esc(d.src||'')])));

  // ================= 4. Représentativité
  h+=ch(`Représentativité de ${pz?pzId:'l\'analyse de nappe'} vis-à-vis des fondations`);
  const pzs=(P.piezos||[]).map(z=>{const o={...z};if(pr.x!=null&&z.x!=null)o.d=Math.hypot(z.x-pr.x,z.y-pr.y);if(z.zTete!=null&&z.zNappe!=null)o.pt=z.zTete-z.zNappe;if(pr.z!=null&&z.zNappe!=null)o.zwt=pr.z-z.zNappe;return o});
  if(pzs.length)h+=tbl(['Piézomètre',['X L93','n'],['Y L93','n'],['Tête (m NGF)','n'],['Nappe (m NGF)','n'],['Profondeur (m)','n'],['Distance au projet (m)','n'],['Toit au droit du projet (m)','n'],'Relevé'],pzs.map(z=>tr([`<b>${esc(z.id)}</b>${z.ref?' (réf.)':''}`,tn(z.x!=null?n0(z.x):'—'),tn(z.y!=null?n0(z.y):'—'),tn(nf(z.zTete,2)),tn(nf(z.zNappe,2)),tn(nf(z.prof,1)),tn(z.d!=null?nf(z.d,1):'—'),tn(z.zwt!=null?nf(z.zwt,2):'—'),esc(dfr(z.date))])));
  h+=`<ul class="b"><li><b>Position</b> : ${pz&&pzs[0]&&pzs.find(z=>z.id===pz.id).d!=null?`le piézomètre ${esc(pzId)} est à ${nf(pzs.find(z=>z.id===pz.id).d,1)} m du point de référence du projet.`:'les coordonnées du piézomètre et du projet ne permettent pas de calculer la distance (à renseigner dans AGRESOL).'} L'eau prélevée intègre la chimie de la nappe après mélange et dilution ; elle ne renseigne pas directement la chimie au contact des ouvrages situés au droit des points de gaz.</li>
  <li><b>Modélisation au contact</b> : AGRESOL part de l'analyse de ${esc(pzId)} et la modifie au droit de chaque ouvrage par les apports des composés volatils (chapitre 6)${mode!=='aucun'||isco?' et du traitement (chapitre 7)':''}, puis applique l'incertitude analytique (enveloppe haute).</li>
  <li><b>Écart observé</b> : ${wmax===cmax?`la classe la plus élevée des ouvrages (${CL[cmax]}) est égale à celle de la nappe.`:`la classe la plus élevée des ouvrages (${CL[cmax]}) diffère de celle de la nappe (${CL[wmax]}).`}</li></ul>`;

  // ================= 5. Schéma conceptuel
  h+=ch('Schéma conceptuel de l\'agressivité');
  h+=`<p>La coupe ci-dessous représente, à l'échelle des profondeurs, les ouvrages modélisés, les couches de terrain, le toit de la nappe et les zones sources des points de gaz. La couleur de chaque ouvrage correspond à la classe de la norme obtenue au contact.</p>`;
  if(pay.svg&&pay.svg.coupe)h+=`<figure>${pay.svg.coupe}<figcaption>Figure ${F()} – Coupe schématique des fondations, des couches et de la nappe (classes au contact)</figcaption></figure>`;
  h+=`<ul class="b"><li><b>Zone non saturée</b> (0 à ${nf(P.nappe.zwt,1)} m) : contact avec les gaz du sol et l'eau interstitielle ; classement sur les analyses de sol et sur l'eau interstitielle à l'équilibre avec les gaz.</li><li><b>Zone saturée</b> (au-delà de ${nf(P.nappe.zwt,1)} m) : contact avec la nappe ; classement sur la chimie de la nappe modifiée au contact.</li>${P.nappe.battement?`<li><b>Zone de battement</b> (${nf(P.nappe.battement,1)} m) : classée comme la zone saturée.</li>`:''}</ul>`;

  // ================= 6. Modélisation COHV
  h+=ch('Modélisation de l\'agressivité des composés volatils sur les fondations');
  h+=sec('Démarche');
  h+=`<p>La modélisation répond à une question simple : <b>quelle quantité de composés organo-halogénés volatils (COHV) dissous faudrait-il dans la nappe pour que l'acidité libérée par leur dégradation rende l'eau agressive au sens de la norme ?</b> Elle est menée en cinq étapes : (1) profils verticaux de concentration des composés volatils dans les gaz du sol, entre la zone source de chaque point et la surface, en régime diffusif (Millington-Quirk) ; (2) calcul de l'eau interstitielle à l'équilibre au contact des ouvrages par la loi de Henry ; (3) acidité produite par la dégradation des COHV et part du pouvoir tampon de la nappe consommée ; (4) évolution du pH et du CO₂ agressif de la nappe en fonction de la concentration, et comparaison aux seuils du tableau 2 ; (5) bilan au contact de chaque ouvrage (${nf(P.scenario.fDeg,0)} % de dégradation retenus) et modèle calco-carbonique.</p>`;
  h+=`<p>Les graphiques des sections ${c1}.2 à ${c1}.4 retiennent une <b>hypothèse majorante</b> : dégradation complète des COHV en acide chlorhydrique (HCl) et en dioxyde de carbone (CO₂), eau en système fermé, sans dissolution de la calcite de l'encaissant. Les profils verticaux de gaz et d'eau interstitielle sont reportés en annexe A4.</p>`;
  const ACD=E.acidCohv(P,A),GA=window.AGRESOL_ACID,AK=[...E.COHV_KEYS,E.COHV_MIX];
  const kMain=E.COHV_KEYS.slice().sort((a,b)=>(ACD.items[b].site||0)-(ACD.items[a].site||0))[0];
  const itM=ACD.items[E.COHV_MIX],itP=ACD.items[kMain];
  h+=sec('Acidité produite par la dégradation des COHV');
  h+=`<p>Chaque molécule de COHV dégradée libère autant de molécules d'acide chlorhydrique qu'elle contient d'atomes de chlore (4 pour le PCE, 3 pour le TCE, 2 pour le cis-DCE, 1 pour le chlorure de vinyle) et deux molécules de CO₂. Cet acide est neutralisé par les bicarbonates de la nappe (TAC ${nf(W.tac,1)} mmol/L). Tant que la part du TAC consommée reste faible, le pH varie peu ; l'eau ne devient agressive que lorsque cette part devient importante.</p>`;
  h+=`<figure>${GA.chaine(itP,ACD)}<figcaption>Figure ${F()} – Acidité libérée par la dégradation du ${esc(itP.court)} et part du pouvoir tampon de la nappe consommée</figcaption></figure>`;
  h+=`<p>Pour l'ensemble des COHV, la composition retenue est ${itM.site>0?'celle mesurée au contact de l\'ouvrage le plus chargé'+(itM.siteEl?' ('+esc(itM.siteEl)+')':''):'à défaut de COHV détecté, une répartition en parts égales'} : ${Object.entries(ACD.site.frac).filter(([,f])=>f>0.005).map(([k,f])=>k+' '+nf(f*100,0)+' %').join(', ')}.</p>`;
  h+=`<figure>${GA.chaine(itM,ACD)}<figcaption>Figure ${F()} – Acidité libérée par la dégradation de l'ensemble des COHV (composition du site)</figcaption></figure>`;
  h+=tbl(['Composé',['Cl / C','n'],['H⁺ libéré pour 1 mg/L (mmol/L)','n'],['CO₂ libéré pour 1 mg/L (mmol/L)','n'],['Part du TAC pour 1 mg/L','n'],['Teneur du site (µg/L)','n'],['Part du TAC au site','n']],
    AK.map(k=>{const it=ACD.items[k],s=it.mix?null:E.SUBST[k];return tr([it.mix?'<b>Ensemble des COHV</b>':esc(s.nom),tn(it.mix?'—':s.nCl+' / '+s.nC),tn(sig(it.u.h*1000,2)),tn(sig(it.u.c*1000,2)),tn(sig(it.u.h*1000/W.tac*100,2)+' %'),tn(it.site>0?sig(it.site,3):'n.d.'),tn(it.site>0?sig(it.u.h*it.site/W.tac*100,2)+' %':'—')])}));
  h+=sec('pH de la nappe selon la concentration en COHV');
  h+=`<p>Les courbes ci-dessous donnent le pH de la nappe après dégradation en fonction de la concentration dissoute (échelle logarithmique), pour la nappe du site et pour deux eaux types à l'équilibre calcocarbonique, moins tamponnées (${ACD.types.map(t=>'TAC '+nf(t.tac,0)+' mmol/L, pH '+nf(t.pH,2)).join(' ; ')}). Les bandes de couleur correspondent aux seuils de pH du tableau 2 (6,5 / 5,5 / 4,5). Les lignes verticales repèrent la teneur du site et, pour un composé seul, sa solubilité dans l'eau.</p>`;
  h+=`<figure>${GA.courbe(itP,ACD)}<figcaption>Figure ${F()} – pH de la nappe après dégradation selon la concentration en ${esc(itP.court)}</figcaption></figure>`;
  h+=`<figure>${GA.courbe(itM,ACD)}<figcaption>Figure ${F()} – pH de la nappe après dégradation selon la concentration de l'ensemble des COHV</figcaption></figure>`;
  const cs=v=>v==null?'non atteint':(v>=1000?sig(v/1000,2)+' mg/L':sig(v,2)+' µg/L');
  h+=`<p>Le tableau suivant récapitule, pour chaque composé, les concentrations dissoutes à partir desquelles la nappe du site atteint chaque seuil du tableau 2, par le pH et par le CO₂ agressif.</p>`;
  h+=tbl(['Composé',['Teneur du site','n'],['XA1 – CO₂ agr. 15 mg/L','n'],['XA2 – CO₂ agr. 40 mg/L','n'],['XA1 – pH 6,5','n'],['XA2 – pH 5,5','n'],['XA3 – pH 4,5','n'],['Solubilité','n']],
    AK.map(k=>{const it=ACD.items[k];return tr([it.mix?'<b>Ensemble des COHV</b>':esc(it.court),tn(it.site>0?cs(it.site):'n.d.'),...[it.seuils.co2[0],it.seuils.co2[1],it.seuils.pH[0],it.seuils.pH[1],it.seuils.pH[2]].map(v=>tn(v==null&&it.sol?'> solubilité':(v!=null&&it.sol&&v>it.sol?cs(v)+' *':cs(v)))),tn(it.sol?cs(it.sol):'—')])}));
  h+=`<p class="small">* concentration supérieure à la solubilité du composé seul : seuil non atteignable par ce composé dissous. « > solubilité » : seuil non atteint avant deux fois la solubilité. Solubilités retenues : ${E.COHV_KEYS.map(k=>k+' '+n0((P.substances[k]&&P.substances[k].S)||E.SUBST[k].S)+' mg/L').join(', ')} (PCE : INERIS, fiche 127-18-4).</p>`;
h+=sec('Écart entre les teneurs du site et les seuils de la norme');
  const fx=it=>it.site>0&&it.xa1?it.xa1/it.site:null;
  h+=`<p>La figure suivante compare, pour chaque composé et pour leur ensemble, la teneur maximale au contact des ouvrages et la concentration nécessaire pour atteindre XA1 (critère le plus pénalisant entre le pH et le CO₂ agressif). ${itM.site>0?`Pour l'ensemble des COHV, la teneur du site (${cs(itM.site)}) est ${fx(itM)?(fx(itM)>=1?'inférieure':'supérieure')+' d\'un facteur '+GA.fois(fx(itM)>=1?fx(itM):1/fx(itM)).replace('× ','')+' au':'à comparer au'} seuil XA1 calculé (${cs(itM.xa1)}).`:`Aucun COHV n'est détecté au contact des ouvrages ; le seuil XA1 calculé pour l'ensemble des COHV est de ${cs(itM.xa1)}.`}</p>`;
  h+=`<figure>${GA.comparaison(ACD)}<figcaption>Figure ${F()} – Teneurs du site et concentrations nécessaires pour atteindre XA1, par composé</figcaption></figure>`;
  h+=`<figure>${GA.barres(itP)}<figcaption>Figure ${F()} – ${esc(itP.court)} : teneur du site, seuils XA1 par le CO₂ agressif et par le pH, solubilité</figcaption></figure>`;
  h+=`<p class="small">Constat : ces écarts décrivent la chimie de la nappe vis-à-vis des seuils du tableau 2 de la NF EN 206+A2/CN. Ils ne valent pas choix de classe d'exposition des ouvrages, qui relève du géotechnicien, du bureau d'études structure et de l'entreprise de génie civil.</p>`;
  h+=sec('Bilan stœchiométrique des produits agressifs');
  h+=`<p>Chaque mole de COHV dégradée libère autant de moles de HCl que d'atomes de chlore et autant de moles de CO₂ que d'atomes de carbone. Ces apports sont comparés au pouvoir tampon de la nappe (TAC ${nf(W.tac,1)} mmol/L).</p>`;
  h+=tbl(['Ouvrage',['H⁺ COHV (mmol/L)','n'],['H⁺ sulfures (mmol/L)','n'],['CO₂ produit (mmol/L)','n'],['ΔSO₄²⁻ (mg/L)','n'],['Part du TAC','n']],res.map(r=>{const m=r.mod||{};return tr([`<b>${esc(r.el.nom)}</b>`,tn(sig(m.Hacid,2)),tn(sig(m.Hpy,2)),tn(sig(m.CO2,2)),tn(nf(m.dSO4mg||0,1)),tn(W.tac?sig((m.H||0)/W.tac*100,2)+' %':'—')])}));
  h+=sec('Modèle calco-carbonique et classes au contact');
  h+=tbl(['Ouvrage',['pH initial','n'],['pH au contact','n'],['ΔpH','n'],['SI calcite','n'],['CO₂ agr. (mg/L)','n'],['SO₄²⁻ nominal','n'],['SO₄²⁻ enveloppe','n'],'Classe nominale','Classe enveloppe'],res.filter(r=>r.water).map(r=>{const w=r.water,m=w.m;return tr([`<b>${esc(r.el.nom)}</b>`,tn(nf(m.pH0,2)),tn(nf(m.pH1,2)),tn(sig(m.dpH,2)),tn(nf(m.SIc0,2)),tn(nf(w.nominal.co2,1)),tn(n0(w.nominal.so4)),tn(n0(w.env.so4)),td(w.cmax),td(w.cmaxEnv)])}));
  if(!res.some(r=>r.water))h+=`<p>Aucun ouvrage n'atteint la zone saturée : le modèle calco-carbonique ne s'applique qu'à l'eau interstitielle.</p>`;

  // ================= 7. Traitement
  h+=ch('Effets du traitement sur l\'agressivité des eaux');
  h+=sec('Traitement modélisé');
  h+=`<p>Traitement pris en compte : <b>${esc(TRM[mode])}</b>${isco?' et <b>ISCO au persulfate de sodium activé</b>':''}. Ouvrages situés dans la zone traitée : ${zoneEl.length?esc(zoneEl.map(e=>e.nom).join(', ')):'aucun'}.</p>`;
  if(ventOn){h+=sec('Venting – sols non saturés');h+=`<p>L'extraction de l'air du sol aère la zone non saturée : les sulfures des couches au contact sont considérés oxydés à ${nf(T.venting.fOx,0)} %, ce qui augmente les sulfates du sol et l'acidité. Le rendement sur les gaz du sol (${nf(T.venting.rendement,0)} %) est donné à titre d'information ; le classement reste établi sur l'état initial des gaz.</p>`}
  if(sparOn){h+=sec('Sparging – sols saturés et nappe');h+=`<p>L'injection d'air sous la nappe oxyde les sulfures du sol saturé (FeS₂ + 15/4 O₂ + 7/2 H₂O → Fe(OH)₃ + 2 SO₄²⁻ + 4 H⁺) et minéralise une partie de la matière organique (CO₂). Le stripping du CO₂ par l'air injecté est favorable au béton.</p>`+tbl(['Paramètre',['Valeur','n']],[['Sulfures (pyrite) du sol saturé',nf(T.sparging.pyrite,0)+' mg/kg'],['Part oxydée pendant le traitement',nf(T.sparging.fOx,0)+' %'],['Facteur de dilution par l\'écoulement','× '+nf(T.sparging.dilution,0)],['foc',nf(T.sparging.foc,3)+' kg C/kg'],['Part du carbone organique minéralisée',nf(T.sparging.fMO,1)+' %'],['Porosité / masse volumique',nf(T.sparging.n,2)+' / '+nf(T.sparging.rho,2)+' kg/L']].map(r=>tr([r[0],tn(r[1])])))}
  if(isco){const I=T.isco;h+=sec('ISCO – oxydation chimique in situ (persulfate activé)');h+=`<p>Chaque mole de persulfate consommée (S₂O₈²⁻ → 2 SO₄²⁻) libère deux moles de sulfates et deux moles d'acidité. ${I.activation==='alcaline'?'L\'activation alcaline apporte de la soude (base) et du sodium. ':''}Les sulfates ajoutés à l'eau au contact sont plafonnés par la saturation en gypse.</p>`+tbl(['Paramètre',['Valeur','n']],[['Zone traitée',({zns:'sols non saturés',zs:'sols saturés et nappe',zns_zs:'sols non saturés et nappe'})[I.zone]||I.zone],['Dose de Na₂S₂O₈',nf(I.dose,1)+' kg/m³ de terrain'],['Activation',E.ISCO_ACT[I.activation]||I.activation],['Part du persulfate consommée',nf(I.fCons,0)+' %'],['Facteur de dilution au contact','× '+nf(I.dilution,0)]].map(r=>tr([r[0],tn(esc(r[1]))])));
    const ri=res.filter(r=>r.isco);if(ri.length)h+=tbl(['Ouvrage',['SO₄²⁻ ajoutés eau (mg/L)','n'],['Acidité (mmol/L)','n'],['Base (mmol/L)','n'],['SO₄²⁻ ajoutés sol (mg/kg)','n']],ri.map(r=>tr([`<b>${esc(r.el.nom)}</b>`,tn(r.isco.dSO4!=null?n0(r.isco.dSO4*96.06):'—'),tn(r.isco.H!=null?nf(r.isco.H,1):'—'),tn(r.isco.base!=null?nf(r.isco.base,1):'—'),tn(r.isco.so4Sol!=null?n0(r.isco.so4Sol):'—')])))}
  // ---- gradient d'oxydant (v1.6)
  const OXR=E.oxydant(P,A),GX=window.AGRESOL_OX,oxIt=OXR.items.filter(it=>it.segs.some(g=>g.trait));
  const sgn=v=>(v>0?'+':'')+nf(v,0),dx=v=>v==null?'—':(!isFinite(v)?'> '+nf(OXR.opts.rMax,1)+' m':(v<1?nf(v*100,0)+' cm':nf(v,2)+' m'));
  h+=sec('Gradient d\'oxydant (O₂) et potentiel redox au contact des ouvrages');
  h+=`<p>Le venting et le sparging apportent de l'oxygène au contact des fondations. L'oxygène et le potentiel redox (Eh) conditionnent l'oxydation des sulfures du terrain (production de sulfates et d'acidité) et la stabilité des composés réduits. AGRESOL calcule, couche par couche, la teneur en oxygène dissous et le potentiel redox en fonction de la distance à la paroi de l'ouvrage, en régime permanent.</p>`;
  h+=`<p><b>Modèle.</b> L'oxygène diffuse depuis l'interface de l'ouvrage, où la teneur est imposée par le traitement (C₀), et il est consommé par le terrain selon une cinétique du premier ordre (constante k). Loin de l'ouvrage, la teneur tend vers la valeur naturelle de la couche (C<sub>b</sub>). Pour un pieu de rayon r₀, la solution radiale s'écrit C(r) = C<sub>b</sub> + (C₀ − C<sub>b</sub>) · K₀(r/λ) / K₀(r₀/λ), où K₀ est la fonction de Bessel modifiée de seconde espèce. Pour une paroi plane (longrine, radier), C(x) = C<sub>b</sub> + (C₀ − C<sub>b</sub>) · exp(−x/λ). La longueur caractéristique λ = √(D<sub>e</sub> / (θ<sub>w</sub> · k)) est calculée avec un coefficient de diffusion effectif de Millington-Quirk, D<sub>e</sub> = D<sub>air</sub> · θ<sub>a</sub><sup>10/3</sup>/n² · H + D<sub>eau</sub> · θ<sub>w</sub><sup>10/3</sup>/n² + D<sub>ind</sub>. Ici, H est la constante de Henry adimensionnelle de l'O₂ (${nf(OXR.H,1)} à ${nf(OXR.T,0)} °C) et D<sub>ind</sub> la dispersion induite par l'air injecté en zone saturée. Le potentiel redox suit la même fonction d'atténuation entre la valeur sous traitement et la valeur naturelle. Seuils retenus : oxique Eh ≥ +100 mV, suboxique de −100 à +100 mV, réducteur Eh &lt; −100 mV.</p>`;
  h+=tbl(['Couche','Zone',['O₂ naturel (mg/L)','n'],['O₂ sous traitement (mg/L)','n'],['Eh naturel (mV)','n'],['Eh sous traitement (mV)','n'],['k (1/j)','n'],['D<sub>ind</sub> (m²/j)','n'],['λ','n'],'Origine'],P.layers.map(L=>{const sat=(L.top+L.bottom)/2>P.nappe.zwt,q=E.oxLayer(P,L,sat,true),sv=Object.values(q.src).some(x=>x==='saisi');
    return tr([esc(L.nom),sat?'saturée':'non saturée',tn(nf(q.Cb,1)),tn(nf(q.C0,1)),tn(sgn(q.ehNat)),tn(sgn(q.ehTrait)),tn(nf(q.k,2)),tn(nf(q.dInd,2)),tn(GX.lam(q.lam)),sv?'saisi (en partie)':'valeurs par défaut'])}));
  h+=`<p class="small">Saturation de l'eau en oxygène à ${nf(OXR.T,0)} °C : ${nf(OXR.Cs,1)} mg/L (21 % vol d'O₂ dans l'air). Valeurs par défaut : zone non saturée 70 % de la saturation hors traitement et saturation sous venting, Eh +250 / +400 mV ; zone saturée 1,0 mg/L hors traitement et 90 % de la saturation sous sparging, Eh +50 / +350 mV ; k = 0,1 j⁻¹. Ces valeurs sont à caler sur les mesures in situ (O₂ dissous, Eh) du suivi.</p>`;
  if(!oxIt.length)h+=`<p>Aucun ouvrage n'est situé dans une couche soumise au traitement : la teneur en oxygène et le potentiel redox au contact des ouvrages sont ceux du terrain naturel.</p>`;
  for(const it of oxIt){h+=`<figure>${GX.coupe(it,OXR,P)}<figcaption>Figure ${F()} – ${esc(it.el)} : teneur en oxygène dissous et potentiel redox calculés en fonction de la distance à la paroi et de la profondeur</figcaption></figure>`;
    h+=tbl(['Couche','Profondeur','Traitement',['λ','n'],['O₂ interface (mg/L)','n'],['O₂ à 1 m (mg/L)','n'],['O₂ naturel (mg/L)','n'],['Distance 50 %','n'],['Distance 10 %','n'],['Eh interface (mV)','n'],['Eh à 1 m (mV)','n'],'Milieu au contact'],it.segs.map(g=>tr([esc(g.couche),nf(g.z1,1)+' – '+nf(g.z2,1)+' m',g.trait?esc(g.via):'—',tn(GX.lam(g.q.lam)),tn(nf(g.c0,1)),tn(nf(g.c1,1)),tn(nf(g.q.Cb,1)),tn(g.trait?dx(g.x50):'—'),tn(g.trait?dx(g.x10):'—'),tn(sgn(g.eh0)),tn(sgn(g.eh1)),esc(g.zone0)])));
    h+=`<ul class="b">${it.constats.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`}
  if(oxIt.length)h+=`<p>Ce calcul décrit l'extension de la zone oxydée autour des ouvrages ; il ne modifie pas les classes de la section suivante. Celles-ci retiennent déjà l'hypothèse majorante d'une oxydation des sulfures des couches traitées. Les distances « 50 % » et « 10 % » sont celles où l'écart entre la teneur au contact et la teneur naturelle est réduit de moitié et de 90 %. L'apport d'oxygène est limité à la durée du traitement ; après l'arrêt, le terrain revient progressivement à son état redox naturel.</p>`;
  h+=sec('Synthèse des effets du traitement');
  h+=tbl(['Ouvrage','Zone traitée','Effets pris en compte','Classe au contact','Paramètre(s)'],res.map(r=>tr([`<b>${esc(r.el.nom)}</b>`,r.el.zoneTraitement?'oui':'non',esc([r.trait.venting?'venting':'',r.trait.sparging?'sparging':'',r.trait.isco?'ISCO':''].filter(Boolean).join(', ')||'—'),td(r.classe),esc(r.agression.join(', ')||'—')])));

  // ================= 8. Classes
  h+=ch(R.question&&/XA/.test(R.question)?R.question.replace(/\s*\?$/,' ?'):'Classes de la norme correspondant à la chimie observée');
  h+=sec('Classes de la norme correspondant à la chimie observée');
  h+=tbl(['Ouvrage','Milieu','Eau – nominal','Eau – enveloppe','Sol (ZNS)','Classe au contact','Constat'],res.map(r=>tr([`<b>${esc(r.el.nom)}</b>`,esc(zoneOf(r)),r.water?td(r.water.cmax):'<td>—</td>',r.water?td(r.water.cmaxEnv):'<td>—</td>',r.soil&&r.soil.detail.length?td(r.soil.cmax):'<td>—</td>',td(r.classe),esc(r.agression.join(', ')||'Tous les paramètres sous les seuils XA1')])));
  h+=`<p>Les classes indiquées sont celles qui correspondent, au sens de la norme, à la caractéristique la plus défavorable au contact de chaque ouvrage. Le choix des classes d'exposition à retenir pour les ouvrages relève du géotechnicien, du bureau d'études structure et de l'entreprise de génie civil.</p>`;
  const acd=res.flatMap(r=>r.acid.detail.map(d=>({...d,el:r.el.nom})));
  if(acd.length){h+=sec('Sols et sols acides');h+=tbl(['Ouvrage','Couche',['pH sol','n'],['S réduit (%)','n'],['Acidité nette (mol H⁺/t)','n'],['SO₄ total potentiel (mg/kg)','n'],'Classe (sol)','Constat'],acd.map(d=>tr([esc(d.el),esc(d.nom),tn(d.pHs==null?'—':nf(d.pHs,1)),tn(nf(d.Scr,2)),tn(n0(d.net)),tn(n0(d.so4Pot)),td(d.c),esc(d.statut)])))}
  const hs=res.filter(r=>r.h2s);
  if(hs.length){h+=sec('H₂S – corrosion biogène (indicatif)');h+=tbl(['Ouvrage',['H₂S au contact (µg/m³)','n'],['ppm','n'],['Acide produit (mol H⁺/m²/an)','n'],[`Épaisseur neutralisable à ${P.beton.duree} ans (mm)`,'n']],hs.map(r=>tr([`<b>${esc(r.el.nom)}</b>`,tn(n0(r.h2s.cg)),tn(nf(r.h2s.ppm,2)),tn(sig(r.h2s.Hp,3)),tn(nf(r.h2s.depth,1))])))+`<p class="small">Agression non couverte par le tableau 2 de la NF EN 206 (environnement particulier au sens du FD P18-011). Calcul d'ordre de grandeur.</p>`}

  // ================= 9. Suivi
  h+=ch(`Repères de suivi${pz?' de '+pzId:''} et points de vigilance`);
  h+=sec(`Repères de suivi de la nappe${pz?' – '+pzId:''}`);
  h+=tbl(['Paramètre',['Valeur actuelle','n'],['Seuil XA1','n'],['Seuil XA2','n'],['Écart au seuil XA1','n'],'Classe actuelle'],Object.entries(E.XA_WATER).filter(([k])=>W[k]!=null).map(([k,d])=>tr([d.lab,tn(lq(k)+nf(W[k],k==='pH'?1:(W[k]<10?2:0))),tn(thr(d,0)),tn(thr(d,1)),tn(d.dir>0?nf(d.t[0]-W[k],k==='nh4'?2:0):nf(W[k]-d.t[0],1)+' unité'),td(wcls[k])])));
  h+=`<p>Ces repères correspondent aux seuils de la norme. Le programme, la fréquence et la durée du suivi sont ceux fixés par le plan de gestion. Le franchissement d'un seuil signifie que la chimie de la nappe correspond à une classe supérieure ; il est porté sans délai à la connaissance de la maîtrise d'œuvre.</p>`;
  if(oxIt.length){h+=sec('Repères redox du suivi (O₂ dissous et Eh)');const zs=[];for(const it of oxIt)for(const g of it.segs)if(g.sat&&!zs.some(z=>z.couche===g.couche))zs.push(g);
    h+=zs.length?tbl(['Couche saturée',['O₂ naturel (mg/L)','n'],['O₂ calculé à 1 m (mg/L)','n'],['Eh naturel (mV)','n'],['Eh calculé à 1 m (mV)','n']],zs.map(g=>tr([esc(g.couche),tn(nf(g.q.Cb,1)),tn(nf(g.c1,1)),tn(sgn(g.q.ehNat)),tn(sgn(g.eh1))])))+`<p>Les mesures in situ d'oxygène dissous et de potentiel redox${pz?' sur '+esc(pzId):''} (sonde multiparamètres, avant prélèvement) permettent de comparer l'état de la nappe aux valeurs du calcul et de caler les paramètres de la couche (O₂ et Eh naturels, consommation k, dispersion induite). Un Eh mesuré supérieur à la valeur calculée indique une extension de la zone oxydée plus grande que celle du modèle.</p>`:'<p>Aucune couche saturée traitée au contact des ouvrages.</p>'}
  h+=sec('Points de vigilance');
  const fl=res.flatMap(r=>r.flags.map(f=>[r.el.nom,f]));
  h+=fl.length?tbl(['Ouvrage','Observation'],fl.map(f=>tr([`<b>${esc(f[0])}</b>`,esc(f[1])]))):'<p>Aucun point de vigilance relevé par la modélisation.</p>';

  // ================= 10. Conclusions
  h+=ch('Conclusions et recommandations');
  h+=sec('Conclusions');
  h+=`<ul class="b">${B.map(b=>`<li>${b}</li>`).join('')}${ACD.items[E.COHV_MIX].site>0&&ACD.items[E.COHV_MIX].xa1?`<li>Acidité produite par la dégradation des COHV (hypothèse majorante, chapitre 6) : la teneur maximale au contact (${cs(ACD.items[E.COHV_MIX].site)}) est inférieure d'un facteur ${GA.fois(ACD.items[E.COHV_MIX].xa1/ACD.items[E.COHV_MIX].site).replace('× ','')} à la concentration qui conduirait la nappe au seuil XA1 (${cs(ACD.items[E.COHV_MIX].xa1)}).</li>`:''}${oxIt.map(it=>`<li>Gradient d'oxydant au contact de ${esc(it.el)} (chapitre 7) : ${it.segs.filter(g=>g.trait).map(g=>`${esc(g.couche)} (${esc(g.via)}) – O₂ ${nf(g.c0,1)} mg/L à l'interface et ${nf(g.c1,1)} mg/L à 1 m, Eh ${sgn(g.eh0)} mV au contact, milieu ${esc(g.zone0.toLowerCase())}`).join(' ; ')}. Ce calcul ne modifie pas les classes, qui retiennent déjà l'oxydation des sulfures des couches traitées.</li>`).join('')}<li>Classe la plus élevée au contact des ouvrages : <b>${CL[cmax]}</b> (${esc(crit.map(r=>r.el.nom).join(', '))}).</li></ul>`;
  h+=sec('Recommandations relevant de la mission G.M.E.P');
  const rc=[];
  if(pz)rc.push(`<b>Suivi</b> : analyser sur ${esc(pzId)} les paramètres du tableau 2 (SO₄²⁻, pH, CO₂ agressif, Mg²⁺, NH₄⁺) et le TAC aux échéances du plan de gestion${mode!=='aucun'||isco?', pendant et après le traitement':''}, et comparer les résultats aux repères du chapitre 9.`);
  const miss=[];if(res.some(r=>r.flags.some(f=>/non renseign/i.test(f))))miss.push('sulfates totaux et acidité des sols au contact des ouvrages');for(const k of ['so4','pH','co2','mg','nh4'])if(W[k]==null)miss.push(E.XA_WATER[k].lab);
  if(miss.length)rc.push(`<b>Compléments analytiques</b> : ${esc(miss.join(' ; '))}.`);
  rc.push(`<b>Transmission</b> : porter les constats du présent rapport (chimie de la nappe et des gaz du sol, classes de la norme correspondantes, effets du traitement) à la connaissance du géotechnicien, du bureau d'études structure et de la maîtrise d'œuvre, à qui revient le choix des classes d'exposition des ouvrages et des dispositions constructives.`);
  h+=`<ul class="b">${rc.map(x=>`<li>${x}</li>`).join('')}</ul>`;

  // ================= Annexes
  h+=ann('A1','Coordonnées et localisation',true);
  const wg=pr.x!=null&&window.AGRESOL_L93?null:null;
  h+=tbl(['Élément',['X Lambert 93','n'],['Y Lambert 93','n'],['Altitude (m NGF)','n'],'Observations'],[tr([`<b>Projet</b>`,tn(pr.x!=null?n0(pr.x):'—'),tn(pr.y!=null?n0(pr.y):'—'),tn(nf(pr.z,2)),esc([pr.adresse,pr.parcelle?'parcelle '+pr.parcelle:'',pr.idu?'IDU '+pr.idu:'',pr.surface?n0(pr.surface)+' m²':''].filter(Boolean).join(' – '))]),...pzs.map(z=>tr([esc(z.id),tn(z.x!=null?n0(z.x):'—'),tn(z.y!=null?n0(z.y):'—'),tn(nf(z.zTete,2)),z.d!=null?'à '+nf(z.d,1)+' m du projet':''])),...(G.source?[tr([esc(G.source),tn('—'),tn('—'),tn(nf(G.zsol,2)),'ouvrage BSS (géologie locale)'])]:[])]);
  h+=ann('A2','Données d\'entrée de la modélisation',false);
  h+=`<h3>Nappe et chimie</h3>`+tbl(['Paramètre',['Valeur','n']],[['Toit de la nappe',nf(P.nappe.zwt,2)+' m'],['Battement',nf(P.nappe.battement,1)+' m'],['Température',nf(P.nappe.T,1)+' °C'],['Incertitude / marge pH','±'+nf(u,0)+' % / ±'+nf(uPH,1)],['Échange frange capillaire',sig(P.nappe.hCap,2)+' m/s'],...Object.entries(W).filter(e=>e[1]!=null).map(([k,v])=>[({ph:'pH',co2:'CO₂ agressif (mg/L)',so4:'SO₄²⁻ (mg/L)',mg:'Mg²⁺ (mg/L)',nh4:'NH₄⁺ (mg/L)',ca:'Ca²⁺ (mg/L)',tac:'TAC (mmol/L)',cl:'Cl⁻ (mg/L)',no3:'NO₃⁻ (mg/L)',s2:'Sulfures (mg/L)',hco3:'HCO₃⁻ (mg/L)'})[k]||k,nf(v,v<10?2:0)])].map(r=>tr([esc(r[0]),tn(esc(r[1]))])));
  h+=`<h3>Composés modélisés</h3>`+tbl(['Composé',['M (g/mol)','n'],['H\' (-)','n'],['Da (m²/s)','n'],['Dw (m²/s)','n'],['S (mg/L)','n']],subs.map(k=>{const s=P.substances[k];return tr([esc(s.nom),tn(nf(s.M,2)),tn(nf(s.H,3)),tn(sig(s.Da,2)),tn(sig(s.Dw,2)),tn(n0(s.S))])}));
  h+=`<h3>Plancher bas, béton et scénario</h3>`+tbl(['Paramètre',['Valeur','n']],[['Épaisseur du plancher bas',nf(P.dalle.e,2)+' m'],['Diffusion COHV dans le béton',sig(P.beton.DcohvBeton,2)+' m²/s'],['Diffusion des sulfates dans le béton',sig(P.beton.Dso4,2)+' m²/s'],['Durée de référence',n0(P.beton.duree)+' ans'],['Dégradation des COHV dissous',nf(P.scenario.fDeg,0)+' %'],['Contact avec une phase pure (DNAPL)',P.scenario.dnapl?'oui':'non']].map(r=>tr([r[0],tn(r[1])])));
  h+=ann('A3','Détail des calculs',true);
  for(const r of res){h+=`<h3>${esc(r.el.nom)} – ${esc(E.ELEM_TYPES[r.el.type])}</h3>`+tbl(['Grandeur',['Valeur','n']],[['Contact (tête – pied)',`${nf(r.ct.z1,2)} – ${nf(r.ct.z2,2)} m`],['Épaisseur / diamètre',nf(r.ct.epaisseur,2)+' m'],['Hauteur en zone non saturée / en nappe',`${nf(r.hUnsat,2)} / ${nf(r.hSat,2)} m`],['Surface de contact',nf(r.geom.Sc,2)+' '+r.geom.unit],['Point de gaz',r.pt||'—'],['Couche au contact en nappe',r.water?r.water.layer:'—'],['Front de sulfates (≥ 200 mg/L)',r.durab?`${nf(r.durab.xcrit,1)} mm à ${n0(P.beton.duree)} ans – ${r.durab.etat}`:'—'],['Classe au contact',CL[r.classe]+(r.agression.length?' – '+r.agression.join(', '):'')]].map(x=>tr([x[0],tn(esc(x[1]))])))}
  h+=ann('A4','Profils verticaux de gaz et d\'eau interstitielle (complément)',true);
  h+=`<p>Profils de concentration dans les gaz du sol calculés entre la zone source de chaque point et la surface, et teneurs de l'eau interstitielle à l'équilibre au contact des ouvrages (loi de Henry). Ces teneurs au contact alimentent les graphiques du chapitre 6.</p>`;
  const pf=(pay.svg&&pay.svg.profils)||[];
  for(let i=0;i<pf.length;i+=2){const a=pf[i],b=pf[i+1];h+=`<figure><div class="fig2"><div>${a.svg}</div>${b?`<div>${b.svg}</div>`:'<div></div>'}</div><figcaption>Figure ${F()} – Profils de ${esc(a.sub)} dans les gaz du sol : ${esc(a.pt)}${b?' et '+esc(b.pt):''}</figcaption></figure>`}
  h+=`<h3>Teneurs maximales dans les gaz et dans l'eau au contact</h3>`+tbl(['Ouvrage','Point',...subs.flatMap(k=>[[`${k} gaz max (µg/m³)`,'n'],[`${k} eau contact (µg/L)`,'n']])],res.map(r=>tr([`<b>${esc(r.el.nom)}</b>`,esc(r.pt||''),...subs.flatMap(k=>[tn(sig(r.subs[k].cgMax,3)),tn(sig(r.subs[k].cwContact,3))])])));
  h+=ann('A5','Références',false);
  const refs=[['NF EN 206+A2/CN – Béton : spécification, performances, production et conformité (tableau 2, classes XA)','https://www.boutique.afnor.org/'],['FD P18-011 – Béton : définition et classification des environnements chimiquement agressifs','https://www.boutique.afnor.org/'],['NF X31-620-2 – Qualité du sol : prestations de services relatives aux sites et sols pollués','https://www.boutique.afnor.org/'],['NF EN 13577 – Attaque chimique du béton : détermination de la teneur en dioxyde de carbone agressif','https://www.boutique.afnor.org/'],['BRGM – InfoTerre, carte géologique et Banque du sous-sol','https://infoterre.brgm.fr/'],['IGN – Géoplateforme (géocodage, altimétrie RGE ALTI)','https://geoservices.ign.fr/'],['IGN – API Carto, module cadastre','https://apicarto.ign.fr/api/doc/cadastre'],['Millington R. J., Quirk J. P. (1961) – Permeability of porous solids, Trans. Faraday Soc. 57','https://doi.org/10.1039/TF9615701200']];
  h+=`<ol class="small">${refs.map(r=>`<li>${esc(r[0])} – <a href="${r[1]}">${esc(r[1])}</a></li>`).join('')}</ol>`;
  h+=`<p class="small muted">Rapport généré par AGRESOL v1.6 le ${new Date().toLocaleString('fr-FR')} à partir de l'étude ${esc(et.meta.cle)} (fichier ${esc(et.meta.fichier)}).</p>`;

  // sommaire
  const tocH=toc.map(t=>`<li class="l${t.l}"><a href="#${t.id}"><span>${esc(t.t)}</span><span class="d"></span></a></li>`).join('');
  h=h.replace('<ul class="toc" id="toc"></ul>',`<ul class="toc" id="toc">${tocH}</ul>`);
  // pied de page
  const stl=document.querySelector('#rstyle');stl.textContent=stl.textContent.replace('@bottom-left{content:"";',`@bottom-left{content:"${pied.replace(/["\\]/g,'')}";`);
  document.title=`${REF} ${IND} – Rapport AGRESOL`;
  bar.remove();wait.remove();
  const main=document.createElement('main');main.innerHTML=h;document.body.appendChild(main);
  window.__ET=et;
}
function done(){
  document.body.prepend(bar);bar.querySelector('#bt').textContent=`${document.title} – ${document.querySelectorAll('.pagedjs_page').length} pages`;
  document.body.style.paddingTop='44px';
  window.__RAPPORT_OK=true;
}
function dl(name,text,type){const b=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
bar.querySelector('#bPdf').addEventListener('click',()=>window.print());
bar.querySelector('#bJson').addEventListener('click',()=>{const et=window.__ET||pay.etude;dl(et.meta.fichier,JSON.stringify(et,null,1),'application/json')});
bar.querySelector('#bHtml').addEventListener('click',()=>{const et=window.__ET||pay.etude;const st=[...document.querySelectorAll('style')].map(s=>s.outerHTML).join('');const pages=document.querySelector('.pagedjs_pages');
  dl(et.meta.fichier.replace(/_agresol\.json$/,'_rapport.html'),`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(document.title)}</title>${st}<style>.bar{display:none}</style></head><body>${pages?pages.outerHTML:''}</body></html>`,'text/html')});
})();
