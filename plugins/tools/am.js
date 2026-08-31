// plugins/ampremv2 new
/*
  Create: t.me/AwasPhpJir
  RestApis: api.ikyyxd.my.id

  API:
  https://am.yappi.my.id

  Note:
  Alight Motion Magic Link
  sumber scrape : https://whatsapp.com/channel/0029Vb8hiKd0gcfQDpEDdf2n/387
*/

import axios from 'axios'

const BASE_URL = 'https://am.yappi.my.id'

const COOKIE_API = `${BASE_URL}/api/cookie`
const SEND_API = `${BASE_URL}/api/send`
const VERIFY_API = `${BASE_URL}/api/verify`

const USER_AGENT =
  'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Mobile Safari/537.36'

let GLOBAL_COOKIE = ''

// ========================================
// GET COOKIE
// ========================================
async function getCookie() {
  try {
    const res = await axios.get(COOKIE_API, {
      timeout: 15000,
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': '*/*'
      }
    })

    if (res.data?.ok && res.data?.cookie) {
      GLOBAL_COOKIE = res.data.cookie
      return GLOBAL_COOKIE
    }

    throw new Error(
      res.data?.error ||
      'Gagal mendapatkan session cookie'
    )
  } catch (e) {
    throw new Error(
      e.response?.data?.error ||
      e.message ||
      'Cookie API Error'
    )
  }
}

// ========================================
// SEND MAGIC LINK
// ========================================
async function sendMagicLink(email, cookie) {
  try {
    const res = await axios.post(
      SEND_API,
      {
        email,
        cookie
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
          'Referer': `${BASE_URL}/`,
          'User-Agent': USER_AGENT,
          'Accept': '*/*'
        }
      }
    )

    if (res.data?.ok) {
      return {
        success: true,
        data: res.data
      }
    }

    return {
      success: false,
      error:
        res.data?.error ||
        res.data?.message ||
        'Gagal mengirim Magic Link'
    }
  } catch (e) {
    return {
      success: false,
      error:
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        'Send API Error'
    }
  }
}

// ========================================
// VERIFY MAGIC LINK
// ========================================
async function verifyMagicLink(email, link, cookie) {
  try {
    const res = await axios.post(
      VERIFY_API,
      {
        email,
        link,
        cookie
      },
      {
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
          'Origin': BASE_URL,
          'Referer': `${BASE_URL}/`,
          'User-Agent': USER_AGENT,
          'Accept': '*/*'
        }
      }
    )

    if (res.data?.ok) {
      return {
        success: true,
        data: res.data
      }
    }

    return {
      success: false,
      error:
        res.data?.error ||
        res.data?.message ||
        'Verifikasi gagal'
    }
  } catch (e) {
    return {
      success: false,
      error:
        e.response?.data?.error ||
        e.response?.data?.message ||
        e.message ||
        'Verify API Error'
    }
  }
}

// ========================================
// EXPORT SEND
// ========================================
export async function sendAMMagicLink(email) {
  try {
    const cookie = await getCookie()

    return await sendMagicLink(
      email,
      cookie
    )
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}

// ========================================
// EXPORT VERIFY
// ========================================
export async function verifyAMMagicLink(
  email,
  link
) {
  try {
    const cookie =
      GLOBAL_COOKIE ||
      await getCookie()

    return await verifyMagicLink(
      email,
      link,
      cookie
    )
  } catch (e) {
    return {
      success: false,
      error: e.message
    }
  }
}

// ========================================
// HANDLER
// ========================================
const handler = async (
  m,
  {
    conn,
    text
  }
) => {

  if (!text) {
    throw `
📌 *Alight Motion Premium Activator*

*Cara kirim Magic Link:*

.amprem email@gmail.com

*Cara verifikasi:*

.amprem email@gmail.com|https://link

*Contoh:*

.amprem user@gmail.com

Kemudian cek email dan copy Magic Link.

Setelah itu:

.amprem user@gmail.com|https://magic-link
`.trim()
  }

  let email = text.trim()
  let link = null

  // ========================================
  // PARSE EMAIL | LINK
  // ========================================
  if (text.includes('|')) {

    const split = text
      .split('|')
      .map(v => v.trim())

    email = split[0]

    link =
      split
        .slice(1)
        .join('|')
        .trim() ||
      null
  }

  // ========================================
  // VALIDATE EMAIL
  // ========================================
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return m.reply(
      `❌ *Format email tidak valid!*\n\n` +
      `Contoh:\n` +
      `.amprem email@gmail.com`
    )
  }

  // ========================================
  // LOADING
  // ========================================
  await conn.sendMessage(
    m.chat,
    {
      text: '⏳ Memproses...'
    },
    {
      quoted: m
    }
  )

  // ========================================
  // SEND MAGIC LINK
  // ========================================
  if (!link) {

    const result =
      await sendAMMagicLink(email)

    if (!result.success) {
      return m.reply(
        `❌ *Gagal*\n\n` +
        `${result.error}`
      )
    }

    return m.reply(
      `✅ *Magic Link Berhasil Dikirim!*\n\n` +
      `📧 *Email:* ${email}\n` +
      `📬 *Status:* Link verifikasi sudah dikirim\n\n` +

      `📌 *Langkah selanjutnya:*\n` +
      `1. Cek inbox email\n` +
      `2. Cek folder Spam jika tidak ada\n` +
      `3. Cari email verifikasi Alight Motion\n` +
      `4. Copy link Magic Link dari email\n\n` +

      `📎 *Format verifikasi:*\n` +
      `.amprem ${email}|LINK_YANG_DISALIN`
    )
  }

  // ========================================
  // VERIFY MAGIC LINK
  // ========================================
  const result =
    await verifyAMMagicLink(
      email,
      link
    )

  if (!result.success) {
    return m.reply(
      `❌ *Gagal Verifikasi!*\n\n` +
      `${result.error}`
    )
  }

  // ========================================
  // AMBIL DATA USER
  // ========================================
  const response =
    result.data || {}

  const userInfo =
    response?.data?.user ||
    response?.user ||
    response?.data ||
    {}

  const uid =
    userInfo?.localId ||
    response?.data?.localId ||
    response?.localId ||
    '-'

  const emailVerified =
    userInfo?.emailVerified === true

  const emailStatus =
    emailVerified
      ? 'Terverifikasi'
      : 'Belum Terverifikasi'

  // ========================================
  // CREATED DATE
  // ========================================
  let createdDate = '-'

  if (userInfo?.createdAt) {

    const timestamp =
      Number(userInfo.createdAt)

    if (!isNaN(timestamp)) {

      createdDate =
        new Date(timestamp)
          .toLocaleDateString(
            'id-ID',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }
          )
    }
  }

  // ========================================
  // LAST LOGIN
  // ========================================
  let lastLogin = '-'

  if (userInfo?.lastLoginAt) {

    const timestamp =
      Number(userInfo.lastLoginAt)

    if (!isNaN(timestamp)) {

      lastLogin =
        new Date(timestamp)
          .toLocaleDateString(
            'id-ID',
            {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }
          )
    }
  }

  // ========================================
  // SUCCESS RESPONSE
  // ========================================
  let textResult =
    `✅ *AKUN AM BERHASIL DIVERIFIKASI!*\n\n`

  textResult +=
    `📧 *Email:* ${email}\n`

  textResult +=
    `🆔 *UID:* ${uid}\n`

  textResult +=
    `✉️ *Email Status:* ${emailStatus}\n`

  textResult +=
    `📅 *Dibuat:* ${createdDate}\n`

  textResult +=
    `🕐 *Login Terakhir:* ${lastLogin}\n\n`

  textResult +=
    `🎉 *Verification berhasil!*`

  return m.reply(textResult)
}

// ========================================
// HANDLER CONFIG
// ========================================
handler.help = [
  'amprem <email>',
  'amprem <email>|<link>'
]

handler.tags = [
  'tools'
]

handler.command = [
  'amv2',
  'ampremium'
]

handler.premium = true

export default handler