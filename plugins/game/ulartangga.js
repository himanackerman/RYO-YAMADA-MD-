import axios from 'axios'
import { getImageProcessingLibrary } from 'baileys'

class GameSession {
  constructor(id, conn) {
    this.id = id
    this.conn = conn
    this.game = new SnakeAndLadderGame(conn)
  }
}

class SnakeAndLadderGame {
  constructor(conn) {
    this.conn = conn
    this.players = []
    this.boardSize = 100
    this.currentPositions = {}
    this.currentPlayerIndex = 0
    this.started = false
    this.keyId = null

    this.snakesAndLadders = [
      { start: 29, end: 7 }, { start: 24, end: 12 },
      { start: 15, end: 37 }, { start: 23, end: 41 },
      { start: 72, end: 36 }, { start: 49, end: 86 },
      { start: 90, end: 56 }, { start: 75, end: 64 },
      { start: 74, end: 95 }, { start: 91, end: 72 },
      { start: 97, end: 78 }
    ]

    this.bgImageUrl = 'https://i.pinimg.com/originals/2f/68/a7/2f68a7e1eee18556b055418f7305b3c0.jpg'
    this.player1ImageUrl = 'https://i.pinimg.com/originals/75/33/22/7533227c53f6c270a96d364b595d6dd5.jpg'
    this.player2ImageUrl = 'https://i.pinimg.com/originals/be/68/13/be6813a6086681070b0f886d33ca4df9.jpg'

    this.bgImage = null
    this.player1Image = null
    this.player2Image = null

    this.cellWidth = 40
    this.cellHeight = 40
  }

  initializeGame() {
    for (let p of this.players) {
      this.currentPositions[p] = 1
    }
    this.currentPlayerIndex = 0
    this.started = true
  }

  rollDice() {
    return Math.floor(Math.random() * 6) + 1
  }

  async fetchImage(url) {
    const res = await axios.get(url, { responseType: 'arraybuffer' })
    return Buffer.from(res.data)
  }

  async prepareAssets() {
    if (!this.bgImage) this.bgImage = await this.fetchImage(this.bgImageUrl)
    if (!this.player1Image) this.player1Image = await this.fetchImage(this.player1ImageUrl)
    if (!this.player2Image) this.player2Image = await this.fetchImage(this.player2ImageUrl)
  }

  async getBoardBuffer() {
    const lib = await getImageProcessingLibrary()

    if (lib.sharp?.default) {
      let img = lib.sharp.default(this.bgImage).resize(420, 420)

      for (let player of this.players) {
        let pos = this.currentPositions[player]
        let playerImg = player === this.players[0] ? this.player1Image : this.player2Image

        let x = ((pos - 1) % 10) * this.cellWidth + 10
        let y = (9 - Math.floor((pos - 1) / 10)) * this.cellHeight + 10

        let resized = await lib.sharp.default(playerImg)
          .resize(this.cellWidth, this.cellHeight)
          .png()
          .toBuffer()

        img = img.composite([{ input: resized, left: x, top: y }])
      }

      return await img.png().toBuffer()
    }

    return this.bgImage
  }

  async startGame(m) {
    await this.prepareAssets()

    this.initializeGame()

    await m.reply(
      `🐍🎲 *Ular Tangga Dimulai!*\n\n@${this.players[0].split('@')[0]} vs @${this.players[1].split('@')[0]}`,
      null,
      { mentions: this.players }
    )

    let board = await this.getBoardBuffer()
    let { key } = await this.conn.sendMessage(m.chat, { image: board }, { quoted: m })
    this.keyId = key
  }

  async movePlayer(player, steps, m) {
    let newPos = this.currentPositions[player] + steps

    for (let other of this.players) {
      if (other !== player && this.currentPositions[other] === newPos) {
        newPos = 1
        await m.reply(`😱 @${player.split('@')[0]} diinjak! balik ke awal!`, null, { mentions: [player] })
      }
    }

    let snake = this.snakesAndLadders.find(s => s.start === newPos)
    if (snake) {
      let type = snake.end < snake.start ? 'ular 🐍' : 'tangga 🪜'
      await m.reply(`✨ Kena ${type}! pindah ke ${snake.end}`)
      newPos = snake.end
    }

    this.currentPositions[player] = Math.min(newPos, this.boardSize)
  }

  switchPlayer() {
    this.currentPlayerIndex = 1 - this.currentPlayerIndex
  }

  async playTurn(m, player) {
    let dice = this.rollDice()

    await m.reply(`🎲 @${player.split('@')[0]} roll: *${dice}*`, null, { mentions: [player] })

    await this.movePlayer(player, dice, m)

    if (this.currentPositions[player] >= this.boardSize) {
      await m.reply(`🎉 @${player.split('@')[0]} MENANG!`, null, { mentions: [player] })
      this.reset()
      return
    }

    if (dice !== 6) this.switchPlayer()
    else await m.reply('🎲 Dapat 6! jalan lagi!')

    let board = await this.getBoardBuffer()

    if (this.keyId) {
      await this.conn.sendMessage(m.chat, { delete: this.keyId })
    }

    let { key } = await this.conn.sendMessage(m.chat, { image: board }, { quoted: m })
    this.keyId = key
  }

  addPlayer(p) {
    if (this.players.length < 2 && !this.players.includes(p)) {
      this.players.push(p)
      return true
    }
    return false
  }

  reset() {
    this.players = []
    this.currentPositions = {}
    this.started = false
  }
}

let handler = async (m, { args, conn, usedPrefix, command }) => {
  conn.ulartangga = conn.ulartangga || {}
  let session = conn.ulartangga[m.chat] || (conn.ulartangga[m.chat] = new GameSession(m.chat, conn))
  let game = session.game

  switch (args[0]) {
    case 'join':
      if (game.started) return m.reply('Game sudah mulai!')
      if (game.addPlayer(m.sender)) {
        m.reply(`✅ @${m.sender.split('@')[0]} join`, null, { mentions: [m.sender] })
      } else {
        m.reply('Room penuh / sudah join')
      }
      break

    case 'start':
      if (game.players.length < 2) return m.reply('Butuh 2 player')
      await game.startGame(m)
      break

    case 'roll':
      if (!game.started) return m.reply('Game belum mulai')
      let current = game.players[game.currentPlayerIndex]
      if (m.sender !== current) {
        return m.reply(`Giliran @${current.split('@')[0]}`, null, { mentions: [current] })
      }
      await game.playTurn(m, current)
      break

    case 'reset':
      game.reset()
      delete conn.ulartangga[m.chat]
      m.reply('Game direset')
      break

    default:
      m.reply(`Gunakan:
${usedPrefix + command} join
${usedPrefix + command} start
${usedPrefix + command} roll
${usedPrefix + command} reset`)
  }
}

handler.help = ['ulartangga']
handler.tags = ['game']
handler.command = /^(ular(tangga)?|snake)$/i
handler.limit = false

export default handler