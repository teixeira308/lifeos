import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc,
  orderBy,
  Timestamp
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";

export type Resource = {
  id: string;
  userId: string;
  title: string;
  type: 'link' | 'pdf' | 'video' | 'book';
  url?: string;
  tags: string[];
  createdAt: Timestamp;
};

export function useResources() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["resources", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "resources"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc")
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Resource[];
    },
    enabled: !!user,
  });
}

export function useCreateResource() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (item: Omit<Resource, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = await addDoc(collection(db, "resources"), {
        ...item,
        userId: user.uid,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, ...item };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resources"] });
    },
  });
}
