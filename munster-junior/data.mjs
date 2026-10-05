export const SOURCE='https://munsterrugby.sportlomo.com/league/216469/';
export function clean(s=''){return s.replace(/<[^>]*>/g,'').replace(/&(?:amp|#38);/g,'&').replace(/&(?:quot|#34);/g,'"').replace(/&#0?39;|&apos;/g,"'").replace(/&nbsp;/g,' ').replace(/&#(\d+);/g,(_,n)=>String.fromCodePoint(+n)).trim();}
export function parse(html){
 const matches=[];
 for(const m of html.matchAll(/<ul\b([^>]*class="[^"]*table-body (?:fixtures|results)[^"]*"[^>]*)>/g)){
  const a=Object.fromEntries([...m[1].matchAll(/data-([\w-]+)="([^"]*)"/g)].map(x=>[x[1],clean(x[2])]));
  if(a.compname!=='Junior League Division 1')continue;
  matches.push({id:[a.date,a.hometeam,a.awayteam].join('|'),date:a.date,time:a.time,home:a.hometeam,away:a.awayteam,homeScore:a.homescore,awayScore:a.awayscore,venue:a.venue,comment:a.comment,type:m[1].includes('table-body results')?'results':'fixtures'});
 }
 const tableBlock=html.match(/<h3>League Table Junior League Division 1<\/h3>\s*<table[\s\S]*?<\/table>/)?.[0];
 const table=[];
 for(const row of (tableBlock||'').matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)){
  const a=Object.fromEntries([...row[1].matchAll(/<td\b[^>]*data-title="([^"]+)"[^>]*>([\s\S]*?)<\/td>/g)].map(x=>[x[1],clean(x[2])]));
  if(a.Team)table.push({position:table.length+1,team:a.Team,played:a.Pld,won:a.W,drawn:a.D,lost:a.L,bonus:a.BP,points:a.Pts});
 }
 if(!matches.length||!table.length)throw new Error('SportLoMo page format changed or league data is unavailable');
 return {matches:[...new Map(matches.map(x=>[x.id,x])).values()],table,source:SOURCE,season:'2026–2027',checkedAt:new Date().toISOString()};
}
