import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  startTime: timestamp("start_time").notNull(),
  duration: integer("duration").notNull(), // in seconds
  note: text("note"),
  completed: boolean("completed").notNull().default(false),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  focusDuration: integer("focus_duration").notNull().default(1500), // 25 minutes in seconds
  shortBreakDuration: integer("short_break_duration").notNull().default(300), // 5 minutes
  longBreakDuration: integer("long_break_duration").notNull().default(1800), // 30 minutes
  dailyGoal: integer("daily_goal").notNull().default(4),
  soundNotifications: boolean("sound_notifications").notNull().default(true),
  browserNotifications: boolean("browser_notifications").notNull().default(false),
  theme: text("theme").notNull().default("light"), // 'light', 'dark', 'auto'
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;
