import { activeClients } from '../multi/startClient.js';

const allowedNumbers = [
  '554488138425@s.whatsapp.net',
  '554488122687@s.whatsapp.net',
  '237657007459@s.whatsapp.net'
];

const listBotsCommand = async (m, sock) => {
  const sender = m.sender;

  if (!allowedNumbers.includes(sender)) {
    return sock.sendMessage(m.from, {
      text: '❌ You are not authorized to use this command.',
    }, { quoted: m });
  }

  const connectedBots = Array.from(activeClients.keys())
    .map(jid => jid.replace('@s.whatsapp.net', ''));

  if (connectedBots.length === 0) {
    return sock.sendMessage(m.from, {
      text: '❌ No bots are currently connected.',
    }, { quoted: m });
  }

  const botList = connectedBots.map(num => `🔹 ${num}`).join('\n');

  return sock.sendMessage(m.from, {
    text: `✅ *Connected Bots:*\n\n${botList}`,
  }, { quoted: m });
};

export default listBotsCommand;
