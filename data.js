let currentRole='admin';
let custSearch='', custFilter='alle', staffSearch='', staffFilter='alle';
const SKILLS=['Haushaltshilfe','Einkaufsservice','Begleitdienste','Organisatorische Hilfe','Digitale Fragen'];
const WEEKDAYS=['Mo','Di','Mi','Do','Fr','Sa','So'];
const FREQ_UNITS=['pro Woche','alle 2 Wochen','pro Monat','nach Bedarf'];
const STUNDENSATZ=40; // Kundensatz in € pro Stunde (zentral änderbar)
let myId=0;

/* Mitarbeiter: jetzt mit internen Verwaltungsfeldern + Zugangsdaten */
let staff=[
  {id:0,first:'Ivonne',last:'Bengsch',role:'Haushaltshilfe',status:'aktiv',skills:['Haushaltshilfe','Begleitung'],area:'Hannover',phone:'0171 1112233',email:'ivonne@alltagshilfe.de',maxHours:30,days:['Mo','Di','Mi','Do','Fr'],window:'Vormittags',
    wage:14.50,bonus:{earned:50,pending:50,reason:'Führungszeugnis + Erste-Hilfe nachgereicht'},daysWorked:18,color:'#0f5b63',
    login:'ivonne@alltagshilfe.de',hasLogin:true,
    contracts:[{name:'Arbeitsvertrag',signedDate:'2024-03-01',signature:null},{name:'Datenschutzvertrag',signedDate:'2024-03-01',signature:null},{name:'NDA',signedDate:'2024-03-01',signature:null},{name:'Haftungserklärung',signedDate:'2024-03-01',signature:null}],
    intern:{birth:'14.03.1985',address:'Lindener Marktplatz 2, 30449 Hannover',taxId:'12 345 678 901',taxClass:'I',kvNr:'A123456789',kasse:'AOK Niedersachsen',employment:'Midijob',citizenship:'Deutsch',iban:'DE12 3456 7890 1234 5678 90'}},
  {id:1,first:'Natalie',last:'Nagel',role:'Betreuungskraft',status:'aktiv',skills:['Betreuung','Begleitung'],area:'Garbsen',phone:'0171 4445566',email:'natalie@alltagshilfe.de',maxHours:25,days:['Mo','Mi','Fr'],window:'Nachmittags',
    wage:15.00,bonus:{earned:0,pending:100,reason:'Führungszeugnis + Erste-Hilfe ausstehend'},daysWorked:55,color:'#e08a2b',
    login:'natalie@alltagshilfe.de',hasLogin:true,
    intern:{birth:'22.07.1990',address:'Planetenring 12, 30823 Garbsen',taxId:'98 765 432 109',taxClass:'IV',kvNr:'B987654321',kasse:'TK',employment:'Minijob',citizenship:'Deutsch',iban:'DE98 7654 3210 9876 5432 10'}},
  {id:2,first:'Silvana',last:'Flasbart',role:'Haushaltshilfe',status:'Urlaub',skills:['Haushaltshilfe'],area:'Wunstorf',phone:'0171 7778899',email:'silvana@alltagshilfe.de',maxHours:20,days:['Di','Do'],window:'Flexibel',
    wage:14.00,bonus:{earned:100,pending:0,reason:'Alle Nachweise vollständig'},daysWorked:64,color:'#2c6e9b',
    login:'silvana@alltagshilfe.de',hasLogin:true,
    intern:{birth:'03.11.1978',address:'Bahnhofstraße 5, 31515 Wunstorf',taxId:'45 678 901 234',taxClass:'III',kvNr:'C456789012',kasse:'Barmer',employment:'Teilzeit',citizenship:'Deutsch',iban:'DE45 6789 0123 4567 8901 23'}},
];

/* Kunden: jetzt mit Häufigkeit (Zahl + Einheit) und internen Feldern */
let customers=[
  {id:0,first:'Margarete',last:'Hoffmann',area:'Hannover-Linden',address:'Falkenstraße 14, 30449 Hannover',phone:'0511 / 22 33 44',need:['Haushaltshilfe'],freqNum:2,freqUnit:'pro Woche',window:'Vormittags',pet:'Hund (klein)',pgrad:'2',status:'aktiv',contact:'Tochter: Sabine H., 0171 2345678',notes:'Schlüssel beim Nachbarn (Whg. 3). Hund „Bruno“ ist freundlich.',intern:{kvNr:'K-1001',kasse:'AOK',budget:'§45a – 131 €/Monat',budgetUsed:'40 €'}},
  {id:1,first:'Heinrich',last:'Vogt',area:'Hannover-List',address:'Bödekerstraße 90, 30161 Hannover',phone:'0511 / 88 77 66',need:['Begleitung'],freqNum:1,freqUnit:'nach Bedarf',window:'Termingebunden',pet:'Kein Haustier',pgrad:'1',status:'aktiv',contact:'Sohn: Markus V., 0160 9988776',notes:'Rollator. Bitte 15 Min. vor Termin da sein.',intern:{kvNr:'K-1002',kasse:'TK',budget:'§45a – 131 €/Monat',budgetUsed:'0 €'}},
  {id:2,first:'Elfriede',last:'Kranz',area:'Garbsen',address:'Planetenring 7, 30823 Garbsen',phone:'05131 / 44 55 66',need:['Betreuung','Haustier ok'],freqNum:3,freqUnit:'pro Woche',window:'Nachmittags',pet:'Katze',pgrad:'3',status:'aktiv',contact:'Betreuerin: Frau Adam, 0511 333222',notes:'Mag Gesellschaftsspiele und Spaziergänge.',intern:{kvNr:'K-1003',kasse:'DAK',budget:'§45a – 131 €/Monat',budgetUsed:'90 €'}},
  {id:3,first:'Karl-Otto',last:'Reimann',area:'Wunstorf',address:'Bahnhofstraße 12, 31515 Wunstorf',phone:'05031 / 77 88 99',need:['Haushaltshilfe'],freqNum:1,freqUnit:'pro Woche',window:'Flexibel',pet:'Kein Haustier',pgrad:'2',status:'Interessent',contact:'—',notes:'Wohnung 2. OG ohne Aufzug.',intern:{kvNr:'K-1004',kasse:'Barmer',budget:'§45a – 131 €/Monat',budgetUsed:'0 €'}},
];

/* Aufträge: verweisen per customerId auf einen Kunden */
let jobs=[
  {id:1,customerId:0,title:'Haushaltshilfe & Einkauf',skills:['Haushaltshilfe','Begleitung'],status:'available',assignedTo:null,rejectedBy:[]},
  {id:2,customerId:1,title:'Begleitung zu Arztterminen',skills:['Begleitung'],status:'available',assignedTo:null,rejectedBy:[]},
  {id:3,customerId:2,title:'Betreuung & Gesellschaft',skills:['Betreuung','Haustier ok'],status:'available',assignedTo:null,rejectedBy:[]},
  {id:4,customerId:3,title:'Haushaltshilfe (Wäsche & Reinigung)',skills:['Haushaltshilfe'],status:'available',assignedTo:null,rejectedBy:[]},
];

/* Bewerbungen: Status-Workflow neu→geprüft→wartet-auf-zugang→verschickt(aktiv) */
let applications=[
  {id:1,first:'Thomas',last:'Berger',email:'t.berger@email.de',phone:'0151 22233344',area:'Hannover',citizenship:'Deutsch',skills:['Haushaltshilfe','Begleitung'],motivation:'Möchte gerne im sozialen Bereich arbeiten und habe Erfahrung in der Altenpflege.',status:'neu',
    docs:{Arbeitsvertrag:true,Datenschutzvertrag:true,NDA:true,Haftungserklärung:true},idFront:true,idBack:true,selfie:true,agb:true},
];

let nextStaffId=3, nextCustomerId=4, nextJobId=5, nextAppId=2;

/* Termine, Stundeneinträge, Leistungsnachweise, Notizen */
let appointments=[
  {id:1,staffId:0,customerId:0,date:'2026-06-11',time:'09:00',duration:120,note:'Einkauf + Reinigung'},
  {id:2,staffId:0,customerId:2,date:'2026-06-12',time:'14:00',duration:90,note:'Gesellschaft & Spaziergang'},
];
let timesheets=[
  {id:1,staffId:0,customerId:0,date:'2026-06-09',start:'09:00',end:'11:00',task:'Haushaltshilfe & Einkauf',status:'offen',proof:false},
  {id:90,staffId:0,customerId:0,date:'2026-06-02',start:'09:00',end:'12:00',task:'Haushaltshilfe & Einkauf',status:'freigegeben',proof:true},
  {id:91,staffId:0,customerId:2,date:'2026-06-04',start:'14:00',end:'17:30',task:'Betreuung & Gesellschaft',status:'freigegeben',proof:true},
];
let notes=[
  {id:1,type:'staff',refId:0,text:'Sehr zuverlässig, kommt immer pünktlich.',visibility:'intern',date:'2026-06-01'},
  {id:2,type:'customer',refId:2,text:'Mag keine Unterbrechungen beim Mittagsschlaf (13–14 Uhr).',visibility:'mitarbeiter',date:'2026-06-03'},
];
let proofs=[]; 
let payrolls=[
  {id:1,staffId:0,month:'Mai 2026',hours:42,gross:'546,00 €',status:'bereit'},
];
let nextApptId=3, nextTsId=92, nextNoteId=3, nextProofId=1, nextPayrollId=2;

/* ============================================================
   SUPABASE-ANBINDUNG (Testphase)
   ============================================================ */
