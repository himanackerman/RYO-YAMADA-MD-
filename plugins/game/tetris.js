import crypto from 'crypto'

let handler = async (m, { conn }) => {
  const html = `
<style>
*{
  -webkit-tap-highlight-color:transparent;
  -webkit-user-select:none;
  user-select:none;
  box-sizing:border-box;
}
body{
  margin:0;
  background:#0a0a0f;
  font-family:'Segoe UI', Roboto, sans-serif;
  color:#eee;
  touch-action:none;
}
.wrap{
  width:100%;
  max-width:400px;
  margin:auto;
  padding:10px;
}
.box{
  background:#12131c;
  border:1px solid #222536;
  border-radius:16px;
  overflow:hidden;
  box-shadow:0 12px 40px rgba(0,0,0,.9);
}
.head{
  padding:12px 16px;
  border-bottom:1px solid #222536;
  display:flex;
  justify-content:space-between;
  align-items:center;
  background:#181a26;
}
.title{
  font-size:16px;
  font-weight:900;
  letter-spacing:1.5px;
  color:#00d2d3;
}
.scorebox{
  display:flex;
  gap:12px;
}
.score-item{
  text-align:right;
}
.score-label{
  font-size:8px;
  color:#a4b0be;
  font-weight:bold;
}
.score-val{
  font-size:14px;
  font-weight:bold;
  color:#f1c40f;
}
.content{
  padding:10px;
  display:flex;
  flex-direction:column;
  align-items:center;
  background:#0c0d14;
}
canvas{
  background:#050508;
  border:1px solid #222536;
  border-radius:8px;
  display:block;
}
.controls{
  display:grid;
  grid-template-columns:repeat(4, 1fr);
  gap:8px;
  width:100%;
  max-width:240px;
  margin-top:10px;
}
.btn{
  background:#222536;
  border:1px solid #343a40;
  border-radius:8px;
  color:#fff;
  font-size:18px;
  font-weight:bold;
  padding:12px 0;
  text-align:center;
  cursor:pointer;
}
.btn:active{
  background:#00d2d3;
  color:#000;
}
#status{
  margin-top:6px;
  font-size:11px;
  color:#a4b0be;
}
</style>

<body>
<div class="wrap">
  <div class="box">
    <div class="head">
      <div class="title">TETRIS 👾</div>
      <div class="scorebox">
        <div class="score-item">
          <div class="score-label">LINES</div>
          <div class="score-val" id="lines">0</div>
        </div>
        <div class="score-item">
          <div class="score-label">SCORE</div>
          <div class="score-val" id="score">0</div>
        </div>
      </div>
    </div>
    <div class="content">
      <canvas id="game" width="240" height="400"></canvas>
      <div class="controls">
        <div class="btn" id="left">◀</div>
        <div class="btn" id="rotate">↻</div>
        <div class="btn" id="right">▶</div>
        <div class="btn" id="down">▼</div>
      </div>
      <div id="status">Tekan layar game jika Game Over</div>
    </div>
  </div>
</div>

<script>
var canvas = document.getElementById('game')
var ctx = canvas.getContext('2d')
var scoreEl = document.getElementById('score')
var linesEl = document.getElementById('lines')

var COLS = 10, ROWS = 20, BLOCK = 20
var board = [], score = 0, lines = 0, gameOver = false
var dropCounter = 0, lastTime = 0

var SHAPES = [
  [[1,1,1,1]],
  [[1,0,0],[1,1,1]],
  [[0,0,1],[1,1,1]],
  [[1,1],[1,1]],
  [[0,1,1],[1,1,0]],
  [[0,1,0],[1,1,1]],
  [[1,1,0],[0,1,1]]
]
var COLORS = ['#00d2d3','#54a0ff','#ff9f43','#feca57','#1dd1a1','#5f27cd','#ff6b6b']

var piece = null

function reset() {
  board = Array.from({length: ROWS}, function() { return Array(COLS).fill(0) })
  score = 0
  lines = 0
  gameOver = false
  updateScore()
  spawnPiece()
}

function spawnPiece() {
  var id = Math.floor(Math.random() * SHAPES.length)
  var shape = SHAPES[id]
  piece = {
    shape: shape,
    color: COLORS[id],
    x: Math.floor(COLS / 2) - Math.ceil(shape[0].length / 2),
    y: 0
  }
  if (collide(piece.x, piece.y, piece.shape)) {
    gameOver = true
  }
}

function collide(px, py, shape) {
  for (var r = 0; r < shape.length; r++) {
    for (var c = 0; c < shape[r].length; c++) {
      if (shape[r][c]) {
        var nx = px + c
        var ny = py + r
        if (nx < 0 || nx >= COLS || ny >= ROWS) return true
        if (ny >= 0 && board[ny][nx]) return true
      }
    }
  }
  return false
}

function merge() {
  for (var r = 0; r < piece.shape.length; r++) {
    for (var c = 0; c < piece.shape[r].length; c++) {
      if (piece.shape[r][c]) {
        board[piece.y + r][piece.x + c] = piece.color
      }
    }
  }
}

function rotateMatrix(matrix) {
  return matrix[0].map(function(_, i) {
    return matrix.map(function(row) { return row[i] }).reverse()
  })
}

function playerRotate() {
  if (gameOver) return
  var rotated = rotateMatrix(piece.shape)
  var prevX = piece.x
  var offset = 1
  while (collide(piece.x, piece.y, rotated)) {
    piece.x += offset
    offset = -(offset + (offset > 0 ? 1 : -1))
    if (offset > piece.shape[0].length) {
      piece.x = prevX
      return
    }
  }
  piece.shape = rotated
}

function drop() {
  if (gameOver) return
  if (!collide(piece.x, piece.y + 1, piece.shape)) {
    piece.y++
  } else {
    merge()
    clearLines()
    spawnPiece()
  }
  dropCounter = 0
}

function move(dir) {
  if (gameOver) return
  if (!collide(piece.x + dir, piece.y, piece.shape)) {
    piece.x += dir
  }
}

function clearLines() {
  var cleared = 0
  for (var r = ROWS - 1; r >= 0; r--) {
    if (board[r].every(function(val) { return val !== 0 })) {
      board.splice(r, 1)
      board.unshift(Array(COLS).fill(0))
      cleared++
      r++
    }
  }
  if (cleared > 0) {
    lines += cleared
    score += cleared === 1 ? 40 : cleared === 2 ? 100 : cleared === 3 ? 300 : 1200
    updateScore()
  }
}

function updateScore() {
  scoreEl.textContent = score
  linesEl.textContent = lines
}

function drawBlock(x, y, color) {
  ctx.fillStyle = color
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK - 1, BLOCK - 1)
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  for (var r = 0; r < ROWS; r++) {
    for (var c = 0; c < COLS; c++) {
      if (board[r][c]) drawBlock(c, r, board[r][c])
    }
  }

  if (piece && !gameOver) {
    for (var r = 0; r < piece.shape.length; r++) {
      for (var c = 0; c < piece.shape[r].length; c++) {
        if (piece.shape[r][c]) {
          drawBlock(piece.x + c, piece.y + r, piece.color)
        }
      }
    }
  }

  if (gameOver) {
    ctx.fillStyle = 'rgba(5, 5, 10, 0.85)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#ff6b6b'
    ctx.font = 'bold 20px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 10)
    ctx.fillStyle = '#fff'
    ctx.font = '12px Arial'
    ctx.fillText('Tap layar untuk restart', canvas.width / 2, canvas.height / 2 + 15)
    ctx.textAlign = 'start'
  }
}

function loop(time) {
  time = time || 0
  var dt = time - lastTime
  lastTime = time

  dropCounter += dt
  if (dropCounter > 600) {
    drop()
  }

  draw()
  requestAnimationFrame(loop)
}

document.getElementById('left').onclick = function() { move(-1) }
document.getElementById('right').onclick = function() { move(1) }
document.getElementById('rotate').onclick = function() { playerRotate() }
document.getElementById('down').onclick = function() { drop() }

canvas.onclick = function() {
  if (gameOver) reset()
}

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
                messageText: 'TETRIS 👾'
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

handler.help = ['tetris']
handler.tags = ['game']
handler.command = /^(tetris)$/i

export default handler