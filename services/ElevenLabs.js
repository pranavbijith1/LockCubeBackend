import { GoogleGenerativeAI } from "@google/generative-ai";
import { stripIndents } from "common-tags";
import path from "path";
import fs from "fs/promises";
import { intlFormatDistance } from "date-fns";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/**
 * @typedef UserContext
 * @prop {number} totalDoomscrolls - Total number of doomscrolls
 * @prop {number} secondsWasted - Total seconds wasted doomscrolling
 * @prop {Date?} lastDoomscrollSession - When the user last doomscrolled
 * @prop {Date} doomscrollStarted - when this session of doomscrolling started
 */

export class ElevenLabs {
  /**
   *
   * @param {UserContext} ctx
   * @returns {Promise<string>} path to generated audio
   */
  static async generateAudioFullPipeline({
    doomscrollStarted,
    lastDoomscrollSession,
    secondsWasted,
    totalDoomscrolls,
  }) {
    const lastDoomscrollFmt = intlFormatDistance(
      Date.now(),
      lastDoomscrollSession?.getTime() ?? Date.now(),
    );

    const result = await model.generateContent(
      stripIndents`
        Roast the user for doomscrolling instead of being productive using brainrot language.
        Your response MUST be three sentences or less!

        Facts about the user:
        - ${totalDoomscrolls != 0 ? `This user has doomscrolled ${totalDoomscrolls} times.` : "This is the user's first doomscroll of this study session."}
        ${lastDoomscrollSession ? `- The user's last doomscroll session was ${lastDoomscrollFmt}.` : ""}
        - The user has wasted ${secondsWasted} total seconds.
        - In this specific session, the user has spent ${(Date.now() - doomscrollStarted) / 1000} seconds doomscrolling.

        If the user just started, you can be a little nicer, but if the user has been doomscrolling for a while, then be a little more harsh.
        Never encourage the user to doomscroll. If they just started (i.e. just a few seconds), then tell them off! They were doing good until now!
      `,
    );

    const text = result.response.text();
    console.log("Generated: " + text);

    const elevenRes = await fetch(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM",
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_flash_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      },
    );

    const buffer = Buffer.from(await elevenRes.arrayBuffer());
    const savePath = path.join(process.cwd(), "output.mp3"); // todo: tmpfs?
    await fs.writeFile(savePath, buffer);
    return savePath;
  }
}
