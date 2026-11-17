# Stonisle layout

Plain browser scripts on top of Three.js r128 (CDN). No bundler and no build step: what is in the repo is what the browser loads.

```
index.html              entry page; must stay at the root (GitHub Pages, and every asset URL is relative to it)
src/
  client/               browser scripts, grouped by area
    core/               core.js (pure world logic, also runs in Node), game.js (render, input, physics, save), survival, saves, backup
    world/              water, lava, foliage, lighting, block materials, mining, mobs, torches, blast, home, farming, crops
    player/             avatar, skins, first-person hand, motion (ladder, shore, companion), Wick materials
    items/              item art and icons, tools, weapons and weapon skins, ranged, drops, furnace, ink
    city/               castles, towns, guards, city rules/control/crafts, workshops, dragon palace, exploration (+ city-panel.css)
    machines/           transit rails/carts, automation, quantum railgun
    ui/                 lang (English text + read-aloud), settings tabs, bag tabs, skins panel, station inventory, creative, mobile controls, pickup notices
    net/                LAN client (net.js), QR code
    audio/              synthesized combat audio and music, audio test buttons
    review/             in-game review scenes; only active in preview worlds with their URL flag
  shared/               modules required by the server and also loaded by the client (shared-drops, shared-transit, container-transfer, cart-work)
  server/server.js      Node LAN relay + static file server, no dependencies
tests/                  *.test.js / *.test.cjs, run from the repo root (`npm test`)
assets/                 runtime files the game fetches: characters, fonts, texture-packs/, voices/ (mp3 + manifest.js, plus the voice generator scripts)
design/                 source art and concepts, never loaded by the game
docs/                   product docs, feature notes (docs/features/), this file
previews/               review screenshots and preview images; not loaded by the game
tools/                  dev scripts (bake-explorer-hand.cjs) and standalone preview pages (tools/previews/*.html)
```

## Rules

- **Load order lives in `index.html`** (`const FILES = [...]`). A new client script needs an entry there, in order of its dependencies. Scripts talk through globals (`window.X`). Pure modules also `module.exports` so that tests can `require` them.
- **Asset and stylesheet URLs are relative to `index.html`**, not to the script that requests them: write `'assets/...'` or `'src/client/city/city-panel.css'`, never `'../'`.
- **Code used by both server and client goes in `src/shared/`.** Code that is only browser- or test-shared stays in `src/client/<area>/`, with `typeof module!=='undefined'?require(...):root.X`.
- **Tests read source files cwd-relative** (`fs.readFileSync('src/client/...')`) and `require` them relative to `tests/`. Always run tests from the repo root.
- **The server serves the repo root.** `ROOT` is two levels up from `src/server/`. Dot-files and dot-folders are never served.

## Known leftovers

- `src/client/review/` is dev-only but loaded on every page, as before.
