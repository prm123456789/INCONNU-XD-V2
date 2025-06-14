 
import axios from "axios";

export const fetchCoupleDP = async () => {
  const API_URL = "https://huggingface.co/inference-api";
  const { data } = await axios.get(API_URL);

  if (!data?.result?.male || !data?.result?.female) {
    throw new Error("Invalid response from couple DP API.");
  }

  return {
    male: data.result.male,
    female: data.result.female
  };
};
