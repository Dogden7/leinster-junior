export const SOURCE='https://leinsterrugby.sportlomo.com/league/217301/';
export const LEAGUE_NAME='Leinster League - Division 2A';
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export function clean(s=''){
 return s.replace(/<[^>]*>/g,'').replace(/&(?:amp|#38);/g,'&').replace(/&(?:quot|#34);/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).replace(/\s+/g,' ').trim();
}
function normalizeDate(value=''){
 return value.replace(/^(\w{3})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/,(_,day,d,m,y)=>`${day} ${Number(d)} ${MONTHS[Number(m)-1]} ${y}`);
}
function parseScore(value=''){
 const score=clean(value);
 if(!score||score==='-')return ['',''];
 const parts=score.split(/\s+V\s+/i);
 return parts.length===2?parts.map(clean):['',''];
}
function parseAttributeMatches(html){
 const matches=[];
 for(const m of html.matchAll(/<ul\b([^>]*class="[^"]*table-body (?:fixtures|results)[^"]*"[^>]*)>/g)){
  const a=Object.fromEntries([...m[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map(x=>[x[1],clean(x[2])]));
  if(a.compname&&a.compname!==LEAGUE_NAME)continue;
  if(!a.date||!a.hometeam||!a.awayteam)continue;
  const end=html.indexOf('</ul>',m.index+m[0].length);
  const fixtureId=/data-fid="(\d+)"/.exec(html.slice(m.index,end))?.[1]||null;
  matches.push({fixtureId,id:[a.date,a.hometeam,a.awayteam].join('|'),date:normalizeDate(a.date),time:a.time,home:a.hometeam,away:a.awayteam,homeScore:a.homescore,awayScore:a.awayscore,venue:a.venue,comment:a.comment,type:m[1].includes('table-body results')?'results':'fixtures'});
 }
 return matches;
}
function parseVisibleMatches(html){
 const matches=[];
 let currentDate='';
 for(const m of html.matchAll(/<ul\b([^>]*class="[^"]*table-body[^"]*"[^>]*)>([\s\S]*?)<\/ul>/g)){
  const attrs=m[1],block=m[2];
  if(/\bdate-section\b/.test(attrs)){
   currentDate=normalizeDate(clean(block));
   continue;
  }
  if(!currentDate)continue;
  const cells=[...block.matchAll(/<li\b[^>]*>([\s\S]*?)<\/li>/g)].map(x=>clean(x[1]));
  if(cells.length<6)continue;
  const fixtureId=/data-fid="(\d+)"/.exec(block)?.[1]||null;
  const [homeScore,awayScore]=parseScore(cells[2]);
  const home=cells[1],away=cells[3];
  if(!home||!away)continue;
  const type=homeScore||awayScore?'results':'fixtures';
  matches.push({fixtureId,id:[currentDate,home,away].join('|'),date:currentDate,time:cells[0],home,away,homeScore,awayScore,venue:cells[4],comment:cells[5],type});
 }
 return matches;
}
export function parse(html){
 const tableBlock=html.match(/<h3>League Table Leinster League - Division 2A<\/h3>\s*<div[\s\S]*?<table[\s\S]*?<\/table>/)?.[0]||html.match(/<h3>League Table Leinster League - Division 2A<\/h3>\s*<table[\s\S]*?<\/table>/)?.[0];
 const table=[];
 for(const row of (tableBlock||'').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)){
  const a=Object.fromEntries([...row[1].matchAll(/<td\b[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)].map(x=>[x[1],clean(x[2])]));
  if(a.Team)table.push({position:table.length+1,team:a.Team,played:a.Pld,won:a.W,drawn:a.D,lost:a.L,bonus:a.BP,points:a.Pts});
 }
 const matches=[...parseAttributeMatches(html),...parseVisibleMatches(html)];
 const unique=[...new Map(matches.map(x=>[x.id,x])).values()];
 if(!unique.length||!table.length)throw new Error('SportLoMo page format changed or league data is unavailable');
 return {matches:unique,table,source:SOURCE,season:'2026–2027',checkedAt:new Date().toISOString()};
}
