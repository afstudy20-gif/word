import type { CardProgress, QuizQuestion, VocabCard } from '../types'
import { decompose, PREFIXES } from './morphology'

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function sample<T>(items: T[], count: number): T[] {
  return shuffle(items).slice(0, count)
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function makeClozeSentence(card: VocabCard): string | undefined {
  const sentence = card.examples[0]
  if (!sentence) {
    return undefined
  }

  const matcher = new RegExp(`\\b${escapeRegExp(card.term)}\\b`, 'ig')
  const replaced = sentence.replace(matcher, '_____')
  if (replaced === sentence) {
    return `${sentence} (_____?)`
  }
  return replaced
}

function uniqueOptions(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const value of values) {
    const key = value.trim().toLowerCase()
    if (!key || seen.has(key)) {
      continue
    }
    seen.add(key)
    out.push(value)
  }
  return out
}

function cardWeight(progress: CardProgress | undefined, now: Date): number {
  if (!progress) {
    return 5
  }

  const overdueMs = now.getTime() - new Date(progress.dueAt).getTime()
  const overdueFactor = overdueMs > 0 ? Math.min(5, 1 + overdueMs / (1000 * 60 * 60 * 24 * 7)) : 1
  const knownPenalty = progress.known ? 0.4 : 1
  return Math.max(0.2, overdueFactor * knownPenalty)
}

function weightedPick(cards: VocabCard[], progressMap: Record<string, CardProgress>, now: Date): VocabCard {
  const weights = cards.map((card) => cardWeight(progressMap[card.id], now))
  const total = weights.reduce((acc, value) => acc + value, 0)
  const target = Math.random() * total

  let cumulative = 0
  for (let idx = 0; idx < cards.length; idx += 1) {
    cumulative += weights[idx]
    if (target <= cumulative) {
      return cards[idx]
    }
  }

  return cards[cards.length - 1]
}

export function buildQuizQuestions(
  cards: VocabCard[],
  progressMap: Record<string, CardProgress>,
  count = 10,
): QuizQuestion[] {
  if (cards.length < 4) {
    return []
  }

  const now = new Date()
  const selectedCards: VocabCard[] = []
  const pool = [...cards]

  while (selectedCards.length < count && pool.length > 0) {
    const picked = weightedPick(pool, progressMap, now)
    selectedCards.push(picked)
    const index = pool.findIndex((card) => card.id === picked.id)
    pool.splice(index, 1)
  }

  return selectedCards.map((card, idx) => {
    const kinds: QuizQuestion['kind'][] = ['tr_meaning', 'en_meaning']
    if (card.examples.length > 0) {
      kinds.push('cloze')
    }
    // Add synonym if meaningEn has comma-separated synonyms
    if (card.meaningEn && card.meaningEn.includes(',')) {
      kinds.push('synonym')
    }
    // Add word_building if the term can be decomposed
    if (card.type === 'word' && decompose(card.term)) {
      kinds.push('word_building')
    }
    const kind = kinds[Math.floor(Math.random() * kinds.length)]

    if (kind === 'synonym') {
      const firstSynonym = card.meaningEn.split(',')[0].trim()
      const wrong = sample(
        cards
          .filter(c => c.id !== card.id && c.meaningEn)
          .map(c => c.meaningEn.split(',')[0].trim())
          .filter(Boolean),
        3,
      )
      const options = shuffle(uniqueOptions([firstSynonym, ...wrong])).slice(0, 4)
      return {
        id: `q-${idx}-${card.id}`,
        cardId: card.id,
        kind,
        prompt: `"${card.term}" ile en yakın anlamlı kelime hangisi?`,
        options,
        answer: firstSynonym,
      }
    }

    if (kind === 'word_building') {
      const d = decompose(card.term)!
      const prefixInfo = d.prefix ? PREFIXES.find(p => p.affix === d.prefix!.affix) : undefined
      const prompt = d.prefix
        ? `"${d.prefix.affix}-" (${prefixInfo?.meaningTr || d.prefix.meaningTr}) ön eki ile başlayan kelime hangisi?`
        : `"${card.term}" kelimesinin kökü nedir?`
      const wrong = sample(
        cards
          .filter(c => c.id !== card.id)
          .map(c => c.term),
        3,
      )
      const options = shuffle(uniqueOptions([card.term, ...wrong])).slice(0, 4)
      return {
        id: `q-${idx}-${card.id}`,
        cardId: card.id,
        kind,
        prompt,
        options,
        answer: card.term,
      }
    }

    if (kind === 'tr_meaning') {
      const wrong = sample(
        cards
          .filter((candidate) => candidate.id !== card.id)
          .map((candidate) => candidate.meaningTr)
          .filter(Boolean),
        3,
      )

      const options = shuffle(uniqueOptions([card.meaningTr, ...wrong])).slice(0, 4)
      return {
        id: `q-${idx}-${card.id}`,
        cardId: card.id,
        kind,
        prompt: `"${card.term}" için en doğru Türkçe anlam hangisi?`,
        options,
        answer: card.meaningTr,
      }
    }

    if (kind === 'en_meaning') {
      const wrong = sample(
        cards
          .filter((candidate) => candidate.id !== card.id)
          .map((candidate) => candidate.meaningEn)
          .filter(Boolean),
        3,
      )

      const options = shuffle(uniqueOptions([card.meaningEn, ...wrong])).slice(0, 4)
      return {
        id: `q-${idx}-${card.id}`,
        cardId: card.id,
        kind,
        prompt: `Which English meaning fits "${card.term}" best?`,
        options,
        answer: card.meaningEn,
      }
    }

    const sentence = makeClozeSentence(card) ?? `Find the best term: ${card.meaningEn}`
    const wrongTerms = sample(
      cards.filter((candidate) => candidate.id !== card.id).map((candidate) => candidate.term),
      3,
    )

    const options = shuffle(uniqueOptions([card.term, ...wrongTerms])).slice(0, 4)
    return {
      id: `q-${idx}-${card.id}`,
      cardId: card.id,
      kind,
      prompt: 'Cümleden uygun kelimeyi çıkar:',
      options,
      answer: card.term,
      sentence,
    }
  })
}
