import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import type { Todo } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Skeleton } from "@/components/ui/skeleton";

interface TodoListProps {
  todos: Todo[];
  isLoading: boolean;
}

export default function TodoList({ todos, isLoading }: TodoListProps) {
  const updateTodo = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      await apiRequest("PATCH", `/api/todos/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  const deleteTodo = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/todos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (todos.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        No todos found
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center justify-between p-4 border rounded-lg"
        >
          <div className="flex items-center gap-3">
            <Checkbox
              checked={todo.completed}
              onCheckedChange={(checked) =>
                updateTodo.mutate({ id: todo.id, completed: !!checked })
              }
            />
            <span
              className={
                todo.completed ? "text-muted-foreground line-through" : ""
              }
            >
              {todo.text}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => deleteTodo.mutate(todo.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
}
