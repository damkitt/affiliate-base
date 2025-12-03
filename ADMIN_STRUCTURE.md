# Admin Panel Structure

## Components

### `/components/Admin/`

Модульная структура админ-панели:

- **AdminHeader.tsx** - Шапка с навигацией и счётчиком pending программ
- **SearchBar.tsx** - Поиск по названию, категории, описанию
- **Tabs.tsx** - Переключатель между Pending и All Programs
- **ProgramCard.tsx** - Карточка программы с кнопками действий
- **EditForm.tsx** - Форма редактирования всех полей программы
- **index.ts** - Barrel export для удобного импорта

## API Routes

### `/app/api/programs/[id]/route.ts`

- **GET** - Получить программу по ID
- **PATCH** - Обновить программу (любые поля)
- **DELETE** - Удалить программу

### `/app/api/admin/programs/route.ts`

- **GET** - Получить все программы или pending (`?status=pending`)
- **PATCH** - Изменить статус одобрения (`{ id, status: "approved" }`)

## Features

✅ Real-time обновление каждые 3 секунды (SWR)
✅ Поиск по всем текстовым полям
✅ Inline редактирование с сохранением
✅ Approve/Decline для pending программ
✅ Delete для одобренных программ
✅ Поддержка новой Prisma схемы (uuid, enum Country, и т.д.)

## Usage

Админка доступна по адресу: `/admin`

Изменения автоматически синхронизируются между вкладками благодаря SWR.
