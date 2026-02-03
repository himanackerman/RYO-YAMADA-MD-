import cheerio from 'cheerio'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  conn.xnxx = conn.xnxx ? conn.xnxx : {}
  if (!text) throw `• *Example:* ${usedPrefix + command} genshin impact`
  conn.sendMessage(m.chat, { react: { text: '🕒', key: m.key }})
  const video = await xnxxsearch(text)
  let responseText = 'Xnxx - Search\n\n'
    video.result.forEach((track, index) => {
        responseText += `*${index + 1}.* ${track.title}\n\n`
    })
  const key = await conn.reply(m.chat, responseText, m)
  await conn.reply(m.chat, `Ketik salah satu angka *1 - ${video.result.length}* untuk mengunduh video`, key)
  conn.xnxx[m.sender] = video.result
}

handler.before = async (m, { conn }) => {
  conn.xnxx = conn.xnxx ? conn.xnxx : {}
  if (!m.text) return
  if (isNaN(m.text)) return
  if (!conn.xnxx[m.sender]) return
  const video = conn.xnxx[m.sender][m.text - 1].link
  const hasil = await xnxxdownload(video)
  conn.sendFile(m.chat, hasil.files.high, null, '```Result from:```'+' `'+hasil.title+'`', m)
  delete conn.xnxx[m.sender]
}

handler.help = ["xnxx *<text>*"]
handler.tags = ["premium"]
handler.command = ["xnxx"]
handler.premium = true

export default handler

async function xnxxsearch(t) {
    return new Promise((n, e) => {
      const r = "https://www.xnxx.com"
      fetch(`${r}/search/${t}/${Math.floor(3 * Math.random()) + 1}`, {
        method: "get",
      })
        .then((t) => t.text())
        .then((t) => {
          let e = cheerio.load(t, {
              xmlMode: !1,
            }),
            o = [],
            a = [],
            i = [],
            s = []
          e("div.mozaique").each(function (t, n) {
            e(n)
              .find("div.thumb")
              .each(function (t, n) {
                a.push(
                  r + e(n).find("a").attr("href").replace("/THUMBNUM/", "/"),
                )
              })
          }),
            e("div.mozaique").each(function (t, n) {
              e(n)
                .find("div.thumb-under")
                .each(function (t, n) {
                  i.push(e(n).find("p.metadata").text()),
                    e(n)
                      .find("a")
                      .each(function (t, n) {
                        o.push(e(n).attr("title"))
                      })
                })
            })
          for (let t = 0; t < o.length; t++)
            s.push({
              title: o[t],
              info: i[t],
              link: a[t],
            })
          n({
            status: !0,
            result: s,
          })
        })
        .catch((t) =>
          e({
            status: !1,
            result: t,
          }),
        )
    })
}

async function xnxxdownload(t) {
    return new Promise((n, e) => {
      fetch(`${t}`, {
        method: "get",
      })
        .then((t) => t.text())
        .then((e) => {
          let r = cheerio.load(e, {
            xmlMode: !1,
          })
          const o = r('meta[property="og:title"]').attr("content"),
            a = r('meta[property="og:duration"]').attr("content"),
            i = r('meta[property="og:image"]').attr("content"),
            s = r('meta[property="og:video:type"]').attr("content"),
            c = r('meta[property="og:video:width"]').attr("content"),
            u = r('meta[property="og:video:height"]').attr("content"),
            f = r("span.metadata").text().trim(),
            l = r("#video-player-bg > script:nth-child(6)").html(),
            m = {
              low: (l.match("html5player.setVideoUrlLow\\('(.*?)'\\);") ||
                [])[1],
              high: l.match("html5player.setVideoUrlHigh\\('(.*?)'\\);")[1],
              HLS: l.match("html5player.setVideoHLS\\('(.*?)'\\);")[1],
              thumb: l.match("html5player.setThumbUrl\\('(.*?)'\\);")[1],
              thumb69: l.match("html5player.setThumbUrl169\\('(.*?)'\\);")[1],
              thumbSlide: l.match("html5player.setThumbSlide\\('(.*?)'\\);")[1],
              thumbSlideBig: l.match(
                "html5player.setThumbSlideBig\\('(.*?)'\\);",
              )[1],
            }
          n({
            status: !0,
            title: o,
            URL: t,
            duration: a,
            image: i,
            videoType: s,
            videoWidth: c,
            videoHeight: u,
            info: f,
            files: m,
          })
        })
        .catch((t) =>
          e({
            status: !1,
            result: t,
          }),
        )
    })
}