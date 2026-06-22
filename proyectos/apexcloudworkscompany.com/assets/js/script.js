const WEEK_EMOJIS = [
  "🎸","🎹","🥁","🎺","🎻","🎷","🎤","🎧",
  "🔥","⚡","🌊","🌙","🌟","💫","🚀","🎯",
  "🦋","🌸","🍀","🎲","💎","🏆","🎮","🧠"
];

const SONG_ID = "4PTG3Z6ehGkBF3zIwYvGZg";

function getWeekNumber() {
  const now  = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

function set(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateSemana() {
  const week  = getWeekNumber();
  const emoji = WEEK_EMOJIS[week % WEEK_EMOJIS.length];
  const url   = `https://open.spotify.com/track/${SONG_ID}`;
  const qr    = `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(url)}&color=C4956A&bgcolor=0F0F0F`;

  // Spotify card header
  set('week-num',  week);
  set('week-num2', week);

  // Terminal code card
  set('week-val',   week);
  set('week-emoji', emoji);

  // QR y link Spotify
  const qrContainer = document.getElementById('qrcode-container');
  const spLink      = document.getElementById('spotify-link');
  if (qrContainer) qrContainer.innerHTML = `<img src="${qr}" alt="QR Spotify"/>`;
  if (spLink)      spLink.href = url;

  // Result card — output del semana.js
  set('vw-week-num',   week);
  set('vw-week-emoji', `"${emoji}"`);
  const emojiDisplay = document.getElementById('rc-emoji-display');
  if (emojiDisplay) emojiDisplay.textContent = emoji;
}

// Nav panel toggle
function toggleNav() {
  document.getElementById('navPanel').classList.toggle('open');
}

// Cerrar nav al hacer click fuera
document.addEventListener('click', (e) => {
  const panel  = document.getElementById('navPanel');
  const toggle = document.querySelector('.menu-toggle');
  if (panel && panel.classList.contains('open') &&
      !panel.contains(e.target) && toggle && !toggle.contains(e.target)) {
    panel.classList.remove('open');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  updateSemana();

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + tab).classList.add('active');
    });
  });
});

function toggleFaq(el) {
  const item = el.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(i => i.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

function copyHeroCode(btn) {
  const el = document.getElementById('hero-code');
  if (!el) return;
  navigator.clipboard.writeText(el.innerText).then(() => {
    btn.textContent = '✓ Copiado';
    setTimeout(() => { btn.textContent = 'Copiar'; }, 2000);
  });
}
