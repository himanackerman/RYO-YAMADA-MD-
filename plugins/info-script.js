let handler = async (m, { conn }) => {
  await conn.sendMessage(m.chat, {
    image: { url: 'https://raw.githubusercontent.com/himanackerman/Image/main/1769664206535-179.jpeg' },
    caption:
      '✨ *Ryo Yamada MD* ✨\n\n' +
      'Open Source Project\n' +
      'Join Channel for Updates\n' +
      '⭐ Star the Repo\n\n',
      
    interactiveButtons: [
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '🌐 GitHub Repo',
          url: 'https://github.com/himanackerman/RYO-YAMADA-MD-',
          merchant_url: 'https://github.com/himanackerman/RYO-YAMADA-MD-'
        })
      },
      {
        name: 'cta_url',
        buttonParamsJson: JSON.stringify({
          display_text: '📢 Channel Updates',
          url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K',
          merchant_url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K'
        })
      }
    ],
    hasMediaAttachment: true
  })
}

handler.help = ['script', 'sc']
handler.tags = ['info']
handler.command = /^(script|sc)$/i
handler.limit = false

export default handler