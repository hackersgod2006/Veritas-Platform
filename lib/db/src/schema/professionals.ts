import { pgTable, serial, integer, text, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const professionalsTable = pgTable("professionals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  bio: text("bio"),
  skillsCategory: text("skills_category"),
  proficiencyLevel: text("proficiency_level"),
  portfolioLinks: text("portfolio_links").array().notNull().default([]),
  workHistory: text("work_history"),
  verificationStatus: text("verification_status").notNull().default("not_submitted"),
  trustScore: integer("trust_score"),
  tier: text("tier"),
  projectsCompleted: integer("projects_completed").notNull().default(0),
  deliveryRate: real("delivery_rate"),
  clientSatisfaction: real("client_satisfaction"),
  passportId: text("passport_id").unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProfessionalSchema = createInsertSchema(professionalsTable).omit({ id: true, createdAt: true });
export type InsertProfessional = z.infer<typeof insertProfessionalSchema>;
export type Professional = typeof professionalsTable.$inferSelect;
