import axios from 'axios'

const BASE_URL = 'https://am.kyzzz.xyz'
const GUERRILLA_BASE = 'https://api.guerrillamail.com/ajax.php'

export const MAX_BULK_ACCOUNTS = 5
const CONCURRENCY = 2

export async function createGuerrillaMail() {
    const { data } = await axios.get(`${GUERRILLA_BASE}?f=get_email_address`, { timeout: 15000 })
    const email = data?.email_addr
    const sid = data?.sid_token
    if (!email || !sid) throw new Error('Gagal membuat temporary email Guerrilla.')
    return { email, sid }
}

export async function waitMagicLinkGuerrilla(sid, timeoutSec = 50) {
    const maxTime = timeoutSec * 1000
    const start = Date.now()

    while (Date.now() - start < maxTime) {
        await new Promise((resolve) => setTimeout(resolve, 2500))

        const { data } = await axios.get(`${GUERRILLA_BASE}?f=check_email&seq=0&sid_token=${sid}`, { timeout: 15000 })
        const list = data?.list || []

        const amMsg = list.find((m) => {
            const subject = (m.mail_subject || '').toLowerCase()
            const from = (m.mail_from || '').toLowerCase()
            return subject.includes('alight') || subject.includes('sign in') || from.includes('firebase') || from.includes('alight')
        })

        if (amMsg) {
            const fetchMail = await axios.get(`${GUERRILLA_BASE}?f=fetch_email&email_id=${amMsg.mail_id}&sid_token=${sid}`, { timeout: 15000 })
            const body = fetchMail.data?.mail_body || ''
            const urls = body.match(/https?:\/\/[^\s"'<>]+/g) || []
            const magic = urls.find((u) => u.includes('oobCode') || u.includes('alight') || u.includes('apiKey') || u.includes('signInWithEmailLink'))
            if (magic) {
                return magic.replace(/&amp;/g, '&')
            }
        }
    }
    return null
}

export async function sendAmLink(email) {
    const { data } = await axios.post(
        `${BASE_URL}/api/send-link`,
        { email },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 20000
        }
    )
    return data
}

export async function verifyAmAccount(email, link) {
    const { data } = await axios.post(
        `${BASE_URL}/api/verify`,
        { email, link },
        {
            headers: { 'Content-Type': 'application/json' },
            timeout: 25000
        }
    )
    return data
}

export async function generateOneAccount() {
    const { email, sid } = await createGuerrillaMail()

    await sendAmLink(email)

    const magicLink = await waitMagicLinkGuerrilla(sid, 50)
    if (!magicLink) {
        throw new Error(`Timeout menunggu kode verifikasi (${email})`)
    }

    const verifData = await verifyAmAccount(email, magicLink)

    return {
        email,
        magicLink,
        orderId: verifData?.orderId || '-',
        uid: verifData?.uid || '-'
    }
}

export async function generateBulkAccounts(totalCount) {
    const count = Math.min(Math.max(parseInt(String(totalCount), 10) || 1, 1), MAX_BULK_ACCOUNTS)
    const queue = Array.from({ length: count }, (_, i) => i + 1)
    const successList = []
    const failedList = []

    async function worker() {
        while (queue.length > 0) {
            const idx = queue.shift()
            if (!idx) break
            try {
                const acc = await generateOneAccount()
                successList.push({ no: idx, ...acc })
            } catch (err) {
                failedList.push({ no: idx, error: err.message || String(err) })
            }
        }
    }

    const workers = Array.from({ length: Math.min(CONCURRENCY, count) }, () => worker())
    await Promise.all(workers)

    return { total: count, successList, failedList }
}

export async function fetchGuerrillaInbox(mailInput, maxMessages = 3) {
    const username = mailInput.includes('@') ? mailInput.split('@')[0] : mailInput

    const { data: initData } = await axios.get(`${GUERRILLA_BASE}?f=get_email_address`, { timeout: 15000 })
    const sid = initData?.sid_token
    if (!sid) throw new Error('Gagal inisialisasi sesi Guerrilla Mail.')

    await axios.get(`${GUERRILLA_BASE}?f=set_email_user&email_user=${encodeURIComponent(username)}&sid_token=${sid}`, { timeout: 15000 })

    const { data: chkData } = await axios.get(`${GUERRILLA_BASE}?f=check_email&seq=0&sid_token=${sid}`, { timeout: 15000 })
    const list = (chkData?.list || []).filter((item) => String(item.mail_id) !== '1')

    const messages = []

    for (let i = 0; i < Math.min(list.length, maxMessages); i++) {
        const msg = list[i]
        const { data: mailDetail } = await axios.get(`${GUERRILLA_BASE}?f=fetch_email&email_id=${msg.mail_id}&sid_token=${sid}`, { timeout: 15000 })
        const body = mailDetail?.mail_body || msg.mail_excerpt || ''

        const urls = body.match(/https?:\/\/[^\s"'<>]+/g) || []
        const magicLink = urls.find((u) => u.includes('oobCode') || u.includes('alight') || u.includes('apiKey') || u.includes('signInWithEmailLink'))
        const cleanMagic = magicLink ? magicLink.replace(/&amp;/g, '&') : null

        const snippet = (mailDetail?.mail_excerpt || body.replace(/<[^>]+>/g, '').trim()).slice(0, 150)

        messages.push({
            id: String(msg.mail_id),
            from: msg.mail_from || '-',
            subject: msg.mail_subject || '-',
            date: msg.mail_date || '-',
            magicLink: cleanMagic,
            snippet
        })
    }

    return {
        email: mailInput,
        total: list.length,
        messages
    }
}
