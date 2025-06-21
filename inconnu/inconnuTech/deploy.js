// ✅ deploy.js — STABLE PAIR & DEPLOY SYSTEM import fs from 'fs'; import path from 'path'; import { Boom } from '@hapi/boom'; import { useMultiFileAuthState, makeWASocket, fetchLatestBaileysVersion } from '@whiskeysockets/baileys'; import config from '../../config.cjs'; import { startClient, activeClients } from '../multi/startClient.js'; import { File } from 'megajs'; import { tmpdir } from 'os';

const ownersFile = path.join(process.cwd(), 'data', 'owners.json'); if (!fs.existsSync(path.dirname(ownersFile))) fs.mkdirSync(path.dirname(ownersFile), { recursive: true }); if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, '{}');

const loadOwners = () => JSON.parse(fs.readFileSync(ownersFile, 'utf-8')); const saveOwners = (data) => fs.writeFileSync(ownersFile, JSON.stringify(data, null, 2));

const deployCommand = async (m, sock) => { const prefix = config.PREFIX || '.'; const command = m.body.slice(prefix.length).split(' ')[0].toLowerCase(); const args = m.body.slice(prefix.length + command.length).trim();

// === .deploy INCONNU<ID>#<KEY> if (command === 'deploy') { if (!args || args === 'help') { return sock.sendMessage(m.from, { text: `🔧 DEPLOY HELP MENU

📥 To deploy a session, use: .deploy INCONNUBUwmGLjZ#V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ

📌 You can get this code from our website or from your panel.

👑 To set your bot owner: .setowner 554488138425

More tools: https://inconnu-boy-tech-web.onrender.com`, }, { quoted: m }); }

if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
  return sock.sendMessage(m.from, {
    text: '❌ Invalid format. Use:

.deploy INCONNU<fileID>#<key>' }, { quoted: m }); }

try {
  await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });

  const sessionCode = args.split('INCONNU~XD~')[1];
  const [fileId, decryptionKey] = sessionCode.split('#');
  const sessionURL = `https://mega.nz/file/${fileId}#${decryptionKey}`;

  const sessionFile = File.fromURL(sessionURL);
  const dataBuffer = await new Promise((resolve, reject) => {
    sessionFile.download((err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

  await startClient(m.sender, dataBuffer, sock);

  return sock.sendMessage(m.from, {
    text: `✅ Session deployed successfully for: ${m.sender}`
  }, { quoted: m });

} catch (err) {
  console.error('[DEPLOY ERROR]', err);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to deploy session. Check your MEGA link.'
  }, { quoted: m });
}

}

// === .pair / .code / .connect === if (["pair", "code", "connect"].includes(command)) { try { const tempPath = path.join(tmpdir(), ${m.sender.replace(/[@.:]/g, '_')}_auth); if (!fs.existsSync(tempPath)) fs.mkdirSync(tempPath);

const { state, saveCreds } = await useMultiFileAuthState(tempPath);
  const { version } = await fetchLatestBaileysVersion();

  const tempSock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: ['INCONNU-PAIR', 'Chrome', '1.0'],
    getMessage: async () => ({ conversation: 'INCONNU-PAIRING' })
  });

  tempSock.ev.once('connection.update', async update => {
    const { pairingCode, connection } = update;

    if (pairingCode) {
      await sock.sendMessage(m.from, {
        text: `📲 *WhatsApp Pairing Code:*

`${pairingCode}`

➡️ Open WhatsApp Web > Link with code. ✅ Then your bot will be connected., }, { quoted: m }); } else if (connection === 'open') { await sock.sendMessage(m.from, { text: ✅ Your session is connected successfully.}); } else if (connection === 'close') { await sock.sendMessage(m.from, { text:❌ Connection failed or canceled.` }); } });

} catch (err) {
  console.error('[PAIR ERROR]', err);
  return sock.sendMessage(m.from, { text: '❌ Failed to generate pairing code.' });
}

}

// === .setowner <jid> if (command === 'setowner') { if (!args) { return sock.sendMessage(m.from, { text: '⚠️ Usage: .setowner 554488138425' }, { quoted: m }); }

try {
  const owners = loadOwners();
  owners[m.sender] = args.trim();
  saveOwners(owners);

  return sock.sendMessage(m.from, {
    text: `👑 Owner successfully set to: ${args.trim()}`
  }, { quoted: m });

} catch (e) {
  console.error('[SETOWNER ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to set owner. Try again later.'
  }, { quoted: m });
}

} };

export default deployCommand;

