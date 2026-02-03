let handler = async (m, {
	conn,
	text,
	command,
	usedPrefix,
	args
}) => {

	let id = m.sender;
	let data = global.db.data.simulator;
	let _db = db.data.users;

	let type = (args[0] || '').toLowerCase();
	// fake quoted
	function fakes(teks = '') {
		return {
			key: {
				fromMe: false,
				participant: `0@s.whatsapp.net`,
				...(m.chat ? {
					remoteJid: "status@broadcast"
				} : {})
			},
			message: {
				extendedTextMessage: {
					text: teks
				}
			}
		}
	};
	// Date 
	let d = new Date(new Date + 3600000)
    let locale = 'id'
    let hari = d.toLocaleDateString(locale, { weekday: 'long' })
    let tanggal = d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
	// harga barang
const item = {
rumah: 10000,
warung: 4500,
toko: 9000,
makanan: 500,
minuman: 200
}
	// avatar profile
	const avatar_man = ['https://telegra.ph/file/9e0ce46f45b72aa27f504.jpg', 'https://telegra.ph/file/64e7982c62dcf0d973a7d.jpg', 'https://telegra.ph/file/2bc0e23e6f56e2cb4852a.jpg'];
	const avatar_girl = ['https://telegra.ph/file/d04b6a04dbe0d4df0463a.jpg', 'https://telegra.ph/file/2d60e4afa52d62a0fb631.jpg', 'https://telegra.ph/file/dfbba9d559d4fba2ca5e9.jpg'];

	switch (type) {
		case 'login':

			if (data[id]) return m.reply('Kamu kan sudah login😉..\nklo mau logout ketik:\n*/simulator logout*');

			if (!args[1]) return conn.reply(m.chat, '*kamu salah ih 😓\n\nkek gini ya:\n*/simulator login nama|cewe/cowo|umur*', fakes('contoh login'))
			let t1 = args[1].split('|')[0]
			let t2 = args[1].split('|')[1]
			let t3 = args[1].split('|')[2]

			if (!t1) return conn.reply(m.chat, '*Masukan nama*', fakes('Nama'))
			
			if (t2 == 'cowo') {
		 } else if (t2 == 'cewe') {
		 } else conn.reply(m.chat, '*Pilih cewe/cowo*', fakes('Gender'))
		  
			let pp
			if (t2 == 'cewe') {
				pp = await pickRandom(avatar_girl)
			} else if (t2 == 'cowo') {
				pp = await pickRandom(avatar_man)
			} 
		    if (!t3) return conn.reply(m.chat, '*Masukan umur*', fakes('umur'))
		    if (isNaN(t3)) return conn.reply(m.chat, '*Masukan angka dengan benar*', fakes('umur'))
						
			data[id] = {
				nama: t1,
				gender: t2,
				umur: t3,
				login: true,
				profile: pp,
				suami: '',
                istri: '',
                tgl_nikah: '',
                status_nikah: 'belum nikah',
                mas_kawin: '',
                toko_mu: 0,
                mobil_mu: 0,
                emas_mu: 0,
                perhiasan_mu: 0,
                makanan_mu: 0,
                minuman_mu: 0,
                warung_mu: 0,
                rumah_mu: 0
			};

			conn.sendMessage(m.chat, {
				text: `Horee🎉.. kamu sudah login ke dunia simulator 😉, perjalanan ini tidak pendek lho..\nkamu akan menikmati simulator yang menakjubkan dan fantastis banget😃\n\n*Biodata kamu di simulator*:\n╭ [ *INFORMATION* ]\n┃ Nama: ${t1}\n┃ Gender: ${t2}\n┃ Umur: ${t3}\n┃ Login: true\n╰❲ *S I M U L A T O R  V1.0* (beta) ❳`,
				contextInfo: {
					externalAdReply: {
						showAdAttribution: true,
						title: 'WELCOME TO WORD',
						body: 'SIMULATOR V1.0 (beta)',
						mediaType: 1,
						mediaUrl: '',
						thumbnailUrl: pp,
						sourceUrl: '',
						renderLargerThumbnail: true
					}
				}
			}, {
				quoted: m
			});

			break;
		case 'logout':
		if (!data[id]) throw 'Kamu belum login ❎'
		
		if (data[id].login == undefined) throw 'Kamu belum login jadi kamu ga bisa logout ❎'
		
			if (args[1] == 'yes') {
				delete data[id]
				conn.reply(m.chat, '*Yah kamu logout dari simulator 😢*', fakes('kamu telah logout'))
			} else if (args[1] == 'no') {
				conn.reply(m.chat, '*Hore🎉 kamu tidak jadi logout dari simulator 😁*', fakes('your come back'))
			} else conn.reply(m.chat, 'Apakah beneran mau logout kak? 🥲\n*/simulator logout yes/no*', fakes('konfirmasi yes/no'))
			break
		case 'mulai':
		case 'start':
		if (!data[id]) throw 'Kamu belum login ❎'
		
			if (data[id].login == true) {
				const {
					key
				} = await conn.sendMessage(m.chat, {
					text: '*World creating for your life....*'
				})
				const kata = `Dunia yang cerah⛅, kamu menjalani kehidupan baru dengan aman, tentram, dan sejahtera. 
Welcome to simulator kamu akan menemukan kesenangan dalam simulator kali ini😉, banyak pengalaman terbaik dalam simulator saat ini, simulator yang bagaikan kehidupan sebenarnya🎉

*Kamu join sebagai*
name: *${data[id].nama}*
jenis kelamin: *${data[id].gender}*
umur: *${data[id].umur}*

*Selamat menikmati simulator Versi 1.0 (beta)* 🙏`
				await conn.delay(1500)
				await conn.sendMessage(m.chat, {text: '*sukses membuat dunia baru*', edit: key})
				await conn.sendMessage(m.chat, {
				    image: {url: 'https://telegra.ph/file/720f729d695eef340dc0b.jpg'},
					caption: kata,
					
				}, {
					quoted: fakes('START')
				})
			} else {
				const pesan = await conn.sendMessage(m.chat, {
					text: '*World creating for your life....*'
				})
				await conn.delay(1500)
				await conn.sendMessage(m.chat, {
					text: 'Kelihatannya kamu belum login deh🙄',
					edit: pesan.key
				}, {
					mentions: m.sender
				})
			}
			break
			case 'buat':
			if (!data[id]) throw 'Kamu belum login ❎'
			
			if (data[id].login == undefined || '') throw 'Kamu belum login jadi kamu ga bisa create barang ❎'
			let kurang;
			if (args[1] == 'rumah') {
			if (data[id].rumah < 2) return m.reply(`*kamu sudah mempunyai ${data[id].rumah_mu} ${args[1]}* 🏠`)
			if (_db[id].money >= item.rumah) {
			data[id].rumah_mu += 1
			_db[id].money -= item.rumah
			 m.reply('Kamu telah berhasil membuat 🏡 (rumah) seharga Rp10.000')
			} else {
			kurang = kurangBerapa(_db[id].money, item.mobil)
			m.reply(`*yah uang kurang ${kurang}/100000, jadi kamu tidak dapat membuat sebuah ${args[1]}*`)
			}
			} else if (args[1] == item.warung) {
			if (data[id].warung_mu < 3) return m.reply(`*kamu sudah mempunyai ${data[id].warung_mu} ${args[1]}* 🏪`)
			if (_db[id].money >= 'warung') {
			data[id].warung_mu += 1
			_db[id].money -= item.warung
			 m.reply('Kamu telah berhasil membuat 🏪 (warung) seharga Rp4.500')
			} else {
			kurang = kurangBerapa(_db[id].money, item.warung)
			m.reply(`*yah uang kurang ${kurang}/${item.warung}, jadi kamu tidak dapat membuat sebuah ${args[1]}*`)
			}
			} else if (args[1] == 'toko') {
			if (data[id].toko_mu < 3) return m.reply(`*kamu sudah mempunyai ${data[id].toko_mu} ${args[1]}* 🏬`)
			if (_db[id].money >= item.toko) {
			data[id].toko_mu += 1
			_db[id].money -= item.toko
			 m.reply('Kamu telah berhasil membuat 🏬 (toko) seharga Rp9.000')
			} else {
			kurang = kurangBerapa(_db[id].money, item.toko)
			m.reply(`*yah uang kurang ${kurang}/${item.toko}, jadi kamu tidak dapat membuat sebuah ${args[1]}*`)
			}
			} else if (args[1] == 'makanan') {
			if (data[id].makanan_mu < 35) return m.reply(`*kamu sudah mempunyai ${data[id].makanan_mu} ${args[1]}* 🏬`)
			if (_db[id].money >= item.makanan) {
			data[id].makanan_mu += 1
			_db[id].money -= item.makanan
			 m.reply('Kamu telah berhasil membuat 🌭 (makanan) seharga Rp500')
			} else {
			kurang = kurangBerapa(_db[id].money, item.makanan)
			m.reply(`*yah uang kurang ${kurang}/${item.makanan}, jadi kamu tidak dapat membuat sebuah ${args[1]}*`)
			}
			} else if (args[1] == 'minuman') {
			if (data[id].minuman_mu < 20) return m.reply(`*kamu sudah mempunyai ${data[id].minuman_mu} ${args[1]}* 🏬`)
			if (_db[id].money >= item.minuman) {
			data[id].minuman_mu += 1
			_db[id].money -= item.minuman
			 m.reply('Kamu telah berhasil membuat 🍹 (minuman) seharga Rp200')
			} else {
			kurang = kurangBerapa(_db[id].money, item.minuman)
			m.reply(`*yah uang kurang ${kurang}/${item.minuman}, jadi kamu tidak dapat membuat sebuah ${args[1]}*`)
			}
			} else conn.reply(m.chat, `List yang dapat dibuat:
			
    ❲ *Created* ❳
rumah: Rp10.000,
warung: Rp4.500,
toko: Rp9.000,
makanan: Rp500,
minuman: Rp200`, fakes('Create'))
			break
			case 'cerai':
			if (data[id].login !== true) throw 'Kamu belum login jadi kamu ga bisa cerai ❎'
			if (data[id].status_nikah == false) return m.reply(`Kamu kan belum nikah 🙄..\n\napakah kamu mau nikah?\njika mau ketik */simulator nikah*`)
			let pcr = _db[id].pasangan
			if (data[id].gender == 'cowo') {
data[id] += {
suami: '',
istri: '',
tgl_nikah: '',
mas_kawin: '',
status_nikah: 'belum nikah'

}
data[psgn] += {
suami: '',
istri: '',
tgl_nikah: '',
mas_kawin: '',
status_nikah: 'belum nikah'
}
conn.reply(m.chat, `kamu telah bercerai dengan ${pcr.split(`@`)[0]} 😢`, fakes('cerai'))
} else if (data[id].gender == 'cewe') {
data[id] += {
suami: '',
istri: '',
tgl_nikah: '',
mas_kawin: '',
status_nikah: 'belum nikah'

}
data[psgn] += {
suami: '',
istri: '',
tgl_nikah: '',
mas_kawin: '',
status_nikah: 'belum nikah'
}
conn.reply(m.chat, `kamu telah bercerai dengan ${pcr.split(`@`)[0]} 😢`, fakes('cerai'))
}
			break 
case 'nikah': case 'menikah':
if (!data[id]) throw 'Kamu belum login ❎'

if (data[id].login == undefined || '') throw 'Kamu belum login jadi kamu ga bisa nikah ❎'
if (_db[id].pasangan == undefined || '') return conn.reply(m.chat, 'kamu tidak mempunyai pasangan yang mau diajak nikah😢\ncoba ge cari pacar dulu dengan mengetik */jadian @tag*', fakes('jomblo ya?'))
const psgn = _db[id].pasangan
if (data[id].status_nikah == 'nikah') return m.reply(`Kamu kan sudah nikah 🙄..\n\napakah kamu mau cerai?\njika mau ketik */simulator cerai*`)
if (data[id].emas_mu = 0) return m.reply('kamu tidak mempunyai emas😅\nbeli dengan cara */pabrik beli emas*')

data[id].emas_mu -= 1
if (data[id].gender == 'cowo') {
data[id] += {
suami: id,
istri: psgn,
tgl_nikah: `${hari}, ${tanggal}`,
mas_kawin: 'emas',
status_nikah: 'nikah'

}
data[psgn] += {
suami: id,
istri: psgn,
tgl_nikah: `${hari}, ${tanggal}`,
mas_kawin: 'emas',
status_nikah: 'nikah'

}
} else if (data[id].gender == 'cewe') {
data[id] += {
suami: psgn,
istri: id,
tgl_nikah: `${hari}, ${tanggal}`,
mas_kawin: 'emas',
status_nikah: 'nikah'

}
data[psgn] += {
suami: psgn,
istri: id,
tgl_nikah: `${hari}, ${tanggal}`,
mas_kawin: 'emas',
status_nikah: 'nikah'
}
}
const nikah = ['*🕐 kamu sedang mempersiapkan diri*',
'*memulai akad pernikahan...*',
`*kamu menyerahkan mas kawin dengan seperangkat alat sholat berupa EMAS* `,
'*semua orang bilang sah*😊 !!!',
`🎉 *selamat sekarang kamu sudah menikah dengan ${_db[id].pasangan}*`
]

let nikahan = await conn.sendMessage(m.chat, {text: 'pada hari pernikahan💍'})
await conn.delay(500)
for (let i = 0; i < nikah.length; i++) {

await conn.sendMessage(m.chat, {text: nikah[i], edit: nikahan.key })
await conn.delay(900)
}
await conn.delay(2000)
await conn.sendMessage(m.chat, {text: `🎉 *Hore kamu sudah menikah pada hari ini* 😆 semoga langgeng ya😊, kehidupan ini bukan hanya untuk bersenang-senang sahaja tetapi menjalani hubungan dengan penuh kebahagiaan 😉.

*pernikahan ${id.split(`@`)[0]} & ${psgn.split(`@`)[0]}*

Pada hari & tanggal: ${hari}, ${tanggal}

            ${id.split(`@`)[0]}
                     💘❤️💘
            ${psgn.split(`@`)[0]}

Tanggal nikah: ${hari}, ${tanggal}
mas kawin: emas

*Note*: untuk melihat status kalian berdua bisa ketik\n*/simulator status*
`, 
    contextInfo: {
					externalAdReply: {
						showAdAttribution: true,
						title: 'PERNIKAHAN',
						body: 'SIMULATOR V1.0 (beta)',
						mediaType: 1,
						mediaUrl: '',
						thumbnailUrl: 'https://telegra.ph/file/4e844402dcacd2706c2ae.jpg',
						sourceUrl: '',
						renderLargerThumbnail: true
					}
				}}, {quoted: m, mentions: m.sender, psgn})

break 
case 'status':
if (!data[id]) throw 'Kamu belum login jadi kamu ga bisa cek status kamu ❎'
  let cowo = `*Status kamu dalam dunia simulator*

Nama: ${data[id].nama}
Umur: ${data[id].umur}
Gender: ${data[id].gender}
Pasangan: ${data[id].istri ? data[id].istri : 'kamu belum nikah'}💘
Status: ${data[id].status_nikah ? data[id].status_nikah : 'kamu jomblo'}
Tanggal nikah: ${data[id].tgl_nikah ? data[id].tgl_nikah : 'kamu belum nikah'}
`
   let cewe= `*Status kamu dalam dunia simulator*

Nama: ${data[id].nama}
Umur: ${data[id].umur}
Gender: ${data[id].gender}
Pasangan: ${data[id].suami ? data[id].suami : 'kamu belum nikah'}💘
Status: ${data[id].status_nikah ? data[id].status_nikah : 'kamu jomblo'}
Tanggal nikah: ${data[id].tgl_nikah ? data[id].tgl_nikah : 'kamu belum nikah'}
`
let stat = data[id].gender == 'cowo' ? cowo : cewe

await conn.reply(m.chat, stat, fakes('STATUS'))
break 
			case 'help': case 'bantuan':
	    conn.sendThumb(m.chat, `    ❲ *SIMULATOR v1.0 (beta)* ❳

Penggunaan fitur *SIMULATOR*
*/simulator login* untuk login kedalam dunia simulator🔓
*/simulator start* untuk memulai dunia simulator🚀
*/simulator logout* untuk logout dari dunia simulator🚪
*/simulator nikah* untuk menikah dengan pasangan kamu 👰
*/simulator status* untuk melihat status kamu disimulator 🏘️

*SIMULATOR V1.0 (beta)*`, 'https://telegra.ph/file/133ec3d88bdd3aae31b9f.jpg', fakes('help'))
break
default:
conn.reply(m.chat, `❓perintah salah gunakan */simulator help* untuk bantuan`, fakes('invalid'))
			
	}
}

handler.help = handler.command = ['simulator']
handler.tags = ['simulator']
handler.register = true
export default handler

function pickRandom(list) {
	return list[Math.floor(list.length * Math.random())]
}
function kurangBerapa(nilai1, nilai2) {
  return Math.abs(nilai1 - nilai2);
}