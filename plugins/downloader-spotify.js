/*
Jangan Hapus Wm Bang 

*Play Sportify Di  uptodown Plugins Esm*

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*
https://whatsapp.com/channel/0029Vaf07jKCBtxAsekFFk3i
*/

import axios from "axios";

async function convert(ms) {
   var minutes = Math.floor(ms / 60000);
   var seconds = ((ms % 60000) / 1000).toFixed(0);
   return minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}

async function down(url) {
   const BASEURL = "https://api.fabdl.com";
   const headers = {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
      "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36",
   };

   try {
      const { data: info } = await axios.get(`${BASEURL}/spotify/get?url=${url}`, { headers });
      const { gid, id } = info.result;

      const { data: download } = await axios.get(`${BASEURL}/spotify/mp3-convert-task/${gid}/${id}`, { headers });
      if (download.result.download_url) {
         return `${BASEURL}${download.result.download_url}`;
      }
   } catch (error) {
      console.error("Error downloading Spotify track:", error.message);
      throw new Error(error.message);
   }
}

async function spotifyCreds() {
   return new Promise(async (resolve) => {
      try {
         const json = await axios.post(
            "https://accounts.spotify.com/api/token",
            "grant_type=client_credentials",
            {
               headers: {
                  Authorization:
                     "Basic " +
                     Buffer.from("4c4fc8c3496243cbba99b39826e2841f" + ":" + "d598f89aba0946e2b85fb8aefa9ae4c8").toString("base64"),
               },
            }
         );
         if (!json.data.access_token) {
            return resolve({ status: false, msg: "Can't generate token!" });
         }
         resolve({ status: true, data: json.data });
      } catch (e) {
         resolve({ status: false, msg: e.message });
      }
   });
}

async function play(query) {
   return new Promise(async (resolve) => {
      try {
         const creds = await spotifyCreds();
         if (!creds.status) return resolve(creds);

         const json = await axios.get(`https://api.spotify.com/v1/search?query=${query}&type=track&offset=0&limit=1`, {
            headers: {
               Authorization: "Bearer " + creds.data.access_token,
            },
         });
         if (!json.data.tracks.items || json.data.tracks.items.length < 1) {
            return resolve({ status: false, msg: "Music not found!" });
         }

         let v = json.data.tracks.items[0];
         let url = await down(v.external_urls.spotify);

         const metadata = {
            title: `${v.album.artists[0].name} - ${v.name}`,
            artist: v.album.artists[0].name,
            name: v.name,
            duration: await convert(v.duration_ms),
            popularity: `${v.popularity}%`,
            preview: v.preview_url || "No preview audio available",
            thumbnail: v.album.images[0].url,
            url: v.external_urls.spotify,
         };

         resolve({
            status: true,
            metadata,
            audio: { url },
         });
      } catch (e) {
         resolve({ status: false, msg: e.message });
      }
   });
}

const handler = async (m, { text }) => {
   if (!text) {
      return m.reply("Masukkan nama lagu atau artis untuk dicari!");
   }

   const result = await play(text);

   if (!result.status) {
      return m.reply(`Error: ${result.msg}`);
   }

   const { metadata, audio } = result;
   const message = `
*Judul:* ${metadata.title}
*Artis:* ${metadata.artist}
*Durasi:* ${metadata.duration}
*Popularitas:* ${metadata.popularity}
*Preview:* ${metadata.preview}
*Spotify URL:* ${metadata.url}
`;

   m.reply(message);

   if (audio.url) {
      conn.sendMessage(m.chat, { audio: { url: audio.url }, mimetype: "audio/mpeg" }, { quoted: m });
   } else {
      m.reply("Tidak ada audio yang tersedia untuk diunduh.");
   }
};

handler.help = ["spotify"].map((v) => v + " <lagu>");
handler.tags = ["search","downloader"]
handler.command = /^(plays|spotify)$/i;
handler.limit = false;

export default handler;