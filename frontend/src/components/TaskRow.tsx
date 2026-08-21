import { CalendarDays, Pencil, Trash2 } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import type { Task } from "@/lib/tasks-store";
import { cn } from "@/lib/utils";

function formatDeadline(deadline?: string | null) {
  if (!deadline) return "Tanpa deadline";
  
  // Jika string dari backend sudah format ISO (mengandung 'T'), gunakan langsung.
  // Jika formatnya 'YYYY-MM-DD', tambahkan 'T00:00:00'.
  const dateStr = deadline.includes('T') ? deadline : `${deadline}T00:00:00`;
  const date = new Date(dateStr);
  
  // Mencegah error 'Invalid time value'
  if (isNaN(date.getTime())) return "Invalid Date";
  
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function TaskRow({
  task,
  index,
  onEdit,
  onDelete,
}: {
  task: Task;
  index: number;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}) {
  return (
    <li className="group flex gap-4 border-b border-border bg-card/60 px-5 py-5 transition-colors last:border-b-0 hover:bg-card sm:px-7">
      <span className="mt-0.5 font-display text-xs text-muted-foreground tabular-nums">
        {String(index + 1).padStart(2, "0")}
      </span>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <h3
            className={cn(
              "text-base font-semibold tracking-tight",
              task.status === "done" && "text-muted-foreground line-through",
            )}
          >
            {task.title}
          </h3>
          <StatusBadge status={task.status} />
        </div>

        {task.description ? (
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground">
            {task.description}
          </p>
        ) : null}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
          <CalendarDays className="size-3.5" aria-hidden />
          {formatDeadline(task.deadline)}
        </p>
      </div>

      <div className="flex shrink-0 items-start gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <button
          type="button"
          aria-label={`Edit ${task.title}`}
          onClick={() => onEdit(task)}
          className="inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-border hover:text-foreground"
        >
          <Pencil className="size-4" aria-hidden />
        </button>
        <button
          type="button"
          aria-label={`Hapus ${task.title}`}
          onClick={() => onDelete(task)}
          className="inline-flex size-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </div>
    </li>
  );
}
