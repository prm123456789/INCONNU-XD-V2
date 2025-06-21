// ✅ Deploy command with pairing + owner system + 100+ user stable system import fs from 'fs'; import path from 'path'; import { File } from 'megajs'; import config from '../../config.cjs'; import { startClient, activeClients } from '../multi/startClient.js'; import fetch from 'node-fetch';

const ownersFile = path.join(process.cwd(), 'data', 'owners.json'); if (!fs.existsSync(path.dirname(ownersFile))) fs.mkdirSync(path.dirname(ownersFile), { recursive: true }); if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, '{}');

const loadOwners = () => JSON.parse(fs.readFileSync(ownersFile, 'utf-8')); const saveOwners = (data) => fs.writeFileSync(ownersFile, JSON.stringify(data, null, 2));

const deployCommand = async (m, sock) => { const prefix = config.PREFIX || '.'; const command = m.body.slice(prefix.length).split(' ')[0].toLowerCase(); const args = m.body.slice(prefix.length + command.length).trim();

// === .deploy === if (command === 'deploy') { if (!args || args === 'help') { return sock.sendMessage(m.from, { text: ╭───「 🔧 DEPLOY HELP MENU 」 │ │ 📥 *Usage:* .deploy INCONNU~XD~<fileID>#<key> │ Example: │ .deploy INCONNU~XD~BUwmGLjZ#V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ │ │ 📌 To set owner: │ .setowner 554488138425@s.whatsapp.net │ │ 🔗 Pair QR: │ .pair ╰───────────────────────, }, { quoted: m }); }

if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
  return sock.sendMessage(m.from, {
    text: '❗ Invalid format. Use:

.deploy INCONNU<fileID>#<key>', }, { quoted: m }); }

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
    text: `✅ Your bot is successfully connected on: ${m.sender}`,
  }, { quoted: m });

} catch (err) {
  console.error('[❌ DEPLOY ERROR]', err);
  return sock.sendMessage(m.from, {
    text: '❌ Deployment failed. Check your MEGA link.',
  }, { quoted: m });
}

}

// === .pair, .code, .connect === if (['pair', 'code', 'connect'].includes(command)) { try { const response = await fetch('https://inconnu-boy-tech-web.onrender.com/pair'); const data = await response.json();

if (!data || !data.code) throw new Error('Code missing');

  return sock.sendMessage(m.from, {
    text: `🔑 *Here is your pairing code:*

🧾 Code: ${data.code} 🔗 Use it now on: https://inconnu-boy-tech-web.onrender.com/pair`, }, { quoted: m });

} catch (e) {
  console.error('[❌ PAIRING ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to start pairing. Try again later.',
  }, { quoted: m });
}

}

// === .setowner <jid> === if (command === 'setowner') { if (!args) { return sock.sendMessage(m.from, { text: '❗ Usage: .setowner <owner_jid>\nExample: .setowner 123456789@s.whatsapp.net', }, { quoted: m }); }

try {
  const owners = loadOwners();
  owners[m.sender] = args.trim();
  saveOwners(owners);

  return sock.sendMessage(m.from, {
    text: `✅ Owner for your bot set to: ${args.trim()}`,
  }, { quoted: m });

} catch (e) {
  console.error('[❌ SETOWNER ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to set owner. Try again later.',
  }, { quoted: m });
}

} };

export default deployCommand;

    
