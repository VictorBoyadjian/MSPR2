import { CONFIG } from "@/constants/config";
import { splittedDish } from "@/types/splittedDish";
import { ImageManipulator, SaveFormat } from "expo-image-manipulator";
import { getToken } from "./api";

const MAX_SIZE_BYTES = 512 * 1024; // 512 Ko

const base64ByteSize = (base64: string): number =>
  Math.floor((base64.length * 3) / 4);

export const compressAndConvertImageToBase64 = async (
  uri: string,
): Promise<string> => {
  let width = 1280;
  let compress = 0.8;

  for (let attempt = 0; attempt < 6; attempt++) {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width });

    const rendered = await context.renderAsync();
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress,
      base64: true,
    });

    if (!result.base64) {
      throw new Error("Échec de l'encodage base64 de l'image");
    }

    if (base64ByteSize(result.base64) <= MAX_SIZE_BYTES) {
      return result.base64;
    }

    if (compress > 0.4) {
      compress -= 0.15;
    } else {
      width = Math.round(width * 0.8);
    }
  }

  throw new Error("Impossible de compresser l'image sous 500 Ko");
};

export const scanDishService = {
  scan: async (uri: string): Promise<splittedDish> => {
    const token = getToken();
    if (!token) {
      throw new Error("Vous devez être connecté pour analyser un plat");
    }

    const image = await compressAndConvertImageToBase64(uri);
    console.log("sending at:", CONFIG.IMAGE_API_URL);
    const response = await fetch(`${CONFIG.IMAGE_API_URL}/${
      CONFIG.AI_IMAGE_SOURCE == 'MISTRAL' ? 'analyze-by-mistral' : 'analyze'}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ base64_image: image }),
    });

    if (!response.ok) {
        console.log('réponse erreir: ')
        console.log(response)
      throw new Error(
        `Erreur lors de l'analyse de l'image (${response.status})`,
      );
    }
    const castResponse = (await response.json()) as splittedDish;
    console.log("success:");
    console.log(castResponse    );

    if (!castResponse.aliments) {
        console.log('réponse erreir: ')
        console.log(castResponse)
      throw new Error(
        `Erreur lors de l'analyse de l'image (${response.status})`,
      );
    }
    return castResponse;
  },
};
