import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

/* ------------------------------------------------------------------ */
/* Fundmate: Smart Profile + Scheme catalogue                           */
/* ------------------------------------------------------------------ */

export const profileValidator = v.object({
  name: v.optional(v.string()),
  age: v.number(),
  gender: v.string(), // male | female | other
  category: v.string(), // SC | ST | OBC | EBC | DNT | General
  hasDisability: v.boolean(),
  state: v.string(),
  district: v.string(),
  annualFamilyIncome: v.number(),
  monthlyIncome: v.number(),
  existingLoan: v.boolean(),
  assets: v.string(),
  financialRequirement: v.number(),
  qualification: v.string(),
  firstGraduate: v.boolean(),
  hasExistingBusiness: v.boolean(),
  businessType: v.string(),
  sector: v.string(),
  projectCost: v.number(),
  investmentRequired: v.number(),
  businessExperience: v.number(),
  isFarmer: v.boolean(),
  ownsLand: v.boolean(),
  interestedFarming: v.boolean(),
  needCategory: v.string(),
  needDescription: v.optional(v.string()),
  documents: v.array(v.string()),
});

export const ruleValidator = v.object({
  field: v.string(),
  op: v.string(),
  value: v.union(v.number(), v.string(), v.array(v.string()), v.null()),
  weight: v.number(),
  when: v.string(),
  fix: v.optional(v.string()),
});

export const loanWindowValidator = v.object({
  min: v.number(),
  max: v.number(),
  rate: v.number(),
  subsidy: v.number(),
  tenureMax: v.number(),
});

export const schemeValidator = v.object({
  id: v.string(),
  name: v.string(),
  department: v.string(),
  level: v.union(v.literal("central"), v.literal("state")),
  sector: v.string(),
  tags: v.array(v.string()),
  summary: v.string(),
  benefit: v.string(),
  loanWindow: v.optional(loanWindowValidator),
  eligibilityText: v.string(),
  documents: v.array(v.string()),
  applicationRoute: v.string(),
  officialSource: v.string(),
  sourceUrl: v.string(),
  helpdesk: v.optional(v.string()),
  awareness: v.union(v.literal("known"), v.literal("lesser"), v.literal("hidden")),
  verifiedDate: v.string(),
  rules: v.array(ruleValidator),
});

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Fundmate: one smart profile per user
    profiles: defineTable({
      userId: v.id("users"),
      data: profileValidator,
    }).index("by_userId", ["userId"]),

    // Fundmate: verified government scheme catalogue
    schemes: defineTable({
      data: schemeValidator,
    }).index("by_schemeId", ["data.id"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;