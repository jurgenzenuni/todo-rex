import TodoList from "@/components/todo-list";
import AddTodo from "@/components/add-todo";
import TodoFilters from "@/components/todo-filters";
import { useQuery } from "@tanstack/react-query";
import type { Todo } from "@shared/schema";
import { useState } from "react";

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  
  const { data: todos = [], isLoading } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Todo List
          </h1>
          <p className="text-muted-foreground">Keep track of your tasks</p>
        </div>
        
        <div className="space-y-6">
          <AddTodo />
          <TodoFilters filter={filter} onFilterChange={setFilter} />
          <TodoList todos={filteredTodos} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
