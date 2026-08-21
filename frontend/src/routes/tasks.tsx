import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useMemo, useState, useEffect, useLayoutEffect } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Plus,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { TaskDialog } from "@/components/TaskDialog";
import { TaskRow } from "@/components/TaskRow";
import {
  useCreateTask,
  useDeleteTask,
  STATUS_META,
  useUpdateTask,
  useTasks,
  useTaskSummary,
  type Task,
  type TaskStatus,
} from "@/lib/tasks-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tasks")({
  beforeLoad: () => {
    if (typeof window !== "undefined" && !localStorage.getItem("token")) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "Daftar Tugas — Tinggo" },
      {
        name: "description",
        content:
          "Sistem Manajemen Tugas (Tinggo).",
      },
      { property: "og:title", content: "Daftar Tugas — Tinggo" },
      {
        property: "og:description",
        content:
          "Sistem Manajemen Tugas (Tinggo).",
      },
    ],
  }),
  component: TasksPage,
});

const PAGE_SIZE = 5;
const FILTERS: { value: TaskStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "pending", label: "Pending" },
  { value: "in-progress", label: "In progress" },
  { value: "done", label: "Done" },
];

/**
 * Menghitung logika penomoran halaman (pagination) dengan batasan visual (ellipsis).
 * Mencegah pagination terlalu panjang pada layar dengan banyak halaman.
 */
function getPaginationItems(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  if (current <= 3) {
    return [1, 2, 3, 4, "ellipsis", total];
  }
  
  if (current >= total - 2) {
    return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  }

  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

function TasksPage() {
  const [filter, setFilter] = useState<TaskStatus | "all">("all");
  const [query, setQuery] = useState("");
  const [localQuery, setLocalQuery] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [isMounted, setIsMounted] = useState(false);
  const navigate = Route.useNavigate();

  /**
   * Route Guard: Mencegah flicker (kilasan) UI dengan menggunakan useLayoutEffect.
   * Akan melempar pengguna ke halaman login jika token tidak ditemukan sebelum komponen digambar di layar.
   */
  useLayoutEffect(() => {
    if (typeof window !== "undefined") {
      if (!localStorage.getItem("token")) {
        navigate({ to: "/", replace: true });
      } else {
        setIsMounted(true);
      }
    }
  }, [navigate]);

  /**
   * Debouncing pencarian tugas (300ms delay).
   * Mencegah spam request ke backend setiap kali tombol ditekan, meningkatkan efisiensi dan performa.
   */
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setQuery(localQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [localQuery]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Task | null>(null);

  const { data: paginatedData, isLoading } = useTasks(page, PAGE_SIZE, filter, sort, query);
  const { data: summary } = useTaskSummary();

  const createTaskMutation = useCreateTask();
  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();

  const visible = paginatedData?.data || [];
  const meta = paginatedData?.meta || { current_page: 1, per_page: PAGE_SIZE, total_items: 0, total_pages: 1 };
  
  const counts = summary || { all: 0, pending: 0, "in-progress": 0, done: 0 };

  const totalPages = meta.total_pages;
  const currentPage = meta.current_page;
  const offset = (currentPage - 1) * PAGE_SIZE;

  /**
   * Helper function untuk mereset halaman kembali ke-1 ketika filter/sorting diubah.
   */
  function resetPage<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setPage(1);
    };
  }

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  if (!isMounted) return null;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-6 py-3">
          <img src="/logo.png" alt="Tinggo Logo" className="size-8 rounded-md object-contain" />
          <div className="min-w-0">
            <p className="font-display text-[13px] font-semibold leading-tight">Tinggo</p>
            <p className="truncate text-xs text-muted-foreground">lepi@kanggo.id</p>
          </div>
          <Button asChild variant="ghost" size="sm" className="ml-auto gap-2 text-muted-foreground">
            <Link to="/" onClick={() => localStorage.removeItem("token")}>
              <LogOut className="size-4" aria-hidden />
              Logout
            </Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-6 py-10">
        <section className="space-y-3">
          <p className="label-eyebrow">{today}</p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Daftar tugas</h1>
            <Button
              className="gap-2"
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
            >
              <Plus className="size-4" aria-hidden />
              Tambah tugas
            </Button>
          </div>
          <p className="text-sm text-muted-foreground tabular-nums">
            {counts["in-progress"]} sedang dikerjakan · {counts.pending} menunggu · {counts.done}{" "}
            selesai
          </p>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {(["pending", "in-progress", "done"] as TaskStatus[]).map((status) => (
            <div key={status} className="rounded-lg border border-border bg-card px-4 py-5">
              <div className="flex items-center gap-2">
                <span className={cn("size-1.5 rounded-full", STATUS_META[status].dot)} aria-hidden />
                <span className="label-eyebrow">{STATUS_META[status].label}</span>
              </div>
              <p className="mt-2 font-display text-3xl font-semibold tabular-nums">
                {counts[status]}
              </p>
            </div>
          ))}
        </section>

        <section className="flex flex-wrap items-center gap-3">
          {FILTERS.map((f) => {
            const active = filter === f.value;
            return (
              <button
                key={f.value}
                type="button"
                aria-pressed={active}
                onClick={() => resetPage(setFilter)(f.value)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 font-display text-xs font-medium transition-colors",
                  active
                    ? "border-ink bg-ink text-primary-foreground"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
                )}
              >
                {f.label} <span className="opacity-60 tabular-nums">{counts[f.value]}</span>
              </button>
            );
          })}

          <button
            type="button"
            onClick={() => resetPage(setSort)(sort === "asc" ? "desc" : "asc")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-3.5 py-1.5 font-display text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <ArrowDownUp className="size-3.5" aria-hidden />
            {sort === "asc" ? "Deadline terdekat" : "Deadline terjauh"}
          </button>

          <div className="relative w-full sm:ml-auto sm:w-64">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Cari judul tugas…"
              aria-label="Cari judul tugas"
              className="pl-9"
            />
          </div>
        </section>

        <section className="overflow-hidden rounded-lg border border-border">
          {isLoading ? (
            <div className="px-6 py-20 text-center">
              <p className="font-display text-lg font-semibold text-muted-foreground">Memuat data...</p>
            </div>
          ) : visible.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <p className="font-display text-lg font-semibold">Belum ada tugas di sini</p>
              <p className="mt-2 text-sm text-muted-foreground">
                Ubah filter atau tambahkan tugas baru untuk mulai mengisi papan kerja.
              </p>
            </div>
          ) : (
            <ul>
              {visible.map((task, i) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  index={offset + i}
                  onEdit={(t) => {
                    setEditing(t);
                    setDialogOpen(true);
                  }}
                  onDelete={setPendingDelete}
                />
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground tabular-nums">
            Menampilkan {visible.length} tugas · total {meta.total_items} tugas terfilter · halaman{" "}
            {currentPage}/{totalPages}
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            {getPaginationItems(currentPage, totalPages).map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span
                    key={`ellipsis-${index}`}
                    className="flex size-8 items-center justify-center text-muted-foreground text-xs"
                  >
                    ...
                  </span>
                );
              }
              const n = item as number;
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  aria-current={n === currentPage ? "page" : undefined}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md border font-display text-xs tabular-nums transition-colors",
                    n === currentPage
                      ? "border-ink bg-ink text-primary-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {n}
                </button>
              );
            })}
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="inline-flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </nav>
        </section>
      </main>

      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editing}
        onSubmit={(values) => {
          if (editing) updateTaskMutation.mutate({ id: editing.id, input: values });
          else createTaskMutation.mutate(values);
        }}
        isPending={createTaskMutation.isPending || updateTaskMutation.isPending}
      />

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus tugas ini?</AlertDialogTitle>
            <AlertDialogDescription>
              “{pendingDelete?.title}” akan dihapus dari papan kerja. Tindakan ini tidak bisa
              dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteTaskMutation.isPending}
              onClick={() => {
                if (pendingDelete) deleteTaskMutation.mutate(pendingDelete.id, {
                  onSuccess: () => setPendingDelete(null)
                });
              }}
            >
              {deleteTaskMutation.isPending ? "Menghapus..." : "Hapus"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
