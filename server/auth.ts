import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import { sendNewUserNotificationEmail } from "./email";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function comparePasswords(supplied: string, stored: string, userId?: string): Promise<boolean> {
  // Check if it's a bcrypt hash (starts with $2)
  if (stored.startsWith("$2")) {
    return bcrypt.compare(supplied, stored);
  }
  
  // Legacy scrypt hash (format: hash.salt)
  if (stored.includes(".")) {
    const [hashed, salt] = stored.split(".");
    const hashedBuf = Buffer.from(hashed, "hex");
    const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
    const isValid = timingSafeEqual(hashedBuf, suppliedBuf);
    
    // Opportunistic rehash to bcrypt on successful login
    if (isValid && userId) {
      const newHash = await hashPassword(supplied);
      await storage.updateUserPassword(userId, newHash);
    }
    
    return isValid;
  }
  
  return false;
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email', passwordField: 'password' },
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          
          if (!user || !user.password) {
            return done(null, false);
          }
          const isValid = await comparePasswords(password, user.password, user.id);
          if (!isValid) {
            return done(null, false);
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    ),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      if (!user) {
        return done(null, false);
      }
      done(null, user);
    } catch (error) {
      done(null, false);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const { password, email, name } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }

      const user = await storage.createUser({
        password: await hashPassword(password),
        email,
        name: name || email.split('@')[0],
      });

      // Send new user notification email to admin (async, don't block registration)
      sendNewUserNotificationEmail({
        userName: user.name || email.split('@')[0],
        userEmail: email,
        createdAt: new Date(),
      }).catch(err => console.error("Failed to send new user notification email:", err));

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: Express.User | false) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(200).json(user);
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}

export function isAuthenticated(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
}

export function isAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Forbidden - Admin access required" });
  }
  next();
}

// Middleware to check if user is a brokerage admin
export async function isBrokerageAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const membership = await storage.getBrokerageMembership(req.user.id);
    if (!membership || membership.role !== 'admin' || membership.status !== 'active') {
      return res.status(403).json({ message: "Forbidden - Active brokerage admin access required" });
    }
    
    // Add brokerage info to request for convenience
    req.brokerageMembership = membership;
    req.brokerageId = membership.brokerageId;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking brokerage membership" });
  }
}

// Middleware to check if user belongs to a brokerage (admin or agent)
export async function isBrokerageMember(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const membership = await storage.getBrokerageMembership(req.user.id);
    if (!membership || membership.status !== 'active') {
      return res.status(403).json({ message: "Forbidden - Brokerage membership required" });
    }
    
    req.brokerageMembership = membership;
    req.brokerageId = membership.brokerageId;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking brokerage membership" });
  }
}

// Middleware to check if user is the team lead of a specific group
export async function isGroupTeamLead(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const groupId = req.params.groupId || req.body.groupId;
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    
    const group = await storage.getBrokerageGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    if (group.teamLeadUserId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden - Team lead access required" });
    }
    
    req.group = group;
    req.brokerageId = group.brokerageId;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking team lead status" });
  }
}

// Middleware to allow either brokerage admin OR group team lead
export async function isBrokerageAdminOrGroupTeamLead(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  try {
    const groupId = req.params.groupId || req.body.groupId;
    if (!groupId) {
      return res.status(400).json({ message: "Group ID is required" });
    }
    
    const group = await storage.getBrokerageGroup(groupId);
    if (!group) {
      return res.status(404).json({ message: "Group not found" });
    }
    
    // Check if user is team lead of this group
    const isTeamLead = group.teamLeadUserId === req.user.id;
    
    // Check if user is brokerage admin
    const membership = await storage.getBrokerageMembership(req.user.id);
    const isAdmin = membership && 
                    membership.role === 'admin' && 
                    membership.status === 'active' && 
                    membership.brokerageId === group.brokerageId;
    
    if (!isTeamLead && !isAdmin) {
      return res.status(403).json({ message: "Forbidden - Brokerage admin or team lead access required" });
    }
    
    req.group = group;
    req.brokerageId = group.brokerageId;
    req.isTeamLead = isTeamLead;
    req.isAdmin = isAdmin;
    req.brokerageMembership = membership;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Error checking access permissions" });
  }
}
