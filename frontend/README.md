# Growlog Frontend

This package contains the Next.js dashboard for Growlog.

## Responsibilities

- authentication flows
- dashboard layout and navigation
- task creation and completion UX
- analytics visualizations and settings screens

## Development

```powershell
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:3000`.

## Notes

- API calls are defined in `src/features/*/api.ts`
- shared UI building blocks live in `components/ui/`
- global app styling starts in `src/app/globals.css`

For project-wide setup, testing, and architecture notes, see the root [README](../README.md).
