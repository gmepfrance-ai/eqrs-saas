/* AGRESOL v1.6 – moteur de calcul (G.M.E.P)
   Agressivité des eaux souterraines et des gaz du sol vis-à-vis des fondations
   NF EN 206+A2/CN (tableau 2) / FD P18-011 – modèle 1D gaz du sol – équilibre calco-carbonique */
(function(root){
'use strict';
const E={};
// ---------------------------------------------------------------- utilitaires
function bisect(f,a,b,tol=1e-10,it=200){let fa=f(a),fb=f(b);if(!isFinite(fa)||!isFinite(fb))return NaN;if(fa*fb>0)return NaN;
  for(let i=0;i<it;i++){const m=0.5*(a+b),fm=f(m);if(!isFinite(fm))return NaN;if(Math.abs(b-a)<tol)return m;if(fa*fm<=0){b=m;fb=fm}else{a=m;fa=fm}}return 0.5*(a+b)}
E.bisect=bisect;
function erf(x){const t=1/(1+0.3275911*Math.abs(x));const y=1-(((((1.061405429*t-1.453152027)*t)+1.421413741)*t-0.284496736)*t+0.254829592)*t*Math.exp(-x*x);return x>=0?y:-y}
E.erfc=x=>1-erf(x);
E.erfcinv=y=>bisect(x=>E.erfc(x)-y,0,6);
// ---------------------------------------------------------------- bases de données
E.SUBST={
 TCE:{nom:'Trichloroéthylène (TCE)',M:131.39,nCl:3,nC:2,Da:7.9e-6,Dw:1.0e-9,H:0.42,S:1280},
 PCE:{nom:'Tétrachloroéthylène (PCE)',M:165.83,nCl:4,nC:2,Da:7.2e-6,Dw:8.2e-10,H:0.75,S:150,refS:'INERIS, fiche 127-18-4'},
 DCE:{nom:'cis-1,2-Dichloroéthylène',M:96.94,nCl:2,nC:2,Da:9.0e-6,Dw:1.1e-9,H:0.38,S:6400},
 CV:{nom:'Chlorure de vinyle',M:62.5,nCl:1,nC:2,Da:1.1e-5,Dw:1.2e-9,H:1.11,S:2760},
 H2S:{nom:'Sulfure d\'hydrogène (H₂S)',M:34.08,nCl:0,nC:0,nS:1,Da:1.76e-5,Dw:1.4e-9,H:0.40,S:3980,soufre:true}
};
// NF EN 206+A2/CN tableau 2 (eaux) – bornes basses XA1, XA2, XA3
E.XA_WATER={
 so4:{lab:'SO₄²⁻ (mg/L)',dir:+1,t:[200,600,3000]},
 co2:{lab:'CO₂ agressif (mg/L)',dir:+1,t:[15,40,100]},
 mg:{lab:'Mg²⁺ (mg/L)',dir:+1,t:[300,1000,3000]},
 nh4:{lab:'NH₄⁺ (mg/L)',dir:+1,t:[15,30,60]},
 pH:{lab:'pH',dir:-1,t:[6.5,5.5,4.5]}
};
E.XA_SOIL={so4s:{lab:'SO₄²⁻ total sol (mg/kg)',dir:+1,t:[2000,3000,12000]},bg:{lab:'Acidité Baumann-Gully (mL/kg)',dir:+1,t:[200,Infinity,Infinity]}};
E.CLASSES=['< XA1','XA1','XA2','XA3'];
/* ---------------------------------------------------------------- sols acides (sulfures) : bilan acide-base
   PSA = 623,7 × S réduit (%S) mol H+/t (FeS2 + 15/4 O2 + 7/2 H2O → Fe(OH)3 + 2 SO4²⁻ + 4 H+ : 2 H+ par S)
   ANC = 199,8 × CaCO3 (%) mol H+/t ; acidité nette = PSA + TAA − ANC/FF
   SO4 total potentiel = SO4 mesuré + 29 963 × S réduit (%S) × part oxydée (mg/kg) ; classement sur les critères « sol » du tableau 2 */
E.ACID_DEF={actif:true,fOx:100,rho:1.6,ff:1.5,ancOn:true,seuilNet:18,fBio:100,delta:0.10,ancBeton:8000};
E.acidLayer=function(L,A,zSat){A=Object.assign({},E.ACID_DEF,A||{});
 const num=v=>v==null||v===''||isNaN(v)?null:Number(v);
 const Scr=num(L.scr),caco3=num(L.caco3),taa=num(L.taa)||0,pHs=num(L.pHsol),so4s=num(L.so4s)||0;
 if(Scr==null&&pHs==null)return null;
 const S=Scr||0,PSA=623.7*S,ANC=caco3!=null?199.8*caco3:0;
 const net=PSA+taa-(A.ancOn?ANC/A.ff:0);
 const so4Pot=so4s+S*29963*A.fOx/100; // mg/kg
 const bgEq=Math.max(net,0)*10; // équivalent Baumann-Gully indicatif : 1 mol H+/t ≈ 10 mL/kg de NaOH 0,1 N
 const cSo4=clsOf(so4Pot,E.XA_SOIL.so4s),cAc=clsOf(bgEq,E.XA_SOIL.bg);
 let statut='Non acidifiant';if(pHs!=null&&pHs<4)statut='Sol sulfaté acide actif (pH < 4)';else if(net>=A.seuilNet)statut='Potentiellement acidifiant (acidité nette ≥ '+A.seuilNet+' mol H⁺/t)';else if(pHs!=null&&pHs<5.5)statut='Sol acide (pH < 5,5)';
 return{nom:L.nom,Scr:S,PSA,ANC,taa,net,so4Pot,bgEq,pHs,cSo4,cAc,c:Math.max(cSo4,cAc),statut,oxydable:!!L.oxydable}};
function clsOf(v,def){if(v==null||isNaN(v))return 0;let c=0;for(let i=0;i<3;i++){const t=def.t[i];if(def.dir>0? v>=t : v<=t)c=i+1}return c}
E.clsOf=clsOf;
const nf0=x=>Math.round(x).toLocaleString('fr-FR');
// NA.F.1 (bétons coulés en place) – valeurs limites
// ---------------------------------------------------------------- calco-carbonique
function K(T){const Tk=T+273.15,l=Math.log10;
 return{K1:10**(-356.3094-0.06091964*Tk+21834.37/Tk+126.8339*l(Tk)-1684915/Tk**2),
  K2:10**(-107.8871-0.03252849*Tk+5151.79/Tk+38.92561*l(Tk)-563713.9/Tk**2),
  Kc:10**(-171.9065-0.077993*Tk+2839.319/Tk+71.595*l(Tk)),
  Kw:10**(-4470.99/Tk+6.0875-0.01706*Tk),Kg:10**-4.58}}
function davies(z2,I){const A=0.5085;return 10**(-A*z2*(Math.sqrt(I)/(1+Math.sqrt(I))-0.3*I))}
// concentrations en mmol/L
function speciate(c,Alk,CT,T){
 const k=K(T);const cat=2*c.Ca+2*c.Mg,an=Alk+2*c.SO4+c.Cl+c.NO3;const Na=Math.max(an-cat,0);
 const I=0.5*(4*c.Ca+4*c.Mg+4*c.SO4+c.Cl+c.NO3+Math.max(Alk,0)+Na)/1000;const g1=davies(1,I),g2=davies(4,I);
 const sp=pH=>{const h=10**-pH;const r1=k.K1/h/g1,r2=k.K2/h*g1/g2;const H2=CT/(1+r1+r1*r2),HC=H2*r1,CO=HC*r2;return{H2,HC,CO,OH:k.Kw/h/g1*1000,Hc:h/g1*1000}};
 const pH=bisect(p=>{const s=sp(p);return s.HC+2*s.CO+s.OH-s.Hc-Alk},2,13);
 if(isNaN(pH))return null;const s=sp(pH);
 const kp=10**2.30*g2*g2/1000;const a=kp,b=-(kp*(c.Ca+c.SO4)+1),cc=kp*c.Ca*c.SO4;const pair=(-b-Math.sqrt(b*b-4*a*cc))/(2*a);
 const Caf=c.Ca-pair,SO4f=c.SO4-pair;
 return{pH,CO2:s.H2,HCO3:s.HC,CO3:s.CO,SIc:Math.log10((Caf*g2/1000)*(s.CO*g2/1000)/k.Kc),SIg:Math.log10((Caf*g2/1000)*(SO4f*g2/1000)/k.Kg),I}}
E.speciate=speciate;
E.chemFromMg=w=>({Ca:w.ca/40.078,Mg:w.mg/24.305,SO4:w.so4/96.06,Cl:w.cl/35.45,NO3:w.no3/62.0,Alk:w.tac});
function ctFromPH(c,pH,T){return bisect(CT=>{const s=speciate(c,c.Alk,CT,T);return s?s.pH-pH:NaN},c.Alk*0.5,c.Alk*30)}
// essai au marbre simulé : xi (mmol/L) calcite dissoute (>0) ou précipitée (<0)
function marble(c,Alk,CT,T){const lo=Math.max(-c.Ca*0.95,(0.2-Alk)/2+1e-6,-CT*0.95);
 const xi=bisect(x=>{const s=speciate({...c,Ca:c.Ca+x},Alk+2*x,CT+x,T);return s?s.SIc:NaN},lo,80);return xi}
E.marble=marble;
/* Modification de la chimie : H (mmol/L d'acide fort), y (mmol/L de CO₂), dSO4 (mmol/L), open = équilibre avec la calcite de l'encaissant */
E.modifyWater=function(w,T,mod,open){
 const c=E.chemFromMg(w);const CT0=ctFromPH(c,w.pH,T);
 const base=speciate(c,c.Alk,CT0,T);
 const res={CT0,SIc0:base?base.SIc:NaN,SIg0:base?base.SIg:NaN,CO2libre0:base?base.CO2*44.01:NaN};
 const c2={...c,Cl:c.Cl+(mod.H||0),SO4:c.SO4+(mod.dSO4||0)};
 const Alk=c.Alk-(mod.H||0)+(mod.HCO3||0),CT=CT0+(mod.y||0);
 const xi0=marble(c,c.Alk,CT0,T);
 if(open){
   // référence et état modifié à l'équilibre avec la calcite
   const eq=(cc,A,C)=>{const lo=Math.max(-cc.Ca*0.95,(0.2-A)/2+1e-6);const x=bisect(x=>{const s=speciate({...cc,Ca:cc.Ca+x},A+2*x,C+x,T);return s?s.SIc:NaN},lo,120);
     const s=speciate({...cc,Ca:cc.Ca+x},A+2*x,C+x,T);return{x,pH:s?s.pH:NaN,Ca:(cc.Ca+x)*40.078}};
   const r0=eq(c,c.Alk,CT0),r1=eq(c2,Alk,CT);
   Object.assign(res,{mode:'ouvert',pH0:r0.pH,pH1:r1.pH,dpH:r1.pH-r0.pH,co2agr0:0,co2agr1:0,Ca1:r1.Ca,xi:r1.x});
 }else{
   if(Alk<=0.05){Object.assign(res,{mode:'fermé',pH0:base.pH,pH1:3.5,dpH:3.5-base.pH,co2agr0:Math.max(xi0*44.01,0),co2agr1:Infinity,Ca1:w.ca,tamponEpuise:true});return res}
   const s1=speciate(c2,Alk,CT,T);const xi1=marble(c2,Alk,CT,T);
   Object.assign(res,{mode:'fermé',pH0:base.pH,pH1:s1?s1.pH:NaN,dpH:(s1?s1.pH:NaN)-base.pH,co2agr0:Math.max(xi0*44.01,0),co2agr1:Math.max(xi1*44.01,0),Ca1:w.ca,xi:xi1});
 }
 // plafond gypse
 const sg=bisect(s=>{const sp=speciate({...c,SO4:s,Ca:c.Ca+(s-c.SO4)},c.Alk,CT0,T);return sp?sp.SIg:NaN},c.SO4,60);
 res.so4GypseSat=isNaN(sg)?null:sg*96.06;
 return res};
// ---------------------------------------------------------------- transferts gazeux 1D
E.deff=(s,n,ta,tw)=>s.Da*Math.pow(ta,10/3)/(n*n)+(s.Dw/s.H)*Math.pow(tw,10/3)/(n*n);
function layerAt(layers,z){for(const L of layers)if(z>=L.top-1e-9&&z<L.bottom-1e-9)return L;return layers[layers.length-1]}
E.layerAt=layerAt;
function thomas(a,b,c,d){const n=d.length,cp=new Float64Array(n),dp=new Float64Array(n),x=new Float64Array(n);
 cp[0]=c[0]/b[0];dp[0]=d[0]/b[0];for(let i=1;i<n;i++){const m=b[i]-a[i]*cp[i-1];cp[i]=c[i]/m;dp[i]=(d[i]-a[i]*dp[i-1])/m}
 x[n-1]=dp[n-1];for(let i=n-2;i>=0;i--)x[i]=dp[i]-cp[i]*x[i+1];return x}
/* Profil stationnaire 0 → zwt. Source fixée [s1,s2], surface : -D dC/dz = h C ; base : -D dC/dz = hb (C - Cb) */
function solveProfile(z,D,Csrc,s1,s2,hTop,hb,Cb){const N=z.length,dz=z[1]-z[0];const a=new Float64Array(N),b=new Float64Array(N),c=new Float64Array(N),d=new Float64Array(N);
 for(let i=0;i<N;i++){
  if(z[i]>=s1-1e-9&&z[i]<=s2+1e-9){b[i]=1;d[i]=Csrc;continue}
  if(i===0){const Dp=0.5*(D[0]+D[1]);b[0]=Dp/dz+hTop;c[0]=-Dp/dz;continue}
  if(i===N-1){const Dm=0.5*(D[i]+D[i-1]);b[i]=Dm/dz+hb;a[i]=-Dm/dz;d[i]=hb*Cb;continue}
  const Dm=0.5*(D[i]+D[i-1]),Dp=0.5*(D[i]+D[i+1]);a[i]=-Dm;b[i]=Dm+Dp;c[i]=-Dp}
 return thomas(a,b,c,d)}
E.gasProfile=function(P,pt,subKey){
 const s=P.substances[subKey]||E.SUBST[subKey];const zwt=P.nappe.zwt;const dz=0.05;const N=Math.max(Math.round(zwt/dz)+1,5);
 const z=Float64Array.from({length:N},(_,i)=>i*zwt/(N-1));
 const D=Float64Array.from(z,zz=>{const L=layerAt(P.layers,zz);return E.deff(s,L.n,L.ta,L.tw)});
 let hTop;
 if(pt.sousBatiment&&P.dalle.hImpose>0){hTop=P.dalle.hImpose}else if(pt.sousBatiment){const Dc=P.dalle.Dbeton,eta=P.dalle.eta;const e=Math.max(P.dalle.e,0.01);hTop=((1-eta)*Dc+eta*s.Da)/e}
 else hTop=D[0]/0.30;
 const cwN=(P.nappe.cohv&&P.nappe.cohv[subKey])||0; // µg/L
 const Cb=cwN*s.H*1000; const hb=cwN>0?P.nappe.hCap:0;
 const meas=pt.mesures[subKey];
 const s1=pt.src1,s2=Math.min(pt.src2,zwt);
 const u=solveProfile(z,D,1,s1,s2,hTop,0,0);const v=solveProfile(z,D,0,s1,s2,hTop,hb,Cb);
 const interp=(arr,zz)=>{if(zz<=z[0])return arr[0];if(zz>=z[N-1])return arr[N-1];const i=Math.floor(zz/(z[1]-z[0]));const t=(zz-z[i])/(z[1]-z[0]);return arr[i]*(1-t)+arr[Math.min(i+1,N-1)]*t};
 // calage sur la moyenne de l'intervalle de mesure
 const avg=(arr)=>{let sm=0,k=0;for(let i=0;i<N;i++)if(z[i]>=pt.zm1-1e-9&&z[i]<=pt.zm2+1e-9){sm+=arr[i];k++}return k?sm/k:interp(arr,0.5*(pt.zm1+pt.zm2))};
 let Csrc=0;if(meas!=null&&meas>0){const uu=avg(u),vv=avg(v);Csrc=Math.max((meas-vv)/uu,0)}
 const C=Float64Array.from(u,(x,i)=>Csrc*x+v[i]);
 return{z,C,Csrc,hTop,D,at:zz=>interp(C,zz),s}};
// ---------------------------------------------------------------- analyse d'un élément de fondation
E.ELEM_TYPES={pieu:'Pieu',micropieu:'Micropieu',inclusion:'Inclusion rigide',plot:'Plot (massif)',longrine:'Longrine'};
E.isPile=t=>t==='pieu'||t==='micropieu'||t==='inclusion';
E.contact=function(el){ // intervalle de profondeur au contact du terrain + épaisseur de béton protégeant le cœur
 const zB=Math.max(el.zBase,el.zTop+0.05);
 switch(el.type){
  case 'pieu':case 'micropieu':case 'inclusion':return{z1:el.zTop,z2:zB,epaisseur:el.dim,faces:'périphérie + pointe'};
  case 'plot':return{z1:el.zTop,z2:zB,epaisseur:Math.min(el.largeur||1,zB-el.zTop),faces:'faces latérales + sous-face'};
  default:return{z1:el.zTop,z2:zB,epaisseur:el.largeur||0.4,faces:'3 faces (côtés + sous-face)'}}};
// ---------------------------------------------------------------- reprise des projets antérieurs (v1.0 à v1.3)
E.migrate=function(P){const msg=[];
 if(P.substances&&P.substances.PCE&&P.substances.PCE.S===206){P.substances.PCE.S=150;msg.push('PCE : solubilité portée à 150 mg/L (INERIS)')}
 P.elements=(P.elements||[]).flatMap(el=>{el=Object.assign({},el);
  if(el.zoneTraitement==null)el.zoneTraitement=!!el.zoneSparging;delete el.zoneSparging;
  if(el.type==='barrette'){el.type='pieu';msg.push(el.nom+' : barrette reprise comme pieu')}
  if(el.type==='radier'||el.type==='semelle'){el.type='plot';el.zBase=el.zTop+(el.ep||0.4);msg.push(el.nom+' : repris comme plot')}
  if(el.type==='longrine'&&(el.zBase==null||el.zBase<=el.zTop))el.zBase=el.zTop+(el.ep||0.6);
  if(el.type==='longrine'&&el.ep&&Math.abs((el.zBase-el.zTop)-el.ep)>1e-6&&el._v14==null)el.zBase=el.zTop+el.ep;
  if(el.type==='dallage'||el.type==='voile'){msg.push(el.nom+' : '+el.type+' retiré (ouvrage hors liste)');return[]}
  el._v14=1;return[el]});
 const t=P.traitement||{};
 if(!t.sparging||typeof t.sparging!=='object'){const old=t;P.traitement={mode:old.mode||(old.sparging===true?'vs':(old.sparging===false?'aucun':'aucun')),
   venting:{fOx:100,rendement:90},
   sparging:{pyrite:old.pyrite??10,fOx:old.fOx??100,dilution:old.dilution??10,foc:old.foc??0.006,fMO:old.fMO??0.1,n:old.n??0.35,rho:old.rho??1.7},
   isco:Object.assign({},E.ISCO_DEF,old.isco||{})}}
 else P.traitement.isco=Object.assign({},E.ISCO_DEF,P.traitement.isco||{});
 P.traitement.venting=Object.assign({fOx:100,rendement:90},P.traitement.venting||{});
 P.projet=Object.assign({x:null,y:null,z:null},P.projet||{});
 P.rapport=Object.assign({},E.RAPPORT_DEF,P.rapport||{});if(!P.rapport.etabli&&P.projet.auteur)P.rapport.etabli=String(P.projet.auteur).replace(/^G\.M\.E\.P\s*[–-]\s*/,'');
 P.geolLocale=Object.assign({source:'',layers:[],rayon:500,zsol:null},P.geolLocale||{});
 P.piezos=P.piezos||[];
 P.analyses=P.analyses||{eau:null,cohv:null};
 P.nappe.incertAuto=P.nappe.incertAuto!==false;
 P.oxydant=Object.assign({},E.OX_DEF,P.oxydant||{});
 for(const L of P.layers||[])for(const q of ['o2Nat','o2Trait','ehNat','ehTrait','kO2','dInd'])if(L[q]===undefined)L[q]=null;
 return msg};
E.RAPPORT_DEF={indice:'V1',objet:'Rapport – agressivité des eaux souterraines et des gaz du sol sur les fondations',moa:'',moe:'',amo:'',bet:'G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l\'École',etabli:'',fonction:'Ingénieur SSP et Hydrologie',contact:'',prestations:'NF X31-620-2 : A210 (eaux souterraines), A270 (interprétation des résultats) ; NF EN 206+A2/CN et FD P18-011 (agressivité chimique)',campagne:'',titreCourt:'',pied:'',question:''};
E.ISCO_DEF={actif:false,zone:'zns_zs',dose:5,fCons:100,activation:'alcaline',ratioBase:2,dilution:5,rho:1.7,n:0.35};
E.ISCO_ACT={alcaline:'Alcaline (NaOH)',fer:'Fer chélaté (Fe²⁺)',peroxyde:'Peroxyde (H₂O₂)',thermique:'Thermique'};
E.analyse=function(P){
 const T=P.nappe.T,zwt=P.nappe.zwt,w=P.nappe.chimie,u=P.nappe.incert/100;
 const subs=Object.keys(P.substances).filter(k=>P.substances[k].actif);
 const profiles={};
 for(const pt of P.points){profiles[pt.id]={};for(const k of subs)profiles[pt.id][k]=E.gasProfile(P,pt,k)}
 const out=[];
 for(const el of P.elements){
  const ct=E.contact(el);const pt=P.points.find(p=>p.id===el.point)||P.points[0];
  const r={el,ct,pt:pt?pt.id:null,subs:{},flags:[]};
  const zMaxUnsat=Math.min(ct.z2,zwt);r.unsat=ct.z1<zwt; r.sat=ct.z2>zwt;
  r.hSat=Math.max(ct.z2-Math.max(ct.z1,zwt),0);r.hUnsat=Math.max(Math.min(ct.z2,zwt)-ct.z1,0);
  {const isP=E.isPile(el.type),isPl=el.type==='plot';const hTot=Math.max(ct.z2-ct.z1,0);const Lg=el.largeur||0.4,Lo=el.longueur||Lg;
   let Sc,unit,vol;if(isP){Sc=Math.PI*el.dim*hTot+Math.PI*el.dim*el.dim/4;unit='m²';vol=Math.PI*el.dim*el.dim/4*hTot}
   else if(isPl){Sc=2*(Lg+Lo)*hTot+Lg*Lo;unit='m²';vol=Lg*Lo*hTot}else{Sc=2*hTot+Lg;unit='m²/ml';vol=hTot*Lg}
   r.geom={hTot,Sc,unit,vol,volUnit:isP||isPl?'m³':'m³/ml'};}
  if(P.nappe.battement>0&&!r.sat&&ct.z2>zwt-P.nappe.battement){r.sat=true;r.flags.push('Élément dans la zone de battement de la nappe : classé avec les eaux souterraines')}
  const TR=P.traitement,inZone=!!el.zoneTraitement;
  const spOn=(TR.mode==='sparging'||TR.mode==='vs')&&inZone,vtOn=(TR.mode==='venting'||TR.mode==='vs')&&inZone;
  const IS=Object.assign({},E.ISCO_DEF,TR.isco||{});const iscoOn=IS.actif&&inZone;
  r.trait={sparging:spOn,venting:vtOn,isco:iscoOn};
  // gaz et eau interstitielle au contact
  let Hacid=0,CO2=0;
  for(const k of subs){const s=P.substances[k];const pr=pt?profiles[pt.id][k]:null;
    let cgMax=0;if(pr&&r.unsat){for(let zz=ct.z1;zz<=Math.max(zMaxUnsat,ct.z1)+1e-9;zz+=0.05)cgMax=Math.max(cgMax,pr.at(Math.min(zz,zwt)))}
    const cwPore=cgMax/s.H/1000;
    const cgWt=pr?pr.at(zwt):0;const cwSatEq=cgWt/s.H/1000;const cwMeas=(P.nappe.cohv&&P.nappe.cohv[k])||0;
    let cwSat=r.sat?Math.max(cwSatEq,cwMeas):0;
    if(P.scenario.dnapl&&r.sat)cwSat=s.S*1000;
    const cwContact=Math.max(cwPore,cwSat); // µg/L
    const mmol=cwContact/1000/s.M*P.scenario.fDeg/100;
    Hacid+=s.nCl*mmol; if(spOn||iscoOn)CO2+=s.nC*mmol; // voie aérobie si air injecté
    // temps de percée et flux à travers l'épaisseur de béton
    const Deb=P.beton.DcohvBeton,R=P.beton.Rmortier,e=ct.epaisseur/2;
    const tlag=e*e*R/(6*Deb)/(365.25*86400);
    const cgContact=Math.max(cgMax,cwSat*s.H*1000);
    r.subs[k]={cgMax,cwPore,cwSat,cwContact,pctS:cwContact/(s.S*1000)*100,tlag,flux:Deb*cgContact/ct.epaisseur*86400*365.25};
    if(!s.soufre&&cwContact>0.01*s.S*1000)r.flags.push(`${k} : concentration au contact > 1 % de la solubilité (indice de phase pure) – étude spécifique FD P18-011`)}
  // traitement (sparging) : sulfures, matière organique
  let dSO4=0,Hpy=0,yMO=0,base=0;const SP=TR.sparging;const Lsat=SP.n/SP.rho;
  if(spOn&&r.sat){const py=SP.pyrite*SP.fOx/100;const dil=Math.max(SP.dilution,1);
    dSO4=py*2/119.98/Lsat/dil; Hpy=py*4/119.98/Lsat/dil; yMO=SP.foc*SP.fMO/100*1000/12.011*1000/Lsat/dil/1000;
    const s2=(w.s2||0)/32.06;dSO4+=s2;Hpy+=2*s2}
  // ISCO persulfate activé : S2O8²⁻ → 2 SO4²⁻ ; 2 H⁺ par mole consommée ; base apportée par l'activation alcaline
  r.isco=null;
  if(iscoOn){const nPS=IS.dose*1000/238.1;const fc=IS.fCons/100;const zs=IS.zone!=='zns',zn=IS.zone!=='zs';
    const iw={};if(r.sat&&zs){const dil=Math.max(IS.dilution,1);const perL=nPS/IS.n/dil; // mmol/L d'eau au contact
      iw.dSO4=2*perL*fc;iw.H=2*perL*fc;iw.base=IS.activation==='alcaline'?IS.ratioBase*perL:0;iw.Na=(2*perL+iw.base)*22.99;
      dSO4+=iw.dSO4;Hpy+=iw.H;base+=iw.base}
    if(r.unsat&&zn){iw.so4Sol=2*nPS*fc*96.06/IS.rho} // mg/kg
    r.isco=Object.assign({nPS},iw);
    r.flags.push(`ISCO persulfate (${(E.ISCO_ACT[IS.activation]||'').toLowerCase()}) : ${iw.dSO4!=null?`+${Math.round(iw.dSO4*96.06)} mg/L de sulfates dans l'eau au contact`:''}${iw.dSO4!=null&&iw.so4Sol!=null?' ; ':''}${iw.so4Sol!=null?`+${Math.round(iw.so4Sol)} mg/kg de sulfates dans le sol non saturé`:''}${iw.base?` ; base d'activation ${iw.base.toFixed(1)} mmol/L`:''}`)}
  const H=Hacid+Hpy,y=CO2+yMO;
  r.mod={Hacid,Hpy,H,CO2,yMO,y,base,dSO4mg:dSO4*96.06};
  // chimie de l'eau au contact
  const L=E.layerAt(P.layers,Math.min(Math.max(ct.z2,zwt+0.01),P.layers[P.layers.length-1].bottom-0.01));
  const open=!!L.calcaire;
  let wr=null;
  if(r.sat){
    const m=E.modifyWater(w,T,{H,y,dSO4,HCO3:base},open);
    let so4=w.so4+dSO4*96.06; if(m.so4GypseSat&&so4>m.so4GypseSat)so4=m.so4GypseSat;
    const pH=w.pH+(isFinite(m.dpH)?m.dpH:0);
    const co2=open? w.co2 : Math.max(w.co2,isFinite(m.co2agr1)?m.co2agr1:999);
    const nominal={so4,co2,mg:w.mg,nh4:w.nh4,pH};
    const env={so4:so4*(1+u),co2:co2*(1+u),mg:w.mg*(1+u),nh4:w.nh4*(1+u),pH:pH-P.nappe.incertPH};
    const cls={},clsEnv={};let cmax=0,cmaxEnv=0;
    for(const k in E.XA_WATER){cls[k]=clsOf(nominal[k],E.XA_WATER[k]);clsEnv[k]=clsOf(env[k],E.XA_WATER[k]);cmax=Math.max(cmax,cls[k]);cmaxEnv=Math.max(cmaxEnv,clsEnv[k])}
    // règle : 2 caractéristiques ou plus dans la même classe -> classe supérieure (NF EN 206, tableau 2, note)
    const cnt=Object.values(clsEnv).filter(c=>c===cmaxEnv&&c>0).length; let ruleUp=false; if(cnt>=2&&cmaxEnv<3){ruleUp=true}
    const margins={};for(const k in E.XA_WATER){const d=E.XA_WATER[k];margins[k]=d.dir>0? nominal[k]/d.t[0] : (nominal[k]-d.t[0])}
    wr={m,open,nominal,env,cls,clsEnv,cmax,cmaxEnv,ruleUp,margins,layer:L.nom};
  }
  r.water=wr;
  // sol (partie non saturée)
  let soil={cmax:0,detail:[]};
  if(r.unsat){for(const Ls of P.layers){if(Ls.bottom<=ct.z1||Ls.top>=Math.max(zMaxUnsat,ct.z1+1e-6))continue;
     const add=r.isco&&r.isco.so4Sol?r.isco.so4Sol:0;const connu=Ls.so4s!=null&&Ls.so4s!=='';const so4=(connu?Number(Ls.so4s):0)+add;
     const c1=connu||add?clsOf(so4,E.XA_SOIL.so4s):0,c2=clsOf(Ls.bg,E.XA_SOIL.bg);soil.detail.push({nom:Ls.nom,so4s:connu||add?so4:null,isco:add,bg:Ls.bg,c:Math.max(c1,c2),connu:connu||add>0});soil.cmax=Math.max(soil.cmax,c1,c2)}
   if(soil.detail.some(d=>!d.connu))r.flags.push('Sulfates totaux / acidité du sol non renseignés pour une couche au contact : classe « sol » indéterminée')}
  r.soil=soil;
  // sols acides : couches au contact (zones non saturée et saturée)
  const AC=Object.assign({},E.ACID_DEF,P.acide||{});const acid={detail:[],cmax:0};
  for(const Ls of P.layers){if(Ls.bottom<=ct.z1||Ls.top>=Math.max(ct.z2,ct.z1+1e-6))continue;
    const unsatL=Ls.top<zwt-1e-9;const ACv=vtOn&&unsatL?Object.assign({},AC,{fOx:TR.venting.fOx}):AC;
    const a=E.acidLayer(Ls,ACv,!unsatL);if(!a)continue;if(vtOn&&unsatL&&!a.oxydable){a.oxydable=true;a.parVenting=true}acid.detail.push(a);
    if(a.statut!=='Non acidifiant')r.flags.push(`${Ls.nom} : ${a.statut.toLowerCase()} – acidité nette ${nf0(a.net)} mol H⁺/t ; après oxydation : SO₄ total potentiel ${nf0(a.so4Pot)} mg/kg`);
    if(AC.actif&&a.oxydable)acid.cmax=Math.max(acid.cmax,a.c)}
  r.acid=acid;
  // H2S : corrosion biogène en zone non saturée (indicatif, hors tableau 2)
  if(vtOn&&r.unsat){const rd=TR.venting.rendement/100;r.ventResid={};for(const k of subs)r.ventResid[k]=r.subs[k].cgMax*(1-rd);
    r.flags.push(`Venting : couches non saturées au contact considérées comme aérées (oxydation des sulfures ${TR.venting.fOx} %) ; gaz résiduels après traitement (rendement ${TR.venting.rendement} %) : ${subs.map(k=>k+' '+nf0(r.ventResid[k])+' µg/m³').join(', ')} (le classement reste établi sur l'état initial)`)}
  r.h2s=null;
  if(r.subs.H2S&&r.unsat&&r.subs.H2S.cgMax>0){const cg=r.subs.H2S.cgMax;const Lc=E.layerAt(P.layers,Math.min(ct.z1+0.01,zwt-0.01));
    const D=E.deff(P.substances.H2S,Lc.n,Lc.ta,Lc.tw);const J=D*cg*1e-6/34.08/AC.delta*365.25*86400; // mol/m²/an
    const Hp=2*J*AC.fBio/100;const depth=Hp*P.beton.duree/AC.ancBeton*1000;
    r.h2s={cg,ppm:cg/1390,D,J,Hp,depth,gS:J*32.06};
    r.flags.push(`H₂S au contact : ${nf0(cg)} µg/m³ (${(cg/1390).toFixed(2)} ppm) – corrosion biogène possible si le béton est humide et aéré ; épaisseur neutralisable indicative ${depth.toFixed(1)} mm à ${P.beton.duree} ans (agression hors tableau 2 de la NF EN 206, environnement particulier au sens du FD P18-011)`)}
  // classe correspondante au sens de la norme (constat)
  let cw=wr?(P.options.enveloppe?wr.cmaxEnv:wr.cmax):0; if(wr&&wr.ruleUp&&P.options.regle2!==false)cw=Math.min(cw+1,3);
  r.classe=Math.max(cw,soil.cmax,acid.cmax);
  const pp=r.flags.some(f=>f.includes('phase pure'));if(pp&&r.classe<2)r.classe=2;
  // agression visée
  const ag=[];if(wr){for(const k in wr.clsEnv){const c=P.options.enveloppe?wr.clsEnv[k]:wr.cls[k];if(c>0&&c===cw)ag.push(E.XA_WATER[k].lab.split(' ')[0])}}
  if(soil.cmax>0&&soil.cmax>=cw)ag.push('sol');
  if(acid.cmax>0&&acid.cmax>=Math.max(cw,soil.cmax))ag.push('oxydation des sulfures du sol');
  if(r.h2s)ag.push('H₂S (hors tableau 2)');
  if(pp)ag.push('phase pure (étude spécifique)');if(r.isco&&(cw>0||soil.cmax>0))ag.push('sulfates ISCO');r.agression=ag;
  // vigilance
  if(wr){if(wr.margins.so4>=0.8&&wr.cls.so4===0)r.flags.push(`Sulfates à ${Math.round(wr.margins.so4*100)} % du seuil XA1`);
    if(wr.margins.pH<=0.3&&wr.cls.pH===0)r.flags.push('pH à moins de 0,3 unité du seuil XA1');
    if(w.cl>50)r.flags.push(`Chlorures ${w.cl} mg/L > 50 mg/L : valeur à porter à la connaissance des concepteurs (armatures)`)}
  // durabilité géométrique (indicatif) : diffusion des sulfates dans le béton, C(x,t)=Cs·erfc(x/2√(Dt))
  const tS=P.beton.duree*365.25*86400;const Dso4=P.beton.Dso4;const cov=el.enrobage;const half=ct.epaisseur*1000/2;
  const Cs=wr?(P.options.enveloppe?wr.env.so4:wr.nominal.so4):0; let xcrit=0;
  if(Cs>200){xcrit=2*Math.sqrt(Dso4*tS)*E.erfcinv(200/Cs)*1000}
  const Ccov=Cs>0?Cs*E.erfc((cov/1000)/(2*Math.sqrt(Dso4*tS))):0;
  r.durab={Cs,xcrit,Ccov,enrobage:cov,demi:half,etat:Cs<=200?'Pas de front ≥ 200 mg/L':(xcrit<cov?'Front ≥ 200 mg/L en deçà de l\'enrobage saisi':(xcrit<half?'Front ≥ 200 mg/L au-delà de l\'enrobage saisi':'Front au-delà de la demi-épaisseur saisie'))};
  if(Cs>200&&xcrit>=cov)r.flags.push(`Calcul indicatif : sulfates ≥ 200 mg/L à ${xcrit.toFixed(0)} mm de profondeur après ${P.beton.duree} ans, au-delà de l'enrobage saisi (${cov} mm)`);
  r.sens=[0.5,0.75,1,1.5,2].map(f=>{const ep=ct.epaisseur*f;const half2=ep*1000/2;const k0=subs[0];const s0=P.substances[k0];
    const tl=(ep/2)**2*P.beton.Rmortier/(6*P.beton.DcohvBeton)/(365.25*86400);
    const cg=r.subs[k0]?Math.max(r.subs[k0].cgMax,r.subs[k0].cwSat*s0.H*1000):0;
    return{f,ep,tlag:tl,flux:P.beton.DcohvBeton*cg/ep*86400*365.25,reserve:half2-Math.max(r.durab.xcrit,el.enrobage),ok:half2>Math.max(r.durab.xcrit,el.enrobage)}});
  out.push(r)}
 return{results:out,profiles,subs}};
// ---------------------------------------------------------------- exemple : Eaubonne
E.exemple=function(){return{
 analyses:{eau:{fichier:'BEFUND30_O-1775061_Vers_1.pdf',meta:{labo:'AL-West',echantillon:'448457',ouvrage:'PZ1',prelevement:'13.10.2026',classeLabo:'<XA1'},lq:{co2:true,nh4:true,s2:true},inc:{}},cohv:null},
 rapport:{indice:'V1',objet:'Rapport – agressivité des eaux souterraines et des gaz du sol sur les fondations ; seuils de suivi PZ2',moa:'Emeis — 12 rue Jean Jaurès, 92813 Puteaux Cedex\nContact : Pierre-Henri Gouin — Tél. 06 38 35 67 62',moe:'Beming — 3 avenue de la Baltique, 91140 Villebon-sur-Yvette\nContact : Guillaume Devireux — Tél. 06 68 08 75 22',amo:'Stelyce — 140 boulevard Haussmann, 75008 Paris\nContact : Laurent Gobert — Tél. 06 60 44 14 57',bet:'G.M.E.P — 9 rue de la Marne, 79400 Saint-Maixent-l\'École',etabli:'Eric Azulay',fonction:'Ingénieur SSP et Hydrologie',contact:'Tél. 06 07 73 72 33',prestations:'NF X31-620-2 : A210 (eaux souterraines), A270 (interprétation) en appui de A320/A330 ; NF EN 206+A2/CN et FD P18-011 (agressivité chimique)',campagne:'13/10/2026 — PZ1 : AL-West 448457 (agressivité) et 448456 (COHV) ; 13–16/10/2026 — gaz du sol Quad-Lab QL2026-0898-1 (C1 à C4)',titreCourt:'Agressivité eaux et gaz du sol – Future clinique, Eaubonne (95)',pied:'Rapport – analyses AL-West 448457 (PZ1) et Quad-Lab QL2026-0898-1',question:'Le classement < XA1 obtenu sur PZ1 peut-il être retenu pour les pieux et longrines au droit des piézairs C3 et C4 ?'},
 projet:{nom:'Future clinique SMR / hôpital de jour',site:'41 rue des Bussys, 95600 Eaubonne – parcelle AM 523',ref:'GMEP-2026-EAU-4676-AGR',auteur:'G.M.E.P – E. Azulay',date:'2026-10-23',x:647288,y:6875669,z:46.0,zSource:'RGE ALTI',parcelle:'AM 523',idu:'95203000AM0523',surface:6212,adresse:'41 Rue des Bussys 95600 Eaubonne',commune:'Eaubonne',insee:'95203'},
 layers:[
  {nom:'Remblais',top:0,bottom:0.8,n:0.35,ta:0.20,tw:0.15,calcaire:false,so4s:null,bg:null},
  {nom:'Marne calcaire',top:0.8,bottom:5.5,n:0.35,ta:0.25,tw:0.10,calcaire:true,so4s:null,bg:null},
  {nom:'Limons / Calcaire de Saint-Ouen (saturé)',top:5.5,bottom:15,n:0.35,ta:0,tw:0.35,calcaire:true,so4s:null,bg:null}],
 nappe:{zwt:5.5,battement:0,T:12,incert:10,incertPH:0.2,incertAuto:true,hCap:1.7e-10,
  chimie:{pH:7.1,co2:1.0,so4:190,mg:30,nh4:0.02,ca:230,tac:8.8,cl:78,no3:37},
  cohv:{TCE:0.25,PCE:2.1,DCE:0.25,CV:0,H2S:0}},
 substances:{TCE:{...E.SUBST.TCE,actif:true},PCE:{...E.SUBST.PCE,actif:true},DCE:{...E.SUBST.DCE,actif:false},CV:{...E.SUBST.CV,actif:false},H2S:{...E.SUBST.H2S,actif:false}},
 acide:{...E.ACID_DEF},
 dalle:{e:0.20,eta:2e-4,Dbeton:1e-8,hImpose:0},
 beton:{DcohvBeton:1e-8,Rmortier:23,Dso4:2e-12,duree:50,enrobageMin:50},
 points:[
  {id:'C4',sousBatiment:true,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:4927,PCE:119.1,DCE:10,CV:0,H2S:0}},
  {id:'C3',sousBatiment:false,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:15.9,PCE:0.5,DCE:0,CV:0,H2S:0}},
  {id:'C1',sousBatiment:true,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:228,PCE:7.1,DCE:0,CV:0,H2S:0}},
  {id:'C2',sousBatiment:true,zm1:1,zm2:2,src1:2,src2:3,mesures:{TCE:573,PCE:11.7,DCE:0,CV:0,H2S:0}}],
 elements:[
  {id:'E1',nom:'Pieu P-C4',type:'pieu',zTop:0.8,zBase:12,dim:0.60,largeur:0.6,enrobage:70,eL:0.55,point:'C4',zoneTraitement:true},
  {id:'E2',nom:'Longrine L-C4',type:'longrine',zTop:0.2,zBase:0.8,dim:0.4,largeur:0.40,enrobage:40,eL:0.60,point:'C4',zoneTraitement:false},
  {id:'E4',nom:'Pieu P-C3',type:'pieu',zTop:0.8,zBase:12,dim:0.60,largeur:0.6,enrobage:70,eL:0.55,point:'C3',zoneTraitement:false}],
 traitement:{mode:'vs',venting:{fOx:100,rendement:90},sparging:{pyrite:10,fOx:100,dilution:10,foc:0.006,fMO:0.1,n:0.35,rho:1.7},isco:{...E.ISCO_DEF}},
 piezos:[{id:'PZ1',x:null,y:null,zTete:null,zNappe:null,prof:null,date:'2026-10-13',ref:true}],
 geolLocale:{source:'',layers:[],rayon:500,zsol:null},
 scenario:{fDeg:100,dnapl:false},
 options:{enveloppe:true,regle2:true}
}};
// ---------------------------------------------------------------- exemple : sol pyriteux et H2S (données fictives de démonstration)
E.exempleAcide=function(){const b=E.exemple();b.analyses={eau:null,cohv:null};
 b.projet={nom:'Démonstration – sol pyriteux et H₂S (données fictives)',site:'Cas type : argiles noires à pyrite sous remblais organiques',ref:'DEMO-ACIDE',auteur:'G.M.E.P',date:'2026-10-26'};b.rapport=Object.assign({},E.RAPPORT_DEF,{etabli:'G.M.E.P',campagne:'Données fictives de démonstration',titreCourt:'Démonstration – sol pyriteux et H₂S',pied:'AGRESOL – cas de démonstration (données fictives)'});
 b.layers=[
  {nom:'Remblais organiques',top:0,bottom:1.2,n:0.40,ta:0.22,tw:0.18,calcaire:false,so4s:900,bg:null,pHsol:6.2,scr:0.05,caco3:0.2,taa:5,oxydable:true},
  {nom:'Argiles noires pyriteuses',top:1.2,bottom:4.0,n:0.45,ta:0.10,tw:0.33,calcaire:false,so4s:1500,bg:null,pHsol:5.8,scr:0.60,caco3:0.5,taa:12,oxydable:true},
  {nom:'Sables argileux (saturés)',top:4.0,bottom:14,n:0.35,ta:0,tw:0.35,calcaire:false,so4s:600,bg:null,pHsol:6.6,scr:0.12,caco3:1.0,taa:0,oxydable:false}];
 b.nappe={zwt:4.0,battement:0.8,T:12,incert:10,incertPH:0.2,hCap:1.7e-10,chimie:{pH:7.1,co2:6,so4:320,mg:25,nh4:1.2,ca:160,tac:4.5,cl:45,no3:2,s2:1.5},cohv:{TCE:0,PCE:0,DCE:0,CV:0,H2S:200}};
 for(const k of ['TCE','PCE','DCE','CV'])b.substances[k].actif=false;b.substances.H2S.actif=true;
 b.points=[{id:'PA1',sousBatiment:true,zm1:1,zm2:2,src1:1.5,src2:4,mesures:{TCE:0,PCE:0,DCE:0,CV:0,H2S:15000}},{id:'PA2',sousBatiment:false,zm1:1,zm2:2,src1:1.5,src2:4,mesures:{TCE:0,PCE:0,DCE:0,CV:0,H2S:800}}];
 b.elements=[
  {id:'E1',nom:'Pieu P1',type:'pieu',zTop:1.0,zBase:12,dim:0.60,largeur:0.6,enrobage:50,eL:0.55,point:'PA1',zoneTraitement:false},
  {id:'E2',nom:'Micropieu M1',type:'micropieu',zTop:1.0,zBase:9,dim:0.20,largeur:0.2,enrobage:30,eL:0.5,point:'PA1',zoneTraitement:false},
  {id:'E3',nom:'Longrine L1',type:'longrine',zTop:0.3,zBase:1.0,dim:0.4,largeur:0.40,enrobage:40,eL:0.6,point:'PA1',zoneTraitement:false},
  {id:'E4',nom:'Plot fosse ascenseur',type:'plot',zTop:1.6,zBase:2.6,dim:1.2,largeur:1.2,longueur:1.5,enrobage:50,eL:0.55,point:'PA1',zoneTraitement:false}];
 b.traitement.mode='aucun';b.piezos=[{id:'PZA',x:null,y:null,zTete:null,zNappe:null,prof:12,date:'',ref:true}];b.scenario.fDeg=0;return b};

/* ---------------------------------------------------------------- acidité produite par les COHV (graphiques pédagogiques)
   Dégradation complète (minéralisation) : chaque mole libère nCl moles de HCl et nC moles de CO₂ ; eau en système fermé
   (sans dissolution de la calcite de l'encaissant) : hypothèse majorante. Constats uniquement. */
E.COHV_KEYS=['PCE','TCE','DCE','CV'];
E.COHV_MIX='COHV';
let _eauxTypes=null;
E.eauxTypes=function(T){if(_eauxTypes&&_eauxTypes.T===T)return _eauxTypes.l;
  const mk=(tac,label)=>{const base={co2:0,so4:10,mg:2,nh4:0,ca:(tac/2+0.1)*40.078,tac,cl:7,no3:2};let lo=5.5,hi=9.8;
    for(let i=0;i<50;i++){const m=(lo+hi)/2;const r=E.modifyWater({...base,pH:m},T,{H:0,y:0},false);if(r.co2agr0>0.01)lo=m;else hi=m}
    return {label,tac,w:{...base,pH:+hi.toFixed(2)}}};
  _eauxTypes={T,l:[mk(3,'Eau type moyennement minéralisée (TAC 3 mmol/L)'),mk(1,'Eau type peu minéralisée (TAC 1 mmol/L)')]};return _eauxTypes.l};
E.cohvSite=function(P,A){// teneurs au contact (µg/L) : maximum par composé et composition de l'ouvrage le plus chargé
  const site={},el={};let best=null,bestTot=0;
  for(const r of (A&&A.results)||[]){let tot=0;for(const k of E.COHV_KEYS){const v=r.subs&&r.subs[k]?r.subs[k].cwContact||0:0;if(v>(site[k]||0)){site[k]=v;el[k]=r.el.nom}tot+=v}
    if(tot>bestTot){bestTot=tot;best=r}}
  for(const k of E.COHV_KEYS){const m=(P.nappe.cohv&&P.nappe.cohv[k])||0;if(!(site[k]>0)&&m>0){site[k]=m;el[k]='nappe'}}
  const frac={};let ft=0;
  if(best){for(const k of E.COHV_KEYS){frac[k]=best.subs[k]?best.subs[k].cwContact||0:0;ft+=frac[k]}}
  if(!(ft>0)){for(const k of E.COHV_KEYS){frac[k]=site[k]||0;ft+=frac[k]}}
  if(!(ft>0)){for(const k of E.COHV_KEYS){frac[k]=1;ft+=1}}
  for(const k in frac)frac[k]/=ft;
  return {site,el,frac,mixTot:bestTot,mixEl:best?best.el.nom:''}};
E.cohvUnit=function(key,frac){// mmol/L d'H⁺ et de CO₂ par µg/L de composé (ou de mélange)
  const one=k=>{const s=E.SUBST[k];return{h:s.nCl/s.M/1000,c:s.nC/s.M/1000}};
  if(key!==E.COHV_MIX)return one(key);let h=0,c=0;for(const k of E.COHV_KEYS){const u=one(k);h+=frac[k]*u.h;c+=frac[k]*u.c}return{h,c}};
E.acidPoint=function(w,T,u,C){const H=u.h*C,y=u.c*C;const r=E.modifyWater(w,T,{H,y},false);
  return{C,H,y,pct:w.tac>0?H/w.tac*100:Infinity,pH:r.tamponEpuise?null:r.pH1,co2:isFinite(r.co2agr1)?r.co2agr1:null,epuise:!!r.tamponEpuise,pH0:r.pH0}};
E.acidCurve=function(w,T,u,xmax,step){step=step||0.05;const out=[];for(let lg=0;lg<=Math.log10(xmax)+1e-9;lg+=step){const p=E.acidPoint(w,T,u,10**lg);out.push(p);if(p.epuise)break}return out};
E.acidSeuil=function(w,T,u,test,xmax){// plus petite concentration (µg/L) vérifiant test(point) ; null si non atteinte avant xmax
  let lo=0,hi=Math.log10(xmax);if(!test(E.acidPoint(w,T,u,10**hi)))return null;if(test(E.acidPoint(w,T,u,1)))return 1;
  for(let i=0;i<20;i++){const m=(lo+hi)/2;if(test(E.acidPoint(w,T,u,10**m)))hi=m;else lo=m}return 10**hi};
const _acidCache=new Map();
E.acidCohv=function(P,A,keys){const w=P.nappe.chimie,T=P.nappe.T;const S=E.cohvSite(P,A);keys=keys||[...E.COHV_KEYS,E.COHV_MIX];
  const types=E.eauxTypes(T);const out={T,w,site:S,types:types.map(t=>({label:t.label,tac:t.tac,pH:t.w.pH})),items:{}};
  const XW=E.XA_WATER;
  for(const key of keys){const mix=key===E.COHV_MIX;const u=E.cohvUnit(key,S.frac);
    const sol=mix?null:((P.substances&&P.substances[key]&&P.substances[key].S)||E.SUBST[key].S)*1000;const xmax=mix?1e6:Math.max(sol*2,1e4);
    const site=mix?S.mixTot:(S.site[key]||0);
    const ck=JSON.stringify([w,T,u,xmax]);let heavy=_acidCache.get(ck);
    if(!heavy){heavy={};heavy.seuils={pH:XW.pH.t.map(t=>E.acidSeuil(w,T,u,p=>p.epuise||(p.pH!=null&&p.pH<=t),xmax)),co2:XW.co2.t.map(t=>E.acidSeuil(w,T,u,p=>p.epuise||(p.co2==null||p.co2>=t),xmax))};
    heavy.courbes=[{label:'Nappe du site (TAC '+String(w.tac).replace('.',',')+' mmol/L)',pts:E.acidCurve(w,T,u,xmax)},...types.map(t=>({label:t.label,pts:E.acidCurve(t.w,T,u,xmax,0.1)}))];
      heavy.std=[1000,10000,100000].map(C=>E.acidPoint(w,T,u,C));if(_acidCache.size>40)_acidCache.clear();_acidCache.set(ck,heavy)}
    const seuils=heavy.seuils;const xa1=[seuils.pH[0],seuils.co2[0]].filter(v=>v!=null);
    out.items[key]={key,mix,label:mix?'Ensemble des COHV':E.SUBST[key].nom,court:mix?'COHV':key,u,sol,xmax,site,siteEl:mix?S.mixEl:S.el[key]||'',
      formule:mix?null:({PCE:'C₂Cl₄ + O₂ + 2 H₂O → 2 CO₂ + 4 HCl',TCE:'C₂HCl₃ + 3/2 O₂ + H₂O → 2 CO₂ + 3 HCl',DCE:'C₂H₂Cl₂ + 2 O₂ → 2 CO₂ + 2 HCl',CV:'C₂H₃Cl + 5/2 O₂ → 2 CO₂ + HCl + H₂O'})[key],
      seuils,xa1:xa1.length?Math.min(...xa1):null,xa1Par:xa1.length?(seuils.co2[0]!=null&&(seuils.pH[0]==null||seuils.co2[0]<seuils.pH[0])?'CO₂ agressif':'pH'):null,
      jauge:[...(site>0?[Object.assign(E.acidPoint(w,T,u,site),{site:true})]:[]),...heavy.std],
      courbes:heavy.courbes}}
  return out};

/* ---------------------------------------------------------------- gradient d'oxydant (O₂) et potentiel redox au contact des ouvrages (v1.6)
   Régime permanent, diffusion radiale avec consommation du premier ordre autour du fût (cylindre de rayon r0) :
     C(r) = Cb + (C0 − Cb) · K0(r/λ) / K0(r0/λ)     (face plane : exp(−x/λ))     λ = √(De / (θw·k))
   C en O₂ dissous équivalent (mg/L) ; De en unités « eau » : Da·θa^10/3/n²·H + Dw·θw^10/3/n² + D induite (traitement).
   C0 : valeur à l'interface sol/ouvrage (chemin préférentiel de l'air le long du fût sous traitement), Cb : valeur naturelle.
   Eh(r) = Eh naturel + (Eh traitement − Eh naturel) · (C − Cb)/(C0 − Cb). Constats uniquement. */
E.O2={Da:2.0e-5,Dw:2.1e-9,frac:0.2095,M:32};
E.o2Sat=T=>14.62-0.3898*T+0.006969*T*T-0.00005897*T*T*T; // mg/L, eau douce, 1 atm
E.o2H=T=>E.O2.frac*E.O2.M*1000/(0.082057*(273.15+T))/E.o2Sat(T); // Cg/Cw (–)
E.OX_DEF={rMax:1.5,pas:0.25};
E.EH_ZONES=[{min:100,nom:'Oxique',txt:'O₂ disponible : oxydation des sulfures et de la matière organique possible'},{min:-100,nom:'Suboxique',txt:'réduction des nitrates, du manganèse et du fer'},{min:-1e9,nom:'Réducteur',txt:'sulfato-réduction possible (production d\'H₂S)'}];
E.ehZone=eh=>E.EH_ZONES.find(z=>eh>=z.min);
function besselI0(x){const t=x/3.75,t2=t*t;return 1+t2*(3.5156229+t2*(3.0899424+t2*(1.2067492+t2*(0.2659732+t2*(0.0360768+t2*0.0045813)))))}
function lnK0(x){if(x<=2){const y=x*x/4;return Math.log(-Math.log(x/2)*besselI0(x)+(-0.57721566+y*(0.42278420+y*(0.23069756+y*(0.03488590+y*(0.00262698+y*(0.00010750+y*0.0000074)))))))}
  const y=2/x;return -x-0.5*Math.log(x)+Math.log(1.25331414+y*(-0.07832358+y*(0.02189568+y*(-0.01062446+y*(0.00587872+y*(-0.00251540+y*0.00053208))))))}
E.lnK0=lnK0;
/* paramètres effectifs d'une couche à la profondeur z (null = valeur automatique) */
E.oxLayer=function(P,L,sat,treat){const T=P.nappe.T,Cs=E.o2Sat(T),H=E.o2H(T);
  const n=Math.max(L.n||0.35,0.05),ta=sat?0:Math.max(L.ta||0,0),tw=sat?n:Math.max(L.tw||0.05,0.02);
  const auto={o2Nat:sat?1.0:0.7*Cs,o2Trait:sat?0.9*Cs:Cs,ehNat:sat?50:250,ehTrait:sat?350:400,kO2:0.1,dInd:sat?0.02:0};
  const v=k=>L[k]!=null&&L[k]!==''&&isFinite(Number(L[k]))?Number(L[k]):auto[k];
  const Dmol=(E.O2.Da*Math.pow(ta,10/3)/(n*n)*H+E.O2.Dw*Math.pow(tw,10/3)/(n*n))*86400; // m²/j
  const dInd=treat?v('dInd'):0;const k=Math.max(v('kO2'),1e-6);
  const De=Dmol+dInd,lam=Math.sqrt(De/(tw*k));
  const Cb=v('o2Nat'),C0=treat?v('o2Trait'):Cb;
  return{n,ta,tw,Cs,H,Dmol,dInd,De,k,lam,Cb,C0,ehNat:v('ehNat'),ehTrait:treat?v('ehTrait'):v('ehNat'),auto,
    src:Object.fromEntries(['o2Nat','o2Trait','ehNat','ehTrait','kO2','dInd'].map(q=>[q,L[q]!=null&&L[q]!==''?'saisi':'auto']))}};
E.oxAt=function(q,x,r0,cyl){// x : distance à la paroi (m)
  if(Math.abs(q.C0-q.Cb)<1e-9)return{C:q.Cb,f:0,eh:q.ehNat};
  let f;if(cyl&&r0>0){f=Math.exp(lnK0((r0+x)/q.lam)-lnK0(r0/q.lam))}else f=Math.exp(-x/q.lam);
  f=Math.min(Math.max(f,0),1);return{C:q.Cb+(q.C0-q.Cb)*f,f,eh:q.ehNat+(q.ehTrait-q.ehNat)*f}};
E.oxDist=function(q,r0,cyl,ft,xmax){if(Math.abs(q.C0-q.Cb)<1e-9)return null;if(E.oxAt(q,xmax,r0,cyl).f>=ft)return Infinity;
  const x=bisect(x=>E.oxAt(q,x,r0,cyl).f-ft,0,xmax,1e-5);return isFinite(x)?x:null};
E.oxydant=function(P,A){const O=Object.assign({},E.OX_DEF,P.oxydant||{});const zwt=P.nappe.zwt,TR=P.traitement;
  const md=TR.mode,vtG=md==='venting'||md==='vs',spG=md==='sparging'||md==='vs';
  const out=[];
  for(const r of A.results){const el=r.el,ct=r.ct,cyl=E.isPile(el.type),r0=cyl?(el.dim||0.5)/2:0;const inZ=!!el.zoneTraitement;
    const segs=[];const cuts=new Set([ct.z1,ct.z2]);if(zwt>ct.z1&&zwt<ct.z2)cuts.add(zwt);
    for(const L of P.layers){if(L.top>ct.z1&&L.top<ct.z2)cuts.add(L.top);if(L.bottom>ct.z1&&L.bottom<ct.z2)cuts.add(L.bottom)}
    const zs=[...cuts].sort((a,b)=>a-b);
    for(let i=0;i<zs.length-1;i++){const a=zs[i],b=zs[i+1];if(b-a<1e-6)continue;const zm=(a+b)/2;
      const L=P.layers.find(l=>zm>=l.top&&zm<l.bottom)||P.layers[P.layers.length-1];const sat=zm>zwt;
      const tr=inZ&&(sat?spG:vtG);const q=E.oxLayer(P,L,sat,tr);
      const prof=[];for(let x=0;x<=O.rMax+1e-9;x+=O.pas)prof.push(Object.assign({x:+x.toFixed(3)},E.oxAt(q,x,r0,cyl)));
      const p1=E.oxAt(q,1,r0,cyl);const z0=E.ehZone(q.ehTrait),z1=E.ehZone(p1.eh),zb=E.ehZone(q.ehNat);
      const sulf=!!(L.oxydable||(L.scr!=null&&L.scr>0)||(sat&&tr&&TR.sparging.pyrite>0));
      segs.push({z1:a,z2:b,couche:L.nom,sat,trait:tr,via:tr?(sat?'sparging':'venting'):'',q,prof,c0:q.C0,c1:p1.C,eh0:q.ehTrait,eh1:p1.eh,
        x50:E.oxDist(q,r0,cyl,0.5,20),x10:E.oxDist(q,r0,cyl,0.1,20),zone0:z0.nom,zone1:z1.nom,zoneNat:zb.nom,calcaire:!!L.calcaire,sulf})}
    const hOx=segs.filter(s=>s.zone0==='Oxique').reduce((t,s)=>t+s.z2-s.z1,0),hOxSat=segs.filter(s=>s.zone0==='Oxique'&&s.sat).reduce((t,s)=>t+s.z2-s.z1,0);
    const hRed=segs.filter(s=>s.zone0==='Réducteur').reduce((t,s)=>t+s.z2-s.z1,0);
    const cst=[];
    for(const s of segs){const d=s.x50==null?'':(s.x50===Infinity?'au-delà de 20 m':nfx(s.x50<1?s.x50*100:s.x50,s.x50<1?0:1)+(s.x50<1?' cm':' m'));
      let t=`${s.couche}, ${nfx(s.z1,1)} – ${nfx(s.z2,1)} m (${s.sat?'zone saturée':'zone non saturée'}) : `;
      if(s.trait)t+=`${s.via}, O₂ ${nfx(s.c0,1)} mg/L à l'interface et ${nfx(s.c1,1)} mg/L à 1 m (naturel ${nfx(s.q.Cb,1)} mg/L) ; moitié de l'écart résorbée à ${d} de la paroi (λ = ${s.q.lam>=1?nfx(s.q.lam,1)+' m':nfx(s.q.lam*100,0)+' cm'}) ; Eh ${sgn(s.eh0)} mV au contact (${s.zone0.toLowerCase()})`;
      else t+=`hors traitement, O₂ ${nfx(s.q.Cb,1)} mg/L, Eh ${sgn(s.q.ehNat)} mV (${s.zoneNat.toLowerCase()}), sans gradient au droit de l'ouvrage`;
      if(s.zone0==='Oxique'&&s.sulf)t+=' ; sulfures exposés à l\'oxydation, déjà comptés dans le classement (hypothèse saisie)';
      if(s.zone0==='Oxique'&&s.calcaire)t+=' ; carbonates présents (tampon de l\'acidité)';
      if(s.zone0==='Réducteur')t+=' ; milieu réducteur : H₂S possible';
      cst.push(t)}
    out.push({el:el.nom,type:el.type,cyl,r0,inZ,segs,hOx,hOxSat,hRed,constats:cst})}
  return{opts:O,T:P.nappe.T,Cs:E.o2Sat(P.nappe.T),H:E.o2H(P.nappe.T),items:out}};
function nfx(x,d){return Number(x).toLocaleString('fr-FR',{minimumFractionDigits:d,maximumFractionDigits:d})}
function sgn(x){return (x>0?'+':'')+nfx(x,0)}
if(typeof module!=='undefined')module.exports=E; else root.AGRESOL=E;
})(this);
