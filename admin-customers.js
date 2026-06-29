function customerFormHTML(c){
  const isNew=!c;
  c=c||{first:'',last:'',area:'',street:'',houseNo:'',plz:'',city:'',phoneMobile:'',phoneLandline:'',need:[],freqNum:1,freqUnit:'pro Woche',timeWindows:[],pets:[],pgrad:'1',contactName:'',contactPhone:'',noContact:false,noNotes:false,notes:'',insuranceType:'gesetzlich',beihilfePct:'',intern:{kvNr:'',kasse:'',budget:'',budgetUsed:''}};
  const it=c.intern||{};
  const tw=c.timeWindows||[];
  const pets=c.pets||[];
  const ins=c.insuranceType||'gesetzlich';
  return '<div class="panel"><div class="panel-body content-form" style="padding-top:18px">'+
    '<div class="section-label" style="margin-top:0">Stammdaten</div>'+
    '<div class="form-row"><div><label>Vorname *</label><input id="nc_first" value="'+(c.first||'')+'"></div>'+
    '<div><label>Nachname *</label><input id="nc_last" value="'+(c.last||'')+'"></div></div>'+
    '<div class="form-row"><div style="flex:3"><label>Straße *</label><input id="nc_street" value="'+(c.street||'')+'"></div>'+
    '<div style="flex:1"><label>Hausnr. *</label><input id="nc_houseno" value="'+(c.houseNo||'')+'"></div></div>'+
    '<div class="form-row"><div style="flex:1"><label>PLZ *</label><input id="nc_plz" value="'+(c.plz||'')+'"></div>'+
    '<div style="flex:2"><label>Ort *</label><input id="nc_city" value="'+(c.city||'')+'"></div></div>'+
    '<label>Gebiet / Stadtteil</label><input id="nc_area" value="'+(c.area||'')+'" placeholder="z. B. Hannover-Linden">'+
    '<div class="form-row"><div><label>Telefon (Mobil)</label><input id="nc_mobile" value="'+(c.phoneMobile||'')+'"></div>'+
    '<div><label>Telefon (Festnetz)</label><input id="nc_landline" value="'+(c.phoneLandline||'')+'"></div></div>'+
    '<div class="form-row"><div><label>Pflegegrad</label><select id="nc_pgrad">'+['1','2','3','4','5'].map(p=>'<option '+(c.pgrad===p?'selected':'')+'>'+p+'</option>').join('')+'</select></div>'+
    '<div><label>Geburtsdatum</label><input id="nc_birth" type="date" value="'+(c.birth||'')+'"></div></div>'+

    '<label>Benötigte Leistungen</label>'+
    '<div class="checks" id="nc_skills">'+SKILLS.map(s=>'<span class="check '+(c.need.includes(s)?'on':'')+'" onclick="this.classList.toggle(\'on\')">'+s+'</span>').join('')+'</div>'+
    '<label>Häufigkeit</label>'+
    '<div class="input-with-select"><input id="nc_freqNum" type="number" min="1" value="'+(c.freqNum||1)+'" placeholder="Anzahl">'+
      '<select id="nc_freqUnit">'+FREQ_UNITS.map(u=>'<option '+(c.freqUnit===u?'selected':'')+'>'+u+'</option>').join('')+'</select></div>'+
    '<div style="height:14px"></div>'+
    '<label>Zeitfenster</label>'+
    '<div class="checks" id="nc_window">'+['Morgens','Mittags','Abends'].map(w=>'<span class="check '+(tw.includes(w)?'on':'')+'" onclick="this.classList.toggle(\'on\')">'+w+'</span>').join('')+'</div>'+
    '<label>Haustiere</label>'+
    '<div class="checks" id="nc_pets">'+['Hund','Katze','Andere Kleintiere'].map(p=>'<span class="check '+(pets.includes(p)?'on':'')+'" onclick="this.classList.toggle(\'on\')">'+p+'</span>').join('')+'</div>'+

    '<div class="section-label">Kontaktperson (Angehörige)</div>'+
    '<div class="confirm-box" style="background:#fff;border-color:var(--line);margin-bottom:10px" onclick="toggleCustChk(\'nc_noContact\')"><input type="checkbox" id="nc_noContact" '+(c.noContact?'checked':'')+' onclick="event.stopPropagation();custNoContact(this.checked)"><label>Keine Kontaktperson vorhanden</label></div>'+
    '<div id="nc_contactFields" style="display:'+(c.noContact?'none':'block')+'">'+
      '<div class="form-row"><div><label>Name</label><input id="nc_contactName" value="'+(c.contactName||'')+'"></div>'+
      '<div><label>Telefonnummer</label><input id="nc_contactPhone" value="'+(c.contactPhone||'')+'"></div></div>'+
    '</div>'+

    '<div class="section-label">Hinweise</div>'+
    '<div class="confirm-box" style="background:#fff;border-color:var(--line);margin-bottom:10px" onclick="toggleCustChk(\'nc_noNotes\')"><input type="checkbox" id="nc_noNotes" '+(c.noNotes?'checked':'')+' onclick="event.stopPropagation();custNoNotes(this.checked)"><label>Keine Hinweise</label></div>'+
    '<div id="nc_notesField" style="display:'+(c.noNotes?'none':'block')+'">'+
      '<textarea id="nc_notes" rows="2" placeholder="z. B. Schlüssel beim Nachbarn, Besonderheiten">'+(c.notes&&c.notes!=='—'?c.notes:'')+'</textarea>'+
    '</div>'+

    '<div class="section-label">Krankenversicherung</div>'+
    '<label>Versicherungsart</label>'+
    '<div class="seg" id="nc_insType">'+[['gesetzlich','Gesetzlich versichert'],['privat','Privat versichert'],['beihilfe','Beihilfeberechtigt']].map(([v,l])=>'<button data-v="'+v+'" class="'+(ins===v?'on':'')+'" onclick="custInsPick(this)">'+l+'</button>').join('')+'</div>'+
    '<div style="height:12px"></div>'+
    '<div id="nc_beihilfeBox" style="display:'+(ins==='beihilfe'?'block':'none')+'"><label>Beihilfe-Anteil (%)</label><input id="nc_beihilfePct" type="number" min="0" max="100" value="'+(c.beihilfePct||'')+'" placeholder="z. B. 50"></div>'+
    '<div id="nc_kvBox" style="display:'+(ins==='privat'?'none':'block')+'">'+
      '<div class="form-row"><div><label>KV-Nummer</label><input id="nc_kvNr" value="'+(it.kvNr||'')+'" placeholder="1 Buchstabe + 9 Ziffern"></div>'+
      '<div><label>Krankenkasse</label><input id="nc_kasse" value="'+(it.kasse||'')+'"></div></div>'+
    '</div>'+
    '<div class="form-row"><div><label>Budget (§45b)</label><input id="nc_budget" value="'+(it.budget||'')+'" placeholder="z. B. 131 €/Monat"></div>'+
    '<div><label>Davon genutzt</label><input id="nc_budgetUsed" value="'+(it.budgetUsed||'')+'" placeholder="z. B. 40 €"></div></div>'+

    (isNew
      ? '<button class="btn-primary" style="width:auto;padding:12px 24px;margin-top:8px" onclick="createCustomer()">Anlegen & als Auftrag freigeben</button>'
      : '<button class="btn-primary" style="width:auto;padding:12px 24px;margin-top:8px" onclick="updateCustomer('+c.id+')">Änderungen speichern</button>')+
  '</div></div>';
}
function toggleCustChk(id){ const el=document.getElementById(id); el.checked=!el.checked; if(id==='nc_noContact')custNoContact(el.checked); if(id==='nc_noNotes')custNoNotes(el.checked); }
function custNoContact(checked){ document.getElementById('nc_contactFields').style.display=checked?'none':'block'; }
function custNoNotes(checked){ document.getElementById('nc_notesField').style.display=checked?'none':'block'; }
function custInsPick(btn){
  document.querySelectorAll('#nc_insType button').forEach(b=>b.classList.remove('on'));
  btn.classList.add('on');
  const v=btn.dataset.v;
  document.getElementById('nc_beihilfeBox').style.display=(v==='beihilfe')?'block':'none';
  document.getElementById('nc_kvBox').style.display=(v==='privat')?'none':'block';
}
function gatherCustomer(c){
  c.first=val('nc_first');c.last=val('nc_last');
  c.street=val('nc_street');c.houseNo=val('nc_houseno');c.plz=val('nc_plz');c.city=val('nc_city');
  c.address=((c.street+' '+c.houseNo).trim()+', '+(c.plz+' '+c.city).trim()).replace(/^, |, $/,'')||'—';
  c.area=val('nc_area')||c.city||'—';
  c.phoneMobile=val('nc_mobile');c.phoneLandline=val('nc_landline');
  c.phone=c.phoneMobile||c.phoneLandline||'—';
  c.pgrad=document.getElementById('nc_pgrad').value;
  c.birth=val('nc_birth');
  c.need=[...document.querySelectorAll('#nc_skills .check.on')].map(e=>e.textContent);
  if(!c.need.length)c.need=['Haushaltshilfe'];
  c.freqNum=parseInt(document.getElementById('nc_freqNum').value)||1;
  c.freqUnit=document.getElementById('nc_freqUnit').value;
  c.timeWindows=[...document.querySelectorAll('#nc_window .check.on')].map(e=>e.textContent);
  c.window=c.timeWindows.join(', ')||'flexibel';
  c.pets=[...document.querySelectorAll('#nc_pets .check.on')].map(e=>e.textContent);
  c.pet=c.pets.join(', ')||'—';
  c.noContact=document.getElementById('nc_noContact').checked;
  c.contactName=c.noContact?'':val('nc_contactName');
  c.contactPhone=c.noContact?'':val('nc_contactPhone');
  c.contact=c.noContact?'Keine Kontaktperson':((c.contactName||'')+(c.contactPhone?': '+c.contactPhone:''))||'—';
  c.noNotes=document.getElementById('nc_noNotes').checked;
  c.notes=c.noNotes?'Keine Hinweise':(val('nc_notes')||'—');
  const insBtn=document.querySelector('#nc_insType button.on');
  c.insuranceType=insBtn?insBtn.dataset.v:'gesetzlich';
  c.beihilfePct=(c.insuranceType==='beihilfe')?val('nc_beihilfePct'):'';
  c.intern=c.intern||{};
  c.intern.kvNr=(c.insuranceType==='privat')?'':val('nc_kvNr');
  c.intern.kasse=(c.insuranceType==='privat')?'':val('nc_kasse');
  c.intern.budget=val('nc_budget');c.intern.budgetUsed=val('nc_budgetUsed');
}
function createCustomer(){
  const c={id:nextCustomerId++,status:'Interessent',intern:{}};
  gatherCustomer(c);
  // Sicherheitsmechanismus: Pflichtfelder prüfen, sonst keine Freigabe
  const missing=[];
  if(!c.first||!c.last) missing.push('Name');
  if(!c.address||c.address==='—') missing.push('Adresse');
  if(!c.phone||c.phone==='—') missing.push('Telefon');
  if(!c.need||!c.need.length) missing.push('Leistung');
  if(missing.length){toast('Kunde unvollständig – fehlt: '+missing.join(', '),true);return;}
  const job={id:nextJobId++,customerId:c.id,title:(c.need[0]||'Neuer Einsatz')+' – '+c.last,skills:c.need.slice(),status:'available',assignedTo:null,rejectedBy:[]};
  if(CLOUD){
    (async()=>{
      const cRow=await cloudInsert('kunden',custToRow(c));
      if(cRow){ c.id=cRow.id; job.customerId=cRow.id;
        const jRow=await cloudInsert('auftraege',jobToRow(job)); if(jRow)job.id=jRow.id;
      }
      customers.unshift(c);jobs.unshift(job);
      toast('Kunde gespeichert & als Auftrag freigegeben');renderAdmin('jobs');
    })();
  }else{
    customers.unshift(c);jobs.unshift(job);
    toast('Kunde korrekt angelegt & als Auftrag freigegeben');renderAdmin('jobs');
  }
}
function editCustomer(id){
  const c=custById(id);
  document.getElementById('modalBox').classList.add('wide');
  document.getElementById('modalTitle').textContent='Kunde bearbeiten';
  let docsHtml='<div class="section-label">📁 Dokumente (Kunden-Ordner)</div>';
  // Abtretung
  if(c.abtretung){
    docsHtml+='<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>📄 Abtretungserklärung</b><div class="li-sub">Unterschrieben am '+fmtDate(c.abtretung.date)+'</div></div><div style="display:flex;gap:7px;align-items:center"><img src="'+c.abtretung.signature+'" style="height:34px;border:1px solid var(--line);border-radius:6px;background:#fff"><button class="btn-primary btn-sm" style="width:auto" onclick="downloadAbtretung('+c.id+')">⬇ PDF</button></div></div>';
  }
  // Leistungsnachweise
  const lns=c.leistungsnachweise||[];
  if(lns.length){
    lns.forEach((ln,i)=>{
      docsHtml+='<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>📄 Leistungsnachweis</b><div class="li-sub">'+fmtDate(ln.date)+' · '+ln.task+' · '+(ln.mins/60).toFixed(2).replace('.',',')+' Std.</div></div><div style="display:flex;gap:7px;align-items:center"><img src="'+ln.signature+'" style="height:34px;border:1px solid var(--line);border-radius:6px;background:#fff"><button class="btn-primary btn-sm" style="width:auto" onclick="downloadCustLN('+c.id+','+i+')">⬇ PDF</button></div></div>';
    });
  }
  if(!c.abtretung && !lns.length){ docsHtml+='<p style="color:var(--muted);font-size:13px;padding:4px 0">Noch keine erstellten Dokumente. Abtretung oder Leistungsnachweis entstehen über den Einsatz-Abschluss.</p>'; }

  // Externe Dokumente (hochgeladen)
  const ext=c.extDocs||[];
  docsHtml+='<div class="section-label">📎 Externe Dokumente</div>';
  if(ext.length){
    ext.forEach((d,i)=>{
      const isImg=(d.type||'').indexOf('image')===0;
      docsHtml+='<div class="list-row" style="padding:11px 0;border-bottom:1px solid var(--line)"><div class="li-main"><b>'+(isImg?'🖼️':'📄')+' '+d.name+'</b><div class="li-sub">Hochgeladen am '+fmtDate(d.date)+(d.size?' · '+d.size:'')+'</div></div><div style="display:flex;gap:7px;align-items:center"><button class="btn-ghost btn-sm" onclick="openExtDoc('+c.id+','+i+')">Ansehen</button><button class="btn-danger-ghost btn-sm" style="width:auto" onclick="deleteExtDoc('+c.id+','+i+')">Entfernen</button></div></div>';
    });
  }else{
    docsHtml+='<p style="color:var(--muted);font-size:13px;padding:4px 0">Noch keine externen Dokumente hochgeladen.</p>';
  }
  docsHtml+='<div class="upload-box" style="margin-top:10px" onclick="document.getElementById(\'extFileInput\').click()"><div class="ub-ic">⬆️</div><div class="ub-t">Externes Dokument hochladen</div><div class="ub-s">PDF, JPG oder PNG · z. B. Pflegegrad-Bescheid, Vollmacht</div></div>'+
    '<input type="file" id="extFileInput" accept="application/pdf,image/*" style="display:none" onchange="uploadExtDoc('+c.id+',this)">';

  document.getElementById('modalBody').innerHTML=customerFormHTML(c).replace('<div class="panel"><div class="panel-body content-form" style="padding-top:18px">','<div class="content-form">').replace(/<\/div><\/div>$/,'</div>')+docsHtml;
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="closeModal()">Schließen</button>'+
    '<button class="btn-ghost" style="width:auto" onclick="startAbtretung('+c.id+')">+ Abtretung</button>'+
    '<button class="btn-primary" style="width:auto;padding:10px 18px" onclick="updateCustomer('+c.id+')">Speichern</button>';
  openModal();
}
function downloadCustLN(custId, idx){
  const cu=custById(custId); if(!cu||!cu.leistungsnachweise||!cu.leistungsnachweise[idx])return;
  const ln=cu.leistungsnachweise[idx];
  const doc=buildLeistungsnachweisPdf({
    name:fullName(cu), versNr:(cu.intern&&cu.intern.kvNr)||cu.kvNr||'',
    rows:[{date:fmtDate(ln.date), leistung:ln.task, stunden:ln.mins/60, preis:STUNDENSATZ}],
    signature:ln.signature, ort:(cu.city||cu.area||''), date:ln.date
  });
  if(doc) doc.save(('Leistungsnachweis_'+fullName(cu)+'_'+ln.date).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
}
/* ---- Externe Dokumente im Kunden-Ordner ---- */
function uploadExtDoc(custId, input){
  const cu=custById(custId); if(!cu)return;
  const file=input.files&&input.files[0]; if(!file)return;
  // Größenbegrenzung (Demo): 4 MB, da als Daten-URL im Browser gehalten
  if(file.size>4*1024*1024){ toast('Datei zu groß (max. 4 MB in der Demo)',true); input.value=''; return; }
  const reader=new FileReader();
  reader.onload=function(e){
    cu.extDocs=cu.extDocs||[];
    const kb=Math.round(file.size/1024);
    cu.extDocs.push({name:file.name, type:file.type, size:(kb>1024?(kb/1024).toFixed(1)+' MB':kb+' KB'), date:todayISO(), data:e.target.result});
    // HINWEIS für Entwickler: Im Echtbetrieb die Datei in einen geschützten
    // Datei-Speicher (Supabase Storage) hochladen statt als Daten-URL im Browser.
    toast('Dokument hochgeladen: '+file.name);
    editCustomer(custId); // Ansicht aktualisieren
  };
  reader.readAsDataURL(file);
}
function openExtDoc(custId, idx){
  const cu=custById(custId); if(!cu||!cu.extDocs||!cu.extDocs[idx])return;
  const d=cu.extDocs[idx];
  const w=window.open();
  if(w){
    if((d.type||'').indexOf('image')===0){ w.document.write('<title>'+d.name+'</title><body style="margin:0;background:#111"><img src="'+d.data+'" style="max-width:100%;display:block;margin:auto"></body>'); }
    else { w.document.write('<title>'+d.name+'</title><iframe src="'+d.data+'" style="border:0;width:100vw;height:100vh"></iframe>'); }
  }
}
function deleteExtDoc(custId, idx){
  const cu=custById(custId); if(!cu||!cu.extDocs)return;
  cu.extDocs.splice(idx,1);
  toast('Dokument entfernt');
  editCustomer(custId);
}
function updateCustomer(id){
  const c=custById(id);gatherCustomer(c);
  if(CLOUD) cloudUpdate('kunden',id,custToRow(c));
  closeModal();document.getElementById('modalBox').classList.remove('wide');
  toast('Kundendaten gespeichert');renderAdmin('customers');
}
/* ============ BEWERBUNGS-GENEHMIGUNG (ADMIN) ============ */
