import {
  type User,
  type InsertUser,
  type Todo,
  type InsertTodo,
  todos,
  users,
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

// Interface defining what operations are available
export interface IStorage {
  getTodos(userId: number): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(
    id: number,
    userId: number,
    completed: boolean
  ): Promise<Todo | undefined>;
  deleteTodo(id: number, userId: number): Promise<void>;
  createUser(user: InsertUser): Promise<User>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserById(id: number): Promise<User | undefined>;
}

// Implementation using the database
export class DatabaseStorage implements IStorage {
  // Get all todos
  async getTodos(userId: number): Promise<Todo[]> {
    return await db.select().from(todos).where(eq(todos.userId, userId));
  }

  // Create a new todo
  async createTodo(insertTodo: InsertTodo): Promise<Todo> {
    const [todo] = await db.insert(todos).values(insertTodo).returning();
    return todo;
  }

  // Update a todo's completed status
  async updateTodo(
    id: number,
    userId: number,
    completed: boolean
  ): Promise<Todo | undefined> {
    const [todo] = await db
      .update(todos)
      .set({ completed })
      .where(and(eq(todos.id, id), eq(todos.userId, userId)))
      .returning();
    return todo;
  }

  // Delete a todo
  async deleteTodo(id: number, userId: number): Promise<void> {
    await db
      .delete(todos)
      .where(and(eq(todos.id, id), eq(todos.userId, userId)));
  }

  // New user methods
  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async getUserById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
}

// Single instance of storage used throughout the app
export const storage = new DatabaseStorage();
