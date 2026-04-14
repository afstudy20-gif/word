/**
 * Grammar topics, rules, examples, and test questions.
 * Based on "Kalıcı Gramer Öğrenme 2017".
 */

export interface GrammarExample {
  en: string
  tr: string
}

export interface GrammarTest {
  sentence: string
  options: string[]
  answer: string
  explanation: string
}

export interface GrammarTopic {
  id: string
  title: string
  titleTr: string
  category: string
  rules: string[]
  examples: GrammarExample[]
  tests: GrammarTest[]
}

export const GRAMMAR_CATEGORIES = [
  'Tenses',
  'Modals',
  'Pronouns & Determiners',
  'Passive & Causative',
  'Gerunds & Infinitives',
  'Conditionals',
  'Comparisons',
  'Clauses & Connectors',
  'Articles & Quantifiers',
]

export const GRAMMAR_TOPICS: GrammarTopic[] = [
  // === TENSES ===
  {
    id: 'simple-present',
    title: 'Simple Present',
    titleTr: 'Geniş Zaman',
    category: 'Tenses',
    rules: [
      'Genel gerçeklikler ve alışkanlıklar için kullanılır.',
      'Yapı: I/you/we/they + V1, he/she/it + Vs (go → goes)',
      'Zaman ifadeleri: always, usually, often, sometimes, every day, never',
      'Durum fiilleri (state verbs) sürekli zamanlarda kullanılmaz: know, believe, love, want',
    ],
    examples: [
      { en: 'She goes to school every day.', tr: 'Her gün okula gider.' },
      { en: 'Water boils at 100 degrees.', tr: 'Su 100 derecede kaynar.' },
      { en: 'I don\'t like coffee.', tr: 'Kahve sevmiyorum.' },
      { en: 'Do you speak English?', tr: 'İngilizce konuşuyor musun?' },
    ],
    tests: [
      { sentence: 'She _____ to work by bus every morning.', options: ['goes', 'go', 'is going', 'went'], answer: 'goes', explanation: 'He/she/it ile fiil -s/-es alır.' },
      { sentence: 'Water _____ at 100°C.', options: ['boils', 'is boiling', 'boiled', 'has boiled'], answer: 'boils', explanation: 'Genel gerçeklik = Simple Present.' },
      { sentence: 'They _____ TV every evening.', options: ['watch', 'watches', 'are watching', 'watched'], answer: 'watch', explanation: 'They ile fiil yalın halde kalır.' },
    ],
  },
  {
    id: 'present-continuous',
    title: 'Present Continuous',
    titleTr: 'Şimdiki Zaman',
    category: 'Tenses',
    rules: [
      'Konuşma anında olan eylemler için kullanılır.',
      'Yapı: am/is/are + Ving',
      'Geçici durumlar ve planlanmış gelecek eylemler',
      'Zaman ifadeleri: now, right now, at the moment, currently',
    ],
    examples: [
      { en: 'I am studying English now.', tr: 'Şu anda İngilizce çalışıyorum.' },
      { en: 'She is working from home this week.', tr: 'Bu hafta evden çalışıyor.' },
      { en: 'We are meeting them tomorrow.', tr: 'Yarın onlarla buluşuyoruz.' },
    ],
    tests: [
      { sentence: 'Look! It _____ outside.', options: ['is raining', 'rains', 'rained', 'has rained'], answer: 'is raining', explanation: '"Look!" konuşma anını gösterir → Present Continuous.' },
      { sentence: 'She _____ a new novel these days.', options: ['is reading', 'reads', 'read', 'has read'], answer: 'is reading', explanation: '"These days" geçici durum → Present Continuous.' },
      { sentence: 'I _____ to the cinema tonight.', options: ['am going', 'go', 'went', 'have gone'], answer: 'am going', explanation: 'Planlanmış gelecek eylem → Present Continuous.' },
    ],
  },
  {
    id: 'simple-past',
    title: 'Simple Past',
    titleTr: 'Geçmiş Zaman',
    category: 'Tenses',
    rules: [
      'Geçmişte tamamlanmış eylemler için kullanılır.',
      'Yapı: V2 (went, decided, played)',
      'Zaman ifadeleri: yesterday, last week, ago, in 2020, when I was young',
    ],
    examples: [
      { en: 'I visited Paris last summer.', tr: 'Geçen yaz Paris\'i ziyaret ettim.' },
      { en: 'She didn\'t call me yesterday.', tr: 'Dün beni aramadı.' },
      { en: 'Did you see that movie?', tr: 'O filmi gördün mü?' },
    ],
    tests: [
      { sentence: 'I _____ to London two years ago.', options: ['went', 'go', 'have gone', 'am going'], answer: 'went', explanation: '"Two years ago" geçmiş zaman belirteci.' },
      { sentence: 'She _____ the exam last week.', options: ['passed', 'passes', 'has passed', 'is passing'], answer: 'passed', explanation: '"Last week" = Simple Past.' },
      { sentence: '_____ you _____ breakfast this morning?', options: ['Did / have', 'Do / have', 'Have / had', 'Are / having'], answer: 'Did / have', explanation: 'Geçmiş soru: Did + S + V1.' },
    ],
  },
  {
    id: 'present-perfect',
    title: 'Present Perfect',
    titleTr: 'Yakın Geçmiş / Deneyim',
    category: 'Tenses',
    rules: [
      'Geçmişte başlayıp şimdiye etkisi olan eylemler.',
      'Yapı: have/has + V3 (gone, decided, written)',
      'Zaman ifadeleri: already, yet, just, ever, never, since, for, recently',
      'Belirli geçmiş zaman (yesterday, ago) ile kullanılmaz!',
    ],
    examples: [
      { en: 'I have lived here for 5 years.', tr: '5 yıldır burada yaşıyorum.' },
      { en: 'Have you ever been to Japan?', tr: 'Hiç Japonya\'ya gittin mi?' },
      { en: 'She has just finished her homework.', tr: 'Ödevini az önce bitirdi.' },
    ],
    tests: [
      { sentence: 'I _____ this movie three times.', options: ['have seen', 'saw', 'see', 'am seeing'], answer: 'have seen', explanation: 'Deneyim (kaç kez) = Present Perfect.' },
      { sentence: 'She _____ here since 2019.', options: ['has worked', 'works', 'worked', 'is working'], answer: 'has worked', explanation: '"Since" = Present Perfect.' },
      { sentence: 'They _____ yet.', options: ['haven\'t arrived', 'didn\'t arrive', 'don\'t arrive', 'aren\'t arriving'], answer: 'haven\'t arrived', explanation: '"Yet" = Present Perfect olumsuz.' },
    ],
  },
  {
    id: 'past-continuous',
    title: 'Past Continuous',
    titleTr: 'Geçmişte Sürekli',
    category: 'Tenses',
    rules: [
      'Geçmişte belirli bir anda devam eden eylem.',
      'Yapı: was/were + Ving',
      'İki geçmiş eylemden uzun süren Past Continuous, kısa olan Simple Past olur.',
      'Zaman ifadeleri: while, when, at that time, all day yesterday',
    ],
    examples: [
      { en: 'I was sleeping when you called.', tr: 'Sen aradığında uyuyordum.' },
      { en: 'While she was cooking, he was reading.', tr: 'O yemek yaparken, o okuyordu.' },
    ],
    tests: [
      { sentence: 'While I _____, the phone rang.', options: ['was studying', 'studied', 'study', 'have studied'], answer: 'was studying', explanation: '"While" + uzun eylem = Past Continuous.' },
      { sentence: 'At 8 PM last night, we _____ dinner.', options: ['were having', 'had', 'have', 'are having'], answer: 'were having', explanation: 'Geçmişte belirli an = Past Continuous.' },
    ],
  },
  // === MODALS ===
  {
    id: 'modals-obligation',
    title: 'Obligation & Necessity',
    titleTr: 'Zorunluluk & Gereklilik',
    category: 'Modals',
    rules: [
      'must = kişisel zorunluluk (I must study harder)',
      'have to = dışsal zorunluluk (You have to wear a uniform)',
      'should / ought to = tavsiye (You should see a doctor)',
      'had better = güçlü tavsiye / uyarı (You\'d better hurry)',
      'don\'t have to = gerekli değil ≠ mustn\'t = yasak',
    ],
    examples: [
      { en: 'You must stop at a red light.', tr: 'Kırmızı ışıkta durmalısın.' },
      { en: 'You don\'t have to come if you\'re busy.', tr: 'Meşgulsen gelmek zorunda değilsin.' },
      { en: 'You mustn\'t smoke here.', tr: 'Burada sigara içmemelisin (yasak).' },
    ],
    tests: [
      { sentence: 'You _____ drive without a license. It\'s illegal.', options: ['mustn\'t', 'don\'t have to', 'shouldn\'t', 'needn\'t'], answer: 'mustn\'t', explanation: 'Yasak = mustn\'t.' },
      { sentence: 'You _____ wear a tie. It\'s optional.', options: ['don\'t have to', 'mustn\'t', 'must', 'can\'t'], answer: 'don\'t have to', explanation: 'Gerekli değil (ama istersen giyebilirsin) = don\'t have to.' },
      { sentence: 'You look tired. You _____ go to bed early.', options: ['should', 'must', 'have to', 'mustn\'t'], answer: 'should', explanation: 'Tavsiye = should.' },
    ],
  },
  {
    id: 'modals-possibility',
    title: 'Possibility & Deduction',
    titleTr: 'Olasılık & Çıkarım',
    category: 'Modals',
    rules: [
      'must = kesin çıkarım (%95): He must be at home.',
      'may/might/could = olası (%50): She may come tomorrow.',
      'can\'t/couldn\'t = imkansız çıkarım: It can\'t be true.',
      'Geçmiş: must have V3, may have V3, can\'t have V3',
    ],
    examples: [
      { en: 'She must be tired. She\'s been working all day.', tr: 'Yorgun olmalı. Tüm gün çalışıyor.' },
      { en: 'He might be at the library.', tr: 'Kütüphanede olabilir.' },
      { en: 'They can\'t have left already.', tr: 'Çoktan gitmiş olamazlar.' },
    ],
    tests: [
      { sentence: 'Look at those clouds. It _____ rain soon.', options: ['might', 'must', 'can\'t', 'should'], answer: 'might', explanation: 'Olasılık (belirsiz) = might.' },
      { sentence: 'He\'s been studying all week. He _____ pass the exam.', options: ['must', 'might', 'can\'t', 'mustn\'t'], answer: 'must', explanation: 'Güçlü çıkarım (kanıt var) = must.' },
    ],
  },
  // === CONDITIONALS ===
  {
    id: 'conditional-type0',
    title: 'Zero Conditional',
    titleTr: 'Sıfırıncı Koşul',
    category: 'Conditionals',
    rules: [
      'Genel gerçeklikler ve bilimsel olgular için.',
      'Yapı: If + Simple Present, Simple Present',
      'If yerine when de kullanılabilir.',
    ],
    examples: [
      { en: 'If you heat water to 100°C, it boils.', tr: 'Suyu 100°C\'ye ısıtırsan kaynar.' },
      { en: 'If it rains, the ground gets wet.', tr: 'Yağmur yağarsa yer ıslanır.' },
    ],
    tests: [
      { sentence: 'If you _____ ice in water, it _____.', options: ['put / floats', 'will put / floats', 'put / will float', 'putting / float'], answer: 'put / floats', explanation: 'Type 0: If + Present, Present.' },
    ],
  },
  {
    id: 'conditional-type1',
    title: 'First Conditional',
    titleTr: 'Birinci Koşul (Gerçek)',
    category: 'Conditionals',
    rules: [
      'Gelecekte gerçekleşmesi muhtemel durumlar.',
      'Yapı: If + Simple Present, will + V1',
      'If clause\'da will kullanılmaz!',
    ],
    examples: [
      { en: 'If it rains tomorrow, I will stay home.', tr: 'Yarın yağmur yağarsa evde kalacağım.' },
      { en: 'If you study hard, you will pass.', tr: 'Çok çalışırsan geçersin.' },
    ],
    tests: [
      { sentence: 'If she _____ hard, she _____ the exam.', options: ['studies / will pass', 'will study / passes', 'studied / would pass', 'studies / passes'], answer: 'studies / will pass', explanation: 'Type 1: If + Present, will + V1.' },
      { sentence: 'I _____ you if I _____ time.', options: ['will help / have', 'help / will have', 'would help / had', 'helped / have'], answer: 'will help / have', explanation: 'Ana cümle: will, if cümlesi: Present.' },
    ],
  },
  {
    id: 'conditional-type2',
    title: 'Second Conditional',
    titleTr: 'İkinci Koşul (Hayal)',
    category: 'Conditionals',
    rules: [
      'Şu an gerçek olmayan, hayali durumlar.',
      'Yapı: If + Simple Past, would + V1',
      'If I were... (was yerine were tercih edilir)',
    ],
    examples: [
      { en: 'If I had money, I would travel the world.', tr: 'Param olsa dünyayı gezerdim.' },
      { en: 'If I were you, I would accept the offer.', tr: 'Senin yerinde olsam teklifi kabul ederdim.' },
    ],
    tests: [
      { sentence: 'If I _____ rich, I _____ a big house.', options: ['were / would buy', 'am / will buy', 'was / buy', 'were / bought'], answer: 'were / would buy', explanation: 'Type 2: If + Past, would + V1.' },
      { sentence: 'If she _____ here, she _____ what to do.', options: ['were / would know', 'is / will know', 'was / knows', 'were / knew'], answer: 'were / would know', explanation: 'Hayali durum: If + were, would + V1.' },
    ],
  },
  {
    id: 'conditional-type3',
    title: 'Third Conditional',
    titleTr: 'Üçüncü Koşul (Geçmiş Pişmanlık)',
    category: 'Conditionals',
    rules: [
      'Geçmişte gerçekleşmemiş durumlar (pişmanlık).',
      'Yapı: If + Past Perfect, would have + V3',
      'Geçmişi değiştiremeyiz, sadece hayal ederiz.',
    ],
    examples: [
      { en: 'If I had studied, I would have passed.', tr: 'Çalışsaydım geçerdim.' },
      { en: 'If she had come, she would have seen him.', tr: 'Gelseydi onu görürdü.' },
    ],
    tests: [
      { sentence: 'If I _____ earlier, I _____ the train.', options: ['had left / would have caught', 'left / would catch', 'leave / will catch', 'had left / caught'], answer: 'had left / would have caught', explanation: 'Type 3: If + Past Perfect, would have V3.' },
    ],
  },
  // === PASSIVE ===
  {
    id: 'passive-voice',
    title: 'Passive Voice',
    titleTr: 'Edilgen Çatı',
    category: 'Passive & Causative',
    rules: [
      'Eylemi yapan değil, eylemden etkilenen vurgulanır.',
      'Yapı: be + V3 (is written, was built, has been done)',
      'Her tense\'in passive formu: am/is/are/was/were/been/being + V3',
      'By + agent (yapan kişi): The book was written by Orwell.',
    ],
    examples: [
      { en: 'English is spoken worldwide.', tr: 'İngilizce dünya çapında konuşulur.' },
      { en: 'The bridge was built in 1990.', tr: 'Köprü 1990\'da inşa edildi.' },
      { en: 'The report has been completed.', tr: 'Rapor tamamlandı.' },
    ],
    tests: [
      { sentence: 'This car _____ in Germany.', options: ['was made', 'made', 'is making', 'makes'], answer: 'was made', explanation: 'Passive: was + V3.' },
      { sentence: 'English _____ in many countries.', options: ['is spoken', 'speaks', 'spoke', 'speaking'], answer: 'is spoken', explanation: 'Genel gerçeklik passive: is + V3.' },
    ],
  },
  // === GERUNDS & INFINITIVES ===
  {
    id: 'gerund-infinitive',
    title: 'Gerunds & Infinitives',
    titleTr: 'İsim-fiil & Mastar',
    category: 'Gerunds & Infinitives',
    rules: [
      'Gerund (Ving): enjoy, avoid, finish, mind, suggest + Ving',
      'Infinitive (to V1): want, decide, hope, expect, refuse + to V1',
      'Her ikisi: like, love, hate, start, begin, continue',
      'stop + Ving = yapmayı bırakmak ≠ stop + to V1 = yapmak için durmak',
      'remember + Ving = yapıldığını hatırlamak ≠ remember + to V1 = yapmayı hatırlamak',
    ],
    examples: [
      { en: 'I enjoy reading books.', tr: 'Kitap okumaktan hoşlanırım.' },
      { en: 'She decided to move abroad.', tr: 'Yurt dışına taşınmaya karar verdi.' },
      { en: 'He stopped smoking.', tr: 'Sigara içmeyi bıraktı.' },
      { en: 'He stopped to smoke.', tr: 'Sigara içmek için durdu.' },
    ],
    tests: [
      { sentence: 'I enjoy _____ in the morning.', options: ['running', 'to run', 'run', 'ran'], answer: 'running', explanation: 'enjoy + Ving.' },
      { sentence: 'She wants _____ a doctor.', options: ['to become', 'becoming', 'become', 'became'], answer: 'to become', explanation: 'want + to V1.' },
      { sentence: 'He stopped _____ when he saw me.', options: ['talking', 'to talk', 'talk', 'talked'], answer: 'talking', explanation: 'stop + Ving = yapmayı bırakmak.' },
    ],
  },
  // === COMPARISONS ===
  {
    id: 'comparisons',
    title: 'Comparisons',
    titleTr: 'Karşılaştırma',
    category: 'Comparisons',
    rules: [
      'Comparative: -er / more + adj + than (taller than, more beautiful than)',
      'Superlative: the -est / the most + adj (the tallest, the most beautiful)',
      'as...as: eşitlik (She is as tall as her mother)',
      'not as...as: eşitsizlik (He is not as fast as his brother)',
      'Düzensiz: good-better-best, bad-worse-worst, far-farther-farthest',
    ],
    examples: [
      { en: 'She is taller than her sister.', tr: 'Ablasından daha uzun.' },
      { en: 'This is the most expensive car.', tr: 'Bu en pahalı araba.' },
      { en: 'He runs as fast as a cheetah.', tr: 'Çita kadar hızlı koşar.' },
    ],
    tests: [
      { sentence: 'Mount Everest is _____ mountain in the world.', options: ['the highest', 'higher', 'the most high', 'highest'], answer: 'the highest', explanation: 'Superlative: the + -est.' },
      { sentence: 'She is _____ than her brother.', options: ['smarter', 'the smartest', 'smart', 'more smart'], answer: 'smarter', explanation: 'Comparative: -er + than.' },
    ],
  },
  // === ARTICLES ===
  {
    id: 'articles',
    title: 'Articles',
    titleTr: 'Tanımlıklar (a/an/the)',
    category: 'Articles & Quantifiers',
    rules: [
      'a/an: belirsiz, ilk kez bahsedilen tekil sayılabilir isim',
      'the: belirli, bilinen, daha önce bahsedilen, tek olan',
      'Sıfır tanımlık (Ø): genel kavramlar, çoğul genel, soyut isimler',
      'the + superlative: the best, the most, the tallest',
      'Coğrafya: the ile: rivers, oceans, mountain ranges / Ø ile: countries, cities, lakes',
    ],
    examples: [
      { en: 'I saw a dog. The dog was big.', tr: 'Bir köpek gördüm. Köpek büyüktü.' },
      { en: 'The sun rises in the east.', tr: 'Güneş doğudan doğar.' },
      { en: 'Love is important.', tr: 'Sevgi önemlidir. (genel = Ø)' },
    ],
    tests: [
      { sentence: '_____ Amazon is _____ longest river in South America.', options: ['The / the', 'A / the', 'The / a', '- / the'], answer: 'The / the', explanation: 'Nehirler the alır, superlative the alır.' },
      { sentence: 'She is _____ honest person.', options: ['an', 'a', 'the', '-'], answer: 'an', explanation: '"Honest" sesli harfle başlar (h sessiz) → an.' },
    ],
  },
]

export function getTopicsByCategory(category: string): GrammarTopic[] {
  return GRAMMAR_TOPICS.filter(t => t.category === category)
}
