/* AGRESOL v1.6 – géolocalisation : Lambert 93, IGN (altitude, adresse, cadastre), BRGM (feuille géologique, banque du sous-sol) */
(function(root){
const D2R=Math.PI/180,n=0.7256077650,c=11754255.426,xs=700000,ys=12655612.050,e=0.08181919106,l0=3*D2R;
function l93ToWgs(x,y){const dx=x-xs,dy=y-ys;const R=Math.sqrt(dx*dx+dy*dy);const g=Math.atan(dx/-dy);const lon=(l0+g/n)/D2R;
 const L=-Math.log(R/c)/n;let phi=2*Math.atan(Math.exp(L))-Math.PI/2;
 for(let i=0;i<12;i++){const es=e*Math.sin(phi);phi=2*Math.atan(Math.pow((1+es)/(1-es),e/2)*Math.exp(L))-Math.PI/2}
 return{lon,lat:phi/D2R}}
function wgsToL93(lon,lat){const phi=lat*D2R,es=e*Math.sin(phi);const L=Math.log(Math.tan(Math.PI/4+phi/2)*Math.pow((1-es)/(1+es),e/2));
 const R=c*Math.exp(-n*L),g=n*(lon*D2R-l0);return{x:xs+R*Math.sin(g),y:ys-R*Math.cos(g)}}
const okL93=(x,y)=>isFinite(x)&&isFinite(y)&&x>50000&&x<1300000&&y>6000000&&y<7200000;
async function j(url,opt){const r=await fetch(url,opt);if(!r.ok)throw new Error('HTTP '+r.status);return r.json()}
async function altitude(lon,lat){const d=await j(`https://data.geopf.fr/altimetrie/1.0/calcul/alti/rest/elevation.json?lon=${lon}&lat=${lat}&resource=ign_rge_alti_wld&zonly=true`);
 const z=d.elevations&&d.elevations[0];return typeof z==='number'&&z>-1000?z:(z&&z.z)}
async function adresse(lon,lat){const d=await j(`https://data.geopf.fr/geocodage/reverse?lon=${lon}&lat=${lat}&index=address&limit=1`);
 const f=d.features&&d.features[0];if(!f)return null;const p=f.properties;return{label:p.label,commune:p.city,insee:p.citycode,distance:p.distance}}
async function chercherAdresse(q){const d=await j(`https://data.geopf.fr/geocodage/search?q=${encodeURIComponent(q)}&limit=1`);
 const f=d.features&&d.features[0];if(!f)return null;const [lon,lat]=f.geometry.coordinates;const p=f.properties;
 const l=okL93(p.x,p.y)?{x:p.x,y:p.y}:wgsToL93(lon,lat);return{x:l.x,y:l.y,lon,lat,label:p.label}}
function inPoly(pt,ring){let ins=false;for(let i=0,k=ring.length-1;i<ring.length;k=i++){const [xi,yi]=ring[i],[xk,yk]=ring[k];
 if(((yi>pt[1])!==(yk>pt[1]))&&(pt[0]<(xk-xi)*(pt[1]-yi)/(yk-yi)+xi))ins=!ins}return ins}
async function parcelle(lon,lat){
 const g=encodeURIComponent(JSON.stringify({type:'Point',coordinates:[lon,lat]}));
 let fs=[];try{const d=await j(`https://apicarto.ign.fr/api/cadastre/parcelle?geom=${g}`);fs=d.features||[]}catch(err){}
 let proche=false;
 if(!fs.length){const d=await j(`https://data.geopf.fr/wfs/ows?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=CADASTRALPARCELS.PARCELLAIRE_EXPRESS:parcelle&OUTPUTFORMAT=application/json&COUNT=20&CQL_FILTER=DWITHIN(geom,POINT(${lat}%20${lon}),40,meters)`);
  fs=d.features||[];proche=true;
  const inside=fs.find(f=>{const gm=f.geometry;const polys=gm.type==='MultiPolygon'?gm.coordinates:[gm.coordinates];return polys.some(p=>inPoly([lon,lat],p[0]))});
  if(inside){fs=[inside];proche=false}else{const k=Math.cos(lat*D2R);const seg=(p,a,b)=>{const ax=(a[0]-p[0])*k,ay=a[1]-p[1],bx=(b[0]-p[0])*k,by=b[1]-p[1];const dx=bx-ax,dy=by-ay;const t=Math.max(0,Math.min(1,-(ax*dx+ay*dy)/((dx*dx+dy*dy)||1)));return Math.hypot(ax+t*dx,ay+t*dy)};
   const dist=f=>{const polys=f.geometry.type==='MultiPolygon'?f.geometry.coordinates:[f.geometry.coordinates];let m=1e9;for(const pl of polys){const r=pl[0];for(let i=1;i<r.length;i++)m=Math.min(m,seg([lon,lat],r[i-1],r[i]))}return m};fs.sort((a,b)=>dist(a)-dist(b))}}
 const f=fs[0];if(!f)return null;const p=f.properties;
 return{parcelle:`${p.section} ${String(p.numero).replace(/^0+/,'')}`,idu:p.idu,surface:p.contenance,commune:p.nom_com,insee:p.code_insee,proche}}
// ---------------------------------------------------------------- BRGM : passe par le serveur relais AGRESOL (server.js), sinon accès direct (http)
const BRGM_HTTP='http://geoservices.brgm.fr/geologie';
// préfixe du serveur relais : réécrit en « port/5000 » sur pplx.app, vide en local (node server.js)
const PB='__PORT_5000__';const API=PB.startsWith('__')?'api/':PB.replace(/\/$/,'')+'/api/';
async function apiOrNull(path){try{const r=await fetch(path,{headers:{accept:'application/json'}});if(!r.ok)return null;const t=r.headers.get('content-type')||'';if(!t.includes('json'))return null;return await r.json()}catch(err){return null}}
function parseMs(xml){const out=[];for(const fm of xml.split('<gml:featureMember>').slice(1)){const o={};fm.replace(/<ms:(\w+)>([^<]*)<\/ms:\1>/g,(m,k,v)=>{o[k]=v.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&')});out.push(o)}return out}
async function carteGeol(x,y){
 const api=await apiOrNull(`${API}brgm/carte?x=${x}&y=${y}`);if(api)return api;
 try{const w=l93ToWgs(x,y);const B=`${w.lon-0.01},${w.lat-0.01},${w.lon+0.01},${w.lat+0.01}`;
  const q=L=>fetch(`${BRGM_HTTP}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=${L}&QUERY_LAYERS=${L}&SRS=EPSG:4326&BBOX=${B}&WIDTH=101&HEIGHT=101&X=50&Y=50&INFO_FORMAT=application/vnd.ogc.gml&STYLES=`).then(r=>r.text());
  const [a,b]=await Promise.all([q('SCAN_F_GEOL50_CATALOG'),q('LITHO_1M_SIMPLIFIEE')]);
  const g=(s,k)=>{const m=s.match(new RegExp(`<${k}>([^<]*)</${k}>`));return m?m[1].replace(/&#39;/g,"'"):null};
  return{feuille:g(a,'numero'),nomFeuille:g(a,'nom'),litho1M:g(b,'DESCR')}}catch(err){return null}}
async function forages(x,y,r=500){
 const api=await apiOrNull(`${API}brgm/bss?x=${x}&y=${y}&r=${r}`);if(api)return{via:'serveur',list:api};
 try{const B=`${x-r},${y-r},${x+r},${y+r}`;const t=await fetch(`${BRGM_HTTP}?service=WFS&version=1.1.0&request=GetFeature&typename=BSS_TOTAL_SANS_LABEL&srsName=EPSG:2154&bbox=${B},EPSG:2154&maxFeatures=200`).then(r=>r.text());
  return{via:'direct',list:normBss(parseMs(t),x,y)}}catch(err){return{via:'aucun',list:null,err:String(err)}}}
function normBss(arr,x,y){return arr.map(o=>({bss:o.bss_id,ref:o.reference,nature:o.nature,prof:o.prof_atteinte?Number(o.prof_atteinte):null,zsol:o.zsol?Number(o.zsol):(o.z_bdalti?Number(o.z_bdalti):null),
  x:Number(o.x_ref06),y:Number(o.y_ref06),d:Math.hypot(Number(o.x_ref06)-x,Number(o.y_ref06)-y),log:o.log_geol_valide==='Present'||o.coupe_simplifiee==='Presente',
  eau:o.prof_eau_sol?Number(o.prof_eau_sol):null,dateEau:o.date_eau_sol||'',date:o.date_realisation||'',commune:o.nom_commune||'',lieu:o.lieu_dit||'',piezo:o.piezometre==='OUI',
  fiche:`https://ficheinfoterre.brgm.fr/InfoterreFiche/ficheBss.action?id=${encodeURIComponent(o.reference||o.bss_id)}`})).sort((a,b)=>a.d-b.d)}
async function logBss(ref){const api=await apiOrNull(`${API}brgm/log?ref=${encodeURIComponent(ref)}`);return api}
root.AGRESOL_GEO={l93ToWgs,wgsToL93,okL93,altitude,adresse,chercherAdresse,parcelle,carteGeol,forages,logBss,normBss,parseMs};
})(typeof window!=='undefined'?window:module.exports);
