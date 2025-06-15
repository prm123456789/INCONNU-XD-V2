import { antibotDB } from "../inconnu/inconnuTech/antibot.js";
import { addWarn, getWarnCount, resetWarn } from "./warn.js";

const isBot = (jid, name) => {
  return jid.endsWith("bot@c.us") || name?.toLowerCase().includes("bot") || jid.startsWith("BAE5");
};

const antibotCheck = async (m, sock) => {
  try {
    if (!m.isGroup || !m.sender || !m.from) return;

    const groupConfig = antibotDB[m.from];
    if (!groupConfig || !groupConfig.active) return;

    const metadata = await sock.groupMetadata(m.from);
    const senderIsAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    const name = m.pushName || "";

    if (!isBot(m.sender, name)) return;
    if (senderIsAdmin) return;

    const mode = groupConfig.mode;

    switch (mode) {
      case "delete":
        await sock.sendMessage(m.from, { delete: m.key });
        await sock.sendMessage(m.from, {
          text: `🚫 Message from bot @${m.sender.split("@")[0]} was deleted.`,
          mentions: [m.sender],
        });
        break;

      case "warn":
        const warnCount = await addWarn(m.from, m.sender);
        if (warnCount < 3) {
          await sock.sendMessage(m.from, {
            text: `⚠️ Bot detected: @${m.sender.split("@")[0]}\n*Warning ${warnCount}/3*`,
            mentions: [m.sender],
          });
        } else {
          await resetWarn(m.from, m.sender);
          await sock.groupParticipantsUpdate(m.from, [m.sender], "remove");
          await sock.sendMessage(m.from, {
            text: `❌ Bot @${m.sender.split("@")[0]} removed after 3 warnings.`,
            mentions: [m.sender],
          });
        }
        break;

      case "kick":
        await sock.groupParticipantsUpdate(m.from, [m.sender], "remove");
        await sock.sendMessage(m.from, {
          text: `❌ Bot @${m.sender.split("@")[0]} was kicked instantly.`,
          mentions: [m.sender],
        });
        break;

      default:
        break;
    }

  } catch (err) {
    console.error("AntiBot Middleware Error:", err);
  }
};

export default antibotCheck;
