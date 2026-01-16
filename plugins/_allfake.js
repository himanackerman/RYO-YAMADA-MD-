let handler = m => m

handler.all = async function (m) {
  global.wm = 'Ryo Yamada MD'

  global.adReply = {
    contextInfo: {}
  }

  global.fake = {
    key: {
      fromMe: false,
      participant: '0@s.whatsapp.net',
      remoteJid: m.chat
    },
    message: {
      extendedTextMessage: {
        text: global.wm
      }
    }
  }

  return m
}

export default handler
