# wopr-plugin-reddit

Reddit channel plugin for [WOPR](https://github.com/wopr-network/wopr) — enables AI conversations on Reddit via subreddit monitoring, posting, commenting, DMs, and keyword watching.

## Features

- **Subreddit monitoring** — polls for new posts with configurable intervals
- **Inbox monitoring** — replies, mentions, and DMs
- **Keyword filtering** — only forward posts matching configured keywords
- **Outbound actions** — post, comment reply, DM via `RedditPoster`
- **Rate limiting** — token-bucket limiter (55 req/min, safe under Reddit's 60/min OAuth limit)
- **OAuth2 authentication** — script-app credentials via snoowrap

## Setup

1. Create a Reddit script app at https://www.reddit.com/prefs/apps
2. Get a permanent OAuth2 refresh token (use https://not-an-aardvark.github.io/reddit-oauth-helper/)
3. Configure via WOPR:

```
clientId: <Reddit app client ID>
clientSecret: <Reddit app secret>
refreshToken: <OAuth2 refresh token>
username: <Bot's Reddit username>
subreddits: programming, rust, typescript  (optional)
keywords: WOPR, AI bot  (optional — leave blank to receive all posts)
pollIntervalSeconds: 30  (default)
monitorInbox: true  (default)
```

## Architecture

Mirrors `wopr-plugin-discord` structure:

- `src/index.ts` — plugin entry, orchestrates lifecycle
- `src/reddit-client.ts` — snoowrap wrapper with rate limiting
- `src/channel-provider.ts` — implements `ChannelProvider` for `"reddit"` channel type
- `src/poller.ts` — polling engine for subreddits and inbox
- `src/message-adapter.ts` — converts Reddit events to WOPR `ctx.inject()` calls
- `src/poster.ts` — outbound actions (post, comment reply, DM)
- `src/rate-limiter.ts` — token-bucket rate limiter
- `src/validation.ts` — Zod schemas for config validation
- `src/logger.ts` — Winston logger

## Development

```bash
pnpm install
pnpm build
npx vitest run
pnpm run check
```
