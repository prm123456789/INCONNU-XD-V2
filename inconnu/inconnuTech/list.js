import { getAllSudoNumbers } from '../../lib/sudo.js';

const sudoList = async (m, Matrix) => {
  try {
    const list = await getAllSudoNumbers();

    if (list.length === 0) {
      return m.reply(`🚫 *No SUDO users found in the database.*`);
    }

    const formatted = list.map((jid, i) => `*${i + 1}.* wa.me/${jid.replace(/@.+/, '')}`).join("\n");

    return m.reply(`╭──〔 *SUDO LIST* 〕──╮\n\n${formatted}\n\n╰───────────────╯`);
  } catch (e) {
    console.error(e);
    return m.reply("❌ Error while retrieving the sudo list.");
  }
};

export const cmd = ['sudolist', 'listsudo', 'sudo list'];
export const tags = ['owner'];
export default sudoList;
