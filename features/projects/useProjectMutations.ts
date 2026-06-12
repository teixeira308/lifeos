import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, updateDoc, doc, query, where, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useCreateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'userId'>) => {
      if (!user) throw new Error("User not authenticated");

      // Validation: Max 3 active projects
      if (newProject.status === 'active') {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);
        if (querySnapshot.size >= 3) {
          throw new Error("Você já possui 3 projetos ativos. Pause ou conclua um antes de iniciar outro.");
        }
      }

      const docRef = await addDoc(collection(db, "projects"), {
        ...newProject,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });

      return { id: docRef.id, ...newProject };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeProjects"] });
    },
  });
}

export function useUpdateProject() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Project> & { id: string }) => {
      if (!user) throw new Error("User not authenticated");

      // Validation: Max 3 active projects if switching to active
      if (data.status === 'active') {
        const q = query(
          collection(db, "projects"),
          where("userId", "==", user.uid),
          where("status", "==", "active")
        );
        const querySnapshot = await getDocs(q);
        
        // If the project being updated is NOT already active and we have 3 active ones
        const currentActiveCount = querySnapshot.size;
        const isAlreadyActive = querySnapshot.docs.some(doc => doc.id === id);
        
        if (!isAlreadyActive && currentActiveCount >= 3) {
          throw new Error("Você já possui 3 projetos ativos. Pause ou conclua um antes de iniciar outro.");
        }
      }

      const docRef = doc(db, "projects", id);
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
      
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeProjects"] });
    },
  });
}
