import axios from "axios";

export const generateWantedImage = async (avatarUrl) => {
  const apiUrl = `https://some-random-api.ml/canvas/wanted?avatar=${encodeURIComponent(avatarUrl)}`;
  const response = await axios.get(apiUrl, { responseType: "arraybuffer" });

  if (!response?.data) {
    throw new Error("Failed to generate wanted poster");
  }

  return response.data;
};
