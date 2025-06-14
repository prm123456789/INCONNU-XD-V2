import config from "../../config.cjs";
import { generateWantedImage } from "../../inconnu/wanted.js";

const wantedCmd = async (m, sock) => {
  const prefix = config.PREFIX;
  const command = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(" ")[0].toLowerCase() : "";
  if (!["wanted"].includes(command)) return;

  try {
    const mention = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;

    // Try to get profile pic, fallback to default
    let avatarUrl;
    try {
      avatarUrl = await sock.profilePictureUrl(mention, "image");
    } catch {
      avatarUrl = "https://i.imgur.com/3NR1b1I.png"; // default fallback avatar
    }

    const buffer = await generateWantedImage(avatarUrl);

    const posterMessage = {
      image: buffer,
      caption: `
╭━〔 *WANTED POSTER* 〕━⬣
┃ 👤 *Target:* @${mention.split("@")[0]}
┃ 📄 *Crime:* Unknown Mischief
┃ 🕵️‍♂️ *Reward:* Classified 💰
┃ 
┃ ⚠️ *Status:* Highly Dangerous
╰━━━━━━━━━━━━━━⬣
*MADE IN BY INCONNU XD V2*
      `.trim(),
      mentions: [mention],
    };

    await sock.sendMessage(m.from, posterMessage, { quoted: m });

  } catch (err) {
    console.error("❌ Error in wanted command:", err);
    await m.reply("🚫 Failed to generate WANTED poster. Please try again.");
  }
};

export default wantedCmd;
