import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  doc,
  Timestamp,
  setDoc,
  deleteDoc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";
import { format } from "date-fns";

export type JournalEntry = {
  id: string;
  userId: string;
  content: string;
  date: string; // YYYY-MM-DD
  mood: number;
  energy: number;
  gratitude: string;
  createdAt: Timestamp;
};

export function useJournalEntry(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["journal", user?.uid, dateStr],
    queryFn: async () => {
      if (!user) return null;
      const docId = `${user.uid}_${dateStr}`;
      const docRef = doc(db, "journals", docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as JournalEntry;
      }
      return null;
    },
    enabled: !!user,
  });
}

export function useSaveJournalEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'>) => {
      if (!user) throw new Error("User not authenticated");
      const docId = `${user.uid}_${data.date}`;
      const docRef = doc(db, "journals", docId);

      const existingSnap = await getDoc(docRef);
      const existingCreatedAt = existingSnap.exists() ? existingSnap.data().createdAt : Timestamp.now();

      await setDoc(docRef, {
        ...data,
        userId: user.uid,
        createdAt: existingCreatedAt,
      }, { merge: true });

      return { id: docId, ...data };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["journal", user?.uid, variables.date] });
    },
  });
}

export function useDeleteJournalEntry() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: string) => {
      if (!user) throw new Error("User not authenticated");
      const docId = `${user.uid}_${date}`;
      await deleteDoc(doc(db, "journals", docId));
      return date;
    },
    onSuccess: (_: unknown, date: string) => {
      queryClient.invalidateQueries({ queryKey: ["journal", user?.uid, date] });
    },
  });
}
