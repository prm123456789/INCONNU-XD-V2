import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { makeWASocket, fetchLatestBaileysVersion, useMultiFileAuthState } from '@whiskeysockets/baileys';
import config from '../../config.cjs';
import { Handler, Callupdate, GroupUpdate } from '../inconnuboy/inconnuv2.js';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const autoreact = require('../../lib/autoreact.cjs');
const { emojis, doReact } = autoreact;

// Map globale des clients actifs
export const activeClients = new Map();

export async function startClient(jid, credsBuffer, sockCommand = null) {
  try {
    const sessionDir = path.join(process.cwd(), 'sessions', jid);
    if (!fs.existsSync(sessionDir)) fs.mkdirSync(sessionDir, { recursive: true });
    fs.writeFileSync(path.join(sessionDir, 'creds.json'), credsBuffer);

    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version } = await fetchLatestBaileysVersion();
    const logger = pino({ level: 'silent' });

    const sock = makeWASocket({
      version,
      logger,
      browser: ['INCONNU-MULTI', 'Chrome', '1.0'],
      auth: state,
      printQRInTerminal: false,
      getMessage: async key => ({ conversation: "multi-user bot" })
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", msg => Handler(msg, sock, logger));
    sock.ev.on("call", call => Callupdate(call, sock));
    sock.ev.on("group-participants.update", group => GroupUpdate(sock, group));

    // Auto-reaction
    sock.ev.on("messages.upsert", async update => {
      try {
        const msg = update.messages[0];
        if (!msg.key.fromMe && config.AUTO_REACT && msg.message) {
          const emoji = emojis[Math.floor(Math.random() * emojis.length)];
          await doReact(emoji, msg, sock);
        }
      } catch (err) {
        console.error("Auto react error:", err);
      }
    });

    // Ajouter le bot dans la map globale avec son vrai numéro connecté
    activeClients.set(sock.user.id, sock);
    console.log(`✅ Session connectée pour ${sock.user.id}`);

    // Abonnement newsletter + message d'accueil
    await sock.newsletterFollow("120363397722863547@newsletter");
    await sock.sendMessage(sock.user.id, {
      image: { url: 'https://files.catbox.moe/e1k73u.jpg' },
      caption: `
╔═════════════════
║ ✅ BOT CONNECTÉ AVEC SUCCÈS !
╠═════════════════
║ 🤖 Tu es maintenant connecté à INCONNU-XD.
║ 📍 Ton numéro : ${sock.user.id}
╠═════════════════
║ 🔒 Ta session est privée.
╚═════════════════
      `,
      contextInfo: {
        externalAdReply: {
          title: 'INCONNU-XD Multi Session',
          body: 'Bot personnel connecté avec succès',
          thumbnailUrl: 'https://files.catbox.moe/959dyk.jpg',
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://whatsapp.com/channel/0029Vb6T8td5K3zQZbsKEU1R'
        }
      }
    });

    if (sockCommand) {
      await sockCommand.sendMessage(sockCommand.sender, {
        text: `✅ Your bot is now running on this number: ${sock.user.id}`,
      });
    }

    return sock;

  } catch (err) {
    console.error(`[❌ ERROR in startClient for ${jid}]`, err);
  }
}
