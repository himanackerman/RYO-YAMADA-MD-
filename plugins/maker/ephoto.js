const endpoint = {
	"1917style": "1917style",
	advancedglow: "advancedglow",
	amongustext: "amongustext",
	blackpinklogo: "blackpinklogo",
	blackpinkstyle: "blackpinkstyle",
	cartoonstyle: "cartoonstyle",
	deletingtext: "deletingtext",
	effectclouds: "effectclouds",
	flag3dtext: "flag3dtext",
	flagtext: "flagtext",
	freecreate: "freecreate",
	galaxystyle: "galaxystyle",
	galaxywallpaper: "galaxywallpaper",
	glitchtext: "glitchtext",
	glowingtext: "glowingtext",
	gradienttext: "gradienttext",
	lighteffects: "lighteffects",
	logomaker: "logomaker",
	luxurygold: "luxurygold",
	makingneon: "makingneon",
	multicoloredneon: "multicoloredneon",
	neonglitch: "neonglitch",
	papercutstyle: "papercutstyle",
	pixelglitch: "pixelglitch",
	rainytext: "rainytext",
	royaltext: "royaltext",
	sandsummer: "sandsummer",
	summerbeach: "summerbeach",
	typographytext: "typographytext",
	underwatertext: "underwatertext",
	watercolortext: "watercolortext"
};

const handler = async (m, { conn, text, command, usedPrefix }) => {
	if (!text) {
		return m.reply(
			`Masukkan teks.\n\n` +
			`Contoh:\n` +
			`${usedPrefix + command} Hilman`
		);
	}

	try {
		await m.react("🕒");

		const api = global.APIs.kyzzz;
		const apikey = global.APIKeys[api];

		const res = await fetch(
			`${api}/api/ephoto/${endpoint[command]}?text=${encodeURIComponent(text)}&apikey=${apikey}`
		);

		if (!res.ok) throw new Error(`HTTP ${res.status}`);

		const buffer = Buffer.from(await res.arrayBuffer());

		await conn.sendMessage(
			m.chat,
			{
				image: buffer
			},
			{ quoted: m }
		);
	} catch (e) {
		m.reply(`❌ Error: ${e.message}`);
	}
};

handler.help = [
	"1917style", "advancedglow", "amongustext", "blackpinklogo",
	"blackpinkstyle", "cartoonstyle", "deletingtext", "effectclouds",
	"flag3dtext", "flagtext", "freecreate", "galaxystyle",
	"galaxywallpaper", "glitchtext", "glowingtext", "gradienttext",
	"lighteffects", "logomaker", "luxurygold", "makingneon",
	"multicoloredneon", "neonglitch", "papercutstyle", "pixelglitch",
	"rainytext", "royaltext", "sandsummer", "summerbeach",
	"typographytext", "underwatertext", "watercolortext"
];

handler.tags = ["maker"];

handler.command =
	/^(1917style|advancedglow|amongustext|blackpinklogo|blackpinkstyle|cartoonstyle|deletingtext|effectclouds|flag3dtext|flagtext|freecreate|galaxystyle|galaxywallpaper|glitchtext|glowingtext|gradienttext|lighteffects|logomaker|luxurygold|makingneon|multicoloredneon|neonglitch|papercutstyle|pixelglitch|rainytext|royaltext|sandsummer|summerbeach|typographytext|underwatertext|watercolortext)$/i;

handler.limit = true;

export default handler;