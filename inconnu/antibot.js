import {
  atbverifierEtatJid,
  atbrecupererActionJid
} from '../lib/antibot.js';

import { addWarn, getWarnCount, resetWarn } from '../lib/warn.js';

export default async function antibotHandler(m, sock) {
  try {
    if (!m.isGroup || !m.sender) return;

    const isEnabled = await atbverifierEtatJid(m.from);
    if (!isEnabled) return;

    const action = await atbrecupererActionJid(m.from);
    const metadata = await sock.groupMetadata(m.from);
    const senderIsAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;

    const senderName = m.pushName?.toLowerCase() || "";
    const isBot = (
      m.sender.endsWith("bot@c.us") ||
      senderName.includes("bot") ||
      m.key?.id?.startsWith("BAE5")
    );

    // Do nothing if it's not a bot or if the bot is admin
    if (!isBot || senderIsAdmin) return;

    // Perform action based on antibot mode
    if (action === "delete") {
      await sock.sendMessage(m.from, { delete: m.key });
      return;
    }

    if (action === "kick") {
      await sock.groupParticipantsUpdate(m.from, [m.sender], "remove");
      return;
    }

    if (action === "warn") {
      const warnCount = await addWarn(m.from, m.sender);
      if (warnCount < 3) {
        await sock.sendMessage(m.from, {
          text: `⚠️ *Warn ${warnCount}/3*\n@${m.sender.split("@")[0]} has been warned for bot behavior.`,
          mentions: [m.sender]
        });
      } else {
        await resetWarn(m.from, m.sender);
        await sock.groupParticipantsUpdate(m.from, [m.sender], "remove");
        await sock.sendMessage(m.from, {
          text: `🚫 *Bot Kicked*\n@${m.sender.split("@")[0]} reached 3 warns and has been removed.`,
          mentions: [m.sender]
        });
      }
    }

  } catch (e) {
    console.error("ANTIBOT ERROR:", e);
  }
}
