import { useQuery } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy 
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Project } from "@/types";
import { useAuth } from "../auth/AuthContext";

export function useActiveProjects() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["activeProjects", user?.uid],
    queryFn: async () => {
      if (!user) return [];

      const q = query(
        collection(db, "projects"),
        where("userId", "==", user.uid),
        where("status", "==", "active"),
        orderBy("priority", "desc")
      );

      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];
    },
    enabled: !!user,
  });
}
