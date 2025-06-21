import fs from 'fs';
import path from 'path';
import { File } from 'megajs';
import config from '../../config.cjs';
import { startClient, activeClients } from '../multi/startClient.js';
import fetch from 'node-fetch';

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
        text: `╭───「 DEPLOY HELP 」
│
│ 📥 *Usage:* .deploy INCONNU~XD~<fileID>#<key>
│ Example:
│ .deploy INCONNU~XD~V3VDKLrtMIPSq_sUJiN91RwtUukSqOFnD1g99zbx7fQ#XXXXX
│
│ 💡 After deploy, the bot will connect automatically.
╰──────────────────`,
      }, { quoted: m });
    }

    if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
      return sock.sendMessage(m.from, {
        text: '❌ Invalid format. Please use:\n.deploy INCONNU~XD~<fileID>#<key>',
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

      const newSock = await startClient(m.sender, dataBuffer, sock);

      if (newSock?.user?.id) {
        return sock.sendMessage(m.from, {
          text: `✅ Your bot is now running on: ${newSock.user.id}`,
        }, { quoted: m });
      } else {
        return sock.sendMessage(m.from, {
          text: '❌ Failed to start the bot.',
        }, { quoted: m });
      }

    } catch (err) {
      console.error('[❌ DEPLOY ERROR]', err);
      return sock.sendMessage(m.from, {
        text: '❌ Deployment failed. Check your MEGA link or try again later.',
      }, { quoted: m });
    }
  }

  // === .pair, .code, .connect ===
  if (['pair', 'code', 'connect'].includes(command)) {
    try {
      const response = await fetch('https://inconnu-boy-tech-web.onrender.com/pair');
      const data = await response.json();

      if (!data.code) {
        return sock.sendMessage(m.from, {
          text: '❌ Failed to get pairing code from API. Try again later.',
        }, { quoted: m });
      }

      return sock.sendMessage(m.from, {
        text: `✅ Your WhatsApp Pairing Code:\n\n*${data.code}*`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ PAIRING ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Error getting pairing code from API.',
      }, { quoted: m });
    }
  }

  // === .setowner ===
  if (command === 'setowner') {
    if (!args) {
      return sock.sendMessage(m.from, {
        text: '❗ Usage: .setowner <owner_jid>\nExample: .setowner 554488138425@s.whatsapp.net',
      }, { quoted: m });
    }

    try {
      const owners = loadOwners();
      owners[m.sender] = args.trim();
      saveOwners(owners);

      return sock.sendMessage(m.from, {
        text: `✅ Owner set for your bot: ${args.trim()}`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ SETOWNER ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Failed to set owner. Try again later.',
      }, { quoted: m });
    }
  }
};

export default deployCommand;
