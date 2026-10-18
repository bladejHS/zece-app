"use strict";
/* jurnalul de erori (Setări → Datele tale): ultimele 30, doar pe acest dispozitiv */
const ERRK='zece3:errlog';
function errLog(m,src){ try{ const a=JSON.parse(localStorage.getItem(ERRK)||'[]'); a.push({t:new Date().toISOString(),m:String(m||'eroare').slice(0,300),s:String(src||'').slice(0,80)}); localStorage.setItem(ERRK,JSON.stringify(a.slice(-30))); }catch(e){} }
addEventListener('error',e=>errLog(e.message,((e.filename||'').split('/').pop()||'')+(e.lineno?':'+e.lineno:'')));
addEventListener('unhandledrejection',e=>errLog('promisiune respinsă: '+((e.reason&&e.reason.message)||e.reason),''));
const errList=()=>{ try{ const a=JSON.parse(localStorage.getItem(ERRK)||'[]'); return Array.isArray(a)?a:[]; }catch(e){ return []; } };
