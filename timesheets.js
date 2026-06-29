function addTimesheet(){
  const m=me();
  const myCust=jobs.filter(j=>j.status==='assigned'&&j.assignedTo===myId).map(j=>j.customerId);
  const opts=myCust.length?myCust.map(cid=>{const cu=custById(cid);return '<option value="'+cid+'">'+fullName(cu)+'</option>';}).join(''):'<option value="">— erst Kunde annehmen —</option>';
  document.getElementById('modalTitle').textContent='Zeit erfassen';
  document.getElementById('modalBody').innerHTML=
    '<div class="content-form">'+
    '<label>Kunde</label><select id="ts_cust">'+opts+'</select>'+
    '<label>Datum</label><input id="ts_date" type="date" value="2026-06-10">'+
    '<div class="form-row"><div><label>Beginn</label><input id="ts_start" type="time" value="09:00"></div>'+
    '<div><label>Ende</label><input id="ts_end" type="time" value="11:00"></div></div>'+
    '<label>Tätigkeit</label><input id="ts_task" placeholder="z. B. Haushaltshilfe & Einkauf">'+
    '</div>';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="width:auto;padding:11px 20px" onclick="saveTimesheet()">Speichern</button>';
  openModal();
}
function saveTimesheet(){
  const cid=document.getElementById('ts_cust').value;
  const start=val('ts_start'),end=val('ts_end');
  if(cid==='' ){toast('Bitte zuerst einen Kunden annehmen',true);return;}
  if(!start||!end||end<=start){toast('Bitte gültige Start-/Endzeit angeben',true);return;}
  timesheets.push({id:nextTsId++,staffId:myId,customerId:+cid,date:val('ts_date'),start,end,task:val('ts_task')||'Einsatz',status:'offen',proof:false});
  closeModal();toast('Zeit erfasst – wartet auf Freigabe durch das Büro');
  renderStaff('hours');
}
function approveTimesheet(id){
  const t=timesheets.find(x=>x.id===id); if(!t)return;
  t.status='freigegeben'; t.proof=true;
  // Statusänderung dauerhaft in der Datenbank speichern
  if(CLOUD){ cloudUpdate('stundenzettel', id, { status:'freigegeben', proof:true }); }
  // echten Leistungsnachweis erzeugen
  proofs.push({id:nextProofId++,timesheetId:t.id,staffId:t.staffId,customerId:t.customerId,date:t.date,task:t.task,minutes:tsMinutes(t),signed:false});
  toast('Stundenzettel freigegeben – Leistungsnachweis erstellt');renderAdmin('hours');
}
function rejectTimesheet(id){
  const t=timesheets.find(x=>x.id===id); if(!t)return;
  if(!confirm('Diesen Stundenzettel ablehnen? Er wird als abgelehnt markiert und zählt nicht zur Abrechnung.'))return;
  t.status='abgelehnt';
  if(CLOUD){ cloudUpdate('stundenzettel', id, { status:'abgelehnt' }); }
  toast('Stundenzettel abgelehnt',true); renderAdmin('hours');
}
/* Plausibilitäts-Check der Unterschrift (kein forensischer Vergleich!):
   Prüft nur, ob überhaupt eine inhaltlich gefüllte Unterschrift vorliegt –
   nicht, ob sie von einer bestimmten Person stammt. Die echte Prüfung
   bleibt Aufgabe des Büros. */
function signatureLooksValid(sig){
  if(!sig || typeof sig!=='string') return false;
  if(sig.indexOf('data:image')!==0) return false;
  // Sehr kleine Daten-URLs deuten auf eine (fast) leere Unterschrift hin
  if(sig.length < 1500) return false;
  return true;
}
function signProof(id){
  const p=proofs.find(x=>x.id===id);if(!p)return;
  p.signed=true;toast('Leistungsnachweis vom Kunden bestätigt');renderAdmin('hours');
}
function tsMinutes(t){const[a,b]=t.start.split(':').map(Number);const[c,d]=t.end.split(':').map(Number);return (c*60+d)-(a*60+b);}
function tsDuration(t){const m=tsMinutes(t);return Math.floor(m/60)+' Std '+(m%60)+' Min';}

/* ============ NOTIZEN ============ */
