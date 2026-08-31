global.albumCache = global.albumCache || new Map()

const pendingAlbums = new Map()
const ALBUM_TIMEOUT = 15000
const CACHE_TTL = 10 * 60 * 1000

function closeAlbum(chat) {
  const pending = pendingAlbums.get(chat)
  if (!pending) return

  clearTimeout(pending.timer)
  pendingAlbums.delete(chat)

  setTimeout(() => {
    for (const id of pending.ids) {
      global.albumCache.delete(id)
    }
  }, CACHE_TTL)
}

export function trackAlbum(m) {
  if (!m?.key?.id || !m?.chat) return

  if (m.mtype === 'albumMessage') {
    const content = m.message?.albumMessage

    const expected =
      (content?.expectedImageCount || 0) +
      (content?.expectedVideoCount || 0)

    if (expected < 2) return

    const entry = {
      messages: []
    }

    const ids = new Set([m.key.id])

    global.albumCache.set(m.key.id, entry)

    const timer = setTimeout(() => {
      closeAlbum(m.chat)
    }, ALBUM_TIMEOUT)

    pendingAlbums.set(m.chat, {
      expected,
      entry,
      ids,
      timer
    })

    return
  }

  if (m.mtype !== 'imageMessage' && m.mtype !== 'videoMessage') return

  const pending = pendingAlbums.get(m.chat)
  if (!pending) return

  pending.entry.messages.push(m)
  pending.ids.add(m.key.id)

  global.albumCache.set(m.key.id, pending.entry)

  clearTimeout(pending.timer)

  if (pending.entry.messages.length >= pending.expected) {
    closeAlbum(m.chat)
  } else {
    pending.timer = setTimeout(() => {
      closeAlbum(m.chat)
    }, ALBUM_TIMEOUT)
  }
}