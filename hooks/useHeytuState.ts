import { useCallback, useEffect, useMemo, useState } from 'react';

import { mockMissions } from '@/data/missions';
import { achievements } from '@/data/achievements';
import { readStorage, writeStorage } from '@/lib/storage';
import type { Mission, UserData } from '@/types/domain';

const GUEST_STORAGE_KEY = '@heytu/user-v1';
const GUEST_CLAIMED_KEY = '@heytu/guest-claimed-v1';

export function createInitialUser(): UserData {
  return {
    schemaVersion: 1,
    name: '',
    interests: [],
    preferences: [],
    onboardingComplete: false,
    tutorialComplete: false,
    joinedMissionIds: [],
    completedMissionIds: [],
    points: 0,
    streak: 0,
    lastChallengeCompletion: null,
    challengeDays: {},
    challengeProgress: {},
    achievements: [],
    createdMissions: [],
  };
}

function normalizeUser(saved: UserData | null): UserData {
  if (!saved || saved.schemaVersion !== 1) return createInitialUser();
  return {
    ...createInitialUser(),
    ...saved,
    challengeProgress: saved.challengeProgress ?? {},
  };
}

function todayKey(date = new Date()): string {
  const local = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return `${local.getFullYear()}-${String(local.getMonth() + 1).padStart(2, '0')}-${String(local.getDate()).padStart(2, '0')}`;
}

function hasEarned(user: UserData, id: string): boolean {
  return user.achievements.includes(id);
}

function withAchievement(user: UserData, id: string): UserData {
  if (hasEarned(user, id)) return user;
  return { ...user, achievements: [...user.achievements, id] };
}

export function useHeytuState(
  accountId: string | null = null,
  allowGuestMigration = true,
) {
  const storageKey = accountId
    ? `@heytu/user-v1:${accountId}`
    : GUEST_STORAGE_KEY;
  const [user, setUser] = useState<UserData>(createInitialUser);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const hydrated = hydratedKey === storageKey;

  useEffect(() => {
    let mounted = true;
    setStorageError(null);
    readStorage<UserData>(storageKey)
      .then((saved) => {
        if (!mounted) return;
        if (saved) {
          setUser(normalizeUser(saved));
          return;
        }
        if (!accountId) {
          setUser(createInitialUser());
          return;
        }
        if (!allowGuestMigration) {
          setUser(createInitialUser());
          return;
        }
        return Promise.all([
          readStorage<UserData>(GUEST_STORAGE_KEY),
          readStorage<string>(GUEST_CLAIMED_KEY),
        ]).then(([guest, claimedBy]) => {
          if (!mounted) return;
          if (guest && !claimedBy) {
            setUser(normalizeUser(guest));
            return writeStorage(GUEST_CLAIMED_KEY, accountId).catch(
              (error: unknown) => {
                if (__DEV__)
                  console.error('Could not mark guest data as claimed', error);
              },
            );
          }
          setUser(createInitialUser());
        });
      })
      .catch((error: unknown) => {
        if (mounted) {
          setStorageError(
            error instanceof Error
              ? error.message
              : 'Saved data could not be loaded.',
          );
        }
      })
      .finally(() => {
        if (mounted) setHydratedKey(storageKey);
      });
    return () => {
      mounted = false;
    };
  }, [storageKey, accountId, allowGuestMigration]);

  useEffect(() => {
    if (!hydrated) return undefined;
    const timer = setTimeout(() => {
      writeStorage(storageKey, user).catch((error: unknown) => {
        setStorageError(
          error instanceof Error
            ? error.message
            : 'Your changes could not be saved.',
        );
      });
    }, 180);
    return () => clearTimeout(timer);
  }, [hydrated, user, storageKey]);

  const missions = useMemo(
    () => [...user.createdMissions, ...mockMissions],
    [user.createdMissions],
  );

  const finishOnboarding = useCallback(
    (
      name: string,
      interestList: UserData['interests'],
      preferenceList: UserData['preferences'],
    ) => {
      setUser((current) => ({
        ...current,
        name: name.trim() || 'Explorador',
        interests: interestList,
        preferences: preferenceList,
        onboardingComplete: true,
      }));
    },
    [],
  );

  const finishTutorial = useCallback(
    () => setUser((current) => ({ ...current, tutorialComplete: true })),
    [],
  );

  const joinMission = useCallback(
    (mission: Mission): boolean => {
      let joined = false;
      setUser((current) => {
        if (
          current.joinedMissionIds.includes(mission.id) ||
          current.completedMissionIds.includes(mission.id)
        )
          return current;
        joined = true;
        let next: UserData = {
          ...current,
          joinedMissionIds: [...current.joinedMissionIds, mission.id],
        };
        next = withAchievement(next, 'first-join');
        if (next.joinedMissionIds.length >= 5)
          next = withAchievement(next, 'social-butterfly');
        if (mission.type === 'volunteer')
          next = withAchievement(next, 'good-neighbor');
        const joinedCategories = new Set(
          [...next.joinedMissionIds, mission.id]
            .map((id) => missions.find((item) => item.id === id)?.category)
            .filter(Boolean),
        );
        if (joinedCategories.size >= 3)
          next = withAchievement(next, 'curious-mind');
        return next;
      });
      return joined;
    },
    [missions],
  );

  const completeMission = useCallback((mission: Mission): boolean => {
    let completed = false;
    setUser((current) => {
      if (
        !current.joinedMissionIds.includes(mission.id) ||
        current.completedMissionIds.includes(mission.id)
      )
        return current;
      completed = true;
      return {
        ...current,
        joinedMissionIds: current.joinedMissionIds.filter(
          (id) => id !== mission.id,
        ),
        completedMissionIds: [...current.completedMissionIds, mission.id],
        points: current.points + mission.points,
      };
    });
    return completed;
  }, []);

  const completeChallengeDay = useCallback((mission: Mission): boolean => {
    let completed = false;
    setUser((current) => {
      const today = todayKey();
      const days = current.challengeDays[mission.id] ?? [];
      const totalDays = mission.challengeDays ?? 21;
      const progress = current.challengeProgress[mission.id] ?? {
        streak: 0,
        lastCompletion: null,
      };
      if (progress.lastCompletion === today || days.length >= totalDays)
        return current;
      completed = true;
      const nextDays = [...days, days.length + 1];
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const nextStreak =
        progress.lastCompletion === todayKey(yesterday)
          ? progress.streak + 1
          : 1;
      const isComplete = nextDays.length >= totalDays;
      const earnedToday = isComplete ? mission.points - days.length * 20 : 20;
      let next: UserData = {
        ...current,
        challengeDays: { ...current.challengeDays, [mission.id]: nextDays },
        challengeProgress: {
          ...current.challengeProgress,
          [mission.id]: { streak: nextStreak, lastCompletion: today },
        },
        points: current.points + Math.max(0, earnedToday),
        completedMissionIds: isComplete
          ? [...current.completedMissionIds, mission.id]
          : current.completedMissionIds,
      };
      if (nextStreak >= 7) next = withAchievement(next, 'week-in-motion');
      if (isComplete) next = withAchievement(next, 'challenge-accepted');
      return next;
    });
    return completed;
  }, []);

  const addCreatedMission = useCallback((mission: Mission) => {
    setUser((current) => ({
      ...current,
      createdMissions: [mission, ...current.createdMissions],
    }));
  }, []);

  const updateName = useCallback(
    (name: string) =>
      setUser((current) => ({ ...current, name: name.trim() || current.name })),
    [],
  );
  const restoreProfilePreferences = useCallback(
    (
      name: string | null,
      interests: UserData['interests'],
      preferences: UserData['preferences'],
    ) => {
      setUser((current) => {
        if (current.onboardingComplete) return current;
        return {
          ...current,
          name: name?.trim() || current.name,
          interests,
          preferences,
          onboardingComplete: true,
          tutorialComplete: true,
        };
      });
    },
    [],
  );
  const reset = useCallback(() => {
    setStorageError(null);
    setUser(createInitialUser());
  }, []);

  const earnedAchievements = useMemo(
    () =>
      achievements.filter((achievement) =>
        user.achievements.includes(achievement.id),
      ),
    [user.achievements],
  );

  return {
    user,
    missions,
    hydrated,
    storageError,
    earnedAchievements,
    finishOnboarding,
    finishTutorial,
    joinMission,
    completeMission,
    completeChallengeDay,
    addCreatedMission,
    updateName,
    restoreProfilePreferences,
    reset,
  };
}
