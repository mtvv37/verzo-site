(function () {
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scroll reveal
  var revealEls = document.querySelectorAll('.reveal, .reveal-stagger');
  if ('IntersectionObserver' in window && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  // Terminal typing animation
  var terminal = document.querySelector('[data-terminal]');
  if (!terminal) return;

  var cmdEl = terminal.querySelector('[data-terminal-cmd]');
  var lineEls = Array.prototype.slice.call(terminal.querySelectorAll('[data-terminal-line]'));
  var command = terminal.getAttribute('data-terminal-cmd-text') || '$ verzo build --project your-app';

  if (reduced) {
    if (cmdEl) cmdEl.textContent = command;
    lineEls.forEach(function (el) {
      el.classList.add('shown');
      var status = el.querySelector('.status');
      if (status) status.classList.add('done');
    });
    return;
  }

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  async function typeCommand(text) {
    cmdEl.innerHTML = '';
    for (var i = 0; i < text.length; i++) {
      cmdEl.textContent = text.slice(0, i + 1);
      await sleep(28);
    }
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    cmdEl.appendChild(cursor);
  }

  async function revealLines() {
    for (var i = 0; i < lineEls.length; i++) {
      await sleep(420);
      var el = lineEls[i];
      el.classList.add('shown');
      var status = el.querySelector('.status');
      var finalState = el.getAttribute('data-final');
      if (status && finalState === 'done') {
        await sleep(260);
        status.textContent = 'done';
        status.classList.add('done');
      }
    }
  }

  async function reset() {
    cmdEl.textContent = '';
    lineEls.forEach(function (el) {
      el.classList.remove('shown');
      var status = el.querySelector('.status');
      if (status) {
        status.classList.remove('done');
        status.textContent = el.getAttribute('data-pending') || '·';
      }
    });
  }

  async function loop() {
    while (true) {
      await reset();
      await sleep(300);
      await typeCommand(command);
      await sleep(300);
      await revealLines();
      await sleep(2400);
    }
  }

  loop();
})();
