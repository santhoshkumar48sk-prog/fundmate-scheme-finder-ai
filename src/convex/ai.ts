import { action } from "./_generated/server";
import { v } from "convex/values";
import { mockParseNeed, type ParsedNeed } from "../lib/mock-ai";

/**
 * Fundmate — AI service layer (mock for the prototype).
 *
 * SWAP POINT: to go live, replace the body with a call to Claude / Gemini /
 * OpenAI (e.g. fetch to the vendor API using process.env.API_KEY in a
 * "use node" file). The response contract — ParsedNeed — stays identical so
 * the UI does not change.
 */
export const parseNeed = action({
  args: { text: v.string() },
  handler: async (_ctx, { text }): Promise<ParsedNeed> => {
    // Mock: deterministic language-aware extraction, zero API key needed.
    return mockParseNeed(text);
  },
});