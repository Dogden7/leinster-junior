(async()=>{
 const help=document.querySelector('#install-help'),button=document.querySelector('#install');
 if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone){document.querySelector('.install-panel').hidden=true;}
 if(!('serviceWorker' in navigator)||!window.isSecureContext||!['http:','https:'].includes(location.protocol))return;
 let prompt;
 window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();prompt=event;button.hidden=false;help.textContent='Install for a home-screen shortcut and access to saved results offline.';});
 button.onclick=async()=>{if(!prompt)return;button.disabled=true;try{await prompt.prompt();await prompt.userChoice;}finally{prompt=null;button.hidden=true;button.disabled=false;}};
 window.addEventListener('appinstalled',()=>{document.querySelector('.install-panel').hidden=true;prompt=null;});
 try{
  // A file preview can be served by another origin. Only register on our app server.
  const response=await fetch('./manifest.webmanifest');
  if(!response.ok) return;
  const manifest=await response.json();
  if(manifest.name!=='Munster Junior Rugby')return;
  await navigator.serviceWorker.register('./sw.js');
  await navigator.serviceWorker.ready;
  const ios=/iPad|iPhone|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  help.textContent=ios?'On iPhone: open in Safari, tap Share, then Add to Home Screen. Saved results remain available offline.':'Use Install app when available, or your browser’s menu to install or add to your home screen. Saved results remain available offline.';
 }catch{help.textContent='Installation is not available in this preview. Open the HTTPS-hosted app to install it.';}
})();
