let handler = async (m, { conn }) => {
  const rich = new AIRich(conn)
    .addText(
      `Hai kak!

❏ *Ryo Yamada MD* kini tersedia di channel resmi.

Silakan klik tombol *Channel* untuk mengakses script.`,
      { id: 'intro' }
    )
    .addReels({
      profile: 'https://raw.githubusercontent.com/himanackerman/Image/refs/heads/main/1769664206535-179.jpeg',
      username: 'ryoyamada',
      thumbnail: 'https://raw.githubusercontent.com/himanackerman/Image/main/1768265694471-117.jpeg',
      url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K',
      verified: true
    })
    .addFooterAction(
      {
        text: 'Channel',
        url: 'https://whatsapp.com/channel/0029VbAYjQgKrWQulDTYcg2K'
      },
      {
        id: 'footer1'
      }
    )
    .setFooter('Ryo Yamada MD')

  await rich.send(m.chat, { quoted: m })
}

handler.help = ['sc', 'script']
handler.tags = ['info']
handler.command = /^(sc|script)$/i

export default handler