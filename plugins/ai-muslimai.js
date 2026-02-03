let oota = async (m, {
    conn,
    text
}) => {
    try {
        const res = await fetch(`https://api.ootaizumi.web.id/ai/muslim-ai?text=${text ? text : "assalamualaikum"}`);

        const response = await res.json();
        if (!response?.message) return m.reply("❌ Gomene gada response message!");

        m.reply(response?.message);
    } catch (e) {
        m.reply("❌ Gomene Error Mungkin lu kebanyakan request!");
    }
}

oota.help = oota.command = ["muslim-ai"]
oota.tags = ["ai"];

export default oota