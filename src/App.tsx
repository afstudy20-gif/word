import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import './App.css'
import AuthPage from './components/AuthPage'
import {
  fetchMe,
  getToken,
  loadProgress as apiLoadProgress,
  saveProgress as apiSaveProgress,
  clearProgress as apiClearProgress,
  setOnUnauthorized,
  setToken,
} from './lib/api'
import { buildQuizQuestions } from './lib/quiz'
import {
  applyReview,
  defaultProgress,
  getProgressStats,
  pickNextCard,
} from './lib/srs'
import type {
  AuthState,
  CardProgress,
  CardType,
  QuizQuestion,
  RegisterType,
  ReviewRating,
  VocabCard,
} from './types'

type ViewMode = 'flashcards' | 'quiz' | 'library'

type RegisterFilter = 'all' | RegisterType
type TypeFilter = 'all' | CardType

interface QuizSession {
  questions: QuizQuestion[]
  index: number
  selected?: string
  submitted: boolean
  correct: number
  answered: number
}

const typeLabels: Record<CardType, string> = {
  word: 'Word',
  phrasal_verb: 'Phrasal Verb',
  idiom: 'Idiom',
  collocation: 'Collocation',
}

const registerLabels: Record<RegisterType, string> = {
  daily: 'Günlük İngilizce',
  academic: 'Akademik İngilizce',
}

const ratingButtons: Array<{ rating: ReviewRating; label: string; className: string }> = [
  { rating: 'again', label: 'Again', className: 'danger' },
  { rating: 'hard', label: 'Hard', className: 'warn' },
  { rating: 'good', label: 'Good', className: 'ok' },
  { rating: 'easy', label: 'Easy', className: 'good' },
  { rating: 'known', label: 'Known', className: 'known' },
]

function normalizeText(value: string): string {
  return value.trim().toLowerCase()
}

function parseDeckPayload(payload: unknown): VocabCard[] {
  if (Array.isArray(payload)) {
    return payload as VocabCard[]
  }

  if (payload && typeof payload === 'object' && 'cards' in payload) {
    const cards = (payload as { cards: unknown }).cards
    if (Array.isArray(cards)) {
      return cards as VocabCard[]
    }
  }

  return []
}

function App() {
  // Auth state
  const [user, setUser] = useState<AuthState | null>(null)
  const [authChecking, setAuthChecking] = useState(true)

  // App state
  const [cards, setCards] = useState<VocabCard[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const [mode, setMode] = useState<ViewMode>('flashcards')
  const [registerFilter, setRegisterFilter] = useState<RegisterFilter>('all')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [dueOnly, setDueOnly] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const [progress, setProgress] = useState<Record<string, CardProgress>>({})
  const [activeCardId, setActiveCardId] = useState<string | undefined>()
  const [flipped, setFlipped] = useState(false)
  const [reviewedInSession, setReviewedInSession] = useState(0)

  const [quiz, setQuiz] = useState<QuizSession | null>(null)

  // Debounced save
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const progressRef = useRef(progress)
  progressRef.current = progress

  const debouncedSave = useCallback((p: Record<string, CardProgress>) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      apiSaveProgress(p).catch(err => console.error('[save]', err))
    }, 500)
  }, [])

  // Set up unauthorized handler
  useEffect(() => {
    setOnUnauthorized(() => {
      setUser(null)
      setProgress({})
    })
  }, [])

  // Check existing token on mount
  useEffect(() => {
    if (!getToken()) {
      setAuthChecking(false)
      return
    }

    fetchMe()
      .then(me => {
        setUser(me)
        return apiLoadProgress()
      })
      .then(p => setProgress(p))
      .catch(() => {
        setToken(null)
      })
      .finally(() => setAuthChecking(false))
  }, [])

  // Load deck after auth
  useEffect(() => {
    if (!user) return

    let alive = true

    async function loadDeck() {
      try {
        const res = await fetch('/data/cards.generated.json', { cache: 'no-store' })
        if (!res.ok) {
          throw new Error(`Deck could not be loaded (${res.status})`)
        }

        const payload = (await res.json()) as unknown
        const parsedCards = parseDeckPayload(payload)

        if (!alive) return

        const sanitized = parsedCards.filter(
          (card) => card.id && card.term && card.meaningEn && card.meaningTr,
        )

        setCards(sanitized)
      } catch {
        if (!alive) return
        setLoadError(
          'Deck yüklenemedi. Önce terminalde `npm run deck:build` çalıştırıp tekrar deneyebilirsin.',
        )
      } finally {
        if (alive) setLoading(false)
      }
    }

    loadDeck()
    return () => { alive = false }
  }, [user])

  // Save progress on change (debounced)
  useEffect(() => {
    if (!user) return
    if (Object.keys(progress).length === 0) return
    debouncedSave(progress)
  }, [progress, user, debouncedSave])

  function handleAuth(username: string) {
    setUser({ userId: 0, username })
    // Reload progress for new user
    apiLoadProgress().then(p => setProgress(p)).catch(() => {})
    // Re-fetch me to get proper userId
    fetchMe().then(me => setUser(me)).catch(() => {})
  }

  function handleLogout() {
    setToken(null)
    setUser(null)
    setProgress({})
    setCards([])
    setLoading(true)
    setLoadError(null)
    setQuiz(null)
    setReviewedInSession(0)
  }

  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (registerFilter !== 'all' && card.register !== registerFilter) return false
      if (typeFilter !== 'all' && card.type !== typeFilter) return false

      if (dueOnly) {
        const due = !progress[card.id] || new Date(progress[card.id].dueAt).getTime() <= Date.now()
        if (!due) return false
      }

      if (!searchTerm.trim()) return true

      const haystack = `${card.term} ${card.meaningEn} ${card.meaningTr} ${card.examples.join(' ')}`.toLowerCase()
      return haystack.includes(searchTerm.trim().toLowerCase())
    })
  }, [cards, registerFilter, typeFilter, dueOnly, progress, searchTerm])

  const activeCard = useMemo(
    () => filteredCards.find((card) => card.id === activeCardId),
    [filteredCards, activeCardId],
  )

  useEffect(() => {
    if (filteredCards.length === 0) {
      setActiveCardId(undefined)
      return
    }

    if (activeCard) return

    const next = pickNextCard(filteredCards, progress, { dueOnly })
    setActiveCardId(next?.id)
    setFlipped(false)
  }, [filteredCards, activeCard, progress, dueOnly])

  const overallStats = useMemo(() => getProgressStats(cards, progress), [cards, progress])
  const filteredStats = useMemo(
    () => getProgressStats(filteredCards, progress),
    [filteredCards, progress],
  )

  const libraryCards = useMemo(() => {
    return [...filteredCards].sort((a, b) => a.term.localeCompare(b.term))
  }, [filteredCards])

  function moveToNextCard(currentCardId?: string): void {
    const next = pickNextCard(filteredCards, progress, {
      avoidCardId: currentCardId,
      dueOnly,
    })
    setActiveCardId(next?.id)
    setFlipped(false)
  }

  function reviewCard(rating: ReviewRating): void {
    if (!activeCard) return

    const updated = {
      ...progress,
      [activeCard.id]: applyReview(progress[activeCard.id], activeCard.id, rating),
    }

    setProgress(updated)
    setReviewedInSession((current) => current + 1)

    const next = pickNextCard(filteredCards, updated, {
      avoidCardId: activeCard.id,
      dueOnly,
    })

    setActiveCardId(next?.id)
    setFlipped(false)
  }

  function toggleKnown(cardId: string): void {
    const now = new Date()
    const current = progress[cardId] ?? defaultProgress(cardId, now)
    const shouldBeKnown = !current.known
    const updated = {
      ...progress,
      [cardId]: {
        ...current,
        known: shouldBeKnown,
        dueAt: shouldBeKnown
          ? new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000).toISOString()
          : now.toISOString(),
      },
    }

    setProgress(updated)
  }

  function resetCardProgress(cardId: string): void {
    const nextProgress = { ...progress }
    delete nextProgress[cardId]
    setProgress(nextProgress)
  }

  function resetAllProgress(): void {
    setProgress({})
    apiClearProgress().catch(err => console.error('[clear]', err))
    setReviewedInSession(0)
    setQuiz(null)
    moveToNextCard()
  }

  function startQuiz(): void {
    const questions = buildQuizQuestions(filteredCards, progress, 10)
    if (questions.length === 0) {
      setQuiz(null)
      return
    }

    setQuiz({
      questions,
      index: 0,
      selected: undefined,
      submitted: false,
      correct: 0,
      answered: 0,
    })
  }

  function submitQuizAnswer(): void {
    if (!quiz || quiz.submitted || !quiz.selected) return

    const currentQuestion = quiz.questions[quiz.index]
    const isCorrect = normalizeText(quiz.selected) === normalizeText(currentQuestion.answer)
    const rating: ReviewRating = isCorrect ? 'good' : 'again'

    setProgress((prev) => ({
      ...prev,
      [currentQuestion.cardId]: applyReview(prev[currentQuestion.cardId], currentQuestion.cardId, rating),
    }))

    setQuiz({
      ...quiz,
      submitted: true,
      answered: quiz.answered + 1,
      correct: quiz.correct + (isCorrect ? 1 : 0),
    })
  }

  function nextQuizQuestion(): void {
    if (!quiz) return

    if (quiz.index + 1 >= quiz.questions.length) return

    setQuiz({
      ...quiz,
      index: quiz.index + 1,
      selected: undefined,
      submitted: false,
    })
  }

  const currentQuestion = quiz ? quiz.questions[quiz.index] : undefined

  // Auth checking spinner
  if (authChecking) {
    return (
      <div className="auth-loading">
        <div className="spinner" />
        <p>Oturum kontrol ediliyor...</p>
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return <AuthPage onAuth={handleAuth} />
  }

  return (
    <main className="app-shell">
      <header className="hero-head">
        <div className="hero-top-row">
          <p className="eyebrow">Context Deck</p>
          <div className="user-info">
            <span className="user-badge">{user.username}</span>
            <button className="logout-btn" onClick={handleLogout}>
              Çıkış
            </button>
          </div>
        </div>
        <h1>İngilizce Kelime, Phrasal Verb ve Idiom Öğrenme Laboratuvarı</h1>
        <p className="subtext">
          SRS tabanlı tekrar, bağlamdan çıkarım, EN+TR anlam ve quiz akışı ile kalıcı öğrenme.
        </p>
      </header>

      <section className="control-panel">
        <div className="tabs" role="tablist" aria-label="Mode selector">
          <button
            className={mode === 'flashcards' ? 'is-active' : ''}
            onClick={() => setMode('flashcards')}
          >
            Flashcards
          </button>
          <button
            className={mode === 'quiz' ? 'is-active' : ''}
            onClick={() => setMode('quiz')}
          >
            Quiz
          </button>
          <button
            className={mode === 'library' ? 'is-active' : ''}
            onClick={() => setMode('library')}
          >
            Kütüphane
          </button>
        </div>

        <div className="filters">
          <label>
            Register
            <select
              value={registerFilter}
              onChange={(event) => setRegisterFilter(event.target.value as RegisterFilter)}
            >
              <option value="all">Hepsi</option>
              <option value="daily">Günlük İngilizce</option>
              <option value="academic">Akademik İngilizce</option>
            </select>
          </label>

          <label>
            Tür
            <select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as TypeFilter)}>
              <option value="all">Hepsi</option>
              <option value="word">Word</option>
              <option value="phrasal_verb">Phrasal Verb</option>
              <option value="idiom">Idiom</option>
              <option value="collocation">Collocation</option>
            </select>
          </label>

          <label className="switch-row">
            <input
              type="checkbox"
              checked={dueOnly}
              onChange={(event) => setDueOnly(event.target.checked)}
            />
            Sadece due kartlar
          </label>

          <label className="search-field">
            Ara
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Kelime, anlam, örnek cümle"
            />
          </label>
        </div>
      </section>

      <section className="stats-grid">
        <article>
          <h3>Seçili Havuz</h3>
          <p>{filteredStats.total} kart</p>
          <small>{filteredStats.due} due</small>
        </article>
        <article>
          <h3>Yeni</h3>
          <p>{filteredStats.unseen}</p>
          <small>Henüz görülmedi</small>
        </article>
        <article>
          <h3>Bilinen</h3>
          <p>{overallStats.known}</p>
          <small>Zaman zaman tekrar gelir</small>
        </article>
        <article>
          <h3>Bugün</h3>
          <p>{reviewedInSession}</p>
          <small>Oturum tekrarları</small>
        </article>
      </section>

      {loading ? <p className="status">Deck yükleniyor...</p> : null}
      {loadError ? <p className="status error">{loadError}</p> : null}

      {!loading && !loadError && mode === 'flashcards' && (
        <section className="workspace">
          {!activeCard ? (
            <article className="empty-card">
              <h2>Bu filtrede gösterilecek kart kalmadı</h2>
              <p>Filtreleri genişletebilir ya da due-only seçimini kapatabilirsin.</p>
            </article>
          ) : (
            <article className="flashcard">
              <div className="meta-row">
                <span className="pill strong">{registerLabels[activeCard.register]}</span>
                <span className="pill">{typeLabels[activeCard.type]}</span>
                {activeCard.partOfSpeech ? <span className="pill">{activeCard.partOfSpeech}</span> : null}
                <span className="pill source">{activeCard.source}</span>
              </div>

              <button className="card-face" onClick={() => setFlipped((state) => !state)}>
                <h2>{activeCard.term}</h2>
                <p className="hint">Kartı çevirmek için tıkla</p>
                {flipped ? (
                  <div className="details fade-in">
                    <p>
                      <strong>EN:</strong> {activeCard.meaningEn}
                    </p>
                    <p>
                      <strong>TR:</strong> {activeCard.meaningTr}
                    </p>

                    {activeCard.examples.length > 0 ? (
                      <div className="examples">
                        <h4>Example Sentences</h4>
                        {activeCard.examples.slice(0, 3).map((example, index) => (
                          <p key={`${activeCard.id}-example-${index}`}>{example}</p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </button>

              <div className="actions-row">
                <button className="secondary" onClick={() => moveToNextCard(activeCard.id)}>
                  Skip
                </button>
                <button className="secondary" onClick={() => toggleKnown(activeCard.id)}>
                  {progress[activeCard.id]?.known ? 'Known kaldır' : 'Known işaretle'}
                </button>
                <button className="secondary" onClick={() => resetCardProgress(activeCard.id)}>
                  Kartı sıfırla
                </button>
              </div>

              <div className="grading-row">
                {ratingButtons.map((button) => (
                  <button
                    key={button.rating}
                    className={button.className}
                    onClick={() => reviewCard(button.rating)}
                  >
                    {button.label}
                  </button>
                ))}
              </div>
            </article>
          )}
        </section>
      )}

      {!loading && !loadError && mode === 'quiz' && (
        <section className="workspace quiz-space">
          {!quiz || quiz.questions.length === 0 ? (
            <article className="empty-card">
              <h2>Quiz hazır değil</h2>
              <p>En az 4 kart olmalı. Filtreleri genişletip quiz başlat.</p>
              <button className="primary" onClick={startQuiz}>
                Quiz Başlat
              </button>
            </article>
          ) : (
            <article className="quiz-card">
              <div className="quiz-top">
                <span>
                  Soru {quiz.index + 1} / {quiz.questions.length}
                </span>
                <span>
                  Skor: {quiz.correct} / {quiz.answered}
                </span>
              </div>

              <h2>{currentQuestion?.prompt}</h2>
              {currentQuestion?.sentence ? <p className="sentence-box">{currentQuestion.sentence}</p> : null}

              <div className="options-grid">
                {currentQuestion?.options.map((option) => {
                  const selected = quiz.selected === option
                  const isCorrect = normalizeText(option) === normalizeText(currentQuestion.answer)
                  const shouldHighlight = quiz.submitted && isCorrect
                  const isWrongSelection =
                    quiz.submitted && selected && !isCorrect

                  return (
                    <button
                      key={`${currentQuestion.id}-${option}`}
                      className={[
                        selected ? 'selected' : '',
                        shouldHighlight ? 'correct' : '',
                        isWrongSelection ? 'wrong' : '',
                      ]
                        .join(' ')
                        .trim()}
                      onClick={() => {
                        if (quiz.submitted) return
                        setQuiz({ ...quiz, selected: option })
                      }}
                    >
                      {option}
                    </button>
                  )
                })}
              </div>

              <div className="quiz-actions">
                {!quiz.submitted ? (
                  <button className="primary" onClick={submitQuizAnswer} disabled={!quiz.selected}>
                    Kontrol Et
                  </button>
                ) : (
                  <button
                    className="primary"
                    onClick={() => {
                      if (quiz.index + 1 >= quiz.questions.length) {
                        startQuiz()
                        return
                      }
                      nextQuizQuestion()
                    }}
                  >
                    {quiz.index + 1 >= quiz.questions.length ? 'Yeni Quiz' : 'Sonraki Soru'}
                  </button>
                )}

                <button className="secondary" onClick={startQuiz}>
                  Soruları Yenile
                </button>
              </div>
            </article>
          )}
        </section>
      )}

      {!loading && !loadError && mode === 'library' && (
        <section className="workspace library-space">
          <div className="library-head">
            <h2>Kütüphane</h2>
            <button className="secondary" onClick={resetAllProgress}>
              Tüm İlerlemeyi Sıfırla
            </button>
          </div>

          <div className="library-list">
            {libraryCards.map((card) => {
              const cardProgress = progress[card.id]
              const known = Boolean(cardProgress?.known)
              const due = !cardProgress || new Date(cardProgress.dueAt).getTime() <= Date.now()

              return (
                <article key={card.id} className="library-item">
                  <div>
                    <h3>{card.term}</h3>
                    <p>{card.meaningTr}</p>
                    <small>{card.meaningEn}</small>
                  </div>
                  <div className="library-tags">
                    <span className="pill">{registerLabels[card.register]}</span>
                    <span className="pill">{typeLabels[card.type]}</span>
                    <span className={`pill ${known ? 'known-pill' : ''}`}>
                      {known ? 'Known' : due ? 'Due' : 'Learning'}
                    </span>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}
    </main>
  )
}

export default App
