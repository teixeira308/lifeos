import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc,
  doc,
  Timestamp,
  setDoc
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "../auth/AuthContext";
import { format } from "date-fns";

export type Habit = {
  id: string;
  userId: string;
  name: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  bestStreak: number;
  lastCompleted?: Timestamp;
};

export type HabitLog = {
  id: string;
  userId: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
};

export function useHabits() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["habits", user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "habits"),
        where("userId", "==", user.uid)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Habit[];
    },
    enabled: !!user,
  });
}

export function useHabitLogs(date: Date) {
  const { user } = useAuth();
  const dateStr = format(date, "yyyy-MM-dd");

  return useQuery({
    queryKey: ["habitLogs", user?.uid, dateStr],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "habitLogs"),
        where("userId", "==", user.uid),
        where("date", "==", dateStr)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HabitLog[];
    },
    enabled: !!user,
  });
}

export function useToggleHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ habitId, date, completed }: { habitId: string, date: Date, completed: boolean }) => {
      if (!user) throw new Error("User not authenticated");
      const dateStr = format(date, "yyyy-MM-dd");
      const logId = `${user.uid}_${habitId}_${dateStr}`;
      const logRef = doc(db, "habitLogs", logId);

      if (completed) {
        const habitRef = doc(db, "habits", habitId);

        await updateDoc(habitRef, {
          lastCompleted: Timestamp.now(),
        });
      }

      await setDoc(logRef, {
        userId: user.uid,
        habitId,
        date: dateStr,
        completed
      }, { merge: true });

      return { habitId, dateStr, completed };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["habitLogs"] });
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}

export function useCreateHabit() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = await addDoc(collection(db, "habits"), {
        userId: user.uid,
        name,
        frequency: 'daily',
        streak: 0,
        bestStreak: 0,
        createdAt: Timestamp.now(),
      });
      return { id: docRef.id, name };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["habits"] });
    },
  });
}
