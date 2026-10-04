const dares = [
  'Perform a dramatic weather forecast for this room', 'Rap about the last snack you ate', 'Do your best runway walk across the room', 'Create a handshake with the player to your left', 'Do a slow-motion action-hero entrance',
  'Make up a new dance move and name it', 'Do an impression of someone getting caught in the rain', 'Explain how to make toast like it is a science experiment', 'Try a tongue twister three times fast', 'Pretend you are accepting a huge award', 'Create a jingle for a made-up product',
  'Balance something safe on your head for 20 seconds', 'Reenact a scene from a TV show', 'Do a dramatic reading of a random object label', 'Give everyone a royal wave', 'Invent a ridiculous new holiday', 'Try to draw a cat with your eyes closed',
  'Pretend to host a cooking show with no ingredients', 'Turn the last thing you ate into a fancy restaurant dish', 'Act like a detective solving the mystery of a missing sock', 'Give a dramatic apology to a chair', 'Tell a spooky story in exactly three sentences',
  'Do a commercial for water', 'Try to say the alphabet in an opera voice', 'Act like a tiny mouse looking for cheese', 'Explain your favorite hobby with mime only', 'Make a beatbox rhythm for 15 seconds', 'Give a compliment to everyone in the room', 'Do five gentle jumping jacks', 'Pretend the floor is lava for 10 seconds',
  'Give a victory speech for winning a made-up contest', 'Create a secret code word for the group', 'Describe your dream vacation like a travel ad', 'Do your best penguin walk', 'Try to spell your name with your body', 'Pretend you are a magician whose trick went wrong', 'Make the sound effects for a car chase', 'Show us your best fancy bow', 'Tell a joke with a completely serious face', 'Act out an emoji chosen by the group',
  'Pretend to be a news anchor reporting on a silly event', 'Make up a new ice cream flavor and sell it to us', 'Do a dramatic slow-motion run in place', 'Describe a sandwich like it is a work of art', 'Create a handshake with the person across from you', 'Pretend you are a game-show host', 'Make up a chorus for a silly song', 'Do your best dinosaur impression', 'Give a weather report for another planet', 'Pretend you are a sleepy bear waking up',
  'Explain how to brush teeth like a motivational coach', 'Do a dance that matches a word chosen by the group', 'Make up a silly law everyone must follow for one minute', 'Act like a very fancy waiter taking orders', 'Create a cheer for the person to your right', 'Pretend you are a famous artist unveiling a banana painting', 'Try to make the group laugh without touching anyone', 'Give a 15-second stand-up comedy set', 'Narrate your own walk to the other side of the room', 'Pretend you are a pop star greeting your fans',
  'Describe your favorite food using only hand gestures', 'Make up an animal that has never existed', 'Do a statue pose until the next player spins', 'Read the nearest printed words in a dramatic voice', 'Invent a new app and pitch it in 20 seconds', 'Make a song out of three random words', 'Pretend you are a sleepy wizard casting a spell', 'Give yourself a compliment in an announcer voice', 'Act out getting a surprise present', 'Make a silly face and hold it for 10 seconds',
  'Do your best slow clap that turns into applause', 'Pretend you are a confused tourist asking for directions', 'Create a dance inspired by a household chore', 'Explain a simple task as if it is an extreme sport', 'Make up a movie title starring everyone in the room', 'Do an impression of a very polite dragon', 'Pretend you are an astronaut discovering a new planet', 'Give a dramatic trailer voice-over for the next spin', 'Create a tiny theme song for this game', 'Take a bow like you just finished an amazing show',
  'Go outside and dance like a cowboy', 'Do a model runway walk on the sidewalk', 'Do a dramatic cowboy reaction to a splash of pretend water', 'Wave and say hello to people you already know', 'Explain Monopoly to an imaginary crush', 'Ask the group for permission before your next snack break', 'Whenever someone says “like,” say “there you go again” for one round', 'For one round, add a random harmless exclamation to every sentence', 'Sing everything you say for the next two minutes', 'Rank the group’s best animal impressions from first to fifth',
  'Taste a condiment only if you want to and it is safe for you', 'Invent the wildest sandwich the group can imagine', 'Pretend to be the person on your right for one minute', 'Try to whistle a tune after a sip of water', 'Pretend you are underwater for the next round', 'Talk without fully closing your mouth for 30 seconds', 'Take a silly selfie just for the group, without posting it', 'Talk to a pillow as if it is your celebrity crush', 'Sing a group-chosen song without any food challenge', 'Draw a tiny black tooth on paper and wear it as a pretend badge',
  'Pretend to call your future self and give encouraging advice', 'Have a full conversation with yourself in a mirror', 'Go outside and try to summon the rain with a dance', 'Give yourself a silly face-paint design using a washable, skin-safe marker', 'Tell the group a harmless made-up secret',
  'Invent a superhero whose power is making snacks', 'Give a dramatic speech to your favorite pillow', 'Design an imaginary planet and introduce its inhabitants'
];
// Packs use each dare's activity; challenge level reflects how much performing it asks for.
const challenges = dares.map((text, id) => ({
  id, text,
  pack: /group|everyone|person|player|handshake|compliment|selfie|secret|pillow|mirror/.test(text) ? 'friends'
    : /dance|runway|walk|rap|sing|song|beatbox|cheer|clap|jumping/.test(text) ? 'party'
    : /invent|create|draw|make up|design|pitch|code/.test(text.toLowerCase()) ? 'creative' : 'funny',
  difficulty: /dance|runway|rap|sing|opera|stand-up|two minutes|one minute|outside|pitch|tongue twister/.test(text.toLowerCase()) ? 'bold' : 'easy',
}));
const $ = selector => document.querySelector(selector);
const canvas = $('#wheel'), ctx = canvas.getContext('2d'), spin = $('#spin'), result = $('#result');
const pack = $('#pack'), difficulty = $('#difficulty'), sound = $('#sound'), motion = $('#motion');
const systemMotion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
motion.checked = systemMotion?.matches ?? false;
systemMotion?.addEventListener('change', event => { motion.checked = event.matches; });
const fullTurn = Math.PI * 2;
let rotation = 0, spinning = false, active = [], remaining = [];
// History survives switching packs, so changing filters cannot reintroduce a used dare.
const used = new Set();
let audioContext;
function tone(frequency, duration = .035) {
  if (!sound.checked) return;
  try {
    const Audio = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!Audio) return;
    audioContext ||= new Audio();
    void audioContext.resume().catch(() => {});
    const oscillator = audioContext.createOscillator(), gain = audioContext.createGain();
    oscillator.connect(gain); gain.connect(audioContext.destination);
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(.045, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + duration);
    oscillator.start(); oscillator.stop(audioContext.currentTime + duration);
  } catch { /* Sound is optional; a browser audio restriction must never block a spin. */ }
}
function updateCount() { $('#count').textContent = remaining.length; }
function configure() {
  if (spinning) return;
  active = challenges.filter(dare => (pack.value === 'all' || dare.pack === pack.value)
    && (difficulty.value === 'all' || dare.difficulty === difficulty.value));
  remaining = active.filter(dare => !used.has(dare.id));
  canvas.setAttribute('aria-label', `A wheel containing ${active.length} colorful dares`);
  spin.disabled = active.length === 0;
  result.textContent = active.length ? 'Tap SPIN for your next dare!' : 'Try another pack or difficulty.';
  $('#remaining-label').textContent = remaining.length ? 'dares left in this round' : 'dares left — spin to start a new round';
  $('#result-card').classList.remove('revealed');
  updateCount(); draw();
}
function draw() {
  const n = canvas.width / 2, slice = fullTurn / active.length;
  ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save(); ctx.translate(n, n); ctx.rotate(rotation);
  active.forEach((dare, i) => {
    const angle = i * slice - Math.PI / 2;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, n - 25, angle, angle + slice); ctx.closePath();
    ctx.fillStyle = `hsl(${(i * 137.508) % 360} 84% ${56 + (i % 3) * 6}%)`; ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.78)'; ctx.lineWidth = 2; ctx.stroke();
    if (active.length <= 35 || i % 5 === 0) {
      ctx.save(); ctx.rotate(angle + slice / 2); ctx.fillStyle = '#32165f';
      ctx.font = '900 13px Nunito'; ctx.textAlign = 'right'; ctx.fillText(i + 1, n - 43, 5); ctx.restore();
    }
  });
  ctx.beginPath(); ctx.arc(0, 0, n - 20, 0, fullTurn); ctx.strokeStyle = '#6630ad'; ctx.lineWidth = 28; ctx.stroke(); ctx.restore();
}
pack.addEventListener('change', configure); difficulty.addEventListener('change', configure);
spin.addEventListener('click', () => {
  if (spinning || !active.length) return;
  if (!remaining.length) {
    active.forEach(dare => used.delete(dare.id));
    remaining = [...active];
  }
  const chosen = remaining[Math.floor(Math.random() * remaining.length)];
  const index = active.indexOf(chosen), slice = fullTurn / active.length;
  const landing = (fullTurn - (index + .5) * slice) % fullTurn;
  const start = rotation;
  const target = start + (6 + Math.floor(Math.random() * 3)) * fullTurn + (landing - start + fullTurn) % fullTurn;
  const duration = motion.checked ? 180 : 4300, startAt = performance.now();
  spinning = true; spin.disabled = true; pack.disabled = true; difficulty.disabled = true;
  $('#result-card').classList.remove('revealed');
  result.textContent = 'The wheel is choosing…'; tone(450);
  let previousTick = Math.floor(start / slice), lastSound = -Infinity;
  function frame(now) {
    const t = Math.max(0, Math.min(1, (now - startAt) / duration));
    rotation = motion.checked ? start : start + (target - start) * (1 - Math.pow(1 - t, 4));
    draw();
    const tick = Math.floor(rotation / slice);
    if (!motion.checked && tick !== previousTick && now - lastSound >= 55) { tone(650); lastSound = now; }
    previousTick = tick;
    if (t < 1) requestAnimationFrame(frame);
    else {
      rotation = landing; draw();
      used.add(chosen.id); remaining = remaining.filter(dare => dare.id !== chosen.id);
      result.textContent = chosen.text;
      $('#result-card').classList.toggle('less-motion', motion.checked);
      $('#result-card').classList.add('revealed');
      $('#remaining-label').textContent = remaining.length ? 'dares left in this round' : 'round complete — spin for a fresh round';
      updateCount(); tone(880, .18);
      spinning = false; spin.disabled = false; pack.disabled = false; difficulty.disabled = false;
    }
  }
  requestAnimationFrame(frame);
});
configure();
// Refresh canvas labels when the locally served fonts become available.
document.fonts?.ready.then(() => { if (!spinning) draw(); });
