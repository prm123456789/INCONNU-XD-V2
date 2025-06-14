import axios from "axios";

export const generateEffect = async (effect, imageUrl) => {
  try {
    const apiUrl = `https://some-random-api.ml/canvas/${effect}?avatar=${encodeURIComponent(imageUrl)}`;
    const { data } = await axios.get(apiUrl, { responseType: "arraybuffer" });
    return Buffer.from(data);
  } catch (err) {
    console.error(`[ERROR] Effect generation failed: ${err.message}`);
    throw new Error("❌ Failed to generate effect image.");
  }
};
