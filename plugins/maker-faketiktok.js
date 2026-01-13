import axios from 'axios'
import FormData from 'form-data'

const handler = async (m, { conn, text, command, prefix }) => {
  if (!text) {
    return conn.sendMessage(m.chat, {
      text: `*Fake TikTok Profile Generator*\n\n` +
            `Kirim perintah dengan format:\n` +
            `.faketiktok Nama|Username|Followers|Following|Likes|Bio|Verified(true/false)|isFollow(true/false)|dark/light\n\n` +
            `Contoh:\n` +
            `*${prefix + command}* zen 🪐|zen|4020030|12|789000|Beginner in coding, but I love it! Follow me for more coding tips and tricks.|true|true|dark`
    }, { quoted: m })
  }

  let [name, username, followers, following, likes, bio, verified = 'true', isFollow = 'true', dark = 'true'] = text.split('|')
  if (!name || !username || !followers || !following || !likes || !bio) {
    return m.reply('Format salah.\nCoba ikuti contoh:\nNama|Username|Followers|Following|Likes|Bio|Verified|isFollow|Theme')
  }

  let ppUrl = await conn.profilePictureUrl(m.sender, 'image').catch(() => 'https://telegra.ph/file/2f61d40b7cfb440f3cfa7.jpg')
  let apiUrl = `https://flowfalcon.dpdns.org/imagecreator/faketiktok?name=${encodeURIComponent(name)}&username=${encodeURIComponent(username)}&pp=${encodeURIComponent(ppUrl)}&verified=${verified}&followers=${followers}&following=${following}&likes=${likes}&bio=${encodeURIComponent(bio)}&dark=${dark}&isFollow=${isFollow}`

  try {
    let { data } = await axios.get(apiUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(data)
    const form = new FormData()
    form.append('reqtype', 'fileupload')
    form.append('userhash', '')
    form.append('fileToUpload', buffer, 'tiktokfake.jpg')

    const upload = await axios.post('https://catbox.moe/user/api.php', form, {
      headers: form.getHeaders()
    })

    if (!upload.data || !upload.data.includes('catbox')) {
      return m.reply('Gagal upload gambar.')
    }

    await conn.sendMessage(m.chat, {
      image: { url: upload.data },
      caption: '✅ Faketok berhasil dibuat!'
    }, { quoted: m })

  } catch (err) {
    console.error(err)
    return m.reply('❌ Terjadi kesalahan saat membuat gambar.')
  }
}

handler.help = ['faketiktok'].map(v => v + ' <nama|username|followers|following|likes|bio|verified|isFollow|theme>')
handler.tags = ['maker']
handler.command = /^faketiktok|tiktokfake$/i
handler.limit = true

export default handler