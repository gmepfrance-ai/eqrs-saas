/* AGRESOL v1.6 – stockage de l'index des études (version poste de travail : stockage du navigateur) */
(function(){const K='agresol_etudes_v1';
window.AGRESOL_STORE={mode:'navigateur',
  load:async()=>{try{return JSON.parse(localStorage.getItem(K)||'{}').etudes||{}}catch(e){return {}}},
  save:async(o)=>{localStorage.setItem(K,JSON.stringify(o));return true}};})();
