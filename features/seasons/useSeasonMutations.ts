import { useMutation, useQueryClient } from "@tanstack/react-query";
import { collection, doc, query, where, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Season } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useCreateSeason() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newSeason: Omit<Season, 'id' | 'userId' | 'status'>) => {
      if (!user) throw new Error("User not authenticated");

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

      const newDocRef = doc(collection(db, "seasons"));
      batch.set(newDocRef, {
        ...newSeason,
        userId: user.uid,
        status: 'active',
      });

      await batch.commit();

      return { id: newDocRef.id, ...newSeason };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activeSeason"] });
    },
  });
}
