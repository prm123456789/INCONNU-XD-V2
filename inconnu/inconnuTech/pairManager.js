import fs from 'fs';
import path from 'path';

const pairCodesFile = path.join(process.cwd(), 'data', 'pairCodes.json');
if (!fs.existsSync(path.dirname(pairCodesFile))) fs.mkdirSync(path.dirname(pairCodesFile), { recursive: true });
if (!fs.existsSync(pairCodesFile)) fs.writeFileSync(pairCodesFile, '{}');

// Générer un code aléatoire à 8 chiffres
export function generatePairCode() {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Sauvegarder le code pairing associé à un numéro
function savePairCode(number, code) {
  const codes = JSON.parse(fs.readFileSync(pairCodesFile, 'utf-8'));
  codes[number] = code;
  fs.writeFileSync(pairCodesFile, JSON.stringify(codes, null, 2));
}

// Envoyer le code pairing via WhatsApp
export async function sendPairCode(number, code, sock) {
  savePairCode(number, code);

  const jid = number.includes('@s.whatsapp.net') ? number : `${number}@s.whatsapp.net`;

  await sock.sendMessage(jid, {
    text: `🔑 INCONNU-XD - Pairing Code:\n\nYour code is: *${code}*\n\nUse it now to connect your bot!`,
  });
}
