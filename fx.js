/* Quiz KPI · effetti: suoni (Web Audio, nessun file esterno) e coriandoli */
(function () {
  var ctx = null, muted = false, musicTimer = null;
  try { muted = localStorage.getItem('quizkpi_muted') === '1'; } catch (e) {}

  function ac() {
    if (!ctx) { var C = window.AudioContext || window.webkitAudioContext; if (!C) return null; ctx = new C(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, start, dur, type, vol) {
    var a = ac(); if (!a || muted) return;
    var o = a.createOscillator(), g = a.createGain(), t = a.currentTime + (start || 0);
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination); o.start(t); o.stop(t + dur + 0.05);
  }
  var SFX = {
    unlock: function () { ac(); },
    tick: function () { tone(1320, 0, 0.06, 'square', 0.05); },
    beep: function () { tone(660, 0, 0.18, 'triangle', 0.2); },
    go: function () { tone(880, 0, 0.12, 'triangle', 0.2); tone(1320, 0.1, 0.3, 'triangle', 0.2); },
    pop: function () { tone(520 + Math.random() * 400, 0, 0.09, 'sine', 0.12); },
    correct: function () { [523, 659, 784, 1047].forEach(function (f, i) { tone(f, i * 0.08, 0.22, 'triangle', 0.18); }); },
    wrong: function () { tone(220, 0, 0.25, 'sawtooth', 0.08); tone(165, 0.18, 0.35, 'sawtooth', 0.08); },
    fanfare: function () {
      [[523, 0], [523, .15], [523, .3], [659, .45], [784, .75], [659, 1.0], [784, 1.15], [1047, 1.4]].forEach(function (n) { tone(n[0], n[1], 0.32, 'triangle', 0.2); });
    },
    music: function (on) {
      clearInterval(musicTimer); musicTimer = null;
      if (!on) return;
      var seq = [392, 494, 587, 494, 440, 523, 659, 523, 392, 494, 587, 740, 659, 587, 494, 440], i = 0;
      musicTimer = setInterval(function () {
        var f = seq[i % seq.length]; tone(f, 0, 0.16, 'triangle', 0.07);
        if (i % 4 === 0) tone(f / 2, 0, 0.3, 'sine', 0.09);
        i++;
      }, 190);
    },
    isMuted: function () { return muted; },
    setMuted: function (m) { muted = m; try { localStorage.setItem('quizkpi_muted', m ? '1' : '0'); } catch (e) {} if (m) SFX.music(false); }
  };

  function confetti(ms) {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var c = document.createElement('canvas'), x = c.getContext('2d');
    c.className = 'confetti'; document.body.appendChild(c);
    var W, H, dpr = Math.min(2, window.devicePixelRatio || 1);
    function size() { W = innerWidth; H = innerHeight; c.width = W * dpr; c.height = H * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    size(); addEventListener('resize', size);
    var cols = ['#e7b3ad', '#b0305f', '#1c1a1b', '#f6d9d4', '#c9a227', '#ffffff'];
    var P = [];
    for (var i = 0; i < 160; i++) P.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.6, w: 6 + Math.random() * 6, h: 8 + Math.random() * 8,
      vx: -1.5 + Math.random() * 3, vy: 2 + Math.random() * 3, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4, c: cols[i % cols.length] });
    var end = Date.now() + (ms || 3500);
    (function frame() {
      x.clearRect(0, 0, W, H);
      var alive = false;
      P.forEach(function (p) {
        p.x += p.vx; p.y += p.vy; p.r += p.vr; p.vy += 0.03;
        if (Date.now() < end && p.y > H + 20) { p.y = -20; p.x = Math.random() * W; p.vy = 2 + Math.random() * 3; }
        if (p.y < H + 20) alive = true;
        x.save(); x.translate(p.x, p.y); x.rotate(p.r); x.fillStyle = p.c; x.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); x.restore();
      });
      if (alive) requestAnimationFrame(frame); else { removeEventListener('resize', size); c.remove(); }
    })();
  }

  // pulsante audio nell'intestazione
  function bindMute(btn) {
    if (!btn) return;
    function paint() { btn.textContent = SFX.isMuted() ? '🔇' : '🔊'; btn.setAttribute('aria-label', SFX.isMuted() ? 'Attiva audio' : 'Disattiva audio'); }
    btn.addEventListener('click', function () { SFX.setMuted(!SFX.isMuted()); ac(); paint(); if (btn.onchange) btn.onchange(); });
    paint();
  }

  window.FX = { sfx: SFX, confetti: confetti, bindMute: bindMute };
})();
