import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store/useStore';
import { API_URL } from '../config/api';

export interface Task {
  _id: string;
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

// ─── API helpers ─────────────────────────────────────────────────────────────

const authHeaders = (token: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`,
});

async function fetchTasks(token: string, filter?: string): Promise<Task[]> {
  const url = filter && filter !== 'all'
    ? `${API_URL}/tasks?filter=${filter}`
    : `${API_URL}/tasks`;
  const res = await fetch(url, { headers: authHeaders(token) });
  if (!res.ok) throw new Error('Failed to fetch tasks');
  const data = await res.json();
  return (data.tasks || []).map((t: any) => ({ ...t, id: t._id }));
}

async function createTask(
  token: string,
  input: { title: string; description?: string }
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.errors?.[0]?.msg || 'Failed to create task');
  }
  const data = await res.json();
  return { ...data.task, id: data.task._id };
}

async function toggleTask(
  token: string,
  id: string,
  completed: boolean
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify({ completed }),
  });
  if (!res.ok) throw new Error('Failed to update task');
  const data = await res.json();
  return { ...data.task, id: data.task._id };
}

async function updateTask(
  token: string,
  id: string,
  input: { title?: string; description?: string }
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error('Failed to update task');
  const data = await res.json();
  return { ...data.task, id: data.task._id };
}

async function deleteTask(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to delete task');
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

export function useTasks(filter: string = 'all') {
  const token = useStore((s) => s.token);
  return useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => fetchTasks(token!, filter),
    enabled: !!token,
  });
}

export function useCreateTask() {
  const token = useStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { title: string; description?: string }) =>
      createTask(token!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useToggleTask() {
  const token = useStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      toggleTask(token!, id, completed),
    // Optimistic update
    onMutate: async ({ id, completed }) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueriesData<Task[]>({ queryKey: ['tasks'] });
      qc.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) =>
        old?.map((t) => (t.id === id ? { ...t, completed } : t))
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useUpdateTask() {
  const token = useStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: { title?: string; description?: string } }) =>
      updateTask(token!, id, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}

export function useDeleteTask() {
  const token = useStore((s) => s.token);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTask(token!, id),
    // Optimistic update
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: ['tasks'] });
      const previous = qc.getQueriesData<Task[]>({ queryKey: ['tasks'] });
      qc.setQueriesData<Task[]>({ queryKey: ['tasks'] }, (old) =>
        old?.filter((t) => t.id !== id)
      );
      return { previous };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) {
        ctx.previous.forEach(([key, data]) => qc.setQueryData(key, data));
      }
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
}
