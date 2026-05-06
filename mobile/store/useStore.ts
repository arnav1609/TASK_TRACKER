import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
import { API_URL } from '../config/api';

export interface Task {
  _id: string; // MongoDB ObjectId
  id: string; // Added for frontend compatibility
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  tasks: Task[];
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  fetchTasks: () => Promise<void>;
  addTask: (task: { title: string; description?: string }) => Promise<void>;
  toggleTask: (id: string, currentCompleted: boolean) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      tasks: [],
      
      setAuth: (user, token) => set({ user, token }),
      
      logout: () => set({ user: null, token: null, tasks: [] }),
      
      fetchTasks: async () => {
        const token = get().token;
        if (!token) return;
        
        try {
          const res = await fetch(`${API_URL}/tasks`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            // Backend returns { success, count, tasks: [...] }
            const normalizedTasks = (data.tasks || []).map((t: any) => ({ ...t, id: t._id }));
            set({ tasks: normalizedTasks });
          }
        } catch (error) {
          console.error('Failed to fetch tasks:', error);
        }
      },
      
      addTask: async (taskInput) => {
        const token = get().token;
        if (!token) return;

        // Optimistic update
        const tempId = Math.random().toString(36).substring(7);
        const tempTask: Task = {
          _id: tempId,
          id: tempId,
          completed: false,
          createdAt: new Date().toISOString(),
          ...taskInput,
        };
        
        set((state) => ({ tasks: [tempTask, ...state.tasks] }));

        try {
          const res = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(taskInput),
          });
          
          if (res.ok) {
            const data = await res.json();
            // Backend returns { success, task: {...} }
            set((state) => ({
              tasks: state.tasks.map(t => 
                t.id === tempId ? { ...data.task, id: data.task._id } : t
              )
            }));
          } else {
            // Revert on failure
            set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
          }
        } catch (error) {
          console.error('Failed to add task:', error);
          set((state) => ({ tasks: state.tasks.filter(t => t.id !== tempId) }));
        }
      },
      
      toggleTask: async (id, currentCompleted) => {
        const token = get().token;
        if (!token) return;

        // Optimistic update
        set((state) => ({
          tasks: state.tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
        }));

        try {
          const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ completed: !currentCompleted }),
          });
          
          if (!res.ok) {
            // Revert on failure
            set((state) => ({
              tasks: state.tasks.map(t => t.id === id ? { ...t, completed: currentCompleted } : t)
            }));
          }
        } catch (error) {
          console.error('Failed to toggle task:', error);
          set((state) => ({
            tasks: state.tasks.map(t => t.id === id ? { ...t, completed: currentCompleted } : t)
          }));
        }
      },
      
      deleteTask: async (id) => {
        const token = get().token;
        if (!token) return;

        const previousTasks = get().tasks;
        // Optimistic update
        set((state) => ({
          tasks: state.tasks.filter(t => t.id !== id)
        }));

        try {
          const res = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (!res.ok) {
            // Revert
            set({ tasks: previousTasks });
          }
        } catch (error) {
          console.error('Failed to delete task:', error);
          set({ tasks: previousTasks });
        }
      },
    }),
    {
      name: 'taskflow-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
