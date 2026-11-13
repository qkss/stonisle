// Stonisle — English names, read-aloud, and look-to-label (PRD FR-011 / FR-012).
// 独立文件：game.js 只调用 Lang.item / Lang.look / Lang.auto，文案和语音逻辑都在这里。
window.Lang = (() => {
  const $ = id => document.getElementById(id);

  // ---- 英文名（游戏内只出现英文；中文名留在 core.js / PRD 里做文档用）----
  const BLOCK = ['hand', 'grass', 'dirt', 'stone', 'sand', 'water', 'log', 'leaves', 'plank', 'red brick', 'stone brick',
    'coal', 'iron ore', 'gold ore', 'crystal ore', 'snow'];
  ['glass', 'sandstone', 'smooth stone', 'thatch', 'snow brick', 'roof tile', 'iron block', 'gold block', 'crystal block', 'lamp'].forEach((n, i) => { BLOCK[50 + i] = n; }); // 第一批建筑方块
  ['obsidian', 'calcite', 'amethyst', 'diamond', 'ruby', 'emerald', 'sapphire'].forEach((n, i) => { BLOCK[80 + i] = n; });                     // 矿物与宝石
  ['cement', 'yellow brick', 'dark brick', 'light plank', 'dark plank', 'red plank'].forEach((n, i) => { BLOCK[90 + i] = n; });                  // 不同颜色的建材
  ['door', 'door', 'door', 'door', 'window', 'window', 'bed', 'bed', 'red flower', 'yellow flower', 'blue flower', 'berry bush', 'berry bush', 'sapling'].forEach((n, i) => { BLOCK[60 + i] = n; }); // 家居与植物
  Object.assign(BLOCK, { 159: 'banana leaves', 176: 'grape vine', 199: 'lychee leaves', 183: 'slime block', 116: 'red mushroom', 117: 'brown mushroom', 118: 'white mushroom', 179: 'campfire', 119: 'pumpkin', 143: 'watermelon', 144: 'cherry blossom', 145: 'apple leaves', 152: 'mango leaves', 154: 'granite', 155: 'marble', 156: 'quartz', 157: 'slate', 158: 'cobblestone', 77: 'rose', 78: 'sunflower', 79: 'lily', 87: 'daffodil', 88: 'rapeseed flower', 89: 'bamboo', 98: 'farmland', 99: 'little plant' }); // 新植物和耕地（farm.js）
  BLOCK[74] = BLOCK[75] = 'sign'; BLOCK[76] = 'chest'; BLOCK[96] = 'glow glass'; BLOCK[97] = 'ice lamp';
  Core.WOODS.forEach(w=>{for(let k=0;k<4;k++)BLOCK[w.ladder+k]=w.name+' ladder';BLOCK[w.log]=w.name+' log';BLOCK[w.plank]=w.name+' plank';BLOCK[w.chest]=w.name+' chest';BLOCK[w.doorR]=BLOCK[w.doorR+1]=w.name+' door';for(let k=0;k<4;k++){BLOCK[w.door+k]=w.name+' door';BLOCK[w.stairs+k]=w.name+' stairs';}BLOCK[w.slab]=w.name+' slab';BLOCK[w.fence]=w.name+' fence';for(let k=0;k<4;k++)BLOCK[w.inverted+k]=w.name+' stairs';BLOCK[w.upperSlab]=w.name+' slab';BLOCK[w.doubleSlab]=w.name+' double slab';});
  const ITEM = { 273: 'cooked meat', 274: 'cooked rabbit', 275: 'cooked venison', 276: 'cooked antelope', 277: 'cooked fox', 278: 'cooked pork', 279: 'cooked fish', 268: 'rabbit meat', 269: 'venison', 270: 'antelope meat', 271: 'fox meat', 272: 'pork', 261: 'bow', 262: 'crossbow', 263: 'hunting shotgun', 264: 'arrow', 265: 'pellet', 266: 'bowstring', 267: 'gunpowder', 256: 'banana', 257: 'grapes', 258: 'lychee', 259: 'pumpkin seeds', 260: 'watermelon seeds', 177: 'apple', 178: 'mango', 100: 'rose seeds', 101: 'sunflower seeds', 102: 'lily seeds', 103: 'daffodil seeds', 104: 'rapeseed seeds', 105: 'fertilizer', 106: 'wooden bucket', 107: 'wooden bucket of water', 108: 'iron bucket', 109: 'iron bucket of water', 16: 'wooden pickaxe', 17: 'wooden axe', 18: 'wooden shovel', 153: 'wooden sword', 20: 'stone pickaxe', 21: 'stone axe', 22: 'stone shovel', 23: 'stone sword', 24: 'torch', 25: 'iron pickaxe', 26: 'iron sword',
    27: 'spear', 30: 'raw meat', 31: 'hide', 32: 'berry', 33: 'clay', 34: 'scorpion shell', 35: 'vine', 36: 'tusk', 37: 'shade fur', 46: 'shell boots', 47: 'night cloak',
    38: 'bat wing', 39: 'black feather', 48: 'glide cape', 49: 'quill', 110: 'glow dust', 111: 'frost shard', 112: 'raw fish', 113: 'jelly', 114: 'crab shell', 115: 'crab meat', 120: 'crab helmet', 121: 'straw hat', 122: 'straw shirt', 123: 'straw pants', 124: 'straw sandals', 125: 'leather pants', 126: 'iron pants',
    127: 'alloy helmet', 128: 'alloy armor', 129: 'alloy pants', 131: 'alloy boots', 130: 'alloy ingot',
    132: 'white fur', 133: 'worm tooth', 134: 'stone heart', 135: 'obsidian core', 136: 'eel skin', 137: 'tide scale', 138: 'vulture feather', 139: 'gale feather', 140: 'shade membrane', 141: 'storm plume',
    142: 'snow boots', 19: 'drill pickaxe', 28: 'heart pickaxe', 29: 'obsidian sword', 146: 'dive suit', 147: 'tide armor', 148: 'longwing cape', 149: 'gale boots', 150: 'shade cloak', 151: 'storm crown', 40: 'leather cap', 41: 'leather coat', 42: 'leather boots', 43: 'iron helmet', 44: 'iron armor', 45: 'iron boots' };
  const MOB = { '熊猫': 'panda', '史莱姆': 'slime', '野兔': 'rabbit', '鹿': 'deer', '雪兔': 'snow hare', '驯鹿': 'reindeer', '沙狐': 'sand fox', '羚羊': 'antelope', '影狼': 'shade wolf',
    '洞蝠': 'cave bat', '啄鸦': 'peck crow', '灯蛾': 'lamp moth', '霜灵': 'frost wisp', '咬咬鱼': 'nipper fish', '刺水母': 'sting jelly', '钳蟹': 'pincer crab',
    '雪爪': 'frost prowler', '沙虫': 'dune worm', '岩偶': 'stone golem', '黑曜卫士': 'obsidian sentinel', '潜鳗': 'lurker eel', '潮蛇': 'tide serpent', '沙鹫': 'dune vulture', '风隼': 'gale hawk', '影翼': 'shade wing', '风暴鹏': 'storm roc',
    '泥团': 'mud blob', '沙蝎': 'sand scorpion', '缠藤': 'snare vine', '鬃猪': 'bristle boar' };
  const item = id => BLOCK[id] || ITEM[id] || 'thing';
  // 词 → 例句。这张表就是目前的受控词表：只有表里的词会进手记
  const SENT = {
    grass: 'Grass is green.', dirt: 'Dirt is brown.', stone: 'Stone is hard.', sand: 'Sand is soft.', water: 'Fish live in water.',
    log: 'A log comes from a tree.', leaves: 'Leaves grow on trees.', plank: 'Make planks from a log.', 'red brick': 'Red bricks make a strong wall.',
    'stone brick': 'Stone bricks are gray.', coal: 'Coal burns for a long time.', 'iron ore': 'Iron ore is in the rock.', 'gold ore': 'Gold ore is deep down.',
    'crystal ore': 'Crystal ore shines.', snow: 'Snow is cold and white.',
    glass: 'Glass lets the light in.', sandstone: 'Sandstone is made of sand.', 'smooth stone': 'Smooth stone makes a good floor.', thatch: 'Thatch makes a warm roof.',
    'snow brick': 'Snow bricks make a snow house.', 'roof tile': 'Roof tiles keep the rain out.', 'iron block': 'An iron block is very heavy.',
    'gold block': 'A gold block shines.', 'crystal block': 'A crystal block glows blue.', lamp: 'A lamp lights up the dark.',
    door: 'Open the door and come in.', window: 'Look out of the window.', bed: 'Sleep in the bed at night.',
    'banana leaves': 'Bananas grow on this tree.', 'grape vine': 'Grapes grow on this vine.', 'lychee leaves': 'Lychees grow on this tree.', 'banana': 'A banana is long and yellow.', 'grapes': 'Grapes are small and purple.', 'lychee': 'A lychee is red outside and white inside.',
    'red mushroom': 'This mushroom is red with white dots.', 'brown mushroom': 'This mushroom is brown.', 'white mushroom': 'This mushroom is white.', 'campfire': 'A campfire cooks meat. It needs wood.', 'pumpkin': 'A pumpkin is big and orange.', 'watermelon': 'A watermelon is green outside and red inside.',
    'cherry blossom': 'Cherry blossoms are pink.', 'apple leaves': 'Apples grow on this tree.', 'mango leaves': 'Mangoes grow on this tree.', 'apple': 'An apple is red and sweet.', 'mango': 'A mango is yellow and sweet.', 'pumpkin seeds': 'Plant pumpkin seeds in dirt.', 'watermelon seeds': 'Plant watermelon seeds in dirt.',
    'cooked meat': 'Cooked meat is hot and good.', 'cooked rabbit': 'Cooked rabbit is hot and good.', 'cooked venison': 'Cooked venison is hot and good.', 'cooked antelope': 'Cooked antelope is hot and good.', 'cooked fox': 'Cooked fox is hot and good.', 'cooked pork': 'Cooked pork is hot and good.', 'cooked fish': 'Cooked fish is hot and good.',
    'rabbit meat': 'Rabbit meat comes from a rabbit.', 'venison': 'Venison is deer meat.', 'antelope meat': 'Antelope meat comes from an antelope.', 'fox meat': 'Fox meat comes from a fox.', 'pork': 'Pork comes from a boar.',
    'bow': 'A bow shoots arrows far.', 'crossbow': 'A crossbow is strong and slow.', 'hunting shotgun': 'A hunting shotgun has a wooden stock and two long barrels.', 'arrow': 'An arrow is long and thin.', 'pellet': 'A pellet is a small iron ball.', 'bowstring': 'A bowstring is made from a vine.', 'gunpowder': 'Gunpowder is black dust.',
    'granite': 'Granite is hard and pink.', 'marble': 'Marble is white and smooth.', 'quartz': 'Quartz is white and shiny.', 'slate': 'Slate is dark and flat.', 'cobblestone': 'Cobblestones are small round stones.',
    'rose': 'A rose is red and smells sweet.', 'sunflower': 'A sunflower is tall and yellow.', 'lily': 'A lily is white and pink.', 'daffodil': 'A daffodil is yellow.', 'rapeseed flower': 'Rapeseed flowers are small and yellow.', 'bamboo': 'Bamboo grows tall and fast.', 'farmland': 'Plants grow in farmland.', 'little plant': 'This little plant will grow.',
    'rose seeds': 'Plant rose seeds in dirt.', 'sunflower seeds': 'Plant sunflower seeds in dirt.', 'lily seeds': 'Plant lily seeds in dirt.', 'daffodil seeds': 'Plant daffodil seeds in dirt.', 'rapeseed seeds': 'Plant rapeseed seeds in dirt.', 'fertilizer': 'Fertilizer helps plants grow fast.',
    'wooden bucket': 'A wooden bucket can carry water.', 'wooden bucket of water': 'This bucket is full of water.', 'iron bucket': 'An iron bucket can carry water.', 'iron bucket of water': 'This bucket is full of water.',
    'red flower': 'This flower is red.', 'yellow flower': 'This flower is yellow.', 'blue flower': 'This flower is blue.',
    'cave bat': 'Cave bats fear the light.', 'peck crow': 'The peck crow wants your food.', 'lamp moth': 'The lamp moth likes the light.', 'frost wisp': 'The frost wisp is cold.',
    'nipper fish': 'Nipper fish bite in the water.', 'sting jelly': 'Do not touch the sting jelly.', 'pincer crab': 'The pincer crab walks to the side.',
    'bat wing': 'A bat wing is thin.', 'black feather': 'A black feather is light.', 'glide cape': 'A glide cape helps you fall slowly.', quill: 'Write more with a quill.',
    'glow dust': 'Glow dust shines.', 'frost shard': 'A frost shard is cold.', 'raw fish': 'Eat fish to get well.', jelly: 'Jelly glows at night.',
    'crab shell': 'A crab shell is hard.', 'crab meat': 'Crab meat is good food.', 'crab helmet': 'Swim fast with a crab helmet.', 'glow glass': 'Glow glass shines in the dark.', 'ice lamp': 'An ice lamp is blue.',
    'straw hat': 'A straw hat keeps the sun off.', 'straw shirt': 'A straw shirt is light.', 'straw pants': 'Straw pants are light.', 'straw sandals': 'Sandals go on your feet.',
    'leather pants': 'Pants go on your legs.', 'iron pants': 'Iron pants are heavy.', 'alloy ingot': 'Mix iron and gold to make alloy.',
    'alloy helmet': 'The alloy helmet is the strongest.', 'alloy armor': 'Alloy armor is stronger than iron.', 'alloy pants': 'Alloy pants are strong.', 'alloy boots': 'Alloy boots are strong.',
    'frost prowler': 'The frost prowler hides in the snow.', 'dune worm': 'The dune worm swims under the sand.', 'stone golem': 'The stone golem sleeps like a rock.', 'obsidian sentinel': 'The obsidian sentinel is very hard to hurt.',
    'lurker eel': 'The lurker eel waits in deep water.', 'tide serpent': 'The tide serpent swims in circles.', 'dune vulture': 'The dune vulture waits until you are weak.', 'gale hawk': 'The gale hawk pushes you back.',
    'shade wing': 'The shade wing glows before it dives.', 'storm roc': 'The storm roc is the biggest bird.',
    'white fur': 'White fur is soft and warm.', 'worm tooth': 'A worm tooth is sharp.', 'stone heart': 'The stone heart is warm.', 'obsidian core': 'The obsidian core is dark and heavy.', 'eel skin': 'Eel skin is smooth.',
    'tide scale': 'A tide scale shines like water.', 'vulture feather': 'A vulture feather is long.', 'gale feather': 'A gale feather is very light.', 'shade membrane': 'The shade membrane is thin and dark.', 'storm plume': 'There is only one storm plume.',
    'snow boots': 'Snow boots keep your feet warm.', 'drill pickaxe': 'The drill pickaxe digs sand very fast.', 'heart pickaxe': 'The heart pickaxe digs stone the fastest.', 'obsidian sword': 'The obsidian sword is the strongest sword.',
    'dive suit': 'Swim faster with a dive suit.', 'tide armor': 'Tide armor is stronger than alloy.', 'longwing cape': 'With a longwing cape, falling does not hurt.', 'gale boots': 'Jump higher with gale boots.',
    'shade cloak': 'Monsters cannot see you well in a shade cloak.', 'storm crown': 'Nothing can push you with the storm crown.',
    'mud blob': 'The mud blob hops in the mud.', 'sand scorpion': 'The sand scorpion can not swim.', 'snare vine': 'The snare vine can not walk.', 'bristle boar': 'The bristle boar runs in a line.',
    spear: 'A spear is long and sharp.', clay: 'Clay makes red bricks.', 'scorpion shell': 'A scorpion shell is hard.', vine: 'A vine is long and green.', tusk: 'A tusk is a big tooth.',
    'shade fur': 'Shade fur is dark and soft.', 'shell boots': 'Shell boots keep your feet safe.', 'night cloak': 'Wolves can not see the night cloak.',
    sign: 'Write a word on the sign.', chest: 'Keep your things in the chest.',
    'berry bush': 'Berries grow on this bush.', sapling: 'A sapling grows into a tree.', berry: 'Berries are sweet.',
    obsidian: 'Obsidian is black and very hard.', calcite: 'Calcite is white and soft.', amethyst: 'Amethyst is purple.', diamond: 'A diamond is the hardest stone.',
    ruby: 'A ruby is red.', emerald: 'An emerald is green.', sapphire: 'A sapphire is blue.',
    cement: 'Cement makes a gray wall.', 'yellow brick': 'Yellow bricks look warm.', 'dark brick': 'Dark bricks look strong.',
    'light plank': 'Light planks are pale wood.', 'dark plank': 'Dark planks are brown wood.', 'red plank': 'Red planks are red wood.',
    'wooden pickaxe': 'A wooden pickaxe is your first tool.', 'wooden axe': 'A wooden axe cuts logs.', 'wooden shovel': 'A wooden shovel digs dirt.', 'wooden sword': 'A wooden sword is light.',
    'stone pickaxe': 'Dig stone with a pickaxe.', 'stone axe': 'Cut logs with an axe.', 'stone shovel': 'Dig dirt with a shovel.', 'stone sword': 'A sword keeps you safe.',
    torch: 'A torch gives light at night.', 'iron pickaxe': 'An iron pickaxe is fast.', 'iron sword': 'An iron sword is strong.',
    'raw meat': 'Eat meat to get well.', hide: 'Hide comes from animals.', 'leather cap': 'Wear the cap on your head.', 'leather coat': 'The coat keeps you safe.',
    'leather boots': 'Boots go on your feet.', 'iron helmet': 'The helmet is very hard.', 'iron armor': 'Iron armor is heavy.', 'iron boots': 'Iron boots are strong.',
    panda: 'The panda is black and white. It loves bamboo.', slime: 'The slime is green and bouncy.', 'slime block': 'You can bounce on a slime block.',
    rabbit: 'The rabbit hops.', deer: 'The deer has four legs.', 'snow hare': 'The snow hare is white.', reindeer: 'The reindeer lives in the snow.',
    'sand fox': 'The sand fox has big ears.', antelope: 'The antelope runs fast.', 'shade wolf': 'The shade wolf comes at night.',
  };

  // ---- 朗读：浏览器自带语音合成，不打包音频；没有英文语音就只显示文字 ----
  const TTS = 'speechSynthesis' in window;
  let voice = null, wickVoice = null, enVoices = [], on = localStorage.getItem('stonisle.voice') !== 'off', last = '', lastAt = 0, lastPitch = 1;
  function pickVoice() {
    const vs = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
    // 先挑常见的标准美式语音（系统里按字母排在前面的往往是搞怪音色），再退到任意本地美式、任意英文
    const good = /Samantha|Ava|Allison|Alex|Susan|Nicky|Google US English|Microsoft (Aria|Jenny|Zira|Guy)/i;
    voice = vs.find(v => good.test(v.name) && /en[-_]US/i.test(v.lang)) || vs.find(v => good.test(v.name))
      || vs.find(v => v.localService && /en[-_]US/i.test(v.lang)) || vs[0] || null;
    if ($('voiceNote')) $('voiceNote').textContent = voice ? '' : '(no English voice on this device)';
    // Wick 用另一个声音，和旁白区分开：优先选孩子气的（macOS 的 Junior、Windows 的 Ana 等），可在菜单里换
    enVoices = vs;
    const saved = localStorage.getItem('stonisle.wickVoice'), US = v => /en[-_]US/i.test(v.lang);
    const kid = ['Junior', 'Ana', 'Princess', 'Sandy', 'Shelley', 'Flo', 'Kathy', 'Nicky']    // 按这个顺序挑，越靠前越孩子气
      .map(n => vs.find(v => v !== voice && US(v) && new RegExp('^(Microsoft )?' + n + '\\b', 'i').test(v.name))).find(Boolean);
    wickVoice = vs.find(v => v.name === saved) || kid || vs.find(v => v !== voice && v.localService && US(v)) || voice;
    fillWickVoices();
  }
  function fillWickVoices() { // 菜单里的下拉框：列出本机全部英文语音，选中即试听
    const sel = $('wickVoice'); if (!sel) return;
    sel.innerHTML = enVoices.map(v => `<option${v === wickVoice ? ' selected' : ''}>${v.name}</option>`).join('');
  }
  if (TTS) { pickVoice(); speechSynthesis.addEventListener('voiceschanged', pickVoice); }
  // 新的朗读替换正在读的。返回的 Promise 在读完（没有语音时按字数估算）后兑现，开场用它串起一句句话
  function say(text, slow, pitch = 1) {
    if (!text) return Promise.resolve();
    if (pitch === 1 && !isItemText(text)) pitch = 1.4;       // 旁白只读界面上的物品名和它的例句；其余一律由 Wick 说
    last = text; lastAt = performance.now(); lastPitch = pitch;
    const est = 700 + text.length * (slow ? 120 : 75);
    const el = pitch !== 1 ? bubEl : capEl;                  // pitch ≠ 1：Wick 说的话，进气泡；否则是旁白读物品名，显示在左下角
    const who = pitch !== 1 ? 'wick' : 'narrator';           // 两个声音：Wick 负责对话和任务；旁白负责界面上的物品名、单词和例句
    const clip = on && window.VOICES && VOICES[who] && VOICES[who][text];
    if (clip) return playClip(clip, text, slow, el, pitch);   // 预先生成的配音文件优先
    if (!on || !voice) { caption(text, null, slow, el); return new Promise(r => setTimeout(r, est)); } // 不出声时也显示字幕
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text), wk = pitch !== 1 && wickVoice;     // 没有配音文件的句子退回系统语音合成，同样分两个声音
    u.voice = wk || voice; u.lang = u.voice.lang; u.rate = slow ? 0.6 : wk ? 1 : 0.9; u.pitch = pitch;
    caption(text, u, slow, el);
    speechSynthesis.speak(u);
    return new Promise(r => { u.addEventListener('end', r); u.addEventListener('error', r); setTimeout(r, est + 5000); });
  }
  // ---- 配音文件：voices/manifest.js 把“谁说的哪句话”对应到一个 mp3；没有清单或缺某一句时自动退回语音合成 ----
  let audio = null, hiTimer = 0;
  document.head.appendChild(Object.assign(document.createElement('script'), { src: 'voices/manifest.js?' + Date.now() })); // 不存在也没关系
  const speaking = () => (TTS && speechSynthesis.speaking) || !!(audio && !audio.paused && !audio.ended);
  function playClip([file, dur], text, slow, el, pitch) {
    if (TTS) speechSynthesis.cancel();
    if (audio) audio.pause();
    clearInterval(hiTimer);
    const a = audio = new Audio('voices/' + file), { spans, clear } = caption(text, null, slow, el);
    a.playbackRate = slow ? 0.7 : 1;                          // 慢速：放慢但不变调
    return new Promise(res => {
      const end = () => { clearInterval(hiTimer); for (const [, sp] of spans) sp.classList.remove('now'); clear(2000); res(); };
      a.onended = end;
      a.onerror = () => { clearInterval(hiTimer); delete VOICES[pitch !== 1 ? 'wick' : 'narrator'][text]; say(text, slow, pitch).then(res); }; // 文件坏了：这一句改用语音合成
      hiTimer = setInterval(() => { // 没有逐词时间戳，按已播放的比例估算读到第几个字符
        if (a.paused) return;
        const at = Math.min(0.999, a.currentTime / (dur || a.duration || 1)) * text.length;
        for (const [start, sp] of spans) sp.classList.toggle('now', start <= at && at < start + sp.textContent.length + 1);
      }, 60);
      a.play().catch(() => a.onerror());                      // 浏览器拦了自动播放等情况
      setTimeout(res, ((dur || 3) / a.playbackRate + 6) * 1000);
    });
  }
  const isItemText = t => !!SENT[t] || t === 'hand' || t === 'thing' || t === 'animal' || !!SENT[t.split('. ')[0]];
  const wsay = (text, excited) => say(text, false, excited ? 1.7 : 1.4); // Wick：换一个声音、音调更高、语速略快；兴奋时更高
  // 字幕：读什么就显示什么，读到哪个词哪个词变亮。旁白显示在左下角，Wick 的话显示在它头顶的气泡里
  function caption(text, u, slow, el) {
    const other = el === capEl ? bubEl : capEl;
    clearTimeout(other._t); other.textContent = '';
    clearTimeout(el._t);
    el.textContent = '';
    const spans = []; let pos = 0;
    for (const part of text.split(/(\s+)/)) {
      if (/\S/.test(part)) { const sp = el.appendChild(document.createElement('span')); sp.textContent = part; spans.push([pos, sp]); }
      else el.appendChild(document.createTextNode(part));
      pos += part.length;
    }
    const clear = ms => { clearTimeout(el._t); el._t = setTimeout(() => { el.textContent = ''; }, ms); };
    clear(2500 + text.length * (slow ? 150 : 90));           // 兜底：朗读被打断或没有语音时按字数估算停留时间
    if (!u) return { spans, clear };
    u.onboundary = e => { // 语音引擎报告读到第几个字符；不支持的引擎就整句常亮
      if (e.name && e.name !== 'word') return;
      for (const [start, sp] of spans) sp.classList.toggle('now', start <= e.charIndex && e.charIndex < start + sp.textContent.length);
    };
    u.onend = () => { for (const [, sp] of spans) sp.classList.remove('now'); clear(2000); }; // 读完再留 2 秒
    return { spans, clear };
  }
  const auto = text => { meet(text); if (text !== last || performance.now() - lastAt > 2000) say(text); }; // 同一句 2 秒内不自动重复
  addEventListener('keydown', e => { if (e.code === 'KeyV' && last) say(last, e.shiftKey, lastPitch); });  // V 重听，Shift+V 慢速
  if ($('voice')) {
    $('voice').checked = on;
    $('voice').onchange = e => { on = e.target.checked; localStorage.setItem('stonisle.voice', on ? 'on' : 'off'); if (on) say('Read aloud is on.'); else { if (TTS) speechSynthesis.cancel(); if (audio) audio.pause(); } };
  }

  // ---- 看见即标注：准星停在同一样东西上 0.5 秒显示英文名；第一次见到的词自动读一遍 ----
  let seen; try { seen = new Set(JSON.parse(localStorage.getItem('stonisle.words')) || []); } catch (e) { seen = new Set(); }
  let cur = '', since = 0;
  function meet(name) { // 只收录词表里的词；新词返回 true
    if (!SENT[name] || seen.has(name)) return false;
    seen.add(name);
    try { localStorage.setItem('stonisle.words', JSON.stringify([...seen])); } catch (e) { /* 存不下就不记 */ }
    return true;
  }
  // 射线对动物包围盒（与 game.js 的攻击判定同一算法），比方块近才算
  function mobAt(o, d, mobs, maxT) {
    let name = '';
    for (const m of mobs) {
      const lo = [m.x - m.type.r, m.y, m.z - m.type.r], hi = [m.x + m.type.r, m.y + m.type.h, m.z + m.type.r];
      let t0 = 0, t1 = maxT;
      for (let i = 0; i < 3; i++) { const a = (lo[i] - o[i]) / d[i], b = (hi[i] - o[i]) / d[i]; t0 = Math.max(t0, Math.min(a, b)); t1 = Math.min(t1, Math.max(a, b)); }
      if (t0 <= t1) { name = MOB[m.type.name] || 'animal'; maxT = t0; }
    }
    return name;
  }
  function look(blockName, now, o, d, mobs, blockT) {
    if (window.game && o) wickTick(now, o, d);
    const name = (mobs && mobAt(o, d, mobs, blockT)) || blockName, el = $('label');
    if (name !== cur) { cur = name; since = now; if (el) el.textContent = ''; return; }
    if (!name || !el || el.textContent || now - since < 500) return;
    el.textContent = name;
    if (meet(name)) auto(name);
  }

  // ---- 分级任务引导：句子从单词短语 → 带数字的短句 → 完整句子，逐级变难 ----
  // 完成条件只读游戏状态（背包、世界改动、位置、界面），每 0.4 秒看一次，不改 game.js 的逻辑
  const NUM = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
  const held = () => (($('bar') && $('bar').querySelector('.on')) || {}).title || '';
  const placed = (g, id) => { let n = 0; for (const k in g.world.edits) for (const i in g.world.edits[k]) if (g.world.edits[k][i] === id) n++; return n; };
  const inv = (g, id) => g.inv[id] || 0;
  const PLANKS = Core.WOODS.map(w => w.plank), placedIf = (g, ok) => { let n = 0; for (const k in g.world.edits) for (const i in g.world.edits[k]) if (i !== 'g' && ok(g.world.edits[k][i])) n++; return n; }; // 世界里放着的、符合条件的方块数
  const LEVELS = [
    { name: 'First words', quests: [
      { say: 'Look. A tree.', target: [6], done: () => /^(log|leaves)$/.test($('label').textContent) },
      { say: 'Dig a log.', target: [6], count: g => inv(g, 6), n: 1, gain: true },
      { say: 'Open the bag.', key: 'E', done: () => !$('bag').classList.contains('off') },
      { say: 'Make planks.', count: g => inv(g, 8), n: 4, gain: true, quiet: true },
      { say: 'Put a plank.', count: g => placed(g, 8), n: 1 },
    ] },
    { name: 'Numbers', quests: [
      { say: 'Dig three logs.', target: [6], count: g => inv(g, 6), n: 3, gain: true },
      { say: 'Make eight planks.', count: g => inv(g, 8), n: 8, gain: true, quiet: true },
      { say: 'Dig five stones.', target: [3], count: g => inv(g, 3), n: 5, gain: true },
      { say: 'Make one stone pickaxe.', done: g => inv(g, 20) + inv(g, 25) > 0 },
      { say: 'Put six planks on the ground.', count: g => placed(g, 8), n: 6 },
    ] },
    { name: 'Sentences', quests: [
      { say: 'Hold the pickaxe in your hand.', key: '1–9', done: () => /pickaxe/.test(held()) },
      { say: 'Dig three stones with your pickaxe.', target: [3], count: g => (/pickaxe/.test(held()) ? inv(g, 3) : -1), n: 3, gain: true },
      { say: 'Go ten blocks away from here.', count: g => Math.floor(Math.hypot(g.p.x - at.x, g.p.z - at.z)), n: 10, quiet: true },
      { say: 'Look at two new things.', count: () => seen.size, n: 2 },
      { say: 'Open your journal and hear a word.', key: 'J', done: () => heard },
    ] },
    { name: 'My home', quests: [ // 盖一个能过夜的小屋：砌墙 → 做门 → 装门 → 放床 → 睡到天亮。床要兽皮才能做，这里装好门就送一张，不用为了任务去打动物
      { say: 'Build a wall. Put twelve planks.', count: g => placedIf(g, id => PLANKS.includes(id)), n: 12 },
      { say: 'Make a door.', done: g => Core.WOODS.some(w => inv(g, w.door) > 0) },
      { say: 'Put the door in your wall.', done: g => placedIf(g, id => !!Core.doorBase(id)) > 0, gift: 66, cheer: 'Good job! Here is a bed for you.' },
      { say: 'Put your bed in your home.', done: g => placedIf(g, id => id === 66 || id === 67) > 0 },
      { say: 'Sleep in your bed at night.', count: () => (window.Home && Home.sleeps) || 0, n: 1 },
    ] },
  ];
  const QUESTS = LEVELS.flatMap((l, li) => l.quests.map((q, qi) => ({ ...q, level: li, idx: qi, of: l.quests.length })));
  // 中文小字提示：只给“这一句里第一次出现的新词”，标在该词正下方；F1 或点任务卡片显示 5 秒
  const ZH = { look: '看', tree: '树', dig: '挖', log: '原木', logs: '原木', open: '打开', bag: '背包', make: '制作', plank: '木板', planks: '木板', put: '放',
    three: '三', eight: '八', five: '五', stone: '石头', stones: '石头', one: '一', pickaxe: '镐', six: '六', ground: '地面', hold: '拿着', hand: '手',
    with: '用', go: '走', ten: '十', blocks: '格', away: '离开', here: '这里', two: '二', new: '新的', things: '东西', journal: '手记', hear: '听', word: '单词',
    your: '你的', on: '在…上', in: '在…里', from: '从', at: '朝', and: '和',
    build: '建造', wall: '墙', twelve: '十二', door: '门', bed: '床', home: '家', sleep: '睡觉', night: '夜晚' }; // a、the 不标
  const keyOf = w => w.toLowerCase().replace(/[^a-z]/g, '');
  const known = new Set();
  const NEWW = QUESTS.map(q => { // 每条任务里的新词（按任务顺序第一次出现）
    const fresh = new Set();
    for (const w of q.say.split(/\s+/)) { const k = keyOf(w); if (ZH[k] && !known.has(ZH[k])) { fresh.add(k); known.add(ZH[k]); } } // 按词义去重：log 和 logs 算同一个词
    return fresh;
  });
  function glossed(i) { // 句子拆成一个个词；新词下面挂一行中文（平时隐藏）。整句都没有新词时退而标出全部能解释的词
    const words = QUESTS[i].say.split(/\s+/), fresh = NEWW[i].size ? NEWW[i] : new Set(words.map(keyOf));
    return words.map(w => { const k = keyOf(w); return `<span class="w">${w}${fresh.has(k) && ZH[k] ? `<em>${ZH[k]}</em>` : ''}</span>`; }).join(' ');
  }
  let zhTimer = 0;
  function showZh() { guideEl.classList.add('zh'); clearTimeout(zhTimer); zhTimer = setTimeout(() => guideEl.classList.remove('zh'), 5000); }
  addEventListener('keydown', e => { if (e.code === 'F1') { e.preventDefault(); if (QUESTS[step]) showZh(); } }); // F1 本来是浏览器帮助，这里拦下
  let step = +localStorage.getItem('stonisle.quest') || 0, got = 0, prev = null, base = 0, at = { x: 0, z: 0 }, heard = false, busy = false;
  const css = document.createElement('style');
  css.textContent = `
    #guide { position: fixed; left: 50%; top: 44px; transform: translateX(-50%); padding: 8px 18px; border-radius: 14px; background: #2b2233dd; color: #fff; text-align: center; cursor: pointer; font: 14px/1.5 system-ui, sans-serif; }
    #guide .w { display: inline-block; vertical-align: top; text-align: center; }
    #guide em { display: none; font: 400 12px/1.3 system-ui, sans-serif; color: #ffd36b; }
    #guide.zh em { display: block; }
    #guide:empty, #menu:not(.off) ~ #guide { display: none; } /* 菜单打开时不盖在菜单上 */
    #guide small { display: block; opacity: .8; font-size: 11px; letter-spacing: 1px; }
    #guide small s { display: inline-block; width: 9px; height: 12px; margin-right: 6px; vertical-align: -1px; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%; background: radial-gradient(circle at 50% 65%, #fff6c8 0 25%, #ffb340 70%); box-shadow: 0 0 6px 2px #ff9a2088; } /* Wick 的小火苗 */
    #guide b { font-size: 22px; font-weight: 600; }
    #guide kbd { margin-left: 8px; padding: 1px 7px; border-radius: 5px; background: #fff; color: #2b2233; font: 600 13px ui-monospace, monospace; }
    #guide i { margin-left: 10px; font-style: normal; color: #ffd36b; font-weight: 600; }
    #caption { position: fixed; left: 14px; bottom: 16px; max-width: 34vw; padding: 8px 14px; border-radius: 12px; background: #2b2233dd; color: #fff; font: 600 20px/1.4 system-ui, sans-serif; pointer-events: none; z-index: 6; }
    #caption:empty { display: none; }
    #caption span.now { color: #ffd36b; }
    #bubble { position: fixed; left: 14px; bottom: 16px; z-index: 8; max-width: 300px; padding: 8px 14px; border-radius: 16px; background: #fffdf4; color: #2b2233; font: 600 18px/1.35 system-ui, sans-serif; box-shadow: 0 4px 16px #0005; pointer-events: none; }
    #bubble:empty { display: none; }
    #bubble.at { bottom: auto; transform: translate(-50%, -100%); }       /* 跟着 Wick：定位点是气泡底边中点 */
    #bubble.at::after { content: ''; position: absolute; left: 50%; bottom: -8px; margin-left: -8px; border: 8px solid transparent; border-top-color: #fffdf4; border-bottom: 0; }
    #bubble span.now { color: #d9631a; }
    #guide #way { display: none; margin-left: 12px; font-size: 13px; color: #ffd36b; }
    #guide #way.on { display: inline-block; }
    #guide #way b { display: inline-block; font-size: 15px; margin-right: 5px; }
    #intro { position: fixed; inset: 0; z-index: 7; background: #05040a; display: grid; place-items: center; transition: opacity 1.5s; pointer-events: none; }
    #intro i { width: 26px; height: 34px; border-radius: 50% 50% 50% 50% / 62% 62% 38% 38%; background: radial-gradient(circle at 50% 65%, #fff6c8 0 22%, #ffb340 55%, #ff7a1a00 100%); box-shadow: 0 0 60px 26px #ff9a2055; animation: flick .5s infinite alternate; }
    #intro small { position: fixed; bottom: 18px; right: 20px; color: #fff6; font: 12px system-ui, sans-serif; }
    @keyframes flick { from { transform: translate(var(--x, 0), var(--y, 0)) scale(1); } to { transform: translate(var(--x, 0), var(--y, 0)) scale(1.12, .94); } }
    #journal { position: fixed; inset: 0; z-index: 5; display: grid; place-items: center; background: #2b2233aa; }
    #journal.off { display: none; }
    #journal > div { width: min(680px, 92vw); max-height: 84vh; overflow-y: auto; padding: 22px 26px; border-radius: 16px; background: #fdf6ec; color: #2b2233; box-shadow: 0 12px 50px #0008; }
    #journal h2 { margin: 0 0 4px; color: #3d6b2c; } #journal h3 { margin: 16px 0 8px; font-size: 13px; letter-spacing: 1px; color: #8a6a44; }
    #journal .words { display: flex; flex-wrap: wrap; gap: 6px; }
    #journal .words button { background: #fff; color: #2b2233; padding: 4px 12px; border-radius: 14px; box-shadow: inset 0 0 0 1px #d8cbb6; font-size: 15px; }
    #journal .words button.no { color: #b9ad9c; cursor: default; }
    #journal .lines button { display: block; width: 100%; margin-bottom: 4px; text-align: left; background: #fff; color: #2b2233; border-radius: 8px; box-shadow: inset 0 0 0 1px #d8cbb6; }
    #journal p { margin: 10px 0 0; min-height: 1.6em; font-size: 18px; color: #3d6b2c; }`;
  document.head.appendChild(css);
  const guideEl = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'guide' }));
  const capEl = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'caption' }));
  const bubEl = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'bubble' }));
  guideEl.addEventListener('click', () => { if (QUESTS[step]) showZh(); }); // 手机上点一下任务卡片
  function showQuest(announce) {
    const q = QUESTS[step];
    if ($('guideBtn')) $('guideBtn').textContent = q ? 'Skip the tasks' : 'Start the tasks again';
    if (!q) { guideEl.innerHTML = ''; return; }
    const prog = q.n > 1 ? `<i>${Math.max(0, Math.min(got, q.n))} / ${q.n}</i>` : '';
    guideEl.innerHTML = `<small><s></s>WICK · LEVEL ${q.level + 1} · ${q.idx + 1}/${q.of}</small><b>${glossed(step)}</b>${q.key ? `<kbd>${q.key}</kbd>` : ''}${prog}<span id="way"></span>`;
    if (announce) wsay(q.say);
  }
  function startQuest() { got = 0; prev = null; heard = false; busy = false; progressAt = performance.now(); if (window.game) at = { x: game.p.x, z: game.p.z }; showQuest(true); retarget(true); }
  function finishQuest() {
    busy = true;
    const q = QUESTS[step], next = QUESTS[step + 1];
    step++; localStorage.setItem('stonisle.quest', step);
    if (q.gift && window.game) { game.give(q.gift, 1); game.renderBar(); }                          // 这一步的奖励（装好门送一张床）
    const cheer = !next ? 'You did it! Have fun.' : q.cheer || (next.level !== q.level ? `Good job! Level ${NUM[next.level + 1]}.` : 'Good job!');
    guideEl.innerHTML = `<b>${cheer}</b>`; wsay(cheer); target = null;
    setTimeout(startQuest, next ? 2200 : 3500);
  }
  setInterval(() => { // 只在游玩中（菜单关闭）检查
    const g = window.game, q = QUESTS[step];
    if (g && $('menu') && $('menu').classList.contains('off') && !introOn) scene_(g);   // Wick 的场景对白
    if (!g || !q || busy || introOn || !$('menu')) return;
    if (++tick % 5 === 0) retarget(false);                                               // 每 2 秒重新找最近的目标
    const playing = $('menu').classList.contains('off');
    if (q.done) { if ((playing || q.key === 'J' || q.key === 'E') && q.done(g)) finishQuest(); return; }
    const v = q.count(g);
    if (v < 0) { prev = null; return; }                 // 条件暂不成立（如手里不是镐）：等成立后重新起算，已得的不清零
    if (prev === null) { prev = base = v; return; }
    const before = got;
    if (q.gain) { if (v > prev) got += v - prev; prev = v; } // gain：只数增加的部分，用掉的不倒扣
    else got = v - base;                                     // 其余：相对任务开始时的差值
    if (got !== before) {
      showQuest();
      if (!q.quiet && got > before && got <= 10) wsay(NUM[got]); // 边做边数：one, two, three
      if (got > before) progressAt = performance.now();
    }
    if (got >= q.n) finishQuest();
  }, 400);
  if (QUESTS[step]) showQuest();
  // 第一次进入世界时把当前任务读出来（浏览器要求先有用户操作才能出声）
  if ($('start')) $('start').addEventListener('click', () => setTimeout(() => {
    if (introOn) return;
    if (step === 0 && !localStorage.getItem('stonisle.intro')) intro(); else if (QUESTS[step] && !busy) startQuest();
  }, 600));

  // ---- Wick：灯台里最后一点火苗，一盏会飞的小灯。跟在右前方；有任务目标时飞过去指给玩家看 ----
  let wick = null, lampGlow = null, wings = [], marker = null, wickAt = 0, target = null, pointing = 0, wayAt = 0;
  // 行为状态：跟随时在左或右（会换边）；玩家站着不动时在身边转悠，偶尔飞去看看附近的动物、说句话
  let side = 1, sideAt = 0, flipAt = 0, movedAt = 0, lastO = [0, 0, 0], roam = null, dwell = 0, chatAt = 0, wasFast = false;
  const lvl = () => Math.min(2, QUESTS[step] ? QUESTS[step].level : 2);
  const CHAT = [
    ['Hello!', 'I like you.', 'La la la.', 'Nice day!', 'So big!'],
    ['I like this place.', 'What a nice day.', 'Look at the sky.', 'I am happy here.'],
    ['I like to fly around you.', 'This is a good place for a house.', 'Do you want to dig or build?', 'I can see far from up here.'],
  ];
  const art = w => (/^[aeiou]/.test(w) ? 'an' : 'a');
  const SEE = [w => `${art(w) === 'an' ? 'An' : 'A'} ${w}!`, w => `Look, ${art(w)} ${w}.`, w => `I see ${art(w)} ${w} over there.`];
  let tick = 0, progressAt = 0, introOn = false, quiet = localStorage.getItem('stonisle.wickQuiet') === '1';
  const solidAt = (x, y, z) => { const b = game.world.get(Math.floor(x), Math.floor(y), Math.floor(z)); return b !== 0 && b !== 5; };
  function buildWick(scene) {
    const finish=WickMaterials();
    if(!finish.sky)finish.sky=[finish.paper,finish.wood,finish.wing,finish.eye,finish.stem].map(m=>WorldLighting.object(m));
    const mats = { [0xffe9b0]:finish.paper, [0x3a2a1a]:finish.wood, [0xfff6dc]:finish.wing }, M = (c, o) => mats[c] || (mats[c] = new THREE.MeshBasicMaterial(Object.assign({ color: c }, o)));
    const box = (parent, w, h, l, x, y, z, c) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, l), M(c)); m.position.set(x, y, z); parent.add(m); return m; };
    wick = new THREE.Group();
    box(wick, 0.26, 0.26, 0.26, 0, 0, 0, 0xffe9b0);                                   // 纸灯身
    box(wick, 0.3, 0.05, 0.3, 0, 0.155, 0, 0x3a2a1a); box(wick, 0.3, 0.05, 0.3, 0, -0.155, 0, 0x3a2a1a); // 上下木框
    for(const side of [-1,1]){
      const eye=box(wick,.04,.06,.02,side*.06,.02,.135,0x3a2a1a);eye.material=finish.eye;
      const glint=box(wick,.009,.012,.002,side*.06-.007,.034,.146,0xffffff);glint.material=finish.glint;
    }
    // Slender corner ribs connect the wood caps and frame the glowing paper.
    for(const x of [-.127,.127])for(const z of [-.127,.127])box(wick,.012,.27,.012,x,0,z,0x3a2a1a);
    // The fire lives behind the paper: emissive breathing replaces the exposed candle.
    lampGlow=finish.paper;
    wings=[1,-1].map(side=>{
      const pivot=new THREE.Group();pivot.position.set(side*.13,.015,0);
      const leaf=new THREE.Mesh(WickLeafGeometry(.25,.145,side),finish.wing);leaf.rotation.z=side*.18;pivot.add(leaf);
      const lower=new THREE.Mesh(WickLeafGeometry(.17,.085,side),finish.wing);lower.rotation.z=-side*.55;lower.position.set(0,-.03,-.015);pivot.add(lower);
      wick.add(pivot);return pivot;
    });
    const stem=new THREE.Mesh(new THREE.CylinderGeometry(.005,.007,.055,6),finish.stem);stem.position.y=.205;wick.add(stem);
    for(const side of [-1,1]){const sprout=new THREE.Mesh(WickLeafGeometry(.075,.035,side),finish.wing);sprout.position.y=.22;sprout.rotation.z=side*.3;wick.add(sprout);}
    // 目标标记：朝下的箭头，隔着地形也看得见（不做深度测试）
    const mk = new THREE.MeshBasicMaterial({ color: 0xffc83a, depthTest: false, transparent: true, opacity: 0.95, fog: false });
    marker = new THREE.Group();
    const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.34, 0.12), mk); shaft.position.y = 0.42;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.3, 0.12), mk); head.position.y = 0.2; head.rotation.z = Math.PI / 4;
    marker.add(shaft, head); for (const c of marker.children) c.renderOrder = 10;
    marker.visible = false;
    scene.add(wick, marker);
  }
  function findTarget(spec) { // 附近最近的目标方块；露在外面的优先，埋着的也行（箭头隔着地面可见）
    const g = game, w = g.world, px = Math.floor(g.p.x), py = Math.floor(g.p.y), pz = Math.floor(g.p.z), air = (x, y, z) => w.get(x, y, z) === 0;
    let best = null, bd = 1e9;
    for (let dx = -20; dx <= 20; dx++) for (let dz = -20; dz <= 20; dz++) {
      const x = px + dx, z = pz + dz, h = Core.heightAt(x, z);
      for (let y = Math.max(1, h - 5); y <= h + 9; y++) {
        if (!spec.includes(w.get(x, y, z))) continue;
        const open = air(x + 1, y, z) || air(x - 1, y, z) || air(x, y + 1, z) || air(x, y, z + 1) || air(x, y, z - 1);
        const dist = Math.hypot(dx, y - py, dz) + (open ? 0 : 6);
        if (dist < bd) { bd = dist; best = { x, y, z }; }
      }
    }
    return best;
  }
  function retarget(fly) {
    const q = QUESTS[step];
    target = window.game && q && q.target ? findTarget(q.target) : null;
    if (fly && target) pointing = performance.now() + 15000;                  // 飞过去停 15 秒，或等玩家走近
    if (fly && q && q.target && !target) wsay('I do not see one. Let us look around.');
  }
  function chat(text) { // 闲聊与场景对白共用间隔：两句至少隔 20 秒，不打断正在说的话
    const now = performance.now();
    if (quiet || introOn || now - barkAt < 20000 || speaking()) return false;
    barkAt = now; wsay(text); return true;
  }
  const companionGet=(x,y,z)=>game.world.get(x,y,z);
  function freeSpot(x,y,z){return CompanionMotion.free(companionGet,[x,y,z]);}
  function wickTick(now, o, d) { // 每帧（游玩中）由 look() 调用
    if (!wick) { if (!game.scene) return; buildWick(game.scene); wick.position.set(o[0], o[1], o[2]); movedAt = now; }
    const finish=WickMaterials(),exposure=game.lighting.skyAt(wick.position.x,wick.position.y+.25,wick.position.z);
    for(const light of finish.sky)light.value=exposure;
    const dt = Math.min(0.1, (now - wickAt) / 1000); wickAt = now;
    const f = Math.hypot(d[0], d[2]) || 1, fx = d[0] / f, fz = d[2] / f, rx = -fz, rz = fx; // 水平的前方与右方
    const P = wick.position, t = now / 1000;
    if (Math.hypot(o[0] - lastO[0], o[1] - lastO[1], o[2] - lastO[2]) > 0.02) movedAt = now;  // 玩家在走
    lastO = [o[0], o[1], o[2]];
    const idle = now - movedAt > 2500;
    const near = target && Math.hypot(target.x + 0.5 - o[0], target.z + 0.5 - o[2]) < 4;
    const fly = target && now < pointing && !near;
    let G, rate;
    if (fly) { // 指路：停在目标朝玩家的那一侧，而不是正上方（树干上方是树冠，会被挡住）
      const tx = o[0] - (target.x + 0.5), tz = o[2] - (target.z + 0.5), tl = Math.hypot(tx, tz) || 1;
      G = freeSpot(target.x + 0.5 + tx / tl * 1.1, target.y + 1.2, target.z + 0.5 + tz / tl * 1.1) || [target.x + 0.5, target.y + 3, target.z + 0.5];
      rate = 2.2; roam = null;
    } else if (idle) { // 转悠：在玩家身边挑一个点飞过去，停一会儿，再挑下一个；有时飞去看附近的动物
      if (!roam || (Math.hypot(roam[0] - P.x, roam[1] - P.y, roam[2] - P.z) < 0.3 && now > dwell)) {
        const mob = Math.random() < 0.35 && game.mobs.filter(m => !m.type.hostile && !m.type.foe && Math.hypot(m.x - o[0], m.z - o[2]) < 8)[0]; // 只去看温和的动物
        if (mob) {
          roam = freeSpot(mob.x, mob.y + mob.type.h + 0.5, mob.z); dwell = now + 2600;
          const w = MOB[mob.type.name];
          if (roam && w && now > chatAt && chat(SEE[lvl()](w))) { meet(w); chatAt = now + 25000 + Math.random() * 20000; }
        } else {
          const a = Math.atan2(fx, fz) + (Math.random() - 0.5) * 4.4, r = 1.6 + Math.random() * 1.8; // 多数落在前方 250° 的范围里，看得见
          roam = freeSpot(o[0] + Math.sin(a) * r, o[1] - 0.7 + Math.random() * 1.2, o[2] + Math.cos(a) * r); dwell = now + 700 + Math.random() * 1800;
          if (roam && now > chatAt && Math.random() < 0.4 && chat(CHAT[lvl()][Math.floor(Math.random() * CHAT[lvl()].length)])) chatAt = now + 25000 + Math.random() * 20000;
        }
        if (!roam) roam = [o[0] + fx * 1.2, o[1] + 0.3, o[2] + fz * 1.2];   // 周围都是方块时就停在眼前
      }
      G = roam; rate = 1.7;
    } else { // 跟随：在左前或右前方，带一点晃动；刚从转悠回来时就近选边，之后每隔十几秒换一次边
      if (roam) { side = (P.x - o[0]) * rx + (P.z - o[2]) * rz >= 0 ? 1 : -1; roam = null; sideAt = now + 9000 + Math.random() * 9000; }
      if (now > sideAt) { side = -side; sideAt = now + 9000 + Math.random() * 9000; }
      const sx = Math.sin(t * 0.9) * 0.22, sy = Math.sin(t * 1.7) * 0.1, sf = Math.sin(t * 0.6) * 0.15;
      let x = o[0] + fx * (1.8 + sf) + rx * side * (0.8 + sx), y = o[1] - 0.2 + sy, z = o[2] + fz * (1.8 + sf) + rz * side * (0.8 + sx);
      if (solidAt(x, y, z) && now > flipAt) { side = -side; flipAt = now + 1500; x = o[0] + fx * 1.8 + rx * side * 0.8; z = o[2] + fz * 1.8 + rz * side * 0.8; } // 这边有墙就换到另一边（1.5 秒内不来回换）
      const lat = (P.x - o[0]) * rx + (P.z - o[2]) * rz;                   // 换边时从准星上方绕过去，不从正中间穿
      y += Math.max(0, 1 - Math.abs(lat) / 0.7) * 1.3;
      G = freeSpot(x, y, z) || [o[0] + fx * 1.3, o[1] + 0.9, o[2] + fz * 1.3]; rate = 4;
      if (!chatAt) chatAt = now + 20000;
    }
    const dist = Math.hypot(G[0] - P.x, G[1] - P.y, G[2] - P.z), k = dist > 40 ? 1 : 1 - Math.exp(-dt * rate);
    const vx = (G[0] - P.x) * k, vy = (G[1] - P.y) * k + Math.sin(t * 2.6) * 0.004, vz = (G[2] - P.z) * k;
    const next=CompanionMotion.move(companionGet,[P.x,P.y,P.z],[P.x+vx,P.y+vy,P.z+vz])||freeSpot(o[0],o[1],o[2]);
    wick.visible=!!next;if(!next)return;P.set(...next);
    const fast = Math.hypot(vx, vz) / (dt || 0.016) > (wasFast ? 0.5 : 0.9);    // 飞得快时脸朝前进方向，停下来脸朝玩家（带回差，免得来回抖）
    wasFast = fast;
    if (fast) wick.lookAt(P.x + vx * 50, P.y, P.z + vz * 50); else wick.lookAt(o[0], P.y, o[2]);
    wings[0].rotation.z = Math.sin(now / (fast ? 40 : 60)) * 0.6; wings[1].rotation.z = -wings[0].rotation.z;
    lampGlow.emissiveIntensity=.38+Math.sin(now*.004)*.055+(fly?.14:0); // 指路时灯罩内的暖光略增强
    marker.visible = !!target;
    if (target) {
      const td = Math.hypot(target.x + 0.5 - o[0], target.y + 0.5 - o[1], target.z + 0.5 - o[2]);
      marker.position.set(target.x + 0.5, target.y + 1.1 + Math.abs(Math.sin(now / 300)) * 0.25, target.z + 0.5);
      marker.scale.setScalar(Math.max(1, td / 9)); marker.rotation.y = now / 600;
    }
    if (bubEl.textContent) { // 气泡跟着 Wick 走：把它的世界坐标投影到屏幕（视野 70°）；在身后或屏幕外时贴到最近的边上
      const u = [-rz * d[1], rz * d[0] - rx * d[2], rx * d[1]];                    // 右 × 前 = 上（右方没有 y 分量）
      const v = [P.x - o[0], P.y + 0.35 - o[1], P.z - o[2]], zc = v[0] * d[0] + v[1] * d[1] + v[2] * d[2];
      const xc = v[0] * rx + v[2] * rz, yc = v[0] * u[0] + v[1] * u[1] + v[2] * u[2], tn = Math.tan(35 * Math.PI / 180), zz = Math.max(zc, 0.3);
      let bx = innerWidth * (0.5 + xc / (zz * tn * innerWidth / innerHeight) / 2), by = innerHeight * (0.5 - yc / (zz * tn) / 2);
      if (zc < 0.3) bx = xc > 0 ? innerWidth : 0;
      bubEl.classList.add('at');
      bubEl.style.left = Math.max(120, Math.min(innerWidth - 120, bx)) + 'px';
      bubEl.style.top = Math.max(110, Math.min(innerHeight - 150, by)) + 'px';
    }
    if (now - wayAt > 100) { // 任务面板上的方向箭头和距离
      wayAt = now; const el = $('way'); if (!el) return;
      el.classList.toggle('on', !!target); if (!target) return;
      const tx = target.x + 0.5 - o[0], tz = target.z + 0.5 - o[2], ang = Math.atan2(fx * tz - fz * tx, fx * tx + fz * tz);
      el.innerHTML = `<b style="transform:rotate(${ang.toFixed(2)}rad)">▲</b>${Math.round(Math.hypot(tx, tz))} blocks`;
    }
  }
  setInterval(() => { // 没在游玩（菜单、开场）时气泡不跟随：开场放在火光上方，其余停在左下角
    if (performance.now() - wickAt < 300 || !bubEl.textContent) return;
    bubEl.classList.toggle('at', introOn);
    bubEl.style.left = introOn ? '50%' : ''; bubEl.style.top = introOn ? '42%' : '';
  }, 150);
  addEventListener('keydown', e => { // T：问 Wick——重说当前任务并再指一次
    if (e.code !== 'KeyT' || !QUESTS[step] || introOn || !$('menu') || !$('menu').classList.contains('off')) return;
    wsay(QUESTS[step].say); retarget(true);
  });

  // ---- 场景对白：同一触发每个游戏日只说一次，两句之间至少隔 20 秒；每个触发按语言等级备三句 ----
  const BARKS = {
    night: ['Night! I am scared.', 'It is night. Stay with me.', 'It is dark. Wolves come out at night.'],
    wolf: ['A wolf! Run!', 'A wolf! Hold your sword.', 'A shade wolf is near. Hold your torch.'],
    hurt: ['Eat! Eat!', 'You are hurt. Eat meat.', 'You are hurt. Eat some meat to get well.'],
    morning: ['Good morning!', 'Good morning. The sun is up.', 'Good morning. The wolves are gone now.'],
    lost: ['This way!', 'Come this way.', 'Do you need help? Come with me.'],
  };
  let said = {}, barkAt = -1e9, wasNight = false;
  function bark(key, lines = BARKS[key], excited = false, gap = 20000) {
    const now = performance.now();
    if (said[key] || now - barkAt < gap || speaking()) return false; // 不打断正在说的话
    said[key] = true; barkAt = now;
    wsay(lines[lvl()], excited);
    return true;
  }
  // 事件类配音：来到新地方、发现新动物、挖到稀有矿、黄昏。事件发生时先排队，等 Wick 有空再说（最多等 30 秒）
  const PLACE = {
    grass: ['Green! Green!', 'I like the green grass.', 'This is the grass land. It is nice here.'],
    desert: ['Sand! Hot! Hot!', 'So much sand. It is hot!', 'This is the desert. It is hot and dry.'],
    snow: ['Snow! Brr!', 'Brr! It is cold here.', 'This is the snow land. I am so cold!'],
    mountain: ['So high! Wow!', 'We are up high!', 'We are on a mountain. I can see far.'],
    cave: ['Dark... oh no.', 'It is dark in here.', 'It is dark in here. Stay close to me.'],
  };
  const FOUND = {
    11: ['Coal! Yes!', 'Coal! It burns well.', 'You found coal. Now we can make a torch.'],
    12: ['Iron! Strong!', 'Iron ore! So strong!', 'You found iron ore. Iron tools are fast.'],
    13: ['Gold! Wow! Wow!', 'Gold! It shines!', 'You found gold! It shines like the sun.'],
    14: ['Ooh! Pretty!', 'A crystal! So pretty!', 'You found a crystal! It glows in the dark.'],
    80: ['Black rock!', 'Obsidian! So hard!', 'You found obsidian. It is black and very hard.'],
    82: ['Purple! Wow!', 'Amethyst! It is purple!', 'You found amethyst! It grows in a rock ball.'],
    83: ['A diamond! Wow!', 'A diamond! So bright!', 'You found a diamond! It is the hardest stone.'],
    84: ['Red! A ruby!', 'A ruby! It is red!', 'You found a ruby! It is red like fire.'],
    85: ['Green! Wow!', 'An emerald! It is green!', 'You found an emerald! It is green like grass.'],
    86: ['Blue! Wow!', 'A sapphire! It is blue!', 'You found a sapphire! It is blue like the sky.'],
  };
  const MEET = { // 第一次遇到每种怪物：名字加一句怎么对付它
    'slime': ['A slime!', 'A slime! Hit it!', 'A slime! It drops a bouncy block.'],
    'mud blob': ['A mud blob!', 'A mud blob! Hit it!', 'A mud blob! Hit it and it flies away.'],
    'sand scorpion': ['A scorpion! Run!', 'A scorpion! It is fast!', 'A sand scorpion! It can not swim.'],
    'snare vine': ['Bad plant! Back!', 'A snare vine! Stay back!', 'A snare vine! Cut it with your axe.'],
    'bristle boar': ['A boar!', 'A boar! Do not go near.', 'A bristle boar! Jump to the side.'],
    'frost prowler': ['Something hides!', 'A prowler! Hold your torch!', 'A frost prowler hides in the snow. A torch helps you see it.'],
    'dune worm': ['The sand moves!', 'A worm! Stand on stone!', 'A dune worm! It cannot reach you on stone.'],
    'stone golem': ['That rock moved!', 'A golem! It is slow. Walk away.', 'A stone golem woke up. It is slow, so walk away.'],
    'obsidian sentinel': ['Too hard!', 'A sentinel! It is very hard.', 'An obsidian sentinel! You need a better weapon.'],
    'lurker eel': ['An eel! Up!', 'An eel! Swim up!', 'A lurker eel! Stay near the top of the water.'],
    'tide serpent': ['A serpent!', 'A serpent! Swim to the side!', 'A tide serpent! When it glows, swim to the side.'],
    'dune vulture': ['A vulture!', 'A vulture! Eat some food.', 'A dune vulture waits until you are weak. Eat some food.'],
    'gale hawk': ['A hawk! Hold on!', 'A hawk! Stand by the wall.', 'A gale hawk will push you. Stay away from the edge.'],
    'shade wing': ['Look up!', 'A shade wing! It glows, then dives.', 'A shade wing! When it glows, move away.'],
    'storm roc': ['So big!', 'A storm roc! Hide behind a block!', 'The storm roc! Hit it when it rests.'],
    'cave bat': ['A bat! Light!', 'A bat! Hold your torch!', 'Cave bats fear light. Hold your torch.'],
    'peck crow': ['A crow!', 'A crow! Hide your food!', 'A peck crow! Put your food away.'],
    'lamp moth': ['A moth!', 'A moth! It likes the light.', 'A lamp moth! It likes the light. Be nice.'],
    'frost wisp': ['Cold! Run!', 'A frost wisp! It is cold!', 'A frost wisp! It is afraid of fire.'],
    'nipper fish': ['Fish! Ouch!', 'Nipper fish! Get out!', 'Nipper fish! Get out of the water.'],
    'sting jelly': ['Do not touch!', 'A jelly! Do not touch it.', 'A sting jelly! Swim around it.'],
    'pincer crab': ['A crab!', 'A crab! Hit its side!', 'A pincer crab! Hit it from the side.'],
  };
  const DUSK = ['Night is coming!', 'The sun is going down.', 'The sun is going down. Night is coming.'];
  let todo = [], lastPlace = '', prevInv = null, wasDay = true, metMobs;
  try { metMobs = new Set(JSON.parse(localStorage.getItem('stonisle.met')) || []); } catch (e) { metMobs = new Set(); }
  const queue = (key, lines, excited) => { if (!said[key] && !todo.some(t => t.key === key)) todo.push({ key, lines, excited, until: performance.now() + 30000 }); };
  function events(g) {
    const px = Math.floor(g.p.x), pz = Math.floor(g.p.z), h = Core.heightAt(px, pz);
    const place = g.p.y > 46 ? 'mountain' : g.p.y < h - 3 ? 'cave' : ['grass', 'desert', 'snow'][Core.biomeAt(px, pz)];
    if (place !== lastPlace) { if (lastPlace) queue('place:' + place, PLACE[place]); lastPlace = place; }   // 每个地方每个游戏日说一次
    if (prevInv) for (const id in FOUND) if ((g.inv[id] || 0) > prevInv[id]) queue('found:' + id, FOUND[id], true);
    prevInv = {}; for (const id in FOUND) prevInv[id] = g.inv[id] || 0;
    for (const m of g.mobs) { // 第一次遇到每种动物（只此一次，记在本机）
      const w = MOB[m.type.name];
      if ((m.type.hostile && !MEET[w]) || !w || metMobs.has(w) || Math.hypot(m.x - g.p.x, m.z - g.p.z) > 10) continue;
      metMobs.add(w); meet(w); localStorage.setItem('stonisle.met', JSON.stringify([...metMobs]));
      const A = /^[aeiou]/.test(w) ? 'An' : 'A';
      queue('mob:' + w, MEET[w] || [`${A} ${w}!`, `Look! ${A} ${w}!`, `${A} ${w}! ${SENT[w]}`], true);
    }
    if (wasDay && g.dayK < 0.6 && g.dayK > 0.1) queue('dusk', DUSK);
    wasDay = g.dayK >= 0.6;
    todo = todo.filter(t => performance.now() < t.until && !said[t.key]);
    if (!quiet && todo.length && bark(todo[0].key, todo[0].lines, todo[0].excited, 6000)) todo.shift();
  }
  function scene_(g) { // 每 0.4 秒看一次
    const night = g.dayK < 0.1;
    if (wasNight && g.dayK > 0.6) { wasNight = false; said = {}; if (!quiet) bark('morning'); }   // 新的一天，触发记录清空
    if (night) wasNight = true;
    if (QUESTS[step] && QUESTS[step].target && !busy && performance.now() - progressAt > 90000) {  // 太久没进展：再指一次（安静时也指）
      progressAt = performance.now(); said.lost = false; if (bark('lost')) retarget(true);
    }
    events(g);
    if (quiet) return;
    if (g.hp < 8) bark('hurt');
    else if (g.mobs.some(m => m.type.name === '影狼' && Math.hypot(m.x - g.p.x, m.z - g.p.z) < 12)) bark('wolf');
    else if (night) bark('night');
  }

  // ---- 开场：黑暗里亮起一点火光。全程可操作，Enter 跳过，不超过一分钟 ----
  async function intro() {
    introOn = true; guideEl.innerHTML = '';
    const el = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'intro', innerHTML: '<i></i><small>Press Enter to skip</small>' }));
    const dot = el.firstChild, wait = ms => new Promise(r => setTimeout(r, ms));
    let skipped = false;
    const sway = e => { dot.style.setProperty('--x', (e.clientX / innerWidth - 0.5) * 60 + 'px'); dot.style.setProperty('--y', (e.clientY / innerHeight - 0.5) * 40 + 'px'); };
    const skip = e => { if (e.code === 'Enter') { skipped = true; if (TTS) speechSynthesis.cancel(); if (audio) audio.pause(); } };
    addEventListener('mousemove', sway); addEventListener('keydown', skip);
    const line = async (text, pause = 350) => { if (!skipped) { await wsay(text); await wait(pause); } };
    await wait(900);
    await line('Hello!'); await line('I am Wick.'); await line('Move your mouse.', 0);
    if (!skipped) await new Promise(r => { // 等玩家动一下（鼠标或任意键），最多等 8 秒
      const go = () => { removeEventListener('mousemove', go); removeEventListener('keydown', go); r(); };
      addEventListener('mousemove', go); addEventListener('keydown', go); setTimeout(go, 8000);
    });
    await line('Good! Let us go!', 0);
    if (window.game) game.setTime(0.03);                                      // 清晨开始
    el.style.opacity = 0; await wait(skipped ? 300 : 1500); el.remove();
    removeEventListener('mousemove', sway); removeEventListener('keydown', skip);
    await line('This is Stonisle.'); await line('Help me, Friend.', 600);
    localStorage.setItem('stonisle.intro', '1'); introOn = false;
    startQuest();
  }

  // ---- Field Journal：见过的词 + 做过的句子，点一下就读；不评分、不导出 ----
  const jr = document.body.appendChild(Object.assign(document.createElement('div'), { id: 'journal', className: 'off' }));
  function renderJournal() {
    const words = Object.keys(SENT), doneLines = QUESTS.slice(0, step).map(q => q.say);
    jr.innerHTML = `<div><h2>Field Journal</h2><small>${seen.size} / ${words.length} words · ${doneLines.length} sentences · Click to hear. Press J to close.</small>
      <p id="jline"></p>
      <h3>WORDS</h3><div class="words">${words.map(w => seen.has(w) ? `<button data-w="${w}">${w}</button>` : '<button class="no" disabled>?</button>').join('')}</div>
      <h3>SENTENCES</h3><div class="lines">${doneLines.map(l => `<button data-l="${l}">${l}</button>`).join('') || '<small>Finish tasks to fill this page.</small>'}</div></div>`;
    for (const b of jr.querySelectorAll('button[data-w]')) b.onclick = () => { heard = true; $('jline').textContent = SENT[b.dataset.w]; say(b.dataset.w + '. ' + SENT[b.dataset.w]); };
    for (const b of jr.querySelectorAll('button[data-l]')) b.onclick = () => { $('jline').textContent = b.dataset.l; wsay(b.dataset.l); }; // 任务句是 Wick 说的，重听也用它的声音
  }
  function toggleJournal(open = jr.classList.contains('off')) {
    if (open) {
      if (!$('bag').classList.contains('off')) return;                       // 背包开着时不抢
      if (document.pointerLockElement) document.exitPointerLock();           // 放开鼠标 → 游戏自己会暂停并显示菜单
      else if ($('menu').classList.contains('off')) dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));
      renderJournal();
    }
    jr.classList.toggle('off', !open);
  }
  addEventListener('keydown', e => {
    if (e.code === 'KeyJ') toggleJournal();
    else if (e.code === 'Escape' && !jr.classList.contains('off')) toggleJournal(false);
  });
  jr.addEventListener('click', e => { if (e.target === jr) toggleJournal(false); });
  if ($('card')) { // 菜单里加两个入口
    const row = ($('settingsCompanion') || $('card')).appendChild(document.createElement('div'));
    row.innerHTML = '<button class="link" id="journalBtn">Journal</button><button class="link" id="guideBtn"></button><label style="display:inline"><input id="wickQuiet" type="checkbox"> Quiet Wick</label>';
    row.insertAdjacentHTML('beforeend', '<div><small>Press T to ask Wick. Press J for your journal. Press F1 for help with new words.</small></div>');
    row.insertAdjacentHTML('beforeend', '<label>Wick voice <select id="wickVoice"></select></label>');
    if($('settingsVoice')){ $('settingsVoice').append($('wickQuiet').closest('label'),$('wickVoice').closest('label')); }
    fillWickVoices();
    $('wickVoice').onchange = e => { // 换声音并试听一句
      wickVoice = enVoices.find(v => v.name === e.target.value) || wickVoice;
      localStorage.setItem('stonisle.wickVoice', wickVoice.name);
      wsay('Hi! I am Wick!');
    };
    $('wickQuiet').checked = quiet;
    $('wickQuiet').onchange = e => { quiet = e.target.checked; localStorage.setItem('stonisle.wickQuiet', quiet ? '1' : '0'); };
    $('journalBtn').onclick = () => toggleJournal(true);
    $('guideBtn').onclick = () => { step = QUESTS[step] ? QUESTS.length : 0; localStorage.setItem('stonisle.quest', step); got = 0; prev = null; busy = false; target = null; showQuest(); };
    showQuest();
  }

  function lines() { // 游戏里会说出口的每一句话，按说话人分开：生成配音文件时用它
    const wick = new Set(), narrator = new Set(), each = t => Object.values(t).flat();
    for (const q of QUESTS) wick.add(q.say);
    NUM.slice(1).forEach(n => wick.add(n));
    ['Good job!', 'Good job! Level two.', 'Good job! Level three.', 'You did it! Have fun.', 'I do not see one. Let us look around.', 'Hi! I am Wick!',
      'Hello!', 'I am Wick.', 'Move your mouse.', 'Good! Let us go!', 'This is Stonisle.', 'Help me, Friend.'].forEach(t => wick.add(t));
    [...each(BARKS), ...each(PLACE), ...each(FOUND), ...DUSK, ...CHAT.flat()].forEach(t => wick.add(t));
    Object.values(MEET).flat().forEach(t => wick.add(t));
    for (const w of Object.values(MOB)) {
      if (MEET[w]) continue;
      const A = /^[aeiou]/.test(w) ? 'An' : 'A';
      [`${A} ${w}!`, `Look! ${A} ${w}!`, `${A} ${w}! ${SENT[w]}`].forEach(t => wick.add(t));
      if (w !== 'shade wolf') SEE.forEach(f => wick.add(f(w)));
    }
    for (const w in SENT) { narrator.add(w); narrator.add(w + '. ' + SENT[w]); }
    ['hand', 'thing', 'animal'].forEach(t => narrator.add(t));
    ['Read aloud is on.', 'You fell. You are back at the start.'].forEach(t => wick.add(t));
    wick.add('Oh no. Poor moth.'); wick.add('This is your bed now. Come back at night to sleep.'); wick.add('This is your bed now. A monster is near. We can not sleep.'); wick.add('You are dead.'); wick.add('You are back. Be careful!');
    ['It is not night.', 'A wolf is near. We can not sleep.', 'Good night!', 'There is no room.', 'It needs dirt.', 'Berries! Yum!',
      'A little tree! It will grow.', 'The tree is big now!'].forEach(t => wick.add(t)); // home.js 里 Wick 说的话
    return { wick: [...wick], narrator: [...narrator] };
  }

  return { item, say, auto, look, lines, get quest() { return step; }, get wickVoice() { return wickVoice && wickVoice.name; }, get wick() { return wick && wick.position; }, mob: n => MOB[n] || 'animal', get words() { return [...seen]; }, get voice() { return voice && voice.name; } };
})();
