import type { CardProgress, ReviewRating, VocabCard } from '../types'

const DAY_MS = 24 * 60 * 60 * 1000

const RESURFACE_RATE_FOR_KNOWN = 0.12

function qualityFromRating(rating: ReviewRating): number {
  switch (rating) {
    case 'again':
      return 1
    case 'hard':
      return 2
    case 'good':
      return 4
    case 'easy':
      return 5
    case 'known':
      return 5
    default:
      return 3
  }
}

function withDays(from: Date, days: number): string {
  return new Date(from.getTime() + days * DAY_MS).toISOString()
}

export function defaultProgress(cardId: string, now = new Date()): CardProgress {
  return {
    cardId,
    seen: 0,
    repetitions: 0,
    ease: 2.5,
    intervalDays: 0,
    dueAt: now.toISOString(),
    lastReviewedAt: now.toISOString(),
    known: false,
  }
}

export function isDue(progress: CardProgress | undefined, now = new Date()): boolean {
  if (!progress) {
    return true
  }

  return new Date(progress.dueAt).getTime() <= now.getTime()
}

export function applyReview(
  existing: CardProgress | undefined,
  cardId: string,
  rating: ReviewRating,
  now = new Date(),
): CardProgress {
  const current = existing ?? defaultProgress(cardId, now)
  const quality = qualityFromRating(rating)

  let ease = current.ease
  let repetitions = current.repetitions
  let intervalDays = current.intervalDays
  let known = current.known

  if (rating === 'known') {
    known = true
    repetitions = Math.max(repetitions + 1, 6)
    intervalDays = Math.max(intervalDays, 30)
    return {
      ...current,
      seen: current.seen + 1,
      known,
      repetitions,
      intervalDays,
      ease,
      dueAt: withDays(now, intervalDays),
      lastReviewedAt: now.toISOString(),
    }
  }

  if (quality < 3) {
    repetitions = 0
    intervalDays = rating === 'hard' ? 1 : 0
  } else {
    repetitions += 1

    if (repetitions === 1) {
      intervalDays = 1
    } else if (repetitions === 2) {
      intervalDays = rating === 'easy' ? 4 : 3
    } else {
      const multiplier = rating === 'easy' ? 1.35 : rating === 'hard' ? 0.9 : 1
      intervalDays = Math.max(1, Math.round(intervalDays * ease * multiplier))
    }

    const delta = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
    ease = Math.max(1.3, Math.min(3, ease + delta))
  }

  if (known && rating === 'again') {
    known = false
  }

  return {
    ...current,
    seen: current.seen + 1,
    known,
    repetitions,
    ease,
    intervalDays,
    dueAt: withDays(now, intervalDays),
    lastReviewedAt: now.toISOString(),
  }
}

function sortByUrgency(cards: VocabCard[], progressMap: Record<string, CardProgress>, now: Date): VocabCard[] {
  return [...cards].sort((a, b) => {
    const dueA = progressMap[a.id] ? new Date(progressMap[a.id].dueAt).getTime() : 0
    const dueB = progressMap[b.id] ? new Date(progressMap[b.id].dueAt).getTime() : 0
    const overdueA = now.getTime() - dueA
    const overdueB = now.getTime() - dueB

    if (overdueA === overdueB) {
      return a.term.localeCompare(b.term)
    }

    return overdueB - overdueA
  })
}

function randomPick<T>(items: T[]): T | undefined {
  if (items.length === 0) {
    return undefined
  }

  const idx = Math.floor(Math.random() * items.length)
  return items[idx]
}

export function pickNextCard(
  availableCards: VocabCard[],
  progressMap: Record<string, CardProgress>,
  options?: { avoidCardId?: string; dueOnly?: boolean },
): VocabCard | undefined {
  const now = new Date()
  const filtered = options?.avoidCardId
    ? availableCards.filter((card) => card.id !== options.avoidCardId)
    : availableCards

  if (filtered.length === 0) {
    return undefined
  }

  const dueCards = filtered.filter((card) => isDue(progressMap[card.id], now))
  const knownCards = filtered.filter((card) => progressMap[card.id]?.known)
  const unseenCards = filtered.filter((card) => !progressMap[card.id])

  if (options?.dueOnly && dueCards.length > 0) {
    return sortByUrgency(dueCards, progressMap, now)[0]
  }

  const dueNotKnown = dueCards.filter((card) => !progressMap[card.id]?.known)
  const learningPool = dueNotKnown.length > 0 ? dueNotKnown : unseenCards

  if (learningPool.length === 0) {
    return randomPick(knownCards) ?? randomPick(filtered)
  }

  const shouldResurfaceKnown = knownCards.length > 0 && Math.random() < RESURFACE_RATE_FOR_KNOWN
  if (shouldResurfaceKnown) {
    const resurfaced = randomPick(knownCards)
    if (resurfaced) {
      return resurfaced
    }
  }

  return sortByUrgency(learningPool, progressMap, now)[0]
}

export interface ProgressStats {
  total: number
  unseen: number
  due: number
  known: number
  learning: number
}

export function getProgressStats(
  cards: VocabCard[],
  progressMap: Record<string, CardProgress>,
  now = new Date(),
): ProgressStats {
  const total = cards.length
  let unseen = 0
  let due = 0
  let known = 0

  for (const card of cards) {
    const progress = progressMap[card.id]
    if (!progress) {
      unseen += 1
      due += 1
      continue
    }

    if (progress.known) {
      known += 1
    }

    if (new Date(progress.dueAt).getTime() <= now.getTime()) {
      due += 1
    }
  }

  return {
    total,
    unseen,
    due,
    known,
    learning: Math.max(0, total - known),
  }
}
