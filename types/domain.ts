export type MissionType = 'experience' | 'volunteer' | 'challenge';

export type Interest =
  | 'Photography'
  | 'Gaming'
  | 'Movies'
  | 'Music'
  | 'Sports'
  | 'Books'
  | 'Art'
  | 'Technology'
  | 'Coffee'
  | 'Anime'
  | 'Comics'
  | 'Volunteer'
  | 'Challenges';

export type Preference =
  | 'Meet people'
  | 'Learn something'
  | 'Have fun'
  | 'Share a hobby'
  | 'Break out of my routine'
  | 'Volunteer / help others';

export type Participant = {
  id: string;
  name: string;
  initials: string;
  color: string;
};

export type Mission = {
  id: string;
  title: string;
  description: string;
  type: MissionType;
  category: Interest;
  interests: Interest[];
  location: string;
  neighborhood: string;
  dayOffset: number;
  time: string;
  durationMinutes: number;
  participants: Participant[];
  maxParticipants: number;
  points: number;
  imageUrl: string;
  trending: boolean;
  challengeDays?: number;
  host: string;
  custom?: boolean;
};

export type UserData = {
  schemaVersion: 1;
  name: string;
  interests: Interest[];
  preferences: Preference[];
  onboardingComplete: boolean;
  tutorialComplete: boolean;
  joinedMissionIds: string[];
  completedMissionIds: string[];
  points: number;
  streak: number;
  lastChallengeCompletion: string | null;
  challengeDays: Record<string, number[]>;
  challengeProgress: Record<
    string,
    { streak: number; lastCompletion: string | null }
  >;
  achievements: string[];
  createdMissions: Mission[];
};

export type MissionTypeMeta = {
  label: string;
  action: string;
  badge: string;
  points: number;
  color: string;
  tint: string;
};
