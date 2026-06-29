let editingStaffId=null;
function addStaff(){ openStaffModal(null); }
function editStaff(id){ openStaffModal(id); }
function openStaffModal(id){
  editingStaffId=id;
  const s=id!==null?staff.find(x=>x.id===id):{first:'',last:'',role:'Haushaltshilfe',status:'aktiv',skills:[],area:'',phone:'',email:'',maxHours:20,days:[],window:'Flexibel',hasLogin:false,login:'',intern:{birth:'',address:'',taxId:'',taxClass:'I',kvNr:'',kasse:'',employment:'Minijob',citizenship:'Deutsch',iban:''}};
  const it=s.intern||{};
  document.getElementById('modalBox').classList.add('wide');
  document.getElementById('modalTitle').textContent=id!==null?'Mitarbeiter bearbeiten':'Mitarbeiter hinzufügen';
  document.getElementById('modalBody').innerHTML=
    '<div class="content-form">'+
      '<div class="section-label" style="margin-top:0">Stammdaten</div>'+
      '<div class="form-row"><div><label>Vorname</label><input id="es_first" value="'+s.first+'"></div>'+
      '<div><label>Nachname</label><input id="es_last" value="'+s.last+'"></div></div>'+
      '<div class="form-row"><div><label>Funktion</label><input id="es_role" value="'+s.role+'"></div>'+
      '<div><label>Geburtsdatum</label><input id="es_birth" value="'+(it.birth||'')+'" placeholder="TT.MM.JJJJ"></div></div>'+
      '<label>Adresse</label><input id="es_address" value="'+(it.address||'')+'">'+
      '<div class="form-row"><div><label>Telefon</label><input id="es_phone" value="'+s.phone+'"></div>'+
      '<div><label>E-Mail</label><input id="es_email" value="'+s.email+'"></div></div>'+
      '<label>Fähigkeiten</label>'+
      '<div class="checks" id="es_skills">'+SKILLS.map(sk=>'<span class="check '+(s.skills.includes(sk)?'on':'')+'" onclick="this.classList.toggle(\'on\')">'+sk+'</span>').join('')+'</div>'+
      '<label>Status</label>'+
      '<div class="seg status" id="es_status">'+['aktiv','Urlaub','krank'].map(v=>'<button data-v="'+v+'" class="'+(s.status===v?'on':'')+'" onclick="segPick(this,\'es_status\')">'+v+'</button>').join('')+'</div>'+

      '<div class="section-label">Interne Daten (nur Büro)</div>'+
      '<div class="form-row-3"><div><label>Steuer-ID</label><input id="es_taxId" value="'+(it.taxId||'')+'"></div>'+
      '<div><label>Steuerklasse</label><select id="es_taxClass">'+['I','II','III','IV','V','VI'].map(t=>'<option '+(it.taxClass===t?'selected':'')+'>'+t+'</option>').join('')+'</select></div>'+
      '<div><label>Anstellungsart</label><select id="es_employment">'+['Minijob','Midijob','Teilzeit','Vollzeit','Rentner'].map(e=>'<option '+(it.employment===e?'selected':'')+'>'+e+'</option>').join('')+'</select></div></div>'+
      '<div class="form-row"><div><label>KV-Nummer</label><input id="es_kvNr" value="'+(it.kvNr||'')+'"></div>'+
      '<div><label>Krankenkasse</label><input id="es_kasse" value="'+(it.kasse||'')+'"></div></div>'+
      '<div class="form-row"><div><label>Staatsbürgerschaft / Arbeitserlaubnis</label><input id="es_citizenship" value="'+(it.citizenship||'')+'"></div>'+
      '<div><label>IBAN</label><input id="es_iban" value="'+(it.iban||'')+'"></div></div>'+

      ((id!==null && s.contracts && s.contracts.length)
        ? '<div class="section-label">Unterschriebene Verträge</div>'+
          s.contracts.map((ct,i)=>'<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>📄 '+ct.name+'</b><div class="li-sub">'+(ct.signedDate?'Unterschrieben am '+fmtDate(ct.signedDate):'')+'</div></div><div style="display:flex;gap:7px;align-items:center">'+(ct.signature?'<img src="'+ct.signature+'" style="height:38px;border:1px solid var(--line);border-radius:6px;background:#fff">':'')+'<button class="btn-ghost btn-sm" onclick="viewContract(\''+ct.name+'\','+id+','+i+')">Lesen</button><button class="btn-primary btn-sm" style="width:auto" onclick="downloadStaffContract('+id+','+i+')">⬇ PDF</button></div></div>').join('')
        : '')+

      (id!==null
        ? '<div class="section-label">Personalfragebogen</div>'+
          '<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>📋 Personalfragebogen (DATEV)</b><div class="li-sub">Automatisch aus den Stammdaten erzeugt</div></div><div style="display:flex;gap:7px;align-items:center"><button class="btn-primary btn-sm" style="width:auto" onclick="downloadPersonalfragebogen('+id+')">⬇ PDF</button></div></div>'
        : '')+

      ((id!==null && s.docImages && (s.docImages.idFront||s.docImages.idBack||s.docImages.selfie||s.docImages.enrollment))
        ? '<div class="section-label">Eingereichte Dokumente <span style="font-weight:400;color:var(--muted);font-size:12px">(nur intern sichtbar)</span></div>'+
          [['idFront','Personalausweis – Vorderseite','🪪'],['idBack','Personalausweis – Rückseite','🪪'],['selfie','Selfie','🤳'],['enrollment','Immatrikulationsbescheinigung','🎓']]
            .filter(([k])=>s.docImages[k])
            .map(([k,label,ic])=>'<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>'+ic+' '+label+'</b></div><div style="display:flex;gap:7px;align-items:center"><img src="'+s.docImages[k]+'" style="height:40px;border:1px solid var(--line);border-radius:6px;background:#fff" onerror="this.style.display=\'none\'"><button class="btn-ghost btn-sm" style="width:auto" onclick="viewStaffDoc('+id+',\''+k+'\',\''+label.replace(/'/g,'')+'\')">Ansehen</button></div></div>').join('')
        : '')+

      '<div class="section-label">Zugangsdaten</div>'+
      (s.hasLogin
        ? '<p style="font-size:13.5px;color:var(--good);margin-bottom:12px">✓ Login aktiv: <b>'+(s.login||s.email)+'</b></p><label>Passwort zurücksetzen</label><input id="es_pass" type="password" placeholder="Neues Passwort (optional)">'
        : '<p style="font-size:13.5px;color:var(--muted);margin-bottom:12px">Noch kein Login. Hier erstellen und an den Mitarbeiter senden.</p><div class="form-row"><div><label>Login (E-Mail)</label><input id="es_login" value="'+s.email+'"></div><div><label>Startpasswort</label><input id="es_pass" type="text" placeholder="z. B. Start2026!"></div></div>')+
    '</div>';
  let foot='<button class="btn-ghost" onclick="closeModal()">Abbrechen</button>';
  if(id!==null && !s.hasLogin) foot+='<button class="btn-primary" style="width:auto;padding:11px 18px;background:var(--blue)" onclick="createLogin('+id+')">🔑 Login erstellen & senden</button>';
  foot+='<button class="btn-primary" style="width:auto;padding:11px 20px" onclick="saveStaff()">Speichern</button>';
  document.getElementById('modalFoot').innerHTML=foot;
  openModal();
}
function gatherStaff(s){
  s.first=val('es_first')||s.first;s.last=val('es_last')||s.last;s.role=val('es_role')||s.role;
  s.phone=val('es_phone');s.email=val('es_email');
  s.skills=[...document.querySelectorAll('#es_skills .check.on')].map(e=>e.textContent);
  const st=document.querySelector('#es_status button.on');if(st)s.status=st.dataset.v;
  s.intern=s.intern||{};
  s.intern.birth=val('es_birth');s.intern.address=val('es_address');s.intern.taxId=val('es_taxId');
  s.intern.taxClass=document.getElementById('es_taxClass').value;
  s.intern.employment=document.getElementById('es_employment').value;
  s.intern.kvNr=val('es_kvNr');s.intern.kasse=val('es_kasse');
  s.intern.citizenship=val('es_citizenship');s.intern.iban=val('es_iban');
}
function saveStaff(){
  if(editingStaffId!==null){
    const s=staff.find(x=>x.id===editingStaffId);gatherStaff(s);
    if(CLOUD) cloudUpdate('mitarbeiter',s.id,staffToRow(s));
    closeModal();toast('Mitarbeiterdaten gespeichert');
  }else{
    const s={id:nextStaffId++,maxHours:20,days:[],window:'Flexibel',hasLogin:false,login:'',skills:[],color:nextColor(),wage:14.00,bonus:{earned:0,pending:100,reason:'Führungszeugnis + Erste-Hilfe ausstehend'},daysWorked:0,intern:{}};
    gatherStaff(s);
    if(!s.first&&!s.last){toast('Bitte Namen eingeben',true);return;}
    const login=val('es_login');const pass=val('es_pass');
    if(login&&pass){s.hasLogin=true;s.login=login;}
    staff.push(s);
    if(CLOUD){ cloudInsert('mitarbeiter',staffToRow(s)).then(r=>{ if(r)s.id=r.id; }); }
    closeModal();toast('Mitarbeiter hinzugefügt');
  }
  document.getElementById('modalBox').classList.remove('wide');
  renderAdmin('staff');
}
function createLogin(id){
  const s=staff.find(x=>x.id===id);
  const login=val('es_login')||s.email;const pass=val('es_pass');
  if(!pass){toast('Bitte ein Startpasswort vergeben',true);return;}
  s.hasLogin=true;s.login=login;
  if(CLOUD) cloudUpdate('mitarbeiter',s.id,staffToRow(s));
  closeModal();document.getElementById('modalBox').classList.remove('wide');
  toast('Login erstellt & an '+s.first+' versendet');
  renderAdmin('staff');
}

/* ============ KUNDEN: FORM + BEARBEITEN ============ */
