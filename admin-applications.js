function showApplication(id){
  const a=applications.find(x=>x.id===id);
  document.getElementById('modalBox').classList.add('wide');
  document.getElementById('modalTitle').textContent='Bewerbung: '+fullName(a);
  const di=a.docImages||{};
  const fileRow=(label,ok,imgKey)=>{
    const hasImg=imgKey&&di[imgKey];
    return '<div class="reveal-row"><span class="k">'+label+'</span><span class="v" style="display:flex;align-items:center;gap:8px;justify-content:flex-end">'+(ok?'<span class="tag green">✓ hochgeladen</span>':'<span class="tag red">fehlt</span>')+(hasImg?'<button class="btn-ghost btn-sm" style="width:auto" onclick="viewDocImage(\''+imgKey+'\','+a.id+',\''+label.replace(/'/g,'')+'\')">Ansehen</button>':'')+'</span></div>';
  };
  const declRow=(label,ok)=>'<div class="reveal-row"><span class="k">'+label+'</span><span class="v">'+(ok?'<span class="tag green">✓ bestätigt</span>':'<span class="tag grey">—</span>')+'</span></div>';
  const contractRow=(name)=>{
    const sig=(a.signatures&&a.signatures[name])||null;
    return '<div class="reveal-row"><span class="k">'+name+'</span><span class="v" style="display:flex;align-items:center;gap:8px;justify-content:flex-end">'+(a.docs[name]?'<span class="tag green">✓ signiert</span>':'<span class="tag red">offen</span>')+(a.docs[name]?'<button class="btn-ghost btn-sm" style="width:auto" onclick="viewAppContract('+a.id+',\''+name.replace(/'/g,'')+'\')">Ansehen</button>':'')+'</span></div>';
  };
  const PFB_LABELS={birth:'Geburtsdatum',birthplace:'Geburtsort',address:'Anschrift',maritalStatus:'Familienstand',taxId:'Steuer-ID',taxClass:'Steuerklasse',kvNr:'KV-Nummer',kasse:'Krankenkasse',iban:'IBAN',employment:'Anstellungsart',otherJob:'Weitere Beschäftigung'};
  const q=a.questionnaire||{};const decl=a.declaration||{};
  const pfbRows=Object.keys(PFB_LABELS).filter(k=>q[k]).map(k=>'<div class="reveal-row"><span class="k">'+PFB_LABELS[k]+'</span><span class="v">'+q[k]+'</span></div>').join('')||'<div style="color:var(--muted);font-size:13px;padding:4px 0">Keine Angaben.</div>';
  document.getElementById('modalBody').innerHTML=
    statusStepper(a.status)+
    '<div class="section-label" style="margin-top:18px">Persönliche Daten</div>'+
    '<div class="reveal-row"><span class="k">Name</span><span class="v">'+fullName(a)+'</span></div>'+
    (a.gender?'<div class="reveal-row"><span class="k">Geschlecht</span><span class="v">'+a.gender+'</span></div>':'')+
    '<div class="reveal-row"><span class="k">E-Mail</span><span class="v">'+a.email+'</span></div>'+
    '<div class="reveal-row"><span class="k">Telefon</span><span class="v">'+a.phone+'</span></div>'+
    '<div class="reveal-row"><span class="k">Gebiet</span><span class="v">'+a.area+'</span></div>'+
    '<div class="reveal-row"><span class="k">Staatsbürgerschaft</span><span class="v">'+a.citizenship+'</span></div>'+
    '<div class="reveal-row"><span class="k">Fähigkeiten</span><span class="v">'+a.skills.join(', ')+'</span></div>'+
    '<div style="margin-top:10px;font-size:14px"><b>Motivation:</b> '+a.motivation+'</div>'+
    '<div class="section-label">Personalfragebogen</div>'+pfbRows+
    '<div class="section-label">Erklärung & Nachweise</div>'+
    declRow('Keine Vorstrafen',decl.noCrime)+declRow('Führungszeugnis wird nachgereicht',decl.bringCertificate)+declRow('Erste-Hilfe-Kurs wird absolviert',decl.bringFirstAid)+declRow('KV-Karte wird eingesendet',decl.sendKvCard)+
    '<div class="section-label">Signierte Verträge</div>'+contractRow('Arbeitsvertrag')+contractRow('Datenschutzvertrag')+contractRow('NDA')+contractRow('Haftungserklärung')+
    '<div class="section-label">Identität & Bestätigungen</div>'+
    fileRow('Personalausweis Vorderseite',a.idFront,'idFront')+fileRow('Personalausweis Rückseite',a.idBack,'idBack')+fileRow('Selfie',a.selfie,'selfie')+
    (a.isStudent?fileRow('Immatrikulationsbescheinigung',a.enrollmentFile,'enrollment'):'')+
    '<div class="reveal-row"><span class="k">AGB & Datenschutz gelesen</span><span class="v">'+(a.agb?'<span class="tag green">✓ bestätigt</span>':'<span class="tag red">offen</span>')+'</span></div>';
  let foot='<button class="btn-ghost" onclick="closeModal()">Schließen</button>';
  if(a.status==='neu') foot+='<button class="btn-primary" style="width:auto;padding:11px 18px" onclick="approveApp('+id+')">✓ Genehmigen</button>';
  if(a.status==='geprüft') foot+='<button class="btn-primary" style="width:auto;padding:11px 18px;background:var(--blue)" onclick="sendAppLogin('+id+')">🔑 Zugangsdaten erstellen & senden</button>';
  if(a.status==='versendet') foot+='<span style="font-size:13.5px;color:var(--good);align-self:center">✓ Mitarbeiter ist aktiv – kann sich anmelden</span>';
  document.getElementById('modalFoot').innerHTML=foot;
  openModal();
}
function viewStaffDoc(staffId, key, label){
  const s=staff.find(x=>x.id===staffId); if(!s||!s.docImages||!s.docImages[key])return;
  const data=s.docImages[key];
  const isPdf=(data||'').indexOf('data:application/pdf')===0;
  document.getElementById('modalTitle').textContent=label;
  document.getElementById('modalBody').innerHTML= isPdf
    ? '<iframe src="'+data+'" style="width:100%;height:70vh;border:1px solid var(--line);border-radius:8px"></iframe>'
    : '<img src="'+data+'" style="width:100%;max-height:72vh;object-fit:contain;border-radius:8px;background:#f3f0fb">';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="editStaff('+staffId+')">← Zurück zum Profil</button>';
  openModal();
}
function viewDocImage(imgKey, appId, label){
  const a=applications.find(x=>x.id===appId); if(!a||!a.docImages||!a.docImages[imgKey])return;
  const data=a.docImages[imgKey];
  const isPdf=(data||'').indexOf('application/pdf')>-1 || (data||'').indexOf('data:application/pdf')===0;
  document.getElementById('modalTitle').textContent=label;
  document.getElementById('modalBody').innerHTML= isPdf
    ? '<iframe src="'+data+'" style="width:100%;height:70vh;border:1px solid var(--line);border-radius:8px"></iframe>'
    : '<img src="'+data+'" style="width:100%;max-height:72vh;object-fit:contain;border-radius:8px;background:#f3f0fb">';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="showApplication('+appId+')">← Zurück zur Bewerbung</button>';
  openModal();
}
function viewAppContract(appId, name){
  const a=applications.find(x=>x.id===appId); if(!a)return;
  const sig=(a.signatures&&a.signatures[name])||null;
  const txt=(typeof DOC_TEXTS!=='undefined'&&DOC_TEXTS[name])?DOC_TEXTS[name]:name;
  document.getElementById('modalTitle').textContent=name;
  document.getElementById('modalBody').innerHTML=
    '<div class="doc-text" style="max-height:52vh;white-space:pre-wrap">'+txt+'</div>'+
    (sig?'<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><div style="font-size:12px;color:var(--muted);font-weight:600">Unterschrift – '+fullName(a)+'</div><img src="'+sig+'" style="height:60px;margin-top:6px;border:1px solid var(--line);border-radius:7px;background:#fff"></div>':'<p style="color:var(--muted);font-size:13px;margin-top:10px">Keine Unterschrift hinterlegt.</p>');
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="showApplication('+appId+')">← Zurück zur Bewerbung</button>';
  openModal();
}
function statusStepper(status){
  const steps=[['neu','Eingegangen'],['geprüft','Genehmigt'],['versendet','Zugang gesendet']];
  const order=['neu','geprüft','versendet'];const cur=order.indexOf(status);
  return '<div style="display:flex;gap:8px;align-items:center;background:var(--bg);border-radius:10px;padding:12px 14px">'+
    steps.map(([k,label],i)=>{
      const done=i<=cur;
      return '<div style="flex:1;text-align:center"><div style="width:26px;height:26px;border-radius:50%;margin:0 auto 5px;display:grid;place-items:center;font-size:13px;font-weight:700;background:'+(done?'var(--good)':'#dde7e7')+';color:'+(done?'#fff':'var(--muted)')+'">'+(done?'✓':(i+1))+'</div><div style="font-size:11.5px;font-weight:600;color:'+(done?'var(--good)':'var(--muted)')+'">'+label+'</div></div>'+(i<2?'<div style="flex:0 0 22px;height:2px;background:'+(i<cur?'var(--good)':'#dde7e7')+'"></div>':'');
    }).join('')+'</div>';
}
function approveApp(id){
  const a=applications.find(x=>x.id===id);a.status='geprüft';
  if(CLOUD) cloudUpdate('bewerbungen',id,{status:'geprüft'});
  closeModal();document.getElementById('modalBox').classList.remove('wide');
  toast('Bewerbung genehmigt – wartet auf Zugangsdaten');renderAdmin('applications');
}
function sendAppLogin(id){
  const a=applications.find(x=>x.id===id);
  // Signierte Verträge für die Mitarbeiter-Akte aufbereiten
  const signedDocs=Object.keys(a.docs||{}).filter(d=>a.docs[d]).map(d=>({name:d,signedDate:todayISO(),signature:(a.signatures&&a.signatures[d])||null}));
  // Bewerber wird zum aktiven Mitarbeiter
  const newStaff={id:nextStaffId++,first:a.first,last:a.last,role:a.skills.includes('Betreuung')?'Betreuungskraft':'Haushaltshilfe',status:'aktiv',skills:a.skills.slice(),area:a.area,phone:a.phone,email:a.email,maxHours:20,days:[],window:'Flexibel',hasLogin:true,login:a.email,color:nextColor(),wage:14.00,bonus:{earned:0,pending:100,reason:'Führungszeugnis + Erste-Hilfe ausstehend'},daysWorked:0,contracts:signedDocs,
    docImages:Object.assign({}, a.docImages||{}), isStudent:!!a.isStudent,
    intern:{birth:(a.questionnaire&&a.questionnaire.birth)||'',address:(a.questionnaire&&a.questionnaire.address)||'',taxId:(a.questionnaire&&a.questionnaire.taxId)||'',taxClass:(a.questionnaire&&a.questionnaire.taxClass)||'I',kvNr:(a.questionnaire&&a.questionnaire.kvNr)||'',kasse:(a.questionnaire&&a.questionnaire.kasse)||'',employment:(a.questionnaire&&a.questionnaire.employment)||'Minijob',citizenship:a.citizenship,iban:(a.questionnaire&&a.questionnaire.iban)||''}};

  if(USE_EDGE_FUNCTION){
    // ---- ECHTE automatische Konto-Erstellung über die Edge Function ----
    toast('Erstelle Login-Konto für '+a.first+' …');
    callCreateStaffAccount({
      email:a.email, first:a.first, last:a.last, role:'staff',
      mitarbeiter: staffToRow(newStaff)
    }).then(resp=>{
      a.status='versendet';
      if(resp.mitarbeiter_id) newStaff.id=resp.mitarbeiter_id;
      staff.push(newStaff);
      if(CLOUD){ cloudUpdate('bewerbungen',id,{status:'versendet'});
        (async()=>{ for(const ct of signedDocs){ await cloudInsert('vertraege',{mitarbeiter_id:newStaff.id,name:ct.name,signed_date:ct.signedDate,signature:ct.signature}); } })();
      }
      closeModal();document.getElementById('modalBox').classList.remove('wide');
      toast('Login-Konto erstellt – Einladung an '+a.email+' gesendet');renderAdmin('applications');
    }).catch(err=>{
      toast('Fehler bei der Konto-Erstellung: '+err.message,true);
    });
    return;
  }

  // ---- TEST-Weg (ohne Edge Function): Profil lokal anlegen ----
  a.status='versendet';
  staff.push(newStaff);
  if(CLOUD){
    cloudUpdate('bewerbungen',id,{status:'versendet'});
    (async()=>{ const r=await cloudInsert('mitarbeiter',staffToRow(newStaff)); if(r){ newStaff.id=r.id; for(const ct of signedDocs){ await cloudInsert('vertraege',{mitarbeiter_id:r.id,name:ct.name,signed_date:ct.signedDate,signature:ct.signature}); } } })();
  }
  closeModal();document.getElementById('modalBox').classList.remove('wide');
  toast('Profil angelegt. Login-Konto in Supabase mit dieser E-Mail anlegen: '+a.email);renderAdmin('applications');
}
/* ============ MITARBEITER VIEWS ============ */
