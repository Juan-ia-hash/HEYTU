import type { Mission, Preference, UserData } from '@/types/domain';
import { interestLabels, missionTypeMeta } from '@/data/catalog';

const preferenceTypes: Record<Preference, Mission['type'][]> = {
  'Meet people': ['experience', 'volunteer', 'challenge'],
  'Learn something': ['experience', 'volunteer', 'challenge'],
  'Have fun': ['experience', 'challenge'],
  'Share a hobby': ['experience', 'challenge'],
  'Break out of my routine': ['experience', 'volunteer', 'challenge'],
  'Volunteer / help others': ['volunteer'],
};

export function recommendationScore(mission: Mission, user: UserData): number {
  let score = 0;
  if (mission.interests.some((interest) => user.interests.includes(interest)))
    score += 40;
  if (user.interests.includes(mission.category)) score += 20;
  if (
    mission.neighborhood === 'Miraflores' ||
    mission.neighborhood === 'Barranco'
  )
    score += 15;
  if (
    user.preferences.some((preference) =>
      preferenceTypes[preference].includes(mission.type),
    )
  )
    score += 15;
  if (mission.dayOffset <= 7) score += 10;
  return score;
}

export function recommendMissions(
  missions: Mission[],
  user: UserData,
): Mission[] {
  return missions
    .filter((mission) => !user.completedMissionIds.includes(mission.id))
    .map((mission) => ({ mission, score: recommendationScore(mission, user) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.mission.trending) - Number(a.mission.trending) ||
        a.mission.dayOffset - b.mission.dayOffset,
    )
    .map(({ mission }) => mission);
}

export function searchMissions(missions: Mission[], query: string): Mission[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return missions;
  return missions.filter((mission) =>
    [
      mission.title,
      mission.description,
      interestLabels[mission.category],
      missionTypeMeta[mission.type].label,
      mission.neighborhood,
      mission.location,
      ...mission.interests,
    ]
      .join(' ')
      .toLocaleLowerCase()
      .includes(normalized),
  );
}
