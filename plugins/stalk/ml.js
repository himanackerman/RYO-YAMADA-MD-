import fetch from 'node-fetch'
import axios from 'axios'

const REGION_MAP = {
  "1": "Indonesia", "2": "Indonesia", "3": "Indonesia", "4": "Indonesia",
  "5": "Indonesia", "6": "Indonesia", "7": "Indonesia", "8": "Indonesia", "9": "Indonesia",
  "10": "Malaysia / SG / BN", "11": "Philippines", "12": "Thailand",
  "13": "Vietnam", "14": "Cambodia", "15": "Myanmar", "16": "Laos",
  "17": "Timor-Leste", "19": "Middle East", "20": "North America",
  "21": "Europe", "22": "South America"
}

function getRegion(sid) {
  const s = String(sid)
  return REGION_MAP[s.slice(0, 2)] ?? REGION_MAP[s.slice(0, 1)] ?? "Unknown"
}

async function stalkML(userId, serverId) {
  let status = "failed"
  let code = 404
  let username = null

  // 1. Coba via api.isan.eu.org
  try {
    const res = await fetch(
      `https://api.isan.eu.org/nickname/ml?id=${userId}&server=${serverId}`,
      {
        headers: { "User-Agent": "StalkML/1.0", "Accept": "application/json" },
        timeout: 10000
      }
    )
    if (res.ok) {
      const json = await res.json()
      if (json && json.success && json.name) {
        status = "success"
        code = 200
        username = json.name
      }
    }
  } catch (e) {
    // lanjut ke fallback
  }

  // 2. Fallback via api.mobapay.com jika isan gagal
  if (!username) {
    try {
      const { data } = await axios.get(
        "https://api.mobapay.com/api/app_shop",
        {
          headers: {
            "content-type": "application/json",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          },
          params: {
            app_id: 100000,
            game_user_key: userId,
            game_server_key: serverId,
            country: "ID",
            language: "en",
            shop_id: 1001
          },
          timeout: 15000
        }
      )
      const userInfo = data?.data?.user_info
      if (userInfo && userInfo.user_name && userInfo.user_name.trim()) {
        status = "success"
        code = 200
        username = userInfo.user_name
      }
    } catch (e) {
      // fallback error
    }
  }

  return {
    status,
    code,
    data: {
      id: userId,
      server: serverId,
      username: username ?? "Not Found",
      region: getRegion(serverId)
    }
  }
}

const handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    return conn.reply(m.chat, `*\`Mobile Legends Stalker\`*\n\n✿ Info : Masukkan User ID dan Server ID\n✿ Format : ${usedPrefix + command} <userId> <serverId>\n✿ Contoh : *${usedPrefix + command} 84444577 2166*`, m)
  }

  const parts = text.trim().split(/\s+/)
  const userId = parts[0]
  const serverId = parts[1]

  if (!userId || !serverId) {
    return conn.reply(m.chat, `*\`Mobile Legends Stalker\`*\n\n✿ Info : Masukkan User ID dan Server ID\n✿ Format : ${usedPrefix + command} <userId> <serverId>\n✿ Contoh : *${usedPrefix + command} 84444577 2166*`, m)
  }

  try {
    await m.react('🔍')

    const result = await stalkML(userId, serverId)

    if (result.code === 200) {
      const caption = `*\`Mobile Legends Stalker\`*

✿ Username : ${result.data.username}
✿ User ID : ${result.data.id}
✿ Server : ${result.data.server}
✿ Region : ${result.data.region}
✿ Status : Ditemukan`

      await conn.reply(m.chat, caption, m)
      await m.react('✅')
    } else if (result.code === 404) {
      await conn.reply(m.chat, `*\`Mobile Legends Stalker\`*\n\n✿ Status : Akun tidak ditemukan\n✿ Catatan : Pastikan User ID dan Server ID sudah benar.`, m)
      await m.react('❌')
    } else {
      await conn.reply(m.chat, '❌ Terjadi kesalahan saat mengambil data.', m)
      await m.react('❌')
    }
  } catch (error) {
    console.error(error)
    await conn.reply(m.chat, '❌ Terjadi kesalahan saat mengambil data Mobile Legends.', m)
    await m.react('❌')
  }
}

handler.help = ['stalkml <userId> <serverId>', 'mlstalk <userId> <serverId>']
handler.tags = ['stalk']
handler.command = /^(stalkml|mlstalk)$/i
handler.limit = true
handler.register = true

export default handler
