import fs from 'fs'; import path from 'path'; import { File } from 'megajs'; import config from '../../config.cjs'; import { startClient, activeClients } from '../multi/startClient.js'; import fetch from 'node-fetch';

const ownersFile = path.join(process.cwd(), 'data', 'owners.json'); if (!fs.existsSync(path.dirname(ownersFile))) fs.mkdirSync(path.dirname(ownersFile), { recursive: true }); if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, '{}');

const loadOwners = () => JSON.parse(fs.readFileSync(ownersFile, 'utf-8')); const saveOwners = (data) => fs.writeFileSync(ownersFile, JSON.stringify(data, null, 2));

const deployCommand = async (m, sock) => { const prefix = config.PREFIX || '.'; const command = m.body.slice(prefix.length).split(' ')[0].toLowerCase(); const args = m.body.slice(prefix.length + command.length).trim();

// === .deploy === if (command === 'deploy') { if (!args || args === 'help') { return sock.sendMessage(m.from, { text: 🔧 DEPLOY HELP MENU\n\n📥 *Usage:*\n.deploy INCONNUBUwmGLjZ#V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ\n➡️ Connect your MEGA session.\n\n✏️ *Change Owner:*\n.setowner 554488138425\n\n🌐 Pair here: https://inconnu-boy-tech-web.onrender.com/pair, }, { quoted: m }); }

if (!args.includes('INCONNU') || !args.includes('#')) {
  return sock.sendMessage(m.from, {
    text: '❗ Invalid format. Use:\n.deploy INCONNUBUwmGLjZ#KEY_HERE'
  }, { quoted: m });
}

try {
  await sock.sendMessage(m.from, { react: { text: '⏳', key: m.key } });
  const sessionCode = args.split('INCONNU')[1];
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
    text: `✅ Your bot is now connected successfully to: ${m.sender}`,
  }, { quoted: m });

} catch (err) {
  console.error('[❌ DEPLOY ERROR]', err);
  return sock.sendMessage(m.from, {
    text: '❌ Deployment failed. Please check your MEGA link.',
  }, { quoted: m });
}

}

// === .pair === if (['pair', 'code', 'connect'].includes(command)) { const phone = args.trim(); if (!phone) { return sock.sendMessage(m.from, { text: '❗ Usage: .pair 554488138425' }, { quoted: m }); }

try {
  const response = await fetch(`https://inconnu-boy-tech-web.onrender.com/pair?phone=${phone}`);
  const data = await response.json();

  if (!data.code || data.code.length !== 8) throw new Error('Invalid code');

  return sock.sendMessage(m.from, {
    text: `📲 Here is your 8-digit pairing code for ${phone}: *${data.code}*`,
  }, { quoted: m });

} catch (e) {
  console.error('[❌ PAIRING ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to generate pairing code. Please try again later.',
  }, { quoted: m });
}

}

// === .setowner === if (command === 'setowner') { if (!args) { return sock.sendMessage(m.from, { text: '❗ Usage: .setowner 554488138425' }, { quoted: m }); }

try {
  const owners = loadOwners();
  owners[m.sender] = args.trim();
  saveOwners(owners);

  return sock.sendMessage(m.from, {
    text: `✅ Your bot owner is now set to: ${args.trim()}`,
  }, { quoted: m });

} catch (e) {
  console.error('[❌ SETOWNER ERROR]', e);
  return sock.sendMessage(m.from, {
    text: '❌ Failed to set owner. Try again later.',
  }, { quoted: m });
}

} };

export default deployCommand;

