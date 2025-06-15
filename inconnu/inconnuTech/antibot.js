import fs from "fs";
import config from "../config.cjs";
const dbPath = "./inconnu/antibot.js";

let antibotDB = fs.existsSync(dbPath)
  ? JSON.parse(fs.readFileSync(dbPath))
  : {};

const saveDB = () => fs.writeFileSync(dbPath, JSON.stringify(antibotDB, null, 2));

const antibot = async (m, sock) => {
  try {
    const prefix = config.PREFIX;
    const body = m.body?.toLowerCase()?.trim();
    if (!body || !body.startsWith(prefix)) return;

    const command = body.slice(prefix.length).trim();

    if (command === "antibot") {
      return m.reply(`*╭─❍『 ANTIBOT USAGE 』❍\n│  ➤ ${prefix}antibot on\n│  ➤ ${prefix}antibot off\n│  ➤ ${prefix}antibot mode delete\n│  ➤ ${prefix}antibot mode warn\n│  ➤ ${prefix}antibot mode kick\n│\n│  Control how bots are handled.\n╰───────────────━⊷*`);
    }

    if (!m.isGroup) return m.reply("*❌ This command works only in group chats.*");

    const metadata = await sock.groupMetadata(m.from);
    const isAdmin = metadata.participants.find(p => p.id === m.sender)?.admin;
    if (!isAdmin) return m.reply("*❌ Admins only!*");

    if (command === "antibot on") {
      antibotDB[m.from] = { active: true, mode: "delete" };
      saveDB();
      return m.reply("*✅ AntiBot is now ON with 'delete' mode.*");
    }

    if (command === "antibot off") {
      delete antibotDB[m.from];
      saveDB();
      return m.reply("*❌ AntiBot is now OFF.*");
    }

    if (command.startsWith("antibot mode ")) {
      const mode = command.split(" ")[2];
      if (!["delete", "warn", "kick"].includes(mode)) {
        return m.reply("*❌ Invalid mode. Choose: delete, warn or kick.*");
      }

      if (!antibotDB[m.from]) {
        antibotDB[m.from] = { active: true, mode: mode };
      } else {
        antibotDB[m.from].mode = mode;
      }
      saveDB();
      return m.reply(`*✅ AntiBot mode updated to '${mode}'.*`);
    }

  } catch (err) {
    console.error("AntiBot Plugin Error:", err);
    m.reply("*⚠️ Something went wrong with AntiBot plugin.*");
  }
};

export default antibot;
export { antibotDB, saveDB };
