let handler = async (m, { conn }) => {
  const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
  -webkit-touch-callout:none
}

body{
  margin:0;
  background:transparent;
  font-family:Arial,sans-serif;
  color:#eee;
  touch-action:manipulation;
  cursor:pointer
}

.wrap{
  width:100%;
  max-width:620px;
  margin:auto;
  padding:16px;
  box-sizing:border-box
}

.box{
  background:rgba(255,255,255,.06);
  backdrop-filter:blur(14px);
  -webkit-backdrop-filter:blur(14px);
  border:1px solid rgba(255,255,255,.15);
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 8px 32px rgba(0,0,0,.35)
}

.head{
  padding:18px 20px;
  border-bottom:1px solid rgba(255,255,255,.12);
  display:flex;
  justify-content:space-between;
  align-items:center
}

.title{
  font-size:21px;
  font-weight:bold;
  color:#fff
}

.scorebox{
  text-align:right
}

#score{
  font-size:18px;
  font-weight:bold;
  color:#fff;
  text-shadow:0 0 10px rgba(108,92,231,.85);
  transition:transform .15s
}

#best{
  font-size:10px;
  color:rgba(255,255,255,.4);
  margin-top:2px
}

.content{
  padding:18px
}

canvas{
  width:100%;
  height:auto;
  background:rgba(255,255,255,.03);
  border:1px solid rgba(255,255,255,.12);
  border-radius:12px;
  display:block
}

#status{
  text-align:center;
  margin-top:10px;
  font-size:12px;
  color:rgba(255,255,255,.55)
}
</style>

<body>

<div class="wrap">
  <div class="box">

    <div class="head">
      <div>
        <div class="title">Dino Runner 🦖</div>
      </div>

      <div class="scorebox">
        <div id="score">00000</div>
        <div id="best">BEST 00000</div>
      </div>
    </div>

    <div class="content">
      <canvas id="game" width="560" height="190"></canvas>

      <div id="status">
        Tap layar untuk melompat
      </div>
    </div>

  </div>
</div>

<script>

const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')

const scoreEl = document.getElementById('score')
const bestEl = document.getElementById('best')
const statusEl = document.getElementById('status')

const groundY = 165

let dino
let obstacles
let clouds
let score
let best = 0
let speed
let gameOver
let lastTime
let spawnTimer
let runTime
let audioCtx = null

function getAudio() {
  if (!audioCtx) {
    audioCtx = new (
      window.AudioContext ||
      window.webkitAudioContext
    )()
  }

  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }

  return audioCtx
}

function playTone(
  freq,
  duration = 0.15,
  type = 'sine',
  volume = 0.15
) {
  const audio = getAudio()
  const osc = audio.createOscillator()
  const gain = audio.createGain()

  osc.type = type

  osc.frequency.setValueAtTime(
    freq,
    audio.currentTime
  )

  gain.gain.setValueAtTime(
    0.0001,
    audio.currentTime
  )

  gain.gain.exponentialRampToValueAtTime(
    volume,
    audio.currentTime + 0.01
  )

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    audio.currentTime + duration
  )

  osc.connect(gain)
  gain.connect(audio.destination)

  osc.start()

  osc.stop(
    audio.currentTime +
    duration +
    0.05
  )
}

function jumpSound() {
  playTone(
    500,
    0.12,
    'square',
    0.12
  )

  setTimeout(() => {
    playTone(
      750,
      0.08,
      'square',
      0.08
    )
  }, 70)
}

function gameOverSound() {
  playTone(
    220,
    0.25,
    'sawtooth',
    0.14
  )

  setTimeout(() => {
    playTone(
      120,
      0.45,
      'sawtooth',
      0.12
    )
  }, 180)
}

function scoreSound() {
  playTone(
    880,
    0.07,
    'sine',
    0.06
  )
}

function loadBest() {
  try {
    return Number(
      localStorage.getItem(
        'dino_best'
      )
    ) || 0
  } catch {
    return 0
  }
}

function saveBest() {
  try {
    localStorage.setItem(
      'dino_best',
      String(Math.floor(best))
    )
  } catch {}
}

best = loadBest()

function reset() {
  dino = {
    x:55,
    y:125,
    width:28,
    height:35,
    velocityY:0,
    jumping:false
  }

  obstacles = []

  clouds = [
    { x:100, y:30, speed:.3 },
    { x:300, y:50, speed:.2 },
    { x:470, y:25, speed:.4 }
  ]

  score = 0
  speed = 5
  gameOver = false
  lastTime = 0
  runTime = 0
  spawnTimer = 80

  scoreEl.textContent = '00000'

  bestEl.textContent =
    'BEST ' +
    String(Math.floor(best)).padStart(5, '0')

  statusEl.textContent =
    'Tap layar untuk melompat'
}

function jump() {
  if (gameOver) {
    reset()
    return
  }

  if (!dino.jumping) {
    jumpSound()

    dino.velocityY = -13
    dino.jumping = true
  }
}

function createObstacle() {
  const height =
    25 + Math.random() * 35

  obstacles.push({
    x:canvas.width + 20,
    y:groundY - height,
    width:18,
    height
  })
}

function collision(a, b) {
  return (
    a.x + 4 < b.x + b.width &&
    a.x + a.width - 4 > b.x &&
    a.y + 4 < b.y + b.height &&
    a.y + a.height > b.y
  )
}

function drawCloud(cloud) {
  ctx.fillStyle =
    'rgba(255,255,255,.18)'

  ctx.fillRect(
    cloud.x,
    cloud.y,
    45,
    6
  )

  ctx.fillRect(
    cloud.x + 10,
    cloud.y - 5,
    25,
    10
  )
}

function drawDino() {
  ctx.fillStyle = '#eeeeee'

  ctx.fillRect(
    dino.x,
    dino.y,
    28,
    30
  )

  ctx.fillRect(
    dino.x + 22,
    dino.y + 5,
    13,
    18
  )

  ctx.fillStyle = '#6c5ce7'

  ctx.fillRect(
    dino.x + 29,
    dino.y + 8,
    4,
    4
  )

  ctx.fillStyle = '#eeeeee'

  const leg =
    dino.jumping
      ? 0
      : Math.sin(runTime * .4) * 4

  ctx.fillRect(
    dino.x + 5,
    dino.y + 30,
    6,
    8 + leg
  )

  ctx.fillRect(
    dino.x + 20,
    dino.y + 30,
    6,
    8 - leg
  )
}

function drawObstacle(obstacle) {
  ctx.save()

  ctx.shadowColor =
    'rgba(255,80,80,.4)'

  ctx.shadowBlur = 10

  ctx.fillStyle = '#e17a7a'

  ctx.fillRect(
    obstacle.x,
    obstacle.y,
    obstacle.width,
    obstacle.height
  )

  ctx.fillRect(
    obstacle.x - 6,
    obstacle.y + 10,
    6,
    7
  )

  ctx.fillRect(
    obstacle.x + obstacle.width,
    obstacle.y + 15,
    6,
    7
  )

  ctx.restore()
}

function draw() {
  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  clouds.forEach(drawCloud)

  ctx.strokeStyle =
    'rgba(255,255,255,.3)'

  ctx.lineWidth = 2

  ctx.setLineDash([10, 8])

  ctx.lineDashOffset =
    -runTime * speed

  ctx.beginPath()

  ctx.moveTo(0, groundY)

  ctx.lineTo(
    canvas.width,
    groundY
  )

  ctx.stroke()

  ctx.setLineDash([])

  drawDino()

  obstacles.forEach(drawObstacle)

  if (gameOver) {
    ctx.fillStyle =
      'rgba(10,10,20,.65)'

    ctx.fillRect(
      0,
      0,
      canvas.width,
      canvas.height
    )

    ctx.fillStyle = '#fff'

    ctx.textAlign = 'center'

    ctx.font = 'bold 25px Arial'

    ctx.fillText(
      'GAME OVER',
      canvas.width / 2,
      80
    )

    ctx.font = '14px Arial'

    ctx.fillText(
      'Tap untuk main lagi',
      canvas.width / 2,
      110
    )

    ctx.textAlign = 'left'
  }
}

function loop(time) {
  if (!lastTime)
    lastTime = time

  const delta =
    Math.min(
      (time - lastTime) / 16.67,
      2
    )

  lastTime = time

  runTime += delta

  if (!gameOver) {
    dino.y +=
      dino.velocityY * delta

    dino.velocityY +=
      .75 * delta

    if (dino.y >= 125) {
      dino.y = 125
      dino.velocityY = 0
      dino.jumping = false
    }

    spawnTimer -= delta

    if (spawnTimer <= 0) {
      createObstacle()

      spawnTimer =
        Math.max(
          40,
          80 - speed * 3
        ) +
        Math.random() * 40
    }

    obstacles.forEach(obstacle => {
      obstacle.x -=
        speed * delta
    })

    obstacles =
      obstacles.filter(
        obstacle =>
          obstacle.x > -40
      )

    clouds.forEach(cloud => {
      cloud.x -=
        cloud.speed * delta

      if (cloud.x < -60)
        cloud.x =
          canvas.width + 40
    })

    speed =
      Math.min(
        12,
        speed + .002 * delta
      )

    const oldScore =
      Math.floor(score)

    score +=
      delta * .6

    const newScore =
      Math.floor(score)

    if (
      newScore > 0 &&
      newScore % 100 === 0 &&
      newScore !== oldScore
    ) {
      scoreSound()
    }

    if (score > best)
      best = score

    scoreEl.textContent =
      String(
        Math.floor(score)
      ).padStart(5, '0')

    bestEl.textContent =
      'BEST ' +
      String(
        Math.floor(best)
      ).padStart(5, '0')

    statusEl.textContent =
      'Speed ' +
      speed.toFixed(1) +
      'x'

    for (const obstacle of obstacles) {
      if (collision(dino, obstacle)) {
        gameOver = true

        gameOverSound()

        saveBest()

        statusEl.textContent =
          'Game Over! Tap untuk ulang'

        break
      }
    }
  }

  draw()

  requestAnimationFrame(loop)
}

document.addEventListener(
  'pointerdown',
  event => {
    event.preventDefault()
    jump()
  }
)

document.addEventListener(
  'keydown',
  event => {
    if (event.code === 'Space') {
      event.preventDefault()
      jump()
    }
  }
)

reset()

requestAnimationFrame(loop)

</script>

</body>
`

  await conn.relayMessage(
    m.chat,
    {
      messageContextInfo: {
        deviceListMetadata: {},
        deviceListMetadataVersion: 2,

        botMetadata: {
          messageDisclaimerText: '',
          botResponseId: crypto.randomUUID()
        }
      },

      botForwardedMessage: {
        message: {
          richResponseMessage: {
            messageType: 1,

            submessages: [
              {
                messageType: 2,
                messageText: 'Dino Runner 🦖'
              }
            ],

            unifiedResponse: {
              data: Buffer.from(
                JSON.stringify({
                  response_id: crypto.randomUUID(),

                  sections: [
                    {
                      view_model: {
                        primitive: {
                          __typename:
                            'GenAIaeacdsnwHtmlPrimitive',

                          payload: html,

                          trusted_sources: []
                        },

                        __typename:
                          'GenAISingleLayoutViewModel'
                      }
                    }
                  ]
                })
              ).toString('base64')
            },

            contextInfo: {
              forwardingScore: 1,
              isForwarded: true,

              forwardedAiBotMessageInfo: {
                botJid: '0@bot'
              },

              forwardOrigin: 4
            }
          }
        }
      }
    },
    {}
  )
}

handler.help = ['dino']
handler.tags = ['game']
handler.command = /^dino$/i

export default handler