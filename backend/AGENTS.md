# Repository Guidelines

## Project Structure & Module Organization

This repository is a small Node.js backend using Express and ES modules.

- `src/server.js` initializes middleware, defines the current HTTP endpoints, and starts the server.
- `src/routes/` is reserved for route modules as the API grows.
- `src/services/` is reserved for business logic and external-service integrations.
- `src/tools/` is reserved for agent tool implementations.
- `src/middleware/` contains shared Express middleware such as request validation.
- `.env.example` documents required configuration keys. Keep real secrets only in `.env`.

Move new endpoint logic out of `server.js` when it becomes more than a simple handler. Keep routes thin and place reusable behavior in services or tools.

## Build, Test, and Development Commands

- `npm install`: install dependencies from `package-lock.json`.
- `npm run dev`: start the API locally with `node src/server.js`.
- `npm start`: run the server using the production-style entry command.
- `npm test`: run the API test suite with Node.js's built-in test runner.
- `curl http://localhost:3000/health`: verify that the running service responds.

There is currently no compilation step, linter, or watch-mode dependency configured.

## Coding Style & Naming Conventions

Use modern JavaScript with ES module `import`/`export` syntax. Follow the existing style: double quotes, semicolons, two-space indentation, and trailing commas only where they improve readability. Use `camelCase` for variables and functions, and descriptive lowercase filenames such as `appointmentService.js`.

Name HTTP paths with lowercase snake case to match the existing tool endpoints, for example `/tool/check_availability`. Keep response objects predictable and include a `success` or status field where appropriate.

## Testing Guidelines

Tests use Node.js's built-in `node:test` runner. Place API tests in `test/` or unit tests beside modules using the `*.test.js` naming pattern. Run all tests with `npm test`. At minimum, cover successful requests, invalid input, and external-service failures.

## Commit & Pull Request Guidelines

Git history is not available in this checkout, so no repository-specific commit convention can be inferred. Use concise, imperative commit subjects, such as `Add appointment validation`.

Pull requests should explain the behavior change, list verification commands, link relevant issues, and document any new environment variables or API contract changes. Include example requests and responses for endpoint changes.

## Security & Configuration

Copy `.env.example` to `.env` for local development. Never commit credentials, API keys, or webhook URLs. Validate request bodies before using them, and avoid returning sensitive upstream-service details in errors.
