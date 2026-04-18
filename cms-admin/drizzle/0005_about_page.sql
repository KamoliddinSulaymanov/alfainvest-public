-- Insert default about page
INSERT INTO `pages` (
  `title`, `titleUz`, `titleEn`, `slug`, `content`, `metaTitle`, `metaDescription`, `status`, `createdAt`, `updatedAt`
) VALUES (
  'About',
  'Biz haqida',
  'About',
  'about',
  '{
    "hero": {
      "badge": {"ru": "О компании", "uz": "Kompaniya haqida", "en": "About the company"},
      "title": {"ru": "Надёжная защита с", "uz": "Ishonchli himoya —", "en": "Reliable protection with"},
      "titleAccent": {"ru": "2003 года", "uz": "2003 yildan beri", "en": "since 2003"},
      "subtitle": {"ru": "ALFA INVEST — одна из ведущих страховых компаний Узбекистана. Мы помогаем людям и бизнесу защищать то, что им важно.", "uz": "ALFA INVEST — O''zbekistonning yetakchi sug''urta kompaniyalaridan biri. Biz odamlar va biznesga ular uchun muhim narsalarni himoya qilishda yordam beramiz.", "en": "ALFA INVEST is one of Uzbekistan''s leading insurance companies. We help people and businesses protect what matters to them."}
    },
    "stats": [
      {"value": "2003", "label": {"ru": "Год основания", "uz": "Ta''sis yili", "en": "Founded"}, "sub": {"ru": "20+ лет на рынке", "uz": "Bozorda 20+ yil", "en": "20+ years in market"}},
      {"value": "83,1 млрд", "label": {"ru": "Уставной капитал", "uz": "Ustav kapitali", "en": "Charter capital"}, "sub": {"ru": "сум", "uz": "so''m", "en": "UZS"}},
      {"value": "B2", "label": {"ru": "Рейтинг Moody''s", "uz": "Moody''s reytingi", "en": "Moody''s rating"}, "sub": {"ru": "международный", "uz": "xalqaro", "en": "international"}},
      {"value": "UzA++", "label": {"ru": "Нац. рейтинг", "uz": "Milliy reyting", "en": "National rating"}, "sub": {"ru": "наивысший", "uz": "eng yuqori", "en": "highest"}}
    ],
    "timeline": [
      {"year": "2003", "text": {"ru": "Основание компании", "uz": "Kompaniya ta''sis etildi", "en": "Company founded"}},
      {"year": "2008", "text": {"ru": "Расширение продуктовой линейки", "uz": "Mahsulot liniyasini kengaytirish", "en": "Product line expansion"}},
      {"year": "2015", "text": {"ru": "Национальный рейтинг UzA++", "uz": "Milliy UzA++ reytingi", "en": "National UzA++ rating"}},
      {"year": "2019", "text": {"ru": "Международный рейтинг B2", "uz": "Xalqaro B2 reytingi", "en": "International B2 rating"}},
      {"year": "2023", "text": {"ru": "Запуск онлайн-страхования", "uz": "Onlayn sug''urta ishga tushirildi", "en": "Online insurance launched"}}
    ],
    "mission": {
      "label": {"ru": "Наша миссия", "uz": "Bizning missiyamiz", "en": "Our mission"},
      "title": {"ru": "Защищать то, что дорого", "uz": "Qadrli narsalarni himoya qilish", "en": "Protect what matters"},
      "text": {"ru": "Мы создаём страховые решения, которые помогают людям и бизнесу чувствовать уверенность в завтрашнем дне.", "uz": "Biz odamlar va biznesga ertangi kunga ishonch hosil qilishga yordam beradigan sug''urta yechimlarini yaratamiz.", "en": "We build insurance solutions that help people and businesses feel confident about tomorrow."}
    },
    "values": [
      {"title": {"ru": "Надёжность", "uz": "Ishonchlilik", "en": "Reliability"}, "desc": {"ru": "20+ лет стабильной работы и выполнения обязательств", "uz": "20+ yil barqaror ish va majburiyatlarni bajarish", "en": "20+ years of stable operation and fulfilling obligations"}},
      {"title": {"ru": "Прозрачность", "uz": "Shaffoflik", "en": "Transparency"}, "desc": {"ru": "Честные условия и понятные тарифы без скрытых пунктов", "uz": "Halol shartlar va yashirin punktlarsiz tushunarli tariflar", "en": "Honest terms and clear pricing without hidden clauses"}},
      {"title": {"ru": "Скорость", "uz": "Tezlik", "en": "Speed"}, "desc": {"ru": "Быстрое оформление и выплаты в кратчайшие сроки", "uz": "Tez rasmiylashtirish va qisqa muddatda to''lovlar", "en": "Fast onboarding and quick payouts"}},
      {"title": {"ru": "Инновации", "uz": "Innovatsiyalar", "en": "Innovation"}, "desc": {"ru": "Современные цифровые сервисы и онлайн-страхование", "uz": "Zamonaviy raqamli xizmatlar va onlayn sug''urta", "en": "Modern digital services and online insurance"}}
    ]
  }',
  'About',
  'Learn about ALFA INVEST',
  'published',
  NOW(),
  NOW()
) ON DUPLICATE KEY UPDATE `updatedAt` = NOW();
