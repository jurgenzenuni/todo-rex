import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";
import { z } from "zod";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import "./types";

export async function registerRoutes(app: Express) {
  // Add session middleware
  app.use(
    session({
      secret: process.env.SESSION_SECRET || "your-secret-key",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      },
    })
  );

  // Auth routes
  app.post("/api/register", async (req, res) => {
    const result = insertUserSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid user data" });
    }

    const existingUser = await storage.getUserByEmail(result.data.email);
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const user = await storage.createUser(result.data);
    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email });
  });

  app.post("/api/login", async (req, res) => {
    const { email, password } = req.body;
    const user = await storage.getUserByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    req.session.userId = user.id;
    res.json({ id: user.id, email: user.email });
  });

  app.post("/api/logout", (req, res) => {
    req.session.destroy(() => {
      res.status(204).end();
    });
  });

  // Modified todo routes to use userId from session
  app.get("/api/todos", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const todos = await storage.getTodos(req.session.userId);
    res.json(todos);
  });

  app.post("/api/todos", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Create the todo data with the session userId
    const todoData = {
      text: req.body.text,
      userId: req.session.userId,
      completed: false,
    };

    try {
      const todo = await storage.createTodo(todoData);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ error: "Failed to create todo" });
    }
  });

  app.patch("/api/todos/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const id = parseInt(req.params.id);
    const completed = z.boolean().safeParse(req.body.completed);

    if (!completed.success) {
      return res.status(400).json({ error: "Invalid completed status" });
    }

    const todo = await storage.updateTodo(
      id,
      req.session.userId,
      completed.data
    );
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  });

  app.delete("/api/todos/:id", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const id = parseInt(req.params.id);
    await storage.deleteTodo(id, req.session.userId);
    res.status(204).end();
  });

  return createServer(app);
}
