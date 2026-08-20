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
