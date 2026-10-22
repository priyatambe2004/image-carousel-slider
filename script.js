const INTERVAL = 4000; // ms between automatic slides (keep in sync with --interval in style.css)

const carousel = document.getElementById('carousel');
const track = document.getElementById('track');
const slides = track.querySelectorAll('.slide');
const dotsBox = document.getElementById('dots');
const bar = document.getElementById('bar');
const count = document.getElementById('count');
const playBtn = document.getElementById('play');
const total = slides.length;

let index = 0;          // state: which slide is showing
let timer = null;       // setInterval id
let userPaused = false; // true when the Pause button was pressed

// Build one indicator dot per slide
const dots = Array.from(slides, (_, i) => {
  const d = document.createElement('button');
  d.className = 'dot';
  d.setAttribute('role', 'tab');
  d.setAttribute('aria-label', 'Go to slide ' + (i + 1));
  d.addEventListener('click', () => { goTo(i); restart(); });
  dotsBox.appendChild(d);
  return d;
});

// Show slide n. Modulo wraps the index at both ends.
function goTo(n) {
  index = (n + total) % total;
  track.style.setProperty('--i', index);
  dots.forEach((d, i) => d.setAttribute('aria-selected', i === index));
  slides.forEach((s, i) => s.setAttribute('aria-hidden', i !== index));
  count.textContent = (index + 1) + ' / ' + total;
}

// Timer helpers
function start() {
  stop();
  if (userPaused || document.hidden) return;
  bar.classList.remove('run');
  void bar.offsetWidth;            // force reflow so the bar animation restarts
  bar.classList.add('run');
  timer = setInterval(() => goTo(index + 1), INTERVAL);
}
function stop() {
  clearInterval(timer);
  timer = null;
  bar.classList.remove('run');
}
const restart = start; // manual navigation clears and restarts the timer

// Next / previous buttons
document.getElementById('next').addEventListener('click', () => { goTo(index + 1); restart(); });
document.getElementById('prev').addEventListener('click', () => { goTo(index - 1); restart(); });

// Pause on hover and keyboard focus, resume when the pointer or focus leaves
carousel.addEventListener('mouseenter', stop);
carousel.addEventListener('mouseleave', start);
carousel.addEventListener('focusin', stop);
carousel.addEventListener('focusout', start);

// Pause / play button
playBtn.addEventListener('click', () => {
  userPaused = !userPaused;
  playBtn.textContent = userPaused ? 'Play' : 'Pause';
  playBtn.setAttribute('aria-label', userPaused ? 'Start auto-rotation' : 'Pause auto-rotation');
  userPaused ? stop() : start();
});

// Keyboard arrows
carousel.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { goTo(index + 1); restart(); }
  if (e.key === 'ArrowLeft') { goTo(index - 1); restart(); }
});

// Touch swipe
let startX = null;
track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; stop(); }, { passive: true });
track.addEventListener('touchend', e => {
  if (startX !== null) {
    const dx = e.changedTouches[0].clientX - startX;
    if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1));
    startX = null;
  }
  start();
});

// Do not rotate while the tab is in the background
document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

goTo(0);
start();
