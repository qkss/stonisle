# Wick voice

Approved cast: MiniMax `speech-2.8-hd`, `lovely_girl`, speed `0.95`, pitch `0`. No post-processing pitch shift.

Regenerate missing lines with `python3 assets/voices/make-unified-wick.py`, then verify with `node assets/voices/verify-native.cjs`. Requires an authenticated `mmx` installation with speech balance. The generator exports current quests, cheers, companion dialogue and module feedback, caches each generated clip, and only publishes the manifest after all clips validate. Item names and examples now use the same Wick cast; the narrator key only selects the item-caption placement. Batch subtitles must exactly match source text before audio is split. Use this generator rather than the legacy Kokoro `make.py` or the earlier companion-only `make-minimax.py`.

`manifest-before-unified-wick.js` retains the pre-unification manifest, and old audio files remain available for rollback. User-written sign text and future ungenerated dialogue still use the device fallback voice; API credentials are not shipped to the game.
