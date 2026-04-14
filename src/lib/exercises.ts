/**
 * Exercise builders for the Alıştırmalar tab.
 * Based on Kalıcı Kelime Öğrenme methodology:
 * context learning, fill-in-the-blank, synonym matching, translation.
 */

import type { VocabCard, ContextItem, FillBlankItem, MatchPair, TranslationItem } from '../types'

function shuffle<T>(items: T[]): T[] {
  const c = [...items]
  for (let i = c.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[c[i], c[j]] = [c[j], c[i]]
  }
  return c
}

function sample<T>(items: T[], n: number): T[] {
  return shuffle(items).slice(0, n)
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 1. Context Learning — show sentence, guess the word */
export function buildContextCards(cards: VocabCard[], count = 10): ContextItem[] {
  const withExamples = cards.filter(c => c.examples.length > 0 && c.term.length > 1)
  if (withExamples.length === 0) return []

  return sample(withExamples, Math.min(count, withExamples.length)).map(card => {
    const sentence = card.examples[0]
    return { card, sentence, revealed: false }
  })
}

/** 2. Fill-in-the-blank — sentence with _____ */
export function buildFillBlanks(cards: VocabCard[], count = 10): FillBlankItem[] {
  const withExamples = cards.filter(c => c.examples.length > 0 && c.term.length > 1)
  if (withExamples.length < 4) return []

  return sample(withExamples, Math.min(count, withExamples.length)).map(card => {
    const sentence = card.examples[0]
    const regex = new RegExp(`\\b${escapeRegExp(card.term)}\\b`, 'ig')
    let blanked = sentence.replace(regex, '_____')
    if (blanked === sentence) {
      blanked = `${sentence} (_____?)`
    }

    const wrongTerms = sample(
      cards.filter(c => c.id !== card.id).map(c => c.term),
      3,
    )
    const options = shuffle([card.term, ...wrongTerms].filter(Boolean)).slice(0, 4)

    return {
      card,
      sentence: blanked,
      options,
      answer: card.term,
    }
  })
}

/** 3. Synonym Match — 5 terms ↔ 5 EN meanings */
export function buildSynonymMatch(cards: VocabCard[]): MatchPair[] {
  const withMeaning = cards.filter(c => c.meaningEn && c.meaningEn.length > 1 && c.term.length > 1)
  if (withMeaning.length < 5) return []

  return sample(withMeaning, 5).map(c => ({
    term: c.term,
    meaningEn: c.meaningEn.split(',')[0].trim().substring(0, 40),
    cardId: c.id,
  }))
}

/** 4. Translation — show TR, type EN */
export function buildTranslationSet(cards: VocabCard[], count = 10): TranslationItem[] {
  const withTr = cards.filter(c => c.meaningTr && c.meaningTr.length > 1 && c.term.length > 1)
  if (withTr.length === 0) return []

  return sample(withTr, Math.min(count, withTr.length)).map(card => ({
    card,
    answer: card.term.toLowerCase().trim(),
  }))
}
