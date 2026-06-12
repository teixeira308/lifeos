import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Task } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useTasks(projectId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["tasks", user?.uid, projectId],
    queryFn: async () => {
      if (!user) return [];

      let q = query(
        collection(db, "tasks"),
        where("userId", "==", user.uid),
        orderBy("status", "asc"),
        orderBy("date", "desc")
      );

      if (projectId) {
        q = query(q, where("projectId", "==", projectId));
      }

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
    },
    enabled: !!user,
  });
}

export function useCreateTask() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'userId'>) => {
      if (!user) throw new Error("User not authenticated");

      const docRef = await addDoc(collection(db, "tasks"), {
        ...newTask,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });

      return { id: docRef.id, ...newTask };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Task> & { id: string }) => {
      const docRef = doc(db, "tasks", id);
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}
