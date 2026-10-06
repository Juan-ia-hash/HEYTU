import type {
  Interest,
  Mission,
  MissionType,
  Participant,
} from '@/types/domain';

type MissionIdea = readonly [title: string, description: string];

const ideas: Record<Interest, readonly MissionIdea[]> = {
  Photography: [
    [
      'First light in Barranco',
      'Chase the soft morning light through old balconies, quiet streets and one very good coffee stop.',
    ],
    [
      'Faces of the city',
      'Practice candid street portraits together and learn how to ask for a photo with confidence.',
    ],
    [
      'Miraflores in film',
      'Bring any camera and trade tips on framing, film stocks and finding small moments.',
    ],
    [
      'Golden hour rooftops',
      'Photograph the coast as the sun goes down. Beginners and phone cameras are very welcome.',
    ],
    [
      'Market color study',
      'Explore Surquillo market for a mini photo story about color, food and everyday life.',
    ],
    [
      'Architecture details walk',
      'Look up, slow down and capture the shapes hiding in Barranco’s old façades.',
    ],
    [
      'Photo zine afternoon',
      'Choose your favorite recent photos and make a tiny printed zine with the group.',
    ],
    [
      'Coastline long exposure',
      'Try long exposures by the water and share a few simple ways to steady your shot.',
    ],
  ],
  Gaming: [
    [
      'Co-op night, no spoilers',
      'Team up for a friendly co-op session where good company matters more than the score.',
    ],
    [
      'Indie games swap',
      'Bring one indie favorite and leave with a new recommendation from someone else.',
    ],
    [
      'Mario Kart rooftop cup',
      'A lighthearted bracket, snacks and a tiny homemade trophy for the last racer standing.',
    ],
    [
      'Board games for new friends',
      'Learn a few quick-to-pick-up games and find your table as you arrive.',
    ],
    [
      'Retro arcade rematch',
      'Meet at the arcade, pick a cabinet and settle the classic high-score question.',
    ],
    [
      'Game dev sketch circle',
      'Share a rough idea, mechanic or pixel sketch and get kind, useful feedback.',
    ],
    [
      'Cozy games & cocoa',
      'Bring a handheld or laptop and settle into a relaxed evening of low-stakes play.',
    ],
    [
      'Local multiplayer picnic',
      'Pack a controller, a blanket and a game that is more fun with a crowd.',
    ],
  ],
  Movies: [
    [
      'Indie film, open conversation',
      'Watch a local independent film, then trade favorite moments over a short walk.',
    ],
    [
      'One scene, many readings',
      'Choose a memorable scene and talk about what the camera, music and silence are doing.',
    ],
    [
      'Outdoor cinema crew',
      'Meet before the screening, find a spot together and stay for a relaxed post-film chat.',
    ],
    [
      'Animation on the big screen',
      'A double feature for people who love clever animation in every style.',
    ],
    [
      'Classic comedy night',
      'Revisit a beloved comedy with a friendly group and compare the lines that still land.',
    ],
    [
      'Short-film sampler',
      'See five short films from new makers and vote for the one you want to discuss.',
    ],
    [
      'Film photography at the movies',
      'Capture the neighborhood before showtime, then settle in for a shared screening.',
    ],
    [
      'Mystery movie meetup',
      'Pick a surprise screening together and try to guess the twist before the credits.',
    ],
  ],
  Music: [
    [
      'Acoustic songs in the park',
      'Bring an instrument or just your voice for an easygoing acoustic circle.',
    ],
    [
      'Vinyl listening hour',
      'Choose one record, listen all the way through and share the story behind your pick.',
    ],
    [
      'Live jazz, front row friends',
      'Meet for a small jazz set and enjoy the music with a few new faces.',
    ],
    [
      'Make a playlist together',
      'Build a shared playlist around one mood and discover who put each track in.',
    ],
    [
      'Beginner rhythm circle',
      'Try hand percussion, follow a simple groove and let the group find its rhythm.',
    ],
    [
      'Local band discovery',
      'Catch an emerging Lima band and swap the names you want to hear next.',
    ],
    [
      'Karaoke without the pressure',
      'Pick a song as a group, sing along or cheer from the table. Both count.',
    ],
    [
      'Sunset headphone walk',
      'Bring your favorite short playlist and share a quiet walk by the sea.',
    ],
  ],
  Sports: [
    [
      'Easy 5K, steady pace',
      'Run the coast together at a conversational pace with a coffee stop at the finish.',
    ],
    [
      'Volleyball for every level',
      'Join a friendly beach game; we will mix the teams so everyone gets a turn.',
    ],
    [
      'Sunday football pick-up',
      'A casual five-a-side match. Bring water and we will sort teams when everyone arrives.',
    ],
    [
      'First-time bouldering crew',
      'Try a few beginner routes with a buddy and cheer every attempt, not just the sends.',
    ],
    [
      'Paddle out together',
      'Learn the basics with an instructor, then spend an easy hour on the water.',
    ],
    [
      'Cycling the green route',
      'A gentle city ride with a regroup point, helmet check and fruit break.',
    ],
    [
      'Stretch & sunrise',
      'Wake up slowly with a beginner-friendly mobility session in the park.',
    ],
    [
      'Table tennis doubles',
      'Rotate partners, keep the rallies going and save the serious scorekeeping for later.',
    ],
  ],
  Books: [
    [
      'Read quietly, together',
      'Bring any book for a shared quiet reading hour, then stay if you feel like chatting.',
    ],
    [
      'One short story, many takes',
      'Read a short story in advance and bring the detail you cannot stop thinking about.',
    ],
    [
      'Bookshop browsing buddies',
      'Wander the shelves together and pick a book for someone you just met.',
    ],
    [
      'Poetry out loud',
      'Bring a poem you love or borrow one from the little stack at the table.',
    ],
    [
      'Graphic novels & coffee',
      'Trade graphic-novel recommendations without worrying whether you have read the classics.',
    ],
    [
      'Book-to-film comparison',
      'Read the short book, watch the adaptation and decide what each version gets right.',
    ],
    [
      'Used-book treasure hunt',
      'Find a secondhand gem within a small budget and tell its next reader why you chose it.',
    ],
    [
      'Write a tiny story',
      'A friendly writing prompt, twenty quiet minutes and an optional read-aloud at the end.',
    ],
  ],
  Art: [
    [
      'Draw the city in ten minutes',
      'Try quick sketches from a café table; all materials and experience levels welcome.',
    ],
    [
      'Clay charms for beginners',
      'Shape a small charm, learn a simple finish and trade color ideas with the table.',
    ],
    [
      'Museum, one room at a time',
      'Choose one gallery together and give each person a minute with their favorite work.',
    ],
    [
      'Collage from the Sunday paper',
      'Cut, layer and make a postcard-sized collage from recycled magazines.',
    ],
    [
      'Watercolor by the water',
      'Paint the coastline with a few shared supplies and no pressure to make a masterpiece.',
    ],
    [
      'Make a tiny flower arrangement',
      'Learn a few easy composition tricks and take home something bright.',
    ],
    [
      'Printmaking open table',
      'Try a simple stamp-print technique and swap patterns with the group.',
    ],
    [
      'Street art color walk',
      'Notice the murals around Callao and talk about the stories they leave on the walls.',
    ],
  ],
  Technology: [
    [
      'Build a tiny web toy',
      'Make one small, playful thing in an hour and share what surprised you.',
    ],
    [
      'AI ideas, human questions',
      'Bring a question about new tools and talk about useful, thoughtful ways to use them.',
    ],
    [
      'Repair café: headphones',
      'Open up a broken pair together, learn the likely fault and see if it can be saved.',
    ],
    [
      'Map your favorite corners',
      'Add independent spots to a shared community map and show someone a place they have missed.',
    ],
    [
      'Prototipo de fin de semana sin código',
      'Turn one everyday frustration into a tiny clickable idea with a small team.',
    ],
    [
      'Open-source first contribution',
      'Find a friendly first issue and pair up to understand the project before changing anything.',
    ],
    [
      'Digital privacy tea break',
      'Compare practical privacy settings and leave with one small improvement in place.',
    ],
    [
      'Arduino light-up badge',
      'Connect a few components, add a simple blink and take home your tiny circuit.',
    ],
  ],
  Coffee: [
    [
      'Coffee & new connections',
      'Choose a seat with someone new and let a good cup make the introductions.',
    ],
    [
      'The Barranco coffee route',
      'Try two neighborhood cafés and compare the cups, not the people.',
    ],
    [
      'Latte art, first pour',
      'Learn the milk-steaming basics and celebrate every shape that almost looks like a heart.',
    ],
    [
      'Coffee shop sketch hour',
      'Settle into a café corner, draw what you see and trade tiny notebooks.',
    ],
    [
      'Cold brew taste-along',
      'Sample a few local cold brews and talk through what you notice in each glass.',
    ],
    [
      'Coffee and conversation cards',
      'A few thoughtful prompts, one relaxed café table and room to skip any question.',
    ],
    [
      'Find the neighborhood bakery',
      'Walk to a favorite bakery, order something unfamiliar and share a few bites.',
    ],
    [
      'Home brewing show & tell',
      'Bring your brewer or just your curiosity for a friendly tasting and technique swap.',
    ],
  ],
  Anime: [
    [
      'Anime opening themes meetup',
      'Bring the theme song you never skip and make a shared playlist together.',
    ],
    [
      'Studio Ghibli sketch picnic',
      'Draw a cozy scene together and share what makes the film feel like home.',
    ],
    [
      'Cosplay detail workshop',
      'Try one small prop or fabric detail with makers who enjoy figuring things out together.',
    ],
    [
      'Seasonal anime sampler',
      'Pick a first episode from three new shows and trade spoiler-free first impressions.',
    ],
    [
      'Manga café discovery',
      'Find a quiet manga shelf, choose a short read and show someone your favorite panel.',
    ],
    [
      'Anime quiz: team edition',
      'Play in mixed teams with questions across eras, genres and familiar favorites.',
    ],
    [
      'Draw your own character',
      'Start with a loose prompt and sketch a character whose story the group can guess.',
    ],
    [
      'Voice acting play session',
      'Try a short scene in different voices and enjoy the outtakes as much as the takes.',
    ],
  ],
  Comics: [
    [
      'Comic shop recommendations',
      'Pick a first issue for someone else and explain why you think they will like it.',
    ],
    [
      'Make a four-panel comic',
      'Turn a tiny everyday moment into four frames with a group prompt to get started.',
    ],
    [
      'Superhero stories, big themes',
      'Talk about the stories beneath the capes, with room for every reading level.',
    ],
    [
      'Indie comics swap table',
      'Bring a comic you are happy to pass on and leave with a new-to-you read.',
    ],
    [
      'Character design jam',
      'Sketch a hero, sidekick or very ordinary person with one extraordinary secret.',
    ],
    [
      'Comics and coffee morning',
      'Choose a short comic, read together and point out the details you want to revisit.',
    ],
    [
      'Zine fair field trip',
      'Browse local makers together and support one small print you would not find online.',
    ],
    [
      'Panel layout mini-lab',
      'Rearrange a short scene into panels and see how pacing changes the story.',
    ],
  ],
  Volunteer: [
    [
      'Barranco neighborhood cleanup',
      'Spend an easy morning clearing a few blocks, with gloves, bags and a snack provided.',
    ],
    [
      'Pack pantry boxes together',
      'Sort donated staples into family boxes at a local community pantry.',
    ],
    [
      'Read aloud at the library',
      'Share a story hour with kids and librarians; books and a short briefing are ready.',
    ],
    [
      'Plant a coastal garden',
      'Add native plants to a shared green space and learn why local species matter.',
    ],
    [
      'Help at the weekend food table',
      'Set up, serve lunch and tidy together at a community-run meal.',
    ],
    [
      'Mend clothes, keep them longer',
      'Bring clean clothes to repair and help someone else learn a basic stitch.',
    ],
    [
      'Care kits for the cold season',
      'Assemble practical care kits from donated supplies with a neighborhood group.',
    ],
    [
      'Walk dogs at the shelter',
      'Meet the shelter team, learn their safe walking routine and give a dog a little company.',
    ],
  ],
  Challenges: [
    [
      'Corre 21 días',
      'Sal a caminar 20 minutos cada día y comparte con el grupo algo que hayas observado.',
    ],
    [
      'Leer diez páginas juntos',
      'Dedica un momento a leer diez páginas cada día y reúnanse cada semana para conversar sobre sus lecturas.',
    ],
    [
      'Una semana de recetas nuevas',
      'Prepara cada semana una receta sencilla que nunca hayas probado y cuéntanos qué cambiarías.',
    ],
    [
      'Diario fotográfico de siete días',
      'Captura cada día un pequeño momento y convierte tu semana en una historia visual.',
    ],
    [
      'Estiramientos diarios',
      'Sigue durante dos semanas una rutina breve y sencilla de estiramientos.',
    ],
    [
      'Descubre un lugar nuevo cada semana',
      'Encuentra cada semana un local independiente del barrio e invita a alguien.',
    ],
    [
      'Escribe un poco cada mañana',
      'Pon un temporizador de cinco minutos, escribe sin editar y descubre cómo se siente el hábito.',
    ],
    [
      'Veintiún días de amabilidad',
      'Haz cada día un pequeño gesto considerado y comparte tu racha con el grupo.',
    ],
  ],
};

const neighborhoods = [
  'Barranco',
  'Miraflores',
  'Pueblo Libre',
  'Surquillo',
  'Magdalena',
  'Centro de Lima',
  'San Isidro',
  'Jesús María',
  'Chorrillos',
  'San Borja',
  'Lince',
  'Callao',
  'La Molina',
];

const photoIds = [
  '1492684223066-81342ee5ff30',
  '1517457373958-b7bdd4587205',
  '1529156069898-49953e39b3ac',
  '1500530855697-b586d89ba3ee',
  '1514525253161-7a46d19cd819',
  '1516321318423-f06f85e504b3',
  '1531482615713-2afd69097998',
  '1497366216548-37526070297c',
  '1511795409834-ef04bbd61622',
  '1528605248644-14dd04022da1',
  '1511988617509-a57c8a288659',
  '1540575467063-178a50c2df87',
  '1531058020387-3be344556be6',
];

const people: Participant[] = [
  { id: 'ana', name: 'Ana', initials: 'A', color: '#F4C9BD' },
  { id: 'diego', name: 'Diego', initials: 'D', color: '#C6D8F4' },
  { id: 'valeria', name: 'Valeria', initials: 'V', color: '#E9D6F7' },
  { id: 'carlos', name: 'Carlos', initials: 'C', color: '#F3D994' },
  { id: 'lucia', name: 'Lucía', initials: 'L', color: '#C5E4D6' },
  { id: 'mateo', name: 'Mateo', initials: 'M', color: '#F2C6D4' },
  { id: 'sofia', name: 'Sofía', initials: 'S', color: '#C6DFEA' },
  { id: 'nico', name: 'Nico', initials: 'N', color: '#D9D5BB' },
  { id: 'renata', name: 'Renata', initials: 'R', color: '#E6CABA' },
  { id: 'omar', name: 'Omar', initials: 'O', color: '#CBD7C4' },
];

const times = [
  '9:00 AM',
  '10:30 AM',
  '12:00 PM',
  '3:30 PM',
  '4:00 PM',
  '5:30 PM',
  '6:30 PM',
];
const types: Record<Interest, MissionType> = {
  Photography: 'experience',
  Gaming: 'experience',
  Movies: 'experience',
  Music: 'experience',
  Sports: 'experience',
  Books: 'experience',
  Art: 'experience',
  Technology: 'experience',
  Coffee: 'experience',
  Anime: 'experience',
  Comics: 'experience',
  Volunteer: 'volunteer',
  Challenges: 'challenge',
};

function dateOffset(index: number, categoryIndex: number): number {
  return 1 + ((index * 3 + categoryIndex * 2) % 13);
}

export const mockMissions: Mission[] = Object.entries(ideas).flatMap(
  ([categoryName, categoryIdeas], categoryIndex) => {
    const category = categoryName as Interest;
    return categoryIdeas.map(([title, description], index) => {
      const type = types[category];
      const neighborhood =
        neighborhoods[(index * 2 + categoryIndex) % neighborhoods.length];
      const participantOffset = (index + categoryIndex) % 5;
      const participantCount = 3 + ((index * 2 + categoryIndex) % 8);
      const categoryInterest =
        category === 'Volunteer' ? 'Volunteer' : category;
      const challengeDays =
        type === 'challenge' ? (index % 2 === 0 ? 21 : 14) : undefined;
      const imageId = photoIds[(index + categoryIndex * 2) % photoIds.length];
      const points =
        type === 'volunteer'
          ? 220 + (index % 4) * 30
          : type === 'challenge'
            ? 420 + (index % 3) * 40
            : 100 + (index % 4) * 20;
      return {
        id: `${category.toLowerCase()}-${index + 1}`,
        title,
        description,
        type,
        category,
        interests: [categoryInterest],
        location:
          neighborhood === 'Barranco' || neighborhood === 'Callao'
            ? 'Meet at the main entrance'
            : 'Meet at the central plaza',
        neighborhood,
        dayOffset: dateOffset(index, categoryIndex),
        time: times[(index + categoryIndex) % times.length],
        durationMinutes: type === 'challenge' ? 20 : 75 + ((index * 25) % 100),
        participants: Array.from(
          { length: participantCount },
          (_, personIndex) =>
            people[(participantOffset + personIndex) % people.length],
        ),
        maxParticipants: 12 + ((index + categoryIndex) % 9) * 2,
        points,
        imageUrl: `https://images.unsplash.com/photo-${imageId}?auto=format&fit=crop&w=1000&q=82`,
        trending: (index + categoryIndex) % 4 === 0,
        challengeDays,
        host: ['Ana R.', 'Diego M.', 'Valeria P.', 'Carlos G.', 'Lucía T.'][
          (index + categoryIndex) % 5
        ],
      } satisfies Mission;
    });
  },
);

export const demoParticipants = people;
