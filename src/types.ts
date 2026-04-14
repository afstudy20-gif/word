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
  kind: 'tr_meaning' | 'en_meaning' | 'cloze'
  prompt: string
  options: string[]
  answer: string
  sentence?: string
}
