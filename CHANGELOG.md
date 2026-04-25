# Changelog

Все заметные изменения проекта фиксируются в этом файле.

Формат близок к [Keep a Changelog](https://keepachangelog.com/ru/1.1.0/), версии следуют [Semantic Versioning](https://semver.org/lang/ru/).

## [2.4.0] - 2026-04-25

### Добавлено

- Добавлены `initAnchorScroll`, `initScrollSpy`, `initRevealOnScroll`, `initScrollProgress` и `initInfiniteLoader`.
- Добавлены единые типы для cleanup-функций, scroll targets, offset-функций, hash-режимов и snapshots прогресса.
- Добавлены SSR-safe DOM helpers и общий слой для подписок, hash, offsets, rAF и reduced motion.

### Изменено

- Старые helpers теперь возвращают cleanup-функции и безопасно работают без браузерных globals.
- `smootherAllAnchorLinks` стал совместимой оберткой над `initAnchorScroll` и сохранил поддержку `setOffsetBeforeScroll`.
- Публикуемый пакет синхронизирован с root README и экспортирует ESM, IIFE и TypeScript declarations.

### Документация

- README переписан под новый toolkit с примерами для якорей, scrollspy, reveal, progress и infinite loader.
- Добавлена английская документация в `docs/en/README.md`.

### Надежность

- Добавлен smoke-тест публичного API, cleanup-поведения, типов и документации.
- Добавлен bundle size budget для контроля веса IIFE-сборки.
- Добавлена проверка npm tarball перед публикацией.
- Добавлена SSR-проверка импорта и инициализации без browser globals.
- Добавлен CI для Node 20 и Node 22.
