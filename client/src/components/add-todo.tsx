import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function AddTodo() {
  const [text, setText] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await apiRequest("POST", "/api/todos", { text });
      // Invalidate and refetch todos
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      setText("");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create todo. Please try again.",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        className="flex-1"
      />
      <Button type="submit">Add</Button>
    </form>
  );
}
