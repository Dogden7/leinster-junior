(async()=>{
 const guide=document.querySelector('.iphone-guide');
 if(window.matchMedia('(display-mode: standalone)').matches||navigator.standalone)guide.hidden=true;
 window.addEventListener('appinstalled',()=>{guide.hidden=true;});
 if(!('serviceWorker' in navigator)||!window.isSecureContext||!['http:','https:'].includes(location.protocol))return;
 try{
  const response=await fetch('./manifest.webmanifest');
  if(!response.ok)return;
  const manifest=await response.json();
  if(manifest.name!=='Munster Junior Rugby')return;
  await navigator.serviceWorker.register('./sw.js');
 }catch{}
})();
