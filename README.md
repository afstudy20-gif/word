# English Vocab Lab

Yerel kaynak klasöründen (PDF/XLS) kelime, phrasal verb, collocation ve idiom kartları üretip
SRS tabanlı interaktif öğrenme yapan web uygulaması.

## Özellikler

- Flashcard akışı (`Again`, `Hard`, `Good`, `Easy`, `Known`)
- Quiz akışı (TR anlam, EN anlam, cümleden çıkarım / cloze)
- Günlük İngilizce + Akademik İngilizce filtreleri
- Kart tip filtreleri (`word`, `phrasal_verb`, `idiom`, `collocation`)
- LocalStorage ile kalıcı ilerleme
- `Known` olan kartların düşük olasılıkla tekrar gösterilmesi (tamamen kaybolmaz)

## Kaynaklar

Varsayılan kaynak dizini:

`/Users/yh/Library/CloudStorage/OneDrive-Personal/01-Kardiology E kitap/ingilizce`

Deck builder şu dosyaları kullanır:

- `English Vocabulary and Phrasel Verbs_opt_Optimized.pdf`
- `Paul Nation_4000 Essential English Words *_2009.pdf` (varsa)
- `2021_Teachers_AcademicCollocationList.xls`

## Kurulum

```bash
npm install
```

## Deck Üretimi

```bash
npm run deck:build
```

Hızlı test için:

```bash
npm run deck:build:quick
```

Farklı klasör kullanmak istersen:

```bash
python3 scripts/build_deck.py --source-dir "/path/to/resources"

# Çeviri çağrılarını sınırlamak için (daha hızlı üretim):
python3 scripts/build_deck.py --max-translate 300
```

## Çalıştırma

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm run preview
```
