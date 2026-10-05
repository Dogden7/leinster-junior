const $=s=>document.querySelector(s);
function saved(k,fallback){try{return JSON.parse(localStorage.getItem(k))??fallback;}catch{return fallback;}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}
let data=saved('mj-data',null)||window.MJ_SNAPSHOT,tab='results',club=saved('mj-club',''),history=saved('mj-history',[]),busy=false;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short=s=>s.replace(/ RFC 1st XV$/,'');
function clubName(name){
 const logo=window.MJ_LOGOS?.[name];
 const initials=short(name).split(/\s+/).slice(0,2).map(w=>w[0]).join('');
 return '<span class="club-name">'+(logo?'<img class="club-crest" src="'+esc(logo)+'" alt="" width="36" height="36">':'<span class="club-initials" aria-hidden="true">'+esc(initials)+'</span>')+'<span>'+esc(short(name))+'</span></span>';
}
const score=s=>/^\d+/.exec(s)?.[0]||s||'—';
function track(next){
 const prev=saved('mj-data',null);
 if(prev){
  const old=new Map(prev.matches.map(m=>[m.id,m]));
  for(const m of next.matches){const p=old.get(m.id);
   if((!p&&m.type==='results')||(p&&JSON.stringify(p)!==JSON.stringify(m))){history.unshift({id:m.id,home:m.home,away:m.away,text:short(m.home)+' '+score(m.homeScore)+' – '+score(m.awayScore)+' '+short(m.away),detail:m.date+' · '+(m.comment||m.venue),at:next.checkedAt});}
  }
  if(JSON.stringify(prev.table)!==JSON.stringify(next.table))history.unshift({text:'League table updated',detail:'Check the latest standings.',at:next.checkedAt});
 }
 history=history.slice(0,100);save('mj-history',history);save('mj-data',next);
}
function render(){
 $('#count').textContent=history.length;
 if(!data)return;
 if(tab==='table'){
  $('#content').innerHTML='<h2>The standings</h2><div class="table-wrap"><table><thead><tr>'+['#','Club','P','W','D','L','BP','Pts'].map(x=>'<th scope="col">'+x+'</th>').join('')+'</tr></thead><tbody>'+data.table.map(r=>'<tr class="'+(r.team===club?'favorite':'')+'"><td>'+esc(r.position)+'</td><td>'+clubName(r.team)+'</td>'+[r.played,r.won,r.drawn,r.lost,r.bonus,r.points].map(x=>'<td>'+esc(x)+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';return;
 }
 if(tab==='changes'){
  const items=history.filter(x=>!club||!x.home||x.home===club||x.away===club);
  $('#content').innerHTML='<h2>Since your first visit</h2>'+ (items.length?items.map(x=>'<article class="change"><strong>'+esc(x.text)+'</strong><p>'+esc(x.detail)+' · Detected '+esc(new Date(x.at).toLocaleString('en-IE',{timeZone:'Europe/Dublin'}))+'</p></article>').join(''):'<p class="empty">No changes detected yet. New results and fixture changes will appear here after a successful check.</p>');return;
 }
 const items=data.matches.filter(m=>m.type===tab&&(!club||m.home===club||m.away===club)).sort((a,b)=>(Date.parse(a.date)-Date.parse(b.date))*(tab==='results'?-1:1));
 let date='';
 $('#content').innerHTML=items.length?items.map(m=>{let heading='';if(date!==m.date){date=m.date;heading='<h2>'+esc(date)+'</h2>';}
  const changed=history.some(h=>h.id===m.id);
  return heading+'<article class="match '+(changed?'changed':'')+'"><div class="team">'+clubName(m.home)+'</div><div class="score">'+(tab==='results'?esc(score(m.homeScore))+' – '+esc(score(m.awayScore)):esc(m.time||'TBC'))+'</div><div class="team away">'+clubName(m.away)+'</div><div class="meta">'+esc(m.venue||'Venue TBC')+(m.comment?' · '+esc(m.comment):'')+(changed?' · Updated since first visit':'')+'</div></article>';
 }).join(''):'<p class="empty">No '+esc(tab)+' published for this selection.</p>';
}
async function refresh(){
 if(busy)return;busy=true;$('#refresh').disabled=true;$('#status').textContent='Checking SportLoMo…';
 try{
  const r=await fetch('/api/league',{signal:AbortSignal.timeout(12000)});if(!r.ok)throw Error();const next=await r.json();
  if(!Array.isArray(next.matches)||!Array.isArray(next.table)||!next.checkedAt)throw Error();
  if(!next.stale)track(next);data=next;
  $('#club').innerHTML='<option value="">All clubs</option>'+next.table.map(r=>'<option value="'+esc(r.team)+'">'+esc(short(r.team))+'</option>').join('');
  if(!next.table.some(r=>r.team===club))club='';$('#club').value=club;
  $('#status').textContent=(next.stale?'Saved data · Unable to check source. Last successful check: ':'Last successful check: ')+new Date(next.checkedAt).toLocaleString('en-IE',{timeZone:'Europe/Dublin'})+' (Ireland)';render();
 }catch{
  if(!data)data=saved('mj-data',null);
  $('#status').textContent=data?'Saved preview · Live connection unavailable. Data last checked '+new Date(data.checkedAt).toLocaleString('en-IE',{timeZone:'Europe/Dublin'})+' (Ireland).':'Unable to load SportLoMo. Please try Refresh shortly.';render();
 }finally{busy=false;$('#refresh').disabled=false;}
}
$('#refresh').onclick=refresh;
$('#club').onchange=e=>{club=e.target.value;save('mj-club',club);render();};
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;document.querySelectorAll('[data-tab]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));render();});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh();});
setInterval(()=>{if(!document.hidden)refresh();},300000);
if(data){
 $('#club').innerHTML='<option value="">All clubs</option>'+data.table.map(r=>'<option value="'+esc(r.team)+'">'+esc(short(r.team))+'</option>').join('');
 if(!data.table.some(r=>r.team===club))club='';$('#club').value=club;
 $('#status').textContent='Saved data · Checking live connection…';render();
}
refresh();
