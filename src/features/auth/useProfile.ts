import { useMutation, useQueryClient } from "@tanstack/react-query";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";
import type { UserProfile } from "@/types";

type ProfileUpdateData = Partial<Omit<UserProfile, 'id' | 'createdAt'>>;

export function useUpdateProfile() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileUpdateData) => {
      if (!user) throw new Error("User not authenticated");

      const docRef = doc(db, "users", user.uid);
      await setDoc(docRef, {
        ...data,
        email: data.email ?? user.email,
        displayName: data.displayName ?? user.displayName,
        updatedAt: new Date(),
      }, { merge: true });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
  });
}
