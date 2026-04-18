# Alfa Invest — Public Website

Публичный корпоративный сайт **alfainvest.uz** на базе архитектуры **Headless CMS**.

## Архитектура

```
alfainvest-public (этот проект)          alfainvest-cms-admin
  React + Vite + Tailwind CSS  ←────────  Node.js + tRPC + PostgreSQL
  Публичный сайт (alfainvest.uz)           CMS Админка (admin.alfainvest.uz)
```

Весь контент (продукты, новости, настройки, филиалы) управляется через CMS-админку и читается через публичные API-эндпоинты.

## Страницы

| Маршрут | Страница | Данные из CMS |
|---------|----------|---------------|
| `/` | Главная | Продукты, Настройки сайта |
| `/about` | О компании | Страница "about", Настройки |
| `/services` | Наши услуги | Продукты (с фильтрами по категориям) |
| `/news` | Новости | Список опубликованных статей |
| `/news/:slug` | Детальная новость | Статья по slug |
| `/contacts` | Контакты | Настройки (телефон, email, адрес), Филиалы |

## Запуск в разработке

```bash
# 1. Убедитесь что CMS-админка запущена на localhost:3000
cd /home/ubuntu/alfainvest-cms-admin
pnpm dev

# 2. Запустите публичный сайт
cd /home/ubuntu/alfainvest-public
pnpm install
pnpm dev
# → http://localhost:3001
```

## Переменные окружения

| Переменная | Описание | По умолчанию |
|-----------|----------|--------------|
| `VITE_CMS_URL` | URL CMS-бэкенда | `""` (через Vite proxy) |

В разработке Vite автоматически проксирует `/api/*` → `localhost:3000`.

В продакшне установите `VITE_CMS_URL=https://admin.alfainvest.uz`.

## Сборка для продакшна

```bash
pnpm build
# Статические файлы в ./dist/
```

## CMS API эндпоинты (публичные, без авторизации)

```
GET /api/trpc/public.getProducts     → Список активных страховых продуктов
GET /api/trpc/public.getNews         → Список опубликованных новостей
GET /api/trpc/public.getBranches     → Список офисов/филиалов
GET /api/trpc/public.getSettings     → Настройки сайта (контакты, соцсети, footer)
GET /api/trpc/public.getPageBySlug   → Контент страницы по slug (about, home, etc.)
```
