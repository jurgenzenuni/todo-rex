import TodoList from "@/components/todo-list";
import AddTodo from "@/components/add-todo";
import TodoFilters from "@/components/todo-filters";
import { useQuery } from "@tanstack/react-query";
import type { Todo } from "@shared/schema";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { clearAuthCache } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

type Filter = "all" | "active" | "completed";

export default function Home() {
  const [filter, setFilter] = useState<Filter>("all");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const {
    data: todos = [],
    isLoading,
    error,
  } = useQuery<Todo[]>({
    queryKey: ["/api/todos"],
  });

  // If unauthorized, show login/register buttons
  if (error?.message?.includes("401")) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container max-w-2xl mx-auto p-4 space-y-8">
          <div className="flex justify-end gap-4">
            <Button onClick={() => setLocation("/login")}>Login</Button>
            <Button variant="outline" onClick={() => setLocation("/register")}>
              Register
            </Button>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Todo List
            </h1>
            <p className="text-muted-foreground">
              Please login to manage your tasks
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      clearAuthCache(); // Clear cache before navigation
      setLocation("/login");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to logout",
      });
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-2xl mx-auto p-4 space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Todo List
          </h1>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
        <p className="text-muted-foreground">Keep track of your tasks</p>

        <div className="space-y-6">
          <AddTodo />
          <TodoFilters filter={filter} onFilterChange={setFilter} />
          <TodoList todos={filteredTodos} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
