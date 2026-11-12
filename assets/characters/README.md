# First-person hand

The active hand uses Claude's pixel silhouette in `first-person-hand.js`, with skin and cloth shading from `hand-materials.js`. `avatar.js` keeps skin, shirt and equipped armor colors synchronized.

`explorer-materials.png` is a generated 2×2 atlas: dorsal skin, palm, olive linen, knuckle skin. Skin samples use object-space triplanar projection and blend the palm/finger-pad detail separately. Source color variation and relief are deliberately restrained. Cloth uses the woven detail as a grayscale dye mask so character clothing colors are preserved.

`hand-motion.js` rigs the grip to a wrist bone. Finger and tool transforms agree, while the forearm uses the existing fixed-elbow follow behavior. Grip dimensions follow the actual handle taper/oval cross-section; the palm and thumb remain below a sword's guard.

Validation (same Three.js r128 dependency as the game):
- `node hand-motion.test.cjs /path/to/three-r128.cjs`
- `node pixel-hand.test.cjs /path/to/three-r128.cjs`

The older smooth mesh atlas (`explorer-hand-meshes.js`) and concept sheet are retained as design references and are no longer loaded by the game. The old mesh baker targets that retired smooth-hand implementation, not the active pixel hand.
