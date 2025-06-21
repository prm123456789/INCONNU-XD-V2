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
        text: `╭───「 🔧 DEPLOY HELP MENU 」
│
│ 📥 *Usage:* .deploy INCONNU~XD~<fileID>#<key>
│ ↳ Télécharger et connecter ta session MEGA
│
│ 🧭 Visitez :
│ 🌐 https://inconnu-boy-tech-web.onrender.com/pair
╰───────────────────────`,
      }, { quoted: m });
    }

    if (!args.includes('INCONNU~XD~') || !args.includes('#')) {
      return sock.sendMessage(m.from, {
        text: '❗ Format invalide. Utilisez:\n.deploy INCONNU~XD~<fileID>#<key>',
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

      // NE PAS bloquer si la session est déjà active, pour permettre plusieurs déploiements même sur même numéro
      // Donc pas de "if (activeClients.has(m.sender))" ici

      // Lancer le client avec le buffer et passer sock pour message confirmation
      await startClient(m.sender, dataBuffer, sock);

      return sock.sendMessage(m.from, {
        text: `✅ *Session connectée avec succès sur le numéro : ${m.sender}*`,
      }, { quoted: m });

    } catch (err) {
      console.error('[❌ DEPLOY ERROR]', err);
      return sock.sendMessage(m.from, {
        text: '❌ Échec du déploiement. Vérifiez votre lien MEGA.',
      }, { quoted: m });
    }
  }

  // === .pair, .code, .connect ===
  if (['pair', 'code', 'connect'].includes(command)) {
    try {
      const response = await fetch('https://inconnu-boy-tech-web.onrender.com/pair');
      const data = await response.json();

      return sock.sendMessage(m.from, {
        text: `🔗 Pairing démarré.\nSuis ce lien ou scanne le QR:\n${data.url || 'https://inconnu-boy-tech-web.onrender.com/pair'}`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ PAIRING ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Échec du démarrage du pairing. Réessaie plus tard.',
      }, { quoted: m });
    }
  }

  // === .setowner <jid> ===
  if (command === 'setowner') {
    if (!args) {
      return sock.sendMessage(m.from, {
        text: '❗ Usage: .setowner <owner_jid>\nExemple: .setowner 123456789@s.whatsapp.net',
      }, { quoted: m });
    }

    try {
      const owners = loadOwners();
      owners[m.sender] = args.trim();
      saveOwners(owners);

      return sock.sendMessage(m.from, {
        text: `✅ Owner de ton bot défini sur : ${args.trim()}`,
      }, { quoted: m });

    } catch (e) {
      console.error('[❌ SETOWNER ERROR]', e);
      return sock.sendMessage(m.from, {
        text: '❌ Échec de la définition du owner. Réessaie plus tard.',
      }, { quoted: m });
    }
  }
};

export default deployCommand;
