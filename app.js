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
  keyCapture:document.getElementById('keyCapture'),
  keyCancel:document.getElementById('keyCancel'),
  keyBack:document.getElementById('keyBack')
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

function persist(){
  localStorage.setItem(STORE,JSON.stringify(library));
  localStorage.setItem(ACTIVE,activeId);
}

function active(){
  let item=library.find(x=>x.id===activeId);
  if(!item){item=library[0];activeId=item.id;}
  return item;
}

function show(screen){
  [el.noteScreen,el.libraryScreen,el.editorScreen].forEach(x=>x.classList.add('hidden'));
  screen.classList.remove('hidden');
}

function renderList(items){
  const frag=document.createDocumentFragment();
  items.forEach(text=>{const li=document.createElement('li');li.textContent=text;frag.appendChild(li);});
  el.noteList.replaceChildren(frag);
}

function renderNote(item=active()){
  el.noteTitle.textContent=item.title;
  renderList(item.items);
}

function openNote(id){
  activeId=id;
  persist();
  renderNote(active());
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
    row.addEventListener('touchstart',()=>{timer=setTimeout(()=>openEditor(item.id),700)},{passive:true});
    row.addEventListener('touchend',()=>clearTimeout(timer),{passive:true});
    row.addEventListener('touchcancel',()=>clearTimeout(timer),{passive:true});
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

function forcedList(item,n){
  const items=item.items.slice();
  const len=items.length;
  if(n<1 || n>len) return null;
  const force=item.force;
  const forceIndex=items.indexOf(force);
  if(forceIndex<0) return null;
  items.splice(forceIndex,1);
  items.splice(n-1,0,force);
  return items;
}
function validNumber(n){return Number.isInteger(n)&&n>=2&&n<=99}
function commitForce(n){
  if(!validNumber(n)) return false;
  const item=active();
  if(!item.force) return false;
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

function openKeypad(){keypadDigits='';el.keypadHotspot.style.pointerEvents='none';el.keyCapture.classList.remove('hidden');el.keypad.classList.remove('hidden');setTimeout(showKeypadFeedback,0)}
function closeKeypad(){el.keyCapture.classList.add('hidden');el.keypad.classList.add('hidden');el.keypadHotspot.style.pointerEvents='auto'}
function addDigit(d){
  if(keypadDigits.length>=2)return;
  keypadDigits+=d;
  if(keypadDigits.length===2){
    const n=Number(keypadDigits);
    if(commitForce(n)) setTimeout(closeKeypad,80);
    else keypadDigits='';
  }
}

el.notesBack.addEventListener('click',openLibrary);
el.addList.addEventListener('click',()=>openEditor());
el.editorCancel.addEventListener('click',openLibrary);
el.editorSave.addEventListener('click',saveEditor);
el.deleteList.addEventListener('click',deleteEditor);

el.exportLibrary.addEventListener('click',()=>{
  const blob=new Blob([JSON.stringify(library,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='number-list-library.json';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
});
el.importLibrary.addEventListener('change',e=>{
  const f=e.target.files?.[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{
    const parsed=JSON.parse(r.result);
    const cleaned=Array.isArray(parsed)?parsed.map(cleanRecord).filter(Boolean):[];
    if(cleaned.length){library=cleaned;activeId=library[0].id;persist();openLibrary()}
  }catch(err){}};
  r.readAsText(f);
});

holdTo(el.keypadHotspot,openKeypad,450);
holdTo(el.voiceHotspot,()=>{location.href='shortcuts://run-shortcut?name='+encodeURIComponent('Number List Voice')},450);
function showKeypadFeedback(){
  let r=document.getElementById('keypadFeedback');
  if(!r){
    r=document.createElement('div');
    r.id='keypadFeedback';
    r.style.cssText='position:absolute;left:7px;top:4px;font-family:"Avenir Next Condensed","Helvetica Neue",sans-serif;font-size:14px;color:rgba(55,55,55,.25);pointer-events:none';
    el.keypad.appendChild(r);
  }
  r.textContent=(keypadDigits+'——').slice(0,2);
}


function keyFromPoint(x,y){
  const r=el.keypad.getBoundingClientRect();
  if(x<r.left || x>r.right || y<r.top || y>r.bottom) return null;

  const keys=el.keypad.querySelector('.keys').getBoundingClientRect();
  const cellW=keys.width/3;
  const cellH=keys.height/4;
  const col=Math.max(0,Math.min(2,Math.floor((x-keys.left)/cellW)));
  const row=Math.max(0,Math.min(3,Math.floor((y-keys.top)/cellH)));
  return [
    ['1','2','3'],
    ['4','5','6'],
    ['7','8','9'],
    ['x','0','back']
  ][row][col];
}

function handleCapturedPoint(x,y){
  const key=keyFromPoint(x,y);
  if(!key) return;
  if(key==='x'){ closeKeypad(); return; }
  if(key==='back'){
    keypadDigits=keypadDigits.slice(0,-1);
    showKeypadFeedback();
    return;
  }
  addDigit(key);
  showKeypadFeedback();
}

el.keyCapture.addEventListener('touchend',e=>{
  e.preventDefault();
  e.stopPropagation();
  const t=e.changedTouches && e.changedTouches[0];
  if(t) handleCapturedPoint(t.clientX,t.clientY);
},{passive:false});

el.keyCapture.addEventListener('click',e=>{
  e.preventDefault();
  e.stopPropagation();
  handleCapturedPoint(e.clientX,e.clientY);
});

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
  openLibrary,openNote,openEditor,saveEditor,commitForce,
  getLibrary:()=>JSON.parse(JSON.stringify(library)),
  active:()=>JSON.parse(JSON.stringify(active()))
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
