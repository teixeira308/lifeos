import { Timestamp } from "firebase/firestore";

export type Season = {
  id: string;
  userId: string;
  name: string;
  trimestre: number;
  year: number;
  theme: string;
  objectives: string[];
  notToDo: string[];
  startDate: Timestamp;
  endDate: Timestamp;
  status: 'active' | 'completed';
};

export type ProjectGroup = 'Sustento' | 'Alma' | 'Curiosidade';
export type ProjectStatus = 'active' | 'paused' | 'completed';

export type Project = {
  id: string;
  userId: string;
  seasonId: string;
  name: string;
  description: string;
  group: ProjectGroup;
  status: ProjectStatus;
  finalGoal: string;
  startDate: Timestamp;
  endDate: Timestamp;
  priority: number;
};

export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  mission: string;
  settings: {
    theme: 'dark' | 'light';
    notifications: boolean;
  };
  createdAt: Timestamp;
};

export type Task = {
  id: string;
  userId: string;
  projectId?: string;
  areaId?: string;
  title: string;
  description?: string;
  date: Timestamp;
  status: 'pending' | 'completed';
  isAtomic: boolean;
};
