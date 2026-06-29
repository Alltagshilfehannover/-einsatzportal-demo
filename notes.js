function notesAdminHTML(){
  const staffNotes=notes.filter(n=>n.type==='staff');
  const custNotes=notes.filter(n=>n.type==='customer');
  const block=(title,list,type)=>'<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>'+title+'</h3><button class="btn-primary btn-sm" style="width:auto" onclick="addNote(\''+type+'\')">+ Notiz</button></div><div class="panel-body" style="padding-top:8px">'+
    (list.length?list.map(n=>{
      const ref=type==='staff'?staff.find(s=>s.id===n.refId):custById(n.refId);
      const refName=ref?fullName(ref):'—';
      return '<div style="padding:11px 0;border-bottom:1px solid #eef3f3"><div style="display:flex;justify-content:space-between;gap:10px"><b>'+refName+'</b><span class="tag '+(n.visibility==='intern'?'grey':'blue')+'">'+(n.visibility==='intern'?'intern':'für Mitarbeiter')+'</span></div><div style="font-size:14px;margin-top:3px">'+n.text+'</div><div style="font-size:12px;color:var(--muted);margin-top:3px">'+fmtDate(n.date)+'</div></div>';
    }).join(''):'<p style="color:var(--muted);padding:8px 0">Keine Notizen.</p>')+
    '</div></div>';
  return block('Notizen zu Mitarbeitern',staffNotes,'staff')+block('Notizen zu Kunden',custNotes,'customer');
}
function addNote(type){
  const list=type==='staff'?staff:customers;
  document.getElementById('modalTitle').textContent='Notiz hinzufügen';
  document.getElementById('modalBody').innerHTML=
    '<div class="content-form">'+
    '<label>'+(type==='staff'?'Mitarbeiter':'Kunde')+'</label><select id="nt_ref">'+list.map(o=>'<option value="'+o.id+'">'+fullName(o)+'</option>').join('')+'</select>'+
    '<label>Notiz</label><textarea id="nt_text" rows="3" placeholder="Bemerkung eingeben"></textarea>'+
    '<label>Sichtbarkeit</label>'+
    '<div class="seg" id="nt_vis"><button data-v="intern" class="on" onclick="segPick(this,\'nt_vis\')">Intern (nur Büro)</button><button data-v="mitarbeiter" onclick="segPick(this,\'nt_vis\')">Für Mitarbeiter sichtbar</button></div>'+
    '</div>';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="width:auto;padding:11px 20px" onclick="saveNote(\''+type+'\')">Speichern</button>';
  openModal();
}
function saveNote(type){
  const refId=+document.getElementById('nt_ref').value;
  const text=val('nt_text');
  if(!text){toast('Bitte Notiztext eingeben',true);return;}
  const vis=document.querySelector('#nt_vis button.on').dataset.v;
  notes.push({id:nextNoteId++,type,refId,text,visibility:vis,date:'2026-06-10'});
  closeModal();toast('Notiz gespeichert');renderAdmin('notes');
}

/* ============ MODAL / HELPERS ============ */
