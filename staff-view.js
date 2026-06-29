function renderStaff(view){
  buildStaffNav(view);
  document.getElementById('sidebar').classList.remove('open');
  const c=document.getElementById('content');const m=me();
  if(view==='dashboard'){
    const open=availableForMe().length;
    const mineCount=jobs.filter(j=>j.status==='assigned'&&j.assignedTo===myId).length;
    // bestätigte Minuten = freigegebene Stundenzettel des Mitarbeiters
    const confirmedMin=timesheets.filter(t=>t.staffId===myId&&t.status==='freigegeben').reduce((s,t)=>s+tsMinutes(t),0);
    const plannedMin=timesheets.filter(t=>t.staffId===myId).reduce((s,t)=>s+tsMinutes(t),0);
    const confirmedH=confirmedMin/60, plannedH=plannedMin/60;
    const wage=m.wage||14;
    const earned=(confirmedH*wage);
    const bonus=m.bonus||{earned:0,pending:0,reason:''};
    const daysLeft=Math.max(0,70-(m.daysWorked||0));
    const dayPct=Math.min(100,Math.round((m.daysWorked||0)/70*100));
    const dayColor=daysLeft<=10?'var(--danger)':(daysLeft<=25?'var(--amber)':'var(--good)');
    c.innerHTML=head('Hallo '+m.first+' 👋','Dein Überblick für diesen Monat.')+
    (m.status!=='aktiv'?statusBanner(m.status):'')+
    '<div class="cards grid-3">'+
      stat('Bestätigte Stunden',confirmedH.toFixed(1).replace('.',',')+' h','tatsächlich abgerechnet')+
      stat('Voraussichtliche Stunden',plannedH.toFixed(1).replace('.',',')+' h','inkl. noch offener Einträge')+
      stat('Verdienst (Monat)',earned.toFixed(2).replace('.',',')+' €','bei '+wage.toFixed(2).replace('.',',')+' €/h')+
    '</div><div style="height:16px"></div>'+
    '<div class="cards grid-2">'+
      // Bonus-Karte
      '<div class="panel"><div class="panel-body" style="padding:18px 20px">'+
        '<div class="stat-row" style="display:flex;justify-content:space-between;align-items:flex-start"><div><div class="label" style="font-size:13px;color:var(--muted);font-weight:600">Bonus</div>'+
        '<div class="value" style="font-size:28px;font-weight:700;color:var(--good);margin-top:4px">'+(bonus.earned).toFixed(0)+' €</div>'+
        '<div class="foot" style="font-size:12.5px;color:var(--muted);margin-top:2px">erhalten</div></div>'+
        '<div style="text-align:right"><div class="value" style="font-size:22px;font-weight:700;color:'+(bonus.pending>0?'var(--amber)':'var(--muted)')+'">'+(bonus.pending).toFixed(0)+' €</div>'+
        '<div class="foot" style="font-size:12.5px;color:var(--muted)">ausstehend</div></div></div>'+
        (bonus.reason?'<div style="margin-top:10px;font-size:12.5px;color:var(--muted);border-top:1px solid #eef3f3;padding-top:10px">'+bonus.reason+'</div>':'')+
      '</div></div>'+
      // 70-Tage-Karte
      '<div class="panel"><div class="panel-body" style="padding:18px 20px">'+
        '<div class="label" style="font-size:13px;color:var(--muted);font-weight:600">70-Tage-Richtlinie (kurzfristige Beschäftigung)</div>'+
        '<div style="display:flex;align-items:baseline;gap:8px;margin-top:6px"><div class="value" style="font-size:28px;font-weight:700;color:'+dayColor+'">'+daysLeft+'</div><div style="font-size:13px;color:var(--muted)">Tage noch möglich</div></div>'+
        '<div style="height:9px;background:#eef3f3;border-radius:6px;margin-top:10px;overflow:hidden"><div style="height:100%;width:'+dayPct+'%;background:'+dayColor+';border-radius:6px"></div></div>'+
        '<div style="font-size:12.5px;color:var(--muted);margin-top:6px">'+(m.daysWorked||0)+' von 70 Tagen genutzt</div>'+
      '</div></div>'+
    '</div><div style="height:16px"></div>'+
    '<div class="cards grid-3">'+
      stat('Verfügbare Aufträge',open,'in deinem Gebiet')+
      stat('Meine Kunden',mineCount,'aktiv angenommen')+
      stat('Wunsch-Stunden',(m.maxHours||0)+' h','pro Woche')+
    '</div><div style="height:18px"></div>'+
    '<div class="panel"><div class="panel-head"><h3>Neue Aufträge für dich</h3>'+
      '<button class="btn-ghost btn-sm" onclick="renderStaff(\'board\')">Zur Börse</button></div>'+
      '<div class="panel-body" style="padding-top:6px">'+
      (open?availableForMe().slice(0,2).map(j=>{const cu=custById(j.customerId);return '<div style="display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-bottom:1px solid #eef3f3"><div><b>'+j.title+'</b><div class="job-loc">'+cu.area+' · '+freqText(cu)+'</div></div><button class="btn-ghost btn-sm" onclick="renderStaff(\'board\')">Ansehen</button></div>';}).join(''):'<p style="color:var(--muted);padding:10px 0">Aktuell keine neuen Aufträge.</p>')+
      '</div></div>';
  }
  if(view==='board'){
    if(m.status!=='aktiv'){
      c.innerHTML=head('Auftragsbörse','Neue Kunden in deinem Gebiet.')+statusBanner(m.status)+
        placeholder('🔒','Auftragsannahme pausiert','Dein Status ist „'+m.status+'“. Setze dich im Profil wieder auf „aktiv“, um Aufträge annehmen zu können.');
      return;
    }
    const avail=availableForMe();
    c.innerHTML=head('Auftragsbörse','Neue Kunden in deinem Gebiet. Vor der Annahme siehst du eine Zusammenfassung – aber keinen Namen oder Adresse. Wer zuerst annimmt, bekommt den Auftrag.')+
    (avail.length?'<div class="cards grid-2" id="board">'+avail.map(jobCard).join('')+'</div>':emptyBoard());
  }
  if(view==='mine'){
    const mine=jobs.filter(j=>j.status==='assigned'&&j.assignedTo===myId);
    c.innerHTML=head('Meine Kunden','Angenommene Aufträge mit vollständigen Kontaktdaten. Vereinbare jetzt selbst einen Termin.')+
    (mine.length?'<div class="cards grid-2">'+mine.map(mineCard).join('')+'</div>':placeholder('✓','Noch keine Kunden angenommen','Geh zur Auftragsbörse und nimm einen Auftrag an – die vollständigen Daten erscheinen dann hier.'));
  }
  if(view==='calendar'){ c.innerHTML=head('Meine Termine','Deine vereinbarten Einsätze. Termine entstehen, wenn du bei „Meine Kunden“ einen Termin vereinbarst.')+calendarHTML(myId); }
  if(view==='hours'){
    const mine=timesheets.filter(t=>t.staffId===myId);
    c.innerHTML=head('Stundenzettel','Deine Einsätze. Vom Kunden unterschriebene Einsätze kannst du als Leistungsnachweis-PDF herunterladen.')+
    '<div class="panel"><div class="panel-head"><h3>Meine Zeiten</h3><button class="btn-primary btn-sm" style="width:auto" onclick="addTimesheet()">+ Zeit erfassen</button></div>'+
    '<div class="panel-body" style="padding-top:8px">'+
    (mine.length?'<table><thead><tr><th>Datum</th><th>Kunde</th><th>Zeit</th><th>Dauer</th><th>Status</th><th>Leistungsnachweis</th></tr></thead><tbody>'+
      mine.map(t=>{const cu=custById(t.customerId);
        const st = t.status==='freigegeben'?'<span class="tag green">freigegeben</span>'
                 : t.status==='abgelehnt'?'<span class="tag red">abgelehnt</span>'
                 : '<span class="tag amber">wartet auf Freigabe</span>';
        return '<tr><td>'+fmtDate(t.date)+'</td><td>'+(cu?fullName(cu):'—')+'</td><td>'+t.start+'–'+t.end+'</td><td>'+tsDuration(t)+'</td><td>'+st+'</td><td>'+
        (t.signature?'<img src="'+t.signature+'" style="height:30px;border:1px solid var(--line);border-radius:5px;background:#fff;vertical-align:middle"> <button class="btn-ghost btn-sm" onclick="downloadTsLN('+t.id+')">⬇ PDF</button>':'<span style="color:var(--muted);font-size:12.5px">—</span>')+
      '</td></tr>';}).join('')+
      '</tbody></table>':'<div class="empty"><div class="big">⏱</div><b>Noch keine Zeiten erfasst</b><p style="margin-top:6px">Starte einen Termin unter „Meine Termine“ oder tippe auf „Zeit erfassen“.</p></div>')+
    '</div></div>';
  }
  if(view==='payroll'){
    const mine=timesheets.filter(t=>t.staffId===myId&&t.status==='freigegeben');
    const totalMin=mine.reduce((n,t)=>n+tsMinutes(t),0);
    c.innerHTML=head('Lohnabrechnung','Deine freigegebenen Stunden und Abrechnungen.')+
    '<div class="cards grid-2"><div class="stat"><div class="label">Freigegebene Stunden (Monat)</div><div class="value">'+(totalMin/60).toFixed(1).replace('.',',')+'</div><div class="foot">Basis für die Abrechnung</div></div>'+
    '<div class="stat"><div class="label">Abrechnungen</div><div class="value">'+(totalMin>0?'1':'0')+'</div><div class="foot">zum Download bereit</div></div></div>'+
    '<div style="height:16px"></div>'+
    (totalMin>0?'<div class="panel"><div class="panel-body" style="padding-top:16px"><table><thead><tr><th>Zeitraum</th><th>Stunden</th><th></th></tr></thead><tbody><tr><td>Juni 2026</td><td>'+(totalMin/60).toFixed(1).replace('.',',')+' Std.</td><td><button class="btn-ghost btn-sm" onclick="toast(\'Download startet (Demo)\')">⬇ Herunterladen</button></td></tr></tbody></table></div></div>'
      :placeholder('€','Noch keine Abrechnung','Sobald das Büro deine erfassten Stunden freigibt, erscheint hier deine Abrechnung.'));
  }
  if(view==='profile'){
    c.innerHTML=head('Mein Profil','Deine Daten, Verfügbarkeit und Status – pflegst du selbst.')+
    '<div class="cards grid-2">'+
      '<div class="panel"><div class="panel-head"><h3>Status & Verfügbarkeit</h3></div>'+
        '<div class="panel-body content-form" style="padding-top:16px">'+
          '<label>Mein Status</label>'+
          '<div class="seg status" id="pf_status">'+['aktiv','Urlaub','krank'].map(v=>'<button data-v="'+v+'" class="'+(m.status===v?'on':'')+'" onclick="segPick(this,\'pf_status\')">'+v+'</button>').join('')+'</div>'+
          '<div style="height:14px"></div>'+
          '<label>An welchen Tagen arbeite ich?</label>'+
          '<div class="day-grid" id="pf_days">'+WEEKDAYS.map(d=>'<div class="day '+(m.days.includes(d)?'on':'')+'" onclick="this.classList.toggle(\'on\')">'+d+'</div>').join('')+'</div>'+
          '<div style="height:8px"></div>'+
          '<div class="form-row"><div><label>Bevorzugtes Zeitfenster</label><select id="pf_window">'+['Vormittags','Nachmittags','Abends','Flexibel'].map(w=>'<option '+(m.window===w?'selected':'')+'>'+w+'</option>').join('')+'</select></div>'+
          '<div><label>Max. Stunden / Woche</label><input id="pf_max" type="number" value="'+m.maxHours+'"></div></div>'+
          '<button class="btn-primary" style="width:auto;padding:11px 22px" onclick="saveProfile()">Speichern</button>'+
        '</div></div>'+
      '<div class="panel"><div class="panel-head"><h3>Meine Daten</h3></div>'+
        '<div class="panel-body" style="padding-top:16px">'+
          '<div class="reveal-row"><span class="k">Name</span><span class="v">'+fullName(m)+'</span></div>'+
          '<div class="reveal-row"><span class="k">Funktion</span><span class="v">'+m.role+'</span></div>'+
          '<div class="reveal-row"><span class="k">Telefon</span><span class="v">'+m.phone+'</span></div>'+
          '<div class="reveal-row"><span class="k">E-Mail</span><span class="v">'+m.email+'</span></div>'+
          '<div class="reveal-row"><span class="k">Gebiet</span><span class="v">'+m.area+'</span></div>'+
          '<div class="reveal-row"><span class="k">Fähigkeiten</span><span class="v">'+m.skills.join(', ')+'</span></div>'+
          '<p style="color:var(--muted);font-size:12.5px;margin-top:12px">Stammdaten ändert das Büro. Status und Verfügbarkeit pflegst du selbst.</p>'+
        '</div></div>'+
    '</div>';
  }
  if(view==='contracts'){
    const m=me();const list=m.contracts||[];
    c.innerHTML=head('Meine Verträge','Deine unterschriebenen Verträge und Vereinbarungen. Jederzeit einsehbar.')+
    (list.length?'<div class="cards">'+list.map((ct,i)=>
      '<div class="panel"><div class="list-row" style="padding:16px 20px">'+
        '<div class="li-main"><b>📄 '+ct.name+'</b><div class="li-sub">Unterschrieben am '+fmtDate(ct.signedDate)+' · <span style="color:var(--good)">✓ signiert</span></div></div>'+
        '<div style="display:flex;gap:8px;align-items:center">'+
          (ct.signature?'<img src="'+ct.signature+'" alt="Unterschrift" style="height:46px;border:1px solid var(--line);border-radius:7px;background:#fff">':'')+
          '<button class="btn-ghost btn-sm" onclick="viewContract(\''+ct.name+'\',\'me\','+i+')">Lesen</button>'+
          '<button class="btn-primary btn-sm" style="width:auto" onclick="downloadStaffContract('+m.id+','+i+')">⬇ PDF</button>'+
        '</div>'+
      '</div></div>').join('')+'</div>'
      :placeholder('📄','Noch keine Verträge hinterlegt','Sobald du den Bewerbungsprozess abgeschlossen hast, erscheinen deine unterschriebenen Verträge hier.'));
  }
  if(view==='emergency'){
    c.innerHTML=head('Notfallnummer','Im Notfall sofort erreichbar.')+
    '<div class="panel"><div class="panel-body" style="padding:26px;text-align:center">'+
      '<div style="font-size:13px;color:var(--muted);font-weight:600;text-transform:uppercase;letter-spacing:.5px">Einsatzleitung / Notfall</div>'+
      '<div style="font-size:32px;font-weight:700;color:var(--petrol-dark);margin:8px 0">0511 / 123 456 78</div>'+
      '<div style="color:var(--muted);font-size:14px">Erreichbar Mo–Fr 7–20 Uhr · außerhalb: Bereitschaft</div>'+
    '</div></div>';
  }
}
function saveProfile(){
  const m=me();
  const st=document.querySelector('#pf_status button.on');if(st)m.status=st.dataset.v;
  m.days=[...document.querySelectorAll('#pf_days .day.on')].map(e=>e.textContent);
  m.window=document.getElementById('pf_window').value;
  m.maxHours=parseInt(document.getElementById('pf_max').value)||m.maxHours;
  toast(m.status==='aktiv'?'Profil gespeichert':'Status gesetzt: '+m.status,m.status!=='aktiv');
  renderStaff('profile');
}

/* ---- Job-Karten mit Zusammenfassung ---- */
function distanceKm(customerId){return 3+((customerId*7)%22);} // Demo: stabile Pseudo-Entfernung 3–24 km
const STAFF_COLORS=['#0f5b63','#e08a2b','#2c6e9b','#7a4ca0','#2f8f5b','#b5402f','#c79a00','#1f7a8c'];
function nextColor(){return STAFF_COLORS[staff.length % STAFF_COLORS.length];}
function jobEstHours(j){const cu=custById(j.customerId);const per=cu&&cu.freqUnit==='pro Woche'?(cu.freqNum||1):1;return Math.max(2,per*2);} // grobe Schätzung h/Woche
function myWeeklyLoad(){return jobs.filter(j=>j.status==='assigned'&&j.assignedTo===myId).reduce((s,j)=>s+jobEstHours(j),0);}
function myRejectRate(){
  const total=jobs.filter(j=>j.rejectedBy.includes(myId)).length + jobs.filter(j=>j.assignedTo===myId).length;
  const rej=jobs.filter(j=>j.rejectedBy.includes(myId)).length;
  return total>0?rej/total:0;
}
function jobCard(j){
  const cu=custById(j.customerId);
  const km=distanceKm(cu.id);
  // weniger detailreich: Tätigkeit, Entfernung, Häufigkeit, kurze Zusammenfassung
  return '<div class="job" id="job-'+j.id+'">'+
    '<div class="job-top"><div><h3>'+j.title+'</h3><div class="job-loc">📍 '+cu.area+' · ca. '+km+' km von dir</div></div><span class="tag green">verfügbar</span></div>'+
    '<div class="job-tags">'+j.skills.map(s=>'<span class="tag grey">'+s+'</span>').join('')+'</div>'+
    '<div class="summary"><div class="sh">Kurzinfo</div>'+cu.need.join(', ')+' · '+freqText(cu)+' · '+cu.window+'</div>'+
    '<div class="locked">🔒 Genaue Adresse & Name erst nach Annahme</div>'+
    '<div class="job-actions"><button class="btn-accept" onclick="askCommit('+j.id+')">Auftrag annehmen</button>'+
    '<button class="btn-danger-ghost" onclick="rejectJob('+j.id+')">Ablehnen</button></div></div>';
}
function mineCard(j){
  const cu=custById(j.customerId);
  let timerHtml='';
  if(j.commitDeadline){
    const remMs=j.commitDeadline-Date.now();
    if(remMs>0){
      const h=Math.floor(remMs/3600000);const min=Math.floor((remMs%3600000)/60000);
      const urgent=h<12;
      timerHtml='<div class="example-id" style="background:'+(urgent?'var(--amber-soft);border-color:#f0dcc2':'var(--blue-soft);border-color:#c5dcec')+';margin-bottom:12px"><div style="font-size:20px">⏱</div><div><b>Termin vereinbaren:</b> noch '+h+' h '+min+' min Zeit</div></div>';
    }else{
      timerHtml='<div class="example-id" style="background:var(--danger-soft);border-color:#eccfc8;margin-bottom:12px"><div style="font-size:20px">⚠️</div><div><b>Frist abgelaufen</b> – bitte umgehend Termin vereinbaren oder zurückgeben.</div></div>';
    }
  }
  return '<div class="job"><div class="job-top"><div><h3>'+j.title+'</h3><div class="job-loc">📍 '+cu.area+' · ca. '+distanceKm(cu.id)+' km</div></div><span class="tag green">angenommen</span></div>'+
    timerHtml+
    '<div class="reveal"><div class="rh">✓ Vollständige Kundendaten</div>'+
      '<div class="reveal-row"><span class="k">Name</span><span class="v">'+fullName(cu)+'</span></div>'+
      '<div class="reveal-row"><span class="k">Adresse</span><span class="v">'+cu.address+'</span></div>'+
      '<div class="reveal-row"><span class="k">Telefon</span><span class="v">'+cu.phone+'</span></div>'+
      '<div class="reveal-row"><span class="k">Kontakt</span><span class="v">'+cu.contact+'</span></div>'+
      '<div class="reveal-row"><span class="k">Hinweise</span><span class="v" style="max-width:60%">'+cu.notes+'</span></div>'+
    '</div>'+
    '<div class="job-actions"><button class="btn-accept" onclick="addAppointment('+cu.id+')">Termin vereinbaren</button>'+
    '<button class="btn-danger-ghost" onclick="releaseJob('+j.id+')">Zurückgeben</button></div></div>';
}
function emptyBoard(){return '<div class="empty"><div class="big">🎉</div><b>Aktuell keine offenen Aufträge</b><p style="margin-top:6px">Sobald das Büro einen neuen Kunden freigibt, erscheint er hier. Abgelehnte Aufträge werden dir nicht erneut angezeigt.</p></div>';}

function askCommit(id){
  const j=jobs.find(x=>x.id===id);if(!j)return;
  if(j.status!=='available'){toast('Leider schon vergeben an '+staffName(j.assignedTo),true);renderStaff('board');return;}
  const m=me();const cu=custById(j.customerId);
  const est=jobEstHours(j);const load=myWeeklyLoad();const cap=m.maxHours||20;
  const wouldBe=load+est;
  const overCap=wouldBe>cap;
  const highRisk=myRejectRate()>=0.5;
  const km=distanceKm(cu.id);
  document.getElementById('modalBox').classList.remove('wide');
  document.getElementById('modalTitle').textContent='Auftrag verbindlich annehmen';
  document.getElementById('modalBody').innerHTML=
    '<div class="summary" style="margin-bottom:14px"><div class="sh">'+j.title+'</div>'+cu.area+' · ca. '+km+' km · '+freqText(cu)+'<br>Geschätzter Aufwand: ca. '+est+' h/Woche</div>'+
    '<div class="reveal-row"><span class="k">Deine Wochenstunden bisher</span><span class="v">'+load+' h</span></div>'+
    '<div class="reveal-row"><span class="k">Mit diesem Auftrag</span><span class="v">'+wouldBe+' h von '+cap+' h</span></div>'+
    (overCap?'<div class="example-id" style="background:var(--danger-soft);border-color:#eccfc8;margin-top:12px"><div style="font-size:20px">⚠️</div><div>Damit überschreitest du dein Wochenkontingent von '+cap+' h. Bitte zuerst im Profil anpassen oder einen anderen Auftrag wählen.</div></div>':'')+
    (highRisk?'<div class="example-id" style="background:var(--amber-soft);border-color:#f0dcc2;margin-top:12px"><div style="font-size:20px">📉</div><div>Hinweis: Deine Absagequote ist erhöht. Bitte nimm nur Aufträge an, die du sicher wahrnehmen kannst.</div></div>':'')+
    '<div class="confirm-box" style="margin-top:14px" onclick="document.getElementById(\'commitChk\').click()"><input type="checkbox" id="commitChk" onclick="event.stopPropagation();document.getElementById(\'commitBtn\').disabled=!this.checked"><label>Ich verpflichte mich, diesen Auftrag verbindlich zu übernehmen und innerhalb von 48 Stunden einen Termin mit dem Kunden zu vereinbaren.</label></div>';
  let foot='<button class="btn-ghost" onclick="closeModal()">Abbrechen</button>';
  if(!overCap) foot+='<button class="btn-primary" id="commitBtn" style="width:auto;padding:11px 20px" disabled onclick="confirmAccept('+id+')">Verbindlich annehmen</button>';
  document.getElementById('modalFoot').innerHTML=foot;
  openModal();
}
function confirmAccept(id){
  const j=jobs.find(x=>x.id===id);if(!j||j.status!=='available'){closeModal();toast('Leider schon vergeben',true);renderStaff('board');return;}
  j.status='assigned';j.assignedTo=myId;
  // 48h-Timer für Terminvereinbarung setzen
  j.commitDeadline=Date.now()+48*3600*1000;
  const cu=custById(j.customerId);if(cu){cu.status='aktiv'; if(CLOUD)cloudUpdate('kunden',cu.id,custToRow(cu));}
  if(CLOUD) cloudUpdate('auftraege',j.id,jobToRow(j));
  closeModal();
  toast('Verbindlich angenommen – Termin innerhalb 48 h vereinbaren');renderStaff('mine');
}
function acceptJob(id){ askCommit(id); }
function rejectJob(id){
  const j=jobs.find(x=>x.id===id);if(!j)return;
  if(!j.rejectedBy.includes(myId))j.rejectedBy.push(myId);
  if(CLOUD) cloudUpdate('auftraege',j.id,jobToRow(j));
  const el=document.getElementById('job-'+id);if(el)el.classList.add('fade');
  setTimeout(()=>{toast('Abgelehnt – das Büro wird informiert',true);renderStaff('board');},200);
}
function releaseJob(id){
  const j=jobs.find(x=>x.id===id);if(!j)return;
  j.status='available';j.assignedTo=null;j.commitDeadline=null;
  if(CLOUD) cloudUpdate('auftraege',j.id,jobToRow(j));
  toast('Auftrag zurückgegeben – wieder in der Börse',true);renderStaff('mine');
}
/* ============ BEWERBUNGS-WIZARD (öffentlich) ============ */
