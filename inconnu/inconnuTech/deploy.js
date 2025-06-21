import fs from 'fs'; import path from 'path'; import { File } from 'megajs'; import config from '../../config.cjs'; import { startClient, activeClients } from '../multi/startClient.js'; import fetch from 'node-fetch';

const ownersFile = path.join(process.cwd(), 'data', 'owners.json'); if (!fs.existsSync(path.dirname(ownersFile))) fs.mkdirSync(path.dirname(ownersFile), { recursive: true }); if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, '{}');

const loadOwners = () => JSON.parse(fs.readFileSync(ownersFile, 'utf-8')); const saveOwners = (data) => fs.writeFileSync(ownersFile, JSON.stringify(data, null, 2));

const deployCommand = async (m, sock) => { const prefix = config.PREFIX || '.'; const command = m.body.slice(prefix.length).split(' ')[0].toLowerCase(); const args = m.body.slice(prefix.length + command.length).trim();

// === .deploy === if (command === 'deploy') { if (!args || args === 'help') { return sock.sendMessage(m.from, { text: `🔧 DEPLOY USAGE:

1. Connect session from MEGA: .deploy INCONNUBUwmGLjZ#V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ


2. Set bot owner (change main controller): .setowner 554488138425@s.whatsapp.net



🔗 More at: https://inconnu-boy-tech-web.onrender.com/pair` }, { quoted: m }); }

if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
  return sock.sendMessage(m.from, {
    text: '❗ Invalid format. Use:

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
    text: `✅ *Your bot has been successfully connected to: ${m.sender}*`
  }, { quoted: m });

} catch (err) {
  console.error('[❌ DEPLOY ERROR]', err);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to connect. Please check your MEGA link.'
  }, { quoted: m });
}

}

// === .pair, .code, .connect === if (['pair', 'code', 'connect'].includes(command)) { try { const response = await fetch('https://inconnu-boy-tech-web.onrender.com/pair'); const data = await response.json();

if (!data || !data.url) throw new Error("No URL returned");

  return sock.sendMessage(m.from, {
    text: `🔗 *Pairing started!*

Click this link or scan the QR Code to connect: ${data.url}

Note: You will receive a session MEGA link to deploy.` }, { quoted: m });

} catch (e) {
  console.error('[❌ PAIRING ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to start pairing. Please try again later.'
  }, { quoted: m });
}

}

// === .setowner <jid> === if (command === 'setowner') { if (!args) { return sock.sendMessage(m.from, { text: '❗ Usage: .setowner <jid> Example: .setowner 554488138425@s.whatsapp.net' }, { quoted: m }); }

try {
  const owners = loadOwners();
  owners[m.sender] = args.trim();
  saveOwners(owners);

  return sock.sendMessage(m.from, {
    text: `✅ Owner updated to: ${args.trim()}`
  }, { quoted: m });

} catch (e) {
  console.error('[❌ SETOWNER ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to set owner. Try again later.'
  }, { quoted: m });
}

} };

export default deployCommand;

  
