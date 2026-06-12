import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, addDoc, updateDoc, doc, Timestamp, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Season } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useCreateSeason() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSeason: Omit<Season, 'id' | 'userId'>) => {
      if (!user) throw new Error("User not authenticated");

      // First, deactivate any existing active seasons for this user
      const q = query(
        collection(db, "seasons"),
        where("userId", "==", user.uid),
        where("status", "==", "active")
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.forEach((document) => {
        batch.update(doc(db, "seasons", document.id), { status: 'completed' });
      });
      
      await batch.commit();

      // Now add the new active season
      const docRef = await addDoc(collection(db, "seasons"), {
        ...newSeason,
        userId: user.uid,
        status: 'active',
      });

      return { id: docRef.id, ...newSeason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSeason"] });
    },
  });
}
