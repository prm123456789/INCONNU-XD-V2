import moment from 'moment-timezone';
import config from '../../config.cjs';

const newsletterName = "INCONNU-XD-V2";
const newsletterJid = "120363397722863547@newsletter";

export default async function GroupParticipants(sock, { id, participants, action }) {
   try {
      const metadata = await sock.groupMetadata(id);

      for (const jid of participants) {
         let profilePic;

         try {
            profilePic = await sock.profilePictureUrl(jid, "image");
         } catch {
            profilePic = "https://i.ibb.co/fqvKZrP/ppdefault.jpg";
         }

         const userName = jid.split("@")[0];
         const membersCount = metadata.participants.length;
         const groupName = metadata.subject;

         if (action === "add" && config.WELCOME) {
            const joinTime = moment.tz('Africa/Kolkata').format('HH:mm:ss');
            const joinDate = moment.tz('Africa/Kolkata').format('DD/MM/YYYY');

            const welcomeMessage = {
               image: { url: profilePic },
               caption: `┏━〔 𝑾𝑬𝑳𝑪𝑶𝑴𝑬 𝑭𝑹𝑰𝑬𝑵𝑫 〕━┓

👋 Welcome @${userName}!
🏡 Group: *${groupName}*
🔢 You are member number: *${membersCount}*
📆 Joined on: *${joinDate}*
🕒 At: *${joinTime}*

✨ We hope you enjoy your stay!

┗━━━━━━━━━━━━━━━✦
POWERED BY ${newsletterName}`,
               mentions: [jid],
               contextInfo: {
                  externalAdReply: {
                     mediaType: 1,
                     previewType: 0,
                     renderLargerThumbnail: true,
                     thumbnailUrl: profilePic,
                     sourceUrl: 'https://github.com/INCONNU-BOY/INCONNU-XD-V2'
                  }
               }
            };

            await sock.sendMessage(id, welcomeMessage);
            await sock.sendMessage(newsletterJid, welcomeMessage);
         }

         else if (action === "remove" && config.WELCOME) {
            const leaveTime = moment.tz('Africa/Tanzania').format('HH:mm:ss');
            const leaveDate = moment.tz('Africa/Tanzania').format('DD/MM/YYYY');

            const goodbyeMessage = {
               image: { url: profilePic },
               caption: `┏━〔 𝑮𝑶𝑶𝑫𝑩𝒀𝑬 𝑭𝑹𝑰𝑬𝑵𝑫 〕━┓

👋 Farewell @${userName}
🚪 Left the group: *${groupName}*
👥 Members remaining: *${membersCount}*
📆 Date: *${leaveDate}*
🕒 Time: *${leaveTime}*

💭 You will be missed...

┗━━━━━━━━━━━━━━━✦
POWERED BY ${newsletterName}`,
               mentions: [jid],
               contextInfo: {
                  externalAdReply: {
                     mediaType: 1,
                     previewType: 0,
                     renderLargerThumbnail: true,
                     thumbnailUrl: profilePic,
                     sourceUrl: 'https://github.com/INCONNU-BOY/INCONNU-XD-V2'
                  }
               }
            };

            await sock.sendMessage(id, goodbyeMessage);
            await sock.sendMessage(newsletterJid, goodbyeMessage);
         }
      }
   } catch (e) {
      console.error("❌ Error in GroupParticipants:", e);
   }
}
