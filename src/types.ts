export interface AuthState {
  userId: number
  username: string
}

export type CardType = 'word' | 'phrasal_verb' | 'idiom' | 'collocation'
export type RegisterType = 'daily' | 'academic'

export interface VocabCard {
  id: string
  term: string
  normalized: string
  type: CardType
  register: RegisterType
  partOfSpeech?: string
  meaningEn: string
  meaningTr: string
  examples: string[]
  source: string
  tags: string[]
}

export type ReviewRating = 'again' | 'hard' | 'good' | 'easy' | 'known'

export interface CardProgress {
  cardId: string
  seen: number
  repetitions: number
  ease: number
  intervalDays: number
  dueAt: string
  lastReviewedAt: string
  known: boolean
}

export interface QuizQuestion {
  id: string
  cardId: string
  kind: 'tr_meaning' | 'en_meaning' | 'cloze' | 'synonym' | 'word_building'
  prompt: string
  options: string[]
  answer: string
  sentence?: string
}

export interface MorphQuizQuestion {
  id: string
  kind: 'affix_meaning' | 'find_prefix' | 'suffix_role' | 'word_with_affix'
  prompt: string
  options: string[]
  answer: string
  explanation: string
}

// Exercises
export interface ContextItem {
  card: VocabCard
  sentence: string       // example with term in bold markers
  revealed: boolean
}

export interface FillBlankItem {
  card: VocabCard
  sentence: string       // sentence with _____
  options: string[]
  answer: string
}

export interface MatchPair {
  term: string
  meaningEn: string
  cardId: string
}

export interface TranslationItem {
  card: VocabCard
  answer: string          // expected English term
}
