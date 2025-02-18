import { type Todo, type InsertTodo, todos } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getTodos(): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(id: number, completed: boolean): Promise<Todo | undefined>;
  deleteTodo(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getTodos(): Promise<Todo[]> {
    return await db.select().from(todos);
  }

  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const [todo] = await db
      .insert(todos)
      .values(insertTodo)
      .returning();
    return todo;
  }

  async updateTodo(id: number, completed: boolean): Promise<Todo | undefined> {
    const [todo] = await db
      .update(todos)
      .set({ completed })
      .where(eq(todos.id, id))
      .returning();
    return todo;
  }

  async deleteTodo(id: number): Promise<void> {
    await db.delete(todos).where(eq(todos.id, id));
  }
}

export const storage = new DatabaseStorage();