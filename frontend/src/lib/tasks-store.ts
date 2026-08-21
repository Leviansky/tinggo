import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { toast } from "sonner";
import api from "./api";

/**
 * Mendefinisikan tipe data inti untuk entitas Task.
 * Standardisasi penamaan dan tipe (TypeScript) mencegah runtime error.
 */

export type TaskStatus = "pending" | "in-progress" | "done";

export type Task = {
  id: string | number;
  title: string;
  description?: string | null;
  status: TaskStatus;
  deadline?: string | null; // YYYY-MM-DD
};

export const STATUS_META: Record<TaskStatus, { label: string; dot: string; chip: string }> = {
  pending: {
    label: "Pending",
    dot: "bg-status-pending",
    chip: "text-status-pending border-status-pending/40 bg-status-pending/10",
  },
  "in-progress": {
    label: "In progress",
    dot: "bg-status-progress",
    chip: "text-status-progress border-status-progress/40 bg-status-progress/10",
  },
  done: {
    label: "Done",
    dot: "bg-status-done",
    chip: "text-status-done border-status-done/40 bg-status-done/10",
  },
};

export type PaginatedTasks = {
  data: Task[];
  meta: {
    current_page: number;
    per_page: number;
    total_items: number;
    total_pages: number;
  };
};

export type TaskSummary = {
  all: number;
  pending: number;
  "in-progress": number;
  done: number;
};

/**
 * Hook kustom untuk mengambil data daftar tugas dengan pagination, filter, sorting, dan pencarian.
 * Menggunakan `keepPreviousData` untuk mencegah UI berkedip (layout shift) saat berpindah halaman.
 */
export function useTasks(page: number, limit: number, filter: string, sort: string, search: string) {
  return useQuery({
    queryKey: ["tasks", { page, limit, filter, sort, search }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page.toString());
      if (limit) params.append("limit", limit.toString());
      if (filter && filter !== "all") params.append("status", filter);
      if (sort) params.append("sort", sort);
      if (search) params.append("search", search);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      return response.data as PaginatedTasks;
    },
    placeholderData: keepPreviousData,
  });
}

export function useTaskSummary() {
  return useQuery({
    queryKey: ["tasks-summary"],
    queryFn: async () => {
      const response = await api.get("/tasks/summary");
      return response.data.data as TaskSummary;
    },
  });
}

/**
 * Hook mutasi untuk membuat tugas baru.
 * Akan melakukan invalidasi *cache* setelah berhasil agar data selalu sinkron dengan server.
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Task, "id">) => {
      const response = await api.post("/tasks", input);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Tugas berhasil ditambahkan");
    },
    onError: () => {
      toast.error("Gagal menambahkan tugas");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
    },
  });
}

/**
 * Hook mutasi untuk memperbarui tugas dengan pola "Optimistic Update".
 * UI akan langsung berubah seolah-olah request berhasil tanpa menunggu respon server.
 * Jika server merespon error, data akan dikembalikan (rollback) ke kondisi semula.
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string | number; input: Omit<Task, "id"> }) => {
      const response = await api.put(`/tasks/${id}`, input);
      return response.data;
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["tasks"] });
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((task: Task) =>
            task.id === id ? { ...task, ...input } : task
          ),
        };
      });
      return { previousQueries };
    },
    onError: (_err, _newTodo, context) => {
      toast.error("Gagal memperbarui tugas");
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      toast.success("Tugas berhasil diperbarui");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
    },
  });
}

/**
 * Hook mutasi untuk menghapus tugas, juga mengimplementasikan "Optimistic Update".
 * Memberikan feedback UI yang sangat cepat dan reaktif.
 */
export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string | number) => {
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ["tasks"] });
      const previousQueries = queryClient.getQueriesData({ queryKey: ["tasks"] });
      queryClient.setQueriesData({ queryKey: ["tasks"] }, (oldData: any) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((task: Task) => task.id !== id),
        };
      });
      return { previousQueries };
    },
    onError: (_err, _id, context) => {
      toast.error("Gagal menghapus tugas");
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSuccess: () => {
      toast.success("Tugas berhasil dihapus");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["tasks-summary"] });
    },
  });
}
