/*
Jangan Hapus Wm Bang 

*Tagsw Plugins Esm *

Sebenarnya Ini Kode Nya Rapikz Tapi Karena Uploadimage Semua Sc Gak Sama Jadinya Ku Gabungkan Uploadimage Dari Sc Nya

Izin Ubah Dikit Bang Rapikz Hehe 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Original Code]*
https://whatsapp.com/channel/0029VaoJb11LikgEpNpBty0e/2181

*/

import fetch from 'node-fetch';
import FormData from 'form-data';
import { fileTypeFromBuffer } from 'file-type';
const baileys = (await import("@adiwajshing/baileys")).default;

// **FIXED Function uploadImage**
/**
 * Upload image to catbox.moe
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * - `image/gif`
 * @param {Buffer} buffer Image Buffer
 */
async function uploadImage(buffer) {
  let { ext } = await fileTypeFromBuffer(buffer);
  let bodyForm = new FormData();
  bodyForm.append("fileToUpload", buffer, "file." + ext);
  bodyForm.append("reqtype", "fileupload");

  let res = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: bodyForm,
  });

  let data = await res.text();
  return data;
}

// Function to fetch participants of groups
const fetchParticipants = async (...jids) => {
  let results = [];
  for (const jid of jids) {
    let { participants } = await conn.groupMetadata(jid);
    participants = participants.map(({ id }) => id);
    results = results.concat(participants);
  }
  return results;
};

async function mentionStatus(jids, content) {
  let colors = ['#7ACAA7', '#6E257E', '#5796FF', '#7E90A4', '#736769', '#57C9FF', '#25C3DC', '#FF7B6C', '#55C265', '#FF898B', '#8C6991', '#C69FCC', '#B8B226', '#EFB32F', '#AD8774', '#792139', '#C1A03F', '#8FA842', '#A52C71', '#8394CA', '#243640'];
  let fonts = [0, 1, 2, 6, 7, 8, 9, 10];

  let users = [];
  for (let id of jids) {
    let userId = await conn.groupMetadata(id);
    users.push(...userId.participants.map(u => conn.decodeJid(u.id)));
  }

  let message = await conn.sendMessage(
    "status@broadcast",
    content,
    {
      backgroundColor: colors[Math.floor(Math.random() * colors.length)],
      font: fonts[Math.floor(Math.random() * fonts.length)],
      statusJidList: users,
      additionalNodes: [
        {
          tag: "meta",
          attrs: {},
          content: [
            {
              tag: "mentioned_users",
              attrs: {},
              content: jids.map((jid) => ({
                tag: "to",
                attrs: { jid },
                content: undefined,
              })),
            },
          ],
        },
      ],
    }
  );

  jids.forEach(id => {
    conn.relayMessage(
      id,
      {
        groupStatusMentionMessage: {
          message: {
            protocolMessage: {
              key: message.key,
              type: 25,
            },
          },
        },
      },
      {
        userJid: conn.user.jid,
        additionalNodes: [
          {
            tag: "meta",
            attrs: { is_status_mention: "true" },
            content: undefined,
          },
        ],
      }
    );
  });
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text && command !== 'upsw') throw 'Harap masukkan teks atau kirim media yang dikutip!';

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  let media;
  let link;

  if (mime) {
    media = await q.download();
    link = await uploadImage(media);
  }

  let content = {};
  
  if (command === 'upswimage' && mime.startsWith('image/')) {
    content = { image: { url: link }, caption: text || '' };
  } else if (command === 'upswvideo' && mime.startsWith('video/')) {
    content = { video: { url: link }, caption: text || '' };
  } else if (command === 'upswaudio' && mime.startsWith('audio/')) {
    content = { audio: { url: link } };
  } else if (command === 'upswtext') {
    content = { text: text };
  } else if (command === 'upsw') {
    return m.reply(`MAU YANG MANA?
.upswimage <caption/no caption> ( untuk foto )
.upswvideo <caption/no caption> ( untuk video )
.upswaudio ( untuk audio )
.upswtext <caption> ( untuk teks )`);
  } else {
    throw 'Format atau jenis file tidak didukung!';
  }

  await mentionStatus([m.chat], content);
};

handler.help = ['upswimage', 'upswvideo', 'upswtext', 'upswaudio', 'upsw'];
handler.tags = ['owner'];
handler.command = /^(upswimage|upswvideo|upswtext|upswaudio|upsw)$/i;
handler.owner = true;

export default handler;