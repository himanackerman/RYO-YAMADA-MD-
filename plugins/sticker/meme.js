import fs from 'fs'
import path from 'path'
import os from 'os'
import { randomBytes } from 'crypto'
import { execFile } from 'child_process'
import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas'
import axios from 'axios'
import sharp from 'sharp'

const EMOJI_CACHE = path.join(process.cwd(), 'tmp', 'emoji-cache')
if (!fs.existsSync(EMOJI_CACHE)) fs.mkdirSync(EMOJI_CACHE, { recursive: true })

const FONT_PATH = path.join(process.cwd(), 'font', 'impact.ttf')
if (fs.existsSync(FONT_PATH)) GlobalFonts.registerFromPath(FONT_PATH, 'Impact')

function tmpFile(ext) {
	return path.join(os.tmpdir(), `smeme-${randomBytes(8).toString('hex')}.${ext}`)
}

function safeUnlink(...paths) {
	for (const p of paths) {
		try { fs.unlinkSync(p) } catch (_) {}
	}
}

function isAnimatedWebp(buffer) {
	if (!buffer || buffer.length < 16) return false
	if (buffer.toString('ascii', 0, 4) !== 'RIFF') return false
	if (buffer.toString('ascii', 8, 12) !== 'WEBP') return false
	return buffer.includes(Buffer.from('ANIM'))
}

async function sendNativeMemeSticker(conn, m, buffer, { isAnimated } = {}) {
	await conn.sendMessage(
		m.chat,
		{ sticker: buffer },
		{ quoted: m }
	)
}

function emojiToFilename(emoji) {
	return [...emoji]
		.map(char => char.codePointAt(0))
		.filter(codePoint => codePoint !== 0xfe0f)
		.map(codePoint => codePoint.toString(16))
		.join('-') + '.png'
}

async function getEmojiPath(emoji) {
	const fileName = emojiToFilename(emoji)
	const localPath = path.join(EMOJI_CACHE, fileName)

	if (fs.existsSync(localPath)) return localPath

	try {
		const response = await axios.get(
			`https://cdn.jsdelivr.net/npm/emoji-datasource-apple/img/apple/64/${fileName}`,
			{ responseType: 'arraybuffer', timeout: 5000 }
		)
		fs.writeFileSync(localPath, Buffer.from(response.data))
		return localPath
	} catch (_) {
		return null
	}
}

function toSegments(text) {
	const emojiRe = /\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu
	const parts = []
	let last = 0

	for (const match of text.matchAll(emojiRe)) {
		if (match.index > last) parts.push({ t: 'text', v: text.slice(last, match.index) })
		parts.push({ t: 'emoji', v: match[0] })
		last = match.index + match[0].length
	}

	if (last < text.length) parts.push({ t: 'text', v: text.slice(last) })

	return parts
}

function segWidth(ctx, seg, size) {
	return seg.t === 'text' ? ctx.measureText(seg.v).width : size * 1.15
}

async function drawMemeText(ctx, segments, isTop) {
	const emojiPathMap = {}

	await Promise.all(
		segments
			.filter(seg => seg.t === 'emoji')
			.map(async seg => {
				emojiPathMap[seg.v] = await getEmojiPath(seg.v)
			})
	)

	let fontSize = 55
	ctx.font = `bold ${fontSize}px Impact, Arial`
	let totalWidth = segments.reduce((sum, seg) => sum + segWidth(ctx, seg, fontSize), 0)

	while (totalWidth > 490 && fontSize > 20) {
		fontSize -= 2
		ctx.font = `bold ${fontSize}px Impact, Arial`
		totalWidth = segments.reduce((sum, seg) => sum + segWidth(ctx, seg, fontSize), 0)
	}

	let startX = (512 - totalWidth) / 2
	let yPos = isTop ? 25 : 512 - fontSize - 35

	for (const seg of segments) {
		if (seg.t === 'text') {
			ctx.fillStyle = 'white'
			ctx.strokeStyle = 'black'
			ctx.lineWidth = Math.max(3, fontSize / 10)
			ctx.strokeText(seg.v, startX, yPos)
			ctx.fillText(seg.v, startX, yPos)
			startX += ctx.measureText(seg.v).width
		} else {
			const emojiPath = emojiPathMap[seg.v]
			if (emojiPath && fs.existsSync(emojiPath)) {
				try {
					const image = await loadImage(emojiPath)
					ctx.drawImage(image, startX, yPos + (fontSize * 0.1), fontSize, fontSize)
				} catch (_) {}
			}
			startX += fontSize * 1.15
		}
	}
}

async function processAnimatedWebp(buffer, canvasBuffer, outputPath) {
	const meta = await sharp(buffer, { animated: true }).metadata()
	const pages = meta.pages || 1
	const delays = (meta.delay && meta.delay.length === pages) ? meta.delay : Array(pages).fill(100)

	const frameDir = path.join(os.tmpdir(), `smeme-frames-${randomBytes(6).toString('hex')}`)
	fs.mkdirSync(frameDir, { recursive: true })

	try {
		await Promise.all(
			Array.from({ length: pages }, async (_, i) => {
				const frame = await sharp(buffer, { page: i, pages: 1 })
					.resize(512, 512, { fit: 'fill' })
					.composite([{ input: canvasBuffer, top: 0, left: 0 }])
					.png()
					.toBuffer()

				fs.writeFileSync(path.join(frameDir, `frame_${String(i).padStart(4, '0')}.png`), frame)
			})
		)

		const avgDelay = delays.reduce((a, b) => a + b, 0) / delays.length
		const fps = Math.max(1, Math.min(12, Math.round(1000 / (avgDelay || 100))))

		const encode = (quality) => new Promise((resolve, reject) => {
			const ffmpegArgs = [
				'-y',
				'-framerate', String(fps),
				'-i', path.join(frameDir, 'frame_%04d.png'),
				'-c:v', 'libwebp',
				'-lossless', '0',
				'-q:v', String(quality),
				'-compression_level', '4',
				'-loop', '0',
				'-an',
				'-vsync', 'passthrough',
				outputPath
			]
			execFile('ffmpeg', ffmpegArgs, (err, stdout, stderr) => {
				if (err) reject(new Error(stderr || err.message))
				else resolve()
			})
		})

		await encode(60)

		if (fs.statSync(outputPath).size > 480 * 1024) {
			await encode(35)
		}
	} finally {
		fs.rmSync(frameDir, { recursive: true, force: true })
	}
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
	if (!text) {
		throw `Format: ${usedPrefix + command} <teks atas>|<teks bawah>`
	}

	let q = m.quoted ? m.quoted : m
	let mime = (q.msg || q).mimetype || ''

	if (!mime) {
		throw `Balas media dengan perintah\n\n${usedPrefix + command} <teks atas>|<teks bawah>`
	}

	await m.react('🕒')
	console.time('[smeme] total')

	console.time('[smeme] download')
	const buffer = await q.download()
	console.timeEnd('[smeme] download')
	if (!buffer) throw 'Gagal mengunduh media.'

	const isVideo = mime.startsWith('video/')
	const isGif = mime === 'image/gif'
	const isAnimWebp = mime.startsWith('image/webp') && isAnimatedWebp(buffer)
	const isAnimated = isVideo || isGif || isAnimWebp

	const inputExt = isVideo
		? (mime.split('/')[1]?.split(';')[0] || 'mp4')
		: (isGif ? 'gif' : (mime.startsWith('image/webp') ? 'webp' : (mime.split('/')[1]?.split(';')[0] || 'jpg')))

	const inputPath = tmpFile(inputExt)
	const canvasPath = tmpFile('png')
	const outputPath = tmpFile('webp')

	try {
		fs.writeFileSync(inputPath, buffer)

		console.time('[smeme] canvas+emoji')
		const [topRaw, bottomRaw] = text.split('|')
		const textCanvas = createCanvas(512, 512)
		const ctx = textCanvas.getContext('2d')
		ctx.textBaseline = 'top'

		if (topRaw && topRaw.trim()) await drawMemeText(ctx, toSegments(topRaw.trim().toUpperCase()), true)
		if (bottomRaw && bottomRaw.trim()) await drawMemeText(ctx, toSegments(bottomRaw.trim().toUpperCase()), false)

		const canvasBuffer = textCanvas.toBuffer('image/png')
		fs.writeFileSync(canvasPath, canvasBuffer)
		console.timeEnd('[smeme] canvas+emoji')

		console.time('[smeme] encode')
		if (isAnimWebp) {
			await processAnimatedWebp(buffer, canvasBuffer, outputPath)
		} else {
			const encode = ({ fps, duration, quality }) => new Promise((resolve, reject) => {
				const ffmpegArgs = [
					'-y',
					'-analyzeduration', '20M',
					'-probesize', '10M',
					...(isAnimated ? ['-t', String(duration)] : []),
					'-i', inputPath,
					'-i', canvasPath,
					'-filter_complex', `[0:v]fps=${fps},scale=512:512,format=rgba[base];[base][1:v]overlay=0:0,format=rgba[v_final]`,
					'-map', '[v_final]',
					'-c:v', 'libwebp',
					'-lossless', '0',
					'-q:v', String(quality),
					'-compression_level', '4',
					'-loop', '0',
					'-an',
					'-vsync', 'passthrough',
					outputPath
				]
				execFile('ffmpeg', ffmpegArgs, (err, stdout, stderr) => {
					if (err) reject(new Error(stderr || err.message))
					else resolve()
				})
			})

			await encode({ fps: isAnimated ? 10 : 15, duration: 4, quality: isAnimated ? 55 : 40 })

			if (fs.statSync(outputPath).size > 480 * 1024) {
				await encode({ fps: isAnimated ? 8 : 15, duration: 3, quality: isAnimated ? 30 : 25 })
			}
		}
		console.timeEnd('[smeme] encode')

		const stickerBuffer = fs.readFileSync(outputPath)
		console.log('[smeme] ukuran sticker:', (stickerBuffer.length / 1024).toFixed(1), 'KB')

		console.time('[smeme] kirim')
		try {
			await sendNativeMemeSticker(conn, m, stickerBuffer, { isAnimated })
			await m.react('✅')
		} catch (e) {
			console.error('Gagal kirim native sticker, fallback ke sendFile:', e)
			await conn.sendFile(m.chat, stickerBuffer, 'sticker.webp', '', m)
		}
		console.timeEnd('[smeme] kirim')
		console.timeEnd('[smeme] total')
	} catch (e) {
		await m.react('❌')
		throw `Gagal memproses meme:\n${e.message}`
	} finally {
		safeUnlink(inputPath, canvasPath, outputPath)
	}
}

handler.help = ['smeme']
handler.tags = ['sticker']
handler.command = /^s(ticker)?meme$/i
handler.limit = true

export default handler