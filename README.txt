LISTS / Number List V10j — CANONICAL PROJECT SPEC
Updated: 2026-08-24

PURPOSE
iPhone Home-screen web utility disguised as Apple Notes. It presents ordinary numbered lists while allowing a covert force item to appear at a chosen number.

CURRENT WORKING ARCHITECTURE
- Opens on fake “All iCloud” library/menu.
- Each list has: title, force item, items.
- Data is stored in localStorage on that app instance.
- Safari and the Home-screen app have separate localStorage. Create/edit/import performance lists in the Home app.
- Pencil-area long press opens covert two-digit keypad.
- 01–09 require a 0 prefix.
- Internal force: if force already exists in list, it moves to chosen position and all members remain.
- External force: if force is absent, it replaces the item at chosen position.
- Short lists remain short.
- Spectator can be handed the phone to scroll to the chosen number.

GESTURES
- Tap a note in All iCloud: open that list.
- Long-press a note row (~700 ms): open that note’s Edit List screen.
- Long-press All iCloud (~700 ms): open Switching Yard master dashboard.
- Long-press pencil-area hotspot (~450 ms): open covert number keypad.
- Emergency/voice hotspot behavior remains as in V10i if used.

V10j NEW — SWITCHING YARD
At Fake Notes level:
1. Long-press “All iCloud”.
2. Enter/change Force word / item.
3. Select destination list.
4. Apply.
This changes that list’s stored force item without changing its item list.
The panel reports whether the force will operate internally (existing item) or externally (replacement).

V10j NEW — PLAIN-TEXT LIST IMPORT
From Switching Yard tap Import List, then choose a .txt file in iOS Files/iCloud Drive.
Supported human-readable format:

TITLE: RGB
FORCE: Red

Red
Green
Blue

- TITLE is optional. If omitted, filename becomes title.
- FORCE is optional.
- Remaining nonblank lines become the list items.
- Import ADDS one new list to the existing library; it does not replace the library.
- Imported list becomes active and appears in All iCloud.

WHOLE-LIBRARY SAFETY COPY
Still supported, now human-labelled:
- Back Up Library -> saves “Lists Backup YYYY-MM-DD.json”
- Restore Library -> selects that backup in Files and replaces the whole current library.
This JSON format is for safety/transfer, not everyday list creation.

V10j FIX — IOS BLUE SELECTION
Native text selection/callout is suppressed only on covert long-press surfaces:
- library note rows
- All iCloud heading
Actual Edit List and Switching Yard input fields remain fully live/editable/selectable.

KNOWN RULES / QUIRKS
- Home app and Safari storage are separate.
- Prefer Home app for performance and permanent list edits.
- Do not expose admin/covert screens to spectators.
- Public-facing typography stays ordinary iOS/system style; condensed numerals only belong to covert keypad.
- Do not use Arial.
- $$$ token/macro substitution is deliberately PARKED until a real performance need appears.

VERSION HISTORY
V10i — proven dual-mode force baseline.
V10j — Switching Yard, text-list import, humanised library backup/restore labels, iOS long-press selection suppression, canonical README/spec.

NEXT
Test on actual iPhone Home app:
- note-row long press still opens editor without blue wash
- All iCloud long press opens Switching Yard
- Switching Yard can reroute force to another list
- Import RGB.txt from Files/iCloud adds list to Home app
- existing keypad/force behavior remains unchanged


V10k — 2026-08-24 TEST/FIX PASS

V10j field-test findings:
- Plain-text TXT import worked.
- Imported list was created and counted.
- iPhone Safari library could not scroll far enough to reveal lower imported rows.
- Desktop interaction became frozen/broken.

V10k fixes:
- Removed preventDefault() from note-row long-press handling.
- Restored ordinary note click/open behaviour.
- Long-press note still opens Edit List after ~700 ms.
- Native blue-selection/callout suppression remains CSS-only on covert long-press surfaces.
- Revised holdTo() so touch and synthetic mouse events do not interfere.
- Increased library-scroller bottom clearance and explicitly permits vertical pan.
- Switching Yard, TXT import, backup/restore and V10i force engine otherwise unchanged.

V10k TEST CHECKLIST
1. Desktop click note -> opens note.
2. Desktop long-press note -> opens Edit List.
3. iPhone library scrolls to all rows.
4. iPhone long-press note -> Edit List without blue wash.
5. Long-press All iCloud -> Switching Yard.
6. TXT import adds a list without replacing library.
7. Existing covert keypad still works.
