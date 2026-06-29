const SUPABASE_URL='https://kqufqziznvrvodadpmek.supabase.co';
const SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtxdWZxeml6bnZydm9kYWRwbWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE0MzU4MzcsImV4cCI6MjA5NzAxMTgzN30.PVZdLj3BANHBR_HUor2F1CFDUR4QzJb4N25DkgzH9eY';
let sb=null;
let CLOUD=false; // true sobald Verbindung steht

function initSupabase(){
  try{
    if(window.supabase&&SUPABASE_URL.indexOf('http')===0){
      sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{
        auth:{
          persistSession:true,        // Sitzung im Browser speichern
          autoRefreshToken:true,      // Token automatisch erneuern
          detectSessionInUrl:true,    // Einladungs-/Reset-Token aus der URL erkennen
          storageKey:'dailydo-auth'
        }
      });
      return true;
    }
  }catch(e){console.warn('Supabase init fehlgeschlagen',e);}
  return false;
}

/* ---- Mapping: JS-Objekt -> DB-Zeile (snake_case, time_window) ---- */
function staffToRow(s){return {
  first:s.first,last:s.last,role:s.role,status:s.status,skills:s.skills||[],area:s.area,phone:s.phone,email:s.email,gender:s.gender||null,
  max_hours:s.maxHours||20,days:s.days||[],time_window:s.window||'Flexibel',
  wage:s.wage||14,bonus_earned:(s.bonus&&s.bonus.earned)||0,bonus_pending:(s.bonus&&s.bonus.pending)||0,bonus_reason:(s.bonus&&s.bonus.reason)||null,
  days_worked:s.daysWorked||0,color:s.color||'#0f5b63',has_login:!!s.hasLogin,login:s.login||null,
  birth:(s.intern&&s.intern.birth)||null,address:(s.intern&&s.intern.address)||null,tax_id:(s.intern&&s.intern.taxId)||null,
  tax_class:(s.intern&&s.intern.taxClass)||null,kv_nr:(s.intern&&s.intern.kvNr)||null,kasse:(s.intern&&s.intern.kasse)||null,
  employment:(s.intern&&s.intern.employment)||null,citizenship:(s.intern&&s.intern.citizenship)||null,iban:(s.intern&&s.intern.iban)||null
};}
function rowToStaff(r){return {
  id:r.id,first:r.first,last:r.last,role:r.role,status:r.status,skills:r.skills||[],area:r.area,phone:r.phone,email:r.email,gender:r.gender,
  maxHours:r.max_hours,days:r.days||[],window:r.time_window,wage:Number(r.wage),
  bonus:{earned:Number(r.bonus_earned),pending:Number(r.bonus_pending),reason:r.bonus_reason},
  daysWorked:r.days_worked,color:r.color,hasLogin:r.has_login,login:r.login,
  contracts:[], // werden separat geladen
  intern:{birth:r.birth,address:r.address,taxId:r.tax_id,taxClass:r.tax_class,kvNr:r.kv_nr,kasse:r.kasse,employment:r.employment,citizenship:r.citizenship,iban:r.iban}
};}
function custToRow(c){return {
  first:c.first,last:c.last,area:c.area,address:c.address,
  street:c.street||null,house_no:c.houseNo||null,plz:c.plz||null,city:c.city||null,
  phone:c.phone,phone_mobile:c.phoneMobile||null,phone_landline:c.phoneLandline||null,
  need:c.need||[],
  freq_num:c.freqNum||1,freq_unit:c.freqUnit||'pro Woche',time_window:c.window||null,
  pet:c.pet,pets:c.pets||[],pgrad:c.pgrad,status:c.status,
  contact:c.contact,contact_name:c.contactName||null,contact_phone:c.contactPhone||null,
  no_contact:!!c.noContact,no_notes:!!c.noNotes,notes:c.notes,
  insurance_type:c.insuranceType||'gesetzlich',beihilfe_pct:c.beihilfePct||null,
  kv_nr:(c.intern&&c.intern.kvNr)||null,kasse:(c.intern&&c.intern.kasse)||null,budget:(c.intern&&c.intern.budget)||null,budget_used:(c.intern&&c.intern.budgetUsed)||null
};}
function rowToCust(r){return {
  id:r.id,first:r.first,last:r.last,area:r.area,address:r.address,
  street:r.street,houseNo:r.house_no,plz:r.plz,city:r.city,
  phone:r.phone,phoneMobile:r.phone_mobile,phoneLandline:r.phone_landline,
  need:r.need||[],
  freqNum:r.freq_num,freqUnit:r.freq_unit,window:r.time_window,timeWindows:(r.time_window?String(r.time_window).split(', '):[]),
  pet:r.pet,pets:r.pets||[],pgrad:r.pgrad,status:r.status,
  contact:r.contact,contactName:r.contact_name,contactPhone:r.contact_phone,
  noContact:r.no_contact,noNotes:r.no_notes,notes:r.notes,
  insuranceType:r.insurance_type||'gesetzlich',beihilfePct:r.beihilfe_pct,
  intern:{kvNr:r.kv_nr,kasse:r.kasse,budget:r.budget,budgetUsed:r.budget_used}
};}
function jobToRow(j){return {customer_id:j.customerId,title:j.title,skills:j.skills||[],status:j.status,assigned_to:j.assignedTo,rejected_by:j.rejectedBy||[],commit_deadline:j.commitDeadline?new Date(j.commitDeadline).toISOString():null};}
function rowToJob(r){return {id:r.id,customerId:r.customer_id,title:r.title,skills:r.skills||[],status:r.status,assignedTo:r.assigned_to,rejectedBy:r.rejected_by||[],commitDeadline:r.commit_deadline?new Date(r.commit_deadline).getTime():null};}
function appToRow(a){const q=a.questionnaire||{};return {first:a.first,last:a.last,gender:a.gender||null,email:a.email,phone:a.phone,area:a.area,citizenship:a.citizenship,skills:a.skills||[],motivation:a.motivation,status:a.status,docs:a.docs||{},signatures:a.signatures||{},questionnaire:a.questionnaire||{},declaration:a.declaration||{},id_front:!!a.idFront,id_back:!!a.idBack,selfie:!!a.selfie,agb:!!a.agb,street:q.street||null,house_no:q.houseNo||null,plz:q.plz||null,city:q.city||null,employment:q.employment||null,other_job:q.otherJob||null,is_student:!!a.isStudent,enrollment_file:!!a.enrollmentFile,pets:a.pets||[]};}
function rowToApp(r){return {id:r.id,first:r.first,last:r.last,gender:r.gender,email:r.email,phone:r.phone,area:r.area,citizenship:r.citizenship,skills:r.skills||[],motivation:r.motivation,status:r.status,docs:r.docs||{},signatures:r.signatures||{},questionnaire:r.questionnaire||{},declaration:r.declaration||{},idFront:r.id_front,idBack:r.id_back,selfie:r.selfie,agb:r.agb,isStudent:r.is_student,enrollmentFile:r.enrollment_file,pets:r.pets||[]};}

/* ---- Speicher-Helfer: schreiben einzelne Objekte zurück ---- */
async function cloudInsert(table,row){ if(!CLOUD)return null; try{const{data,error}=await sb.from(table).insert(row).select().single(); if(error){console.warn('insert',table,error.message);return null;} return data;}catch(e){console.warn(e);return null;} }
async function cloudUpdate(table,id,row){ if(!CLOUD)return; try{const{error}=await sb.from(table).update(row).eq('id',id); if(error)console.warn('update',table,error.message);}catch(e){console.warn(e);} }
async function cloudDelete(table,id){ if(!CLOUD)return; try{await sb.from(table).delete().eq('id',id);}catch(e){console.warn(e);} }

/* ---- Erstbefüllung: wenn DB leer, Demo-Daten hochladen ---- */
async function seedIfEmpty(){
  try{
    // Prüfen, ob in mitarbeiter ODER kunden schon Daten sind
    const [{data:mEx},{data:kEx}] = await Promise.all([
      sb.from('mitarbeiter').select('id').limit(1),
      sb.from('kunden').select('id').limit(1)
    ]);
    const hasData = (mEx&&mEx.length>0) || (kEx&&kEx.length>0);
    if(hasData) return false; // schon echte Daten vorhanden -> NICHT säen
    // Datenbank ist wirklich leer -> einmalig Demo-Daten einsetzen
    for(const s of staff){ const row=staffToRow(s); const d=await cloudInsert('mitarbeiter',row); if(d){ for(const ct of (s.contracts||[])){ await cloudInsert('vertraege',{mitarbeiter_id:d.id,name:ct.name,signed_date:ct.signedDate,signature:ct.signature}); } } }
    for(const c of customers){ await cloudInsert('kunden',custToRow(c)); }
    return true;
  }catch(e){
    console.error('seedIfEmpty Problem (übersprungen):', e&&(e.message||e));
    return false;
  }
}

/* ---- Laden aller Kerndaten aus der DB ----
   Jeder Schritt ist einzeln abgesichert: Schlägt eine Tabelle fehl,
   bricht NICHT das ganze Laden ab. Fehler werden in der Konsole
   protokolliert, damit man sieht, welche Tabelle/Spalte hakt. */
let DIAG=[]; // sichtbare Diagnose-Meldungen
async function loadFromCloud(){
  DIAG=[];
  // Mitarbeiter
  try{
    const {data,error}=await sb.from('mitarbeiter').select('*').order('id');
    if(error) throw error;
    if(data) staff=data.map(rowToStaff);
    DIAG.push('mitarbeiter: '+(data?data.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER mitarbeiter: '+(e.message||e)); console.error('Laden mitarbeiter fehlgeschlagen:', e.message||e); }

  // Kunden
  try{
    const {data,error}=await sb.from('kunden').select('*').order('id');
    if(error) throw error;
    if(data) customers=data.map(rowToCust);
    DIAG.push('kunden: '+(data?data.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER kunden: '+(e.message||e)); console.error('Laden kunden fehlgeschlagen:', e.message||e); }

  // Verträge den Mitarbeitern zuordnen
  try{
    const {data:vRows,error}=await sb.from('vertraege').select('*');
    if(error) throw error;
    if(vRows){ vRows.forEach(v=>{const s=staff.find(x=>x.id===v.mitarbeiter_id); if(s){ s.contracts=s.contracts||[]; s.contracts.push({name:v.name,signedDate:v.signed_date,signature:v.signature}); }}); }
    DIAG.push('vertraege: '+(vRows?vRows.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER vertraege: '+(e.message||e)); console.error('Laden vertraege fehlgeschlagen:', e.message||e); }

  // Aufträge
  try{
    const {data:aData,error}=await sb.from('auftraege').select('*').order('id');
    if(error) throw error;
    if(aData&&aData.length){ jobs=aData.map(rowToJob); }
    else { jobs=[]; for(const c of customers){ if(c.status!=='beendet'){ const row=jobToRow({customerId:c.id,title:(c.need[0]||'Einsatz')+' – '+c.last,skills:c.need.slice(),status:'available',assignedTo:null,rejectedBy:[]}); const d=await cloudInsert('auftraege',row); if(d)jobs.push(rowToJob(d)); } } }
    DIAG.push('auftraege: '+jobs.length+' aktiv');
  }catch(e){ DIAG.push('FEHLER auftraege: '+(e.message||e)); console.error('Laden auftraege fehlgeschlagen:', e.message||e); }

  // Bewerbungen
  try{
    const {data,error}=await sb.from('bewerbungen').select('*').order('id');
    if(error) throw error;
    if(data) applications=data.map(rowToApp);
    DIAG.push('bewerbungen: '+(data?data.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER bewerbungen: '+(e.message||e)); console.error('Laden bewerbungen fehlgeschlagen:', e.message||e); }

  // Termine
  try{
    const {data,error}=await sb.from('termine').select('*').order('id');
    if(error) throw error;
    if(data) appointments=data.map(rowToAppt);
    DIAG.push('termine: '+(data?data.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER termine: '+(e.message||e)); console.error('Laden termine fehlgeschlagen:', e.message||e); }

  // Stundenzettel (inkl. abgeschlossene Einsätze mit Unterschrift)
  try{
    const {data,error}=await sb.from('stundenzettel').select('*').order('id');
    if(error) throw error;
    if(data) timesheets=data.map(rowToTimesheet);
    DIAG.push('stundenzettel: '+(data?data.length:0)+' geladen');
  }catch(e){ DIAG.push('FEHLER stundenzettel: '+(e.message||e)); console.error('Laden stundenzettel fehlgeschlagen:', e.message||e); }

  // myId auf ersten Mitarbeiter setzen
  if(staff.length){ myId=staff[0].id; }
}
function rowToTimesheet(r){
  return { id:r.id, staffId:r.mitarbeiter_id, customerId:r.customer_id, date:r.date, start:r.start, end:r.ende, task:r.task, status:r.status||'offen', proof:r.proof, signature:r.signature, signedAt:r.signed_at, hasAbtretung:!!r.signature };
}
// Sichtbarer Diagnose-Kasten (per Klick auf das Status-Badge aufrufbar)
function showDiag(){
  let d=document.getElementById('diagBox');
  if(d){ d.remove(); return; }
  d=document.createElement('div');
  d.id='diagBox';
  d.style.cssText='position:fixed;bottom:48px;right:12px;z-index:10000;background:#fff;border:2px solid #6d28d9;border-radius:12px;padding:14px 16px;font-size:13px;max-width:320px;box-shadow:0 8px 30px rgba(0,0,0,.25);line-height:1.6';
  const rows=(DIAG.length?DIAG:['(noch keine Lade-Daten)']).map(x=>{
    const isErr=x.indexOf('FEHLER')===0;
    return '<div style="color:'+(isErr?'#c0392b':'#0f5b63')+';font-weight:'+(isErr?'700':'500')+'">'+(isErr?'⚠ ':'✓ ')+x+'</div>';
  }).join('');
  d.innerHTML='<div style="font-weight:700;margin-bottom:8px;color:#6d28d9">Lade-Diagnose</div>'+rows+
    '<div style="margin-top:10px;border-top:1px solid #eee;padding-top:8px;color:#555">CLOUD: '+(typeof CLOUD!=='undefined'?CLOUD:'?')+' · in App: '+customers.length+' Kunden, '+staff.length+' Mitarbeiter</div>'+
    '<div style="margin-top:8px;text-align:right"><button onclick="document.getElementById(\'diagBox\').remove()" style="background:#6d28d9;color:#fff;border:0;border-radius:7px;padding:6px 12px;font-weight:600;cursor:pointer">Schließen</button></div>';
  document.body.appendChild(d);
}

async function bootCloud(){
  if(!initSupabase()){ showCloudBadge('lokal'); return; }
  try{
    showCloudBadge('verbinde');
    await seedIfEmpty();
    CLOUD=true;
    await loadFromCloud();   // einzelne Fehler werden intern abgefangen
    showCloudBadge('cloud');
    // Hinweis: Das Neuzeichnen der Ansicht passiert NACH dem (Wieder-)Anmelden
    // in enterApp/restoreSession – nicht hier, damit keine leere Ansicht entsteht.
  }catch(e){
    console.error('Cloud-Boot Problem:', e&&(e.message||e));
    if(CLOUD){ showCloudBadge('cloud'); }
    else { showCloudBadge('lokal'); }
  }
}
function showCloudBadge(state){
  let b=document.getElementById('cloudBadge');
  if(!b){ b=document.createElement('div'); b.id='cloudBadge'; b.style.cssText='position:fixed;bottom:12px;right:12px;z-index:9999;font-size:12px;font-weight:600;padding:6px 11px;border-radius:20px;box-shadow:0 2px 8px rgba(0,0,0,.15);cursor:pointer'; b.title='Klicken für Lade-Diagnose'; b.onclick=showDiag; document.body.appendChild(b); }
  if(state==='cloud'){ b.style.background='#0f5b63';b.style.color='#fff';b.textContent='● Datenbank verbunden'; }
  else if(state==='verbinde'){ b.style.background='#e0a93b';b.style.color='#fff';b.textContent='● verbinde …'; }
  else { b.style.background='#999';b.style.color='#fff';b.textContent='● lokal (ohne Datenbank)'; }
}
