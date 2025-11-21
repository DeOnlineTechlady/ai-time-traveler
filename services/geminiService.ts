import { GoogleGenAI, Modality, GenerateContentResponse } from "@google/gemai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageModel = 'gemini-2.5-flash-image';
const textModel = 'gemini-2.5-flash';

export interface TimeTravelResult {
  imageUrl: string;
  description: string;
}

/**
 * Extracts the image data URL from a Gemini response.
 * @param response The response from the Gemini API.
 * @returns A data URL string or null if not found.
 */
const extractImageUrl = (response: GenerateContentResponse): string | null => {
  const parts = response.candidates?.[0]?.content?.parts;
  if (parts) {
    for (const part of parts) {
      if (part.inlineData) {
        const base64ImageBytes = part.inlineData.data;
        const mimeType = part.inlineData.mimeType;
        return `data:${mimeType};base64,${base64ImageBytes}`;
      }
    }
  }
  return null;
};

/**
 * Generates a time‑travel image and description from the given base64 image and decade.
 * @param base64Image The base64 encoded image data from the original photo.
 * @param mimeType The MIME type of the original image.
 * @param decade The decade the user has selected (e.g. "1920s").
 * @returns An object containing the new image URL and its description.
 */
export const generateTimeTravelImage = async (
  base64Image: string,
  mimeType: string,
  decade: string,
): Promise<TimeTravelResult> => {
  try {
    // --- Step 1: Generate the time‑travelled image ---
    const imageGenerationPrompt =
      `Transformeer de persoon op de foto tot een portret in de stijl van de ${decade}.`;

    const originalImagePart = {
      inlineData: {
        data: base64Image,
        mimeType: mimeType,
      },
    };

    const imageResponse = await ai.models.generateContent({
      model: imageModel,
      contents: {
        parts: [originalImagePart, { text: imageGenerationPrompt }],
      },
      config: {
        responseModalities: [Modality.IMAGE],
      },
    });

    const imageUrl = extractImageUrl(imageResponse);

    if (!imageUrl) {
      const finishReason = imageResponse.candidates?.[0]?.finishReason;
      console.error("Image generation failed. Finish reason:", finishReason);
      let errorMessage = "The AI failed to generate a new image.";
      if (finishReason === 'SAFETY') {
        errorMessage += " Image generation was blocked for safety reasons.";
      } else {
        errorMessage += " Please try a different photo or decade.";
      }
      throw new Error(errorMessage);
    }

    // --- Step 2: Generate a description for the new image ---
    // Extract base64 and mimeType from the new data URL for the next API call
    const [meta, newImageBase64] = imageUrl.split(',');
    const newImageMimeTypeMatch = meta.match(/data:(.*?);/);
    const newImageMimeType = newImageMimeTypeMatch ? newImageMimeTypeMatch[1] : undefined;

    if (!newImageBase64 || !newImageMimeType) {
      throw new Error("Could not process the newly generated image.");
    }

    const descriptionGenerationPrompt =
      `Dit is een foto die is gestyled om eruit te zien als een portret uit de ${decade}. Beschrijf de look en feel.`;

    const newImagePart = {
      inlineData: {
        data: newImageBase64,
        mimeType: newImageMimeType,
      },
    };

    const descriptionResponse = await ai.models.generateContent({
      model: textModel, // Use a text‑focused model
      contents: {
        parts: [newImagePart, { text: descriptionGenerationPrompt }],
      },
    });

    const description = (descriptionResponse as any).text as string | undefined;

    if (!description) {
      // Fallback description if the API fails to generate one
      return {
        imageUrl,
        description: `A stylish portrait from the ${decade}`,
      };
    }

    return { imageUrl, description };
  } catch (error: unknown) {
    console.error("Error in time‑travel generation process:", error);
    if (error instanceof Error) {
      throw new Error(error.message || "An unexpected error occurred.");
    }
    throw new Error("Failed to generate image. Please try again.");
  }
};
