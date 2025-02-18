import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { insertTodoSchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

export default function AddTodo() {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertTodoSchema),
    defaultValues: {
      text: "",
      completed: false,
    },
  });

  const addTodo = useMutation({
    mutationFn: async (values: { text: string; completed: boolean }) => {
      await apiRequest("POST", "/api/todos", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/todos"] });
      form.reset();
      toast({
        title: "Todo added",
        description: "Your todo has been added successfully",
      });
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => addTodo.mutate(values))}
        className="flex gap-2"
      >
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="What needs to be done?"
                  {...field}
                  disabled={addTodo.isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button type="submit" disabled={addTodo.isPending}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add
        </Button>
      </form>
    </Form>
  );
}
