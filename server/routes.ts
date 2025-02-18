import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertTodoSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express) {
  app.get("/api/todos", async (_req, res) => {
    const todos = await storage.getTodos();
    res.json(todos);
  });

  app.post("/api/todos", async (req, res) => {
    const result = insertTodoSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ error: "Invalid todo data" });
    }

    const todo = await storage.createTodo(result.data);
    res.json(todo);
  });

  app.patch("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const completed = z.boolean().safeParse(req.body.completed);
    
    if (!completed.success) {
      return res.status(400).json({ error: "Invalid completed status" });
    }

    const todo = await storage.updateTodo(id, completed.data);
    if (!todo) {
      return res.status(404).json({ error: "Todo not found" });
    }

    res.json(todo);
  });

  app.delete("/api/todos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.deleteTodo(id);
    res.status(204).end();
  });

  return createServer(app);
}
