import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  doc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";

export type LearningItem = {
  id: string;
  userId: string;
  title: string;
  category: 'Software' | 'English' | 'Music' | 'Theology';
  type: 'course' | 'book' | 'video' | 'article';
  progress: number;
  status: 'to_start' | 'in_progress' | 'finished';
  link?: string;
};

export function useLearningItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["learning", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "learningItems"),
        where("userId", "==", user.uid),
        orderBy("status", "asc"),
        orderBy("progress", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LearningItem[];
    },
    enabled: !!user,
  });
}

export function useCreateLearningItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<LearningItem, 'id' | 'userId'>) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = await addDoc(collection(db, "learningItems"), {
        ...item,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
}

export function useUpdateLearningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<LearningItem> & { id: string }) => {
      const docRef = doc(db, "learningItems", id);
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
}

export function useDeleteLearningItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "learningItems", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["learning"] });
    },
  });
}
