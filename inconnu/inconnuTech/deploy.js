import fs from 'fs';
import path from 'path';
import { File } from 'megajs';
import fetch from 'node-fetch';
import config from '../../config.cjs';
import { startClient, activeClients } from '../multi/startClient.js';
import { generatePairCode, sendPairCode } from './pairManager.js';

const ownersFile = path.join(process.cwd(), 'data', 'owners.json');
if (!fs.existsSync(path.dirname(ownersFile))) fs.mkdirSync(path.dirname(ownersFile), { recursive: true });
if (!fs.existsSync(ownersFile)) fs.writeFileSync(ownersFile, '{}');

const loadOwners = () => JSON.parse(fs.readFileSync(ownersFile, 'utf-8'));
const saveOwners = (data) => fs.writeFileSync(ownersFile, JSON.stringify(data, null, 2));

const deployCommand = async (m, sock) => {
  const prefix = config.PREFIX || '.';
  const command = m.body.slice(prefix.length).split(' ')[0].toLowerCase();
  const args = m.body.slice(prefix.length + command.length).trim();

  // === .deploy ===
  if (command === 'deploy') {
    if (!args || args === 'help') {
      return sock.sendMessage(m.from, {
        text: `╭───「 DEPLOY HELP MENU 」
│
│ ✅ *Usage:* .deploy INCONNU~XD~<fileID>#<key>
│ Example:
│ .deploy INCONNU~XD~V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ
│
│ 📌 How to change owner:
│ .setowner 554488138425@s.whatsapp.net
│
╰───────────────────────`,
      }, { quoted: m });
    }

    if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
      return sock.sendMessage(m.from, {
        text: '❌ Invalid format. Use:\n.deploy INCONNU~XD~<fileID>#<key>',
      }, { quoted: m });
    }

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
        text: `✅ Your bot is now running on this number: ${m.sender}`,
      }, { quoted: m });

    } catch (err) {
      console.error('[❌ DEPLOY ERROR]', err);
      return sock.sendMessage(m.from, {
        text: '❌ Deployment failed. Check your MEGA link.',
      }, { quoted: m });
    }
  }

  // === .pair ===
  if (['pair', 'code', 'connect'].includes(command)) {
    if (!args) {
      return sock.sendMessage(m.from, {
        text: `❌ Please provide your WhatsApp number.\n\nExample:\n.pair 554488138425`,
      }, { quoted: m });
    }

    try {
      const code = generatePairCode();
      await sendPairCode(args, code, sock);

      return sock.sendMessage(m.from, {
        text: `✅ Your pairing code has been sent to: ${args}`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ PAIRING ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Failed to start pairing. Try again later.',
      }, { quoted: m });
    }
  }

  // === .setowner ===
  if (command === 'setowner') {
    if (!args) {
      return sock.sendMessage(m.from, {
        text: '❌ Usage:\n.setowner <owner_jid>\n\nExample:\n.setowner 554488138425@s.whatsapp.net',
      }, { quoted: m });
    }

    try {
      const owners = loadOwners();
      owners[m.sender] = args.trim();
      saveOwners(owners);

      return sock.sendMessage(m.from, {
        text: `✅ Owner set to: ${args.trim()}`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ SETOWNER ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Failed to set owner. Try again.',
      }, { quoted: m });
    }
  }
};

export default deployCommand;
