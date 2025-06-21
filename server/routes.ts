import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSessionSchema, insertSettingsSchema } from "@shared/schema";
import { generateMotivationalQuote } from "./services/openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/motivation - Returns a motivational quote from GPT
  app.get("/api/motivation", async (req, res) => {
    try {
      const quote = await generateMotivationalQuote();
      res.json({ quote });
    } catch (error) {
      console.error("Error generating motivation:", error);
      res.status(500).json({ message: "Failed to generate motivational quote" });
    }
  });

  // POST /api/session - Create a new focus session
  app.post("/api/session", async (req, res) => {
    try {
      const validatedData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(400).json({ message: "Invalid session data" });
    }
  });

  // GET /api/session - Get all focus sessions
  app.get("/api/session", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // GET /api/session/date-range - Get sessions by date range
  app.get("/api/session/date-range", async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const sessions = await storage.getSessionsByDateRange(
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions by date range:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // GET /api/settings - Get user settings
  app.get("/api/settings", async (req, res) => {
    try {
      const settings = await storage.getSettings();
      res.json(settings);
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  // PUT /api/settings - Update user settings
  app.put("/api/settings", async (req, res) => {
    try {
      const validatedData = insertSettingsSchema.partial().parse(req.body);
      const settings = await storage.updateSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(400).json({ message: "Invalid settings data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
