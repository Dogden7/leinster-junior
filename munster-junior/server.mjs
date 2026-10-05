import {createServer} from 'node:http';
import {readFile,writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {parse,SOURCE} from './data.mjs';
const root=fileURLToPath(new URL('.',import.meta.url));
let cache=null,inflight=null;
async function load(){
 if(cache&&Date.now()-Date.parse(cache.checkedAt)<60000)return cache;
 if(inflight)return inflight;
 inflight=(async()=>{try{
  const r=await fetch(SOURCE,{signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw new Error('Source HTTP '+r.status);
  cache=parse(await r.text());
  await writeFile(root+'snapshot.json',JSON.stringify(cache));
  return cache;
 }catch(e){
  if(!cache)try{cache=JSON.parse(await readFile(root+'snapshot.json','utf8'));}catch{}
  if(cache)return {...cache,stale:true,message:'Could not check SportLoMo. Showing the last saved data.'};
  throw e;
 }finally{inflight=null;}})();return inflight;
}
createServer(async(req,res)=>{
 const path=new URL(req.url,'http://localhost').pathname;
 try{
  if(path==='/api/league'){const data=await load();res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(data));}
  const files={'/icons/munster-share.png':'icons/munster-share.png','/':'index.html','/index.html':'index.html','/app.js':'app.js','/pwa.js':'pwa.js','/style.css':'style.css','/manifest.webmanifest':'manifest.webmanifest','/sw.js':'sw.js','/icons/icon-192.png':'icons/icon-192.png','/icons/icon-512.png':'icons/icon-512.png','/icons/icon-maskable-512.png':'icons/icon-maskable-512.png','/icons/apple-touch-icon.png':'icons/apple-touch-icon.png'};
  if(!files[path]){res.writeHead(404);return res.end('Not found');}
  const type=path.endsWith('.png')?'image/png':path.endsWith('.webmanifest')?'application/manifest+json':path.endsWith('.js')?'text/javascript':path.endsWith('.css')?'text/css':'text/html';
  res.writeHead(200,{'Content-Type':type,'Cache-Control':path==='/sw.js'?'no-cache':'no-store'});res.end(await readFile(root+'public/'+files[path]));
 }catch(e){res.writeHead(503,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'League data is temporarily unavailable. Please try again.'}));}
}).listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('Munster Junior app: http://localhost:'+(process.env.PORT||3000)));
