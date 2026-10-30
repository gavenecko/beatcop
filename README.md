# Beat Cop: Donut Justice (v2.1.0)

A top-down, GTA-style 2D pixel-art beat cop simulator in one self-contained `index.html` with no external assets.

**Play:** https://gavenecko.github.io/beatcop/

## Features
- **Phone first:** floating smoothed joystick, big context buttons (A action, B car, RUN/TURBO, siren or shout), haptics, no scroll or zoom, a fullscreen button, and portrait and landscape layouts.
- **Audio:** procedural WebAudio sound effects, a chiptune soundtrack that speeds up during pursuits, a siren, and a mute toggle. Audio unlocks on the first touch.
- **City:** right-hand traffic with lane discipline, traffic lights, queueing, and honking. Pedestrians use crosswalks and wait for the light. The shift runs 14:00–22:00 (length set in Settings) into a real night: headlight cones, glowing streetlamps, and a flashlight cone when you are on foot. There are six car types, varied pedestrians, parks, and a plaza.
- **Crimes:** shoplifting, mugging, vandalism, and car theft are arrestable (tackle, cuff, transport, book). Jaywalking, littering, and noise get tickets.
- **Detective cases:** four case templates with a randomized culprit and decoys. Clues come from the crime scene interior, a witness, and dropped evidence. Accuse on the Evidence Board, then serve the warrant.
- **Interiors:** the station has a front desk, interrogation room, cells, the Sergeant's office with the evidence board, booking, and your desk for paperwork. You can also enter the donut shop and crime scenes (bank, jeweler, apartments, pawn shop).
- **Minigames:** interrogation (suspect quirks, pressure and lawyer meters) and paperwork (typos, crime codes, triplicate stamping).
- **Career:** rank, best shift, and solved cases are saved to localStorage. Pixel font and a title screen.

## New in v2.1
- **Crimes:** speeding (use the radar gun, then make a traffic stop and write a ticket), DUI (pull over, breathalyzer, arrest), bar brawls, pickpockets, armed robbery (shots fired, call BACKUP, take cover, the suspect can surrender), drug-deal stakeouts (wait for the handoff for a bonus), and noise complaints.
- **Random events:** a cat stuck in a tree, a lost kid, and a parade that closes a road.
- **Officer Ramirez:** a partner who rides along and makes comments. Hire Ramirez at the station desk.
- **Upgrades:** buy them with shift cash at the station: Engine, Taser, Glazers, Scanner.
- **Progression:** daily shift goals, and your rank unlocks new crime types.
- **Dispatch ticker:** dispatch is a single scrolling line with a radio log in the pause menu.
- **Tutorial:** guides your first shift and can be skipped.
- **Settings:** SFX and music volume, control size, a left-handed layout, shift length, and screen shake.
- **Feel:** chases get harder as the shift goes on, hits stop the action briefly with a flash, the screen shakes, and pedestrians have more looks (mustaches, hoods, headphones, ski masks).

## Controls
Touch: drag on the left side to move, A for the context action, B to get in or out of the car, RUN to sprint or turbo, 🚨/📣 for the siren or a shout, and tap the minimap for the full map.
Keyboard: WASD or arrows to move, Space/J = A, E/K = B, Shift = run, H = siren, M = map, P/Esc = pause, 1-9 = dialog choices.

## Development
The source is in `src/`. Run `./build.sh` to concatenate it into `index.html`.
