
/**
 * Génère un avatar DiceBear à partir d'un nom et d'un style
 * @param {string} name - Le nom ou identifiant utilisé comme "seed"
 * @param {string} style - Le style d'avatar (ex: "pixel", "bottts", "adventurer")
 * @returns {string} URL de l’avatar SVG généré
 */
export const generateAvatar = (name = "inconnu", style = "adventurer") => {
  return `https://api.dicebear.com/7.x/${encodeURIComponent(style)}/svg?seed=${encodeURIComponent(name)}`;
};
