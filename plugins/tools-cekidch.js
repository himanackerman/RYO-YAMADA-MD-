import { generateWAMessageFromContent, proto } from '@adiwajshing/baileys';

const handler = async (m, { conn, text }) => {

    if (!text) return m.reply("❌ Kirim link channelnya");

    if (!text.includes("https://whatsapp.com/channel/")) return m.reply("❌ Link tidak valid");

    try {

        let result = text.split('https://whatsapp.com/channel/')[1];

        let res = await conn.newsletterMetadata("invite", result);

        const teks = `

*ID :* ${res.id}

*Nama :* ${res.name}

*Total Pengikut :* ${res.subscribers}

*Status :* ${res.state}

*Verified :* ${res.verification === "VERIFIED" ? "Terverifikasi" : "Tidak"}

`;

        const msg = generateWAMessageFromContent(m.chat, {

            viewOnceMessage: {

                message: {

                    interactiveMessage: proto.Message.InteractiveMessage.create({

                        body: proto.Message.InteractiveMessage.Body.create({

                            text: teks

                        }),

                        footer: proto.Message.InteractiveMessage.Footer.create({

                            text: "ZHESHI"

                        }),

                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({

                            buttons: [

                                {

                                    name: "cta_copy",

                                    buttonParamsJson: `{"display_text":"📋 Salin ID","id":"copy_id","copy_code":"${res.id}"}`

                                }

                            ]

                        })

                    })

                }

            }

        }, {});

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (error) {

        console.log(error);

        return m.reply("❌ Gagal mendapatkan data channel");

    }

};

handler.help = ['cekidch'];

handler.tags = ['tools'];

handler.command = ['idch', 'cekidch'];

export default handler;