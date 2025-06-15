import { removeSudoNumber } from '../../lib/sudo.js';

const sudoDel = async (m, Matrix) => {
  const mention = m.quoted?.sender || (m.body.split(" ")[1]?.includes('@') ? m.body.split(" ")[1] : null);

  if (!mention) {
    return m.reply(`╭─〔 *USAGE : SUDO DEL* 〕─╮
│  
│  ➤ Reply to a user's message
│     OR type: *.sudo del 123456@s.whatsapp.net*
│  
╰────────────────────╯`);
  }

  try {
    await removeSudoNumber(mention);
    return m.reply(`✅ @${mention.replace(/@.+/, '')} has been *removed from sudo list*!`, {
      mentions: [mention],
    });
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error while removing from sudo list.");
  }
};

export const cmd = ['sudodel', 'delsudo', 'sudo del'];
export const tags = ['owner'];
export default sudoDel;
