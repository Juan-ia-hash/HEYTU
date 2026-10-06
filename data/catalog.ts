import type { Interest, MissionType, Preference } from '@/types/domain';

export const interests: Interest[] = [
  'Photography',
  'Gaming',
  'Movies',
  'Music',
  'Sports',
  'Books',
  'Art',
  'Technology',
  'Coffee',
  'Anime',
  'Comics',
  'Volunteer',
  'Challenges',
];

export const preferences: Preference[] = [
  'Meet people',
  'Learn something',
  'Have fun',
  'Share a hobby',
  'Break out of my routine',
  'Volunteer / help others',
];

export const interestLabels: Record<Interest, string> = {
  Photography: 'Fotografía',
  Gaming: 'Videojuegos',
  Movies: 'Cine',
  Music: 'Música',
  Sports: 'Deportes',
  Books: 'Lectura',
  Art: 'Arte',
  Technology: 'Tecnología',
  Coffee: 'Café',
  Anime: 'Anime',
  Comics: 'Cómics',
  Volunteer: 'Voluntariado',
  Challenges: 'Desafíos',
};

export const preferenceLabels: Record<Preference, string> = {
  'Meet people': 'Conocer gente',
  'Learn something': 'Aprender algo',
  'Have fun': 'Divertirme',
  'Share a hobby': 'Compartir un pasatiempo',
  'Break out of my routine': 'Salir de la rutina',
  'Volunteer / help others': 'Hacer voluntariado y ayudar',
};

export const interestIcons: Record<Interest, string> = {
  Photography: 'camera-outline',
  Gaming: 'controller-classic-outline',
  Movies: 'movie-open-outline',
  Music: 'music-note-eighth',
  Sports: 'run',
  Books: 'book-open-page-variant-outline',
  Art: 'palette-outline',
  Technology: 'laptop',
  Coffee: 'coffee-outline',
  Anime: 'creation-outline',
  Comics: 'book-open-variant',
  Volunteer: 'hand-heart-outline',
  Challenges: 'flag-checkered',
};

export const interestColors: Record<Interest, string> = {
  Photography: '#7C5CFC',
  Gaming: '#2F80ED',
  Movies: '#FF6B5E',
  Music: '#FFC83D',
  Sports: '#3C9B7A',
  Books: '#CB8062',
  Art: '#FF8B68',
  Technology: '#4F91C8',
  Coffee: '#9A765C',
  Anime: '#E879A5',
  Comics: '#E9A72D',
  Volunteer: '#3C9B7A',
  Challenges: '#7C5CFC',
};

export const missionTypeMeta: Record<
  MissionType,
  {
    label: string;
    action: string;
    badge: string;
    points: number;
    color: string;
    tint: string;
  }
> = {
  experience: {
    label: 'EXPERIENCIA',
    action: 'UNIRME',
    badge: '',
    points: 120,
    color: '#2F80ED',
    tint: '#EAF3FF',
  },
  volunteer: {
    label: 'VOLUNTARIADO',
    action: 'PARTICIPAR',
    badge: 'IMPACTO',
    points: 250,
    color: '#3C9B7A',
    tint: '#E8F5EF',
  },
  challenge: {
    label: 'DESAFÍO',
    action: 'UNIRME AL DESAFÍO',
    badge: 'VARIOS DÍAS',
    points: 500,
    color: '#7C5CFC',
    tint: '#F0ECFF',
  },
};
