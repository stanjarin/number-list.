(() => {
  'use strict';

  // Placeholder force item. Change only this string when you decide the real object.
  const FORCE_ITEM = 'The Third Man';

  // Dummy list shown on launch. FORCE_ITEM deliberately does not occur here.
  const DUMMY_MOVIES = [
    'Rear Window','Casablanca','Singin’ in the Rain','The Apartment','Jaws','North by Northwest','The Conversation','Chinatown','The General','Local Hero',
    'The Maltese Falcon','Some Like It Hot','The Red Shoes','All About Eve','The French Connection','The 400 Blows','Nashville','The Lady Vanishes','The Producers','The Big Sleep',
    'The Wages of Fear','His Girl Friday','The Manchurian Candidate','The Lavender Hill Mob','The Taking of Pelham One Two Three','Rashomon','Network','The Last Picture Show','The Graduate','The Long Goodbye',
    'The Day the Earth Stood Still','The Awful Truth','Double Indemnity','The Battle of Algiers','The Palm Beach Story','The Parallax View','A Matter of Life and Death','The Night of the Hunter','Paths of Glory','The Philadelphia Story',
    'The Sting','The Sweet Smell of Success','The Killing','The Innocents','The Train','The Firemen’s Ball','The Ipcress File','The Straight Story','The Thin Man','The Ladykillers',
    'The Bridge on the River Kwai','The Pawnbroker','The Great Escape','The Conversation Piece','The Asphalt Jungle','The Servant','The Player','The Hospital','The Passenger','The Hill',
    'The Day of the Jackal','The Anderson Tapes','The Music Man','The Fortune Cookie','The Narrow Margin','The Odd Couple','The Heartbreak Kid','The Fortune','The China Syndrome','The Verdict',
    'The Last Detail','The Paper Chase','The Friends of Eddie Coyle','The Hot Rock','The Seven-Ups','The Taking of Power','The Silent Partner','The Candidate','The Out-of-Towners','The In-Laws',
    'The King of Comedy','The Right Stuff','The Grey Fox','The Long Good Friday','The Stunt Man','The Purple Rose of Cairo','The Commitments','The Snapper','The Dish','The Castle',
    'The Station Agent','The Lives of Others','The Visitor','The Guard','The Artist','The Lunchbox','The Farewell','The Holdovers','The Quiet Girl','The Outfit'
  ];

  const els = {
    list: document.getElementById('movieList'),
    date: document.getElementById('dateLine'),
    voiceHotspot: document.getElementById('voiceHotspot'),
    keypadHotspot: document.getElementById('keypadHotspot'),
    swapHotspot: document.getElementById('swapHotspot'),
    ack: document.getElementById('ack'),
    ackNumber: document.getElementById('ackNumber'),
    ackYes: document.getElementById('ackYes'),
    ackNo: document.getElementById('ackNo'),
    keypad: document.getElementById('keypad'),
    keypadReadout: document.getElementById('keypadReadout'),
    keypadCancel: document.getElementById('keypadCancel'),
    keypadBack: document.getElementById('keypadBack'),
    status: document.getElementById('status')
  };

  let recognisedNumber = null;
  let pendingList = null;
  let keypadDigits = '';
  let swapped = false;
  let voiceStartTimer = null;
  let keypadStartTimer = null;

  function render(items) {
    const frag = document.createDocumentFragment();
    items.forEach(title => {
      const li = document.createElement('li');
      li.textContent = title;
      frag.appendChild(li);
    });
    els.list.replaceChildren(frag);
  }

  function makeForcedList(n) {
    // Keep list length exactly 100. Remove one ordinary title and insert force at n.
    const clean = DUMMY_MOVIES.filter(x => x !== FORCE_ITEM).slice(0, 99);
    clean.splice(n - 1, 0, FORCE_ITEM);
    return clean.slice(0, 100);
  }

  function validNumber(n) {
    return Number.isInteger(n) && n >= 2 && n <= 99;
  }

  function prepare(n) {
    if (!validNumber(n)) {
      showStatus('02–99 only');
      return false;
    }
    recognisedNumber = n;
    pendingList = makeForcedList(n);
    return true;
  }

  function commitSwap() {
    if (!pendingList || swapped) return;
    render(pendingList);
    swapped = true;
    window.scrollTo({top:0,left:0,behavior:'instant'});
  }

  function showAck(n) {
    if (!prepare(n)) return;
    els.ackNumber.textContent = `${String(n).padStart(2,'0')}?`;
    els.ack.classList.remove('hidden');
  }

  function hideAck() { els.ack.classList.add('hidden'); }

  function showStatus(msg, ms=850) {
    els.status.textContent = msg;
    els.status.classList.remove('hidden');
    clearTimeout(showStatus._t);
    showStatus._t = setTimeout(() => els.status.classList.add('hidden'), ms);
  }

  function parseSpokenNumber(text) {
    const raw = String(text || '').toLowerCase().trim();
    const direct = raw.match(/\b(\d{1,3})\b/);
    if (direct) return Number(direct[1]);

    const ones = {zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19};
    const tens = {twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};
    const words = raw.replace(/-/g,' ').replace(/[^a-z\s]/g,' ').split(/\s+/).filter(Boolean);
    for (let i=0;i<words.length;i++) {
      if (ones[words[i]] !== undefined) return ones[words[i]];
      if (tens[words[i]] !== undefined) {
        let value = tens[words[i]];
        if (i+1 < words.length && ones[words[i+1]] !== undefined && ones[words[i+1]] < 10) value += ones[words[i+1]];
        return value;
      }
    }
    return null;
  }

  function startVoice() {
    // Hybrid voice route: hand speech capture to an iOS Shortcut.
    // The Shortcut dictates the spectator's number, then opens this app with ?n=NN.
    // Native Dictate Text is substantially more dependable than Safari speech recognition
    // on the target iOS 16 phone.
    const shortcutName = 'Number List Voice';
    location.href = 'shortcuts://run-shortcut?name=' + encodeURIComponent(shortcutName);
  }

  function openKeypad() {
    keypadDigits = '';
    updateKeypad();
    els.keypad.classList.remove('hidden');
  }

  function closeKeypad() { els.keypad.classList.add('hidden'); }

  function updateKeypad() {
    els.keypadReadout.textContent = keypadDigits.padEnd(2,'—').split('').join(' ');
  }

  function addDigit(d) {
    if (keypadDigits.length >= 2) return;
    keypadDigits += d;
    updateKeypad();
    if (keypadDigits.length === 2) {
      const n = Number(keypadDigits);
      if (prepare(n)) {
        // Manual entry is assumed to happen while the phone is concealed.
        commitSwap();
        setTimeout(closeKeypad, 80);
      } else {
        keypadDigits = '';
        setTimeout(updateKeypad, 250);
      }
    }
  }

  // Hidden controls use press-and-hold so casual touches do nothing.
  function holdTo(el, fn, ms=520) {
    const start = e => {
      if (e.type === 'touchstart') e.preventDefault();
      const timer = setTimeout(fn, ms);
      el._holdTimer = timer;
    };
    const cancel = () => clearTimeout(el._holdTimer);
    el.addEventListener('touchstart', start, {passive:false});
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
    el.addEventListener('mousedown', start);
    el.addEventListener('mouseup', cancel);
    el.addEventListener('mouseleave', cancel);
  }

  holdTo(els.voiceHotspot, startVoice, 450);      // hold top-right area
  holdTo(els.keypadHotspot, openKeypad, 450);     // hold bottom-left area
  holdTo(els.swapHotspot, commitSwap, 260);       // brief hold bottom-right after voice confirmation

  els.ackYes.addEventListener('click', () => {
    hideAck();
    // Preloaded only. Bottom-right hold commits when phone is out of view.
    showStatus(`${String(recognisedNumber).padStart(2,'0')} ready`, 650);
  });
  els.ackNo.addEventListener('click', () => { hideAck(); openKeypad(); });

  els.keypad.querySelectorAll('[data-digit]').forEach(btn => btn.addEventListener('click', () => addDigit(btn.dataset.digit)));
  els.keypadCancel.addEventListener('click', closeKeypad);
  els.keypadBack.addEventListener('click', () => { keypadDigits = keypadDigits.slice(0,-1); updateKeypad(); });

  // Draw the innocent list first. If a Shortcut supplied ?n=76,
  // the forced version is then built and rendered over it.
  render(DUMMY_MOVIES);

  // Shortcut / URL input: .../index.html?n=76
  const params = new URLSearchParams(location.search);
  const supplied = Number(params.get('n'));
  if (validNumber(supplied)) {
    prepare(supplied);
    commitSwap();
    // Remove visible query string where History API permits it.
    try { history.replaceState({}, '', location.pathname); } catch (_) {}
  }

  const now = new Date();
  els.date.textContent = now.toLocaleDateString('en-AU',{day:'numeric',month:'long',year:'numeric'}) + ' at ' + now.toLocaleTimeString('en-AU',{hour:'numeric',minute:'2-digit'});

})();



/* V6 editable library layer */
(() => {
  const STORE = 'numberListLibraryV6';
  const ACTIVE = 'numberListActiveV6';

  const fallbackMovies = [
    "Citizen Kane","Casablanca","Singin’ in the Rain","The Apartment","Jaws",
    "North by Northwest","The Conversation","Chinatown","The General","Local Hero",
    "The Maltese Falcon","Some Like It Hot","The Red Shoes","All About Eve","The French Connection",
    "The 400 Blows","Nashville","The Lady Vanishes","The Producers","Rear Window",
    "The Godfather","The Godfather Part II","Vertigo","Psycho","Rashomon","Seven Samurai",
    "The Rules of the Game","Tokyo Story","Bicycle Thieves","8½","La Dolce Vita","Persona",
    "Wild Strawberries","The Seventh Seal","The Searchers","Rio Bravo","The Big Sleep",
    "Double Indemnity","Sunset Boulevard","The Third Man","Touch of Evil","The Night of the Hunter",
    "A Matter of Life and Death","Brief Encounter","Kind Hearts and Coronets","The Lavender Hill Mob",
    "The Wages of Fear","Diabolique","Le Samouraï","Breathless","Jules and Jim","Cleo from 5 to 7",
    "Playtime","Mon Oncle","The Discreet Charm of the Bourgeoisie","The Exterminating Angel",
    "Aguirre, the Wrath of God","Fitzcarraldo","Stalker","Solaris","Andrei Rublev","Come and See",
    "The Battle of Algiers","Z","Army of Shadows","The Conformist","The Leopard","Rocco and His Brothers",
    "Once Upon a Time in the West","The Good, the Bad and the Ugly","Yojimbo","High and Low",
    "Harakiri","Ugetsu","Sansho the Bailiff","Late Spring","An Autumn Afternoon","A Man Escaped",
    "Pickpocket","Au Hasard Balthazar","The Passion of Joan of Arc","Ordet","Vampyr","M",
    "Metropolis","City Lights","Modern Times","Sherlock Jr.","The Cameraman","The Gold Rush",
    "His Girl Friday","Bringing Up Baby","The Philadelphia Story","To Be or Not to Be","The Shop Around the Corner",
    "The Treasure of the Sierra Madre","Ace in the Hole","Paths of Glory","Barry Lyndon","2001: A Space Odyssey","Dr. Strangelove"
  ];

  function defaultLibrary() {
    return [{
      id:'movies',
      title:'100 Movies',
      force:'The Third Man',
      items:fallbackMovies.slice(0,100),
      updated:Date.now()
    }];
  }
  function loadLibrary() {
    try {
      const x=JSON.parse(localStorage.getItem(STORE));
      return Array.isArray(x)&&x.length ? x : defaultLibrary();
    } catch(e) { return defaultLibrary(); }
  }
  function saveLibrary(lib) { localStorage.setItem(STORE, JSON.stringify(lib)); }
  let library=loadLibrary();
  saveLibrary(library);
  let activeId=localStorage.getItem(ACTIVE) || library[0].id;
  let editingId=null;

  const menu=document.getElementById('libraryMenu');
  const manager=document.getElementById('manager');
  const note=document.getElementById('noteView');

  function active() { return library.find(x=>x.id===activeId) || library[0]; }

  function renderRows() {
    const rows=document.getElementById('libraryRows');
    rows.innerHTML='';
    const heading=document.createElement('div');
    heading.className='nl-section-title'; heading.textContent='My Notes';
    rows.appendChild(heading);
    const card=document.createElement('div'); card.className='nl-card';
    library.forEach(item=>{
      const row=document.createElement('div'); row.className='nl-row';
      row.innerHTML=`<div class="nl-row-title"></div><div class="nl-row-meta"></div>`;
      row.querySelector('.nl-row-title').textContent=item.title;
      row.querySelector('.nl-row-meta').textContent=(item.items?.length||0)+' items';
      row.addEventListener('click',()=>openNote(item.id));
      let timer;
      row.addEventListener('touchstart',()=>timer=setTimeout(()=>openManager(item.id),800),{passive:true});
      row.addEventListener('touchend',()=>clearTimeout(timer),{passive:true});
      card.appendChild(row);
    });
    rows.appendChild(card);
    document.getElementById('noteCount').textContent=library.length+' Notes';
  }

  function show(el) {
    [menu,manager,note].forEach(x=>x && x.classList.add('nl-hidden'));
    el.classList.remove('nl-hidden');
  }

  function openMenu() { renderRows(); show(menu); }

  function applyListToPage(item) {
    // Replace heading with selected list title.
    const headings=[...note.querySelectorAll('h1,h2')];
    const titleEl=headings.find(x=>/100 Movies/i.test(x.textContent)) || headings[0];
    if(titleEl) titleEl.textContent=item.title;

    // Locate the list container used by V5 by finding numbered rows.
    const candidates=[...note.querySelectorAll('ol,ul,#movieList,.movie-list,#list,.list')];
    let listEl=candidates.find(x=>x.querySelectorAll('li').length>10);
    if(listEl) {
      listEl.innerHTML='';
      item.items.forEach((txt,i)=>{
        const li=document.createElement('li');
        li.textContent=txt;
        listEl.appendChild(li);
      });
    } else {
      // Generic fallback: replace elements that look like numbered movie rows.
      const numbered=[...note.querySelectorAll('[data-index], .movie, .list-item')];
      if(numbered.length) numbered.forEach((el,i)=>{ if(item.items[i]) el.textContent=item.items[i]; });
    }

    // Publish selected data for the existing V5 force engine if it looks for globals.
    window.NL_ACTIVE_LIST=item.items.slice();
    window.NL_FORCE_ITEM=item.force;
  }

  function openNote(id) {
    activeId=id; localStorage.setItem(ACTIVE,id);
    applyListToPage(active());
    show(note);
    window.scrollTo(0,0);
  }

  function openManager(id) {
    editingId=id;
    const item=library.find(x=>x.id===id);
    document.getElementById('editTitle').value=item?.title||'';
    document.getElementById('editForce').value=item?.force||'';
    document.getElementById('editItems').value=(item?.items||[]).join('\n');
    show(manager);
  }

  document.getElementById('newNoteButton').addEventListener('click',()=> {
    const id='list-'+Date.now();
    library.push({id,title:'New Note',force:'',items:[],updated:Date.now()});
    saveLibrary(library); openManager(id);
  });
  document.getElementById('newList').addEventListener('click',()=> {
    const id='list-'+Date.now();
    library.push({id,title:'New Note',force:'',items:[],updated:Date.now()});
    saveLibrary(library); openManager(id);
  });
  document.getElementById('saveList').addEventListener('click',()=> {
    const item=library.find(x=>x.id===editingId); if(!item)return;
    item.title=document.getElementById('editTitle').value.trim()||'Untitled';
    item.force=document.getElementById('editForce').value.trim();
    item.items=document.getElementById('editItems').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    item.updated=Date.now(); saveLibrary(library); openMenu();
  });
  document.getElementById('deleteList').addEventListener('click',()=> {
    if(library.length<=1) return;
    library=library.filter(x=>x.id!==editingId); saveLibrary(library);
    if(activeId===editingId) activeId=library[0].id;
    openMenu();
  });
  document.getElementById('managerBack').addEventListener('click',openMenu);
  document.getElementById('managerClose').addEventListener('click',openMenu);

  document.getElementById('exportLibrary').addEventListener('click',()=> {
    const blob=new Blob([JSON.stringify(library,null,2)],{type:'application/json'});
    const a=document.createElement('a'); a.href=URL.createObjectURL(blob);
    a.download='number-list-library.json'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),1000);
  });
  document.getElementById('importLibrary').addEventListener('change',ev=>{
    const f=ev.target.files?.[0]; if(!f)return;
    const r=new FileReader();
    r.onload=()=>{ try {
      const x=JSON.parse(r.result);
      if(Array.isArray(x)&&x.length){ library=x; saveLibrary(library); activeId=library[0].id; openMenu(); }
    } catch(e){} };
    r.readAsText(f);
  });

  // The visible Notes back button behaves like a real Notes back button.
  const back=note.querySelector('button.back');
  if(back) {
    back.addEventListener('click', (e)=> {
      e.preventDefault();
      e.stopPropagation();
      openMenu();
    });
  }

  // Hidden management-room entrance from menu: long-hold the “All iCloud” heading.
  const allIcloud=menu.querySelector('h1');
  let mt;
  allIcloud.addEventListener('touchstart',()=>mt=setTimeout(()=>openManager(activeId),900),{passive:true});
  allIcloud.addEventListener('touchend',()=>clearTimeout(mt),{passive:true});

  // Start in the selected note, preserving V5's performance-first launch.
  applyListToPage(active());
})();
