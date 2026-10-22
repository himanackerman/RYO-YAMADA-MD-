'use strict';

import { randomUUID } from 'crypto';

function escapeHtml(text = '') {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function createFlappyBirdUI({ playerName }) {
  const safeName = escapeHtml(playerName);

  return `
<style>
  :root {
    --bg-color: #08070b;
    --card-bg: rgba(20, 18, 26, 0.75);
    --accent: #1ed760;
    --accent-glow: rgba(30, 215, 96, 0.4);
    --text-main: #ffffff;
    --text-muted: rgba(255, 255, 255, 0.55);
    --font-sys: -apple-system, BlinkMacSystemFont, 'SF Pro Display', Roboto, Helvetica, Arial, sans-serif;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
  html, body { background: transparent; color: var(--text-main); font-family: var(--font-sys); -webkit-font-smoothing: antialiased; }

  .wrap { display: flex; align-items: center; justify-content: center; padding: 10px; }
  .game-card { position: relative; width: 100%; max-width: 330px; border-radius: 32px; overflow: hidden; background: var(--card-bg); backdrop-filter: blur(25px); -webkit-backdrop-filter: blur(25px); border: 1px solid rgba(255, 255, 255, 0.15); box-shadow: 0 25px 60px rgba(0,0,0,0.85); padding: 20px; text-align: center; }

  .head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
  .title { font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: var(--accent); text-shadow: 0 0 10px var(--accent-glow); }
  
  .head-right { display: flex; align-items: center; gap: 8px; }
  .sound-btn { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.12); color: #fff; font-size: 11px; font-weight: 700; padding: 4px 8px; border-radius: 10px; cursor: pointer; transition: background 0.2s; }
  .sound-btn:active { background: rgba(255, 255, 255, 0.2); }

  .player-tag { font-size: 11px; font-weight: 600; color: var(--text-muted); max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

  .canvas-wrapper { position: relative; width: 100%; aspect-ratio: 3/4; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.12); box-shadow: inset 0 0 25px rgba(0,0,0,0.6); background: #0c1017; cursor: pointer; }
  canvas { width: 100%; height: 100%; display: block; }

  .overlay { position: absolute; inset: 0; background: rgba(8, 7, 11, 0.82); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 20px; z-index: 5; transition: opacity 0.25s ease; }
  .overlay.hidden { opacity: 0; pointer-events: none; }
  .overlay-title { font-size: 24px; font-weight: 900; color: #fff; letter-spacing: -0.02em; text-shadow: 0 0 20px rgba(255,255,255,0.25); }
  .overlay-sub { font-size: 12px; color: var(--text-muted); font-weight: 500; }
  
  .score-board { display: flex; justify-content: space-between; width: 100%; max-width: 200px; background: rgba(255, 255, 255, 0.06); padding: 10px 16px; border-radius: 14px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.08); margin-top: 4px; }
  .score-val { color: var(--accent); font-size: 15px; font-weight: 900; }

  .start-btn { padding: 12px 28px; border-radius: 16px; background: var(--accent); border: none; color: #000; font-size: 13px; font-weight: 900; cursor: pointer; box-shadow: 0 8px 25px var(--accent-glow); transition: transform 0.15s ease, background 0.15s ease; letter-spacing: 0.05em; }
  .start-btn:active { transform: scale(0.92); background: #17b851; }
</style>

<div class="wrap">
  <div class="game-card">
    <div class="head">
      <div class="title">Flappy Bird</div>
      <div class="head-right">
        <button class="sound-btn" id="sound-btn">🔊 ON</button>
        <div class="player-tag">🎮 ${safeName}</div>
      </div>
    </div>

    <div class="canvas-wrapper" id="canvas-container">
      <canvas id="gameCanvas" width="280" height="370"></canvas>
      <div class="overlay" id="overlay">
        <div class="overlay-title" id="overlay-title">FLAPPY BIRD</div>
        <div class="overlay-sub" id="overlay-sub">Tap Layar Untuk Melompat</div>
        <div class="score-board" id="modal-score" style="display:none;">
          <span>Skor: <span class="score-val" id="final-score">0</span></span>
          <span>Tertinggi: <span class="score-val" id="final-best">0</span></span>
        </div>
        <button class="start-btn" id="start-btn">MAINKAN 🚀</button>
      </div>
    </div>
  </div>
</div>

<script>
(function() {
  'use strict';

  const canvas = document.getElementById('gameCanvas');
  const ctx = canvas.getContext('2d');
  const container = document.getElementById('canvas-container');
  const overlay = document.getElementById('overlay');
  const overlayTitle = document.getElementById('overlay-title');
  const overlaySub = document.getElementById('overlay-sub');
  const modalScore = document.getElementById('modal-score');
  const finalScore = document.getElementById('final-score');
  const finalBest = document.getElementById('final-best');
  const startBtn = document.getElementById('start-btn');
  const soundBtn = document.getElementById('sound-btn');

  let soundEnabled = true;
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      const now = audioCtx.currentTime;

      if (type === 'jump') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.exponentialRampToValueAtTime(650, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'score') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'hit') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.25);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      }
    } catch (e) {}
  }

  soundBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    soundEnabled = !soundEnabled;
    soundBtn.textContent = soundEnabled ? '🔊 ON' : '🔇 OFF';
  });

  let animationFrameId;
  let gameRunning = false;
  let score = 0;
  let highScore = 0;

  const bird = {
    x: 45,
    y: 150,
    radius: 10,
    gravity: 0.22,
    lift: -4.8,
    velocity: 0
  };

  let pipes = [];
  const pipeWidth = 38;
  const pipeGap = 115;
  const pipeSpeed = 1.4;
  let frameCount = 0;

  function resetGame() {
    bird.y = 150;
    bird.velocity = 0;
    pipes = [];
    score = 0;
    frameCount = 0;
  }

  function createPipe() {
    const minHeight = 40;
    const maxHeight = canvas.height - pipeGap - minHeight - 30;
    const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

    pipes.push({
      x: canvas.width,
      top: topHeight,
      bottom: canvas.height - topHeight - pipeGap,
      passed: false
    });
  }

  function jump() {
    if (!gameRunning) return;
    bird.velocity = bird.lift;
    playSound('jump');
  }

  function update() {
    if (!gameRunning) return;

    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    if (bird.y + bird.radius >= canvas.height - 20 || bird.y - bird.radius <= 0) {
      gameOver();
      return;
    }

    if (frameCount % 110 === 0) {
      createPipe();
    }

    for (let i = pipes.length - 1; i >= 0; i--) {
      const p = pipes[i];
      p.x -= pipeSpeed;

      if (
        bird.x + bird.radius > p.x &&
        bird.x - bird.radius < p.x + pipeWidth &&
        (bird.y - bird.radius < p.top || bird.y + bird.radius > canvas.height - p.bottom)
      ) {
        gameOver();
        return;
      }

      if (!p.passed && p.x + pipeWidth < bird.x) {
        p.passed = true;
        score++;
        if (score > highScore) highScore = score;
        playSound('score');
      }

      if (p.x + pipeWidth < 0) {
        pipes.splice(i, 1);
      }
    }

    frameCount++;
  }

  function draw() {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    skyGrad.addColorStop(0, '#121824');
    skyGrad.addColorStop(1, '#1a233a');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#161b22';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 20);
    ctx.fillStyle = '#1ed760';
    ctx.fillRect(0, canvas.height - 20, canvas.width, 3);

    for (const p of pipes) {
      ctx.fillStyle = '#1ed760';
      ctx.fillRect(p.x, 0, pipeWidth, p.top);
      ctx.fillRect(p.x, canvas.height - p.bottom, pipeWidth, p.bottom);

      ctx.fillStyle = '#17b851';
      ctx.fillRect(p.x - 2, p.top - 10, pipeWidth + 4, 10);
      ctx.fillRect(p.x - 2, canvas.height - p.bottom, pipeWidth + 4, 10);
    }

    ctx.save();
    ctx.translate(bird.x, bird.y);
    const angle = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.1));
    ctx.rotate(angle);

    ctx.fillStyle = '#ffe600';
    ctx.beginPath();
    ctx.arc(0, 0, bird.radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(4, -3, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(5, -3, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ff5722';
    ctx.beginPath();
    ctx.arc(6, 2, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = '900 24px var(--font-sys)';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(30, 215, 96, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(score, canvas.width / 2, 45);
    ctx.shadowBlur = 0;
  }

  function loop() {
    update();
    draw();
    if (gameRunning) {
      animationFrameId = requestAnimationFrame(loop);
    }
  }

  function startGame() {
    initAudio();
    resetGame();
    gameRunning = true;
    overlay.classList.add('hidden');
    cancelAnimationFrame(animationFrameId);
    loop();
  }

  function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    playSound('hit');

    overlayTitle.textContent = 'GAME OVER';
    overlaySub.textContent = 'Ayo coba lagi!';
    finalScore.textContent = score;
    finalBest.textContent = highScore;
    modalScore.style.display = 'flex';
    startBtn.textContent = 'MAIN LAGI 🔄';
    overlay.classList.remove('hidden');
  }

  container.addEventListener('pointerdown', function(e) {
    if (e.target === startBtn || e.target.closest('#start-btn') || e.target === soundBtn || e.target.closest('#sound-btn')) return;
    if (gameRunning) {
      jump();
    }
  });

  startBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    startGame();
  });

  draw();
})();
</script>
`;
}

let handler = async (m, { conn }) => {
  let playerName = m.name || 'Pemain';

  const html = createFlappyBirdUI({ playerName });
  const responseId = randomUUID();

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,
        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: responseId
        }
      },
      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,
            submessages: [{ messageType: 2, messageText: `Flappy Bird: ${playerName}` }],
            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: responseId,
                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename: 'GenAIaeacdsnwHtmlPrimitive',
                          payload: html,
                          trusted_sources: []
                        },
                        __typename: 'GenAISingleLayoutViewModel'
                      }
                    }
                  ]
                })
              ).toString('base64')
            },
            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,
              forwardedAiBotMessageInfo: { botJid: '867051314767696@bot' },
              forwardOrigin: 4
            }
          }
        }
      }
    },
    { messageId: responseId }
  );
};

handler.help = ['flappybird', 'flappy'];
handler.tags = ['game'];
handler.command = /^(flappybird|flappy)$/i;

export default handler;