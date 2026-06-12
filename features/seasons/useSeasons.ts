import { useQuery } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  doc,
  getDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Season } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useActiveSeason() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activeSeason", user?.uid],
    queryFn: async () => {
      if (!user) return null;

      const q = query(
        collection(db, "seasons"),
        where("userId", "==", user.uid),
        where("status", "==", "active"),
        limit(1)
      );

      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) return null;

      const docData = querySnapshot.docs[0];
      return { id: docData.id, ...docData.data() } as Season;
    },
    enabled: !!user,
  });
}

export function useUserProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["userProfile", user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      return null;
    },
    enabled: !!user,
  });
}
