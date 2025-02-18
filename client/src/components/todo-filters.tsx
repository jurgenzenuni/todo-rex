import { Button } from "@/components/ui/button";

type Filter = "all" | "active" | "completed";

interface TodoFiltersProps {
  filter: Filter;
  onFilterChange: (filter: Filter) => void;
}

export default function TodoFilters({ filter, onFilterChange }: TodoFiltersProps) {
  return (
    <div className="flex justify-center gap-2">
      <Button
        variant={filter === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
      >
        All
      </Button>
      <Button
        variant={filter === "active" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("active")}
      >
        Active
      </Button>
      <Button
        variant={filter === "completed" ? "default" : "outline"}
        size="sm"
        onClick={() => onFilterChange("completed")}
      >
        Completed
      </Button>
    </div>
  );
}
