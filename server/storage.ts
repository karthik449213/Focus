import { users, sessions, settings, type User, type InsertUser, type Session, type InsertSession, type Settings, type InsertSettings } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  createSession(session: InsertSession): Promise<Session>;
  getSessions(): Promise<Session[]>;
  getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]>;
  
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<InsertSettings>): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private settings: Settings;
  private currentUserId: number;
  private currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    
    // Initialize default settings
    this.settings = {
      id: 1,
      focusDuration: 1500, // 25 minutes
      shortBreakDuration: 300, // 5 minutes
      longBreakDuration: 1800, // 30 minutes
      dailyGoal: 4,
      soundNotifications: true,
      browserNotifications: false,
      theme: "light"
    };
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const session: Session = { 
      ...insertSession, 
      id,
      note: insertSession.note ?? null,
      completed: insertSession.completed ?? false
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async getSessionsByDateRange(startDate: Date, endDate: Date): Promise<Session[]> {
    return Array.from(this.sessions.values()).filter(session => {
      const sessionDate = new Date(session.startTime);
      return sessionDate >= startDate && sessionDate <= endDate;
    }).sort(
      (a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  }

  async getSettings(): Promise<Settings> {
    return this.settings;
  }

  async updateSettings(partialSettings: Partial<InsertSettings>): Promise<Settings> {
    this.settings = { ...this.settings, ...partialSettings };
    return this.settings;
  }
}

export const storage = new MemStorage();
