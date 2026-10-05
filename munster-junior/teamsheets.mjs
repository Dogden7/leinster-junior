import {clean} from './data.mjs';
export function parseTeamsheet(html){
 if(!html.includes('team_sheets_data'))throw Error('Invalid team sheet response');
 const side=className=>{
  const start=html.indexOf('class="'+className+'"');
  if(start<0)return [];
  const end=html.indexOf('class="awyteam_ul"',start+className.length+8);
  const block=html.slice(start,end<0?undefined:end);
  return [...block.matchAll(/<li\b[^>]*>\s*<b>(\d+)<\/b>([\s\S]*?)<\/li>/g)].map(m=>({number:Number(m[1]),name:clean(m[2])})).filter(p=>p.name);
 };
 return {home:side('hometeam_ul'),away:side('awyteam_ul')};
}
