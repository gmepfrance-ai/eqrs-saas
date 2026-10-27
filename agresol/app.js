(function(){
'use strict';
const E=window.AGRESOL;
let P=E.exemple(),A=null,tab='projet',selEl=0;E.migrate(P);
const $=s=>document.querySelector(s);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const nf=(x,d=1)=>x==null||!isFinite(x)?'—':Number(x).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const sci=x=>x==null||!isFinite(x)?'—':(Math.abs(x)>=0.01&&Math.abs(x)<1e5?nf(x,Math.abs(x)<1?3:1):x.toExponential(2).replace('.',','));
const pill=c=>`<span class="pill p${c}">${E.CLASSES[c]}</span>`;
// ------------------------------------------------------------ accès par chemin
const get=(o,p)=>p.split('.').reduce((a,k)=>a==null?a:a[k],o);
function set(o,p,v){const ks=p.split('.');let a=o;for(let i=0;i<ks.length-1;i++)a=a[ks[i]];a[ks[ks.length-1]]=v}
function field(path,label,opt={}){
  const v=get(P,path);const id='i_'+path.replace(/\W/g,'_');
  if(opt.type==='check')return `<div class="f"><label for="${id}">${label}${opt.hint?`<small>${opt.hint}</small>`:''}</label><input id="${id}" type="checkbox" data-p="${path}" data-t="check" ${v?'checked':''}></div>`;
  if(opt.type==='select')return `<div class="f"><label for="${id}">${label}</label><select id="${id}" data-p="${path}" data-t="text">${opt.options.map(([k,l])=>`<option value="${esc(k)}" ${k==v?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`;
  if(opt.type==='area')return `<div class="f ft fa"><label for="${id}">${label}${opt.hint?`<small>${opt.hint}</small>`:''}</label><textarea id="${id}" rows="${opt.rows||2}" data-p="${path}" data-t="text" ${opt.ph?`placeholder="${opt.ph}"`:''}>${esc(v==null?'':v)}</textarea></div>`;
  const t=opt.type||'num';
  return `<div class="f${t==='text'?' ft':''}"><label for="${id}">${label}${opt.hint?`<small>${opt.hint}</small>`:''}</label><input id="${id}" ${t==='text'?'type="text"':'inputmode="decimal"'} data-p="${path}" data-t="${t}" value="${v==null?'':esc(t==='num'?String(v).replace('.',','):v)}" ${opt.ph?`placeholder="${opt.ph}"`:''}></div>`}
function oxFields(L,i){const sat=(L.top+L.bottom)/2>P.nappe.zwt;const a=E.oxLayer(P,L,sat,true).auto;const sg=v=>(v>0?'+':'')+v;
  return `<div class="subh">Oxydant (O₂) et potentiel redox – gradient au contact <span class="muted">(vide = valeur automatique, ${sat?'zone saturée':'zone non saturée'})</span></div><div class="mini">`+
   field(`layers.${i}.o2Nat`,'O₂ naturel (mg/L)',{ph:'auto '+nf(a.o2Nat,1),hint:sat?'mesure in situ au piézomètre':'21 % vol O₂ ≈ '+nf(E.o2Sat(P.nappe.T),1)+' mg/L à '+nf(P.nappe.T,0)+' °C'})+
   field(`layers.${i}.o2Trait`,'O₂ sous traitement (mg/L)',{ph:'auto '+nf(a.o2Trait,1),hint:sat?'sparging, à l\'interface':'venting, à l\'interface'})+
   field(`layers.${i}.ehNat`,'Eh naturel (mV)',{ph:'auto '+sg(a.ehNat)})+
   field(`layers.${i}.ehTrait`,'Eh sous traitement (mV)',{ph:'auto '+sg(a.ehTrait)})+
   field(`layers.${i}.kO2`,'Consommation O₂ k (1/j)',{ph:'auto '+nf(a.kO2,2),hint:'demande en oxygène du sol'})+
   field(`layers.${i}.dInd`,'Dispersion induite (m²/j)',{ph:'auto '+nf(a.dInd,2),hint:'mélange par l\'air injecté'})+`</div>`}
// ------------------------------------------------------------ formulaires
const FORM=window.AGRESOL_FORM,GEO=window.AGRESOL_GEO,LAB=window.AGRESOL_LAB;
const fById=id=>FORM.list.find(f=>f.id===id);
function badges(f){if(!f)return '';const b=[];if(f.gyp)b.push('<span class="bdg bg">sulfates</span>');if(f.pyr)b.push('<span class="bdg bp">sulfures</span>');if(f.cal)b.push('<span class="bdg bc">carbonaté</span>');if(f.org)b.push('<span class="bdg bo">mat. organique</span>');return b.join('')}
function picker(target,cur,label){const f=cur?fById(cur):null;return `<button type="button" class="fpick" data-pick="${target}"><span>${f?`<b>${esc(f.code)}</b> ${esc(f.nom)} <span class="muted">– ${esc(f.etage)}</span>`:esc(label||'Choisir une formation géologique…')}</span><span class="caret">▾</span></button>${f?`<div class="bdgs">${badges(f)}</div>`:''}`}
function locInfo(){const p=P.projet;const r=(k,v)=>`<tr><td>${k}</td><td>${v==null||v===''?'<span class="muted">—</span>':v}</td></tr>`;
  const w=GEO.okL93(p.x,p.y)?GEO.l93ToWgs(p.x,p.y):null;
  return `<table class="loc">${r('Adresse',esc(p.adresse))}${r('Commune (INSEE)',p.commune?esc(p.commune)+(p.insee?' ('+esc(p.insee)+')':''):'')}${r('Parcelle cadastrale',p.parcelle?esc(p.parcelle)+(p.parcelleProche?' <span class="muted">(parcelle la plus proche)</span>':''):'')}${r('Identifiant parcelle',esc(p.idu))}${r('Surface de la parcelle',p.surface?nf(p.surface,0)+' m²':'')}${r('Altitude NGF',p.z!=null?nf(p.z,2)+' m'+(p.zSource?` <span class="muted">(${esc(p.zSource)})</span>`:''):'')}${r('Carte géologique 1/50 000',p.feuille?`n° ${esc(p.feuille)} ${esc(p.nomFeuille||'')} – <a href="http://ficheinfoterre.brgm.fr/Notices/${String(p.feuille).padStart(4,'0')}N.pdf" target="_blank" rel="noopener">notice BRGM</a>`:'')}${r('Lithologie 1/1 000 000',esc(p.litho1M))}${r('WGS84',w?nf(w.lat,6)+' N ; '+nf(w.lon,6)+' E':'')}</table><p class="hint" id="locMsg">${esc(p.locMsg||'Saisir X et Y : adresse, parcelle, surface et altitude sont renseignées automatiquement (IGN : Géoplateforme, API Carto cadastre, RGE ALTI ; BRGM).')}</p>`}
function piezoDerived(pz){const p=P.projet;const o={};if(GEO.okL93(p.x,p.y)&&GEO.okL93(pz.x,pz.y))o.d=Math.hypot(pz.x-p.x,pz.y-p.y);
  if(pz.zTete!=null&&pz.zNappe!=null)o.profTete=pz.zTete-pz.zNappe;if(p.z!=null&&pz.zNappe!=null)o.zwt=p.z-pz.zNappe;if(pz.zTete!=null&&pz.prof!=null)o.zFond=pz.zTete-pz.prof;return o}
function syncDerived(){ // valeurs automatiques : toit de nappe et incertitudes
  if(P.nappe.zwtAuto){const ref=P.piezos.find(z=>z.ref)||P.piezos[0];if(ref){const d=piezoDerived(ref);if(d.zwt!=null&&isFinite(d.zwt)&&d.zwt>0)P.nappe.zwt=Math.round(d.zwt*100)/100}}
  if(P.nappe.incertAuto){const a=P.analyses.eau||{};const r=LAB.incertitude({eau:P.nappe.chimie,inc:a.inc||{},lq:a.lq||{}});P.nappe.incert=r.rel;P.nappe.incertPH=r.abs;P._inc=r}}
function renderForms(){
  let h='';
  if(tab==='projet'){h+=`<h3>Identification</h3>`+field('projet.nom','Projet',{type:'text'})+field('projet.site','Site',{type:'text'})+field('projet.ref','Référence',{type:'text'})+field('projet.auteur','Établi par',{type:'text'})+field('projet.date','Date',{type:'text'});
    h+=`<div class="bloc"><h3>Rapport d'étude</h3><p class="hint">Champs de la page de garde, de l'en-tête et du pied de page du rapport édité (présentation G.M.E.P). Les champs vides sont complétés automatiquement.</p>`+field('rapport.indice','Indice',{type:'text'})+field('rapport.objet','Objet du rapport',{type:'area'})+field('rapport.question','Question posée',{type:'area',hint:'reprise en note de synthèse',ph:'ex. Le classement < XA1 obtenu sur PZ1 peut-il être retenu ?'})+field('rapport.moa','Maître d\'ouvrage',{type:'area',ph:'Nom — adresse\nContact'})+field('rapport.moe','Maîtrise d\'œuvre',{type:'area'})+field('rapport.amo','AMO',{type:'area'})+field('rapport.bet','Bureau d\'études SSP / Hydrologie',{type:'area'})+field('rapport.etabli','Établi par (signataire)',{type:'text'})+field('rapport.fonction','Fonction',{type:'text'})+field('rapport.contact','Contact du signataire',{type:'text'})+field('rapport.prestations','Prestations',{type:'area'})+field('rapport.campagne','Campagne',{type:'area',ph:'dates, ouvrages et laboratoires'})+field('rapport.titreCourt','Titre de l\'en-tête',{type:'text',ph:'automatique'})+field('rapport.pied','Pied de page',{type:'text',ph:'automatique'})+`</div>`;
    h+=`<h3>Localisation du projet</h3><p class="hint">Coordonnées en Lambert 93 (EPSG:2154). L'altitude NGF est celle du niveau de référence du modèle (profondeurs 0 m). Laisser vide pour la renseigner par le RGE ALTI de l'IGN.</p>`+field('projet.x','X Lambert 93 (m)')+field('projet.y','Y Lambert 93 (m)')+field('projet.z','Altitude NGF (m)',{ph:'automatique'})+
      `<div class="f ft"><label for="qAdr">Rechercher par adresse<small>remplit X et Y</small></label><div class="inl"><input type="text" id="qAdr" placeholder="ex. 41 rue des Bussys, Eaubonne"><button class="btn sm" data-act="geocode">Chercher</button></div></div><div class="inl" style="margin:4px 0 8px"><button class="btn sm" data-act="locate">Mettre à jour adresse, parcelle et altitude</button></div><div id="locInfo">${locInfo()}</div>`;
    h+=`<h3>Options de classement</h3>`+field('options.enveloppe','Classer sur l\'enveloppe haute',{type:'check',hint:'valeurs × (1 + incertitude) et pH − marge'})+field('options.regle2','Règle des 2 caractéristiques',{type:'check',hint:'2 paramètres dans la même classe → classe supérieure (à vérifier dans la NF EN 206)'})+field('acide.actif','Tenir compte de l\'oxydation des sulfures',{type:'check',hint:'couches cochées « exposée à l\'oxydation » classées sur le SO₄ total potentiel et l\'acidité nette'});
    h+=`<p class="hint">La classe XA indiquée pour chaque élément est celle qui correspond, au sens de la norme, à la caractéristique la plus défavorable (NF EN 206+A2/CN, tableau 2 ; FD P18-011). Les éléments en zone saturée ou en zone de battement sont classés avec la chimie de la nappe modifiée par les scénarios ; la partie non saturée est classée avec les analyses de sol.</p>`}
  if(tab==='sol'){
    h+=`<div class="bloc"><h3>Coupe géologique de terrain</h3><p class="hint">Report des sondages du site. Profondeurs en m sous le niveau de référence${P.projet.z!=null?` (${nf(P.projet.z,2)} m NGF)`:''}. Le choix d'une formation renseigne la porosité, θa, θw et le caractère calcaire (modifiables).</p>`+field('coupeSource','Sondage(s) de référence',{type:'text',ph:'ex. SC1, SC2 – rapport G2 AVP'});
    P.layers.forEach((L,i)=>{h+=`<div class="rowcard"><div class="rh"><input type="text" data-p="layers.${i}.nom" data-t="text" value="${esc(L.nom)}" aria-label="Nom de la couche"><button class="del" data-del="layers.${i}">Supprimer</button></div>${picker('layer:'+i,L.formation)}<div class="mini">`+
      field(`layers.${i}.top`,'Toit (m)')+field(`layers.${i}.bottom`,'Base (m)')+field(`layers.${i}.n`,'Porosité n')+field(`layers.${i}.ta`,'θa')+field(`layers.${i}.tw`,'θw')+field(`layers.${i}.calcaire`,'Calcaire',{type:'check'})+
      field(`layers.${i}.so4s`,'SO₄ total (mg/kg)',{ph:'non mesuré'})+field(`layers.${i}.bg`,'Acidité B-G (mL/kg)',{ph:'non mesuré'})+`</div><div class="subh">Sols acides – sulfures</div><div class="mini">`+
      field(`layers.${i}.pHsol`,'pH eau du sol',{ph:'non mesuré'})+field(`layers.${i}.scr`,'S réduit S<sub>Cr</sub> (% S)',{ph:'non mesuré'})+field(`layers.${i}.caco3`,'CaCO₃ (%)',{ph:'non mesuré'})+field(`layers.${i}.taa`,'Acidité TAA (mol H⁺/t)',{ph:'0'})+field(`layers.${i}.oxydable`,'Exposée à l\'oxydation',{type:'check',hint:'terrassement, drainage, battement, venting'})+`</div>`+oxFields(L,i)+`</div>`});
    h+=`<button class="add" data-add="layer">+ Ajouter une couche</button></div>`;
    const G=P.geolLocale;
    h+=`<div class="bloc"><h3>Géologie locale (BRGM)</h3><p class="hint">Forages de la Banque du sous-sol (BSS) autour du point du projet et formations de la carte géologique, pour comparaison avec la coupe de terrain. ${P.projet.feuille?`Feuille 1/50 000 n° ${esc(P.projet.feuille)} ${esc(P.projet.nomFeuille||'')}.`:''}</p>`+
      field('geolLocale.rayon','Rayon de recherche (m)')+`<div class="inl" style="margin:4px 0 8px"><button class="btn sm" data-act="bss">Rechercher les forages BSS</button></div><div id="bssList">${bssListHtml()}</div>`+
      `<div class="subh">Couches géologiques locales ${G.source?`<span class="muted">– ${esc(G.source)}${G.zsol!=null?`, sol à ${nf(G.zsol,2)} m NGF`:''}</span>`:''}</div>`;
    G.layers.forEach((L,i)=>{h+=`<div class="rowcard"><div class="rh"><span>${esc(L.litho||L.nom||'Formation')}</span><button class="del" data-delg="${i}">Supprimer</button></div>${picker('geol:'+i,L.formation,'Associer une formation du catalogue…')}<div class="mini">`+field(`geolLocale.layers.${i}.top`,'Toit (m / sol BSS)')+field(`geolLocale.layers.${i}.bottom`,'Base (m / sol BSS)')+field(`geolLocale.layers.${i}.strat`,'Stratigraphie',{type:'text'})+`</div></div>`});
    h+=`<div class="f ft"><label>Ajouter une formation à la géologie locale</label>${picker('geol:new',null,'Formations géologiques connues (cliquer pour choisir)…')}</div>`+
      field('geolLocale.zsol','Altitude du sol du forage (m NGF)',{ph:'si connue'})+
      `<div class="inl" style="margin:6px 0"><button class="btn sm" data-act="report">Reporter la géologie locale dans la coupe de terrain</button></div><h4 class="cmpT">Comparaison terrain / BRGM</h4><div id="cmpGeol">${cmpSvg()}</div></div>`}
  if(tab==='nappe'){
    h+=`<div class="bloc"><h3>Relevé piézométrique de terrain</h3><p class="hint">Coordonnées en Lambert 93, altitudes en m NGF. Le toit de nappe du modèle peut être déduit du piézomètre de référence : profondeur = altitude du projet − niveau stabilisé.</p>`;
    P.piezos.forEach((pz,i)=>{const d=piezoDerived(pz);h+=`<div class="rowcard"><div class="rh"><input type="text" data-p="piezos.${i}.id" data-t="text" value="${esc(pz.id)}" aria-label="Nom du piézomètre"><button class="del" data-delpz="${i}">Supprimer</button></div><div class="mini">`+
      field(`piezos.${i}.x`,'X Lambert 93 (m)')+field(`piezos.${i}.y`,'Y Lambert 93 (m)')+field(`piezos.${i}.zTete`,'Alt. NGF tête (m)')+field(`piezos.${i}.zNappe`,'Nappe stabilisée (m NGF)')+field(`piezos.${i}.prof`,'Profondeur ouvrage (m)')+field(`piezos.${i}.date`,'Date du relevé',{type:'text'})+field(`piezos.${i}.ref`,'Référence',{type:'check'})+
      `</div><div class="pzd">${d.d!=null?`à ${nf(d.d,0)} m du projet · `:''}${d.profTete!=null?`eau à ${nf(d.profTete,2)} m sous la tête · `:''}${d.zFond!=null?`fond à ${nf(d.zFond,2)} m NGF · `:''}${d.zwt!=null?`nappe à ${nf(d.zwt,2)} m sous le niveau de référence`:'<span class="muted">renseigner l\'altitude du projet et le niveau stabilisé</span>'}</div></div>`});
    h+=`<button class="add" data-add="piezo">+ Ajouter un piézomètre</button>`+field('nappe.zwtAuto','Toit de nappe calculé depuis le piézomètre de référence',{type:'check'})+field('nappe.zwt','Toit de la nappe (m)',{hint:P.nappe.zwtAuto?'calculé':''})+field('nappe.battement','Battement de nappe (m)',{hint:'élément classé « eau » s\'il descend dans cette frange'})+field('nappe.T','Température de la nappe (°C)')+`</div>`;
    const ae=P.analyses.eau;
    h+=`<div class="bloc"><h3>Chimie – agressivité des eaux souterraines</h3><p class="hint">Renseignée à partir du rapport d'analyses (PDF texte, Excel, CSV ou TXT) : pH, CO₂ agressif, SO₄²⁻, Mg²⁺, NH₄⁺, Ca²⁺, TAC, chlorures, nitrates, sulfures. Valeurs « < LQ » retenues à la limite de quantification.</p><label class="btn sm file">Importer un rapport d'analyses<input type="file" id="fLabEau" accept=".pdf,.csv,.txt,.xlsx,.xls,.ods" hidden></label>${ae?srcHtml(ae):''}`+
      [['pH','pH'],['co2','CO₂ agressif (mg/L)'],['so4','Sulfates SO₄²⁻ (mg/L)'],['mg','Magnésium Mg²⁺ (mg/L)'],['nh4','Ammonium NH₄⁺ (mg/L)'],['ca','Calcium Ca²⁺ (mg/L)'],['tac','TAC (mmol/L)'],['cl','Chlorures (mg/L)'],['no3','Nitrates (mg/L)'],['s2','Sulfures dissous (mg/L S)']].map(([k,l])=>field('nappe.chimie.'+k,l+(ae&&ae.lq&&ae.lq[k]?' <span class="bdg">&lt; LQ</span>':''))).join('')+`</div>`;
    const I=P._inc;
    h+=`<div class="bloc"><h3>Incertitude</h3>`+field('nappe.incertAuto','Renseignement automatique',{type:'check',hint:'incertitudes du rapport, sinon valeurs par défaut des méthodes'})+
      (P.nappe.incertAuto&&I?`<table class="loc"><tr><td>Incertitude analytique retenue</td><td><b>${nf(P.nappe.incert,0)} %</b></td></tr><tr><td>Marge sur le pH</td><td><b>± ${nf(P.nappe.incertPH,1)}</b></td></tr>${I.det.map(d=>`<tr><td>${esc(E.XA_WATER[d.k]?E.XA_WATER[d.k].lab:d.k)}</td><td>${d.u==null?'—':nf(d.u,d.k==='pH'?1:0)+' '+esc(d.unit)} <span class="muted">(${esc(d.src)})</span></td></tr>`).join('')}</table><p class="hint">Incertitude retenue = maximum des incertitudes relatives des paramètres quantifiés du tableau 2 (SO₄²⁻, Mg²⁺, NH₄⁺, CO₂ agressif) ; par défaut 10 % (SO₄, Mg), 15 % (NH₄), 20 % (CO₂), ± 0,2 unité pH.</p>`:field('nappe.incert','Incertitude analytique (%)')+field('nappe.incertPH','Marge sur le pH (unité)'))+`</div>`;
    const ac=P.analyses.cohv;
    h+=`<div class="bloc"><h3>Composés dissous</h3><p class="hint">Concentrations en µg/L, renseignées à partir du rapport d'analyses des eaux souterraines (COHV, H₂S). Conversion automatique mg/L → µg/L.</p><label class="btn sm file">Importer un rapport d'analyses<input type="file" id="fLabCohv" accept=".pdf,.csv,.txt,.xlsx,.xls,.ods" hidden></label>${ac?srcHtml(ac):''}`+Object.keys(P.substances).map(k=>field(`nappe.cohv.${k}`,P.substances[k].nom+(ac&&ac.lq&&ac.lq['cohv_'+k]?' <span class="bdg">&lt; LQ</span>':''))).join('')+field('nappe.hCap','Échange frange capillaire (m/s)',{hint:'condition de base du profil gazeux'})+`</div>`}
  if(tab==='gaz'){h+=`<h3>Substances</h3>`+Object.keys(P.substances).map(k=>field(`substances.${k}.actif`,P.substances[k].nom,{type:'check'})).join('');
    h+=`<h3>Points de mesure (piézairs)</h3><p class="hint">Le modèle 1D est calé pour reproduire la moyenne mesurée sur l'intervalle de mesure ; la source est fixée entre le toit et la base de la zone source.</p>`;
    P.points.forEach((pt,i)=>{h+=`<div class="rowcard"><div class="rh"><input type="text" data-p="points.${i}.id" data-t="text" value="${esc(pt.id)}" aria-label="Nom du point"><button class="del" data-del="points.${i}">Supprimer</button></div><div class="mini">`+
      field(`points.${i}.sousBatiment`,'Sous bâtiment',{type:'check'})+field(`points.${i}.zm1`,'Mesure : toit (m)')+field(`points.${i}.zm2`,'Mesure : base (m)')+field(`points.${i}.src1`,'Source : toit (m)')+field(`points.${i}.src2`,'Source : base (m)')+
      Object.keys(P.substances).filter(k=>P.substances[k].actif).map(k=>field(`points.${i}.mesures.${k}`,`${k} (µg/m³)`)).join('')+`</div></div>`});
    h+=`<button class="add" data-add="point">+ Ajouter un point</button>`}
  if(tab==='fond'){h+=`<h3>Ouvrages en contact avec les sols et les eaux souterraines</h3><p class="hint">Micropieux, pieux, inclusions rigides, plots et longrines. Profondeurs en m sous le niveau de référence : tête (ou dessus) et pied (ou base) de l'ouvrage. Les planchers et dallages hors sol ne sont pas modélisés ; l'épaisseur du plancher bas pour le transfert des gaz est dans Paramètres.</p>`;
    const types=Object.entries(E.ELEM_TYPES);const pts=P.points.map(p=>[p.id,p.id]);
    P.elements.forEach((el,i)=>{const isP=E.isPile(el.type);
      h+=`<div class="rowcard"><div class="rh"><input type="text" data-p="elements.${i}.nom" data-t="text" value="${esc(el.nom)}" aria-label="Nom de l'ouvrage"><button class="del" data-del="elements.${i}">Supprimer</button></div><div class="mini">`+
      field(`elements.${i}.type`,'Type',{type:'select',options:types})+field(`elements.${i}.point`,'Point de gaz',{type:'select',options:pts})+
      field(`elements.${i}.zTop`,isP?'Tête (m)':'Dessus (m)')+field(`elements.${i}.zBase`,isP?'Pied (m)':'Base (m)')+
      (isP?field(`elements.${i}.dim`,'Diamètre (m)'):el.type==='plot'?field(`elements.${i}.largeur`,'Largeur (m)')+field(`elements.${i}.longueur`,'Longueur (m)'):field(`elements.${i}.largeur`,'Largeur (m)'))+
      field(`elements.${i}.enrobage`,'Enrobage (mm)')+field(`elements.${i}.zoneTraitement`,'Dans la zone traitée',{type:'check'})+`</div><div class="pzd">hauteur ${nf((el.zBase||0)-(el.zTop||0),2)} m${P.projet.z!=null?` · pied à ${nf(P.projet.z-(el.zBase||0),2)} m NGF`:''}</div></div>`});
    h+=`<button class="add" data-add="element">+ Ajouter un ouvrage</button>`}
  if(tab==='trait'){const T=P.traitement;const md=T.mode;const on=m=>md===m||(md==='vs'&&(m==='venting'||m==='sparging'));
    h+=`<h3>Technique de traitement</h3><div class="radios">${[['aucun','Aucun traitement'],['venting','Venting (sols non saturés)'],['sparging','Sparging (sols saturés et nappe)'],['vs','Venting-sparging (les deux)']].map(([k,l])=>`<label><input type="radio" name="tmode" value="${k}" ${md===k?'checked':''}> ${l}</label>`).join('')}</div><p class="hint">Les effets s'appliquent aux ouvrages cochés « Dans la zone traitée » (onglet Fondations).</p>`;
    h+=`<div class="bloc ${on('venting')?'':'off'}"><h3>Venting – sols non saturés</h3><p class="hint">Extraction de l'air du sol : aération de la zone non saturée (oxydation des sulfures des couches au contact) et baisse des gaz du sol.</p>`+field('traitement.venting.fOx','Part des sulfures de la ZNS oxydée (%)')+field('traitement.venting.rendement','Rendement sur les gaz du sol (%)',{hint:'information : concentrations résiduelles ; le classement reste sur l\'état initial'})+`</div>`;
    h+=`<div class="bloc ${on('sparging')?'':'off'}"><h3>Sparging – sols saturés et nappe</h3><p class="hint">Injection d'air sous la nappe : voie aérobie (CO₂ + HCl), oxydation des sulfures et de la matière organique.</p>`+
      field('traitement.sparging.pyrite','Sulfures (pyrite) du sol saturé (mg/kg)')+field('traitement.sparging.fOx','Part oxydée pendant le traitement (%)')+field('traitement.sparging.dilution','Facteur de dilution par l\'écoulement')+
      field('traitement.sparging.foc','foc (kg C / kg sol)')+field('traitement.sparging.fMO','Part du carbone organique minéralisée (%)')+field('traitement.sparging.n','Porosité zone saturée')+field('traitement.sparging.rho','Masse volumique sèche (kg/L)')+`</div>`;
    h+=`<div class="bloc ${md==='vs'?'':'off'}"><h3>Venting-sparging – zones non saturée et saturée</h3><p class="hint">Couplage des deux blocs ci-dessus : l'air injecté en nappe est capté par le venting. Les paramètres du venting s'appliquent à la partie non saturée des ouvrages, ceux du sparging à la partie en nappe.</p></div>`;
    h+=`<div class="bloc ${T.isco.actif?'':'off'}"><h3>ISCO – oxydation chimique in situ (persulfate activé)</h3><p class="hint">Persulfate de sodium Na₂S₂O₈ : chaque mole consommée libère 2 moles de SO₄²⁻ et 2 moles d'acidité (H⁺) ; l'activation alcaline apporte de la soude (NaOH). Traitement des sols et de la nappe in situ.</p>`+
      field('traitement.isco.actif','ISCO actif',{type:'check'})+field('traitement.isco.zone','Zone traitée',{type:'select',options:[['zns_zs','Sols non saturés et nappe'],['zs','Sols saturés et nappe'],['zns','Sols non saturés']]})+
      field('traitement.isco.dose','Dose de Na₂S₂O₈ (kg/m³ de terrain)',{hint:'masse injectée rapportée au volume traité'})+field('traitement.isco.activation','Activation',{type:'select',options:Object.entries(E.ISCO_ACT)})+
      (T.isco.activation==='alcaline'?field('traitement.isco.ratioBase','Rapport molaire NaOH / persulfate'):'')+field('traitement.isco.fCons','Part du persulfate consommée (%)')+field('traitement.isco.dilution','Facteur de dilution au contact (nappe)')+field('traitement.isco.n','Porosité zone traitée')+field('traitement.isco.rho','Masse volumique sèche (t/m³)')+`</div>`;
    h+=`<h3>Scénario de déchloration</h3>`+field('scenario.fDeg','Part des COHV dissous dégradée (%)',{hint:'100 % = majorant'})+field('scenario.dnapl','Contact avec une phase pure (DNAPL)',{type:'check',hint:'eau saturée en solvant au contact des éléments en nappe'})}
  if(tab==='param'){h+=`<h3>Gradient d'oxydant au contact des ouvrages</h3>`+field('oxydant.rMax','Distance calculée autour de l\'ouvrage (m)')+field('oxydant.pas','Pas des profils radiaux (m)');h+=`<h3>Plancher bas (transfert des gaz)</h3>`+field('dalle.e','Épaisseur du plancher bas / dallage (m)')+field('dalle.eta','Fraction de fissures η')+field('dalle.Dbeton','D effectif COHV béton (m²/s)')+field('dalle.hImpose','Coefficient h imposé (m/s)',{hint:'0 = calculé ; 9,9×10⁻⁷ = calage 3D EQRS'});
    h+=`<h3>Béton des fondations</h3>`+field('beton.duree','Durée d\'utilisation de projet (ans)')+field('beton.Dso4','D sulfates dans le béton (m²/s)',{hint:'indicatif, à caler selon la formulation communiquée par les concepteurs'})+field('beton.DcohvBeton','D effectif COHV béton (m²/s)')+field('beton.Rmortier','Facteur de retard COHV (mortier)',{hint:'23 : TCE vapeur sur mortier (essais de colonne)'});
    h+=`<h3>Sols acides et H₂S</h3>`+field('acide.fOx','Part des sulfures oxydée (%)',{hint:'100 % = oxydation complète (majorant)'})+field('acide.ff','Facteur de finesse FF (ANC)',{hint:'1,5 par défaut'})+field('acide.ancOn','Déduire l\'ANC (carbonates)',{type:'check'})+field('acide.seuilNet','Seuil d\'acidité nette (mol H⁺/t)',{hint:'18 mol H⁺/t ≈ 0,03 % S'})+field('acide.fBio','Part de l\'H₂S oxydée en H₂SO₄ (%)')+field('acide.delta','Épaisseur de transfert H₂S (m)')+field('acide.ancBeton','Capacité de neutralisation du béton (mol H⁺/m³)',{hint:'indicatif, à caler'});
    h+=`<h3>Propriétés des substances</h3>`+Object.keys(P.substances).map(k=>`<div class="rowcard"><div class="rh">${esc(P.substances[k].nom)}</div><div class="mini">`+field(`substances.${k}.Da`,'Da (m²/s)')+field(`substances.${k}.Dw`,'Dw (m²/s)')+field(`substances.${k}.H`,'H\' (–)')+field(`substances.${k}.S`,'Solubilité (mg/L)')+field(`substances.${k}.M`,'M (g/mol)')+field(`substances.${k}.nCl`,'Atomes de Cl')+`</div></div>`).join('')}
  $('#forms').innerHTML=h;
}
function srcHtml(a){const m=a.meta||{};return `<div class="src"><b>${esc(a.fichier)}</b>${m.labo?' · '+esc(m.labo):''}${m.echantillon?' · échantillon '+esc(m.echantillon):''}${m.ouvrage?' · '+esc(m.ouvrage):''}${m.prelevement?' · prélevé le '+esc(m.prelevement):''}${m.classeLabo?' · classe indiquée par le laboratoire : '+esc(m.classeLabo):''} · ${a.raw.length} paramètre(s) reconnu(s)${a.tLabo!=null?` · température mesurée au laboratoire ${nf(a.tLabo,1)} °C (non reportée)`:''}</div>`}
let BSS=null;
function bssListHtml(){if(!BSS)return '';if(BSS.msg)return `<p class="hint">${BSS.msg}</p>`;if(!BSS.list.length)return '<p class="hint">Aucun ouvrage BSS dans le rayon.</p>';
  return `<table class="bss"><thead><tr><th>Ouvrage</th><th>Nature</th><th class="n">Dist. (m)</th><th class="n">Prof. (m)</th><th class="n">Sol (m NGF)</th><th class="n">Eau / sol (m)</th><th>Log</th></tr></thead><tbody>${BSS.list.slice(0,40).map((o,i)=>`<tr><td><a href="${o.fiche}" target="_blank" rel="noopener">${esc(o.ref||o.bss)}</a></td><td>${esc(o.nature||'')}${o.piezo?' (piézo)':''}</td><td class="n">${nf(o.d,0)}</td><td class="n">${nf(o.prof,1)}</td><td class="n">${nf(o.zsol,2)}</td><td class="n">${nf(o.eau,2)}</td><td>${o.log?`<button class="btn xs" data-log="${i}">Charger le log</button>`:'<span class="muted">—</span>'}</td></tr>`).join('')}</tbody></table><p class="hint">${BSS.list.length} ouvrage(s) – source : BRGM, Banque du sous-sol (InfoTerre).</p>`}
function cmpSvg(){const T=P.layers,G=P.geolLocale;const zp=P.projet.z;const shift=(zp!=null&&G.zsol!=null)?zp-G.zsol:0;
  const gl=G.layers.map(L=>({...L,t:L.top+shift,b:L.bottom+shift}));const zmax=Math.max(1,...T.map(l=>l.bottom),...gl.map(l=>l.b));const zmin=Math.min(0,...gl.map(l=>l.t));
  const W=520,H=360,mt=26,mb=10,ml=44;const y=z=>mt+(z-zmin)/(zmax-zmin)*(H-mt-mb);const cw=200;const x1=ml+10,x2=x1+cw+40;
  const col=L=>{const f=L.formation?fById(L.formation):null;const lt=f?f.lith:FORM.lithOf(L.litho||L.nom);return ({remblai:'#c9c3b8',terre:'#8f7a5a',limon:'#e6d7a8',sable:'#f1e2a0',grave:'#e0c98c',argile:'#b9c7a3',marne:'#d4d8c0',calcaire:'#c9d7e6',craie:'#eef0ea',gypse:'#f3d6e2',gres:'#e8c9a0',tourbe:'#6f5d48',schiste:'#9aa3ad',socle:'#d8a7a7',arene:'#e6c2b0',volcan:'#a78f8f'})[lt]||'#ddd'};
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Comparaison des coupes"><text x="${x1+cw/2}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="#1c2b45">Coupe de terrain</text><text x="${x2+cw/2}" y="14" text-anchor="middle" font-size="12" font-weight="700" fill="#1c2b45">Géologie locale BRGM</text>`;
  const box=(L,x,t,b)=>{const h=Math.max(y(b)-y(t),1);const nm=L.nom||L.litho||'';return `<rect x="${x}" y="${y(t)}" width="${cw}" height="${h}" fill="${col(L)}" stroke="#555" stroke-width=".6"/>${h>12?`<text x="${x+5}" y="${y(t)+Math.min(h/2+4,14)}" font-size="10.5" fill="#1c2b45">${esc(nm.length>32?nm.slice(0,31)+'…':nm)}</text>`:''}`};
  T.forEach(L=>{s+=box(L,x1,L.top,L.bottom)});gl.forEach(L=>{s+=box(L,x2,L.t,L.b)});
  if(!gl.length)s+=`<text x="${x2+cw/2}" y="${H/2}" text-anchor="middle" font-size="11" fill="#777">aucune couche locale</text>`;
  const st=zmax-zmin>20?5:(zmax-zmin>8?2:1);for(let z=Math.ceil(zmin);z<=zmax+1e-9;z+=st)s+=`<text x="${ml}" y="${y(z)+4}" text-anchor="end" font-size="10.5" fill="#555">${nf(z,0)}</text><line x1="${ml+3}" x2="${x2+cw}" y1="${y(z)}" y2="${y(z)}" stroke="#000" stroke-opacity=".06"/>`;
  if(P.nappe.zwt<zmax)s+=`<line x1="${x1}" x2="${x2+cw}" y1="${y(P.nappe.zwt)}" y2="${y(P.nappe.zwt)}" stroke="#1f77b4" stroke-width="1.4" stroke-dasharray="5 3"/>`;
  s+=`<text x="12" y="${H/2}" font-size="10.5" fill="#555" transform="rotate(-90 12 ${H/2})" text-anchor="middle">Profondeur / niveau de référence (m)${shift?' – BSS recalé en NGF':''}</text></svg>`;return s}
// ------------------------------------------------------------ sélecteur de formations
const POP=document.createElement('div');POP.id='fpop';POP.hidden=true;document.body.appendChild(POP);let popTarget=null;
function openPicker(btn,target){popTarget=target;const r=btn.getBoundingClientRect();POP.style.left=Math.max(8,Math.min(r.left,window.innerWidth-440))+'px';POP.style.top=(r.bottom+window.scrollY+4)+'px';
  POP.innerHTML=`<input type="search" id="fq" placeholder="Rechercher (nom, étage, notation)…" aria-label="Rechercher une formation"><div class="flist">${listHtml('')}</div>`;POP.hidden=false;const q=POP.querySelector('#fq');q.focus();
  q.addEventListener('input',()=>{POP.querySelector('.flist').innerHTML=listHtml(q.value)})}
function listHtml(q){const n=s=>s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');const qq=n(q);let h='';
  for(const [g,gn] of Object.entries(FORM.groupes)){const it=FORM.list.filter(f=>f.groupe===g&&(!qq||n(f.nom+' '+f.etage+' '+f.code).includes(qq)));if(!it.length)continue;
    h+=`<div class="fg">${esc(gn)}</div>`+it.map(f=>`<div class="fi" data-f="${f.id}"><b>${esc(f.code)}</b> ${esc(f.nom)} <span class="muted">– ${esc(f.etage)}</span> ${badges(f)}</div>`).join('')}
  return h||'<div class="fi muted">Aucune formation</div>'}
POP.addEventListener('click',e=>{const it=e.target.closest('.fi[data-f]');if(!it)return;applyFormation(popTarget,fById(it.dataset.f));POP.hidden=true});
document.addEventListener('mousedown',e=>{if(!POP.hidden&&!POP.contains(e.target)&&!e.target.closest('.fpick'))POP.hidden=true});
document.addEventListener('keydown',e=>{if(e.key==='Escape')POP.hidden=true});
function applyFormation(t,f){if(!f)return;const [kind,ix]=t.split(':');
  if(kind==='layer'){const L=P.layers[+ix];L.formation=f.id;L.nom=f.nom;Object.assign(L,{n:f.props.n,ta:f.props.ta,tw:f.props.tw,calcaire:f.cal})}
  else if(ix==='new'){const G=P.geolLocale.layers;const t0=G.length?G[G.length-1].bottom:0;G.push({formation:f.id,nom:f.nom,litho:f.nom,strat:f.etage,top:t0,bottom:t0+2})}
  else{const L=P.geolLocale.layers[+ix];L.formation=f.id;L.nom=f.nom;if(!L.strat)L.strat=f.etage}
  renderForms();run()}
// ------------------------------------------------------------ services en ligne
let locTmr=null;
async function locate(force){const p=P.projet;if(!GEO.okL93(p.x,p.y)){p.locMsg='Coordonnées Lambert 93 hors du territoire métropolitain.';refreshLoc();return}
  const w=GEO.l93ToWgs(p.x,p.y);p.locMsg='Interrogation des services IGN et BRGM…';refreshLoc();
  const [alt,adr,par,geo]=await Promise.allSettled([(p.z==null||p.zSource==='RGE ALTI'||force)?GEO.altitude(w.lon,w.lat):Promise.resolve(null),GEO.adresse(w.lon,w.lat),GEO.parcelle(w.lon,w.lat),GEO.carteGeol(p.x,p.y)]);
  const ko=[];
  if(alt.status==='fulfilled'&&alt.value!=null){p.z=Math.round(alt.value*100)/100;p.zSource='RGE ALTI'}else if(alt.status==='rejected')ko.push('altitude');
  if(adr.status==='fulfilled'&&adr.value){p.adresse=adr.value.label;p.commune=adr.value.commune;p.insee=adr.value.insee}else ko.push('adresse');
  if(par.status==='fulfilled'&&par.value){Object.assign(p,{parcelle:par.value.parcelle,idu:par.value.idu,surface:par.value.surface,parcelleProche:par.value.proche});if(!p.commune)p.commune=par.value.commune}else ko.push('parcelle');
  if(geo.status==='fulfilled'&&geo.value){p.feuille=geo.value.feuille;p.nomFeuille=geo.value.nomFeuille;p.litho1M=geo.value.litho1M}else ko.push('carte géologique');
  if(!p.site&&p.adresse)p.site=p.adresse+(p.parcelle?' – parcelle '+p.parcelle:'');
  p.locMsg=ko.length?`Service(s) indisponible(s) : ${ko.join(', ')}. Vérifier la connexion internet.`:`Localisation mise à jour le ${new Date().toLocaleString('fr-FR')}.`;
  if(tab==='projet')renderForms();else refreshLoc();run()}
function refreshLoc(){const d=document.getElementById('locInfo');if(d)d.innerHTML=locInfo()}
async function geocode(){const q=($('#qAdr')||{}).value;if(!q)return;P.projet.locMsg='Recherche de l\'adresse…';refreshLoc();
  try{const r=await GEO.chercherAdresse(q);if(!r){P.projet.locMsg='Adresse introuvable.';refreshLoc();return}P.projet.x=Math.round(r.x*100)/100;P.projet.y=Math.round(r.y*100)/100;P.projet.z=null;await locate(true)}
  catch(err){P.projet.locMsg='Service de géocodage indisponible ('+err.message+').';refreshLoc()}}
async function chercherBss(){const p=P.projet;if(!GEO.okL93(p.x,p.y)){BSS={msg:'Renseigner d\'abord X et Y du projet (onglet Projet).'};renderForms();return}
  BSS={msg:'Recherche des forages BSS…'};renderForms();const r=await GEO.forages(p.x,p.y,P.geolLocale.rayon||500);
  if(!r.list){BSS={msg:'Service BRGM indisponible depuis ce poste. Lancer AGRESOL avec le serveur local (node server.js) ou consulter <a href="https://infoterre.brgm.fr" target="_blank" rel="noopener">InfoTerre</a>.'}}else BSS={list:r.list,via:r.via};renderForms()}
async function chargerLog(i){const o=BSS.list[i];const r=await GEO.logBss(o.ref||o.bss);
  if(!r||!r.layers||!r.layers.length){alert('Log non récupérable automatiquement (serveur AGRESOL non lancé ou fiche sans log validé). La fiche InfoTerre va s\'ouvrir.');window.open(o.fiche,'_blank');return}
  P.geolLocale.source=`BSS ${o.ref||o.bss} (${nf(o.d,0)} m)`;P.geolLocale.zsol=r.zsol!=null?r.zsol:o.zsol;P.geolLocale.bss=o.ref||o.bss;
  P.geolLocale.layers=r.layers.map(L=>{const f=FORM.match(L.litho)||FORM.match(L.strat);return{formation:f?f.id:null,nom:L.litho,litho:L.litho,strat:L.strat,top:L.top,bottom:L.bottom}});renderForms();run()}
function reporter(){const G=P.geolLocale;if(!G.layers.length)return;if(!confirm('Remplacer les couches de la coupe de terrain par la géologie locale ? Les analyses de sol saisies seront conservées par position.'))return;
  const zp=P.projet.z;const shift=(zp!=null&&G.zsol!=null)?zp-G.zsol:0;const old=P.layers;
  const nl=G.layers.map((L,i)=>{const f=L.formation?fById(L.formation):null;const pr=f?f.props:FORM.LITH[FORM.lithOf(L.litho)];const o=old[i]||{};
    return{nom:L.nom||L.litho,formation:L.formation||null,top:Math.max(0,Math.round((L.top+shift)*100)/100),bottom:Math.round((L.bottom+shift)*100)/100,n:pr.n,ta:pr.ta,tw:pr.tw,calcaire:f?f.cal:false,so4s:o.so4s??null,bg:o.bg??null,pHsol:o.pHsol??null,scr:o.scr??null,caco3:o.caco3??null,taa:o.taa??null,oxydable:!!o.oxydable}}).filter(l=>l.bottom>l.top);
  if(nl.length){nl[0].top=0;P.layers=nl}renderForms();run()}
async function importLab(file,kind){try{const r=await LAB.lireFichier(file);const nE=Object.keys(r.eau).length,nC=Object.keys(r.cohv).length;
  if(!nE&&!nC){alert('Aucun paramètre reconnu dans ce fichier. Pour un PDF numérisé (image), exporter le rapport du laboratoire en Excel ou CSV.');return}
  const tLabo=r.eau.T;delete r.eau.T;
  if(Object.keys(r.eau).length){Object.assign(P.nappe.chimie,r.eau);P.analyses.eau={fichier:r.fichier,meta:r.meta,raw:r.raw.filter(x=>x.param in P.nappe.chimie||x.param==='T'),lq:r.lq,inc:r.inc,tLabo}}
  if(nC){for(const k in r.cohv)if(P.nappe.cohv[k]!==undefined||P.substances[k])P.nappe.cohv[k]=r.cohv[k];P.analyses.cohv={fichier:r.fichier,meta:r.meta,raw:r.raw.filter(x=>x.param in r.cohv),lq:r.lq}}
  if(r.meta.ouvrage&&!P.piezos.some(z=>z.id.replace(/\s/g,'').toUpperCase()===r.meta.ouvrage.toUpperCase()))P.piezos.push({id:r.meta.ouvrage,x:null,y:null,zTete:null,zNappe:null,prof:null,date:r.meta.prelevement||'',ref:!P.piezos.length});
  syncDerived();renderForms();run()}catch(err){console.error(err);alert('Lecture du fichier impossible : '+err.message)}}
// ------------------------------------------------------------ événements de saisie
let tmr=null;
$('#forms').addEventListener('input',e=>{const t=e.target;if(!t.dataset.p)return;const ty=t.dataset.t;let v;
  if(ty==='check')v=t.checked;else if(ty==='num'){const s=t.value.trim().replace(',','.').replace(/\s/g,'');v=s===''?null:Number(s);if(s!==''&&!isFinite(v))return}else v=t.value;
  set(P,t.dataset.p,v);const pth=t.dataset.p;
  if(pth==='projet.z')P.projet.zSource=v==null?'':'saisie';
  if(pth==='projet.x'||pth==='projet.y'){clearTimeout(locTmr);locTmr=setTimeout(()=>locate(false),900)}
  if(t.type==='checkbox'&&(pth==='nappe.zwtAuto'||pth==='nappe.incertAuto'||pth==='traitement.isco.actif'||pth.startsWith('piezos.'))){syncDerived();renderForms();run();return}
  if(t.dataset.p.endsWith('.type')||t.dataset.p.endsWith('.actif')||t.dataset.p.startsWith('points.')&&t.dataset.p.endsWith('.id')){clearTimeout(tmr);tmr=setTimeout(()=>{renderForms();run()},250);return}
  clearTimeout(tmr);tmr=setTimeout(run,180)});
$('#forms').addEventListener('change',e=>{const t=e.target;
  if(t.tagName==='SELECT'){set(P,t.dataset.p,t.value);renderForms();run();return}
  if(t.id==='fLabEau'||t.id==='fLabCohv'){const f=t.files[0];if(f)importLab(f,t.id);t.value='';return}
  if(t.name==='tmode'){P.traitement.mode=t.value;renderForms();run();return}
  const p=t.dataset.p||'';if(p.startsWith('piezos.')||p.startsWith('nappe.chimie')||p.startsWith('elements.')||p.startsWith('geolLocale.')||p.startsWith('layers.')&&/(top|bottom)$/.test(p)){syncDerived();const y=window.scrollY;renderForms();window.scrollTo(0,y);run()}});
$('#forms').addEventListener('click',e=>{const pk=e.target.closest('[data-pick]');if(pk){e.preventDefault();openPicker(pk,pk.dataset.pick);return}
  const d=e.target.dataset;
  if(d.act==='locate'){locate(true);return}if(d.act==='geocode'){geocode();return}if(d.act==='bss'){chercherBss();return}if(d.act==='report'){reporter();return}
  if(d.log!=null){chargerLog(+d.log);return}
  if(d.delpz!=null){P.piezos.splice(+d.delpz,1);syncDerived();renderForms();run();return}
  if(d.delg!=null){P.geolLocale.layers.splice(+d.delg,1);renderForms();run();return}
  if(d.add==='piezo'){P.piezos.push({id:'PZ'+(P.piezos.length+1),x:P.projet.x,y:P.projet.y,zTete:P.projet.z,zNappe:null,prof:null,date:'',ref:!P.piezos.length});renderForms();return}
  if(d.del){const [arr,i]=d.del.split('.');if(P[arr].length<=1)return;P[arr].splice(+i,1);if(arr==='elements')selEl=0;renderForms();run()}
  if(d.add==='layer'){const last=P.layers[P.layers.length-1];P.layers.push({nom:'Nouvelle couche',top:last.bottom,bottom:last.bottom+5,n:0.35,ta:0,tw:0.35,calcaire:false,so4s:null,bg:null,pHsol:null,scr:null,caco3:null,taa:null,oxydable:false});renderForms();run()}
  if(d.add==='point'){P.points.push({id:'P'+(P.points.length+1),sousBatiment:true,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:0,PCE:0,DCE:0,CV:0,H2S:0}});renderForms();run()}
  if(d.add==='element'){P.elements.push({id:'E'+Date.now(),nom:'Nouvel élément',type:'pieu',zTop:0.8,zBase:10,dim:0.5,largeur:0.5,longueur:0.5,enrobage:50,eL:0.55,point:P.points[0].id,zoneTraitement:false});renderForms();run()}});
document.querySelectorAll('.tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tabs button').forEach(x=>x.classList.toggle('on',x===b));tab=b.dataset.tab;renderForms()}));
// ------------------------------------------------------------ calcul et rendu
function run(){
  syncDerived();
  try{A=E.analyse(P)}catch(err){$('#kpis').innerHTML=`<div class="kpi" style="grid-column:1/-1"><div class="l">Erreur de calcul</div><div class="d">${esc(err.message)} – vérifiez la cohérence des profondeurs et des paramètres.</div></div>`;console.error(err);return}
  if(selEl>=A.results.length)selEl=0;
  renderKpis();renderCoupe();fillSelects();renderProfil();renderTable();renderDetail();schedAcid();schedOx()}
let acidT=null,ACID=null,oxT=null,OX=null,oxEl=null;
function schedOx(){clearTimeout(oxT);oxT=setTimeout(renderOx,300)}
function renderOx(){if(!A||!window.AGRESOL_OX)return;const sel=$('#selOx');
  try{OX=E.oxydant(P,A);let ix=OX.items.findIndex(it=>it.el===oxEl);if(ix<0)ix=Math.max(0,OX.items.findIndex(it=>it.inZ&&it.cyl));
    sel.innerHTML=OX.items.map((it,j)=>`<option value="${j}"${j===ix?' selected':''}>${esc(it.el)}${it.inZ?' – zone traitée':''}</option>`).join('');
    const it=OX.items[ix];if(!it){$('#ox').innerHTML='<p class="muted">Aucun élément.</p>';return}oxEl=it.el;
    const d=v=>v==null?'—':(!isFinite(v)?'> '+nf(OX.opts.rMax,1)+' m':(v<1?nf(v*100,0)+' cm':nf(v,1)+' m'));const sg=v=>(v>0?'+':'')+nf(v,0);
    const t=`<div class="tablewrap"><table class="res"><thead><tr><th>Couche</th><th>Profondeur</th><th>Zone</th><th>Traitement</th><th>λ</th><th>O₂ interface</th><th>O₂ à 1 m</th><th>O₂ naturel</th><th>Distance 50 %</th><th>Eh interface</th><th>Eh à 1 m</th><th>Milieu au contact</th></tr></thead><tbody>`+
      it.segs.map(s=>`<tr><td>${esc(s.couche)}</td><td class="n">${nf(s.z1,1)} – ${nf(s.z2,1)} m</td><td>${s.sat?'saturée':'non saturée'}</td><td>${s.trait?esc(s.via):'—'}</td><td class="n">${window.AGRESOL_OX.lam(s.q.lam)}</td><td class="n">${nf(s.c0,1)} mg/L</td><td class="n">${nf(s.c1,1)} mg/L</td><td class="n">${nf(s.q.Cb,1)} mg/L</td><td class="n">${s.trait?d(s.x50):'—'}</td><td class="n">${sg(s.eh0)} mV</td><td class="n">${sg(s.eh1)} mV</td><td>${esc(s.zone0)}</td></tr>`).join('')+`</tbody></table></div>`;
    $('#ox').innerHTML=window.AGRESOL_OX.coupe(it,OX,P)+t+`<ul class="oxc">${it.constats.map(c=>`<li>${esc(c)}</li>`).join('')}</ul>`}
  catch(err){console.error(err);$('#ox').innerHTML='<p class="muted">Calcul impossible : '+esc(err.message)+'</p>'}}
$('#selOx').addEventListener('change',e=>{const it=OX&&OX.items[+e.target.value];oxEl=it?it.el:null;renderOx()});
function schedAcid(){clearTimeout(acidT);acidT=setTimeout(renderAcid,250)}
function calcAcid(){return E.acidCohv(P,A)}
function renderAcid(){if(!A||!window.AGRESOL_ACID)return;const G=window.AGRESOL_ACID;
  try{ACID=calcAcid();const k=$('#selAcid').value,it=ACID.items[k];
    $('#acid').innerHTML=G.chaine(it,ACID)+G.courbe(it,ACID)+G.barres(it);$('#acidCmp').innerHTML=G.comparaison(ACID)}
  catch(err){console.error(err);$('#acid').innerHTML='<p class="muted">Calcul impossible : '+esc(err.message)+'</p>'}}
$('#selAcid').addEventListener('change',renderAcid);
function renderKpis(){const R=A.results;const cmax=Math.max(...R.map(r=>r.classe));const crit=R.find(r=>r.classe===cmax);
  const w=P.nappe.chimie;const m=w.so4/200;const nFlags=R.reduce((s,r)=>s+r.flags.length,0);
  $('#kpis').innerHTML=`<div class="kpi"><div class="l">Classe la plus sévère</div><div class="v">${pill(cmax)}</div><div class="d">${esc(crit?crit.el.nom:'')}</div></div>
  <div class="kpi"><div class="l">Éléments analysés</div><div class="v">${R.length}</div><div class="d">${R.filter(r=>r.classe>0).length} en XA1 ou plus</div></div>
  <div class="kpi"><div class="l">Marge sulfates (nappe)</div><div class="v">${nf(m*100,0)} %</div><div class="d">${nf(w.so4,0)} mg/L pour 200 mg/L (XA1)</div></div>
  ${(()=>{const ac=R.flatMap(r=>r.acid.detail);const nets=ac.map(x=>x.net);const h2=R.filter(r=>r.h2s);const nm=nets.length?Math.max(...nets):null;return `<div class="kpi"><div class="l">Sols acides / H₂S</div><div class="v">${nm==null?'—':nf(nm,0)}<small> mol H⁺/t</small></div><div class="d">${nm==null?'sulfures non renseignés':'acidité nette maximale au contact'}${h2.length?` ; H₂S max ${nf(Math.max(...h2.map(r=>r.h2s.cg)),0)} µg/m³`:''}</div></div>`})()}
  <div class="kpi"><div class="l">Points de vigilance</div><div class="v">${nFlags}</div><div class="d">voir le détail par élément</div></div>`}
// coupe SVG
function renderCoupe(){
  const R=A.results;const zsel=+($('#selZ').value||0);const zmax=zsel>0?zsel:Math.max(P.nappe.zwt+2,...P.elements.map(e=>E.contact(e).z2+1));
  const W=1000,H=460,ml=46,mr=178,mt=16,mb=44;const y=z=>mt+z/zmax*(H-mt-mb);const n=R.length;const colW=(W-ml-mr)/Math.max(n,1);
  const lc=['#efe2c6','#e4e9ee','#d9e3ea','#e6e0d6','#e0e8df'];
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Coupe des fondations"><rect x="${ml}" y="${mt}" width="${W-ml-mr}" height="${H-mt-mb}" fill="#fff"/>`;
  P.layers.forEach((L,i)=>{const t=Math.min(L.top,zmax),b=Math.min(L.bottom,zmax);if(b<=t)return;s+=`<rect x="${ml}" y="${y(t)}" width="${W-ml-mr}" height="${y(b)-y(t)}" fill="${L.top>=P.nappe.zwt?'#d6e9f5':lc[i%lc.length]}"/>`});
  if(P.nappe.zwt<zmax){s+=`<rect x="${ml}" y="${y(P.nappe.zwt)}" width="${W-ml-mr}" height="${y(zmax)-y(P.nappe.zwt)}" fill="#bcd9ee" opacity=".45"/><line x1="${ml}" x2="${W-mr}" y1="${y(P.nappe.zwt)}" y2="${y(P.nappe.zwt)}" stroke="#1f77b4" stroke-width="1.4"/>`;
    if(P.nappe.battement>0)s+=`<rect x="${ml}" y="${y(P.nappe.zwt-P.nappe.battement)}" width="${W-ml-mr}" height="${y(P.nappe.zwt)-y(P.nappe.zwt-P.nappe.battement)}" fill="#1f77b4" opacity=".08"/>`}
  for(let z=0;z<=zmax+1e-9;z+=zmax>20?5:(zmax>8?2:(zmax>3?1:0.5)))s+=`<line x1="${ml-4}" x2="${ml}" y1="${y(z)}" y2="${y(z)}" stroke="#777"/><text x="${ml-7}" y="${y(z)+4}" text-anchor="end" font-size="12" fill="#555">${nf(z,z%1?1:0)}</text>`;
  s+=`<text x="12" y="${H/2}" font-size="11" fill="#555" transform="rotate(-90 12 ${H/2})" text-anchor="middle">Profondeur (m)</text>`;
  R.forEach((r,i)=>{const el=r.el,ct=E.contact(el);const cx=ml+colW*(i+0.5);const col=getComputedStyle(document.documentElement).getPropertyValue('--c'+r.classe).trim();
    const pt=P.points.find(p=>p.id===el.point);if(pt&&pt.src1<zmax){s+=`<rect x="${cx-colW*0.42}" y="${y(pt.src1)}" width="${colW*0.84}" height="${Math.max(y(Math.min(pt.src2,P.nappe.zwt,zmax))-y(pt.src1),1)}" fill="#e7a3a3" opacity=".35"/>`}
    let x0,w0,t,b;const sc=Math.min(colW*0.5/Math.max(ct.epaisseur,0.2),70);
    if(E.isPile(el.type)){w0=Math.max(el.dim*sc,el.type==='micropieu'?5:8);t=el.zTop;b=el.zBase}else{w0=Math.min(Math.max((el.largeur||0.4)*sc,10),colW*0.84);t=el.zTop;b=el.zBase}
    x0=cx-w0/2;const sel=i===selEl;
    t=Math.min(t,zmax);b=Math.min(b,zmax);
    s+=`<g data-i="${i}" style="cursor:pointer"><rect x="${x0}" y="${y(t)}" width="${w0}" height="${Math.max(y(b)-y(t),3)}" fill="#9aa0a6" stroke="${col}" stroke-width="${sel?3.2:2}"/>`;
    s+=`<rect x="${x0}" y="${y(Math.min(ct.z1,zmax))}" width="${w0}" height="${Math.max(y(Math.min(ct.z2,zmax))-y(Math.min(ct.z1,zmax)),2.5)}" fill="${col}" opacity=".55"/>`;
    s+=`<text x="${cx}" y="${H-6}" text-anchor="middle" font-size="12.5" fill="${sel?'#1c2b45':'#333'}" font-weight="${sel?700:500}">${esc(el.nom.length>22?el.nom.slice(0,21)+'…':el.nom)}</text>`;
    s+=`<text x="${cx}" y="${H-24}" text-anchor="middle" font-size="12" font-weight="700" fill="${col}">${E.CLASSES[r.classe]}</text></g>`});
  P.layers.forEach(L=>{const t=Math.min(L.top,zmax);if(L.bottom<=t||t>=zmax)return;const ws=L.nom.split(' ');const ln=[''];for(const w of ws){if((ln[ln.length-1]+' '+w).trim().length>27&&ln[ln.length-1])ln.push(w);else ln[ln.length-1]=(ln[ln.length-1]+' '+w).trim()}
    s+=`<line x1="${W-mr}" x2="${W-mr+6}" y1="${y(t)}" y2="${y(t)}" stroke="#888"/><text x="${W-mr+9}" y="${y(t)+12}" font-size="10.5" fill="#2f3a46">${ln.slice(0,3).map((l,k)=>`<tspan x="${W-mr+9}" dy="${k?12:0}">${esc(l)}</tspan>`).join('')}</text>`});
  if(P.nappe.zwt<zmax)s+=`<rect x="${ml+3}" y="${y(P.nappe.zwt)-16}" width="92" height="14" fill="#fff" opacity=".85" rx="2"/><text x="${ml+7}" y="${y(P.nappe.zwt)-5}" font-size="11" fill="#1f4e79">▽ nappe ${nf(P.nappe.zwt,1)} m</text>`;
  s+=`</svg>`;$('#coupe').innerHTML=s;
  $('#coupe').querySelectorAll('g[data-i]').forEach(g=>g.addEventListener('click',()=>{selEl=+g.dataset.i;renderCoupe();renderTable();renderDetail();renderProfil()}));
  $('#legend').innerHTML=E.CLASSES.map((c,i)=>`<span><i style="background:var(--c${i})"></i>${c}</span>`).join('')+`<span><i style="background:#e7a3a3;opacity:.6"></i>zone source du point de gaz</span><span><i style="background:#bcd9ee"></i>zone saturée</span>`}
function fillSelects(){const sp=$('#selPt'),ss=$('#selSub');const el=A.results[selEl]&&A.results[selEl].el;
  const cur=sp.value||(el&&el.point);sp.innerHTML=P.points.map(p=>`<option ${p.id===(el?el.point:cur)?'selected':''}>${esc(p.id)}</option>`).join('');
  const cs=A.subs.includes(ss.value)?ss.value:A.subs[0];ss.innerHTML=A.subs.map(k=>`<option ${k===cs?'selected':''}>${k}</option>`).join('')}
$('#selZ').addEventListener('change',()=>renderCoupe());
$('#selPt').addEventListener('change',()=>renderProfil(true));$('#selSub').addEventListener('change',()=>renderProfil(true));
function renderProfil(){const pid=$('#selPt').value,k=$('#selSub').value;const pr=A.profiles[pid]&&A.profiles[pid][k];if(!pr){$('#profil').innerHTML='';return}
  const W=520,H=420,ml=52,mr=16,mt=30,mb=40;const zmax=P.nappe.zwt;const cmax=Math.max(...pr.C)*1.15||1;const s0=pr.s;
  const x=c=>ml+c/cmax*(W-ml-mr),y=z=>mt+z/zmax*(H-mt-mb);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Profil des gaz du sol"><rect x="${ml}" y="${mt}" width="${W-ml-mr}" height="${H-mt-mb}" fill="#fafbf9" stroke="#ccc"/>`;
  const pt=P.points.find(p=>p.id===pid);
  s+=`<rect x="${ml}" y="${y(pt.src1)}" width="${W-ml-mr}" height="${y(Math.min(pt.src2,zmax))-y(pt.src1)}" fill="#f6c9c9" opacity=".55"/>`;
  P.layers.forEach(L=>{if(L.top>0&&L.top<zmax)s+=`<line x1="${ml}" x2="${W-mr}" y1="${y(L.top)}" y2="${y(L.top)}" stroke="#bbb" stroke-dasharray="3 3"/><text x="${ml+5}" y="${y(L.top)+12}" font-size="10.5" fill="#777">${esc(L.nom)}</text>`});
  A.results.filter(r=>r.el.point===pid).forEach(r=>{const ct=E.contact(r.el);if(ct.z1<zmax){const z2=Math.min(ct.z2,zmax);s+=`<rect x="${W-mr-10}" y="${y(ct.z1)}" width="8" height="${Math.max(y(z2)-y(ct.z1),2)}" fill="var(--c${r.classe})"/>`}});
  let d='';pr.z.forEach((z,i)=>{d+=(i?'L':'M')+x(pr.C[i]).toFixed(1)+','+y(z).toFixed(1)});s+=`<path d="${d}" fill="none" stroke="#a63d4a" stroke-width="2.2"/>`;
  const m=pt.mesures[k];if(m)s+=`<rect x="${x(m)-4}" y="${y((pt.zm1+pt.zm2)/2)-4}" width="8" height="8" fill="#1c2b45"/>`;
  for(let i=0;i<=4;i++){const c=cmax*i/4;s+=`<line x1="${x(c)}" x2="${x(c)}" y1="${H-mb}" y2="${H-mb+4}" stroke="#777"/><text x="${x(c)}" y="${H-mb+16}" text-anchor="middle" font-size="10.5" fill="#555">${nf(c,c<10?1:0)}</text>`;
    s+=`<text x="${x(c)}" y="${mt-8}" text-anchor="middle" font-size="10.5" fill="#01696f">${nf(c/s0.H/1000,c/s0.H/1000<1?2:1)}</text>`}
  for(let z=0;z<=zmax+1e-9;z+=1)s+=`<text x="${ml-6}" y="${y(z)+4}" text-anchor="end" font-size="10.5" fill="#555">${nf(z,0)}</text>`;
  s+=`<text x="${(ml+W-mr)/2}" y="${H-6}" text-anchor="middle" font-size="11" fill="#a63d4a">${k} gaz du sol (µg/m³)</text><text x="${(ml+W-mr)/2}" y="12" text-anchor="middle" font-size="11" fill="#01696f">Eau interstitielle à l'équilibre (µg/L)</text>`;
  s+=`<text x="14" y="${(mt+H-mb)/2}" font-size="11" fill="#555" transform="rotate(-90 14 ${(mt+H-mb)/2})" text-anchor="middle">Profondeur (m)</text></svg>`;
  $('#profil').innerHTML=s}
function renderTable(){const R=A.results;
  let h=`<thead><tr><th>Élément</th><th>Type</th><th>Contact (m)</th><th>Ép./Ø (m)</th><th>Zone</th><th>Point</th><th>${A.subs.includes('TCE')?'TCE':A.subs[0]} eau contact (µg/L)</th><th>SO₄ scénario (mg/L)</th><th>pH scénario</th><th>Classe</th><th>Agression visée</th></tr></thead><tbody>`;
  R.forEach((r,i)=>{const ct=r.ct,w=r.water;const t=r.subs.TCE||r.subs[A.subs[0]]||{};
    h+=`<tr data-i="${i}" class="${i===selEl?'sel':''}"><td><b>${esc(r.el.nom)}</b></td><td>${E.ELEM_TYPES[r.el.type]}</td><td class="n">${nf(ct.z1,1)} – ${nf(ct.z2,1)}</td><td class="n">${nf(ct.epaisseur,2)}</td><td>${r.sat&&r.unsat?'ZNS + nappe':(r.sat?'nappe':'ZNS')}</td><td>${esc(r.pt)}</td>
    <td class="n">${sci(t.cwContact)}</td><td class="n">${w?nf(w.nominal.so4,0)+(P.options.enveloppe?` <span class="muted">(${nf(w.env.so4,0)})</span>`:''):'—'}</td><td class="n">${w?nf(w.nominal.pH,2):'—'}</td>
    <td>${pill(r.classe)}</td><td>${r.agression.length?esc(r.agression.join(', ')):'—'}</td></tr>`});
  $('#tRes').innerHTML=h+'</tbody>';
  $('#tRes').querySelectorAll('tbody tr').forEach(tr=>tr.addEventListener('click',()=>{selEl=+tr.dataset.i;renderCoupe();renderTable();renderDetail();fillSelects();renderProfil()}))}
function renderDetail(){const r=A.results[selEl];if(!r){$('#detail').innerHTML='';return}const w=r.water,el=r.el;
  let h=`<div class="detail"><h4>${esc(el.nom)} – ${E.ELEM_TYPES[el.type]} ${pill(r.classe)}</h4>`;
  const txt=r.classe===0?`Classe correspondante au sens de la NF EN 206 : < XA1 (constat sur la chimie au contact, hypothèses saisies).`:`Classe correspondante au sens de la NF EN 206 : ${E.CLASSES[r.classe]}${r.agression.length?` vis-à-vis de : ${r.agression.join(', ')}`:''} (constat sur la chimie au contact, hypothèses saisies).`;
  h+=`<div class="verdict">${txt} Le choix de la classe d'exposition de l'ouvrage, de la formulation du béton, de l'enrobage et des dispositions constructives relève du géotechnicien, du bureau d'études structure et de l'entreprise de génie civil.</div><div class="dgrid">`;
  // géométrie
  h+=`<div class="dbox"><h5>Géométrie et contact</h5><table><tr><td>Intervalle au contact</td><td class="n">${nf(r.ct.z1,2)} – ${nf(r.ct.z2,2)} m</td></tr><tr><td>Hauteur en zone non saturée</td><td class="n">${nf(r.hUnsat,2)} m</td></tr><tr><td>Hauteur en nappe</td><td class="n">${nf(r.hSat,2)} m</td></tr><tr><td>Épaisseur / diamètre</td><td class="n">${nf(r.ct.epaisseur,2)} m</td></tr><tr><td>Faces exposées</td><td class="n">${r.ct.faces}</td></tr><tr><td>Enrobage</td><td class="n">${nf(el.enrobage,0)} mm</td></tr><tr><td>Hauteur au contact</td><td class="n">${nf(r.geom.hTot,2)} m</td></tr><tr><td>Surface de contact</td><td class="n">${nf(r.geom.Sc,2)} ${r.geom.unit}</td></tr><tr><td>Volume de béton</td><td class="n">${nf(r.geom.vol,3)} ${r.geom.volUnit}</td></tr></table></div>`;
  // gaz
  h+=`<div class="dbox"><h5>Gaz du sol et eau au contact</h5><table><tr><td></td><td class="n">gaz max</td><td class="n">eau</td><td class="n">% S</td></tr>`+A.subs.map(k=>{const s=r.subs[k];return `<tr><td>${k}</td><td class="n">${sci(s.cgMax)}</td><td class="n">${sci(s.cwContact)}</td><td class="n">${sci(s.pctS)}</td></tr>`}).join('')+
   `<tr><td colspan="3">Temps de percée ${A.subs[0]} dans l'épaisseur</td><td class="n">${nf(r.subs[A.subs[0]].tlag,2)} an</td></tr></table></div>`;
  // chimie
  if(w){const mw=w.m;h+=`<div class="dbox"><h5>Eau au contact – ${w.open?'encaissant calcaire':'sans calcite'}</h5><table><tr><td></td><td class="n">nominal</td><td class="n">enveloppe</td><td class="n">classe</td></tr>`+
   Object.keys(E.XA_WATER).map(k=>`<tr><td>${E.XA_WATER[k].lab}</td><td class="n">${nf(w.nominal[k],k==='pH'?2:(w.nominal[k]<1?2:0))}</td><td class="n">${nf(w.env[k],k==='pH'?2:(w.env[k]<1?2:0))}</td><td class="n">${E.CLASSES[P.options.enveloppe?w.clsEnv[k]:w.cls[k]]}</td></tr>`).join('')+
   `<tr><td>Acide ajouté (COHV + sulfures)</td><td class="n" colspan="3">${sci(r.mod.H)} mmol/L</td></tr><tr><td>CO₂ ajouté</td><td class="n" colspan="3">${sci(r.mod.y)} mmol/L</td></tr><tr><td>Sulfates ajoutés</td><td class="n" colspan="3">${nf(r.mod.dSO4mg,1)} mg/L</td></tr><tr><td>SI calcite eau mesurée</td><td class="n" colspan="3">${nf(mw.SIc0,2)}</td></tr>${w.ruleUp?'<tr><td colspan="4">2 caractéristiques dans la même classe : classe supérieure</td></tr>':''}</table></div>`}
  else h+=`<div class="dbox"><h5>Eau de nappe</h5><p class="muted">Élément entièrement au-dessus de la nappe : classement par les analyses de sol (${r.soil.detail.map(d=>esc(d.nom)+' : '+(d.connu?E.CLASSES[d.c]:'non mesuré')).join(' ; ')||'—'}).</p></div>`;
  h+=`<div class="dbox"><h5>Durabilité (indicatif)</h5><table><tr><td>SO₄ en surface du béton</td><td class="n">${nf(r.durab.Cs,0)} mg/L</td></tr><tr><td>Profondeur du front ≥ 200 mg/L à ${P.beton.duree} ans</td><td class="n">${nf(r.durab.xcrit,0)} mm</td></tr><tr><td>SO₄ au niveau des armatures</td><td class="n">${nf(r.durab.Ccov,0)} mg/L</td></tr><tr><td>Demi-épaisseur</td><td class="n">${nf(r.durab.demi,0)} mm</td></tr><tr><td colspan="2">${esc(r.durab.etat)}</td></tr></table></div>`;
  h+=`<div class="dbox"><h5>Sol (partie non saturée)</h5><table>${r.soil.detail.map(d=>`<tr><td>${esc(d.nom)}</td><td class="n">${d.connu?nf(d.so4s,0)+' mg/kg':'non mesuré'}</td><td class="n">${d.connu?E.CLASSES[d.c]:'?'}</td></tr>`).join('')||'<tr><td>Aucune couche non saturée au contact</td></tr>'}</table></div>`;
  if(r.acid.detail.length)h+=`<div class="dbox" style="grid-column:1/-1"><h5>Sols acides – bilan acide-base des couches au contact</h5><table><tr><td>Couche</td><td class="n">pH sol</td><td class="n">S réduit (% S)</td><td class="n">PSA</td><td class="n">ANC</td><td class="n">Acidité nette (mol H⁺/t)</td><td class="n">SO₄ total potentiel (mg/kg)</td><td class="n">Classe (sol)</td><td class="n">Oxydation</td><td>Constat</td></tr>${r.acid.detail.map(d=>`<tr><td>${esc(d.nom)}</td><td class="n">${d.pHs==null?'—':nf(d.pHs,1)}</td><td class="n">${nf(d.Scr,2)}</td><td class="n">${nf(d.PSA,0)}</td><td class="n">${nf(d.ANC,0)}</td><td class="n">${nf(d.net,0)}</td><td class="n">${nf(d.so4Pot,0)}</td><td class="n">${E.CLASSES[d.c]}</td><td class="n">${d.oxydable?'exposée':'non exposée'}</td><td>${esc(d.statut)}</td></tr>`).join('')}</table><p class="muted" style="margin:6px 0 0">PSA = 623,7 × S réduit ; ANC = 199,8 × CaCO₃ ; acidité nette = PSA + TAA − ANC/FF. Classe (sol) : SO₄ total potentiel et équivalent Baumann-Gully de l'acidité nette (1 mol H⁺/t ≈ 10 mL/kg), critères « sol » du tableau 2. Seules les couches exposées à l'oxydation entrent dans la classe de l'élément${P.acide&&P.acide.actif===false?' (option désactivée)':''}.</p></div>`;
  if(r.isco)h+=`<div class="dbox"><h5>ISCO – persulfate activé</h5><table><tr><td>Persulfate injecté</td><td class="n">${nf(r.isco.nPS,1)} mol/m³ de terrain</td></tr>${r.isco.dSO4!=null?`<tr><td>Sulfates ajoutés à l'eau au contact</td><td class="n">${nf(r.isco.dSO4*96.06,0)} mg/L</td></tr><tr><td>Acidité produite</td><td class="n">${nf(r.isco.H,1)} mmol/L</td></tr><tr><td>Base d'activation</td><td class="n">${nf(r.isco.base,1)} mmol/L</td></tr><tr><td>Sodium apporté</td><td class="n">${nf(r.isco.Na,0)} mg/L</td></tr>`:''}${r.isco.so4Sol!=null?`<tr><td>Sulfates ajoutés au sol non saturé</td><td class="n">${nf(r.isco.so4Sol,0)} mg/kg</td></tr>`:''}<tr><td colspan="2" class="muted">Sulfates plafonnés par la saturation en gypse dans l'eau au contact.</td></tr></table></div>`;
  if(r.h2s)h+=`<div class="dbox"><h5>H₂S – corrosion biogène (indicatif)</h5><table><tr><td>H₂S au contact</td><td class="n">${nf(r.h2s.cg,0)} µg/m³ (${nf(r.h2s.ppm,2)} ppm)</td></tr><tr><td>Flux vers la surface du béton</td><td class="n">${nf(r.h2s.gS,2)} g S/m²/an</td></tr><tr><td>Acide sulfurique produit</td><td class="n">${nf(r.h2s.Hp,3)} mol H⁺/m²/an</td></tr><tr><td>Épaisseur neutralisable à ${P.beton.duree} ans</td><td class="n">${nf(r.h2s.depth,1)} mm</td></tr><tr><td colspan="2" class="muted">Agression non couverte par le tableau 2 de la NF EN 206 (environnement particulier au sens du FD P18-011). Calcul d'ordre de grandeur : transfert diffusif, oxydation bactérienne complète, béton humide et aéré.</td></tr></table></div>`;
  h+=`<div class="dbox" style="grid-column:1/-1"><h5>Sensibilité à l'épaisseur / au diamètre (${A.subs[0]}, sulfates) – calcul indicatif</h5><table><tr><td>Épaisseur (m)</td><td class="n">Percée ${A.subs[0]} (an)</td><td class="n">Flux ${A.subs[0]} (µg/m²/an)</td><td class="n">Écart demi-épaisseur – max(front, enrobage) (mm)</td><td class="n">Front de sulfates</td></tr>${r.sens.map(s=>`<tr${s.f===1?' style="font-weight:600"':''}><td>${nf(s.ep,2)}${s.f===1?' (saisie)':''}</td><td class="n">${nf(s.tlag,2)}</td><td class="n">${sci(s.flux)}</td><td class="n">${nf(s.reserve,0)}</td><td class="n">${s.ok?'reste dans l\'épaisseur':'dépasse la demi-épaisseur'}</td></tr>`).join('')}</table></div>`;
  h+=`</div>${r.flags.length?`<ul class="flags">${r.flags.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`:''}</div>`;
  $('#detail').innerHTML=h}
// ------------------------------------------------------------ fichiers
function download(name,text,type){const b=new Blob([text],{type});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
$('#bExemple').addEventListener('click',()=>{P=E.exemple();E.migrate(P);BSS=null;selEl=0;renderForms();run()});
$('#bAcide').addEventListener('click',()=>{P=E.exempleAcide();E.migrate(P);BSS=null;selEl=0;renderForms();run()});
$('#bNouveau').addEventListener('click',()=>{const b=E.exemple();E.migrate(b);b.projet={nom:'',site:'',ref:'',auteur:'',date:new Date().toISOString().slice(0,10),x:null,y:null,z:null};b.rapport=Object.assign({},E.RAPPORT_DEF);b.piezos=[];b.geolLocale={source:'',layers:[],rayon:500};b.analyses={eau:null,cohv:null};BSS=null;
  b.points=[{id:'P1',sousBatiment:true,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:0,PCE:0,DCE:0,CV:0,H2S:0}}];b.elements=[{id:'E1',nom:'Pieu 1',type:'pieu',zTop:0.8,zBase:10,dim:0.5,largeur:0.5,enrobage:50,eL:0.55,point:'P1',zoneTraitement:false}];
  b.nappe.cohv={TCE:0,PCE:0,DCE:0,CV:0,H2S:0};b.traitement.mode='aucun';P=b;selEl=0;renderForms();run()});
$('#bCsv').addEventListener('click',()=>{const rows=[['Élément','Type','Contact haut (m)','Contact bas (m)','Épaisseur/diamètre (m)','Hauteur en nappe (m)','Surface de contact','Zone','Point','Classe au sens de la norme (constat)','Agression visée','SO4 nominal (mg/L)','SO4 enveloppe (mg/L)','pH scénario','CO2 agressif (mg/L)',...A.subs.map(k=>k+' eau contact (µg/L)'),'Acidité nette max (mol H+/t)','SO4 total potentiel max (mg/kg)','H2S contact (µg/m3)','Épaisseur neutralisable H2S (mm)','Vigilance']];
  A.results.forEach(r=>{const w=r.water;rows.push([r.el.nom,E.ELEM_TYPES[r.el.type],r.ct.z1,r.ct.z2,r.ct.epaisseur,r.hSat.toFixed(2),r.geom.Sc.toFixed(2)+' '+r.geom.unit,r.sat&&r.unsat?'ZNS+nappe':(r.sat?'nappe':'ZNS'),r.pt,E.CLASSES[r.classe],r.agression.join(' / '),w?w.nominal.so4.toFixed(0):'',w?w.env.so4.toFixed(0):'',w?w.nominal.pH.toFixed(2):'',w?w.nominal.co2.toFixed(1):'',...A.subs.map(k=>r.subs[k].cwContact.toPrecision(3)),r.acid.detail.length?Math.max(...r.acid.detail.map(d=>d.net)).toFixed(0):'',r.acid.detail.length?Math.max(...r.acid.detail.map(d=>d.so4Pot)).toFixed(0):'',r.h2s?r.h2s.cg.toFixed(0):'',r.h2s?r.h2s.depth.toFixed(1):'',r.flags.join(' | ')])});
  download((P.projet.ref||'agresol')+'_resultats.csv','\ufeff'+rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""').replace('.',',')}"`).join(';')).join('\r\n'),'text/csv')});
// ------------------------------------------------------------ études : JSON, index, rapport
const IDX_KEY='agresol_etudes_v1';
function cleanP(){const o=JSON.parse(JSON.stringify(P));delete o._inc;return o}
function metaOf(){const pr=P.projet,R=P.rapport||{};const cm=A&&A.results.length?Math.max(...A.results.map(r=>r.classe)):0;const crit=A&&A.results.find(r=>r.classe===cm);
  const ref=(pr.ref||'ETUDE').trim(),ind=(R.indice||'V1').trim();
  return {cle:ref+'|'+ind,ref,indice:ind,nom:pr.nom||'',site:pr.site||'',commune:pr.commune||'',insee:pr.insee||'',parcelle:pr.parcelle||'',x:pr.x,y:pr.y,date:pr.date||'',etabli:R.etabli||pr.auteur||'',
    classeMax:E.CLASSES[cm],ouvrageCritique:crit?crit.el.nom:'',nOuvrages:P.elements.length,types:[...new Set(P.elements.map(e=>E.ELEM_TYPES[e.type]))].join(', '),traitement:({aucun:'aucun',venting:'venting',sparging:'sparging',vs:'venting-sparging'})[P.traitement.mode]+(P.traitement.isco&&P.traitement.isco.actif?' + ISCO':''),
    fichier:(ref+'_'+ind).replace(/[^\w.-]+/g,'_')+'_agresol.json'}}
function etude(){return {format:'AGRESOL-etude',version:'1.5',enregistre:new Date().toISOString(),meta:metaOf(),resultats:A?A.results.map(r=>({ouvrage:r.el.nom,type:E.ELEM_TYPES[r.el.type],tete:r.ct.z1,pied:r.ct.z2,zone:r.sat&&r.unsat?'ZNS + nappe':(r.sat?'nappe':'ZNS'),point:r.pt,classe:E.CLASSES[r.classe],agression:r.agression,vigilance:r.flags})):[],projet:cleanP()}}
const STORE=window.AGRESOL_STORE;let IDX={};
STORE.load().then(m=>{IDX=m||{};if($('#dlgIdx').open)openIdx()}).catch(e=>console.warn('index des études :',e));
function idxLoad(){return JSON.parse(JSON.stringify(IDX))}
function idxStore(m){IDX=m;STORE.save({format:'AGRESOL-index',version:'1.5',etudes:m}).catch(e=>alert('Index des études : enregistrement impossible ('+(e.message||e)+'). Téléchargez « toutes les études (JSON) » pour conserver une copie.'));return true}
function idxAdd(et){const m=idxLoad();const k=et.meta.cle;const prev=m[k];et.cree=prev&&prev.cree?prev.cree:et.enregistre;m[k]=et;return idxStore(m)}
function toast(t){let d=$('#toast');if(!d){d=document.createElement('div');d.id='toast';document.body.appendChild(d)}d.textContent=t;d.classList.add('on');clearTimeout(d._t);d._t=setTimeout(()=>d.classList.remove('on'),2600)}
function loadP(o){const base=E.exemple();P=Object.assign(base,o);P.acide=Object.assign({},E.ACID_DEF,o.acide||{});for(const k in E.SUBST)if(!P.substances[k])P.substances[k]={...E.SUBST[k],actif:false};const msg=E.migrate(P);BSS=null;selEl=0;renderForms();run();return msg}
$('#bSave').addEventListener('click',()=>{const et=etude();download(et.meta.fichier,JSON.stringify(et,null,1),'application/json');if(idxAdd(et))toast('Étude enregistrée (JSON) et ajoutée à l\'index des études');});
$('#fOpen').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{try{const o=JSON.parse(rd.result);
  if(o.format==='AGRESOL-index'){const n=importIndex(o);openIdx();toast(n+' étude(s) importée(s) dans l\'index');return}
  const isEt=o.format==='AGRESOL-etude';const msg=loadP(isEt?o.projet:o);if(isEt)idxAdd(o);
  if(msg.length)alert('Projet repris au format AGRESOL v1.6 :\n– '+msg.join('\n– '))}catch(err){alert('Fichier illisible : '+err.message)}};rd.readAsText(f);e.target.value=''});
function importIndex(o){const m=idxLoad();let n=0;const list=Array.isArray(o.etudes)?o.etudes:Object.values(o.etudes||{});for(const it of list){const et=it&&it.format==='AGRESOL-etude'?it:(it&&it.etude);if(et&&et.meta&&et.projet){m[et.meta.cle]=et;n++}}idxStore(m);return n}
function idxRows(){return Object.values(idxLoad()).sort((a,b)=>String(b.enregistre).localeCompare(String(a.enregistre)))}
function indexFile(full){const rows=idxRows();return {format:'AGRESOL-index',version:'1.5',genere:new Date().toISOString(),nombre:rows.length,
  etudes:rows.map(et=>full?et:{fichier:et.meta.fichier,cle:et.meta.cle,ref:et.meta.ref,indice:et.meta.indice,projet:et.meta.nom,site:et.meta.site,commune:et.meta.commune,parcelle:et.meta.parcelle,x:et.meta.x,y:et.meta.y,dateEtude:et.meta.date,etabliPar:et.meta.etabli,classeMax:et.meta.classeMax,ouvrageCritique:et.meta.ouvrageCritique,ouvrages:et.meta.nOuvrages,types:et.meta.types,traitement:et.meta.traitement,enregistre:et.enregistre})}}
function openIdx(){const d=$('#dlgIdx');const rows=idxRows();const q=($('#idxQ')&&$('#idxQ').value||'').toLowerCase();
  const f=rows.filter(et=>!q||JSON.stringify(et.meta).toLowerCase().includes(q));
  $('#idxBody').innerHTML=f.length?f.map(et=>{const m=et.meta;return `<tr><td><b>${esc(m.ref)}</b></td><td>${esc(m.indice)}</td><td>${esc(m.nom)}<div class="muted">${esc(m.site)}</div></td><td>${esc(m.date)}</td><td>${esc(m.etabli)}</td><td>${esc(m.nOuvrages)} <span class="muted">${esc(m.types)}</span></td><td><span class="pill p${E.CLASSES.indexOf(m.classeMax)}">${esc(m.classeMax)}</span></td><td class="muted">${esc(new Date(et.enregistre).toLocaleString('fr-FR'))}</td><td class="acts"><button class="btn xs" data-io="${esc(m.cle)}">Ouvrir</button> <button class="btn xs" data-ij="${esc(m.cle)}">JSON</button> <button class="btn xs" data-ir="${esc(m.cle)}">Rapport</button> <button class="btn xs del" data-id="${esc(m.cle)}">Supprimer</button></td></tr>`}).join(''):`<tr><td colspan="9" class="muted">Aucune étude dans l'index${q?' pour cette recherche':''}. Les études y sont ajoutées à chaque « Enregistrer », « Rapport » ou ouverture d'un fichier d'étude.</td></tr>`;
  $('#idxN').textContent=rows.length+' étude(s)';if(STORE.mode==='serveur')$('#idxHint').textContent='L\'index est conservé sur le serveur AGRESOL et partagé par les utilisateurs du site. Téléchargez régulièrement « toutes les études (JSON) » : une mise à jour du site peut réinitialiser ce fichier.';if(!d.open)d.showModal()}
$('#bIdx').addEventListener('click',openIdx);
$('#dlgIdx').addEventListener('input',e=>{if(e.target.id==='idxQ')openIdx()});
$('#dlgIdx').addEventListener('click',e=>{const b=e.target.closest('button,[data-x]');if(!b)return;const m=idxLoad();
  if(b.dataset.io){loadP(m[b.dataset.io].projet);$('#dlgIdx').close();toast('Étude '+m[b.dataset.io].meta.ref+' ouverte');return}
  if(b.dataset.ij){const et=m[b.dataset.ij];download(et.meta.fichier,JSON.stringify(et,null,1),'application/json');return}
  if(b.dataset.ir){loadP(m[b.dataset.ir].projet);$('#dlgIdx').close();openReport();return}
  if(b.dataset.id){if(confirm('Supprimer l\'étude '+m[b.dataset.id].meta.ref+' '+m[b.dataset.id].meta.indice+' de l\'index ?')){delete m[b.dataset.id];idxStore(m);openIdx()}return}
  if(b.id==='idxAdd'){idxAdd(etude());openIdx();toast('Étude en cours ajoutée à l\'index');return}
  if(b.id==='idxDl'){download('AGRESOL_index_etudes.json',JSON.stringify(indexFile(false),null,1),'application/json');return}
  if(b.id==='idxDlAll'){download('AGRESOL_etudes_completes.json',JSON.stringify(indexFile(true)),'application/json');return}
  if(b.id==='idxClose'){$('#dlgIdx').close()}});
function openReport(){const et=etude();idxAdd(et);
  const svg={coupe:$('#coupe').innerHTML,profils:[]};const sp=$('#selPt'),ss=$('#selSub');const k0=sp.value,s0=ss.value;
  if(A&&A.subs.length)for(const pt of P.points){sp.value=pt.id;ss.value=A.subs[0];renderProfil();svg.profils.push({pt:pt.id,sub:A.subs[0],svg:$('#profil').innerHTML})}
  sp.value=k0;ss.value=s0;renderProfil();
  RAP={etude:et,svg,inc:P._inc||null};
  RAPW=window.open(window.AGRESOL_RAPPORT_URL||'rapport.html','_blank');if(!RAPW)alert('Autorisez les fenêtres surgissantes pour afficher le rapport.')}
let RAP=null,RAPW=null;
window.addEventListener('message',e=>{const d=e.data;if(d&&d.type==='agresol-rapport-pret'&&RAP&&e.source&&(!RAPW||e.source===RAPW))e.source.postMessage({type:'agresol-rapport-data',payload:RAP},'*')});
$('#bPrint').addEventListener('click',openReport);
renderForms();run();
})();
