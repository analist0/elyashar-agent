# Elyashar Agent

Multi-agent voice appointment platform built with xAI Realtime, Express, React, Vite, and Telegram notifications.

## Structure

- `backend/`: Express API, xAI realtime voice proxy, agent management, appointments, conversations, and Telegram notifications.
- `frontend/`: React and TypeScript dashboard, agent builder, and embeddable voice-booking page.

## Development

```bash
cd backend
npm install
npm start

cd ../frontend
npm install
npm run dev
```

Copy `backend/.env.example` to `backend/.env` and configure required credentials. Never commit real API keys or Telegram bot tokens.
