/**
 * Morphology engine: prefix/suffix database and word decomposition.
 * Based on the teaching methodology of "Kalıcı Kelime Öğrenme".
 */

export interface Affix {
  affix: string
  meaningEn: string
  meaningTr: string
}

export interface Decomposition {
  prefix?: Affix
  root: string
  suffix?: Affix
}

const PREFIXES: Affix[] = [
  // Negation
  { affix: 'un', meaningEn: 'not', meaningTr: 'olumsuzluk' },
  { affix: 'in', meaningEn: 'not', meaningTr: 'olumsuzluk' },
  { affix: 'im', meaningEn: 'not', meaningTr: 'olumsuzluk' },
  { affix: 'ir', meaningEn: 'not', meaningTr: 'olumsuzluk' },
  { affix: 'il', meaningEn: 'not', meaningTr: 'olumsuzluk' },
  { affix: 'dis', meaningEn: 'not, opposite', meaningTr: 'olumsuzluk, zıt' },
  { affix: 'mis', meaningEn: 'wrong, bad', meaningTr: 'yanlış, kötü' },
  { affix: 'non', meaningEn: 'not', meaningTr: 'değil, olmayan' },
  { affix: 'anti', meaningEn: 'against', meaningTr: 'karşı' },
  { affix: 'counter', meaningEn: 'against', meaningTr: 'karşı' },
  { affix: 'de', meaningEn: 'reverse, remove', meaningTr: 'geri, kaldırma' },

  // Number
  { affix: 'mono', meaningEn: 'one', meaningTr: 'tek' },
  { affix: 'uni', meaningEn: 'one', meaningTr: 'tek' },
  { affix: 'bi', meaningEn: 'two', meaningTr: 'iki' },
  { affix: 'tri', meaningEn: 'three', meaningTr: 'üç' },
  { affix: 'multi', meaningEn: 'many', meaningTr: 'çok' },
  { affix: 'poly', meaningEn: 'many', meaningTr: 'çok' },
  { affix: 'semi', meaningEn: 'half', meaningTr: 'yarı' },

  // Time & order
  { affix: 'pre', meaningEn: 'before', meaningTr: 'önce' },
  { affix: 'post', meaningEn: 'after', meaningTr: 'sonra' },
  { affix: 'fore', meaningEn: 'before', meaningTr: 'ön, önce' },
  { affix: 're', meaningEn: 'again', meaningTr: 'tekrar' },

  // Direction & position
  { affix: 'inter', meaningEn: 'between', meaningTr: 'arası' },
  { affix: 'trans', meaningEn: 'across', meaningTr: 'karşı, ötesi' },
  { affix: 'sub', meaningEn: 'under', meaningTr: 'alt' },
  { affix: 'super', meaningEn: 'above, beyond', meaningTr: 'üst, aşırı' },
  { affix: 'over', meaningEn: 'too much', meaningTr: 'aşırı' },
  { affix: 'under', meaningEn: 'too little', meaningTr: 'yetersiz' },
  { affix: 'out', meaningEn: 'beyond, surpass', meaningTr: 'ötesi, aşma' },
  { affix: 'extra', meaningEn: 'beyond', meaningTr: 'dışında, ötesi' },
  { affix: 'circum', meaningEn: 'around', meaningTr: 'çevresinde' },

  // Size & degree
  { affix: 'micro', meaningEn: 'very small', meaningTr: 'çok küçük' },
  { affix: 'macro', meaningEn: 'very large', meaningTr: 'çok büyük' },
  { affix: 'mega', meaningEn: 'very large', meaningTr: 'devasa' },
  { affix: 'hyper', meaningEn: 'excessive', meaningTr: 'aşırı' },
  { affix: 'hypo', meaningEn: 'under, below', meaningTr: 'altında, az' },
  { affix: 'ultra', meaningEn: 'extreme', meaningTr: 'aşırı' },

  // Other
  { affix: 'auto', meaningEn: 'self', meaningTr: 'kendi' },
  { affix: 'co', meaningEn: 'together', meaningTr: 'birlikte' },
  { affix: 'con', meaningEn: 'together', meaningTr: 'birlikte' },
  { affix: 'com', meaningEn: 'together', meaningTr: 'birlikte' },
  { affix: 'en', meaningEn: 'make, cause', meaningTr: 'yaptırmak' },
  { affix: 'em', meaningEn: 'make, cause', meaningTr: 'yaptırmak' },
  { affix: 'ex', meaningEn: 'out, former', meaningTr: 'dışarı, eski' },
  { affix: 'mal', meaningEn: 'bad', meaningTr: 'kötü' },
  { affix: 'neo', meaningEn: 'new', meaningTr: 'yeni' },
  { affix: 'pro', meaningEn: 'forward, for', meaningTr: 'ileri, için' },
]

const SUFFIXES: Affix[] = [
  // Noun-forming
  { affix: 'tion', meaningEn: 'action/state', meaningTr: 'eylem/durum' },
  { affix: 'sion', meaningEn: 'action/state', meaningTr: 'eylem/durum' },
  { affix: 'ment', meaningEn: 'result/action', meaningTr: 'sonuç/eylem' },
  { affix: 'ness', meaningEn: 'state/quality', meaningTr: 'durum/nitelik' },
  { affix: 'ity', meaningEn: 'state/quality', meaningTr: 'durum/nitelik' },
  { affix: 'ence', meaningEn: 'state/quality', meaningTr: 'durum/nitelik' },
  { affix: 'ance', meaningEn: 'state/quality', meaningTr: 'durum/nitelik' },
  { affix: 'ism', meaningEn: 'belief/practice', meaningTr: 'inanç/uygulama' },
  { affix: 'ist', meaningEn: 'person who', meaningTr: 'yapan kişi' },
  { affix: 'er', meaningEn: 'person/thing that', meaningTr: 'yapan kişi/şey' },
  { affix: 'or', meaningEn: 'person/thing that', meaningTr: 'yapan kişi/şey' },
  { affix: 'dom', meaningEn: 'state/realm', meaningTr: 'alan/durum' },
  { affix: 'ship', meaningEn: 'state/condition', meaningTr: 'durum/ilişki' },
  { affix: 'hood', meaningEn: 'state/condition', meaningTr: 'durum/dönem' },
  { affix: 'ure', meaningEn: 'action/result', meaningTr: 'eylem/sonuç' },
  { affix: 'ery', meaningEn: 'place/practice', meaningTr: 'yer/uygulama' },
  { affix: 'age', meaningEn: 'action/result', meaningTr: 'eylem/sonuç' },
  { affix: 'al', meaningEn: 'action/result', meaningTr: 'eylem/sonuç' },

  // Adjective-forming
  { affix: 'able', meaningEn: 'can be done', meaningTr: 'yapılabilir' },
  { affix: 'ible', meaningEn: 'can be done', meaningTr: 'yapılabilir' },
  { affix: 'ful', meaningEn: 'full of', meaningTr: 'dolu, -li' },
  { affix: 'less', meaningEn: 'without', meaningTr: 'sız, olmayan' },
  { affix: 'ous', meaningEn: 'having quality', meaningTr: 'niteliğinde' },
  { affix: 'ious', meaningEn: 'having quality', meaningTr: 'niteliğinde' },
  { affix: 'ive', meaningEn: 'tending to', meaningTr: 'eğilimli' },
  { affix: 'ish', meaningEn: 'somewhat', meaningTr: '-imsi, -ca' },
  { affix: 'ic', meaningEn: 'relating to', meaningTr: 'ile ilgili' },
  { affix: 'ical', meaningEn: 'relating to', meaningTr: 'ile ilgili' },
  { affix: 'ant', meaningEn: 'doing/being', meaningTr: 'olan, yapan' },
  { affix: 'ent', meaningEn: 'doing/being', meaningTr: 'olan, yapan' },

  // Verb-forming
  { affix: 'ize', meaningEn: 'make/become', meaningTr: 'yapmak/olmak' },
  { affix: 'ise', meaningEn: 'make/become', meaningTr: 'yapmak/olmak' },
  { affix: 'ify', meaningEn: 'make/become', meaningTr: 'yapmak/olmak' },
  { affix: 'en', meaningEn: 'make/become', meaningTr: 'yapmak/olmak' },
  { affix: 'ate', meaningEn: 'make/do', meaningTr: 'yapmak' },

  // Adverb-forming
  { affix: 'ly', meaningEn: 'in a way', meaningTr: 'şekilde, -ca' },
  { affix: 'ward', meaningEn: 'direction', meaningTr: 'yönünde' },
  { affix: 'wise', meaningEn: 'in manner of', meaningTr: 'bakımından' },
]

// Sort by length descending so longer affixes match first
const SORTED_PREFIXES = [...PREFIXES].sort((a, b) => b.affix.length - a.affix.length)
const SORTED_SUFFIXES = [...SUFFIXES].sort((a, b) => b.affix.length - a.affix.length)

const MIN_ROOT_LENGTH = 3

export function decompose(term: string): Decomposition | null {
  // Only decompose single words
  const word = term.trim().toLowerCase()
  if (!word || word.includes(' ') || word.length < 4) return null

  let prefix: Affix | undefined
  let suffix: Affix | undefined
  let root = word

  // Try prefix match
  for (const p of SORTED_PREFIXES) {
    if (root.startsWith(p.affix) && root.length - p.affix.length >= MIN_ROOT_LENGTH) {
      prefix = p
      root = root.slice(p.affix.length)
      break
    }
  }

  // Try suffix match
  for (const s of SORTED_SUFFIXES) {
    if (root.endsWith(s.affix) && root.length - s.affix.length >= MIN_ROOT_LENGTH) {
      suffix = s
      root = root.slice(0, root.length - s.affix.length)
      break
    }
  }

  // Only return if we found at least one affix
  if (!prefix && !suffix) return null

  return { prefix, root, suffix }
}

/**
 * Find cards sharing a prefix or suffix with the given term.
 */
export function findRelatedByAffix(
  term: string,
  allTerms: string[],
  limit = 3,
): string[] {
  const d = decompose(term)
  if (!d) return []

  const related: string[] = []
  const termLower = term.toLowerCase()

  for (const t of allTerms) {
    if (t.toLowerCase() === termLower) continue
    const other = decompose(t)
    if (!other) continue

    const sharePrefix = d.prefix && other.prefix && d.prefix.affix === other.prefix.affix
    const shareSuffix = d.suffix && other.suffix && d.suffix.affix === other.suffix.affix

    if (sharePrefix || shareSuffix) {
      related.push(t)
      if (related.length >= limit) break
    }
  }

  return related
}

/**
 * Group terms by their prefix for library view.
 */
export function groupByPrefix(terms: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()

  for (const term of terms) {
    const d = decompose(term)
    if (d?.prefix) {
      const key = d.prefix.affix
      const arr = groups.get(key) || []
      arr.push(term)
      groups.set(key, arr)
    }
  }

  return groups
}

export { PREFIXES, SUFFIXES }
