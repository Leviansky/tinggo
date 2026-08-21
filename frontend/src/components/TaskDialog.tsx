import { useEffect } from "react";
import { CalendarDays, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { STATUS_META, type Task, type TaskStatus } from "@/lib/tasks-store";
import { cn } from "@/lib/utils";

const STATUSES: TaskStatus[] = ["pending", "in-progress", "done"];

const formSchema = z.object({
  title: z.string().trim().min(1, "Judul tidak boleh kosong."),
  description: z.string().trim().optional().nullable(),
  status: z.enum(["pending", "in-progress", "done"]),
  deadline: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

export function TaskDialog({
  open,
  onOpenChange,
  task,
  onSubmit,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  onSubmit: (values: Omit<Task, "id">) => void;
  isPending?: boolean;
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "pending",
      deadline: "",
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
      return;
    }
    
    let formattedDeadline = "";
    if (task?.deadline) {
      const dateStr = task.deadline.includes("T") ? task.deadline : `${task.deadline}T00:00:00`;
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        formattedDeadline = `${year}-${month}-${day}`;
      } else {
        formattedDeadline = task.deadline;
      }
    }
    
    form.reset({
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "pending",
      deadline: formattedDeadline,
    });
  }, [open, task, form]);

  function onSubmitForm(values: FormValues) {
    onSubmit({
      title: values.title,
      description: values.description || null,
      status: values.status,
      deadline: values.deadline || null,
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card">
        <DialogHeader className="space-y-2 text-left">
          <span className="label-eyebrow">{task ? "Edit tugas" : "Tugas baru"}</span>
          <DialogTitle className="text-2xl">
            {task ? "Perbarui detail" : "Apa yang harus dikerjakan?"}
          </DialogTitle>
          <DialogDescription>
            Judul wajib diisi. Deskripsi dan deadline bersifat opsional.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmitForm)} className="space-y-5">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Judul</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Contoh: Implementasi modul autentikasi JWT"
                      className="placeholder:text-muted-foreground/60"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deskripsi</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Tambahkan detail, langkah-langkah, atau kriteria penyelesaian..."
                      className="placeholder:text-muted-foreground/60"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <div className="flex flex-wrap gap-2">
                        {STATUSES.map((value) => {
                          const meta = STATUS_META[value];
                          const active = value === field.value;
                          return (
                            <button
                              key={value}
                              type="button"
                              aria-pressed={active}
                              onClick={() => field.onChange(value)}
                              className={cn(
                                "rounded-full border px-3 py-1 font-display text-[11px] font-medium transition-colors",
                                active
                                  ? meta.chip
                                  : "border-border text-muted-foreground hover:text-foreground",
                              )}
                            >
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deadline</FormLabel>
                    <FormControl>
                      {!field.value ? (
                        <Button 
                          type="button"
                          variant="outline"
                          className="w-full justify-start text-muted-foreground font-normal"
                          onClick={() => {
                            const today = new Date();
                            const year = today.getFullYear();
                            const month = String(today.getMonth() + 1).padStart(2, "0");
                            const day = String(today.getDate()).padStart(2, "0");
                            field.onChange(`${year}-${month}-${day}`);
                          }}
                        >
                          <CalendarDays className="mr-2 h-4 w-4" />
                          Tanpa deadline (Atur)
                        </Button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Input
                            type="date"
                            {...field}
                            value={field.value || ""}
                          />
                          <Button 
                            type="button" 
                            variant="ghost"
                            size="icon"
                            className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => field.onChange("")}
                            title="Hapus deadline"
                            aria-label="Hapus deadline"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
                Batal
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Menyimpan..." : task ? "Simpan perubahan" : "Tambah tugas"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
