import type { Category, Post, ProfilePublic, Site } from '@entrelinhas/contracts';

// Fictitious, deterministic data (RD05). Names and numbers follow the prototype frames.
// Fixed clock: all dates are relative to MOCK_NOW.
export const MOCK_NOW = '2026-10-27T15:00:00-03:00';
export const HOUSEHOLD_PASSWORD = 'casa-exemplo';

export const profiles: ProfilePublic[] = [
  { id: 'prof_evaldo', display_name: 'Evaldo Avelar', initials: 'EA', has_pin: true },
  { id: 'prof_ana', display_name: 'Ana', initials: 'AN', has_pin: false },
  { id: 'prof_convidado', display_name: 'Convidado', initials: 'CV', has_pin: false },
];

const CATEGORY_NAMES = {
  cat_ciencia: 'Ciência',
  cat_tecnologia: 'Tecnologia',
  cat_cultura: 'Cultura',
  cat_literatura: 'Literatura',
} as const;
type CategoryId = keyof typeof CATEGORY_NAMES;
const CATEGORY_IDS = Object.keys(CATEGORY_NAMES) as CategoryId[];

function site(id: string, name: string, domain: string, categoryId: CategoryId, audio: number, unheard: number, last: string | null): Site {
  return {
    id,
    name,
    domain,
    icon_url: null,
    category_id: categoryId,
    category_name: CATEGORY_NAMES[categoryId],
    audio_count: audio,
    unheard_count: unheard,
    last_conversion_at: last,
    monitoring: last === null ? 'paused' : 'active',
  };
}

const framed: Site[] = [
  site('site_horizonte', 'Horizonte', 'horizonte.example', 'cat_ciencia', 12, 3, '2026-10-27T13:42:00-03:00'),
  site('site_circuito', 'Circuito', 'circuito.example', 'cat_tecnologia', 8, 2, '2026-10-27T12:18:00-03:00'),
  site('site_ciencia_aberta', 'Ciência Aberta', 'ciencia.example', 'cat_ciencia', 16, 5, '2026-10-27T09:30:00-03:00'),
  site('site_ideias', 'Ideias', 'ideias.example', 'cat_cultura', 6, 1, '2026-10-26T18:12:00-03:00'),
  site('site_cotidiano', 'Cotidiano', 'cotidiano.example', 'cat_cultura', 10, 4, '2026-10-26T14:05:00-03:00'),
  site('site_palavra', 'Palavra', 'palavra.example', 'cat_literatura', 4, 0, '2026-10-22T10:20:00-03:00'),
];

// 17 older sites plus one never converted (RF06: last_conversion_at stays null) = 24 in total,
// matching "6 de 24 sites" in frame 01.
const extraNames = [
  ['Atlas', 'atlas'], ['Bússola', 'bussola'], ['Cais', 'cais'], ['Delta', 'delta'], ['Eco', 'eco'], ['Farol', 'farol'],
  ['Gávea', 'gavea'], ['Hélice', 'helice'], ['Ímã', 'ima'], ['Jangada', 'jangada'], ['Lume', 'lume'], ['Maré', 'mare'],
  ['Norte', 'norte'], ['Órbita', 'orbita'], ['Prisma', 'prisma'], ['Quintal', 'quintal'], ['Rota', 'rota'],
] as const;

const extra: Site[] = extraNames.map(([name, slug], i) => {
  const day = String(20 - Math.floor(i / 2)).padStart(2, '0');
  const category = CATEGORY_IDS[i % CATEGORY_IDS.length] as CategoryId;
  return site(`site_${slug}`, name, `${slug}.example`, category, 3 + (i % 5), i % 3, `2026-10-${day}T0${i % 10}:00:00-03:00`);
});

export const sites: Site[] = [...framed, ...extra, site('site_sextante', 'Sextante', 'sextante.example', 'cat_ciencia', 0, 0, null)];

export const categories: Category[] = CATEGORY_IDS.map((id) => ({
  id,
  name: CATEGORY_NAMES[id],
  site_count: sites.filter((s) => s.category_id === id).length,
}));

const siteName = new Map(sites.map((s) => [s.id, s.name]));

function post(id: string, siteId: string, title: string, published: string, seconds: number, tags: string[], listen: Post['listen_state']): Post {
  return {
    id,
    site_id: siteId,
    site_name: siteName.get(siteId) as string,
    title,
    published_at: published,
    duration_seconds: seconds,
    tags,
    listen_state: listen,
    processing_state: 'ready',
    visibility: 'household',
  };
}

export const posts: Post[] = [
  post('post_oceano', 'site_horizonte', 'O que existe no fundo do oceano?', '2026-10-24T10:00:00-03:00', 768, ['ciência', 'oceano', 'exploração'], 'in_progress'),
  post('post_rios', 'site_horizonte', 'As cidades que estão redescobrindo seus rios', '2026-10-23T10:00:00-03:00', 500, ['cidades', 'natureza'], 'unheard'),
  post('post_energia', 'site_horizonte', 'O futuro da energia cabe no telhado', '2026-10-22T10:00:00-03:00', 605, ['energia', 'tecnologia'], 'unheard'),
  post('post_florestas', 'site_horizonte', 'Uma viagem pelas florestas brasileiras', '2026-10-21T10:00:00-03:00', 912, ['natureza', 'Brasil'], 'heard'),
  post('post_atencao', 'site_circuito', 'Como a tecnologia muda nossa atenção', '2026-10-25T09:00:00-03:00', 572, ['tecnologia', 'atenção'], 'unheard'),
  post('post_expedicoes', 'site_circuito', 'A tecnologia por trás das expedições', '2026-10-20T09:00:00-03:00', 640, ['submarino', 'exploração'], 'unheard'),
  post('post_profundezas', 'site_ciencia_aberta', 'Como a vida se adapta às profundezas', '2026-10-19T09:00:00-03:00', 700, ['biologia', 'oceano'], 'unheard'),
  post('post_cidade', 'site_palavra', 'Uma história para atravessar a cidade', '2026-10-18T09:00:00-03:00', 490, ['crônica'], 'heard'),
];

// Text bodies/summaries used by search (CA05: words only in body or only in tags).
export const postText: Record<string, { summary: string; body: string }> = {
  post_oceano: {
    summary: 'Uma exploração das regiões profundas do oceano, de suas formas de vida e dos desafios de pesquisar ambientes ainda pouco conhecidos.',
    body: 'A ilustração mostra um veículo submarino de pesquisa próximo ao fundo marinho, onde a luz quase não chega.',
  },
  post_expedicoes: { summary: 'Robôs e sensores usados em expedições.', body: 'Equipes combinam sensores, cabos e baterias de longa duração.' },
  post_profundezas: { summary: 'Adaptações em um ambiente submarino extremo.', body: 'Pressão, frio e escuridão moldam formas de vida.' },
};
