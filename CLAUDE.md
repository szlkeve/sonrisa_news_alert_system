# News Alert — Agent Instructions

## Project overview
A TypeScript poller that fetches breaking news from NewsAPI every 60 seconds and logs new articles to the console. This is step 1 of a larger alert system. Keep it minimal — resist adding abstractions that aren't needed yet.

## Tech stack
- **Runtime**: Node.js (v22+)
- **Language**: TypeScript (strict mode)
- **HTTP**: axios
- **Config**: dotenv
- **Runner**: ts-node (dev), tsc (build)

## Common commands
```bash
npm run dev       # run with ts-node (watch mode)
npm run build     # compile to dist/
npm run start     # run compiled output
npm run typecheck # tsc --noEmit
```

## File structure
```
src/
  index.ts       # entry point — loads config, starts poller
  poller.ts      # setInterval loop, dedup logic
  newsapi.ts     # NewsAPI HTTP client, types
.env             # NEWSAPI_KEY=... (never commit)
.env.example     # committed, shows required keys
CLAUDE.md
tsconfig.json
package.json
```

## Conventions
- Use `async/await`, never `.then()` chains
- All public functions must have explicit return types
- Prefer `type` over `interface` for data shapes
- Use `console.error` for errors, `console.log` for article output
- Format logged articles as: `[BREAKING] {title} — {source} ({publishedAt})`
- No classes — plain functions and exported types only

## Environment variables
| Variable | Required | Description |
|---|---|---|
| `NEWSAPI_KEY` | yes | API key from newsapi.org |
| `POLL_INTERVAL_MS` | no | Default: 60000 |

## Deduplication rule
Track seen articles by URL in a `Set<string>`. On each poll, only log and add articles whose URL is not already in the set. The set lives in memory — it resets on restart. That is fine for now.

## Error handling
- If the NewsAPI call fails, log the error and continue — do not crash the poller
- Wrap the poll function body in try/catch

## Out of scope (do not add yet)
- Database or file persistence
- Email or Slack delivery
- User subscriptions or rules engine
- Admin UI
- Tests (will be added in a later step)

## NewsAPI reference
- Endpoint: `GET https://newsapi.org/v2/top-headlines`
- Params: `q=breaking&language=en&pageSize=20`
- Auth: `X-Api-Key` header
- Free tier: 100 requests/day, no CORS restriction from server
- Docs: https://newsapi.org/docs/endpoints/top-headlines