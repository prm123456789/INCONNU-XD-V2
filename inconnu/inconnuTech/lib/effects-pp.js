import { generateEffect } from "../lib/effects.js";

const effectsCmd = async (m, gss) => {
  const prefix = ".";
  const body = m.body.startsWith(prefix) ? m.body.slice(prefix.length) : "";
  const command = body.trim().split(" ")[0].toLowerCase();
  const validCmds = ["triggered", "jail", "rip", "horny", "bobross"];
  if (!validCmds.includes(command)) return;

  const target = m.quoted ? m.quoted.sender : m.sender;
  const name = await gss.getName(target);

  let profileUrl;
  try {
    profileUrl = await gss.profilePictureUrl(target, "image");
  } catch {
    profileUrl = "https://i.ibb.co/2nFqQ56/avatar.png"; // fallback avatar
  }

  try {
    const buffer = await generateEffect(command, profileUrl);
    const isGif = command === "triggered";

    const captions = {
      triggered: `
╭━━━🔥 𝐓𝐑𝐈𝐆𝐆𝐄𝐑𝐄𝐃 🔥━━━╮
┃ 😡 Name : *${name}*
┃ 📛 Status : RAGE MODE!!
┃ 🔥 Effect : Triggered Energy
╰━━━━━━━━━━━━━━━━━━━━━╯
> MADE IN BY INCONNU XD V2
      `,
      jail: `
╭━━━🚨 𝐉𝐀𝐈𝐋𝐄𝐃 🚨━━━╮
┃ 🧑‍⚖️ Criminal : *${name}*
┃ 🪪 Verdict : GUILTY!
┃ 🔒 Sentence : 1000 Years
╰━━━━━━━━━━━━━━━━━━━━━━╯
> MADE IN BY INCONNU XD V2
      `,
      rip: `
╭━━━⚰️ 𝐑.𝐈.𝐏 ⚰️━━━╮
┃ 🪦 Name : *${name}*
┃ ☠️ Cause : Too much swag
┃ 📅 Date : Today...
╰━━━━━━━━━━━━━━━━━━━╯
> MADE IN BY INCONNU XD V2 
      `,
      horny: `
╭━━━💦 𝐇𝐎𝐑𝐍𝐘 💦━━━╮
┃ 🔞 Certified : *${name}*
┃ 🧬 Level : MAX HORNI-NESS
┃ ✅ Valid until: Never
╰━━━━━━━━━━━━━━━━━━╯
> MADE IN BY INCONNU XD V2
      `,
      bobross: `
╭━━🎨 𝐁𝐎𝐁 𝐑𝐎𝐒𝐒 🎨━━╮
┃ 👤 Subject : *${name}*
┃ 🖌️ Painted by: Bob Ross
┃ 🌄 Art Style: Happy Little Accidents
╰━━━━━━━━━━━━━━━━━━━╯
> MADE IN BY INCONNU XD V2
      `,
    };

    const media = isGif
      ? { video: buffer, gifPlayback: true }
      : { image: buffer };

    await gss.sendMessage(m.from, {
      ...media,
      caption: captions[command].trim(),
    }, { quoted: m });

  } catch (err) {
    console.error("[FUN EFFECT ERROR]", err);
    await m.reply("❌ Failed to generate effect. Please try again later.");
  }
};

export default effectsCmd;
