let calView='month';           // 'month' | 'week' | 'day'
let calCursor=new Date();      // aktuell angezeigter Zeitraum
let calStaffFilter=null;       // null = alle (Admin), sonst staffId

function calendarHTML(staffFilter){
  calStaffFilter=staffFilter;
  return '<div id="calHost">'+renderCalendar()+'</div>';
}
function setCalView(v){ calView=v; refreshCal(); }
function calMove(dir){
  const d=new Date(calCursor);
  if(calView==='month') d.setMonth(d.getMonth()+dir);
  else if(calView==='week') d.setDate(d.getDate()+dir*7);
  else d.setDate(d.getDate()+dir);
  calCursor=d; refreshCal();
}
function calToday(){ calCursor=new Date(); refreshCal(); }
function refreshCal(){ const h=document.getElementById('calHost'); if(h) h.innerHTML=renderCalendar(); }

function calEvents(){
  let list=appointments.slice();
  if(calStaffFilter!==null){
    // Mitarbeiter-Ansicht: nur eigene UND abgesagte ausblenden
    list=list.filter(a=>a.staffId===calStaffFilter && a.status!=='abgesagt');
  }
  // Admin-Ansicht (calStaffFilter===null): alle, auch abgesagte
  return list;
}
function pad2(n){return String(n).padStart(2,'0');}
function dateKey(d){return d.getFullYear()+'-'+pad2(d.getMonth()+1)+'-'+pad2(d.getDate());}
function sameDay(a,b){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}

function renderCalendar(){
  const title = calView==='month' ? monthTitle(calCursor)
              : calView==='week'  ? weekTitle(calCursor)
              : dayTitle(calCursor);
  const seg = ['month','week','day'].map(v=>'<button class="'+(calView===v?'on':'')+'" onclick="setCalView(\''+v+'\')">'+(v==='month'?'Monat':v==='week'?'Woche':'Tag')+'</button>').join('');
  const toolbar=
    '<div class="cal-toolbar">'+
      '<div class="cal-title">'+title+'</div>'+
      '<div class="cal-seg">'+seg+'</div>'+
      '<div class="cal-arrows"><button onclick="calMove(-1)">‹</button><button class="cal-today-btn" onclick="calToday()">Heute</button><button onclick="calMove(1)">›</button></div>'+
    '</div>';
  const body = calView==='month' ? monthView() : calView==='week' ? timeView(7) : timeView(1);
  return '<div class="cal-wrap">'+toolbar+body+'</div>';
}

function monthTitle(d){ const m=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']; return m[d.getMonth()]+' '+d.getFullYear(); }
function weekTitle(d){ const s=weekStart(d); const e=new Date(s); e.setDate(e.getDate()+6); const m=['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez']; return s.getDate()+'. '+m[s.getMonth()]+' – '+e.getDate()+'. '+m[e.getMonth()]+' '+e.getFullYear(); }
function dayTitle(d){ const w=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag']; const m=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember']; return w[d.getDay()]+', '+d.getDate()+'. '+m[d.getMonth()]+' '+d.getFullYear(); }
function weekStart(d){ const s=new Date(d); const day=(s.getDay()+6)%7; s.setDate(s.getDate()-day); s.setHours(0,0,0,0); return s; } // Montag

function monthView(){
  const dow=['Mo','Di','Mi','Do','Fr','Sa','So'];
  const first=new Date(calCursor.getFullYear(),calCursor.getMonth(),1);
  const start=weekStart(first);
  const evs=calEvents();
  const today=new Date();
  let cells='';
  for(let i=0;i<42;i++){
    const d=new Date(start); d.setDate(start.getDate()+i);
    const other=d.getMonth()!==calCursor.getMonth();
    const dayEvs=evs.filter(e=>e.date===dateKey(d)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
    const shown=dayEvs.slice(0,3).map(e=>{const cu=custById(e.customerId);const cl=e.status==='abgesagt'?' cm-ev-cancel':'';return '<div class="cm-ev'+cl+'" onclick="event.stopPropagation();showAppt('+e.id+')">'+(e.status==='abgesagt'?'✕ ':'')+(e.time||'')+' '+(cu?cu.last:'Termin')+'</div>';}).join('');
    const more=dayEvs.length>3?'<div class="cm-more">+'+(dayEvs.length-3)+' mehr</div>':'';
    cells+='<div class="cm-cell'+(other?' other':'')+(sameDay(d,today)?' today':'')+'" onclick="openDay(\''+dateKey(d)+'\')"><span class="cm-num">'+d.getDate()+'</span>'+shown+more+'</div>';
  }
  return '<div class="cm-grid">'+dow.map(x=>'<div class="cm-dow">'+x+'</div>').join('')+cells+'</div>';
}

function timeView(days){
  const startHour=6, endHour=22;
  const hours=[]; for(let h=startHour;h<=endHour;h++) hours.push(h);
  const base = days===7 ? weekStart(calCursor) : new Date(calCursor.getFullYear(),calCursor.getMonth(),calCursor.getDate());
  const today=new Date();
  const evs=calEvents();
  const dowLabels=['Mo','Di','Mi','Do','Fr','Sa','So'];
  const slotH=48;
  const totalH=hours.length*slotH;

  const cols=[];
  for(let i=0;i<days;i++){ const d=new Date(base); d.setDate(base.getDate()+i); cols.push(d); }

  // Kopfzeile: leere Ecke + Tage
  let head='<div class="ct-corner"></div>';
  cols.forEach((d,i)=>{
    const dn = days===7 ? dowLabels[i] : ['So','Mo','Di','Mi','Do','Fr','Sa'][d.getDay()];
    head+='<div class="ct-dayhead'+(sameDay(d,today)?' today':'')+'"><div class="dn">'+dn+'</div><div class="dd">'+d.getDate()+'</div></div>';
  });

  // Zeitspalte
  let timeCol='';
  hours.forEach(h=>{ timeCol+='<div class="ct-hour">'+pad2(h)+':00</div>'; });

  // Tagesspalten
  let dayCols='';
  cols.forEach(d=>{
    let slots='';
    hours.forEach(()=>{ slots+='<div class="ct-slot"></div>'; });
    let evLayer='';
    evs.filter(e=>e.date===dateKey(d)).forEach(e=>{
      const [hh,mm]=(e.time||'09:00').split(':').map(Number);
      let top=((hh-startHour)*60+mm)/60*slotH; if(top<0)top=0;
      const height=Math.max(22,(e.duration||60)/60*slotH-3);
      const cu=custById(e.customerId);
      const cancCl=e.status==='abgesagt'?' ct-ev-cancel':'';
      evLayer+='<div class="ct-ev'+cancCl+'" style="top:'+top+'px;height:'+height+'px" onclick="showAppt('+e.id+')"><div class="et">'+(e.status==='abgesagt'?'✕ ':'')+(e.time||'')+' '+(cu?fullName(cu):'Termin')+'</div>'+(height>34?'<div class="es">'+(e.status==='abgesagt'?'Abgesagt: '+(e.cancelReason||''):(e.note||(cu?cu.area:'')))+'</div>':'')+'</div>';
    });
    dayCols+='<div class="ct-col" style="height:'+totalH+'px">'+slots+evLayer+'</div>';
  });

  const gridCols='60px repeat('+days+',1fr)';
  return '<div class="ct-scroll"><div style="display:grid;grid-template-columns:'+gridCols+'">'+
    head+
    '<div class="ct-timecol">'+timeCol+'</div>'+
    dayCols+
    '</div></div>';
}

function openDay(dateStr){
  // Tagesansicht öffnen
  const parts=dateStr.split('-'); calCursor=new Date(+parts[0],+parts[1]-1,+parts[2]);
  calView='day'; refreshCal();
}
function quickAddInfo(){
  toast('Tipp: Termine legst du über „Meine Kunden“ → Kunde → Termin vereinbaren an');
}
function addAppointment(customerId){
  const cu=custById(customerId);
  document.getElementById('modalTitle').textContent='Termin vereinbaren';
  document.getElementById('modalBody').innerHTML=
    '<div class="content-form"><p style="color:var(--muted);font-size:14px;margin-bottom:14px">Mit <b>'+fullName(cu)+'</b> · '+cu.area+'</p>'+
    '<div class="form-row"><div><label>Datum</label><input id="ap_date" type="date" value="2026-06-13"></div>'+
    '<div><label>Uhrzeit</label><input id="ap_time" type="time" value="09:00"></div></div>'+
    '<label>Dauer (Minuten)</label><input id="ap_dur" type="number" value="90">'+
    '<label>Notiz (optional)</label><input id="ap_note" placeholder="z. B. Einkauf + Reinigung">'+
    '</div>';
  document.getElementById('modalFoot').innerHTML='<button class="btn-ghost" onclick="closeModal()">Abbrechen</button><button class="btn-primary" style="width:auto;padding:11px 20px" onclick="saveAppointment('+customerId+')">Termin speichern</button>';
  openModal();
}
function saveAppointment(customerId){
  const date=val('ap_date'),time=val('ap_time');
  if(!date||!time){toast('Bitte Datum und Uhrzeit angeben',true);return;}
  const appt={id:nextApptId++,staffId:myId,customerId,date,time,duration:parseInt(val('ap_dur'))||60,note:val('ap_note')};
  appointments.push(appt);
  // Auch in der Datenbank speichern, damit der Termin nach Neuladen erhalten bleibt
  if(CLOUD){
    cloudInsert('termine', apptToRow(appt)).then(r=>{ if(r&&r.id){ appt.id=r.id; } });
  }
  closeModal();toast('Termin gespeichert – unter „Meine Termine“ sichtbar');
  renderStaff('calendar');
}
function apptToRow(a){
  return { mitarbeiter_id:a.staffId, customer_id:a.customerId, date:a.date, time:a.time, duration:a.duration||60, note:a.note||null, status:a.status||'geplant', cancel_reason:a.cancelReason||null, cancel_detail:a.cancelDetail||null };
}
function rowToAppt(r){
  return { id:r.id, staffId:r.mitarbeiter_id, customerId:r.customer_id, date:r.date, time:r.time, duration:r.duration||60, note:r.note||'', status:r.status||'geplant', cancelReason:r.cancel_reason||'', cancelDetail:r.cancel_detail||'' };
}
function showAppt(id){
  const a=appointments.find(x=>x.id===id);const cu=custById(a.customerId);
  const cancelled=a.status==='abgesagt';
  document.getElementById('modalTitle').textContent= cancelled?'Termin (abgesagt)':'Termin-Details';
  document.getElementById('modalBody').innerHTML=
    (cancelled?'<div class="cancel-banner">✕ Dieser Termin wurde abgesagt</div>':'')+
    '<div class="reveal-row"><span class="k">Kunde</span><span class="v">'+(cu?fullName(cu):'—')+'</span></div>'+
    '<div class="reveal-row"><span class="k">Adresse</span><span class="v">'+(cu?cu.address:'—')+'</span></div>'+
    '<div class="reveal-row"><span class="k">Datum</span><span class="v">'+fmtDateLong(a.date)+'</span></div>'+
    '<div class="reveal-row"><span class="k">Uhrzeit</span><span class="v">'+a.time+' ('+a.duration+' Min.)</span></div>'+
    '<div class="reveal-row"><span class="k">Mitarbeiter</span><span class="v">'+staffName(a.staffId)+'</span></div>'+
    (a.note?'<div style="margin-top:10px;font-size:14px"><b>Aufgabe:</b> '+a.note+'</div>':'')+
    (cancelled?
      '<div class="reveal-row" style="margin-top:8px"><span class="k">Absagegrund</span><span class="v">'+(a.cancelReason||'—')+'</span></div>'+
      (a.cancelDetail?'<div style="margin-top:8px;font-size:14px"><b>Anmerkung:</b> '+a.cancelDetail+'</div>':'')
    :'');
  let foot='<button class="btn-ghost" onclick="closeModal()">Schließen</button>';
  // Aktionen nur für den eigenen Mitarbeiter UND nur wenn nicht abgesagt
  if(currentRole==='staff'&&a.staffId===myId&&!cancelled){
    foot+='<button class="btn-danger-ghost" onclick="deleteAppt('+id+')">Absagen</button>';
    foot+='<button class="btn-primary" style="width:auto;padding:11px 20px" onclick="startTermin('+id+')">▶ Termin starten</button>';
  }
  // Admin darf einen abgesagten Termin endgültig aus dem Kalender entfernen
  if(currentRole==='admin'&&cancelled){
    foot+='<button class="btn-danger-ghost" onclick="removeCancelledAppt('+id+')">Endgültig entfernen</button>';
  }
  document.getElementById('modalFoot').innerHTML=foot;
  openModal();
}
function removeCancelledAppt(id){
  appointments=appointments.filter(a=>a.id!==id);
  if(CLOUD) cloudDelete('termine',id);
  closeModal(); toast('Abgesagter Termin entfernt'); 
  if(typeof renderAdmin==='function') renderAdmin('calendar');
}

/* ---- Termin starten: Kunde + geplante Dauer vorausgefüllt, Zeit bearbeitbar ---- */
function startTermin(id){
  const a=appointments.find(x=>x.id===id);const cu=custById(a.customerId);if(!cu)return;
  // geplante Start-/Endzeit aus Terminzeit + Dauer
  const startT=a.time||'09:00';
  const [sh,sm]=startT.split(':').map(Number);
  const endMin=sh*60+sm+(a.duration||60);
  const endT=String(Math.floor(endMin/60)).padStart(2,'0')+':'+String(endMin%60).padStart(2,'0');
  document.getElementById('modalBox').classList.remove('wide');
  document.getElementById('modalTitle').textContent='Einsatz bei '+fullName(cu);
  document.getElementById('modalBody').innerHTML=
    '<div class="summary" style="margin-bottom:14px"><div class="sh">Einsatz</div>'+
      '<b>'+fullName(cu)+'</b> · '+(cu.address||cu.area||'')+'<br>Geplant: '+a.time+' Uhr · '+(a.duration||60)+' Min.</div>'+
    '<p style="color:var(--muted);font-size:13.5px;margin-bottom:10px">Passe die Zeiten an, falls der Einsatz kürzer oder länger war.</p>'+
    '<div class="content-form">'+
      '<input type="hidden" id="te_appt" value="'+id+'"><input type="hidden" id="te_cust" value="'+cu.id+'">'+
      '<label>Datum</label><input id="te_date" type="date" value="'+(a.date||todayISO())+'">'+
      '<div class="form-row"><div><label>Beginn</label><input id="te_start" type="time" value="'+startT+'"></div>'+
      '<div><label>Ende</label><input id="te_end" type="time" value="'+endT+'"></div></div>'+
      '<label>Tätigkeit / Leistung</label><input id="te_task" value="'+(a.note||(cu.need&&cu.need[0])||'Betreuung')+'">'+
    '</div>';
  document.getElementById('modalFoot').innerHTML=
    '<button class="btn-ghost" onclick="closeModal()">Abbrechen</button>'+
    '<button class="btn-primary" style="width:auto;padding:11px 20px" onclick="confirmTermin()">Weiter zur Bestätigung →</button>';
  openModal();
}

/* ---- Kunden-Übersicht zum Vorzeigen + Unterschrift ---- */
function confirmTermin(){
  const apptId=+val('te_appt'); const cid=+val('te_cust');
  const cu=custById(cid); if(!cu)return;
  const date=val('te_date'), start=val('te_start'), end=val('te_end'), task=val('te_task')||'Betreuung';
  if(!start||!end||end<=start){ toast('Bitte gültige Start- und Endzeit angeben',true); return; }
  const mins=(()=>{const[a,b]=start.split(':').map(Number);const[c,d]=end.split(':').map(Number);return (c*60+d)-(a*60+b);})();
  const std=mins/60; const kosten=std*STUNDENSATZ;
  document.getElementById('modalBox').classList.add('wide');
  document.getElementById('modalTitle').textContent='Übersicht für '+fullName(cu);
  document.getElementById('modalBody').innerHTML=
    '<p style="color:var(--muted);font-size:13.5px;margin-bottom:14px">Bitte zeige diese Übersicht dem Kunden. Anschließend unterschreibt der Kunde den Einsatz.</p>'+
    '<div class="panel" style="margin-bottom:8px"><div class="panel-body" style="padding:18px">'+
      '<div class="reveal-row"><span class="k">Kunde</span><span class="v">'+fullName(cu)+'</span></div>'+
      '<div class="reveal-row"><span class="k">Datum</span><span class="v">'+fmtDate(date)+'</span></div>'+
      '<div class="reveal-row"><span class="k">Zeit</span><span class="v">'+start+'–'+end+' Uhr</span></div>'+
      '<div class="reveal-row"><span class="k">Leistung</span><span class="v">'+task+'</span></div>'+
      '<div class="reveal-row"><span class="k">Dauer</span><span class="v">'+std.toFixed(2).replace('.',',')+' Std.</span></div>'+
      '<div class="reveal-row"><span class="k">Stundensatz</span><span class="v">'+STUNDENSATZ.toFixed(2).replace('.',',')+' €</span></div>'+
      '<div class="reveal-row"><span class="k"><b>Kosten gesamt</b></span><span class="v"><b>'+kosten.toFixed(2).replace('.',',')+' €</b></span></div>'+
    '</div></div>';
  // Daten für den nächsten Schritt zwischenspeichern
  window.__termin={apptId:apptId, cid:cid, date:date, start:start, end:end, task:task, mins:mins};
  document.getElementById('modalFoot').innerHTML=
    '<button class="btn-ghost" onclick="closeModal()">Abbrechen</button>'+
    '<button class="btn-primary" style="width:auto;padding:11px 22px" onclick="signTermin()">✍ Jetzt unterschreiben</button>';
  openModal();
}

/* ---- Kunde unterschreibt -> Leistungsnachweis erzeugen & überall ablegen ---- */
function signTermin(){
  const t=window.__termin; if(!t)return;
  const cu=custById(t.cid); if(!cu)return;
  openSignatureModal(
    'Unterschrift Kunde – '+fullName(cu),
    'Der Kunde bestätigt mit seiner Unterschrift den Einsatz am '+fmtDate(t.date)+' ('+t.start+'–'+t.end+' Uhr).',
    function(sig){
      const date=t.date;
      // 1) Stundenzettel-Eintrag mit Unterschrift anlegen (Mitarbeiter + Admin sehen ihn)
      //    hasAbtretung=true markiert, dass dazu eine Abtretungserklärung gehört
      //    (wird nur im Admin-Bereich und im Kunden-Ordner angezeigt, NICHT beim Mitarbeiter)
      const ts={id:nextTsId++, staffId:myId, customerId:t.cid, date:date, start:t.start, end:t.end, task:t.task, status:'offen', proof:true, signature:sig, signedAt:date, hasAbtretung:true};
      timesheets.push(ts);
      if(CLOUD){ cloudInsert('stundenzettel',{mitarbeiter_id:myId,customer_id:t.cid,date:date,start:t.start,ende:t.end,task:t.task,status:'offen',proof:true,signature:sig,signed_at:date}).then(r=>{ if(r&&r.id){ ts.id=r.id; } }); }
      // 2) Leistungsnachweis-PDF erzeugen (eine Zeile = dieser Einsatz)
      const rows=[{date:fmtDate(date), leistung:t.task, stunden:t.mins/60, preis:STUNDENSATZ}];
      const doc=buildLeistungsnachweisPdf({
        name:fullName(cu),
        versNr:(cu.intern&&cu.intern.kvNr)||cu.kvNr||'',
        rows:rows, signature:sig,
        ort:(cu.city||cu.area||''), date:date
      });
      // 3) Leistungsnachweis am Kunden hinterlegen (Kunden-Ordner)
      cu.leistungsnachweise=cu.leistungsnachweise||[];
      cu.leistungsnachweise.push({date:date, task:t.task, mins:t.mins, signature:sig, staffId:myId});
      // 3b) Abtretungserklärung mit derselben Unterschrift erzeugen und am Kunden hinterlegen
      //     (erscheint NUR im Admin-Stundenzettel und im Kunden-Ordner, nicht beim Mitarbeiter)
      cu.abtretung={date:date, signature:sig};
      if(CLOUD){ cloudInsert('abtretungen',{customer_id:cu.id, signed_date:date, signature:sig}); }
      // 4) Leistungsnachweis-PDF zum Download anbieten
      if(doc) doc.save(('Leistungsnachweis_'+fullName(cu)+'_'+date).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
      // 5) Termin als erledigt entfernen (lokal + Datenbank)
      if(t.apptId){ appointments=appointments.filter(a=>a.id!==t.apptId); if(CLOUD) cloudDelete('termine',t.apptId); }
      window.__termin=null;
      toast('Einsatz abgeschlossen – Leistungsnachweis & Abtretung erstellt');
      renderStaff('hours');
    }
  );
}
function downloadTsLN(tsId){
  const t=timesheets.find(x=>x.id===tsId); if(!t)return;
  const cu=custById(t.customerId); if(!cu)return;
  const mins=tsMinutes(t);
  const doc=buildLeistungsnachweisPdf({
    name:fullName(cu),
    versNr:(cu.intern&&cu.intern.kvNr)||cu.kvNr||'',
    rows:[{date:fmtDate(t.date), leistung:t.task||'Betreuung', stunden:mins/60, preis:STUNDENSATZ}],
    signature:t.signature,
    ort:(cu.city||cu.area||''), date:t.date
  });
  if(doc) doc.save(('Leistungsnachweis_'+fullName(cu)+'_'+t.date).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
}
function deleteAppt(id){
  // Absage-Dialog mit Grund-Auswahl öffnen
  const a=appointments.find(x=>x.id===id); if(!a)return;
  const cu=custById(a.customerId);
  document.getElementById('modalTitle').textContent='Termin absagen';
  document.getElementById('modalBody').innerHTML=
    '<p style="color:var(--muted);font-size:14px;margin-bottom:14px">Termin mit <b>'+(cu?fullName(cu):'—')+'</b> am '+fmtDateLong(a.date)+' um '+a.time+' Uhr absagen.</p>'+
    '<label>Grund der Absage *</label>'+
    '<div class="cancel-reasons">'+
      ['Krankheitsbedingt','Versehentlich angenommen','Absage durch Kunde','Sonstiges'].map((r,i)=>
        '<label class="cancel-opt"><input type="radio" name="cancelReason" value="'+r+'"'+(i===0?' checked':'')+' onchange="toggleCancelDetail()"> '+r+'</label>'
      ).join('')+
    '</div>'+
    '<div id="cancelDetailWrap" style="margin-top:12px"><label>Anmerkung (optional)</label><textarea id="cancelDetail" rows="2" placeholder="Zusätzliche Information zur Absage"></textarea></div>';
  document.getElementById('modalFoot').innerHTML=
    '<button class="btn-ghost" onclick="closeModal()">Zurück</button>'+
    '<button class="btn-danger-ghost" style="width:auto;padding:11px 20px" onclick="confirmCancelAppt('+id+')">Termin absagen</button>';
  openModal();
}
function toggleCancelDetail(){
  // Bei "Sonstiges" Anmerkung als Pflicht hervorheben
  const sel=document.querySelector('input[name="cancelReason"]:checked');
  const lbl=document.querySelector('#cancelDetailWrap label');
  if(sel&&lbl){ lbl.textContent = sel.value==='Sonstiges' ? 'Bitte Grund angeben *' : 'Anmerkung (optional)'; }
}
function confirmCancelAppt(id){
  const a=appointments.find(x=>x.id===id); if(!a)return;
  const sel=document.querySelector('input[name="cancelReason"]:checked');
  const reason=sel?sel.value:'Sonstiges';
  const detail=(document.getElementById('cancelDetail')||{}).value||'';
  if(reason==='Sonstiges' && !detail.trim()){ toast('Bitte einen Grund angeben',true); return; }
  // Termin NICHT löschen, sondern als abgesagt markieren (für den Admin sichtbar)
  a.status='abgesagt';
  a.cancelReason=reason;
  a.cancelDetail=detail.trim();
  a.cancelledBy=myId;
  a.cancelledAt=todayISO();
  if(CLOUD){ cloudUpdate('termine', id, { status:'abgesagt', cancel_reason:reason, cancel_detail:detail.trim() }); }
  closeModal();
  toast('Termin abgesagt – das Büro wird informiert',true);
  renderStaff('calendar');
}

/* ============ STUNDENZETTEL (Mitarbeiter erfasst) ============ */
