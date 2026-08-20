
(function(){
'use strict';

var STORE='numberListLibraryV7';
var ACTIVE='numberListActiveV7';
var DEFAULT_ITEMS=["Rear Window", "Casablanca", "Singin’ in the Rain", "The Apartment", "Jaws", "North by Northwest", "The Conversation", "Chinatown", "The General", "Local Hero", "The Maltese Falcon", "Some Like It Hot", "The Red Shoes", "All About Eve", "The French Connection", "The 400 Blows", "Nashville", "The Lady Vanishes", "The Producers", "The Big Sleep", "The Wages of Fear", "His Girl Friday", "The Manchurian Candidate", "The Lavender Hill Mob", "The Taking of Pelham One Two Three", "Rashomon", "Network", "The Last Picture Show", "The Graduate", "The Long Goodbye", "The Day the Earth Stood Still", "The Awful Truth", "Double Indemnity", "The Battle of Algiers", "The Palm Beach Story", "The Parallax View", "A Matter of Life and Death", "The Night of the Hunter", "Paths of Glory", "The Philadelphia Story", "The Sting", "The Sweet Smell of Success", "The Killing", "The Innocents", "The Train", "The Firemen’s Ball", "The Ipcress File", "The Straight Story", "The Thin Man", "The Ladykillers", "The Bridge on the River Kwai", "The Pawnbroker", "The Great Escape", "The Conversation Piece", "The Asphalt Jungle", "The Servant", "The Player", "The Hospital", "The Passenger", "The Hill", "The Day of the Jackal", "The Anderson Tapes", "The Music Man", "The Fortune Cookie", "The Narrow Margin", "The Odd Couple", "The Heartbreak Kid", "The Fortune", "The China Syndrome", "The Verdict", "The Last Detail", "The Paper Chase", "The Friends of Eddie Coyle", "The Hot Rock", "The Seven-Ups", "The Taking of Power", "The Silent Partner", "The Candidate", "The Out-of-Towners", "The In-Laws", "The King of Comedy", "The Right Stuff", "The Grey Fox", "The Long Good Friday", "The Stunt Man", "The Purple Rose of Cairo", "The Commitments", "The Snapper", "The Dish", "The Castle", "The Station Agent", "The Lives of Others", "The Visitor", "The Guard", "The Artist", "The Lunchbox", "The Farewell", "The Holdovers", "The Quiet Girl", "The Outfit"];

function defaultLibrary(){
  return [{id:'movies',title:'100 Movies',force:'The Third Man',items:DEFAULT_ITEMS.slice(),updated:Date.now()}];
}
function loadLibrary(){
  try{
    var raw=localStorage.getItem(STORE);
    var data=raw?JSON.parse(raw):null;
    if(Array.isArray(data)&&data.length)return data;
  }catch(e){}
  return defaultLibrary();
}
function saveLibrary(){ try{localStorage.setItem(STORE,JSON.stringify(library));}catch(e){} }

var library=loadLibrary();
saveLibrary();
var activeId=localStorage.getItem(ACTIVE)||library[0].id;
var editingId=null;
var digits='';
var pending=null;

var noteScreen=document.getElementById('noteScreen');
var libraryScreen=document.getElementById('libraryScreen');
var managerScreen=document.getElementById('managerScreen');
var itemList=document.getElementById('itemList');
var title=document.getElementById('noteTitle');
var keypad=document.getElementById('keypad');

function active(){
  for(var i=0;i<library.length;i++)if(library[i].id===activeId)return library[i];
  activeId=library[0].id;
  return library[0];
}
function show(which){
  noteScreen.classList.add('hidden');
  libraryScreen.classList.add('hidden');
  managerScreen.classList.add('hidden');
  which.classList.remove('hidden');
}
function renderNote(items){
  itemList.innerHTML='';
  for(var i=0;i<items.length;i++){
    var li=document.createElement('li');
    li.textContent=items[i];
    itemList.appendChild(li);
  }
}
function openNote(id){
  activeId=id;
  try{localStorage.setItem(ACTIVE,id);}catch(e){}
  var a=active();
  title.textContent=a.title;
  renderNote(a.items);
  show(noteScreen);
  window.scrollTo(0,0);
}
function forcedList(n){
  var a=active();
  var force=a.force;
  var clean=[];
  for(var i=0;i<a.items.length;i++)if(a.items[i]!==force)clean.push(a.items[i]);
  while(clean.length<99) clean.push('Item '+(clean.length+1));
  clean=clean.slice(0,99);
  clean.splice(n-1,0,force);
  return clean.slice(0,100);
}
function valid(n){return Number.isInteger(n)&&n>=2&&n<=99;}
function prepare(n){if(!valid(n))return false;pending=forcedList(n);return true;}
function commit(n){if(prepare(n)){renderNote(pending);window.scrollTo(0,0);return true;}return false;}

function renderLibrary(){
  var rows=document.getElementById('libraryRows');
  rows.innerHTML='';
  var section=document.createElement('div');
  section.className='sectionTitle';
  section.textContent='Previous 7 Days';
  rows.appendChild(section);
  var card=document.createElement('div');
  card.className='card';
  for(var i=0;i<library.length;i++){
    (function(item){
      var row=document.createElement('div');
      row.className='row';
      row.innerHTML='<div class="rowTitle"></div><div class="rowMeta"></div>';
      row.children[0].textContent=item.title;
      row.children[1].textContent='Today  '+item.items.length+' items';
      row.addEventListener('click',function(){openNote(item.id);});
      var timer=null;
      row.addEventListener('touchstart',function(){timer=setTimeout(function(){openManager(item.id);},850);},{passive:true});
      row.addEventListener('touchend',function(){clearTimeout(timer);},{passive:true});
      card.appendChild(row);
    })(library[i]);
  }
  rows.appendChild(card);
  document.getElementById('noteCount').textContent=library.length+(library.length===1?' Note':' Notes');
}
function openLibrary(){renderLibrary();show(libraryScreen);}
function openManager(id){
  editingId=id;
  var item=null;
  for(var i=0;i<library.length;i++)if(library[i].id===id)item=library[i];
  document.getElementById('editTitle').value=item?item.title:'';
  document.getElementById('editForce').value=item?item.force:'';
  document.getElementById('editItems').value=item?item.items.join('\n'):'';
  show(managerScreen);
}
function createNew(){
  editingId='__new__';
  document.getElementById('editTitle').value='';
  document.getElementById('editForce').value='';
  document.getElementById('editItems').value='';
  show(managerScreen);
}

document.getElementById('backToLibrary').addEventListener('click',openLibrary);
document.getElementById('addList').addEventListener('click',createNew);
document.getElementById('newList').addEventListener('click',createNew);
document.getElementById('managerBack').addEventListener('click',openLibrary);


function saveEditor(){
  var titleValue=document.getElementById('editTitle').value.trim()||'Untitled';
  var forceValue=document.getElementById('editForce').value.trim();
  var lines=document.getElementById('editItems').value.split(/?
/);
  var itemsValue=[];
  for(var j=0;j<lines.length;j++){var x=lines[j].trim();if(x)itemsValue.push(x);}
  var item=null;
  if(editingId==='__new__'){
    item={id:'list-'+Date.now(),title:titleValue,force:forceValue,items:itemsValue,updated:Date.now()};
    library.push(item);
    editingId=item.id;
  }else{
    for(var i=0;i<library.length;i++)if(library[i].id===editingId)item=library[i];
    if(!item)return;
    item.title=titleValue;
    item.force=forceValue;
    item.items=itemsValue;
    item.updated=Date.now();
  }
  saveLibrary();
  openLibrary();
}
document.getElementById('managerDone').addEventListener('click',saveEditor);
document.getElementById('deleteList').addEventListener('click',function(){
  if(editingId==='__new__'){openLibrary();return;}
  if(library.length<=1)return;
  var next=[];
  for(var i=0;i<library.length;i++)if(library[i].id!==editingId)next.push(library[i]);
  library=next;
  if(activeId===editingId)activeId=library[0].id;
  saveLibrary();
  openLibrary();
});
document.getElementById('exportLibrary').addEventListener('click',function(){
  var blob=new Blob([JSON.stringify(library,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');a.href=url;a.download='number-list-library.json';a.click();
  setTimeout(function(){URL.revokeObjectURL(url);},1000);
});
document.getElementById('importLibrary').addEventListener('change',function(e){
  var f=e.target.files&&e.target.files[0];if(!f)return;
  var r=new FileReader();
  r.onload=function(){
    try{
      var data=JSON.parse(r.result);
      if(Array.isArray(data)&&data.length){library=data;activeId=library[0].id;saveLibrary();openLibrary();}
    }catch(err){}
  };
  r.readAsText(f);
});

function hold(el,fn,ms){
  var timer=null;
  function start(e){if(e.type==='touchstart')e.preventDefault();timer=setTimeout(fn,ms);}
  function stop(){clearTimeout(timer);}
  el.addEventListener('touchstart',start,{passive:false});
  el.addEventListener('touchend',stop);
  el.addEventListener('touchcancel',stop);
  el.addEventListener('mousedown',start);
  el.addEventListener('mouseup',stop);
  el.addEventListener('mouseleave',stop);
}
hold(document.getElementById('keypadHotspot'),function(){digits='';keypad.classList.remove('hidden');},450);
hold(document.getElementById('voiceHotspot'),function(){
  location.href='shortcuts://run-shortcut?name='+encodeURIComponent('Number List Voice');
},450);

function updateReadout(){document.getElementById('keyReadout').textContent=(digits+'——').slice(0,2);}
var digitButtons=document.querySelectorAll('[data-digit]');
for(var i=0;i<digitButtons.length;i++){
  digitButtons[i].addEventListener('click',function(){
    if(digits.length>=2)return;
    digits+=this.getAttribute('data-digit');
    updateReadout();
    if(digits.length===2){
      var n=Number(digits);
      if(commit(n))setTimeout(function(){keypad.classList.add('hidden');},80);
      else{digits='';updateReadout();}
    }
  });
}
document.getElementById('keyCancel').addEventListener('click',function(){keypad.classList.add('hidden');});
document.getElementById('keyBack').addEventListener('click',function(){digits=digits.slice(0,-1);updateReadout();});

var now=new Date();
document.getElementById('dateLine').textContent=now.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'})+' at '+now.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});

openNote(activeId);

var params=new URLSearchParams(location.search);
var supplied=Number(params.get('n'));
if(valid(supplied)){commit(supplied);try{history.replaceState({},'',location.pathname);}catch(e){}}

})();
