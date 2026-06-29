function navItem(id,icon,label,active,badge,blue){
  return '<button class="nav-item '+(active?'active':'')+'" onclick="'+(currentRole==='admin'?'renderAdmin':'renderStaff')+'(\''+id+'\')"><span class="ic">'+icon+'</span>'+label+(badge?'<span class="badge'+(blue?' blue':'')+'">'+badge+'</span>':'')+'</button>';
}
function buildAdminNav(active){
  const open=jobs.filter(j=>j.status==='available').length;
  const newApps=applications.filter(a=>a.status!=='aktiv').length;
  document.getElementById('sidebar').innerHTML=
    '<div class="nav-group">Übersicht</div>'+
    navItem('dashboard','◧','Dashboard',active==='dashboard')+
    navItem('jobs','◎','Aufträge',active==='jobs',open)+
    '<div class="nav-group">Verwaltung</div>'+
    navItem('staff','♟','Mitarbeiter',active==='staff')+
    navItem('applications','📥','Bewerbungen',active==='applications',newApps||'',true)+
    navItem('customers','◍','Kunden',active==='customers')+
    navItem('newcustomer','＋','Kunde anlegen',active==='newcustomer')+
    '<div class="nav-group">Abwicklung</div>'+
    navItem('hours','⏱','Stundenzettel',active==='hours')+
    navItem('payroll','€','Lohnabrechnung',active==='payroll')+
    navItem('notes','✎','Notizen',active==='notes')+
    navItem('calendar','▦','Kalender',active==='calendar')+
    '<div class="nav-group">Konto</div>'+
    navItem('mylogin','🔑','Meine Zugangsdaten',active==='mylogin');
}
function buildStaffNav(active){
  const m=me();
  const mineCount=jobs.filter(j=>j.status==='assigned'&&j.assignedTo===myId).length;
  const open=availableForMe().length;
  document.getElementById('sidebar').innerHTML=
    '<div class="nav-group">Mein Tag</div>'+
    navItem('dashboard','◧','Dashboard',active==='dashboard')+
    navItem('board','◎','Auftragsbörse',active==='board',m.status==='aktiv'?open:'')+
    navItem('mine','✓','Meine Kunden',active==='mine',mineCount||'')+
    '<div class="nav-group">Organisation</div>'+
    navItem('calendar','▦','Meine Termine',active==='calendar')+
    navItem('hours','⏱','Stundenzettel',active==='hours')+
    navItem('payroll','€','Lohnabrechnung',active==='payroll')+
    '<div class="nav-group">Konto</div>'+
    navItem('profile','☺','Mein Profil',active==='profile')+
    navItem('contracts','📄','Meine Verträge',active==='contracts')+
    navItem('emergency','✆','Notfallnummer',active==='emergency');
}
/* ============ ADMIN VIEWS ============ */
function renderAdmin(view){
  buildAdminNav(view);
  document.getElementById('sidebar').classList.remove('open');
  const c=document.getElementById('content');
  const open=jobs.filter(j=>j.status==='available').length;
  const newApps=applications.filter(a=>a.status!=='aktiv').length;

  if(view==='dashboard'){
    // Kennzahlen berechnen
    const openTs=timesheets.filter(t=>t.status==='offen').length;
    const plannedAppts=appointments.length;
    // Umsatz = bestätigte Stunden * Kundensatz
    const confirmedMin=timesheets.filter(t=>t.status==='freigegeben').reduce((s,t)=>s+tsMinutes(t),0);
    const revenue=(confirmedMin/60*STUNDENSATZ);
    const bonusDue=staff.reduce((s,m)=>s+((m.bonus&&m.bonus.pending)||0),0);
    // 70-Tage: wer scheidet bald aus (>=60 Tage)
    const leaving=staff.filter(m=>(m.daysWorked||0)>=60);
    // Risiko: unzuverlässig (hohe Absagequote) und positiv
    const staffReject=(m)=>{const t=jobs.filter(j=>j.rejectedBy.includes(m.id)).length+jobs.filter(j=>j.assignedTo===m.id).length;const r=jobs.filter(j=>j.rejectedBy.includes(m.id)).length;return t>0?r/t:0;};
    const unreliable=staff.filter(m=>staffReject(m)>=0.5);
    const positive=staff.filter(m=>m.status==='aktiv'&&staffReject(m)===0&&(m.bonus&&m.bonus.earned>0));
    c.innerHTML=head('Dashboard','Überblick über Umsatz, Team und offene Punkte.')+
    '<div class="cards grid-4">'+
      stat('Umsatz (bestätigt)',revenue.toFixed(0)+' €','aus freigegebenen Stunden')+
      statClick('Geplante Termine',plannedAppts,'im Kalender',"renderAdmin('calendar')")+
      statClick('Offene Stundenzettel',openTs,'zu prüfen',"renderAdmin('hours')")+
      stat('Fällige Boni',bonusDue+' €','an Mitarbeiter auszuzahlen')+
    '</div><div style="height:16px"></div>'+
    '<div class="cards grid-2">'+
      statClick('Offene Aufträge',open,'warten auf Annahme',"renderAdmin('jobs')")+
      statClick('Neue Bewerbungen',newApps,'in Bearbeitung',"renderAdmin('applications')")+
    '</div><div style="height:18px"></div>'+
    // Meldungen
    '<div class="cards grid-2">'+
      '<div class="panel"><div class="panel-head"><h3>⚠️ Achtung erforderlich</h3></div><div class="panel-body" style="padding-top:8px">'+
        (leaving.length?leaving.map(m=>'<div class="list-row"><div class="li-main"><b>'+fullName(m)+'</b><div class="li-sub">70-Tage-Grenze: '+(m.daysWorked||0)+'/70 Tage – scheidet bald aus</div></div><span class="tag amber">'+(70-(m.daysWorked||0))+' Tage</span></div>').join(''):'')+
        (unreliable.length?unreliable.map(m=>'<div class="list-row"><div class="li-main"><b>'+fullName(m)+'</b><div class="li-sub">Hohe Absagequote ('+Math.round(staffReject(m)*100)+'%) – Termine begrenzen</div></div><span class="tag red">unzuverlässig</span></div>').join(''):'')+
        (!leaving.length&&!unreliable.length?'<p style="color:var(--muted);padding:8px 0">Keine Auffälligkeiten.</p>':'')+
      '</div></div>'+
      '<div class="panel"><div class="panel-head"><h3>⭐ Positive Mitarbeiter</h3></div><div class="panel-body" style="padding-top:8px">'+
        (positive.length?positive.map(m=>'<div class="list-row"><div class="li-main"><b>'+fullName(m)+'</b><div class="li-sub">Zuverlässig, keine Absagen · Bonus erhalten</div></div><span class="tag green">Top</span></div>').join(''):'<p style="color:var(--muted);padding:8px 0">Noch keine Auswertung.</p>')+
      '</div></div>'+
    '</div><div style="height:18px"></div>'+
    '<div class="panel"><div class="panel-head"><h3>Zuletzt freigegebene Aufträge</h3>'+
      '<button class="btn-ghost btn-sm" onclick="renderAdmin(\'jobs\')">Alle ansehen</button></div>'+
      '<div class="panel-body"><table><thead><tr><th>Auftrag</th><th>Kunde</th><th>Gebiet</th><th>Status</th></tr></thead><tbody>'+
      jobs.map(j=>{const cu=custById(j.customerId);return '<tr><td><b>'+j.title+'</b></td><td>'+(j.status==='available'?'<span style="color:var(--muted)">verdeckt</span>':(cu?fullName(cu):'—'))+'</td><td>'+(cu?cu.area:'—')+'</td><td>'+jobStatusTag(j)+'</td></tr>';}).join('')+
      '</tbody></table></div></div>';
  }

  if(view==='jobs'){
    c.innerHTML=head('Aufträge','Freigegebene Aufträge, wer angenommen hat und wer abgelehnt hat. Klick auf eine Zeile für die Kunden-Zusammenfassung.')+
    '<div class="panel"><div class="panel-body" style="padding-top:16px"><table>'+
      '<thead><tr><th>Auftrag</th><th>Gebiet</th><th>Status</th><th>Angenommen von</th><th>Abgelehnt von</th></tr></thead><tbody>'+
      jobs.map(j=>{const cu=custById(j.customerId);return '<tr class="clickable" onclick="showJobSummary('+j.id+')"><td><b>'+j.title+'</b><div style="color:var(--muted);font-size:12.5px">'+(cu?freqText(cu):'')+'</div></td>'+
        '<td>'+(cu?cu.area:'—')+'</td><td>'+jobStatusTag(j)+'</td>'+
        '<td>'+(j.status==='assigned'?'<b>'+staffName(j.assignedTo)+'</b>':'<span style="color:var(--muted)">noch frei</span>')+'</td>'+
        '<td>'+(j.rejectedBy.length?j.rejectedBy.map(id=>'<span class="reject-chip">✕ '+staffName(id)+'</span>').join(''):'<span style="color:var(--muted)">—</span>')+'</td></tr>';}).join('')+
      '</tbody></table></div></div>';
  }

  if(view==='staff'){
    const q=(staffSearch||'').toLowerCase();
    const filtered=staff.filter(s=>{
      if(staffFilter==='aktiv'&&s.status!=='aktiv')return false;
      if(staffFilter==='login'&&!s.hasLogin)return false;
      if(staffFilter==='nologin'&&s.hasLogin)return false;
      if(!q)return true;
      return (fullName(s)+' '+(s.role||'')+' '+(s.area||'')+' '+(s.skills||[]).join(' ')).toLowerCase().includes(q);
    });
    c.innerHTML=head('Mitarbeiter','Auf einen Mitarbeiter klicken, um alle Daten anzusehen und zu bearbeiten.')+
    '<div class="panel"><div class="panel-head"><h3>Team ('+filtered.length+(filtered.length!==staff.length?' von '+staff.length:'')+')</h3><button class="btn-primary btn-sm" style="width:auto" onclick="addStaff()">+ Mitarbeiter hinzufügen</button></div>'+
    '<div class="list-toolbar"><input class="search-input" id="staffSearchInput" placeholder="🔍 Mitarbeiter suchen (Name, Funktion, Gebiet)…" value="'+(staffSearch||'').replace(/"/g,'&quot;')+'" oninput="staffSearch=this.value;renderAdmin(\'staff\');setTimeout(()=>{const e=document.getElementById(\'staffSearchInput\');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}},0)">'+
      '<div class="filter-chips">'+[['alle','Alle'],['aktiv','Aktiv'],['login','Mit Login'],['nologin','Ohne Login']].map(([v,l])=>'<span class="chip '+(staffFilter===v?'on':'')+'" onclick="staffFilter=\''+v+'\';renderAdmin(\'staff\')">'+l+'</span>').join('')+'</div>'+
    '</div>'+
    '<div class="panel-body" style="padding-top:8px"><table>'+
      '<thead><tr><th>Name</th><th>Funktion</th><th>Gebiet</th><th>Login</th><th>Status</th></tr></thead><tbody>'+
      (filtered.length?filtered.map(s=>'<tr class="clickable" onclick="editStaff('+s.id+')"><td><span style="display:inline-block;width:11px;height:11px;border-radius:50%;background:'+(s.color||'#6d28d9')+';margin-right:7px"></span><b>'+fullName(s)+'</b></td><td>'+s.role+'</td><td>'+s.area+'</td><td>'+(s.hasLogin?'<span class="tag green">aktiv</span>':'<span class="tag grey">keine</span>')+'</td><td>'+statusTag(s.status)+'</td></tr>').join(''):'<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Keine Mitarbeiter gefunden.</td></tr>')+
      '</tbody></table></div></div>';
  }

  if(view==='applications'){
    const cols=[['neu','Neue Anfragen','amber'],['geprüft','Genehmigt – wartet auf Zugangsdaten','blue'],['versendet','Zugangsdaten versendet','green']];
    c.innerHTML=head('Bewerbungen','Eingegangene Mitarbeiter-Bewerbungen im Genehmigungs-Ablauf. Klick auf eine Bewerbung für alle Details, Verträge und Dokumente.')+
    cols.map(([st,label,color])=>{
      const list=applications.filter(a=>a.status===st);
      return '<div class="panel" style="margin-bottom:16px"><div class="panel-head"><h3>'+label+' <span class="tag '+color+'" style="margin-left:6px">'+list.length+'</span></h3></div>'+
        '<div class="panel-body" style="padding-top:8px">'+
        (list.length?'<table><thead><tr><th>Name</th><th>Gebiet</th><th>Fähigkeiten</th><th>Aktion</th></tr></thead><tbody>'+
          list.map(a=>'<tr class="clickable" onclick="showApplication('+a.id+')"><td><b>'+fullName(a)+'</b><div style="color:var(--muted);font-size:12.5px">'+a.email+'</div></td><td>'+a.area+'</td><td>'+a.skills.join(', ')+'</td><td><span class="tag '+color+'">ansehen</span></td></tr>').join('')+
          '</tbody></table>':'<p style="color:var(--muted);padding:8px 0">Keine Einträge.</p>')+
        '</div></div>';
    }).join('');
  }

  if(view==='customers'){
    const q=(custSearch||'').toLowerCase();
    const filtered=customers.filter(c=>{
      if(custFilter==='aktiv'&&c.status!=='aktiv')return false;
      if(custFilter==='pg3'&&!(parseInt(c.pgrad)>=3))return false;
      if(custFilter==='ohneabtretung'&&c.abtretung)return false;
      if(!q)return true;
      return (fullName(c)+' '+(c.area||'')+' '+(c.city||'')+' '+(c.need||[]).join(' ')).toLowerCase().includes(q);
    });
    c.innerHTML=head('Kunden','Auf einen Kunden klicken, um Daten anzusehen und zu bearbeiten. Über die Knöpfe rechts erstellst du die Dokumente.')+
    '<div class="panel"><div class="panel-head"><h3>Kunden ('+filtered.length+(filtered.length!==customers.length?' von '+customers.length:'')+')</h3><button class="btn-primary btn-sm" style="width:auto" onclick="renderAdmin(\'newcustomer\')">+ Kunde anlegen</button></div>'+
    '<div class="list-toolbar"><input class="search-input" id="custSearchInput" placeholder="🔍 Kunde suchen (Name, Gebiet, Bedarf)…" value="'+(custSearch||'').replace(/"/g,'&quot;')+'" oninput="custSearch=this.value;renderAdmin(\'customers\');setTimeout(()=>{const e=document.getElementById(\'custSearchInput\');if(e){e.focus();e.setSelectionRange(e.value.length,e.value.length);}},0)">'+
      '<div class="filter-chips">'+[['alle','Alle'],['aktiv','Aktiv'],['pg3','Pflegegrad 3+'],['ohneabtretung','Ohne Abtretung']].map(([v,l])=>'<span class="chip '+(custFilter===v?'on':'')+'" onclick="custFilter=\''+v+'\';renderAdmin(\'customers\')">'+l+'</span>').join('')+'</div>'+
    '</div>'+
    '<div class="panel-body" style="padding-top:8px"><table>'+
      '<thead><tr><th>Name</th><th>Gebiet</th><th>Bedarf</th><th>Status</th><th>Dokumente</th></tr></thead><tbody>'+
      (filtered.length?filtered.map(c=>'<tr>'+
        '<td class="clickable" onclick="editCustomer('+c.id+')"><b>'+fullName(c)+'</b></td>'+
        '<td class="clickable" onclick="editCustomer('+c.id+')">'+c.area+'</td>'+
        '<td class="clickable" onclick="editCustomer('+c.id+')">'+c.need.join(', ')+'</td>'+
        '<td>'+(c.status==='aktiv'?'<span class="tag green">aktiv</span>':'<span class="tag grey">'+c.status+'</span>')+'</td>'+
        '<td style="white-space:nowrap"><button class="btn-ghost btn-sm" onclick="event.stopPropagation();startAbtretung('+c.id+')">Abtretung</button> '+
        '<button class="btn-ghost btn-sm" onclick="event.stopPropagation();startLeistungsnachweis('+c.id+')">Leistungsnachweis</button></td>'+
      '</tr>').join(''):'<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px">Keine Kunden gefunden.</td></tr>')+
      '</tbody></table></div></div>';
  }

  if(view==='newcustomer'){ c.innerHTML=head('Kunde anlegen','Neuen Kunden erfassen und als Auftrag freigeben.')+customerFormHTML(null); }

  if(view==='mylogin'){
    c.innerHTML=head('Meine Zugangsdaten','Deine eigenen Anmeldedaten verwalten.')+
    '<div class="panel" style="max-width:520px"><div class="panel-body content-form" style="padding-top:18px">'+
      '<label>Anzeigename</label><input id="ml_name" value="Daniel Dmytrov">'+
      '<label>E-Mail / Benutzername</label><input id="ml_email" value="daniel@alltagshilfe.de">'+
      '<label>Neues Passwort</label><input id="ml_pass" type="password" placeholder="Neues Passwort setzen">'+
      '<label>Passwort wiederholen</label><input id="ml_pass2" type="password" placeholder="Wiederholen">'+
      '<button class="btn-primary" style="width:auto;padding:11px 22px" onclick="toast(\'Zugangsdaten gespeichert\')">Speichern</button>'+
    '</div></div>';
  }

  if(view==='hours'){
    c.innerHTML=head('Stundenzettel','Alle von Mitarbeitern erfassten Einsatzzeiten. Vom Kunden unterschriebene Einsätze enthalten einen Leistungsnachweis.')+
    '<div class="panel"><div class="panel-body" style="padding-top:16px">'+
    (timesheets.length?'<table><thead><tr><th>Datum</th><th>Mitarbeiter</th><th>Kunde</th><th>Zeit</th><th>Dauer</th><th>Unterschrift</th><th>Status</th><th>Leistungsnachweis</th><th></th></tr></thead><tbody>'+
      timesheets.map(t=>{const cu=custById(t.customerId);const dur=tsDuration(t);
        const sigOk=signatureLooksValid(t.signature);
        const statusTag = t.status==='freigegeben'?'<span class="tag green">freigegeben</span>'
                        : t.status==='abgelehnt'?'<span class="tag red">abgelehnt</span>'
                        : '<span class="tag amber">zu prüfen</span>';
        const sigCell = t.signature
          ? '<img src="'+t.signature+'" style="height:30px;border:1px solid var(--line);border-radius:5px;background:#fff;vertical-align:middle"> '+(sigOk?'<span class="tag green" style="font-size:10px">vorhanden</span>':'<span class="tag amber" style="font-size:10px">prüfen</span>')
          : '<span style="color:var(--muted);font-size:12px">keine</span>';
        return '<tr><td>'+fmtDate(t.date)+'</td><td><b>'+staffName(t.staffId)+'</b></td><td>'+(cu?fullName(cu):'—')+'</td><td>'+t.start+'–'+t.end+'</td><td>'+dur+'</td>'+
        '<td>'+sigCell+'</td>'+
        '<td>'+statusTag+'</td>'+
        '<td>'+(t.signature?'<button class="btn-ghost btn-sm" onclick="downloadTsLN('+t.id+')">⬇ LN</button>'+(t.hasAbtretung?' <button class="btn-ghost btn-sm" onclick="downloadAbtretung('+t.customerId+')">⬇ Abtretung</button>':''):'<span style="color:var(--muted);font-size:12px">—</span>')+'</td>'+
        '<td>'+(t.status==='offen'
            ? '<div style="display:flex;gap:6px;justify-content:flex-end"><button class="btn-danger-ghost btn-sm" onclick="rejectTimesheet('+t.id+')">Ablehnen</button><button class="btn-primary btn-sm" style="width:auto" onclick="approveTimesheet('+t.id+')">Freigeben</button></div>'
            : (t.status==='freigegeben'?'<span style="color:var(--good)">✓ freigegeben</span>':'<span style="color:#c0392b">✕ abgelehnt</span>'))+'</td></tr>';}).join('')+
      '</tbody></table>':'<div class="empty"><div class="big">⏱</div><b>Noch keine Stundenzettel</b><p style="margin-top:6px">Sobald Mitarbeiter Einsätze abschließen, erscheinen sie hier.</p></div>')+
    '</div></div>';
  }
  if(view==='payroll'){
    const byStaff={};
    timesheets.filter(t=>t.status==='freigegeben').forEach(t=>{byStaff[t.staffId]=(byStaff[t.staffId]||0)+tsMinutes(t);});
    c.innerHTML=head('Lohnabrechnung','Freigegebene Stunden je Mitarbeiter – Basis für die Abrechnung (Export an AS Bremen vorgesehen).')+
    '<div class="panel"><div class="panel-body" style="padding-top:16px">'+
    (Object.keys(byStaff).length?'<table><thead><tr><th>Mitarbeiter</th><th>Freigegebene Stunden (Monat)</th><th></th></tr></thead><tbody>'+
      Object.entries(byStaff).map(([sid,min])=>'<tr><td><b>'+staffName(+sid)+'</b></td><td>'+(min/60).toFixed(1).replace('.',',')+' Std.</td><td><button class="btn-ghost btn-sm" onclick="toast(\'Abrechnung erstellt & bereitgestellt\')">Abrechnung erstellen</button></td></tr>').join('')+
      '</tbody></table>':'<div class="empty"><div class="big">€</div><b>Noch nichts freigegeben</b><p style="margin-top:6px">Gib zuerst unter „Stundenzettel“ Zeiten frei – sie erscheinen dann hier zur Abrechnung.</p></div>')+
    '</div></div>';
  }
  if(view==='notes'){ c.innerHTML=head('Notizen','Bemerkungen zu Mitarbeitern und Kunden. Intern = nur Büro, Mitarbeiter = für die Person sichtbar.')+notesAdminHTML(); }
  if(view==='calendar'){ c.innerHTML=head('Kalender','Alle Einsätze zentral. Klick auf einen Termin für Details.')+calendarHTML(null); }
}

/* ---- Auftrags-Zusammenfassung (Modal) ---- */
function showJobSummary(jobId){
  const j=jobs.find(x=>x.id===jobId);const cu=custById(j.customerId);
  document.getElementById('modalTitle').textContent=j.title;
  document.getElementById('modalBody').innerHTML=
    '<div class="summary" style="margin-bottom:16px"><div class="sh">Kurz-Zusammenfassung</div>'+
      '<b>'+fullName(cu)+'</b> · '+cu.area+'<br>'+
      'Bedarf: '+cu.need.join(', ')+' · '+freqText(cu)+' · '+cu.window+'<br>'+
      'Pflegegrad '+cu.pgrad+' · Haustier: '+cu.pet+
    '</div>'+
    '<div class="reveal-row"><span class="k">Adresse</span><span class="v">'+cu.address+'</span></div>'+
    '<div class="reveal-row"><span class="k">Telefon</span><span class="v">'+cu.phone+'</span></div>'+
    '<div class="reveal-row"><span class="k">Kontakt</span><span class="v">'+cu.contact+'</span></div>'+
    '<div class="reveal-row"><span class="k">Status</span><span class="v">'+jobStatusTag(j)+(j.status==='assigned'?' '+staffName(j.assignedTo):'')+'</span></div>'+
    '<div style="margin-top:12px"><div class="section-label" style="margin-top:8px">Wichtige Hinweise</div><p style="font-size:14px">'+cu.notes+'</p></div>';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="closeModal()">Schließen</button><button class="btn-primary" style="width:auto;padding:11px 20px" onclick="closeModal();editCustomer('+cu.id+')">Kunde bearbeiten</button>';
  openModal();
}
/* ============ MITARBEITER: HINZUFÜGEN / BEARBEITEN ============ */
