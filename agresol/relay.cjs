/* AGRESOL – relais BRGM pour app.gmep-france.eu (repris de server.js, sans serveur HTTP)
   bss({x,y,r}) · log({ref}) · carte({x,y}) */
const fs=require('fs'),path=require('path');
// geo.js est partagé avec le navigateur : chargé en CommonJS quel que soit le type du paquet
const G=(()=>{const m={exports:{}};new Function('module','window',fs.readFileSync(path.join(__dirname,'geo.js'),'utf8'))(m,undefined);return m.exports.AGRESOL_GEO})();
const BRGM='http://geoservices.brgm.fr/geologie';
//const TYPES={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.md':'text/plain; charset=utf-8'};
const cache=new Map();
async function get(u,ms=25000,enc){if(cache.has(u))return cache.get(u);
 try{return await get1(u,ms,enc)}catch(err){console.error('BRGM http :',u.slice(0,90),String(err));return await get1(u.replace(/^http:/,'https:'),ms,enc,'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36')}}
async function get1(u,ms,enc,ua){const ac=new AbortController();const t=setTimeout(()=>ac.abort(),ms);
 try{const r=await fetch(u,{signal:ac.signal,headers:{'user-agent':ua||'AGRESOL/1.4 (G.M.E.P)'}});if(!r.ok)throw new Error('HTTP '+r.status);const buf=await r.arrayBuffer();const s=new TextDecoder(enc||'utf-8').decode(buf);if(/Request Rejected/.test(s.slice(0,300)))throw new Error('requête refusée par le pare-feu BRGM');cache.set(u,s);if(cache.size>300)cache.delete(cache.keys().next().value);return s}finally{clearTimeout(t)}}
const dec=s=>s.replace(/&#39;/g,"'").replace(/&quot;/g,'"').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim();
async function bss(q){const x=+q.x,y=+q.y,r=Math.min(Math.max(+q.r||500,50),3000);if(!G.okL93(x,y))throw new Error('coordonnées Lambert 93 invalides');
 const t=await get(`${BRGM}?service=WFS&version=1.1.0&request=GetFeature&typename=BSS_TOTAL_SANS_LABEL&srsName=EPSG:2154&bbox=${x-r},${y-r},${x+r},${y+r},EPSG:2154&maxFeatures=300`);
 return G.normBss(G.parseMs(t),x,y).filter(o=>o.d<=r*1.42)}
async function log(q){const ref=String(q.ref||'');if(!/^[\w\/\-]+$/.test(ref))throw new Error('référence BSS invalide');
 const h=await get(`http://ficheinfoterre.brgm.fr/InfoterreFiche/ficheBss.action?id=${encodeURIComponent(ref)}`,25000,'latin1');
 const zs=h.match(/Altitude\s*<\/h3>\s*<span>\s*([\d.,-]+)\s*m/i);
 const tb=h.match(/<table class="logPasses">([\s\S]*?)<\/table>/);const layers=[];
 if(tb){for(const tr of tb[1].split(/<tr>/).slice(1)){const td=[...tr.matchAll(/<td[^>]*>([\s\S]*?)(?=<td|<\/tr>)/g)].map(m=>dec(m[1].replace(/<[^>]+>/g,' ')));
   if(td.length<2)continue;const m=td[0].match(/De\s+([\d,\.]+)\s+à\s+([\d,\.]+)/i);if(!m)continue;
   layers.push({top:parseFloat(m[1].replace(',','.')),bottom:parseFloat(m[2].replace(',','.')),litho:td[1]||'',strat:td[2]||''})}}
 const eau=h.match(/Niveau d'eau mesur. par rapport au sol[\s\S]*?([\d.,]+)\s*m\s*-\s*(\d{4}-\d{2}-\d{2})/i);
 return{ref,layers,zsol:zs?parseFloat(zs[1].replace(',','.')):null,eau:eau?{prof:parseFloat(eau[1].replace(',','.')),date:eau[2]}:null,fiche:`https://ficheinfoterre.brgm.fr/InfoterreFiche/ficheBss.action?id=${encodeURIComponent(ref)}`}}
async function carte(q){const x=+q.x,y=+q.y;if(!G.okL93(x,y))throw new Error('coordonnées Lambert 93 invalides');const w=G.l93ToWgs(x,y);
 const B=`${w.lon-0.01},${w.lat-0.01},${w.lon+0.01},${w.lat+0.01}`;
 const f=L=>get(`${BRGM}?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=${L}&QUERY_LAYERS=${L}&SRS=EPSG:4326&BBOX=${B}&WIDTH=101&HEIGHT=101&X=50&Y=50&INFO_FORMAT=application/vnd.ogc.gml&STYLES=`);
 const [a,b]=await Promise.all([f('SCAN_F_GEOL50_CATALOG'),f('LITHO_1M_SIMPLIFIEE')]);
 const g=(s,k)=>{const m=s.match(new RegExp(`<${k}>([^<]*)</${k}>`));return m?dec(m[1]):null};
 return{feuille:g(a,'numero'),nomFeuille:g(a,'nom'),litho1M:g(b,'DESCR')}}

module.exports={bss,log,carte};
