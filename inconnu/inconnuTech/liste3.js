import { addSudoNumber } from '../../lib/sudo.js';

const sudoAdd = async (m, Matrix) => {
  const mention = m.quoted?.sender || (m.body.split(" ")[1]?.includes('@') ? m.body.split(" ")[1] : null);

  if (!mention) {
    return m.reply(`╭─〔 *USAGE : SUDO ADD* 〕─╮
│  
│  ➤ Reply to a user's message
│     OR type: *.sudo add 123456@s.whatsapp.net*
│  
╰────────────────────╯`);
  }

  try {
    await addSudoNumber(mention);
    return m.reply(`✅ @${mention.replace(/@.+/, '')} has been *added to sudo list*!`, {
      mentions: [mention],
    });
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error while adding to sudo list.");
  }
};

export const cmd = ['sudoadd', 'addsudo', 'sudo add'];
export const tags = ['owner'];
export default sudoAdd;
