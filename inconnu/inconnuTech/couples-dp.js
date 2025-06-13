import config from "../../config.cjs";
import { fetchCoupleDP } from "../../inconnu/tech.js";

const couplePP = async (m, gss) => {
  const prefix = config.PREFIX;
  const body = m.body.startsWith(prefix) ? m.body.slice(prefix.length) : "";
  const command = body.trim().split(" ")[0].toLowerCase();
  const validCmds = ["ppcauple", "cauplepp", "cpp"];
  if (!validCmds.includes(command)) return;

  try {
    if (typeof m.React === "function") await m.React("❤️");

    const { male, female } = await fetchCoupleDP();
    const joelThumbnail = `https://raw.githubusercontent.com/joeljamestech2/JOEL-XMD/refs/heads/main/mydata/media/thumbnail.jpg`;

    const contextTemplate = {
      isForwarded: true,
      forwardingScore: 1000,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363317462952356@newsletter',
        newsletterName: "ᴊᴏᴇʟ xᴍᴅ ʙᴏᴛ",
        serverMessageId: 143
      },
      externalAdReply: {
        title: "JOEL XMD COUPLE DP",
        body: "POWERED BY LORD JOEL",
        mediaType: 1,
        thumbnailUrl: joelThumbnail,
        sourceUrl: "https://github.com/joeljamestech2",
        renderLargerThumbnail: false
      }
    };

    await gss.sendMessage(m.from, {
      image: { url: male },
      caption: "```🧑 For Male```",
      contextInfo: contextTemplate,
    }, { quoted: m });

    await gss.sendMessage(m.from, {
      image: { url: female },
      caption: "```👩 For Female```",
      contextInfo: contextTemplate,
    }, { quoted: m });

    if (typeof m.React === "function") await m.React("✅");

  } catch (err) {
    console.error("Couple PP command error:", err);
    if (typeof m.React === "function") await m.React("❌");
    await m.reply("```Failed to fetch couple DP. Please try again later.```");
  }
};

export default couplePP;
