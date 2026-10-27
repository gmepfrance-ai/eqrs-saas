/* AGRESOL v1.6 – catalogue des formations géologiques (France métropolitaine)
   Notations indicatives de la légende des cartes géologiques à 1/50 000 du BRGM (à vérifier sur la notice de la feuille).
   Indicateurs pour l'agressivité : gyp = sulfates (gypse, anhydrite) ; pyr = sulfures (pyrite, marcassite) ;
   cal = encaissant carbonaté (tampon calcite) ; org = matière organique (H₂S, réduction des sulfates). */
(function(root){
const LITH={ // propriétés par défaut (porosité n, θa et θw en zone non saturée)
 remblai:{n:0.35,ta:0.20,tw:0.15},terre:{n:0.45,ta:0.20,tw:0.25},limon:{n:0.42,ta:0.15,tw:0.27},sable:{n:0.35,ta:0.22,tw:0.13},
 grave:{n:0.30,ta:0.20,tw:0.10},argile:{n:0.45,ta:0.08,tw:0.37},marne:{n:0.40,ta:0.10,tw:0.30},calcaire:{n:0.25,ta:0.12,tw:0.13},
 craie:{n:0.40,ta:0.12,tw:0.28},gypse:{n:0.20,ta:0.08,tw:0.12},gres:{n:0.20,ta:0.10,tw:0.10},tourbe:{n:0.80,ta:0.10,tw:0.70},
 schiste:{n:0.10,ta:0.04,tw:0.06},socle:{n:0.05,ta:0.02,tw:0.03},arene:{n:0.35,ta:0.18,tw:0.17},volcan:{n:0.15,ta:0.06,tw:0.09}};
const G={Q:'Quaternaire et formations superficielles',TP:'Tertiaire – Bassin de Paris',TA:'Tertiaire – Aquitaine, Sud-Est, Alsace',
 K:'Crétacé',J:'Jurassique',T:'Trias',P:'Paléozoïque',S:'Socle cristallin et volcanisme'};
const F=[
 // ---------------- Quaternaire et superficiel
 ['X','Remblais','Anthropique','Q','remblai',{}],
 ['X','Remblais à matière organique / déchets','Anthropique','Q','remblai',{org:1,pyr:1}],
 ['X','Remblais de démolition (plâtras, gravats)','Anthropique','Q','remblai',{gyp:1,cal:1}],
 ['X','Scories, mâchefers','Anthropique','Q','remblai',{pyr:1,gyp:1}],
 ['TV','Terre végétale','Holocène','Q','terre',{org:1}],
 ['Fz','Alluvions modernes (limons, argiles, sables)','Holocène','Q','limon',{org:1}],
 ['Fz','Alluvions tourbeuses','Holocène','Q','tourbe',{org:1,pyr:1}],
 ['T','Tourbes','Holocène','Q','tourbe',{org:1,pyr:1}],
 ['MZ','Vases et argiles marines ou estuariennes (bri, slikke)','Holocène','Q','argile',{org:1,pyr:1}],
 ['Mz','Sables et cordons littoraux','Holocène','Q','sable',{cal:1}],
 ['Dz','Sables dunaires','Holocène','Q','sable',{}],
 ['Fy','Alluvions anciennes de basse terrasse','Pléistocène supérieur','Q','grave',{}],
 ['Fx','Alluvions anciennes de moyenne terrasse','Pléistocène moyen','Q','grave',{}],
 ['Fw','Alluvions anciennes de haute terrasse','Pléistocène inférieur','Q','grave',{}],
 ['Fv','Alluvions très anciennes','Pléistocène inférieur','Q','grave',{}],
 ['LP','Limons des plateaux (lœss, lehm)','Pléistocène','Q','limon',{}],
 ['Œ','Lœss calcaire','Pléistocène','Q','limon',{cal:1}],
 ['C','Colluvions de versant','Holocène – Pléistocène','Q','limon',{}],
 ['CF','Colluvions et alluvions de fond de vallon','Holocène','Q','limon',{org:1}],
 ['E','Éboulis','Pléistocène – Holocène','Q','grave',{}],
 ['RS','Argiles à silex','Tertiaire – Quaternaire (altérites)','Q','argile',{}],
 ['RA','Altérites argileuses','Tertiaire – Quaternaire','Q','argile',{}],
 ['G','Moraines et dépôts glaciaires','Pléistocène','Q','grave',{}],
 ['FG','Dépôts fluvio-glaciaires','Pléistocène','Q','grave',{}],
 ['Lc','Dépôts lacustres (argiles, craies lacustres)','Pléistocène – Holocène','Q','argile',{cal:1,org:1}],
 ['Tf','Tufs calcaires','Holocène','Q','calcaire',{cal:1}],
 // ---------------- Tertiaire – Bassin de Paris
 ['p','Sables de Lozère, argiles de la Sologne','Pliocène','TP','sable',{}],
 ['m1','Sables de l\'Orléanais, marnes de l\'Orléanais','Burdigalien','TP','sable',{cal:1}],
 ['g3','Calcaire de Beauce','Aquitanien','TP','calcaire',{cal:1}],
 ['g2b','Calcaire d\'Étampes','Stampien supérieur','TP','calcaire',{cal:1}],
 ['g2a','Sables et grès de Fontainebleau','Stampien','TP','sable',{}],
 ['g2a','Marnes à huîtres','Stampien inférieur','TP','marne',{cal:1}],
 ['g1b','Calcaire de Brie, meulière de Brie','Sannoisien','TP','calcaire',{cal:1}],
 ['g1a','Argile verte de Romainville','Sannoisien','TP','argile',{gyp:1}],
 ['g1a','Glaises à Cyrènes','Sannoisien','TP','argile',{gyp:1,pyr:1}],
 ['e7b','Marnes supragypseuses (marnes de Pantin et d\'Argenteuil)','Ludien supérieur','TP','marne',{gyp:1,cal:1}],
 ['e7a','Masses et marnes du gypse (gypse de Montmartre)','Ludien','TP','gypse',{gyp:1,cal:1}],
 ['e7a','Marnes à Pholadomyes','Ludien inférieur','TP','marne',{gyp:1,cal:1}],
 ['e6c','Calcaire de Champigny','Ludien','TP','calcaire',{cal:1}],
 ['e6b','Marnes infragypseuses','Marinésien supérieur','TP','marne',{gyp:1,cal:1}],
 ['e6b','Calcaire de Saint-Ouen','Marinésien','TP','calcaire',{cal:1,gyp:1}],
 ['e6a','Sables de Monceau, sables de Cresnes','Marinésien','TP','sable',{cal:1}],
 ['e6a','Sables de Beauchamp','Auversien','TP','sable',{cal:1}],
 ['e6a','Sables d\'Auvers','Auversien','TP','sable',{}],
 ['e5c','Marnes et caillasses','Lutétien supérieur','TP','marne',{gyp:1,cal:1}],
 ['e5b','Calcaire grossier (banc royal, banc vert)','Lutétien moyen','TP','calcaire',{cal:1}],
 ['e5a','Calcaire grossier glauconieux','Lutétien inférieur','TP','calcaire',{cal:1,pyr:1}],
 ['e4','Sables de Cuise','Yprésien supérieur','TP','sable',{pyr:1}],
 ['e3','Argile de Laon','Yprésien','TP','argile',{pyr:1}],
 ['e3','Fausses glaises, sables d\'Auteuil','Sparnacien','TP','argile',{pyr:1,org:1}],
 ['e3','Argile plastique, lignites du Soissonnais','Sparnacien','TP','argile',{pyr:1,org:1,gyp:1}],
 ['e2','Marnes de Meudon, calcaire de Meudon','Montien','TP','marne',{cal:1}],
 ['e2','Sables de Bracheux, sables de Châlons-sur-Vesle','Thanétien','TP','sable',{pyr:1}],
 ['e2','Tuffeau de la Fère','Thanétien','TP','sable',{cal:1}],
 ['e1','Calcaire pisolithique','Danien','TP','calcaire',{cal:1}],
 // ---------------- Tertiaire – autres bassins
 ['m','Molasses du Miocène (Aquitaine, Sud-Est)','Miocène','TA','gres',{cal:1}],
 ['m','Faluns','Miocène','TA','sable',{cal:1}],
 ['g','Molasses de l\'Agenais, du Fronsadais','Oligocène','TA','marne',{cal:1}],
 ['g','Calcaire à Astéries','Rupélien','TA','calcaire',{cal:1}],
 ['m','Marnes bleues du Miocène / Pliocène (Sud-Est)','Miocène – Pliocène','TA','marne',{cal:1,pyr:1}],
 ['g','Formations salifères et gypseuses de l\'Oligocène (Bresse, Alsace, Provence)','Oligocène','TA','marne',{gyp:1}],
 ['g','Marnes à gypse de Provence (Aix, Marseille)','Oligocène','TA','marne',{gyp:1,cal:1}],
 ['e','Sables et argiles du Sidérolithique','Éocène','TA','argile',{}],
 ['e','Calcaires lacustres de Provence','Éocène','TA','calcaire',{cal:1}],
 ['p','Sables et argiles du Pliocène (Bresse, Rhône, Alsace)','Pliocène','TA','sable',{}],
 ['p','Argiles du Pliocène marin (Roussillon, Provence)','Pliocène','TA','argile',{cal:1,pyr:1}],
 // ---------------- Crétacé
 ['c6','Craie à silex (Campanien)','Campanien','K','craie',{cal:1}],
 ['c5','Craie blanche (Santonien, Coniacien)','Santonien – Coniacien','K','craie',{cal:1}],
 ['c4','Craie marneuse (Turonien)','Turonien','K','craie',{cal:1}],
 ['c3','Tuffeau de Touraine','Turonien','K','craie',{cal:1}],
 ['c2','Craie glauconieuse, marnes du Cénomanien','Cénomanien','K','marne',{cal:1,pyr:1}],
 ['c1','Gaize, argiles du Gault','Albien','K','argile',{pyr:1}],
 ['n7','Sables verts de l\'Albien','Albien','K','sable',{pyr:1}],
 ['n6','Argiles à plicatules, sables de l\'Aptien','Aptien','K','argile',{pyr:1}],
 ['n4','Calcaires à faciès urgonien','Barrémien','K','calcaire',{cal:1}],
 ['n3','Marnes et calcaires de l\'Hauterivien','Hauterivien','K','marne',{cal:1,pyr:1}],
 ['n1','Faciès wealdien (sables et argiles)','Berriasien – Barrémien','K','argile',{pyr:1,org:1}],
 ['c','Calcaires et marnes du Crétacé supérieur (Aquitaine, Provence)','Crétacé supérieur','K','calcaire',{cal:1}],
 ['c','Flysch crétacé (Pyrénées, Alpes)','Crétacé','K','schiste',{cal:1,pyr:1}],
 // ---------------- Jurassique
 ['j9','Calcaires du Portlandien (Tithonien)','Tithonien','J','calcaire',{cal:1}],
 ['j8','Marnes du Kimméridgien','Kimméridgien','J','marne',{cal:1,pyr:1}],
 ['j7','Calcaires du Kimméridgien inférieur','Kimméridgien','J','calcaire',{cal:1}],
 ['j6','Calcaires de l\'Oxfordien supérieur (Rauracien)','Oxfordien','J','calcaire',{cal:1}],
 ['j5','Marnes et argiles de l\'Oxfordien (Terres noires)','Oxfordien – Callovien','J','marne',{cal:1,pyr:1}],
 ['j4','Calcaires et marnes du Callovien','Callovien','J','marne',{cal:1,pyr:1}],
 ['j3','Calcaires du Bathonien (Dalle nacrée)','Bathonien','J','calcaire',{cal:1}],
 ['j2','Calcaires à entroques du Bajocien','Bajocien','J','calcaire',{cal:1}],
 ['j1','Marnes de l\'Aalénien, minerai de fer','Aalénien','J','marne',{pyr:1}],
 ['l6','Schistes cartons du Toarcien','Toarcien','J','schiste',{pyr:1,org:1,cal:1}],
 ['l5','Marnes du Domérien','Pliensbachien','J','marne',{cal:1,pyr:1}],
 ['l4','Calcaires et marnes du Carixien','Pliensbachien','J','marne',{cal:1}],
 ['l3','Calcaire à gryphées (Sinémurien)','Sinémurien','J','calcaire',{cal:1,pyr:1}],
 ['l1','Calcaires de l\'Hettangien','Hettangien','J','calcaire',{cal:1}],
 ['j','Schistes lustrés (Alpes)','Jurassique – Crétacé','J','schiste',{cal:1,pyr:1}],
 // ---------------- Trias
 ['t10','Grès et argiles du Rhétien','Rhétien','T','gres',{pyr:1}],
 ['t8','Marnes irisées supérieures','Keuper','T','marne',{gyp:1}],
 ['t7','Dolomie de Beaumont','Keuper','T','calcaire',{cal:1,gyp:1}],
 ['t5','Marnes irisées à gypse et anhydrite','Keuper','T','marne',{gyp:1}],
 ['t4','Lettenkohle','Ladinien','T','argile',{pyr:1,gyp:1}],
 ['t3','Calcaires du Muschelkalk','Muschelkalk','T','calcaire',{cal:1,gyp:1}],
 ['t2','Marnes et dolomies à anhydrite du Muschelkalk moyen','Muschelkalk','T','marne',{gyp:1}],
 ['t1','Grès bigarré (Buntsandstein)','Buntsandstein','T','gres',{}],
 ['t','Trias gypsifère et salifère (Provence, Alpes, Pyrénées)','Trias','T','gypse',{gyp:1}],
 ['t','Cargneules','Trias','T','calcaire',{gyp:1,cal:1}],
 // ---------------- Paléozoïque
 ['r','Grès et pélites du Permien','Permien','P','gres',{}],
 ['h','Houiller (schistes, grès, charbon)','Carbonifère supérieur','P','schiste',{pyr:1,org:1}],
 ['h','Terrils et stériles houillers','Anthropique (Carbonifère)','P','remblai',{pyr:1,org:1,gyp:1}],
 ['h1','Calcaires du Carbonifère inférieur (Viséen)','Carbonifère inférieur','P','calcaire',{cal:1}],
 ['d','Schistes et grès du Dévonien','Dévonien','P','schiste',{pyr:1}],
 ['s','Schistes noirs à graptolites (ampélites)','Silurien','P','schiste',{pyr:1,org:1}],
 ['o2','Schistes ardoisiers d\'Angers','Ordovicien','P','schiste',{pyr:1}],
 ['o1','Grès armoricain','Ordovicien','P','gres',{}],
 ['b','Schistes et grès briovériens','Briovérien','P','schiste',{pyr:1}],
 // ---------------- Socle et volcanisme
 ['γ','Granites','Paléozoïque','S','socle',{}],
 ['γ','Arènes granitiques','Altérite','S','arene',{}],
 ['ζ','Gneiss','Précambrien – Paléozoïque','S','socle',{}],
 ['ξ','Micaschistes','Paléozoïque','S','schiste',{pyr:1}],
 ['λ','Amphibolites et roches basiques','Paléozoïque','S','socle',{}],
 ['β','Basaltes et coulées','Cénozoïque','S','volcan',{}],
 ['τ','Tufs et pyroclastites','Cénozoïque','S','volcan',{}],
 ['K','Minéralisations sulfurées (gîtes, haldes)','Divers','S','socle',{pyr:1}]
];
const list=F.map((f,i)=>({id:'F'+i,code:f[0],nom:f[1],etage:f[2],groupe:f[3],groupeNom:G[f[3]],lith:f[4],
  gyp:!!f[5].gyp,pyr:!!f[5].pyr,cal:!!f[5].cal,org:!!f[5].org,props:LITH[f[4]]}));
const norm=s=>String(s||'').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Z0-9 ]/g,' ').replace(/\bST\b/g,'SAINT').replace(/\bSTE\b/g,'SAINTE').replace(/\s+/g,' ').trim();
const STOP=new Set(['DE','DU','DES','LA','LE','LES','ET','A','AU','AUX','D','L','EN','SUR']);
function match(txt){ // rapproche un libellé de log BSS d'une formation du catalogue
 const t=norm(txt);if(!t)return null;const tw=new Set(t.split(' ').filter(w=>w.length>2&&!STOP.has(w)));let best=null,bs=0;
 for(const f of list){const fw=norm(f.nom).split(' ').filter(w=>w.length>2&&!STOP.has(w));let sc=0;for(const w of fw)if(tw.has(w))sc+=w.length;
  if(sc>bs){bs=sc;best=f}}
 return bs>=6?best:null}
function lithOf(txt){const t=norm(txt);
 const R=[['REMBLAI','remblai'],['TERRE VEGETALE','terre'],['TOURBE','tourbe'],['VASE','argile'],['GYPSE','gypse'],['CRAIE','craie'],['MARNE','marne'],['ARGILE','argile'],['GLAISE','argile'],['LIMON','limon'],['SABLE','sable'],['GRAVE','grave'],['GALET','grave'],['CALCAIRE','calcaire'],['GRES','gres'],['SCHISTE','schiste'],['GRANITE','socle'],['GNEISS','socle'],['ARENE','arene'],['BASALTE','volcan']];
 for(const [k,v] of R)if(t.includes(k))return v;return 'limon'}
root.AGRESOL_FORM={list,groupes:G,LITH,match,lithOf};
})(typeof window!=='undefined'?window:module.exports);
