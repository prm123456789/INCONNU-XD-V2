import { addSudoNumber } from '../../lib/sudo.js';
import config from '../../config.cjs';

const sudo = async (m, gss) => {
  try {
    const botNumber = await gss.decodeJid(gss.user.id);
    const prefix = config.PREFIX;
    const cmd = m.body.startsWith(prefix) ? m.body.slice(prefix.length).split(' ')[0].toLowerCase() : '';
    const text = m.body.slice(prefix.length + cmd.length).trim();

    const validCommands = ['sudo', 'addsudo', 'addadmin'];
    if (!validCommands.includes(cmd)) return;

    const sender = m.sender;
    const isOwner = sender === config.OWNER_NUMBER + '@s.whatsapp.net';
    if (!isOwner) return m.reply("*σиℓу σωиєя ¢αи υѕє тнιѕ ¢σммαη∂ !*");

    // cas 1: reply à quelqu’un
    let jidTarget;
    if (m.quoted) {
      jidTarget = m.quoted.sender;
    } else {
      // cas 2: taper le numéro
      const number = text.replace(/[^0-9]/g, '');
      if (!number) return m.reply("*ρℓєαѕє яєρℓу тσ α υѕєя σя єитєя иυмвєя !*");
      jidTarget = number + '@s.whatsapp.net';
    }

    await addSudoNumber(jidTarget);
    return m.reply(`✅ *@${jidTarget.split("@")[0]} ιѕ иσω α ѕυ∂σ υѕєя !*`, null, {
      mentions: [jidTarget]
    });

  } catch (e) {
    console.error("❌ Error in .sudo command:", e);
    m.reply("*єяяσя σ¢¢υяє∂ ωнιℓє α∂∂ιиg ѕυ∂σ...*");
  }
};

export default sudo;
