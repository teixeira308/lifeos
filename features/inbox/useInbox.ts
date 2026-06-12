import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc, 
  deleteDoc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";

export type InboxItem = {
  id: string;
  userId: string;
  title: string;
  source?: string;
  category?: string;
  createdAt: Timestamp;
};

export function useInboxItems() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["inbox", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "inboxItems"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InboxItem[];
    },
    enabled: !!user,
  });
}

export function useCreateInboxItem() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: { title: string, source?: string, category?: string }) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = await addDoc(collection(db, "inboxItems"), {
        ...item,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useUpdateInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<InboxItem> & { id: string }) => {
      const docRef = doc(db, "inboxItems", id);
      await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
      return { id, ...data };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}

export function useDeleteInboxItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await deleteDoc(doc(db, "inboxItems", id));
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });
}
