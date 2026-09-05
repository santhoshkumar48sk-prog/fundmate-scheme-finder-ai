import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { SCHEME_SEED } from "../lib/scheme-data";
import {
  matchSchemes as rankSchemes,
  type Profile,
  type Scheme,
  type SchemeMatch,
} from "../lib/eligibility";

// NOTE: see shared engine in ../lib/eligibility (Rule.value accepts null).

/** Seed the catalogue once (idempotent — keyed on scheme id). */
export const seedSchemes = mutation({
  args: {},
  handler: async (ctx) => {
    const existing = await ctx.db.query("schemes").first();
    if (existing) return { seeded: false, count: 0 };
    for (const scheme of SCHEME_SEED) {
      // The catalogue is typed as the shared `Scheme`; the validator shape
      // (null vs undefined) is bridged here for the insert boundary.
      await ctx.db.insert("schemes", { data: scheme as unknown as never });
    }
    return { seeded: true, count: SCHEME_SEED.length };
  },
});

export type MatchPayload = {
  profile: Profile | null;
  matches: SchemeMatch[];
  hidden: SchemeMatch[];
  seeded: boolean;
};

/**
 * Personalized matching: profile × rule-based eligibility engine.
 * Relation-aware: applied to catalogue rows, returns readable breakdowns.
 */
export const getMatches = query({
  args: {},
  handler: async (ctx): Promise<MatchPayload> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      return { profile: null, matches: [], hidden: [], seeded: false };
    }

    const profileRow = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    if (!profileRow) return { profile: null, matches: [], hidden: [], seeded: false };

    const rows = await ctx.db.query("schemes").collect();
    const schemes: Scheme[] = rows.map((row) => row.data as unknown as Scheme);

    const matches = rankSchemes(profileRow.data as Profile, schemes);
    const hidden = matches
      .filter((m) => m.scheme.awareness !== "known" && m.score >= 55)
      .sort((a, b) => b.score - a.score);

    return {
      profile: profileRow.data as Profile,
      matches,
      hidden,
      seeded: schemes.length > 0,
    };
  },
});