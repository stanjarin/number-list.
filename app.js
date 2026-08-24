(() => {
'use strict';

const STORE='numberListLibrary';
const ACTIVE='numberListActive';
const DEFAULT_MOVIES=["Rear Window", "Casablanca", "Singin’ in the Rain", "The Apartment", "Jaws", "North by Northwest", "The Conversation", "Chinatown", "The General", "Local Hero", "The Maltese Falcon", "Some Like It Hot", "The Red Shoes", "All About Eve", "The French Connection", "The 400 Blows", "Nashville", "The Lady Vanishes", "The Producers", "The Big Sleep", "The Wages of Fear", "His Girl Friday", "The Manchurian Candidate", "The Lavender Hill Mob", "The Taking of Pelham One Two Three", "Rashomon", "Network", "The Last Picture Show", "The Graduate", "The Long Goodbye", "The Day the Earth Stood Still", "The Awful Truth", "Double Indemnity", "The Battle of Algiers", "The Palm Beach Story", "The Parallax View", "A Matter of Life and Death", "The Night of the Hunter", "Paths of Glory", "The Philadelphia Story", "The Sting", "The Sweet Smell of Success", "The Killing", "The Innocents", "The Train", "The Firemen’s Ball", "The Ipcress File", "The Straight Story", "The Thin Man", "The Ladykillers", "The Bridge on the River Kwai", "The Pawnbroker", "The Great Escape", "The Conversation Piece", "The Asphalt Jungle", "The Servant", "The Player", "The Hospital", "The Passenger", "The Hill", "The Day of the Jackal", "The Anderson Tapes", "The Music Man", "The Fortune Cookie", "The Narrow Margin", "The Odd Couple", "The Heartbreak Kid", "The Fortune", "The China Syndrome", "The Verdict", "The Last Detail", "The Paper Chase", "The Friends of Eddie Coyle", "The Hot Rock", "The Seven-Ups", "The Taking of Power", "The Silent Partner", "The Candidate", "The Out-of-Towners", "The In-Laws", "The King of Comedy", "The Right Stuff", "The Grey Fox", "The Long Good Friday", "The Stunt Man", "The Purple Rose of Cairo", "The Commitments", "The Snapper", "The Dish", "The Castle", "The Station Agent", "The Lives of Others", "The Visitor", "The Guard", "The Artist", "The Lunchbox", "The Farewell", "The Holdovers", "The Quiet Girl", "The Outfit"];

const el = {
  noteScreen:document.getElementById('noteScreen'),
  libraryScreen:document.getElementById('libraryScreen'),
  editorScreen:document.getElementById('editorScreen'),
  notesBack:document.getElementById('notesBack'),
  noteTitle:document.getElementById('noteTitle'),
  noteList:document.getElementById('noteList'),
  dateLine:document.getElementById('dateLine'),
  libraryScroller:document.getElementById('libraryScroller'),
  noteCount:document.getElementById('noteCount'),
  addList:document.getElementById('addList'),
  editorCancel:document.getElementById('editorCancel'),
  editorSave:document.getElementById('editorSave'),
  editorHeading:document.getElementById('editorHeading'),
  editTitle:document.getElementById('editTitle'),
  editForce:document.getElementById('editForce'),
  editItems:document.getElementById('editItems'),
  deleteList:document.getElementById('deleteList'),
  exportLibrary:document.getElementById('exportLibrary'),
  importLibrary:document.getElementById('importLibrary'),
  voiceHotspot:document.getElementById('voiceHotspot'),
  keypadHotspot:document.getElementById('keypadHotspot'),
  keypad:document.getElementById('keypad'),
  keyCancel:document.getElementById('keyCancel'),
  keyBack:document.getElementById('keyBack'),
  allICloud:document.getElementById('allICloud'),
  switchyardScreen:document.getElementById('switchyardScreen'),
  yardCancel:document.getElementById('yardCancel'),
  yardApply:document.getElementById('yardApply'),
  yardForce:document.getElementById('yardForce'),
  yardList:document.getElementById('yardList'),
  yardMode:document.getElementById('yardMode'),
  importTextList:document.getElementById('importTextList'),
  yardExportLibrary:document.getElementById('yardExportLibrary'),
  yardImportLibrary:document.getElementById('yardImportLibrary')
};

function defaults(){
  return [{id:'movies',title:'100 Movies',force:'The Third Man',items:DEFAULT_MOVIES.slice(),updated:Date.now()}];
}

function cleanRecord(x){
  if(!x || typeof x!=='object') return null;
  const title=String(x.title||'').trim();
  const force=String(x.force||'').trim();
  const items=Array.isArray(x.items)?x.items.map(v=>String(v).trim()).filter(Boolean):[];
  if(!title || !items.length) return null;
  return {
    id:String(x.id||('list-'+Date.now()+'-'+Math.random().toString(36).slice(2))),
    title, force, items, updated:Number(x.updated)||Date.now()
  };
}

function loadLibrary(){
  const keys=[STORE,'numberListLibraryV7','numberListLibraryV6'];
  for(const key of keys){
    try{
      const raw=localStorage.getItem(key);
      if(!raw) continue;
      const parsed=JSON.parse(raw);
      if(!Array.isArray(parsed)) continue;
      const cleaned=parsed.map(cleanRecord).filter(Boolean);
      // Filter known ghost drafts from earlier versions.
      const useful=cleaned.filter(x=>!(x.title==='New Note' && x.items.length===0));
      if(useful.length) return useful;
    }catch(e){}
  }
  return defaults();
}

let library=loadLibrary();
let activeId=localStorage.getItem(ACTIVE)||library[0].id;
let editingId=null;
let draftIsNew=false;
let keypadDigits='';
let currentItem=null;

function persist(){
  localStorage.setItem(STORE,JSON.stringify(library));
  localStorage.setItem(ACTIVE,activeId);
}

function active(){
  let item=library.find(x=>x.id===activeId);
  if(!item){item=library[0];activeId=item.id;}
  currentItem=item;
  return item;
}

function show(screen){
  [el.noteScreen,el.libraryScreen,el.editorScreen,el.switchyardScreen].forEach(x=>x.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function renderList(items){
  const frag=document.createDocumentFragment();
  items.forEach(text=>{const li=document.createElement('li');li.textContent=text;frag.appendChild(li);});
  el.noteList.replaceChildren(frag);
}

function renderNote(item=active()){
  currentItem=item;
  activeId=item.id;
  el.noteTitle.textContent=item.title;
  renderList(item.items);
}

function openNote(id){
  activeId=id;
  currentItem=library.find(x=>x.id===id) || library[0];
  persist();
  renderNote(currentItem);
  show(el.noteScreen);
  el.noteScreen.scrollTop=0;
}

function renderLibrary(){
  el.libraryScroller.replaceChildren();
  const section=document.createElement('div');
  section.className='sectionTitle';
  section.textContent='My Notes';
  const card=document.createElement('div');
  card.className='card';
  library.forEach(item=>{
    const row=document.createElement('div');
    row.className='libraryRow';
    row.dataset.id=item.id;
    const rt=document.createElement('div');rt.className='rowTitle';rt.textContent=item.title;
    const rm=document.createElement('div');rm.className='rowMeta';rm.textContent=`Today  ${item.items.length} items`;
    row.append(rt,rm);
    row.addEventListener('click',()=>openNote(item.id));
    let timer=null;
    row.addEventListener('touchstart',e=>{e.preventDefault();timer=setTimeout(()=>openEditor(item.id),700)},{passive:false});
    row.addEventListener('touchend',e=>{clearTimeout(timer); if(timer){ /* click follows normally on iOS */ }},{passive:true});
    row.addEventListener('touchcancel',()=>clearTimeout(timer),{passive:true});
    row.addEventListener('contextmenu',e=>e.preventDefault());
    card.appendChild(row);
  });
  el.libraryScroller.append(section,card);
  el.noteCount.textContent=`${library.length} ${library.length===1?'Note':'Notes'}`;
}

function openLibrary(){
  renderLibrary();
  show(el.libraryScreen);
  el.libraryScroller.scrollTop=0;
}

function openEditor(id=null){
  draftIsNew=!id;
  editingId=id;
  const item=id?library.find(x=>x.id===id):{title:'',force:'',items:[]};
  el.editorHeading.textContent=id?'Edit List':'New List';
  el.editTitle.value=item?.title||'';
  el.editForce.value=item?.force||'';
  el.editItems.value=(item?.items||[]).join('\n');
  el.deleteList.classList.toggle('hidden',!id);
  show(el.editorScreen);
  document.querySelector('.editorBody').scrollTop=0;
}

function saveEditor(){
  const title=el.editTitle.value.trim()||'Untitled';
  const force=el.editForce.value.trim();
  const items=el.editItems.value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  if(draftIsNew){
    const rec={id:'list-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,force,items,updated:Date.now()};
    library.push(rec);
    editingId=rec.id;
    draftIsNew=false;
  }else{
    const rec=library.find(x=>x.id===editingId);
    if(!rec) return;
    Object.assign(rec,{title,force,items,updated:Date.now()});
  }
  persist();
  openLibrary();
}

function deleteEditor(){
  if(draftIsNew){openLibrary();return;}
  if(library.length===1) return;
  library=library.filter(x=>x.id!==editingId);
  if(activeId===editingId) activeId=library[0].id;
  persist();
  openLibrary();
}

function renderYardLists(){
  el.yardList.replaceChildren();
  library.forEach(item=>{
    const opt=document.createElement('option');
    opt.value=item.id;
    opt.textContent=item.title;
    el.yardList.appendChild(opt);
  });
  const chosen=library.find(x=>x.id===activeId) || library[0];
  if(chosen) el.yardList.value=chosen.id;
  updateYardMode();
}

function updateYardMode(){
  const item=library.find(x=>x.id===el.yardList.value);
  const force=String(el.yardForce.value||'').trim();
  if(!item){el.yardMode.textContent='';return;}
  if(!force){el.yardMode.textContent=`Destination: ${item.title}`;return;}
  el.yardMode.textContent=item.items.includes(force)
    ? 'Internal force: existing item will move to the chosen number.'
    : 'External force: item at the chosen number will be replaced.';
}

function openSwitchyard(){
  renderYardLists();
  const item=library.find(x=>x.id===el.yardList.value) || library[0];
  el.yardForce.value=item?.force||'';
  updateYardMode();
  show(el.switchyardScreen);
  document.querySelector('.yardBody').scrollTop=0;
}

function applySwitchyard(){
  const item=library.find(x=>x.id===el.yardList.value);
  if(!item) return;
  item.force=el.yardForce.value.trim();
  item.updated=Date.now();
  activeId=item.id;
  currentItem=item;
  persist();
  openLibrary();
}

function parseTextList(text,filename='Imported List.txt'){
  const lines=String(text||'').replace(/\r/g,'').split('\n');
  let title='';
  let force='';
  let i=0;
  for(;i<lines.length;i++){
    const raw=lines[i];
    const t=raw.trim();
    if(!t){ if(title||force){i++;break;} continue; }
    const mt=t.match(/^TITLE\s*:\s*(.*)$/i);
    if(mt){title=mt[1].trim();continue;}
    const mf=t.match(/^FORCE\s*:\s*(.*)$/i);
    if(mf){force=mf[1].trim();continue;}
    break;
  }
  const items=lines.slice(i).map(x=>x.trim()).filter(Boolean);
  if(!title) title=String(filename||'Imported List').replace(/\.[^.]+$/,'').trim()||'Imported List';
  if(!items.length) return null;
  return {id:'list-'+Date.now()+'-'+Math.random().toString(36).slice(2),title,force,items,updated:Date.now()};
}

function importTextListFile(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>{
    const rec=parseTextList(r.result,file.name);
    if(!rec) return;
    library.push(rec);
    activeId=rec.id;
    currentItem=rec;
    persist();
    renderYardLists();
    el.yardList.value=rec.id;
    el.yardForce.value=rec.force;
    updateYardMode();
  };
  r.readAsText(file);
}

function exportWholeLibrary(){
  const blob=new Blob([JSON.stringify(library,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');
  a.href=url;
  a.download='Lists Backup '+new Date().toISOString().slice(0,10)+'.json';
  a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function restoreWholeLibrary(file){
  if(!file) return;
  const r=new FileReader();
  r.onload=()=>{try{
    const parsed=JSON.parse(r.result);
    const cleaned=Array.isArray(parsed)?parsed.map(cleanRecord).filter(Boolean):[];
    if(cleaned.length){
      library=cleaned;
      activeId=library[0].id;
      currentItem=library[0];
      persist();
      openLibrary();
    }
  }catch(err){}};
  r.readAsText(file);
}

function forcedList(item,n){
  const items=item.items.slice();
  const len=items.length;
  if(n<1 || n>len) return null;

  const force=String(item.force||'').trim();
  if(!force) return null;

  const forceIndex=items.findIndex(x=>x===force);

  if(forceIndex>=0){
    // INTERNAL FORCE: move existing item to N; preserve every list member.
    items.splice(forceIndex,1);
    items.splice(n-1,0,force);
    return items;
  }

  // EXTERNAL FORCE: replace the item at N; preserve list length.
  items[n-1]=force;
  return items;
}
function validNumber(n){return Number.isInteger(n)&&n>=1&&n<=99}
function commitForce(n){
  if(!validNumber(n)) return false;
  const item=currentItem || active();
  if(!item || !item.force) return false;
  const out=forcedList(item,n);
  if(!out) return false;
  renderList(out);
  el.noteScreen.scrollTop=0;
  return true;
}

function holdTo(target,fn,ms=450){
  let timer=null;
  const start=e=>{if(e.type==='touchstart')e.preventDefault();timer=setTimeout(fn,ms)};
  const stop=()=>clearTimeout(timer);
  target.addEventListener('touchstart',start,{passive:false});
  target.addEventListener('touchend',stop);
  target.addEventListener('touchcancel',stop);
  target.addEventListener('mousedown',start);
  target.addEventListener('mouseup',stop);
  target.addEventListener('mouseleave',stop);
}

function openKeypad(){ keypadDigits=''; el.keypad.classList.remove('hidden'); }
function closeKeypad(){ el.keypad.classList.add('hidden'); }
function addDigit(d){
  if(keypadDigits.length>=2)return;
  keypadDigits+=d;
  if(keypadDigits.length===2){
    const n=Number(keypadDigits);
    commitForce(n);
    setTimeout(closeKeypad,80);
  }
}

el.notesBack.addEventListener('click',openLibrary);
el.addList.addEventListener('click',()=>openEditor());
el.editorCancel.addEventListener('click',openLibrary);
el.editorSave.addEventListener('click',saveEditor);
el.deleteList.addEventListener('click',deleteEditor);

el.exportLibrary.addEventListener('click',exportWholeLibrary);
el.importLibrary.addEventListener('change',e=>restoreWholeLibrary(e.target.files?.[0]));

// V10j master controls at Fake Notes level.
holdTo(el.allICloud,openSwitchyard,700);
el.allICloud.addEventListener('contextmenu',e=>e.preventDefault());
el.yardCancel.addEventListener('click',openLibrary);
el.yardApply.addEventListener('click',applySwitchyard);
el.yardList.addEventListener('change',()=>{
  const item=library.find(x=>x.id===el.yardList.value);
  el.yardForce.value=item?.force||'';
  updateYardMode();
});
el.yardForce.addEventListener('input',updateYardMode);
el.importTextList.addEventListener('change',e=>importTextListFile(e.target.files?.[0]));
el.yardExportLibrary.addEventListener('click',exportWholeLibrary);
el.yardImportLibrary.addEventListener('change',e=>restoreWholeLibrary(e.target.files?.[0]));

holdTo(el.keypadHotspot,openKeypad,450);
holdTo(el.voiceHotspot,()=>{location.href='shortcuts://run-shortcut?name='+encodeURIComponent('Number List Voice')},450);
el.keypad.querySelectorAll('[data-digit]').forEach(btn => btn.addEventListener('click', () => addDigit(btn.dataset.digit)));
el.keyCancel.addEventListener('click', closeKeypad);
el.keyBack.addEventListener('click', () => { keypadDigits = keypadDigits.slice(0,-1); });

const now=new Date();
el.dateLine.textContent=now.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})+' at '+now.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});

persist();
renderNote(active());
renderLibrary();
show(el.libraryScreen);

// Shortcut URL input.
const params=new URLSearchParams(location.search);
const supplied=Number(params.get('n'));
if(validNumber(supplied)){
  show(el.noteScreen);
  renderNote(active());
  commitForce(supplied);
  try{history.replaceState({},'',location.pathname)}catch(e){}
}

// Small public surface for automated headless testing and future diagnostics.
window.NumberListApp={
  openLibrary,openNote,openEditor,saveEditor,commitForce,openSwitchyard,parseTextList,
  getLibrary:()=>JSON.parse(JSON.stringify(library)),
  active:()=>JSON.parse(JSON.stringify(active())),
  forceMode:()=>{
    const item=currentItem||active();
    return item.items.includes(item.force)?'internal':'external';
  }
};

// Automated browser self-test. Never entered during normal use.
if(params.get('selftest')==='1'){
  const result=document.getElementById('selftestResult');
  const checks=[];
  const check=(name,ok)=>checks.push([name,!!ok]);
  try{
    check('initial-title',el.noteTitle.textContent==='100 Movies');
    check('initial-100',el.noteList.children.length===100);
    openLibrary();
    check('library-row',document.querySelectorAll('.libraryRow').length>=1);
    openEditor();
    el.editTitle.value='Test RBG';
    el.editForce.value='Red';
    el.editItems.value='Red\nBlue\nGreen';
    saveEditor();
    check('saved-row',[...document.querySelectorAll('.rowTitle')].some(x=>x.textContent==='Test RBG'));
    const test=library.find(x=>x.title==='Test RBG');
    check('saved-data',!!test && test.items.length===3 && test.force==='Red');
    openNote('movies');
    commitForce(52);
    check('force-52',el.noteList.children[51]?.textContent==='The Third Man');
    openLibrary();
    check('scroll-container',getComputedStyle(el.libraryScroller).overflowY==='auto');
  }catch(e){checks.push(['exception:'+e.message,false])}
  result.classList.remove('hidden');
  result.textContent=checks.every(x=>x[1])?'SELFTEST PASS':'SELFTEST FAIL '+JSON.stringify(checks);
}
})();