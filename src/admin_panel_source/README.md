# Admin Panel

A minimal admin panel for managing users and sync records.

## Features

- Token-based authentication
- Users management (CRUD operations)
- Sync records viewer with filtering
- Sortable table columns
- JSON data viewer modal

## Tech Stack

- Vite 6
- React 19
- Tailwind CSS 4

## Project Structure

```
src/
├── main.tsx                  # Entry point
├── App.tsx                   # Root component (layout + routing)
├── api.ts                    # API helper with auth handling
├── types.ts                  # TypeScript interfaces
├── globals.css               # Global styles
└── components/
    ├── ui.tsx                # Shared UI components (Spinner, Modal, etc.)
    ├── login-screen.tsx      # Login form
    ├── user-form-modal.tsx
    ├── users-section.tsx
    └── sync-records-section.tsx
```

## API Endpoints

The admin panel expects the following API endpoints:

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| GET    | `/api/admin/users`            | List all users                  |
| POST   | `/api/admin/users`            | Create user (returns JWT token) |
| PUT    | `/api/admin/users/:id`        | Update user                     |
| DELETE | `/api/admin/users/:id`        | Delete user                     |
| GET    | `/api/admin/sync-records`     | List all sync records           |
| DELETE | `/api/admin/sync-records/:id` | Delete sync record              |

All endpoints require `Authorization: Bearer <token>` header.

## Getting Started

```bash
pnpm install
pnpm dev
```

Visit `http://localhost:5173` to access the admin panel.
