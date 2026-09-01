# AGENTS.md

## Project Context

This is the NumLab Engine repository. Treat it as user-owned application code, keep changes focused on the user's request, and preserve existing project conventions.

Start with `README.md` for local setup, environment variables, and publish workflow.

## Key Files

- `src/`: frontend application source.
- `server/`: Express API and file-based database.
- `vite.config.js`: Vite configuration and local API proxy.
- `.env.local`: local-only environment values; never commit secrets.

## Working Notes

- Use `npm run dev` to start the API and frontend together.
- Use `npm run build` to validate the production frontend build.
- Run the relevant checks from `package.json` before finishing code changes.
