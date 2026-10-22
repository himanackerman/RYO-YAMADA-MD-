let handler = async (m, { conn }) => {
  const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
  -webkit-touch-callout:none;
  box-sizing:border-box
}

body{
  margin:0;
  background:transparent;
  font-family:Arial,sans-serif;
  color:#eee;
  touch-action:none
}

.wrap{
  width:100%;
  max-width:620px;
  margin:auto;
  padding:16px
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
  text-shadow:0 0 10px rgba(108,92,231,.85)
}

#best{
  font-size:10px;
  color:rgba(255,255,255,.4);
  margin-top:2px
}

.content{
  padding:18px
}

.gamebox{
  width:100%;
  aspect-ratio:1/1;
  max-height:430px;
  border-radius:14px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(0,0,0,.18)
}

canvas{
  width:100%;
  height:100%;
  display:block
}

.controls{
  margin-top:16px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:8px
}

.row{
  display:flex;
  gap:8px
}

button{
  width:58px;
  height:48px;
  border:1px solid rgba(255,255,255,.15);
  border-radius:12px;
  background:rgba(255,255,255,.08);
  color:#fff;
  font-size:20px;
  cursor:pointer
}

button:active{
  transform:scale(.93);
  background:rgba(108,92,231,.5)
}

#status{
  text-align:center;
  margin-top:14px;
  font-size:12px;
  color:rgba(255,255,255,.55)
}
</style>

<div class="wrap">
  <div class="box">

    <div class="head">
      <div class="title">Snake 🐍</div>

      <div class="scorebox">
        <div id="score">000</div>
        <div id="best">BEST 000</div>
      </div>
    </div>

    <div class="content">

      <div class="gamebox">
        <canvas id="game" width="400" height="400"></canvas>
      </div>

      <div class="controls">

        <button id="up">▲</button>

        <div class="row">
          <button id="left">◀</button>
          <button id="down">▼</button>
          <button id="right">▶</button>
        </div>

      </div>

      <div id="status">
        Swipe layar atau gunakan tombol untuk mulai
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

const gridSize = 20
const tileSize = canvas.width / gridSize

let snake
let food
let dx
let dy
let nextDx
let nextDy
let score
let best = 0
let gameOver
let started
let lastMove
let speed
let audioCtx = null
let touchStartX = 0
let touchStartY = 0

function getAudio(){

  if(!audioCtx){

    audioCtx = new(
      window.AudioContext ||
      window.webkitAudioContext
    )()

  }

  if(audioCtx.state === 'suspended'){
    audioCtx.resume()
  }

  return audioCtx
}

function playTone(
  freq,
  duration = .12,
  type = 'sine',
  volume = .1
){

  const audio = getAudio()

  const osc = audio.createOscillator()
  const gain = audio.createGain()

  osc.type = type

  osc.frequency.setValueAtTime(
    freq,
    audio.currentTime
  )

  gain.gain.setValueAtTime(
    .0001,
    audio.currentTime
  )

  gain.gain.exponentialRampToValueAtTime(
    volume,
    audio.currentTime + .01
  )

  gain.gain.exponentialRampToValueAtTime(
    .0001,
    audio.currentTime + duration
  )

  osc.connect(gain)
  gain.connect(audio.destination)

  osc.start()

  osc.stop(
    audio.currentTime +
    duration +
    .05
  )

}

function eatSound(){

  playTone(
    520,
    .08,
    'square',
    .08
  )

  setTimeout(() => {

    playTone(
      780,
      .1,
      'square',
      .07
    )

  },70)

}

function gameOverSound(){

  playTone(
    220,
    .2,
    'sawtooth',
    .12
  )

  setTimeout(() => {

    playTone(
      110,
      .4,
      'sawtooth',
      .1
    )

  },150)

}

function loadBest(){

  try{

    return Number(
      localStorage.getItem(
        'snake_best'
      )
    ) || 0

  }catch{

    return 0

  }

}

function saveBest(){

  try{

    localStorage.setItem(
      'snake_best',
      String(best)
    )

  }catch{}

}

best = loadBest()

function reset(){

  snake = [

    {x:10,y:10},

    {x:9,y:10},

    {x:8,y:10}

  ]

  dx = 1
  dy = 0

  nextDx = 1
  nextDy = 0

  score = 0

  speed = 130

  gameOver = false

  started = false

  lastMove = 0

  createFood()

  updateScore()

  statusEl.textContent =
    'Swipe layar atau gunakan tombol untuk mulai'

}

function createFood(){

  let valid = false

  while(!valid){

    food = {

      x:Math.floor(
        Math.random() * gridSize
      ),

      y:Math.floor(
        Math.random() * gridSize
      )

    }

    valid = !snake.some(
      part =>
        part.x === food.x &&
        part.y === food.y
    )

  }

}

function updateScore(){

  scoreEl.textContent =
    String(score).padStart(3,'0')

  bestEl.textContent =
    'BEST ' +
    String(best).padStart(3,'0')

}

function changeDirection(x,y){

  if(gameOver){

    reset()

  }

  if(
    x === -dx &&
    y === -dy
  ){
    return
  }

  nextDx = x
  nextDy = y

  if(!started){

    started = true

    statusEl.textContent =
      'Makan makanan sebanyak mungkin'

  }

}

function update(){

  if(!started || gameOver){
    return
  }

  dx = nextDx
  dy = nextDy

  const head = {

    x:snake[0].x + dx,

    y:snake[0].y + dy

  }

  if(
    head.x < 0 ||
    head.x >= gridSize ||
    head.y < 0 ||
    head.y >= gridSize
  ){

    endGame()

    return

  }

  if(
    snake.some(
      part =>
        part.x === head.x &&
        part.y === head.y
    )
  ){

    endGame()

    return

  }

  snake.unshift(head)

  if(
    head.x === food.x &&
    head.y === food.y
  ){

    score++

    if(score > best){
      best = score
    }

    eatSound()

    createFood()

    speed = Math.max(
      65,
      speed - 3
    )

    updateScore()

  }else{

    snake.pop()

  }

}

function endGame(){

  gameOver = true

  started = false

  saveBest()

  gameOverSound()

  statusEl.textContent =
    'Game Over! Tekan arah atau tap layar untuk ulang'

}

function drawBackground(){

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  for(
    let x = 0;
    x < gridSize;
    x++
  ){

    for(
      let y = 0;
      y < gridSize;
      y++
    ){

      if((x + y) % 2 === 0){

        ctx.fillStyle =
          'rgba(255,255,255,.018)'

        ctx.fillRect(
          x * tileSize,
          y * tileSize,
          tileSize,
          tileSize
        )

      }

    }

  }

}

function drawFood(){

  const x =
    food.x * tileSize +
    tileSize / 2

  const y =
    food.y * tileSize +
    tileSize / 2

  ctx.beginPath()

  ctx.shadowColor =
    'rgba(255,80,100,.7)'

  ctx.shadowBlur = 14

  ctx.fillStyle =
    '#ff6b81'

  ctx.arc(
    x,
    y,
    tileSize * .3,
    0,
    Math.PI * 2
  )

  ctx.fill()

  ctx.shadowBlur = 0

}

function drawSnake(){

  snake.forEach(
    (part,index) => {

      const x =
        part.x * tileSize

      const y =
        part.y * tileSize

      ctx.shadowColor =
        index === 0
          ? 'rgba(108,92,231,.8)'
          : 'rgba(80,200,120,.35)'

      ctx.shadowBlur =
        index === 0
          ? 12
          : 5

      ctx.fillStyle =
        index === 0
          ? '#a29bfe'
          : '#55efc4'

      ctx.beginPath()

      ctx.roundRect(
        x + 2,
        y + 2,
        tileSize - 4,
        tileSize - 4,
        5
      )

      ctx.fill()

      ctx.shadowBlur = 0

      if(index === 0){

        ctx.fillStyle =
          '#1f1f2e'

        let eye1
        let eye2

        if(dx === 1){

          eye1 = {
            x:x + 14,
            y:y + 6
          }

          eye2 = {
            x:x + 14,
            y:y + 14
          }

        }else if(dx === -1){

          eye1 = {
            x:x + 6,
            y:y + 6
          }

          eye2 = {
            x:x + 6,
            y:y + 14
          }

        }else if(dy === -1){

          eye1 = {
            x:x + 6,
            y:y + 6
          }

          eye2 = {
            x:x + 14,
            y:y + 6
          }

        }else{

          eye1 = {
            x:x + 6,
            y:y + 14
          }

          eye2 = {
            x:x + 14,
            y:y + 14
          }

        }

        ctx.beginPath()

        ctx.arc(
          eye1.x,
          eye1.y,
          2,
          0,
          Math.PI * 2
        )

        ctx.fill()

        ctx.beginPath()

        ctx.arc(
          eye2.x,
          eye2.y,
          2,
          0,
          Math.PI * 2
        )

        ctx.fill()

      }

    }
  )

}

function drawGameOver(){

  if(!gameOver){
    return
  }

  ctx.fillStyle =
    'rgba(10,10,20,.72)'

  ctx.fillRect(
    0,
    0,
    canvas.width,
    canvas.height
  )

  ctx.fillStyle =
    '#fff'

  ctx.textAlign =
    'center'

  ctx.font =
    'bold 28px Arial'

  ctx.fillText(
    'GAME OVER',
    canvas.width / 2,
    canvas.height / 2 - 15
  )

  ctx.font =
    '14px Arial'

  ctx.fillStyle =
    'rgba(255,255,255,.7)'

  ctx.fillText(
    'Tap atau tekan tombol arah',
    canvas.width / 2,
    canvas.height / 2 + 18
  )

  ctx.textAlign =
    'left'

}

function draw(){

  drawBackground()

  drawFood()

  drawSnake()

  drawGameOver()

}

function loop(time){

  if(
    started &&
    !gameOver &&
    time - lastMove >= speed
  ){

    update()

    lastMove = time

  }

  draw()

  requestAnimationFrame(loop)

}

function handleTouchStart(event){

  const touch =
    event.touches[0]

  touchStartX =
    touch.clientX

  touchStartY =
    touch.clientY

}

function handleTouchEnd(event){

  const touch =
    event.changedTouches[0]

  const diffX =
    touch.clientX -
    touchStartX

  const diffY =
    touch.clientY -
    touchStartY

  if(
    Math.abs(diffX) < 20 &&
    Math.abs(diffY) < 20
  ){

    if(gameOver){

      reset()

    }

    return

  }

  if(
    Math.abs(diffX) >
    Math.abs(diffY)
  ){

    if(diffX > 0){

      changeDirection(1,0)

    }else{

      changeDirection(-1,0)

    }

  }else{

    if(diffY > 0){

      changeDirection(0,1)

    }else{

      changeDirection(0,-1)

    }

  }

}

canvas.addEventListener(
  'touchstart',
  handleTouchStart,
  {passive:false}
)

canvas.addEventListener(
  'touchend',
  handleTouchEnd,
  {passive:false}
)

document.getElementById(
  'up'
).onclick = () =>
  changeDirection(0,-1)

document.getElementById(
  'down'
).onclick = () =>
  changeDirection(0,1)

document.getElementById(
  'left'
).onclick = () =>
  changeDirection(-1,0)

document.getElementById(
  'right'
).onclick = () =>
  changeDirection(1,0)

document.addEventListener(
  'keydown',
  event => {

    if(
      event.code === 'ArrowUp'
    ){
      changeDirection(0,-1)
    }

    if(
      event.code === 'ArrowDown'
    ){
      changeDirection(0,1)
    }

    if(
      event.code === 'ArrowLeft'
    ){
      changeDirection(-1,0)
    }

    if(
      event.code === 'ArrowRight'
    ){
      changeDirection(1,0)
    }

  }
)

reset()

requestAnimationFrame(loop)

</script>
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
                messageText: 'Snake 🐍'
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

handler.help = ['snake']
handler.tags = ['game']
handler.command = /^snake$/i

export default handler