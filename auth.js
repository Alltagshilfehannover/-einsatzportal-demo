/* ============ LOGIN ============ */
function setRole(r){currentRole=r;
  const ra=document.getElementById('roleAdmin');
  const rs=document.getElementById('roleStaff');
  if(ra) ra.classList.toggle('active',r==='admin');
  if(rs) rs.classList.toggle('active',r==='staff');
}
function togglePass(){
  const inp=document.getElementById('pass');
  const btn=document.getElementById('passToggle');
  if(inp.type==='password'){ inp.type='text'; btn.textContent='🙈'; btn.classList.add('on'); btn.setAttribute('aria-label','Passwort verbergen'); }
  else { inp.type='password'; btn.textContent='👁'; btn.classList.remove('on'); btn.setAttribute('aria-label','Passwort anzeigen'); }
}
/* ============================================================
   ANMELDUNG / AUTHENTIFIZIERUNG
   ------------------------------------------------------------
   Diese App unterstützt zwei Modi:

   1) TEST-MODUS (USE_REAL_AUTH = false):
      Die Anmeldung akzeptiert jede Eingabe. Nur zum Ausprobieren
      der Oberfläche. KEINE echte Sicherheit. Niemals mit echten
      Personendaten verwenden.

   2) ECHTER MODUS (USE_REAL_AUTH = true):
      Die Anmeldung läuft über Supabase Auth. Passwörter werden
      NICHT in dieser Datei geprüft, sondern serverseitig bei
      Supabase. Dort werden sie mit bcrypt gehasht gespeichert
      (aktueller Sicherheitsstandard). Das Passwort verlässt den
      Browser nur verschlüsselt (HTTPS) Richtung Supabase und ist
      im Quelltext dieser Seite nirgends sichtbar.

   Umstellung auf den echten Modus (durch Entwickler):
   - USE_REAL_AUTH auf true setzen
   - In Supabase unter Authentication > Providers "Email" aktivieren
   - Mitarbeiter-/Büro-Konten in Supabase anlegen (oder per Einladung)
   - Die Rollen (Büro/Mitarbeiter) über eine Profil-Tabelle oder
     "user_metadata" steuern und per Row Level Security absichern
   ============================================================ */
const USE_REAL_AUTH = true;   // <-- Echtbetrieb aktiv: Anmeldung nur mit gültigen Zugangsdaten

/* ============================================================
   AUTOMATISCHE KONTO-ERSTELLUNG über Supabase Edge Function
   ------------------------------------------------------------
   Wenn USE_EDGE_FUNCTION = true ist, ruft "Zugangsdaten erstellen"
   die serverseitige Edge Function "create-staff-account" auf.
   Diese legt das echte Login-Konto an (mit service_role-Key, der
   NUR auf dem Server liegt) und verschickt eine Einladungs-E-Mail.

   Voraussetzung (vom Entwickler/dir einzurichten):
   1. Edge Function "create-staff-account" in Supabase deployen
   2. E-Mail-Einladungen in Supabase aktivieren
   Solange false, läuft der bisherige Weg (Profil lokal + Hinweis).
   ============================================================ */
const USE_EDGE_FUNCTION = true;  // <-- Aktiv: automatische Konto-Erstellung über Edge Function

async function callCreateStaffAccount(payload){
  // Ruft die Edge Function sicher auf. Es wird NUR die E-Mail + Profildaten
  // übertragen – niemals ein geheimer Schlüssel.
  const url = SUPABASE_URL + '/functions/v1/create-staff-account';
  const res = await fetch(url, {
    method:'POST',
    headers:{ 'Content-Type':'application/json', 'Authorization':'Bearer '+SUPABASE_KEY },
    body: JSON.stringify(payload)
  });
  let data={};
  try{ data=await res.json(); }catch(e){}
  if(!res.ok || data.error){ throw new Error(data.error || ('HTTP '+res.status)); }
  return data;
}

async function doLogin(){
  const email=document.getElementById('user').value.trim();
  const pass=document.getElementById('pass').value;

  if(USE_REAL_AUTH){
    // ---- ECHTE ANMELDUNG über Supabase Auth ----
    if(!sb){ toast('Keine Verbindung zur Datenbank',true); return; }
    if(!email||!pass){ toast('Bitte E-Mail und Passwort eingeben',true); return; }
    try{
      const { data, error } = await sb.auth.signInWithPassword({ email: email, password: pass });
      if(error){ toast('Anmeldung fehlgeschlagen: '+error.message, true); return; }
      // Rolle aus den Benutzer-Metadaten lesen (vom Entwickler zu setzen)
      const role = (data.user && data.user.user_metadata && data.user.user_metadata.role) || 'staff';
      enterApp(role, data.user);
    }catch(e){ toast('Anmeldung fehlgeschlagen',true); }
    return;
  }

  // ---- TEST-MODUS: akzeptiert jede Eingabe ----
  enterApp(currentRole, null);
}

/* Öffnet die App nach erfolgreicher Anmeldung und setzt die Rolle */
function enterApp(role, user){
  document.getElementById('loginScreen').style.display='none';
  document.getElementById('appScreen').classList.add('active');
  if(role==='admin'){
    currentRole='admin';
    document.getElementById('rolePill').textContent='Büro';
    document.getElementById('whoName').textContent= user? (user.email||'Büro') : 'Daniel D.';
    document.getElementById('whoRole').textContent='Büro / Verwaltung';
    document.getElementById('avatar').textContent='D';
    try{ renderAdmin('dashboard'); }
    catch(e){ console.error('Dashboard-Render Problem:', e&&(e.message||e)); }
  }else{
    currentRole='staff';
    // === Sichere Zuordnung: angemeldeter Benutzer -> eigenes Profil ===
    // Die E-Mail verbindet das Login-Konto (Supabase) mit dem
    // Mitarbeiter-Datensatz (Tabelle "mitarbeiter"). Jeder sieht NUR
    // sein eigenes Profil. Wird kein passendes Profil gefunden, wird
    // KEIN fremdes Profil geöffnet (kein Fallback auf staff[0]).
    let found=null;
    if(USE_REAL_AUTH){
      const mail=(user&&user.email||'').toLowerCase();
      found=staff.find(s=>(s.login||'').toLowerCase()===mail || (s.email||'').toLowerCase()===mail);
      if(!found){
        // Kein eigenes Profil hinterlegt -> nicht in fremdes Profil lassen
        document.getElementById('appScreen').classList.remove('active');
        document.getElementById('loginScreen').style.display='grid';
        toast('Für dieses Konto ist noch kein Mitarbeiterprofil hinterlegt. Bitte wende dich an das Büro.',true);
        if(USE_REAL_AUTH && sb){ try{ sb.auth.signOut(); }catch(e){} }
        return;
      }
      myId=found.id;
    }else{
      // Test-Modus ohne echte Anmeldung: ersten Mitarbeiter nehmen
      if(!staff.find(s=>s.id===myId)){ myId=staff.length?staff[0].id:0; }
    }
    const m=me();
    if(!m){ toast('Profil konnte nicht geladen werden',true); return; }
    document.getElementById('rolePill').textContent='Mitarbeiter';
    document.getElementById('whoName').textContent=m.first+' '+(m.last?m.last[0]+'.':'');
    document.getElementById('whoRole').textContent=m.role;
    document.getElementById('avatar').textContent=initials(m);
    renderStaff('board');
  }
}

async function logout(){
  // Bei echtem Modus die Supabase-Sitzung beenden
  if(USE_REAL_AUTH && sb){ try{ await sb.auth.signOut(); }catch(e){} }
  document.getElementById('appScreen').classList.remove('active');
  document.getElementById('loginScreen').style.display='grid';
  document.getElementById('user').value='';document.getElementById('pass').value='';
  closeModal();setRole('admin');
}

async function showForgot(){
  const email=prompt('Passwort zurücksetzen\n\nGib deine E-Mail-Adresse ein. Du erhältst dann einen Link zum Zurücksetzen.');
  if(email===null) return;
  if(!email || email.indexOf('@')<1){ toast('Bitte eine gültige E-Mail-Adresse eingeben',true); return; }

  if(USE_REAL_AUTH && sb){
    // ---- ECHTER Passwort-Reset über Supabase ----
    // Supabase verschickt automatisch eine E-Mail mit sicherem Reset-Link.
    try{
      const { error } = await sb.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin
      });
      if(error){ toast('Fehler: '+error.message, true); return; }
      toast('Wenn ein Konto existiert, wurde ein Reset-Link an '+email+' gesendet.');
    }catch(e){ toast('Aktion fehlgeschlagen',true); }
    return;
  }
  // Test-Modus: nur Hinweis
  toast('Wenn ein Konto existiert, wurde ein Reset-Link an '+email+' gesendet.');
}

/* ============ NAVIGATION ============ */
document.getElementById('pass').addEventListener('keydown',e=>{if(e.key==='Enter')doLogin();});

/* Beim Laden: Verbindung zur Datenbank aufbauen */
window.addEventListener('load',function(){ startApp(); });

// Einladungs-/Reset-Token GANZ FRÜH sichern, bevor Supabase die URL aufräumt
var INVITE_HASH = (typeof window!=='undefined' && window.location && window.location.hash) ? window.location.hash : '';
var INVITE_PENDING = INVITE_HASH.indexOf('access_token')>-1 && (INVITE_HASH.indexOf('type=invite')>-1 || INVITE_HASH.indexOf('type=recovery')>-1 || INVITE_HASH.indexOf('type=signup')>-1);

async function startApp(){
  await bootCloud();        // Daten aus Supabase laden (Badge setzen)
  await checkInviteLink();  // Einladungs-/Reset-Link behandeln (zeigt Passwort-Dialog)
  if(!INVITE_PENDING){      // Nur wenn KEIN Einladungslink offen ist, automatisch anmelden
    await restoreSession();
  }
}

/* ============================================================
   ANMELDUNG NACH NEULADEN WIEDERHERSTELLEN
   ------------------------------------------------------------
   Prüft beim Start, ob noch eine gültige Supabase-Sitzung besteht.
   Wenn ja, wird der Nutzer automatisch wieder in die App gelassen
   (kein erneutes Anmelden nötig nach Seiten-Neuladen).
   ============================================================ */
async function restoreSession(){
  if(!USE_REAL_AUTH) return;
  // Wenn gerade ein Einladungs-/Reset-Link offen ist, NICHT automatisch einloggen
  if((window.location.hash||'').indexOf('access_token')>-1) return;
  // Warten bis der Client bereit ist
  let tries=0; while(!sb && tries<30){ await new Promise(r=>setTimeout(r,150)); tries++; }
  if(!sb) return;
  try{
    const { data } = await sb.auth.getSession();
    if(data && data.session && data.session.user){
      const user=data.session.user;
      const role=(user.user_metadata && user.user_metadata.role) || 'staff';
      enterApp(role, user);
    }
  }catch(e){ console.error('Sitzung wiederherstellen fehlgeschlagen:', e&&(e.message||e)); }
}

/* ============================================================
   EINLADUNGS-/PASSWORT-SETZEN-ABLAUF
   ------------------------------------------------------------
   Wenn jemand über den Einladungs- oder Passwort-Reset-Link von
   Supabase auf die Seite kommt, steht ein Token in der Adresse
   (nach dem #). Die App erkennt das und zeigt einen Dialog zum
   Festlegen des eigenen Passworts.
   ============================================================ */
async function checkInviteLink(){
  // Den FRÜH gesicherten Hash verwenden (Supabase könnte die URL schon geleert haben)
  const hash = INVITE_HASH || window.location.hash || '';
  if(hash.indexOf('access_token')===-1) return;
  const params = new URLSearchParams(hash.replace(/^#/,''));
  const type = params.get('type'); // invite | recovery | signup
  const access_token = params.get('access_token');
  const refresh_token = params.get('refresh_token');
  // Supabase-Client muss bereit sein
  let tries=0;
  while(!sb && tries<30){ await new Promise(r=>setTimeout(r,150)); tries++; }
  if(!sb){ alert('Verbindung zur Datenbank noch nicht bereit – bitte Seite neu laden.'); return; }
  // Sitzung AUSDRÜCKLICH aus den Token des Links aktivieren
  try{
    if(access_token && refresh_token){
      const { error } = await sb.auth.setSession({ access_token, refresh_token });
      if(error){ console.error('setSession Fehler:', error.message); }
    } else {
      // Falls Supabase die Sitzung schon selbst aktiviert hat (detectSessionInUrl)
      // ist das ok – die Sitzung besteht dann bereits.
    }
  }catch(e){ console.error('setSession Ausnahme:', e&&(e.message||e)); }
  // URL aufräumen, damit der Token nicht sichtbar bleibt
  try{ history.replaceState(null, '', window.location.pathname + window.location.search); }catch(e){}
  showSetPasswordDialog(type);
}
function showSetPasswordDialog(type){
  const ls=document.getElementById('loginScreen'); if(ls) ls.style.display='none';
  const as=document.getElementById('appScreen'); if(as) as.classList.remove('active');
  const w=document.getElementById('wizard'); if(w) w.classList.remove('active');
  document.getElementById('modalBox').classList.remove('wide');
  document.getElementById('modalTitle').textContent = (type==='recovery')?'Neues Passwort festlegen':'Willkommen – Passwort festlegen';
  document.getElementById('modalBody').innerHTML=
    '<p style="color:var(--muted);font-size:14px;margin-bottom:14px">Lege jetzt dein persönliches Passwort fest. Danach kannst du dich damit anmelden.</p>'+
    '<div class="field"><label>Neues Passwort</label><input id="setpw1" type="password" placeholder="mindestens 8 Zeichen"></div>'+
    '<div class="field" style="margin-top:10px"><label>Passwort wiederholen</label><input id="setpw2" type="password" placeholder="nochmals eingeben"></div>';
  document.getElementById('modalFoot').innerHTML=
    '<button class="btn-primary" style="width:auto;padding:11px 22px" onclick="saveNewPassword()">Passwort speichern</button>';
  openModal();
}
async function saveNewPassword(){
  const p1=document.getElementById('setpw1').value;
  const p2=document.getElementById('setpw2').value;
  if(!p1||p1.length<8){ toast('Bitte mindestens 8 Zeichen',true); return; }
  if(p1!==p2){ toast('Die Passwörter stimmen nicht überein',true); return; }
  if(!sb){ toast('Keine Verbindung zur Datenbank',true); return; }
  // Sicherstellen, dass wirklich eine Sitzung aus dem Einladungslink aktiv ist
  let sessionOk=false;
  try{
    const { data } = await sb.auth.getSession();
    sessionOk = !!(data && data.session);
  }catch(e){}
  if(!sessionOk){
    toast('Sitzung abgelaufen. Bitte den Link aus der E-Mail erneut öffnen.',true);
    return;
  }
  try{
    const { data, error } = await sb.auth.updateUser({ password: p1 });
    if(error){ toast('Fehler: '+error.message, true); return; }
    if(!data || !data.user){ toast('Passwort konnte nicht gesetzt werden – bitte Link erneut öffnen.',true); return; }
    closeModal();
    history.replaceState(null, '', window.location.pathname + window.location.search);
    INVITE_PENDING=false; INVITE_HASH='';
    // Frische Daten laden (falls das Mitarbeiterprofil gerade erst angelegt wurde)
    try{ await loadFromCloud(); }catch(e){}
    // DIREKT einloggen mit der bereits aktiven Sitzung -> ins eigene Profil
    const user=data.user;
    const role=(user.user_metadata && user.user_metadata.role) || 'staff';
    toast('Passwort gespeichert – willkommen!');
    enterApp(role, user);
  }catch(e){ toast('Aktion fehlgeschlagen: '+(e&&(e.message||e)),true); }
}
