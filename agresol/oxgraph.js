/* AGRESOL v1.6 – graphique « gradient d'oxydant (O₂) et potentiel redox au droit d'un ouvrage » (application et rapport).
   Coupe de l'ouvrage avec halo calculé (O₂ dissous équivalent), profils O₂ et Eh selon la profondeur. Constats uniquement. */
(function(){
'use strict';
const E=window.AGRESOL;
const C={ink:'#1c2b45',mut:'#5b6577',grid:'#d9dde3',ox:'#2e9e5b',nat:'#1c2b45',eh:'#7b4fa0',wt:'#1f6fb2',beton:'#a7afb8',betonS:'#4b5563',
  zns:['#efe3c4','#ece6d3','#e6dcc9','#f1e7d0'],zs:'#d6e9f5',zone:{Oxique:'#e3f3e6',Suboxique:'#fbefd2',Réducteur:'#f3d3d6'}};
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const fr=(x,d)=>Number(x).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d});
const T=(x,y,s,o={})=>`<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-size="${o.fs||11}"${o.a?` text-anchor="${o.a}"`:''}${o.b?' font-weight="700"':''} fill="${o.c||C.ink}"${o.it?' font-style="italic"':''}${o.rot?` transform="rotate(${o.rot} ${x.toFixed(1)} ${y.toFixed(1)})"`:''}>${s}</text>`;
const R=(x,y,w,h,f,o={})=>`<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${Math.max(0,w).toFixed(1)}" height="${Math.max(0,h).toFixed(1)}" fill="${f}"${o.op!=null?` fill-opacity="${o.op.toFixed(3)}"`:''}${o.s?` stroke="${o.s}"`:''}${o.sw?` stroke-width="${o.sw}"`:''}/>`;
const L=(x1,y1,x2,y2,c,o={})=>`<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${c}" stroke-width="${o.w||1}"${o.d?` stroke-dasharray="${o.d}"`:''}/>`;
const svg=(w,h,body,lab)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="Calibri,Carlito,Segoe UI,Arial,sans-serif" role="img" aria-label="${esc(lab)}">${body}</svg>`;
let N=0;
const lam=v=>v>=1?fr(v,1)+' m':fr(v*100,0)+' cm';
/* coupe + profils : it = élément de E.oxydant(), O = résultat global, P = projet */
function coupe(it,O,P){const W=900,H=600,top=44,bot=520;
  const el=P.elements.find(e=>e.nom===it.el)||{};const zEnd=Math.max(...it.segs.map(s=>s.z2),el.zBase||0);
  const zMax=Math.ceil(zEnd+1);const Y=z=>top+z/zMax*(bot-top);const zwt=P.nappe.zwt;
  let b='';
  // ---------------- panneau 1 : coupe
  const x0=56,x1=470,rMax=O.opts.rMax;const pc=(x0+x1)/2-30;const half=it.cyl?16:24; // demi-largeur dessinée (exagérée)
  const pxm=(x1-x0-60)/2/ Math.max(rMax,0.5)*0.92; // px par m (distance à la paroi)
  P.layers.forEach((Ly,i)=>{const a=Math.min(Ly.top,zMax),c=Math.min(Ly.bottom,zMax);if(c<=a)return;
    const sa=Math.max(a,zwt),zsTop=Math.min(c,zwt);
    if(zsTop>a)b+=R(x0,Y(a),x1-x0,Y(zsTop)-Y(a),C.zns[i%C.zns.length]);
    if(c>sa)b+=R(x0,Y(sa),x1-x0,Y(c)-Y(sa),C.zs)});
  // halo calculé : dégradé horizontal par tranche (16 arrêts), opacité ∝ O₂ / O₂ saturation
  const uid='ox'+(++N);let defs='';
  it.segs.forEach((s,i)=>{let st='';for(let j=0;j<=16;j++){const x=rMax*j/16;const p=E.oxAt(s.q,x,it.r0,it.cyl);const op=Math.min(0.85,0.85*Math.pow(Math.max(0,p.C/O.Cs),0.8));st+=`<stop offset="${(j/16).toFixed(4)}" stop-color="${C.ox}" stop-opacity="${op.toFixed(3)}"/>`}
    defs+=`<linearGradient id="${uid}r${i}" x1="0" x2="1">${st}</linearGradient><linearGradient id="${uid}l${i}" x1="1" x2="0">${st}</linearGradient>`;
    const ya=Y(s.z1),yb=Y(s.z2),w=rMax*pxm;b+=R(pc+half,ya,w,yb-ya,`url(#${uid}r${i})`)+R(pc-half-w,ya,w,yb-ya,`url(#${uid}l${i})`)});
  b=`<defs>${defs}</defs>`+b;
  // nappe
  b+=L(x0,Y(zwt),x1,Y(zwt),C.wt,{w:1.8})+T(x1-6,Y(zwt)-6,'▽ nappe '+fr(zwt,1)+' m',{a:'end',fs:11,c:C.wt,b:1});
  // ouvrage
  const z1=Math.min(...it.segs.map(s=>s.z1)),z2=Math.max(...it.segs.map(s=>s.z2));
  b+=R(pc-half,Y(z1),2*half,Y(z2)-Y(z1),C.beton,{s:C.betonS,sw:1.2});
  b+=T(pc+4,(Y(z1)+Y(z2))/2,esc(it.el)+(it.cyl?' – Ø '+fr(it.r0*2,2)+' m':''),{a:'middle',fs:11,b:1,rot:-90});
  // couches : noms
  P.layers.forEach(Ly=>{if(Ly.top>=zMax)return;b+=T(x1-6,Y(Ly.top)+14,esc(Ly.nom),{a:'end',fs:10.5,b:1});if(Ly.top>0)b+=L(x0,Y(Ly.top),x1,Y(Ly.top),'#b8b2a0',{d:'3 3'})});
  // traitement par segment
  for(const s of it.segs)if(s.trait)b+=T(x1-6,Y(s.z1)+28,(s.via==='venting'?'venting':'sparging')+' · λ = '+lam(s.q.lam),{a:'end',fs:10,c:C.mut});
  b+=R(x0,Y(0),x1-x0,Y(zMax)-Y(0),'none',{s:C.mut});
  for(let d=0;d<=zMax;d+=zMax>12?2:1)b+=L(x0-4,Y(d),x0,Y(d),C.mut)+T(x0-7,Y(d)+4,fr(d,0),{a:'end',fs:10.5,c:C.mut});
  b+=T(16,(top+bot)/2,'Profondeur (m)',{a:'middle',fs:11,c:C.mut,rot:-90});
  // échelle de distance
  const ys=bot-12;b+=L(pc+half,ys,pc+half+1*pxm,ys,C.ink)+L(pc+half,ys-4,pc+half,ys+4,C.ink)+L(pc+half+pxm,ys-4,pc+half+pxm,ys+4,C.ink)+T(pc+half+pxm/2,ys-6,'1 m de la paroi',{a:'middle',fs:10});
  b+=T((x0+x1)/2,22,'Coupe au droit de l\'ouvrage – O₂ calculé autour du fût',{a:'middle',fs:12.5,b:1});
  // ---------------- panneau 2 : O₂
  const g0=528,g1=700;const cMax=Math.ceil(O.Cs+1);const X=c=>g0+c/cMax*(g1-g0);
  b+=T((g0+g1)/2,22,'O₂ dissous (mg/L)',{a:'middle',fs:12.5,b:1});
  for(let c=0;c<=cMax;c+=2)b+=L(X(c),Y(0),X(c),Y(zMax),C.grid,{d:'2 3'})+T(X(c),bot+15,fr(c,0),{a:'middle',fs:10.5,c:C.mut});
  b+=L(g0,Y(zwt),g1,Y(zwt),C.wt,{w:1.4});
  b+=L(X(O.Cs),Y(0),X(O.Cs),Y(zMax),'#a16207',{d:'5 3'})+T(X(O.Cs)-4,Y(zMax)-6,'saturation '+fr(O.Cs,1)+' mg/L',{fs:9.5,c:'#a16207',rot:-90});
  const poly=(f,col,d,w)=>{let pts=[];for(const s of it.segs){pts.push(`${X(f(s)).toFixed(1)},${Y(s.z1).toFixed(1)}`,`${X(f(s)).toFixed(1)},${Y(s.z2).toFixed(1)}`)}return `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"${d?` stroke-dasharray="${d}"`:''}/>`};
  b+=poly(s=>s.c0,C.ox,'',2.8)+poly(s=>s.c1,C.nat,'6 3',2)+poly(s=>s.q.Cb,'#9aa3ad','2 3',1.6);
  b+=R(g0,Y(0),g1-g0,Y(zMax)-Y(0),'none',{s:C.mut});
  // ---------------- panneau 3 : Eh
  const h0=730,h1=884;const eMin=-200,eMax=500;const XE=e=>h0+(e-eMin)/(eMax-eMin)*(h1-h0);
  b+=T((h0+h1)/2,22,'Potentiel redox Eh (mV)',{a:'middle',fs:12.5,b:1});
  b+=R(XE(eMin),Y(0),XE(-100)-XE(eMin),Y(zMax)-Y(0),C.zone.Réducteur)+R(XE(-100),Y(0),XE(100)-XE(-100),Y(zMax)-Y(0),C.zone.Suboxique)+R(XE(100),Y(0),XE(eMax)-XE(100),Y(zMax)-Y(0),C.zone.Oxique);
  b+=T((XE(eMin)+XE(-100))/2,Y(0)+12,'réd.',{a:'middle',fs:9.5,c:'#a63d4a'})+T((XE(-100)+XE(100))/2,Y(0)+12,'subox.',{a:'middle',fs:9.5,c:'#a16207'})+T((XE(100)+XE(eMax))/2,Y(0)+12,'oxique',{a:'middle',fs:9.5,c:C.ox});
  for(const e of [-200,0,200,400])b+=T(XE(e),bot+15,(e>0?'+':'')+e,{a:'middle',fs:10.5,c:C.mut});
  b+=L(h0,Y(zwt),h1,Y(zwt),C.wt,{w:1.4});
  const polyE=(f,col,d,w)=>{let pts=[];for(const s of it.segs){const v=Math.max(eMin,Math.min(eMax,f(s)));pts.push(`${XE(v).toFixed(1)},${Y(s.z1).toFixed(1)}`,`${XE(v).toFixed(1)},${Y(s.z2).toFixed(1)}`)}return `<polyline points="${pts.join(' ')}" fill="none" stroke="${col}" stroke-width="${w}"${d?` stroke-dasharray="${d}"`:''}/>`};
  b+=polyE(s=>s.eh0,C.ox,'',2.8)+polyE(s=>s.eh1,C.nat,'6 3',2)+polyE(s=>s.q.ehNat,'#9aa3ad','2 3',1.6);
  b+=R(h0,Y(0),h1-h0,Y(zMax)-Y(0),'none',{s:C.mut});
  // légende
  const ly=bot+40;
  b+=`<defs><linearGradient id="oxlg${N}" x1="0" x2="1"><stop offset="0" stop-color="${C.ox}" stop-opacity=".85"/><stop offset="1" stop-color="${C.ox}" stop-opacity="0"/></linearGradient></defs>`;
  b+=R(x0,ly-8,60,13,`url(#oxlg${N})`,{s:C.grid})+T(x0+66,ly+3,'O₂ : saturation → 0 (halo calculé)',{fs:10.5});
  b+=L(g0,ly-2,g0+24,ly-2,C.ox,{w:2.8})+T(g0+28,ly+2,'au contact',{fs:10.5})+L(g0+92,ly-2,g0+116,ly-2,C.nat,{w:2,d:'6 3'})+T(g0+120,ly+2,'à 1 m',{fs:10.5});
  b+=L(g0+164,ly-2,g0+188,ly-2,'#9aa3ad',{w:1.6,d:'2 3'})+T(g0+192,ly+2,'naturel (hors traitement)',{fs:10.5});
  b+=T(W/2,H-10,'Régime permanent : diffusion radiale avec consommation du 1er ordre, C(r) = Cb + (C0 − Cb)·K0(r/λ)/K0(r0/λ). Largeur de l\'ouvrage exagérée.',{a:'middle',fs:10,c:C.mut,it:1});
  return svg(W,H,b,'Gradient d\'oxydant et potentiel redox – '+it.el)}
window.AGRESOL_OX={coupe,lam};
})();
