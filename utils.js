function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function fmtDate(iso){if(!iso)return '';const p=iso.split('-');return p.length===3?p[2]+'.'+p[1]+'.'+p[0]:iso;}
function fmtDateLong(iso){if(!iso)return '';const[y,m,d]=iso.split('-');const days=['So','Mo','Di','Mi','Do','Fr','Sa'];const months=['Jan','Feb','März','Apr','Mai','Juni','Juli','Aug','Sep','Okt','Nov','Dez'];const dt=new Date(+y,+m-1,+d);return days[dt.getDay()]+', '+(+d)+'. '+months[+m-1]+' '+y;}
function diffMinutes(start,end){const a=start.split(':'),b=end.split(':');return (parseInt(b[0])*60+parseInt(b[1]))-(parseInt(a[0])*60+parseInt(a[1]));}
function minToH(min){if(min<0)min=0;const h=Math.floor(min/60),m=min%60;return h+'h'+(m?' '+m+'min':'');}

function me(){return staff.find(s=>s.id===myId);}
function staffName(id){const s=staff.find(x=>x.id===id);return s?s.first+' '+s.last[0]+'.':'—';}
function fullName(o){return o.first+' '+o.last;}
function initials(o){return (o.first[0]||'')+(o.last[0]||'');}
function custById(id){return customers.find(c=>c.id===id);}
function availableForMe(){return jobs.filter(j=>j.status==='available'&&!j.rejectedBy.includes(myId));}
function freqText(c){return c.freqUnit==='nach Bedarf'?'nach Bedarf':(c.freqNum+'× '+c.freqUnit);}

function openModal(){document.getElementById('modalBg').classList.add('show');}
function closeModal(){document.getElementById('modalBg').classList.remove('show');document.getElementById('modalBox').classList.remove('wide');}
function segPick(btn,group){document.querySelectorAll('#'+group+' button').forEach(b=>b.classList.remove('on'));btn.classList.add('on');}
function head(t,s){return '<div class="page-head"><div><h1>'+t+'</h1><p>'+s+'</p></div></div>';}
function stat(l,v,f){return '<div class="stat"><div class="label">'+l+'</div><div class="value">'+v+'</div><div class="foot">'+f+'</div></div>';}
function statClick(l,v,f,fn){return '<div class="stat click" onclick="'+fn+'"><div class="label">'+l+'</div><div class="value">'+v+'</div><div class="foot">'+f+'</div></div>';}
function placeholder(icon,t,s){return '<div class="panel"><div class="empty"><div class="big">'+icon+'</div><b>'+t+'</b><p style="margin-top:6px;max-width:46ch;margin-inline:auto">'+s+'</p></div></div>';}
function jobStatusTag(j){return j.status==='available'?'<span class="tag amber">verfügbar</span>':'<span class="tag green">angenommen</span>';}
function statusTag(s){return s==='aktiv'?'<span class="tag green">aktiv</span>':'<span class="tag amber">'+s+'</span>';}
function statusBanner(s){return '<div class="panel" style="margin-bottom:18px"><div style="padding:14px 18px;display:flex;align-items:center;gap:10px;background:var(--amber-soft)"><span style="font-size:18px">⏸</span><div><b>Status: '+s+'</b> <span style="color:var(--muted)">– du nimmst aktuell keine neuen Aufträge an. Im Profil änderbar.</span></div></div></div>';}
function val(id){const e=document.getElementById(id);return e?e.value.trim():'';}
let toastTimer;
function toast(msg,warn){
  const t=document.getElementById('toast');
  document.getElementById('toastMsg').textContent=msg;
  t.classList.toggle('warn',!!warn);t.classList.add('show');
  clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2800);
}
