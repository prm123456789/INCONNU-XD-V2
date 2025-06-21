import dotenv from 'dotenv';
dotenv.config();

import {
  makeWASocket,
  fetchLatestBaileysVersion,
  DisconnectReason,
  useMultiFileAuthState
} from '@whiskeysockets/baileys';

import { Handler, Callupdate, GroupUpdate } from './inconnu/inconnuboy/inconnuv2.js';
import express from 'express';
import pino from 'pino';
import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import config from './config.cjs';
import autoreact from './lib/autoreact.cjs';
import { fileURLToPath } from 'url';
import deployCommand from './inconnu/inconnuTech/deploy.js';
import { startClient } from './inconnu/multi/startClient.js'; // ✅ Ajout ici

const logger = pino({ level: 'silent' });
const { emojis, doReact } = autoreact;
const app = express();
let useQR = false;
let initialConnection = true;
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const sessionDir = path.join(__dirname, 'session');
const credsPath = path.join(sessionDir, 'creds.json');
const sessionsDir = path.join(process.cwd(), 'sessions'); // ✅ Dir multi-session

if (!fs.existsSync(sessionDir)) {
  fs.mkdirSync(sessionDir, { recursive: true });
}

// 🔁 Reconnexion des multi-sessions
async function reconnectAllSessions() {
  if (!fs.existsSync(sessionsDir)) return;
  const folders = fs.readdirSync(sessionsDir);
  for (const jid of folders) {
    try {
      const credsPath = path.join(sessionsDir, jid, 'creds.json');
      if (!fs.existsSync(credsPath)) continue;
      const credsBuffer = fs.readFileSync(credsPath);
      await startClient(jid, credsBuffer);
      console.log(`♻️ Session reconnectée: ${jid}`);
    } catch (e) {
      console.error(`❌ Échec reconnexion session ${jid}:`, e);
    }
  }
}

// 🔐 Télécharger la session principale depuis MEGA
async function downloadSessionData() {
  if (!config.SESSION_ID) {
    console.error("❌ Please add your session to SESSION_ID env !!");
    return false;
  }

  const sessionEncoded = config.SESSION_ID.split("INCONNU~XD~")[1];
  if (!sessionEncoded || !sessionEncoded.includes('#')) {
    console.error("❌ Invalid SESSION_ID format! Must contain file ID and decryption key.");
    return false;
  }

  const [fileId, decryptionKey] = sessionEncoded.split('#');

  try {
    console.log("🔄 Downloading main session...");
    const { File } = await import('megajs');
    const sessionFile = File.fromURL(`https://mega.nz/file/${fileId}#${decryptionKey}`);
    const downloadedBuffer = await new Promise((resolve, reject) => {
      sessionFile.download((error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    await fs.promises.writeFile(credsPath, downloadedBuffer);
    console.log("🔒 Main session successfully loaded!");
    return true;

  } catch (error) {
    console.error("❌ Failed to download main session:", error);
    return false;
  }
}

// 🚀 Fonction principale
async function start() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
    const { version, isLatest } = await fetchLatestBaileysVersion();

    console.log(`🤖 INCONNU-XD using WA v${version.join('.')} | isLatest: ${isLatest}`);

    const sock = makeWASocket({
      version,
      logger,
      printQRInTerminal: useQR,
      browser: ['INCONNU-XD', 'Safari', '3.3'],
      auth: state,
      getMessage: async key => ({ conversation: "inconnu-xd whatsapp user bot" })
    });

    sock.ev.on('messages.upsert', async update => {
      try {
        const msg = update.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        if (!text.startsWith(config.PREFIX)) return;
        await deployCommand({
          body: text,
          from: msg.key.remoteJid,
          sender: msg.key.participant || msg.key.remoteJid,
          key: msg.key
        }, sock);
      } catch (err) {
        console.error("Error processing command:", err);
      }
    });

    sock.ev.on("connection.update", async update => {
      const { connection, lastDisconnect } = update;
      if (connection === "close") {
        if (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut) {
          console.log("♻️ Connection lost, restarting...");
          start();
        }
      } else if (connection === "open") {
        if (initialConnection) {
          console.log(chalk.green("✅ INCONNU-XD is now online!"));

          await sock.newsletterFollow("120363397722863547@newsletter");
          await sock.sendMessage(sock.user.id, {
            image: { url: 'https://files.catbox.moe/e1k73u.jpg' },
            caption: `
╔═════════════════
║ ✅ INCONNU CONNECTED
╠═════════════════
║ ⚡ DEV INCONNU BOY
╠═════════════════
║ ⌛ NUM DEV : +554488138425
╚═════════════════
            `,
            contextInfo: {
              isForwarded: true,
              forwardingScore: 999,
              forwardedNewsletterMessageInfo: {
                newsletterJid: "120363397722863547@newsletter",
                newsletterName: "INCONNU-XD",
                serverMessageId: -1
              },
              externalAdReply: {
                title: "INCONNU-XD",
                body: "ᴘᴏᴡᴇʀᴇᴅ ʙʏ inconnu-xd",
                thumbnailUrl: "https://files.catbox.moe/959dyk.jpg",
                sourceUrl: "https://whatsapp.com/channel/0029Vb6T8td5K3zQZbsKEU1R",
                mediaType: 1,
                renderLargerThumbnail: false
              }
            }
          });

          initialConnection = false;
          await reconnectAllSessions(); // ✅ Multi-session reconnexion ici
        } else {
          console.log(chalk.blue("♻️ Connection reestablished after restart."));
        }
      }
    });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("messages.upsert", msg => Handler(msg, sock, logger));
    sock.ev.on("call", call => Callupdate(call, sock));
    sock.ev.on("group-participants.update", group => GroupUpdate(sock, group));
    sock.public = config.MODE === 'public';

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

  } catch (err) {
    console.error("Critical Error:", err);
    process.exit(1);
  }
}

// 🟢 Initialisation
async function init() {
  if (fs.existsSync(credsPath)) {
    console.log("🔒 Session file found, proceeding without QR.");
    await start();
  } else {
    const downloaded = await downloadSessionData();
    if (downloaded) {
      console.log("✅ Session downloaded, starting bot.");
      await start();
    } else {
      console.log("❌ No session found or invalid, printing QR.");
      useQR = true;
      await start();
    }
  }
}

init();

app.use(express.static(path.join(__dirname, "mydata")));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "mydata", "index.html"));
});
app.listen(PORT, () => {
  console.log(`🌐 Server running on port ${PORT}`);
});
