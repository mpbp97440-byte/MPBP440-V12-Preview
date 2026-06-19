
let drafts = { news: [], featured: {}, live: {}, gallery: [], videos: [], releases: [], countdowns: [], events: [] };
let preparedMedia = { file:null, filename:'', path:'', url:'' };

async function loadJson(path, fallback){
  try{ const r = await fetch(path,{cache:'no-store'}); return await r.json(); }
  catch(e){ return fallback; }
}

async function init(){
  drafts.news = JSON.parse(localStorage.getItem('mpbp_news_draft') || 'null') || await loadJson('data/news.json',[]);
  drafts.featured = JSON.parse(localStorage.getItem('mpbp_featured_draft') || 'null') || await loadJson('data/featured.json',{});
  drafts.live = JSON.parse(localStorage.getItem('mpbp_live_draft') || 'null') || await loadJson('data/live_status.json',{is_live:false});
  drafts.gallery = JSON.parse(localStorage.getItem('mpbp_gallery_draft') || 'null') || await loadJson('data/gallery.json',[]);
  drafts.videos = JSON.parse(localStorage.getItem('mpbp_videos_draft') || 'null') || await loadJson('data/videos.json',[]);
  drafts.releases = JSON.parse(localStorage.getItem('mpbp_releases_draft') || 'null') || await loadJson('data/releases.json',[]);
  drafts.countdowns = JSON.parse(localStorage.getItem('mpbp_countdowns_draft') || 'null') || await loadJson('data/countdowns.json',[]);
  drafts.events = JSON.parse(localStorage.getItem('mpbp_events_draft') || 'null') || await loadJson('data/events.json',[]);

  const events = await loadJson('data/events.json',[]);
  const artists = await loadJson('data/artists.json',[]);

  document.getElementById('eventsCount').textContent = events.length;
  document.getElementById('artistsCount').textContent = artists.length;
  document.getElementById('featuredTitle').value = drafts.featured.title || '';
  document.getElementById('featuredArtist').value = drafts.featured.artist || '';
  document.getElementById('featuredDate').value = drafts.featured.date || '';
  document.getElementById('featuredCover').value = drafts.featured.cover || '';
  document.getElementById('featuredDescription').value = drafts.featured.description || '';
  document.getElementById('liveUrl').value = drafts.live.url || 'https://www.tiktok.com/@simonsparet/live';
  render();
}

function slugify(text){
  return (text || 'media')
    .toString()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,'-')
    .replace(/^-+|-+$/g,'')
    .substring(0,80) || 'media';
}

function prepareMedia(){
  const fileInput = document.getElementById('mediaFile');
  const file = fileInput.files[0];
  if(!file){ alert('Choisis une image.'); return; }

  const folder = document.getElementById('mediaFolder').value;
  const title = document.getElementById('mediaTitle').value || file.name.replace(/\.[^.]+$/,'');
  const ext = (file.name.split('.').pop() || 'png').toLowerCase();
  const filename = `${slugify(title)}.${ext}`;
  const path = `${folder}/${filename}`;

  preparedMedia = { file, filename, path, url: URL.createObjectURL(file) };

  document.getElementById('mediaPath').textContent = path;
  const img = document.getElementById('mediaPreview');
  img.src = preparedMedia.url;
  img.alt = title;

  render();
}

function downloadRenamedMedia(){
  if(!preparedMedia.file){ alert('Prépare d’abord une image.'); return; }
  const a = document.createElement('a');
  a.href = preparedMedia.url;
  a.download = preparedMedia.filename;
  a.click();
}

async function copyMediaPath(){
  if(!preparedMedia.path){ alert('Prépare d’abord une image.'); return; }
  await navigator.clipboard.writeText(preparedMedia.path);
  alert('Chemin image copié.');
}

function useMediaForFeatured(){
  if(!preparedMedia.path){ alert('Prépare d’abord une image.'); return; }
  document.getElementById('featuredCover').value = preparedMedia.path;
  saveFeaturedDraft();
}

function useMediaForGallery(){
  if(!preparedMedia.path){ alert('Prépare d’abord une image.'); return; }
  document.getElementById('galleryImage').value = preparedMedia.path;
}

function persist(){
  localStorage.setItem('mpbp_news_draft', JSON.stringify(drafts.news));
  localStorage.setItem('mpbp_featured_draft', JSON.stringify(drafts.featured));
  localStorage.setItem('mpbp_live_draft', JSON.stringify(drafts.live));
  localStorage.setItem('mpbp_gallery_draft', JSON.stringify(drafts.gallery));
  localStorage.setItem('mpbp_videos_draft', JSON.stringify(drafts.videos));
  localStorage.setItem('mpbp_releases_draft', JSON.stringify(drafts.releases));
  localStorage.setItem('mpbp_countdowns_draft', JSON.stringify(drafts.countdowns));
  localStorage.setItem('mpbp_events_draft', JSON.stringify(drafts.events));
  render();
}

function render(){
  document.getElementById('draftPreview').textContent = JSON.stringify(drafts, null, 2);
  document.getElementById('livePreview').textContent = JSON.stringify(drafts.live, null, 2);
  document.getElementById('newsCount').textContent = drafts.news.length;
  document.getElementById('liveStatus').textContent = drafts.live.is_live ? 'EN DIRECT' : 'HORS LIGNE';

  const latestNews = drafts.news[0] || {};
  document.getElementById('previewFeaturedTitle').textContent = drafts.featured.title || '--';
  document.getElementById('previewFeaturedText').textContent = `${drafts.featured.artist || ''} ${drafts.featured.date || ''} — ${drafts.featured.description || ''}`;
  document.getElementById('previewLiveTitle').textContent = drafts.live.is_live ? 'EN DIRECT' : 'HORS LIGNE';
  document.getElementById('previewLiveText').textContent = drafts.live.is_live ? (drafts.live.url || '') : 'Le site affichera le prochain live.';
  document.getElementById('previewNewsTitle').textContent = latestNews.title || '--';
  document.getElementById('previewNewsText').textContent = latestNews.text || '--';
  document.getElementById('previewMediaTitle').textContent = preparedMedia.filename || '--';
  document.getElementById('previewMediaText').textContent = preparedMedia.path || '--';
}

function addNews(){
  const item = {
    date: document.getElementById('newsDate').value,
    type: document.getElementById('newsType').value || 'actualité',
    title: document.getElementById('newsTitle').value,
    text: document.getElementById('newsText').value
  };
  if(!item.title || !item.text){ alert('Titre et texte obligatoires.'); return; }
  drafts.news.unshift(item);
  persist();
}

function saveFeaturedDraft(){
  drafts.featured = {
    title: document.getElementById('featuredTitle').value,
    artist: document.getElementById('featuredArtist').value,
    date: document.getElementById('featuredDate').value,
    cover: document.getElementById('featuredCover').value,
    description: document.getElementById('featuredDescription').value
  };
  persist();
}

function addGallery(){
  const item = {
    title: document.getElementById('galleryTitle').value,
    category: document.getElementById('galleryCategory').value,
    image: document.getElementById('galleryImage').value,
    description: document.getElementById('galleryDescription').value
  };
  if(!item.title || !item.image){ alert('Titre et image obligatoires.'); return; }
  drafts.gallery.unshift(item);
  persist();
}

function youtubeId(url){
  try{
    const u = new URL(url);
    if(u.hostname.includes('youtu.be')) return u.pathname.replace('/','');
    if(u.searchParams.get('v')) return u.searchParams.get('v');
    if(u.pathname.includes('/shorts/')) return u.pathname.split('/shorts/')[1].split('/')[0];
  }catch(e){}
  return '';
}

function addVideo(){
  const url = document.getElementById('videoUrl').value;
  const item = {
    title: document.getElementById('videoTitle').value,
    artist: document.getElementById('videoArtist').value,
    url,
    youtubeId: youtubeId(url),
    description: document.getElementById('videoDescription').value
  };
  if(!item.title || !item.url){ alert('Titre et lien obligatoires.'); return; }
  drafts.videos.unshift(item);
  persist();
}

function setLive(value){
  drafts.live = {
    is_live: value,
    platform: 'TikTok',
    title: value ? 'Live TikTok MPBP440' : 'Prochain Live TikTok',
    url: document.getElementById('liveUrl').value || 'https://www.tiktok.com/@simonsparet/live',
    fallback_url: 'https://www.tiktok.com/@simonsparet',
    message_live: '🔴 En direct maintenant — rejoins le live TikTok',
    message_offline: 'Prochain live TikTok annoncé ici',
    updated_at: new Date().toISOString()
  };
  persist();
}

function asJson(type){
  if(type === 'news') return JSON.stringify(drafts.news, null, 2);
  if(type === 'featured') return JSON.stringify(drafts.featured, null, 2);
  if(type === 'live') return JSON.stringify(drafts.live, null, 2);
  if(type === 'gallery') return JSON.stringify(drafts.gallery, null, 2);
  if(type === 'videos') return JSON.stringify(drafts.videos, null, 2);
  return JSON.stringify(drafts, null, 2);
}

async function copyJson(type){
  await navigator.clipboard.writeText(asJson(type));
  alert(type + '.json copié dans le presse-papiers.');
}
async function copyAll(){
  await navigator.clipboard.writeText(JSON.stringify(drafts, null, 2));
  alert('Tous les brouillons ont été copiés.');
}

function downloadFile(filename, data){
  const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
function downloadNews(){ downloadFile('news.json', drafts.news); }
function downloadFeatured(){ downloadFile('featured.json', drafts.featured); }
function downloadLive(){ downloadFile('live_status.json', drafts.live); }
function downloadGallery(){ downloadFile('gallery.json', drafts.gallery); }
function downloadVideos(){ downloadFile('videos.json', drafts.videos); }
function downloadAll(){
  downloadNews();
  setTimeout(downloadFeatured, 250);
  setTimeout(downloadLive, 500);
  setTimeout(downloadGallery, 750);
  setTimeout(downloadVideos, 1000);
  setTimeout(downloadReleases, 1250);
  setTimeout(downloadCountdowns, 1500);
  setTimeout(downloadEvents, 1750);
}
function resetDrafts(){
  if(!confirm('Réinitialiser les brouillons locaux ?')) return;
  ['mpbp_news_draft','mpbp_featured_draft','mpbp_live_draft','mpbp_gallery_draft','mpbp_videos_draft','mpbp_releases_draft','mpbp_countdowns_draft','mpbp_events_draft'].forEach(k => localStorage.removeItem(k));
  location.reload();
}
init();


function useMediaForRelease(){
  if(!preparedMedia.path){ alert('Prépare d’abord une image.'); return; }
  document.getElementById('releaseCover').value = preparedMedia.path;
}
function addReleasePack(){
  const artist = document.getElementById('releaseArtist').value;
  const title = document.getElementById('releaseTitle').value;
  const date = document.getElementById('releaseDate').value;
  const cover = document.getElementById('releaseCover').value;
  const description = document.getElementById('releaseDescription').value;
  if(!artist || !title || !date){ alert('Artiste, titre et date obligatoires.'); return; }
  const frDate = date.split('-').reverse().join('/');
  const links = {
    spotify: document.getElementById('releaseSpotify').value,
    apple: document.getElementById('releaseApple').value,
    deezer: document.getElementById('releaseDeezer').value,
    youtube: document.getElementById('releaseYoutube').value,
    amazon: document.getElementById('releaseAmazon').value
  };
  const release = {artist,title,date:frDate,isoDate:date,cover,description,links,status:'À venir'};
  drafts.releases.unshift(release);
  drafts.countdowns.unshift({title:`${title} — ${artist}`,artist,date:`${date}T00:00:00+02:00`,label:`Prochaine sortie ${artist}`,description,cover});
  drafts.events.unshift({title:`Sortie officielle — ${title}`,date:frDate,time:"00h00",place:"Toutes les plateformes",description:description || `${title} de ${artist} disponible sur toutes les plateformes.`,cover,buttonText:"Écouter",url:links.spotify || links.youtube || links.apple || "#"});
  drafts.news.unshift({date,type:"sortie",title:`${title} — sortie officielle`,text:description || `${artist} présente ${title}, disponible le ${frDate} sur toutes les plateformes.`});
  persist();
  alert('Pack sortie créé : releases, countdowns, events et news mis à jour.');
}
function downloadReleases(){ downloadFile('releases.json', drafts.releases); }
function downloadCountdowns(){ downloadFile('countdowns.json', drafts.countdowns); }
function downloadEvents(){ downloadFile('events.json', drafts.events); }
