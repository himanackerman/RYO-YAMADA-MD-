let handler = async (m, { conn, usedPrefix }) => {

  await conn.sendMessage(m.chat, {
    richResponse: [
      {
        text: 'totalfitur'
      },
      {
        text: 'status overview\n'
      },

      // 📊 Table menu utama
      {
        title: 'menu',
        table: [
          {
            isHeading: true,
            items: ['category', 'command']
          },
          {
            isHeading: false,
            items: ['info', `${usedPrefix}totalfitur`]
          },
          {
            isHeading: false,
            items: ['owner', `${usedPrefix}gp`]
          },
          {
            isHeading: false,
            items: ['group', 'ingatkan ... jam ...']
          }
        ]
      },

      // 💻 contoh penggunaan
      {
        text: '\nexample\n'
      },
      {
        language: 'javascript',
        code: [
          {
            highlightType: 0,
            codeContent: `${usedPrefix}totalfitur`
          },
          {
            highlightType: 0,
            codeContent: `${usedPrefix}gp menu`
          }
        ]
      },

      // ✨ closing
      {
        text: '\nclean interface • fast response'
      }
    ]
  }, { quoted: m })
}

handler.help = ['help']
handler.tags = ['main']
handler.command = /^help$/i

export default handler