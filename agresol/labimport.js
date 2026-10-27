/* AGRESOL v1.6 – import automatique des rapports d'analyses (PDF texte, CSV, TXT, XLSX/XLS)
   Lecture ligne à ligne : libellé du paramètre, unité, résultat (avec « < LQ »), incertitude éventuelle. */
(function(root){
const NUM=/^([<>≤≥]=?)?\s*(-?\d+(?:[.,]\d+)?)(?:\s*(?:\+\/-|±)\s*(\d+(?:[.,]\d+)?)\s*(%)?)?$/;
const num=s=>parseFloat(String(s).replace(',','.'));
const UNITS=/^(µg\/l|μg\/l|ug\/l|mg\/l|ng\/l|mmole?\/l|mmol\/l|meq\/l|°f|°c|µs\/cm|μs\/cm|unité ph|u\.?ph|mg\/l cao|°dh|ntu|-|%)\b/i;
// paramètres de l'analyse d'agressivité (NF EN 206, tableau 2) et paramètres complémentaires
const P_EAU=[
 {k:'pH',re:/^ph\b(?!.*4[.,]3)/i,u:'',def:{abs:0.2}},
 {k:'co2',re:/(co2|dioxyde de carbone|acide carbonique)\s*(agressif|libre agressif)|aggressive co2|co2 agr/i,u:'mg/L',def:{rel:20}},
 {k:'so4',re:/^sulfates?\b|\bso4\b|sulphate/i,not:/sulfures?|soufre/i,u:'mg/L',def:{rel:10}},
 {k:'mg',re:/^magn[ée]sium|\(mg\)|^mg2?\+?$/i,u:'mg/L',def:{rel:10}},
 {k:'nh4',re:/ammonium|\bnh4\b/i,not:/azote/i,u:'mg/L',def:{rel:15}},
 {k:'ca',re:/^calcium|\(ca\)|^ca2?\+?$/i,not:/dureté/i,u:'mg/L',def:{rel:10}},
 {k:'tac',re:/titre alcalim[ée]trique complet|^t\.?a\.?c\.?\b|alcalinit[ée] totale/i,not:/marbre/i,u:'mmol/L',def:{rel:10}},
 {k:'cl',re:/^chlorures?\b/i,not:/vinyle/i,u:'mg/L',def:{rel:10}},
 {k:'no3',re:/^nitrates?\b/i,u:'mg/L',def:{rel:10}},
 {k:'s2',re:/sulfures?\s*(solubles?|dissous|totaux)?$|^sulfures?\b/i,not:/hydrog/i,u:'mg/L',def:{rel:20}},
 {k:'T',re:/^temp[ée]rature/i,u:'°C',def:{abs:0}}];
const P_COHV=[
 {k:'TCE',re:/trichloro[ée]th[yè]l[eè]ne|trichloro[ée]th[eè]ne|\btce\b/i,not:/1,1,1|trichloro[ée]thane/i},
 {k:'PCE',re:/t[ée]trachloro[ée]th[yè]l[eè]ne|t[ée]trachloro[ée]th[eè]ne|perchloro[ée]th[yè]l[eè]ne|\bpce\b/i},
 {k:'DCE',re:/cis-?\s*1,?2-?\s*dichloro[ée]th(?:yl)?[eè]ne|cis-?dce|1,2-dichloro[ée]th(?:yl)?[eè]ne\s*\(cis\)/i,not:/trans|1,1-|somme/i},
 {k:'CV',re:/chlorure de vinyle|vinyl chloride|(^|[^a-z])chloro[ée]th(?:yl)?[eè]ne/i,not:/dichloro|trichloro|t[ée]trachloro/i},
 {k:'H2S',re:/sulfure d.hydrog[eè]ne|\bh2s\b/i}];
function toRows(text){return text.split(/\r?\n/).map(l=>l.split(/\t|;|\s{2,}|,(?=\s*[^\d])/).map(c=>c.trim()).filter(c=>c!==''))}
function cellNum(c){const s=String(c).replace(/\s+/g,' ').trim().replace(/^≤/,'<').replace(/^≥/,'>');const m=s.match(NUM);if(!m)return null;
 return{v:num(m[2]),lq:m[1]&&m[1].startsWith('<'),u:m[3]?num(m[3]):null,uRel:!!m[4]}}
function findUnit(cells){for(const c of cells){const m=String(c).trim().match(UNITS);if(m)return m[1].toLowerCase().replace('μ','µ').replace('ug','µg')}return ''}
function convEau(k,v,unit){unit=(unit||'').toLowerCase();
 if(k==='tac'){if(unit.includes('°f'))return v/5;if(unit.includes('mg/l'))return v/61.02;return v}
 if(unit==='µg/l'&&k!=='pH')return v/1000;return v}
function convCohv(v,unit){unit=(unit||'').toLowerCase();if(unit==='mg/l')return v*1000;if(unit==='ng/l')return v/1000;return v}
function parse(rows){const eau={},cohv={},inc={},lq={},raw=[],meta={};let hdrInc=-1;
 const flat=rows.map(r=>r.map(c=>String(c==null?'':c).trim()).filter(c=>c!==''));
 for(const r of flat){const line=r.join(' ');
  if(!meta.labo){const m=line.match(/(AL-West|Agrolab|Eurofins|Wessling|Carso|SGS|Synlab|Eurofins Analyses|Laboratoire [A-Z][\w\- ]+)/i);if(m)meta.labo=m[1]}
  if(!meta.echantillon){const m=line.match(/N°\s*(?:d'?)?échant(?:illon)?\.?\s*:?\s*(\S+)/i);if(m)meta.echantillon=m[1]}
  if(!meta.prelevement){const m=line.match(/Pr[ée]l[èe]vement\s*:?\s*(\d{1,2}[./]\d{1,2}[./]\d{2,4})/i);if(m)meta.prelevement=m[1]}
  if(!meta.ouvrage){const m=line.match(/\b(PZ\s?\d+[A-Z]?|Pz\s?\d+|piézomètre\s+\S+)/i);if(m)meta.ouvrage=m[1].replace(/\s/g,'')}
  if(!meta.classeLabo){const m=line.match(/classe d.exposition.*?(<\s*XA1|XA[123])/i);if(m)meta.classeLabo=m[1].replace(/\s/g,'')}
  const iI=r.findIndex(c=>/incertitude|uncertainty|\bU\s*\(%\)/i.test(c));if(iI>=0)hdrInc=iI;
  // libellé = première cellule contenant des lettres et ne ressemblant pas à une valeur
  const li=r.findIndex(c=>/[a-zA-Zé]{2,}/.test(c)&&!cellNum(c));if(li<0)continue;
  const lab=r.slice(li,li+1).join(' ');const rest=r.slice(li+1);
  let val=null,vi=-1;for(let i=0;i<rest.length;i++){const n=cellNum(rest[i]);if(n){val=n;vi=i;break}}
  if(!val)continue;
  const unit=findUnit(rest.slice(0,Math.max(vi,0)+1).concat(rest.slice(vi+1,vi+2)))||findUnit([lab]);
  let U=val.u!=null?{v:val.u,rel:val.uRel}:null;
  if(!U){for(const c of rest.slice(vi+1)){const m=String(c).match(/^(?:±|\+\/-)\s*(\d+(?:[.,]\d+)?)\s*(%)?$/);if(m){U={v:num(m[1]),rel:!!m[2]};break}}}
  if(!U&&hdrInc>=0&&r[hdrInc]){const m=String(r[hdrInc]).match(/(\d+(?:[.,]\d+)?)\s*(%)?/);if(m&&r[hdrInc]!==rest[vi])U={v:num(m[1]),rel:!!m[2]||true}}
  for(const p of P_EAU){if(eau[p.k]!=null)continue;if(!p.re.test(lab)||(p.not&&p.not.test(lab)))continue;
   if(p.k==='mg'&&/mg\/l/i.test(lab)&&!/magn/i.test(lab))continue;
   eau[p.k]=convEau(p.k,val.v,unit);lq[p.k]=!!val.lq;if(U)inc[p.k]=U;raw.push({param:p.k,libelle:lab,valeur:(val.lq?'<':'')+val.v,unite:unit,incertitude:U?U.v+(U.rel?' %':''):''});break}
  for(const p of P_COHV){if(cohv[p.k]!=null)continue;if(!p.re.test(lab)||(p.not&&p.not.test(lab)))continue;
   cohv[p.k]=convCohv(val.v,unit||'µg/l');lq['cohv_'+p.k]=!!val.lq;raw.push({param:p.k,libelle:lab,valeur:(val.lq?'<':'')+val.v,unite:unit||'µg/l',incertitude:''});break}}
 return{eau,cohv,inc,lq,raw,meta}}
// incertitude retenue : maximum des incertitudes relatives des paramètres quantifiés (SO₄, Mg, NH₄, CO₂), sinon valeurs par défaut
function incertitude(res){const det=[];let rel=0,abs=0.2;
 for(const p of P_EAU){if(!['so4','mg','nh4','co2','pH'].includes(p.k))continue;const v=res.eau[p.k];if(v==null)continue;
  const U=res.inc[p.k];let r,src;
  if(p.k==='pH'){if(U&&!U.rel){abs=U.v;src='rapport'}else{abs=p.def.abs;src='défaut'}det.push({k:'pH',u:abs,unit:'unité pH',src});continue}
  if(res.lq[p.k]){det.push({k:p.k,u:null,src:'< LQ (non retenu)'});continue}
  if(U){r=U.rel?U.v:(v>0?U.v/v*100:p.def.rel);src='rapport'}else{r=p.def.rel;src='défaut'}
  det.push({k:p.k,u:r,unit:'%',src});rel=Math.max(rel,r)}
 if(!rel)rel=10;return{rel:Math.round(rel*10)/10,abs,det}}
// ---------------------------------------------------------------- lecture des fichiers
function loadScript(src){return new Promise((ok,ko)=>{if(document.querySelector(`script[data-src="${src}"]`))return ok();const s=document.createElement('script');s.src=src;s.dataset.src=src;s.onload=ok;s.onerror=()=>ko(new Error('chargement impossible : '+src));document.head.appendChild(s)})}
async function pdfRows(buf){await loadScript('vendor/pdf.min.js');await loadScript('vendor/pdf.worker.min.js');
 const lib=window.pdfjsLib;lib.GlobalWorkerOptions.workerSrc='vendor/pdf.worker.min.js';
 const doc=await lib.getDocument({data:new Uint8Array(buf),disableWorker:true,isEvalSupported:false}).promise;const out=[];
 for(let p=1;p<=doc.numPages;p++){const pg=await doc.getPage(p);const tc=await pg.getTextContent();
  const its=tc.items.filter(i=>i.str&&i.str.trim()).map(i=>({s:i.str.trim(),x:i.transform[4],y:i.transform[5]}));its.sort((a,b)=>b.y-a.y||a.x-b.x);
  const rows=[];let cur=null;for(const it of its){if(cur&&Math.abs(cur.y-it.y)<=2.5)cur.items.push(it);else{cur={y:it.y,items:[it]};rows.push(cur)}}
  for(const r of rows){r.items.sort((a,b)=>a.x-b.x);out.push(r.items.map(i=>i.s))}}
 return out}
async function xlsxRows(buf){await loadScript('vendor/xlsx.full.min.js');const wb=window.XLSX.read(buf,{type:'array'});const out=[];
 for(const n of wb.SheetNames){const a=window.XLSX.utils.sheet_to_json(wb.Sheets[n],{header:1,raw:false,defval:''});for(const r of a)out.push(r.map(c=>String(c)))}return out}
async function lireFichier(file){const nm=file.name.toLowerCase();const buf=await file.arrayBuffer();let rows;
 if(nm.endsWith('.pdf'))rows=await pdfRows(buf);else if(/\.(xlsx|xls|ods)$/.test(nm))rows=await xlsxRows(buf);
 else{let t=new TextDecoder('utf-8').decode(buf);if(t.includes('\ufffd'))t=new TextDecoder('latin1').decode(buf);rows=toRows(t)}
 const res=parse(rows);res.fichier=file.name;res.nLignes=rows.length;return res}
root.AGRESOL_LAB={parse,toRows,incertitude,lireFichier,P_EAU,P_COHV};
})(typeof window!=='undefined'?window:module.exports);
