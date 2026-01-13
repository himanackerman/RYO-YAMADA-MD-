/*
Roblox Top Playing Now
Type : Plugins ESM 
Sumber Scrape : https://whatsapp.com/channel/0029Vb5EZCjIiRotHCI1213L/406
*/
import sharp from "sharp"

let handler = async (m, { conn }) => {
  try {
    async function hit(hitDescription, url, options, returnType = "text") {
      try {
        const response = await fetch(url, options)
        if (!response.ok) throw Error(`${response.status} ${response.statusText} ${(await response.text() || `(respond body kosong)`).substring(0, 100)}...`)
        if (returnType === "text") {
          const data = await response.text()
          return { data, response }
        } else if (returnType === "json") {
          const data = await response.json()
          return { data, response }
        } else if (returnType === "buffer") {
          const ab = await response.arrayBuffer()
          const data = Buffer.from(ab)
          return { data, response }
        } else {
          throw Error(`invalid param return type. pilih text/json/buffer`)
        }
      } catch (error) {
        throw Error(`gagal hit. ${hitDescription}.\n${error.message}`)
      }
    }

    async function getGameList(sortId = "top-playing-now") {
      const validSortId = ["top-playing-now"]
      if (!validSortId.includes(sortId)) throw Error(`invalid sortId. sortId tersedia: ${validSortId.join(", ")}`)
      const api1 = new URL(`https://apis.roblox.com/explore-api/v1/get-sort-content`)
      api1.search = new URLSearchParams({
        sessionId: "17996246-1290-440d-b789-d49484115b9a",
        sortId,
        cpuCores: "8",
        maxResolution: "1920x1080",
        maxMemory: "8192",
        networkType: "4g"
      })
      const { data: json1 } = await hit(`top playing now`, api1, { method: 'get' }, 'json')
      const gameList = json1?.games?.slice(0, 10)
      if (!gameList?.length) throw Error(`lah gamelist nya kosong`)

      const payload = gameList.map(v => ({
        type: "GameIcon",
        targetId: v.universeId,
        format: "webp",
        size: "256x256",
      }))
      const body = JSON.stringify(payload)
      const api2 = 'https://thumbnails.roblox.com/v1/batch'
      const { data: json2 } = await hit(`batch download thumbnail`, api2, { body, method: 'post', headers: { 'Content-Type': 'application/json' } }, 'json')
      const thumbnailList = json2.data
      return gameList.map((v, i) => ({ ...v, ...thumbnailList[i] }))
    }

    function customMappingNumber(input) {
      const char = ['𝟢', '𝟣', '𝟤', '𝟥', '𝟦', '𝟧', '𝟨', '𝟩', '𝟪', '𝟫']
      return input.split("").map(v => isNaN(v) ? v : char[v]).join("")
    }

    async function combineThumbnails(gameListObject) {
      const imageFetchs = gameListObject.map(v => hit(`download gambar ${v.name}`, v.imageUrl, {}, 'buffer'))
      const imageResults = await Promise.all(imageFetchs)
      const imageBuffers = imageResults.map(v => v.data)

      const imageBuffer = await sharp(imageBuffers, {
        join: {
          across: 5,
          shim: 10,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
        .extend({
          top: 20,
          bottom: 20,
          left: 20,
          right: 20,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        })
        .png()
        .toBuffer()
      return imageBuffer
    }

    function makeCaption(gameListObject) {
      const hider = `Top 10 Playing Now Games on Roblox\n\n`
      const top10 = gameListObject.map((v, i) => {
        return `${i + 1} | ${v.name}\n` +
          `👥 player count ${customMappingNumber(v.playerCount.toLocaleString("id-ID"))}\n` +
          `👍 likes ${customMappingNumber(((v.totalUpVotes / (v.totalUpVotes + v.totalDownVotes)) * 100).toFixed())}%\n` +
          `🎮 play now https://www.roblox.com/games/${v.rootPlaceId}`
      }).join("\n\n")
      return hider + top10
    }

    const gameListObject = await getGameList()
    const imageBuffer = await combineThumbnails(gameListObject)
    const caption = makeCaption(gameListObject)

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption,
    }, { quoted: m })

  } catch (e) {
    conn.reply(m.chat, `Error: ${e.message}`, m)
  }
}

handler.help = ['toproblox']
handler.tags = ['game', 'internet']
handler.command = /^toproblox$/i
handler.limit = false

export default handler