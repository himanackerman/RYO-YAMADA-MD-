//~ Ahmad tumbuh kembang
import {
  generateWAMessageFromContent,
  prepareWAMessageMedia,
  downloadContentFromMessage,
} from "baileys";

function buildStickerExif(metadata) {
  const json = Buffer.from(JSON.stringify(metadata), "utf-8");

  const exif = Buffer.concat([
    Buffer.from([
      0x49, 0x49, 0x2a, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57,
      0x07, 0x00,
    ]),
    Buffer.alloc(4),
    Buffer.from([0x16, 0x00, 0x00, 0x00]),
    json,
  ]);

  exif.writeUInt32LE(json.length, 14);
  return exif;
}

function makeChunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const sizeBuffer = Buffer.alloc(4);
  sizeBuffer.writeUInt32LE(data.length, 0);

  const padding = data.length % 2 === 1 ? Buffer.from([0x00]) : Buffer.alloc(0);

  return Buffer.concat([typeBuffer, sizeBuffer, data, padding]);
}

function setWebpExif(webpBuffer, metadata) {
  if (
    webpBuffer.slice(0, 4).toString() !== "RIFF" ||
    webpBuffer.slice(8, 12).toString() !== "WEBP"
  ) {
    throw new Error("File bukan WEBP valid.");
  }

  const chunks = [];
  let offset = 12;

  while (offset + 8 <= webpBuffer.length) {
    const type = webpBuffer.slice(offset, offset + 4).toString();
    const size = webpBuffer.readUInt32LE(offset + 4);
    const chunkStart = offset;
    const chunkEnd = offset + 8 + size + (size % 2);

    if (chunkEnd > webpBuffer.length) break;

    if (type !== "EXIF") {
      chunks.push(webpBuffer.slice(chunkStart, chunkEnd));
    }

    offset = chunkEnd;
  }

  const exifPayload = buildStickerExif(metadata);
  const exifChunk = makeChunk("EXIF", exifPayload);

  const body = Buffer.concat([...chunks, exifChunk]);

  const header = Buffer.alloc(12);
  header.write("RIFF", 0);
  header.writeUInt32LE(body.length + 4, 4);
  header.write("WEBP", 8);

  return Buffer.concat([header, body]);
}

async function downloadStickerBuffer(stickerMessage) {
  const stream = await downloadContentFromMessage(stickerMessage, "sticker");

  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

let handler = async (m, { conn }) => {
  try {
    const jid = m.chat || m.key.remoteJid;

    const contextInfo =
      m.message?.extendedTextMessage?.contextInfo ||
      m.quoted?.contextInfo ||
      {};

    const quotedMessage =
      contextInfo.quotedMessage || m.quoted?.message || m.quoted;

    const stickerMessage =
      quotedMessage?.stickerMessage || quotedMessage?.message?.stickerMessage;

    if (!stickerMessage) {
      await conn.sendMessage(
        jid,
        { text: "Reply sticker WEBP biasa dulu." },
        { quoted: m },
      );
      return;
    }

    if (stickerMessage.mimetype !== "image/webp") {
      await conn.sendMessage(
        jid,
        {
          text: "Ini bukan sticker WEBP biasa. Untuk lottie/application/was beda cara.",
        },
        { quoted: m },
      );
      return;
    }

    const stickerBuffer = await downloadStickerBuffer(stickerMessage);

    const metadata = {
      "sticker-pack-id": "2be7e369-b5ce-4706-a3d4-f78805a20328",
      "sticker-pack-name": "OMAK",
      "sticker-pack-publisher": "HAI",
      "accessibility-text": "MR ALOC",
      "android-app-store-link": "https://whatsapp.com",
      "ios-app-store-link": "https://whatsapp.com/ios",
      emojis: ["🦸", "😴", "😌"],
      "is-from-sticker-maker": 0,
      "is-avatar-sticker": 1,
      "avatar-sticker-template-id": "whatsapp",
      "is-ai-sticker": 1,
      "is-avatar-country-sticker": 1,
      "is-avatar-instant-sticker": 1,
      "sticker-maker-source-type": 4,
      "is-avatar-social-sticker": 1,
      "avatar-sticker-style": "whatsapp",
      "avatar-sticker-revision-id": "2026",
      "is-from-user-created-pack": 1,
      "origin-pack-id": "whatsapp",
      "is-text-sticker": 1,
      "premium": 1,
    };

    const finalStickerBuffer = setWebpExif(stickerBuffer, metadata);

    const media = await prepareWAMessageMedia(
      {
        sticker: finalStickerBuffer,
      },
      {
        upload: conn.waUploadToServer,
      },
    );

    const msgContent = {
      messageContextInfo: {
        limitSharingV2: {
          sharingLimited: true,
          trigger: "CHAT_SETTING",
          limitSharingSettingTimestamp: Date.now().toString(),
          initiatedByMe: true,
        },
      },

      stickerMessage: {
        ...media.stickerMessage,

        isAnimated: stickerMessage.isAnimated || false,
        isAvatar: true,
        isAiSticker: true,
        isLottie: false,
      },
    };

    const msg = await generateWAMessageFromContent(jid, msgContent, {
      quoted: m,
      userJid: conn.user.id,
    });

    await conn.relayMessage(jid, msg.message, {
      messageId: msg.key.id,
    });

    console.log("✅ Sticker berhasil diberi EXIF/atribut dan dikirim ulang");
  } catch (e) {
    console.error("❌ Error inject sticker metadata:", e);
    await conn.sendMessage(
      m.chat || m.key.remoteJid,
      { text: "Gagal inject atribut sticker. Cek console." },
      { quoted: m },
    );
  }
};

handler.command = /^(sprem|stickerprem|spremium)$/i;
export default handler;