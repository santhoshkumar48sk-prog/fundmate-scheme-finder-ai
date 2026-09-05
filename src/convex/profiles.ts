import { getAuthUserId } from "@convex-dev/auth/server";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { profileValidator } from "./schema";
import type { Profile } from "../lib/eligibility";

/** Current user's smart profile, or null. */
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const row = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();
    return row ? (row.data as Profile) : null;
  },
});

/** Create or replace the user's smart profile. */
export const saveProfile = mutation({
  args: { profile: profileValidator },
  handler: async (ctx, { profile }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { data: profile });
    } else {
      await ctx.db.insert("profiles", { userId, data: profile });
    }

    if (profile.name) {
      await ctx.db.patch(userId, { name: profile.name });
    }
    return true;
  },
});

/** Update only the documents the user says they own (readiness checklist). */
export const updateDocuments = mutation({
  args: { documents: v.array(v.string()) },
  handler: async (ctx, { documents }) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) throw new Error("Not signed in");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existing) throw new Error("Complete the smart profile first");
    await ctx.db.patch(existing._id, {
      data: { ...(existing.data as object), documents },
    } as never);
    return true;
  },
});