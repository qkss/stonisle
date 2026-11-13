// 设置 → Audio 里的试听：旁白、Wick、战斗音效各一个按钮，用的就是游戏里实际的发声函数，听到的和游戏中一样。
// 对应的开关没开时不出声，提示先打开开关。
(() => {
  const $ = i => document.getElementById(i), box = $('settings-audio');
  if (!box || !window.Lang) return;
  const IDLE = 'Tap a button to hear it.';
  box.insertAdjacentHTML('beforeend', `<h2>Sound check</h2><p class="settingsHint" id="soundNote" role="status">${IDLE}</p><button id="tryNarrator">Narrator</button> <button id="tryWick">Wick</button> <button id="tryCombat">Combat sounds</button>`);
  const note = t => { $('soundNote').textContent = t; };
  const speech = (text, pitch) => () => {
    if (!$('voice').checked) return note('Turn on “Read aloud” first.');
    note('Playing…'); Lang.say(text, false, pitch).then(() => note(IDLE));
  };
  $('tryNarrator').onclick = speech('wooden pickaxe. A wooden pickaxe is your first tool.', 1); // 旁白只读物品名和例句
  $('tryWick').onclick = speech('Hi! I am Wick!', 1.4);
  $('tryCombat').onclick = () => {
    if (!$('combatAudio').checked) return note('Turn on “Combat sounds” first.');
    CombatAudio.unlock(); note('Playing…');
    setTimeout(CombatAudio.swing, 60); setTimeout(CombatAudio.hit, 420); setTimeout(() => note(IDLE), 900); // 先挥一下，再打中一下
  };
})();
