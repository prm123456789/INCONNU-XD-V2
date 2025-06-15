import { removeSudoNumber } from '../../lib/sudo.js';
import config from '../../config.cjs';

const unsudo = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['unsudo', 'delsudo', 'remadmin'];
    if (!validCommands.includes(cmd)) return;

    const sender = m.sender;
    const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';
    if (!isOwner) return m.reply("*σиℓу σωиєя ¢αи υѕє тнιѕ ¢σммαи∂ !*");

    let jidTarget;
    if (m.quoted) {
      jidTarget = m.quoted.sender;
    } else {
      const number = text.replace(/[^0-9]/g, '');
      if (!number) return m.reply("*ρℓєαѕє яєρℓу тσ α υѕєя σя єитєя иυмвєя !*");
      jidTarget = number + '@s.whatsapp.net';
    }

    await removeSudoNumber(jidTarget);
    return m.reply(`❌ *@${jidTarget.split("@")[0]} яємσνє∂ ƒяσм ѕυ∂σ ℓιѕт.*`, null, {
      mentions: [jidTarget]
    });

  } catch (e) {
    console.error("❌ Error in .unsudo command:", e);
    m.reply("*¢συℓ∂ иσт яємσνє ѕυ∂σ υѕєя...*");
  }
};

export default unsudo;
