/* AGRESOL v1.6 – graphiques « acidité produite par les COHV » (application et rapport).
   Chaîne COHV → acide → tampon, courbe dose-réponse du pH, écart aux seuils de la norme.
   Couleurs fixes (palette du rapport G.M.E.P). Constats uniquement. */
(function(){
'use strict';
const E=window.AGRESOL;
const C={ink:'#1c2b45',mut:'#5b6577',grid:'#d9dde3',ok:'#2e9e5b',xa1:'#e3b23c',xa2:'#d9822b',xa3:'#a63d4a',site:'#1f6fb2',sol:'#7b4fa0',
  band:['#eef5e6','#fbefd2','#f9e1c8','#f3d3d6'],water:['#1c2b45','#2e9e5b','#c98b00']};
const XA=['Non agressif','XA1','XA2','XA3'],XAC=[C.ok,C.xa1,C.xa2,C.xa3];
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fr=(x,d)=>Number(x).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const sig=(x,p=2)=>x==null||!isFinite(x)?'—':(x===0?'0':Number(Number(x).toPrecision(p)).toLocaleString('fr-FR',{maximumFractionDigits:8}));
const conc=v=>v==null?'—':(v>=1000?sig(v/1000,v>=1e5?3:2)+' mg/L':sig(v,2)+' µg/L');
const fois=v=>v>=100?'× '+Number(Number(v).toPrecision(2)).toLocaleString('fr-FR'):'× '+sig(v,2);
const T=(x,y,s,o={})=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs||11}"${o.a?` text-anchor="${o.a}"`:''}${o.b?' font-weight="700"':''} fill="${o.c||C.ink}"${o.it?' font-style="italic"':''}>${s}</text>`;
const R=(x,y,w,h,f,o={})=>`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${h.toFixed(1)}" fill="${f}"${o.s?` stroke="${o.s}"`:''}${o.rx?` rx="${o.rx}"`:''}/>`;
const L=(x1,y1,x2,y2,c,o={})=>`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${o.w||1}"${o.d?` stroke-dasharray="${o.d}"`:''}/>`;
const svg=(w,h,body,lab)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Calibri,Carlito,Segoe UI,Arial,sans-serif" role="img" aria-label="${esc(lab)}">${body}</svg>`;
function clsPt(p){if(p.epuise)return 3;let c=0;const tp=E.XA_WATER.pH.t,tc=E.XA_WATER.co2.t;
  for(let i=0;i<3;i++){if(p.pH!=null&&p.pH<=tp[i])c=Math.max(c,i+1);if(p.co2!=null&&p.co2>=tc[i])c=Math.max(c,i+1)}return c}
const logTicks=(a,b,px)=>{let t=[];for(let e=Math.floor(Math.log10(a));e<=Math.ceil(Math.log10(b));e++)t.push(10**e);t=t.filter(v=>v>=a*0.999&&v<=b*1.001);
  if(px&&t.length>1&&px/(t.length-1)<52){const k=Math.ceil(52/(px/(t.length-1)));t=t.filter((v,i)=>i%k===0)}return t};
const tickLab=v=>v>=1000?fr(v/1000,0).replace(/\u202f|\s/g,' ')+' mg/L':fr(v,0)+' µg/L';

/* G1 – chaîne : COHV → dégradation → acide libéré → bicarbonates de la nappe, et jauges de consommation du tampon */
function chaine(it,d){const W=800,H=150+it.jauge.length*34+34;let b='';
  const w=d.w,mmolH=it.u.h*1000,mmolC=it.u.c*1000;
  const bx=176,box=(x,tt,l1,l2,l3,col)=>R(x,14,bx,92,'#fff',{s:col,rx:6})+R(x,14,bx,22,col,{rx:6})+R(x,30,bx,6,col)+T(x+bx/2,29,tt,{a:'middle',b:1,c:'#fff',fs:11.5})+T(x+bx/2,55,l1,{a:'middle',fs:11})+T(x+bx/2,73,l2,{a:'middle',fs:10.5,c:C.mut})+(l3?T(x+bx/2,91,l3,{a:'middle',fs:10.5,c:C.mut}):'');
  const arr=x=>`<path d="M${x} 60 l18 0 m-6 -6 l6 6 l-6 6" stroke="${C.mut}" stroke-width="1.6" fill="none"/>`;
  const comp=it.mix?Object.entries(d.site.frac).filter(([,f])=>f>0.005).map(([k,f])=>k+' '+fr(f*100,0)+' %'):[];
  b+=box(8,'1. COHV dissous','1 mg/L de '+esc(it.court),it.mix?esc(comp.slice(0,2).join(', ')):'masse molaire '+fr(E.SUBST[it.key].M,1)+' g/mol',it.mix&&comp.length>2?esc(comp.slice(2).join(', ')):'',C.site);
  b+=arr(190);
  b+=box(212,'2. Dégradation complète',it.mix?'chaque Cl → 1 HCl':esc(it.formule).replace(/ → /,' →'),it.mix?'chaque C → 1 CO₂':'(oxydation ou minéralisation)','',C.xa2);
  b+=arr(394);
  b+=box(416,'3. Acidité libérée',sig(mmolH,2)+' mmol/L de H⁺ (HCl)',sig(mmolC,2)+' mmol/L de CO₂','',C.xa3);
  b+=arr(598);
  b+=box(620,'4. Tampon de la nappe','TAC '+fr(w.tac,1)+' mmol/L','bicarbonates HCO₃⁻','consommés : '+sig(mmolH/w.tac*100,2)+' % / mg/L',C.ok);
  let y=132;b+=T(8,y,'Part du pouvoir tampon (TAC) consommée par l\'acide libéré, et pH de la nappe après dégradation',{b:1,fs:11.5});y+=12;
  const x0=118,bw=360;b+=T(x0+bw+8,y+2,'part du TAC',{fs:9.5,c:C.mut})+T(x0+bw+70,y+2,'pH',{fs:9.5,c:C.mut})+T(x0+bw+128,y+2,'CO₂ agressif',{fs:9.5,c:C.mut})+T(x0+bw+215,y+2,'classe (tableau 2)',{fs:9.5,c:C.mut});y+=4;
  for(const p of it.jauge){const pct=Math.min(100,p.pct),c=clsPt(p);
    b+=T(x0-8,y+15,(p.site?'Site ':'')+conc(p.C),{a:'end',fs:11,b:p.site,c:p.site?C.site:C.ink});
    b+=R(x0,y+3,bw,16,'#eef0f3',{rx:3})+R(x0,y+3,Math.max(pct>0?1.5:0,bw*pct/100),16,XAC[c],{rx:3});
    b+=T(x0+bw+8,y+15,(p.pct<0.01&&p.pct>0?'< 0,01':sig(p.pct,2))+' %',{fs:11});
    b+=T(x0+bw+70,y+15,p.epuise?'épuisé':fr(p.pH,2),{fs:11,b:1});
    b+=T(x0+bw+128,y+15,p.co2==null?'—':sig(p.co2,2)+' mg/L',{fs:11});
    b+=T(x0+bw+215,y+15,XA[c],{fs:11,b:1,c:c?XAC[c]:C.ok});y+=34}
  b+=T(8,y+8,'Hypothèse majorante : dégradation complète en HCl et CO₂, eau en système fermé (sans dissolution de la calcite de l\'encaissant). pH initial '+fr(d.w.pH,2)+', '+fr(d.T,0)+' °C.',{fs:9.5,c:C.mut,it:1});
  return svg(W,H,b,'Chaîne de production d\'acide par les COHV')}

/* G2 – courbe dose-réponse : pH de la nappe en fonction de la concentration (échelle log) */
function courbe(it,d){const W=760,H=380,ml=52,mr=30,mt=40,mb=58,pw=W-ml-mr,ph=H-mt-mb;let b='';
  const xmin=1,xmax=it.xmax;const X=v=>ml+pw*(Math.log10(v)-Math.log10(xmin))/(Math.log10(xmax)-Math.log10(xmin));
  const pHmax=Math.min(9.5,Math.ceil((Math.max(...it.courbes.map(c=>c.pts[0].pH0||7))+0.3)*2)/2),pHmin=3.5;
  const Y=v=>mt+ph*(pHmax-v)/(pHmax-pHmin);const tp=E.XA_WATER.pH.t;
  const bands=[[pHmax,tp[0],0],[tp[0],tp[1],1],[tp[1],tp[2],2],[tp[2],pHmin,3]];
  for(const [a,z,k] of bands){b+=R(ml,Y(a),pw,Y(z)-Y(a),C.band[k]);b+=T(ml+6,Y(a)+13,XA[k]+(k?' (pH ≤ '+fr(tp[k-1],1)+')':' (pH > 6,5)'),{fs:10,c:k?XAC[k]:C.ok,b:1})}
  for(let v=4;v<=pHmax;v+=1){b+=L(ml,Y(v),ml+pw,Y(v),C.grid,{d:'2 3'})+T(ml-6,Y(v)+4,fr(v,0),{a:'end',fs:10.5})}
  for(const t of logTicks(xmin,xmax)){b+=L(X(t),mt,X(t),mt+ph,C.grid,{d:'2 3'})+T(X(t),mt+ph+15,tickLab(t),{a:'middle',fs:10})}
  b+=`<rect x="${ml}" y="${mt}" width="${pw}" height="${ph}" fill="none" stroke="${C.mut}"/>`;
  b+=T(ml+pw/2,H-22,'Concentration en '+esc(it.mix?'COHV (somme, composition du site)':it.court)+' dissous dans la nappe (échelle logarithmique)',{a:'middle',fs:11});
  b+=`<text transform="translate(14 ${mt+ph/2}) rotate(-90)" text-anchor="middle" font-size="11" fill="${C.ink}">pH après dégradation</text>`;
  it.courbes.forEach((c,i)=>{const pts=c.pts.filter(p=>p.pH!=null);if(!pts.length)return;
    b+=`<polyline fill="none" stroke="${C.water[i]}" stroke-width="${i?1.8:2.6}"${i?' stroke-dasharray="6 3"':''} points="${pts.map(p=>X(p.C).toFixed(1)+','+Y(Math.max(pHmin,p.pH)).toFixed(1)).join(' ')}"/>`;
    const last=c.pts[c.pts.length-1];if(last.epuise){const lp=pts[pts.length-1];b+=`<circle cx="${X(lp.C).toFixed(1)}" cy="${Y(Math.max(pHmin,lp.pH)).toFixed(1)}" r="3.5" fill="${C.water[i]}"/>`}
    b+=L(ml+6+i*250,18,ml+30+i*250,18,C.water[i],{w:i?1.8:2.6,d:i?'6 3':null})+T(ml+34+i*250,22,esc(c.label),{fs:10})});
  const vline=(v,col,lab,up)=>{if(!(v>=xmin&&v<=xmax))return;b+=L(X(v),mt,X(v),mt+ph,col,{w:1.6,d:'5 3'});b+=T(X(v)+(X(v)>ml+pw-130?-4:4),mt+(up?14:ph-8),lab,{fs:10,b:1,c:col,a:X(v)>ml+pw-130?'end':'start'})};
  if(it.site>0)vline(it.site,C.site,'Site : '+conc(it.site),false);
  if(it.sol)vline(it.sol,C.sol,'Solubilité : '+conc(it.sol),true);
  b+=T(ml,H-6,'Bandes : critère pH seul (le CO₂ agressif est comparé à part). Un point marque l\'épuisement du tampon. Dégradation complète, système fermé (majorant).',{fs:9.5,c:C.mut,it:1});
  return svg(W,H,b,'pH de la nappe selon la concentration en '+it.court)}

/* G3 – barres : concentration du site comparée aux concentrations nécessaires pour atteindre XA1 */
function barres(it){const rows=[[it.site,'Concentration du site'+(it.siteEl?' ('+esc(it.siteEl)+')':''),C.site],
  [it.seuils.co2[0],'Seuil XA1 par le CO₂ agressif (15 mg/L)',C.xa1],[it.seuils.pH[0],'Seuil XA1 par le pH (6,5)',C.xa2]];
  if(it.sol)rows.push([it.sol,'Solubilité dans l\'eau',C.sol]);
  const W=800,H=40+rows.length*36+30,ml=250,pw=300;let b='';const vmax=Math.max(...rows.map(r=>r[0]||0))*1.5,vmin=Math.min(0.1,...rows.filter(r=>r[0]>0).map(r=>r[0]/3));
  const X=v=>ml+pw*(Math.log10(v)-Math.log10(vmin))/(Math.log10(vmax)-Math.log10(vmin));
  for(const t of logTicks(vmin,vmax,pw)){b+=L(X(t),26,X(t),26+rows.length*36,C.grid,{d:'2 3'})+T(X(t),20,t>=1000?fr(t/1000,0)+' mg/L':sig(t,1)+' µg/L',{a:'middle',fs:9.5,c:C.mut})}
  rows.forEach(([v,l,col],i)=>{const y=30+i*36;b+=T(ml-8,y+17,l,{a:'end',fs:11});
    if(v>0){b+=R(ml,y+4,X(v)-ml,18,col,{rx:2});b+=T(X(v)+6,y+17,conc(v)+(i&&it.site>0?'  (soit '+fois(v/it.site)+' la valeur du site)':''),{fs:11,b:1})}
    else b+=T(ml+6,y+17,i?'non atteint':'non détecté',{fs:11,c:C.mut})});
  b+=T(8,H-8,'Échelle logarithmique. Seuils calculés sur la chimie de la nappe du site, dégradation complète, système fermé (hypothèse majorante).',{fs:9.5,c:C.mut,it:1});
  return svg(W,H,b,'Écart entre la concentration du site et les seuils XA1')}

/* G4 – comparaison des composés : concentration du site et seuil XA1 (le plus bas des critères pH / CO₂ agressif) */
function comparaison(d){const keys=[...E.COHV_KEYS,E.COHV_MIX].filter(k=>d.items[k]);const W=760,H=60+keys.length*40+30,ml=190,pw=420;let b='';
  const vals=keys.flatMap(k=>[d.items[k].site,d.items[k].xa1]).filter(v=>v>0);const vmin=Math.min(0.1,...vals)/2,vmax=Math.max(...vals)*3;
  const X=v=>ml+pw*(Math.log10(v)-Math.log10(vmin))/(Math.log10(vmax)-Math.log10(vmin));
  for(const t of logTicks(vmin,vmax,pw)){b+=L(X(t),40,X(t),40+keys.length*40,C.grid,{d:'2 3'})+T(X(t),34,t>=1000?fr(t/1000,0)+' mg/L':sig(t,1)+' µg/L',{a:'middle',fs:9.5,c:C.mut})}
  b+=`<circle cx="${ml}" cy="14" r="5" fill="${C.site}"/>`+T(ml+9,18,'concentration du site',{fs:10.5})+`<rect x="${ml+150}" y="9" width="10" height="10" fill="${C.xa1}" transform="rotate(45 ${ml+155} 14)"/>`+T(ml+166,18,'concentration nécessaire pour atteindre XA1',{fs:10.5});
  keys.forEach((k,i)=>{const it=d.items[k],y=44+i*40+14;b+=T(ml-10,y+4,esc(it.mix?'Ensemble des COHV':it.court+' – '+it.label.replace(/\s*\(.*\)/,'')),{a:'end',fs:11,b:it.mix});
    if(it.site>0&&it.xa1){b+=L(X(it.site),y,X(it.xa1),y,C.mut,{w:2});b+=T((X(it.site)+X(it.xa1))/2,y-6,fois(it.xa1/it.site),{a:'middle',fs:10.5,b:1})}
    if(it.site>0)b+=`<circle cx="${X(it.site).toFixed(1)}" cy="${y}" r="5.5" fill="${C.site}"/>`;else b+=T(ml+4,y+4,'non détecté',{fs:10,c:C.mut});
    if(it.xa1)b+=`<rect x="${(X(it.xa1)-5).toFixed(1)}" y="${y-5}" width="10" height="10" fill="${C.xa1}" transform="rotate(45 ${X(it.xa1).toFixed(1)} ${y})"/>`+T(X(it.xa1)+10,y+4,conc(it.xa1)+' ('+it.xa1Par+')',{fs:10});
  });
  b+=T(8,H-8,'Valeurs au contact des ouvrages (eau interstitielle ou nappe), maximum sur les ouvrages. Seuils : dégradation complète, système fermé (hypothèse majorante).',{fs:9.5,c:C.mut,it:1});
  return svg(W,H,b,'Comparaison des COHV : site et seuils XA1')}

window.AGRESOL_ACID={chaine,courbe,barres,comparaison,conc,fois,clsPt,XA};
})();
