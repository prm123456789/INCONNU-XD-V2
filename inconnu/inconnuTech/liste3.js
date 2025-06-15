
import { getAllSudoNumbers } from '../../lib/sudo.js';
import config from '../../config.cjs';

const sudolist = async (m, gss) => {
  try {
    const validCommands = ['sudolist', 'sudoall', 'sudos'];
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';

    if (!validCommands.includes(cmd)) return;

    const sender = m.sender;
    const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';
    if (!isOwner) return m.reply("*σиℓу σωиєя ¢αи ¢нє¢к тнє ѕυ∂σ ℓιѕт !*");

    const sudoList = await getAllSudoNumbers();

    if (sudoList.length === 0) {
      return m.reply("*ℓιѕт ιѕ ємρту... иσ ѕυ∂σ α∂∂є∂ уєт.*");
    }

    const formattedList = sudoList
      .map((jid, i) => `*${i + 1}.* wa.me/${jid.replace('@s.whatsapp.net', '')}`)
      .join('\n');

    const caption = `╭━━〔 👑 𝑺𝑼𝑫𝑶 𝑼𝑺𝑬𝑹𝑺 〕━━⬣
${formattedList}
╰━━━━━━━━━━━━━━━━━⬣`;

    return m.reply(caption);
  } catch (e) {
    console.error("❌ Error in sudolist command:", e);
    m.reply("*єяяσя ωнιℓє ƒєт¢нιиg ѕυ∂σ ℓιѕт...*");
  }
};

export default sudolist;
