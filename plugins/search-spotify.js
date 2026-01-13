/*
Jangan Hapus Wm Bang 

*Spotify Search Artis/Song  Plugins Esm*

Entah lah Aku juga Tak Tau Iya In aja Semua 

*[Sumber]*
https://whatsapp.com/channel/0029Vb3u2awADTOCXVsvia28

*[Sumber Scrape]*

https://whatsapp.com/channel/0029VadJEZZ8aKvCkRJsAE2Z/219
*/

import fetch from 'node-fetch';

/*
* Spotify Search Plugin
* By INS Dev
*/

async function searchSpotifyTracks(query) {
  const clientId = 'acc6302297e040aeb6e4ac1fbdfd62c3';
  const clientSecret = '0e8439a1280a43aba9a5bc0a16f3f009';
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const getToken = async () => {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      body: new URLSearchParams({ grant_type: 'client_credentials' }),
      headers: { Authorization: `Basic ${auth}` },
    });
    const result = await response.json();
    return result.access_token;
  };

  const accessToken = await getToken();

  const offset = 10;
  const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&offset=${offset}`;
  const response = await fetch(searchUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const data = await response.json();

  const trackDetails = data.tracks.items.map(track => ({
    name: track.name,
    artist: track.artists.map(artist => artist.name).join(', '),
    album: {
      name: track.album.name,
      href: track.album.external_urls.spotify,
      images: track.album.images[0]?.url,
      releaseDate: track.album.release_date,
      totalTracks: track.album.total_tracks,
    },
    previewUrl: track.preview_url,
    popularity: track.popularity,
    spotifyUrl: track.external_urls.spotify
  }));

  return trackDetails;
}

const handler = async (m, { conn, text }) => {
  if (!text) throw 'Mana query nya? Kasih dong biar aku cariin!';

  try {
    const tracks = await searchSpotifyTracks(text);
    if (tracks.length === 0) throw 'Wah, gak ketemu nih. Coba cari yang lain ya!';

    const track = tracks[0]; 

    let message = `*°${track.name}*\n`;
    message += `*Artis:* ${track.artist}\n`;
    message += `*Album:* ${track.album.name}\n`;
    message += `*Relase:* ${track.album.releaseDate}\n`;
    message += `*Dengerin di Spotify :* ${track.spotifyUrl}\n`;

    await conn.sendMessage(
      m.chat,
      {
        image: { url: track.album.images },
        caption: message,
      },
      { quoted: m }
    );

    if (track.previewUrl) {
      await conn.sendMessage(
        m.chat,
        {
          audio: { url: track.previewUrl },
          mimetype: 'audio/mp4',
        },
        { quoted: m }
      );
    }
  } catch (error) {
    await conn.sendMessage(
      m.chat,
      { text: `Yah, error nih: ${error.message}` },
      { quoted: m }
    );
  }
};

handler.help = ['spotifys <query>'];
handler.tags = ['search']
handler.command = ['spotifys'];

export default handler;