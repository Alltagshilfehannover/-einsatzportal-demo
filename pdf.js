function buildContractPdf(opts){
  // opts: {name, text, signature, person, date}
  if(!window.jspdf || !window.jspdf.jsPDF){ toast('PDF-Bibliothek noch nicht geladen – bitte kurz warten',true); return null; }
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:'pt', format:'a4'});
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  // Kopf
  doc.setFont('helvetica','bold'); doc.setFontSize(16);
  doc.text('Alltagshilfe Hannover', margin, y); y+=20;
  doc.setFont('helvetica','normal'); doc.setFontSize(10); doc.setTextColor(110);
  doc.text('DailyDo – '+opts.name, margin, y); y+=24;
  doc.setTextColor(0);

  // Titel
  doc.setFont('helvetica','bold'); doc.setFontSize(13);
  doc.text(opts.name, margin, y); y+=18;

  // Vertragstext (umbrochen, mehrseitig)
  doc.setFont('helvetica','normal'); doc.setFontSize(10.5);
  const lines = doc.splitTextToSize(opts.text||'', pageW - margin*2);
  const lineH = 14;
  for(const ln of lines){
    if(y > pageH - margin - 120){ doc.addPage(); y = margin; }
    doc.text(ln, margin, y); y += lineH;
  }

  // Unterschriftsbereich
  if(y > pageH - margin - 140){ doc.addPage(); y = margin; }
  y += 24;
  doc.setDrawColor(180); doc.line(margin, y, pageW-margin, y); y+=22;
  doc.setFont('helvetica','bold'); doc.setFontSize(10.5);
  doc.text('Unterschrift', margin, y); y+=6;

  if(opts.signature){
    try{ doc.addImage(opts.signature, 'PNG', margin, y, 180, 70); }catch(e){}
  }
  // Name + Datum rechts
  doc.setFont('helvetica','normal'); doc.setFontSize(10);
  doc.text((opts.person||''), margin, y+92);
  doc.text('Datum: '+(opts.date||todayISO()), pageW-margin-150, y+92);

  return doc;
}
function downloadContractPdf(name, text, signature, person, date){
  const doc = buildContractPdf({name, text, signature, person, date});
  if(!doc) return;
  const safe = (name+'_'+(person||'')).replace(/[^a-zA-Z0-9_-]+/g,'_');
  doc.save(safe+'.pdf');
}

/* ============================================================
   PDF: ABTRETUNGSERKLÄRUNG (§45b SGB XI) – nach Vorlage
   Wird automatisch mit den Daten des gewählten Kunden gefüllt.
   ============================================================ */
function buildAbtretungPdf(cu, signature, date){
  if(!window.jspdf||!window.jspdf.jsPDF){ toast('PDF-Bibliothek lädt noch – bitte kurz warten',true); return null; }
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const pageW=doc.internal.pageSize.getWidth();
  const margin=52; let y=margin;
  // Briefkopf
  doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(110);
  doc.text('www.hannoverhilfe.de',margin,y); y+=16;
  doc.setTextColor(0);doc.setFont('helvetica','bold');doc.setFontSize(10.5);
  doc.text('Alltagshilfe Hannover UG (haftungsbeschränkt)',margin,y); y+=14;
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);doc.setTextColor(80);
  doc.text('Bahnhofstraße 85 · 31515 Wunstorf',margin,y); y+=12;
  doc.text('Tel: 05031 5165899 · email: info@hannoverhilfe.de',margin,y); y+=26;
  doc.setTextColor(0);
  // Titel
  doc.setFont('helvetica','bold');doc.setFontSize(14);
  doc.text('Abtretungserklärung',pageW/2,y,{align:'center'}); y+=18;
  doc.setFont('helvetica','normal');doc.setFontSize(10);
  doc.text('für zusätzliche Betreuungsleistungen (§ 45b SGB XI)',pageW/2,y,{align:'center'}); y+=30;
  // Datenzeilen (mit Kundendaten gefüllt)
  const line=(label,value)=>{
    doc.setFont('helvetica','bold');doc.setFontSize(10.5);
    doc.text(label,margin,y);
    const lw=doc.getTextWidth(label+' ');
    doc.setFont('helvetica','normal');
    doc.text(String(value||''),margin+lw+4,y);
    doc.setDrawColor(170);doc.line(margin+lw+4,y+2,pageW-margin,y+2);
    y+=22;
  };
  const it=cu.intern||{};
  line('Name','  '+fullName(cu));
  line('Straße','  '+(cu.street?cu.street+' '+(cu.houseNo||''):(cu.address||'')));
  line('Ort','  '+((cu.plz||'')+' '+(cu.city||cu.area||'')).trim());
  line('Versicherungsnummer:',(it.kvNr||cu.kvNr||''));
  line('Kranken/Pflegekasse:',(it.kasse||cu.kasse||''));
  line('Anschrift:',(cu.address||((cu.street||'')+' '+(cu.houseNo||'')+', '+(cu.plz||'')+' '+(cu.city||'')).trim()));
  // Pflegegrad / Budget / Geburtstag in einer Zeile
  doc.setFont('helvetica','bold');doc.setFontSize(10.5);
  doc.text('Pflegegrad:',margin,y); doc.setFont('helvetica','normal'); doc.text(String(cu.pgrad||''),margin+62,y);
  doc.setFont('helvetica','bold'); doc.text('Budget:',margin+150,y); doc.setFont('helvetica','normal'); doc.text(String(it.budget||cu.budget||''),margin+196,y);
  doc.setFont('helvetica','bold'); doc.text('Geburtstag:',margin+300,y); doc.setFont('helvetica','normal'); doc.text(String(cu.birth||it.birth||''),margin+360,y);
  y+=30;
  // Abtretungstext
  doc.setFont('helvetica','normal');doc.setFontSize(10.5);
  doc.text('Hiermit erteile ich eine Abtretungserklärung an',margin,y); y+=18;
  doc.setFont('helvetica','bold');
  doc.text('Alltagshilfe Hannover UG',margin,y); y+=14;
  doc.setFont('helvetica','normal');doc.setFontSize(10);
  doc.text('Bahnhofstraße 85, 31515 Wunstorf',margin,y); y+=14;
  doc.text('Institutionskennzeichen (IK) 460 353 369',margin,y); y+=22;
  const t2=doc.splitTextToSize('Alltagshilfe Hannover UG hat mein Einverständnis, erbrachte Leistungen gemäß § 45b SGB XI direkt mit meiner oben genannten Krankenkasse abzurechnen.',pageW-margin*2);
  doc.text(t2,margin,y); y+=t2.length*14+26;
  // Datum + Unterschrift
  doc.text('Datum: '+(date||todayISO()),margin,y); y+=40;
  if(signature){ try{ doc.addImage(signature,'PNG',margin,y-30,170,60); }catch(e){} }
  doc.setDrawColor(120);doc.line(margin,y+34,margin+230,y+34);
  doc.setFontSize(9.5);doc.setTextColor(90);
  doc.text('Unterschrift',margin,y+48);
  return doc;
}

/* ============================================================
   PDF: LEISTUNGSNACHWEIS (§45b Abs.1 S.3 Nr.4 SGB XI) – nach Vorlage
   Name + Versichertennummer + automatisch befüllte Leistungstabelle.
   ============================================================ */
function buildLeistungsnachweisPdf(opts){
  // opts: {name, versNr, rows:[{date,leistung,stunden,preis}], signature, ort, date}
  if(!window.jspdf||!window.jspdf.jsPDF){ toast('PDF-Bibliothek lädt noch – bitte kurz warten',true); return null; }
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const pageW=doc.internal.pageSize.getWidth(); const margin=46; let y=margin;
  doc.setFont('helvetica','bold');doc.setFontSize(11);
  const head=doc.splitTextToSize('Nachweis von Leistungen der Angebote zur Unterstützung im Alltag nach § 45b Abs. 1 Satz 3 Nr. 4 SGB XI zur Abrechnung des Entlastungsbetrages',pageW-margin*2);
  doc.text(head,margin,y); y+=head.length*15+14;
  // Name + Versichertennummer
  doc.setFont('helvetica','normal');doc.setFontSize(10.5);
  const fld=(label,val)=>{ doc.setFont('helvetica','bold');doc.text(label,margin,y); const lw=doc.getTextWidth(label+' '); doc.setFont('helvetica','normal'); doc.text(String(val||''),margin+lw+4,y); doc.setDrawColor(170); doc.line(margin+lw+4,y+2,pageW-margin,y+2); y+=22; };
  fld('Name / Vorname des Versicherten:',opts.name);
  fld('Versichertennummer:',opts.versNr);
  y+=6;
  doc.setFont('helvetica','bold');doc.text('Folgende Leistungen wurden erbracht:',margin,y); y+=18;
  // Tabelle
  const cols=[margin, margin+70, margin+320, margin+390, margin+460, pageW-margin];
  const headers=['Datum','Leistung','Std.','€/Std.','Kosten €'];
  doc.setFontSize(9);doc.setFont('helvetica','bold');doc.setFillColor(240,236,250);
  doc.rect(margin,y-11,pageW-margin*2,18,'F');
  doc.text(headers[0],cols[0]+2,y); doc.text(headers[1],cols[1]+2,y); doc.text(headers[2],cols[2]+2,y); doc.text(headers[3],cols[3]+2,y); doc.text(headers[4],cols[4]+2,y);
  y+=10; doc.setFont('helvetica','normal');
  let sumStd=0,sumKost=0;
  (opts.rows||[]).forEach(r=>{
    const kost=(r.stunden||0)*(r.preis||0); sumStd+=r.stunden||0; sumKost+=kost;
    doc.setDrawColor(210);doc.line(margin,y+4,pageW-margin,y+4);
    doc.text(String(r.date||''),cols[0]+2,y);
    const lz=doc.splitTextToSize(String(r.leistung||''),cols[2]-cols[1]-6);
    doc.text(lz,cols[1]+2,y);
    doc.text(String((r.stunden||0).toFixed(2)).replace('.',','),cols[2]+2,y);
    doc.text(String((r.preis||0).toFixed(2)).replace('.',','),cols[3]+2,y);
    doc.text(String(kost.toFixed(2)).replace('.',','),cols[4]+2,y);
    y+=Math.max(16,lz.length*12);
  });
  // Summen
  doc.setDrawColor(120);doc.line(margin,y+2,pageW-margin,y+2); y+=16;
  doc.setFont('helvetica','bold');
  doc.text('Anzahl Stunden GESAMT:',cols[1]+2,y); doc.text(String(sumStd.toFixed(2)).replace('.',','),cols[2]+2,y);
  doc.text('Kosten GESAMT:',cols[3]-40,y); doc.text(String(sumKost.toFixed(2)).replace('.',',')+' €',cols[4]+2,y);
  y+=28;
  // Bestätigungstext
  doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Bestätigung und ggf. Abtretungserklärung:',margin,y); y+=16;
  doc.setFont('helvetica','normal');doc.setFontSize(9.5);
  const bt=doc.splitTextToSize('Ich habe die dokumentierten Leistungen in Anspruch genommen und bestätige die Art und die Menge der erbrachten Leistungen. Ich trete die Ansprüche gegen meine Pflegekasse an den genannten Angebotsträger ab und beauftrage die Pflegekasse, die mir zustehenden Leistungen nach § 45b SGB XI für den o. g. Zeitraum an den im Leistungsnachweis genannten Angebotsträger auszuzahlen.',pageW-margin*2);
  doc.text(bt,margin,y); y+=bt.length*12+24;
  // Ort/Datum + Unterschrift
  doc.text((opts.ort||'')+', '+(opts.date||todayISO()),margin,y);
  if(opts.signature){ try{ doc.addImage(opts.signature,'PNG',pageW-margin-180,y-30,170,55); }catch(e){} }
  doc.setDrawColor(120);
  doc.line(margin,y+8,margin+200,y+8);
  doc.line(pageW-margin-200,y+8,pageW-margin,y+8);
  doc.setFontSize(9);doc.setTextColor(90);
  doc.text('Ort, Datum',margin,y+20);
  doc.text('Unterschrift der/des Versicherten',pageW-margin-200,y+20);
  y+=40; doc.setTextColor(0);doc.setFontSize(8.5);
  const hint=doc.splitTextToSize('Hinweis: Eine Abrechnungseinheit (1 E) entspricht einer Leistungsdauer von 45 Minuten; die Abrechnung erfolgt ausschließlich auf Basis dieser Einheiten. Angefangene Einheiten werden entsprechend der tatsächlich erbrachten Leistungszeit berücksichtigt.',pageW-margin*2);
  doc.setTextColor(110);doc.text(hint,margin,y);
  return doc;
}

/* ============================================================
   Generischer Unterschrift-Dialog (Canvas im Modal)
   ============================================================ */
function openSignatureModal(title, subtitle, callback){
  document.getElementById('modalBox').classList.remove('wide');
  document.getElementById('modalTitle').textContent=title;
  document.getElementById('modalBody').innerHTML=
    (subtitle?'<p style="color:var(--muted);font-size:13.5px;margin-bottom:12px">'+subtitle+'</p>':'')+
    '<div class="sign-pad" id="genSignPad" data-idx="gen"><canvas></canvas><div class="sign-hint" id="signhint-gen">Hier unterschreiben</div></div>'+
    '<div class="sign-actions" style="margin-top:8px"><button class="btn-ghost btn-sm" onclick="clearSign(\'gen\')">Löschen</button></div>';
  document.getElementById('modalFoot').innerHTML=
    '<button class="btn-ghost" onclick="closeModal()">Abbrechen</button>'+
    '<button class="btn-primary" style="width:auto;padding:10px 20px" id="genSignConfirm">Unterschrift bestätigen</button>';
  openModal();
  setTimeout(initSignPads,40);
  document.getElementById('genSignConfirm').onclick=function(){
    const canvas=document.querySelector('#genSignPad canvas');
    if(!canvas||!canvas.dataset.drawn){ toast('Bitte zuerst unterschreiben',true); return; }
    const data=canvas.toDataURL('image/png');
    closeModal();
    callback(data);
  };
}

/* ---- Personalfragebogen (DATEV-Vorlage) als PDF, gefüllt aus Mitarbeiterdaten ---- */
function buildPersonalfragebogenPdf(s){
  if(!window.jspdf||!window.jspdf.jsPDF){ toast('PDF-Bibliothek lädt noch – bitte kurz warten',true); return null; }
  const { jsPDF } = window.jspdf;
  const doc=new jsPDF({unit:'pt',format:'a4'});
  const pageW=doc.internal.pageSize.getWidth();
  const pageH=doc.internal.pageSize.getHeight();
  const margin=42; let y=margin;
  const it=s.intern||{};
  const g=(v)=>v?String(v):'';
  // Adresse zerlegen (falls als ganze Zeile gespeichert)
  const addr=g(it.address);

  // Kopf
  doc.setFont('helvetica','bold');doc.setFontSize(14);
  doc.text('Personalfragebogen',margin,y); y+=16;
  doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(110);
  doc.text('Zur Vorerfassung von Personaldaten für die Lohnabrechnung (DATEV). Wird vom Arbeitgeber gespeichert.',margin,y);
  doc.setTextColor(0); y+=14;
  // Firmenkopf
  doc.setDrawColor(180);doc.line(margin,y,pageW-margin,y); y+=14;
  doc.setFont('helvetica','bold');doc.setFontSize(9);
  doc.text('Firma: Alltagshilfe Hannover UG',margin,y);
  doc.text('Name: '+fullName(s),pageW/2,y);
  y+=18;

  // Hilfsfunktionen für Feldzeilen
  function section(title){
    if(y>pageH-70){ doc.addPage(); y=margin; }
    doc.setFillColor(238,233,250);doc.rect(margin,y-9,pageW-margin*2,16,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);doc.setTextColor(60,40,110);
    doc.text(title,margin+4,y+2); doc.setTextColor(0); y+=20;
  }
  function row2(l1,v1,l2,v2){
    if(y>pageH-50){ doc.addPage(); y=margin; }
    const colW=(pageW-margin*2)/2;
    field(margin,l1,v1,colW-8);
    if(l2!==undefined) field(margin+colW,l2,v2,colW-8);
    y+=24;
  }
  function field(x,label,val,w){
    doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(110);
    doc.text(label,x,y-2); doc.setTextColor(0);
    doc.setDrawColor(190);doc.line(x,y+11,x+w,y+11);
    doc.setFont('helvetica','bold');doc.setFontSize(9.5);
    const tv=doc.splitTextToSize(g(val),w); doc.text(tv[0]||'',x+2,y+9);
  }
  function check(label, checked){
    // kleine Checkbox-Zeile
    return (checked?'[X] ':'[  ] ')+label;
  }

  // Persönliche Angaben
  section('Persönliche Angaben');
  row2('Familienname', s.last, 'Vorname', s.first);
  row2('Geburtsdatum', it.birth, 'Geschlecht', s.gender||'');
  row2('Straße und Hausnummer', addr, 'Versicherungsnummer (SV)', it.kvNr);
  row2('Staatsangehörigkeit', it.citizenship||s.citizenship, 'Schwerbehindert', 'nein');
  row2('IBAN', it.iban, 'BIC', '');

  // Beschäftigung
  section('Beschäftigung');
  row2('Eintrittsdatum', it.entryDate||'', 'Beschäftigungsbetrieb', 'Alltagshilfe Hannover UG');
  row2('Berufsbezeichnung', s.role, 'Ausgeübte Tätigkeit', (s.skills||[]).join(', '));
  row2('Art der Beschäftigung', it.employment||'', 'Wöchentliche Arbeitszeit', (s.maxHours||20)+' Std.');
  row2('Stundenlohn (brutto)', (s.wage!=null?(Number(s.wage).toFixed(2).replace('.',',')+' €'):''), 'Urlaubsanspruch (Kalenderjahr)', '');

  // Steuer
  section('Steuer');
  row2('Identifikationsnummer', it.taxId, 'Steuerklasse/Faktor', it.taxClass||'');
  row2('Kinderfreibeträge', '', 'Konfession', '');

  // Sozialversicherung
  section('Sozialversicherung');
  row2('Gesetzliche Krankenkasse', it.kasse, 'DEÜV-Status', '');

  // Erklärung + Unterschriften
  if(y>pageH-150){ doc.addPage(); y=margin; }
  y+=6; doc.setFont('helvetica','bold');doc.setFontSize(9);
  doc.text('Erklärung der beschäftigten Person:',margin,y); y+=14;
  doc.setFont('helvetica','normal');doc.setFontSize(8.5);
  const decl=doc.splitTextToSize('Ich versichere, dass die vorstehenden Angaben der Wahrheit entsprechen. Ich verpflichte mich, meinem Arbeitgeber alle Änderungen, insbesondere in Bezug auf weitere Beschäftigungen (Art, Dauer und Entgelt), unverzüglich mitzuteilen.',pageW-margin*2);
  doc.text(decl,margin,y); y+=decl.length*11+24;

  // Unterschriftslinien
  const half=(pageW-margin*2)/2;
  doc.setDrawColor(120);
  doc.line(margin,y,margin+half-20,y);
  doc.line(margin+half+10,y,pageW-margin,y);
  y+=12; doc.setFontSize(8);doc.setTextColor(90);
  doc.text('Datum, Unterschrift beschäftigte Person',margin,y);
  doc.text('Datum, Unterschrift Arbeitgeber',margin+half+10,y);
  doc.setTextColor(0);

  // Fußzeile
  doc.setFontSize(7);doc.setTextColor(140);
  doc.text('Alltagshilfe Hannover UG · Bahnhofstraße 85 · 31515 Wunstorf · IK 460 353 369 · Stand 10/2024',margin,pageH-24);
  doc.setTextColor(0);
  return doc;
}
function downloadPersonalfragebogen(staffId){
  const s=staff.find(x=>x.id===staffId); if(!s){toast('Mitarbeiter nicht gefunden',true);return;}
  const doc=buildPersonalfragebogenPdf(s);
  if(doc) doc.save(('Personalfragebogen_'+fullName(s)).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
}

/* ---- Abtretungserklärung für einen Kunden ---- */
function startAbtretung(customerId){
  const cu=custById(customerId); if(!cu){toast('Kunde nicht gefunden',true);return;}
  // Wenn bereits eine unterschriebene Abtretung existiert: direkt das fertige PDF laden,
  // NICHT erneut unterschreiben lassen.
  if(cu.abtretung && cu.abtretung.signature){
    downloadAbtretung(customerId);
    toast('Abtretungserklärung heruntergeladen');
    return;
  }
  // Sonst: neue Unterschrift erfassen
  openSignatureModal(
    'Abtretungserklärung – '+fullName(cu),
    'Das Dokument wird automatisch mit den Daten von '+fullName(cu)+' gefüllt. Bitte unterschreiben lassen.',
    function(sig){
      const date=todayISO();
      if(CLOUD){ cloudInsert('abtretungen',{customer_id:cu.id, signed_date:date, signature:sig}); }
      cu.abtretung={date:date, signature:sig};
      const doc=buildAbtretungPdf(cu, sig, date);
      if(doc) doc.save(('Abtretung_'+fullName(cu)).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
      toast('Abtretungserklärung unterschrieben & gespeichert');
      if(currentRole==='admin') renderAdmin('customers');
    }
  );
}
function downloadAbtretung(customerId){
  const cu=custById(customerId); if(!cu||!cu.abtretung){toast('Noch keine Abtretung vorhanden',true);return;}
  const doc=buildAbtretungPdf(cu, cu.abtretung.signature, cu.abtretung.date);
  if(doc) doc.save(('Abtretung_'+fullName(cu)).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
}

/* ---- Leistungsnachweis: sammelt automatisch die Einsätze des Kunden ---- */
function buildLNRowsForCustomer(customerId){
  const rows=[];
  timesheets.filter(t=>t.customerId===customerId).forEach(t=>{
    const std=tsMinutes(t)/60;
    rows.push({date:fmtDate(t.date), leistung:(t.task||'Betreuung'), stunden:std, preis:STUNDENSATZ});
  });
  return rows;
}
function startLeistungsnachweis(customerId){
  const cu=custById(customerId); if(!cu){toast('Kunde nicht gefunden',true);return;}
  const rows=buildLNRowsForCustomer(customerId);
  if(!rows.length){ toast('Für diesen Kunden sind noch keine Einsätze erfasst',true); return; }
  openSignatureModal(
    'Leistungsnachweis – '+fullName(cu),
    'Name und Versichertennummer werden übernommen, die Einsätze sind automatisch eingetragen. Bitte vom Kunden unterschreiben lassen.',
    function(sig){
      const date=todayISO();
      const doc=buildLeistungsnachweisPdf({
        name:fullName(cu),
        versNr:(cu.intern&&cu.intern.kvNr)||cu.kvNr||'',
        rows:rows, signature:sig,
        ort:(cu.city||cu.area||''), date:date
      });
      if(doc) doc.save(('Leistungsnachweis_'+fullName(cu)).replace(/[^a-zA-Z0-9_-]+/g,'_')+'.pdf');
      cu.lnLast={date:date, signature:sig};
      toast('Leistungsnachweis erstellt & unterschrieben');
      if(currentRole==='admin') renderAdmin('customers');
    }
  );
}

function fillContractFor(text,s){
  let t=text; const name=fullName(s);
  const addr=(s.intern&&s.intern.address)?s.intern.address:'';
  const nameMitAnschrift = name + (addr?(', '+addr):'');
  const taetigkeit=(s.skills&&s.skills.length)?s.skills.join(' / '):'Alltagshilfe';
  t=t.split('[Name und Anschrift Arbeitnehmer]').join(nameMitAnschrift);
  t=t.split('[Mitarbeiter / Auftragnehmer]').join(nameMitAnschrift);
  t=t.split('[Mitarbeiter/Auftragnehmer]').join(nameMitAnschrift);
  t=t.split('[Mitarbeiter]').join(name);
  t=t.split('[Tätigkeitsbezeichnung]').join(taetigkeit);
  if(addr){ t=t.split('[Anschrift]').join(addr); }
  return t;
}
function downloadStaffContract(staffId, idx){
  const s=staff.find(x=>x.id===staffId); if(!s||!s.contracts||!s.contracts[idx])return;
  const ct=s.contracts[idx];
  const text=(typeof DOC_TEXTS!=='undefined'&&DOC_TEXTS[ct.name])?fillContractFor(DOC_TEXTS[ct.name],s):ct.name;
  downloadContractPdf(ct.name, text, ct.signature, fullName(s), ct.signedDate);
}
function viewContract(name, who, idx){
  const txt=(typeof DOC_TEXTS!=='undefined'&&DOC_TEXTS[name])?DOC_TEXTS[name]:name;
  let sig=null, person='', sdate='';
  if(who==='me'){ const m=me(); if(m&&m.contracts&&m.contracts[idx]){ sig=m.contracts[idx].signature; person=fullName(m); sdate=m.contracts[idx].signedDate; } }
  else if(who&&typeof who==='number'){ const s=staff.find(x=>x.id===who); if(s&&s.contracts&&s.contracts[idx]){ sig=s.contracts[idx].signature; person=fullName(s); sdate=s.contracts[idx].signedDate; } }
  document.getElementById('modalTitle').textContent=name;
  document.getElementById('modalBody').innerHTML=
    '<div class="doc-text" style="max-height:52vh;white-space:pre-wrap">'+txt+'</div>'+
    (sig?'<div style="margin-top:14px;border-top:1px solid var(--line);padding-top:12px"><div style="font-size:12px;color:var(--muted);font-weight:600">Unterschrift'+(person?' – '+person:'')+(sdate?' · '+fmtDate(sdate):'')+'</div><img src="'+sig+'" style="height:60px;margin-top:6px;border:1px solid var(--line);border-radius:7px;background:#fff"></div>':'');
  let foot='<button class="btn-ghost" onclick="closeModal()">Schließen</button>';
  if(sig){
    // PDF-Download über globalen Zwischenspeicher (vermeidet Escaping-Probleme)
    window.__lastContract={name:name, text:txt, sig:sig, person:person, date:sdate};
    foot+='<button class="btn-primary" style="width:auto;padding:10px 18px" onclick="downloadContractPdf(window.__lastContract.name, window.__lastContract.text, window.__lastContract.sig, window.__lastContract.person, window.__lastContract.date)">⬇ Als PDF</button>';
  }
  document.getElementById('modalFoot').innerHTML=foot;
  openModal();
}

