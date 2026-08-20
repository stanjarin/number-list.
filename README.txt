HONEST TITLE — prototype

WHAT IT DOES
- Opens directly to a fake note headed “100 Movies”.
- Launch state is always the innocent dummy list.
- Forced placeholder movie: The Third Man.
- Valid spoken/manual range: 02–99 (“between 1 and 100”).

PERFORMER CONTROLS
1. VOICE: press-and-hold the invisible TOP-RIGHT 76×76 px area (~0.45 sec).
   - If Web Speech is available, it listens once.
   - It displays a private “76?” acknowledgement.
   - YES preloads the forced list but DOES NOT visibly swap it yet.
   - When the phone is out of view, briefly hold the invisible BOTTOM-RIGHT corner to commit the swap.
   - NO opens the manual keypad.

2. MANUAL FALLBACK: press-and-hold the invisible BOTTOM-LEFT corner (~0.45 sec).
   - Enter exactly two digits.
   - On the second digit the list is prepared and swapped automatically.
   - 02–99 only.

3. SHORTCUT / EXTERNAL INPUT:
   Open the page with ?n=76 appended to its URL.
   Example: https://YOUR-SITE/index.html?n=76
   The forced version opens immediately and the query string is then removed from the visible address where permitted.

RESET
- Close/quit and relaunch with the normal Home Screen icon/start URL (without ?n=).
- It always starts on the dummy list.

VOICE ON iOS 16
Safari itself supports Web Speech, but Apple documentation/bugs from the iOS 16 era indicate speech recognition was not available to Home-Screen web apps. The manual keypad therefore works independently, and the ?n= entry is included for a Shortcut/native-dictation hybrid.

DEPLOYMENT
Upload ALL of these files to the repository root:
- index.html
- styles.css
- app.js
- manifest.webmanifest
- icon-180.png
- icon-512.png

(The prototype deliberately does not use a service worker yet, to avoid stale cached copies while testing.)

GitHub Pages is fine. Add to Home Screen from Safari once the page is behaving correctly.

EDITING THE FORCE
In app.js, change:
  const FORCE_ITEM = 'The Third Man';

MOVIE LIST
The 100 titles are placeholders only. Replace DUMMY_MOVIES in app.js with any 100-item list, but do not include FORCE_ITEM in the dummy list.

V6
- Adds an editable local library of lists.
- Hold the fake Notes back control to open the fake Notes library.
- Hold “All iCloud” in the library to enter List Manager.
- Add/edit/delete lists locally without GitHub.
- Export/import the library as JSON for backup.
- Existing V5 force controls are retained.

V6a: fake Notes back button now opens library with an ordinary tap.
