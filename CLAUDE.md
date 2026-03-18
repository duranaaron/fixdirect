# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FixDirect is a Laravel 12 + React 19 application for connecting users who need help with household tasks ("klusjes") with freelance helpers. Built with Inertia.js v2 for seamless server-client data flow.

## Tech Stack

- **Backend**: Laravel 12, PHP 8.4, Fortify (auth), Inertia.js v2
- **Frontend**: React 19, TypeScript 5.7, Tailwind CSS 4, Radix UI, Lucide icons
- **Database**: SQLite (local), database-backed sessions/cache/queue
- **Testing**: Pest 4 (PHPUnit 12)
- **Build**: Vite 7, Wayfinder (type-safe route generation)
- **Formatter**: Laravel Pint (PHP), Prettier + ESLint (JS/TS)

## Common Commands

### Development
```bash
composer run dev          # Start all services (server + queue + Vite)
npm run dev               # Vite dev server only
npm run build             # Production frontend build
```

### Testing
```bash
php artisan test --compact                    # Run all tests
php artisan test --compact --filter=testName  # Run specific test
php artisan test --compact tests/Feature/Auth # Run test file/directory
```

### Linting & Formatting
```bash
vendor/bin/pint --dirty --format agent  # Format changed PHP files
npm run lint                            # ESLint with auto-fix
npm run format                          # Prettier formatting
npm run types                           # TypeScript type checking
```

### Setup
```bash
composer setup  # Full initial setup (install, key:generate, migrate, build)
```

## Architecture

### Backend
- **Routes**: `routes/web.php` (main), `routes/settings.php` (user settings)
- **Controllers**: `app/Http/Controllers/` — KlusjeController handles job CRUD
- **Models**: User and Klusje (task/job) in `app/Models/`
- **Form Requests**: Always use dedicated request classes for validation, not inline
- **Middleware**: Configured in `bootstrap/app.php` (Laravel 12 style, no Kernel.php)

### Frontend
- **Pages**: `resources/js/pages/` — Inertia page components
- **Components**: `resources/js/components/` — Reusable React components
- **Layouts**: `resources/js/layouts/` — App and auth layouts
- **Route helpers**: Import from `@/routes/` or `@/actions/` (Wayfinder-generated)
- **Types**: `resources/js/types/` — TypeScript type definitions

### Key Patterns
- Use Wayfinder for type-safe route references in frontend (`@/actions/`, `@/routes/`)
- Use Eloquent relationships and eager loading; avoid `DB::` facade, prefer `Model::query()`
- Use `php artisan make:*` commands to scaffold new files
- Pass `--no-interaction` to all Artisan commands
- Dark mode is intentionally removed
- Dutch domain language: "klusje" = task/chore, categories include Montage, Verhuizen, Schilderen, etc.

## Testing Conventions

- Every change should have tests; use Pest (`php artisan make:test --pest {name}`)
- Feature tests use `RefreshDatabase` trait (configured in `tests/Pest.php`)
- Tests use in-memory SQLite (`phpunit.xml`)
- Use model factories; check for existing factory states before manual setup
- Do not create verification scripts when tests cover the functionality

## Code Style

- PHP: Use constructor property promotion, explicit return types, type hints, curly braces for all control structures
- Prefer PHPDoc blocks over inline comments
- Follow existing conventions in sibling files
- Run `vendor/bin/pint --dirty --format agent` before finalizing PHP changes
