#!/bin/sh
# Builds the single-file game from src/
cd "$(dirname "$0")"
{ cat src/0_head.html; echo '<script>'; for f in src/1_core.js src/2_world.js src/3_sprites.js src/4_interiors.js src/5_game.js src/6_story.js src/7_minigames.js src/8_update.js src/9_render.js src/10_ui.js src/11_v21.js; do cat "$f"; echo; done; echo '</script></body></html>'; } > index.html
