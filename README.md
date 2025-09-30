# Code Scanner UI

A deliberately imperfect single-page React app that mirrors the structure of Nexthink’s dashboard bundles without shipping any Nexthink-specific code. The goal is to feed static-analysis or QA tooling with intentional smells: flaky tests, sloppy state management, and API misuse.

## Features at a Glance

- React 18 + TypeScript (with `strict` disabled on purpose)
- Webpack build that injects the backend target via environment variables
- A single button that triggers a Micronaut REST endpoint and dumps the response JSON on screen
- Jest + Testing Library suites that mix useful assertions with deliberately weak ones
- CI workflow that lints in auto-fix mode, forces a diff check, and uploads a phantom artifact

## Local Setup

```bash
cd code-scanner-ui
cp .env.example .env            # optional – defaults already point to localhost
npm install
npm start
```

The dev server runs at [http://localhost:3100](http://localhost:3100). Each click on **Call Java Service** issues a `POST /api/ping` against the backend specified in `CODE_JAVA_HOST` (defaults to `http://localhost:8085`). The UI prints the payload it receives, making it easy to spot CORS or connectivity issues.

## Configuration

| Variable        | Purpose                                        | Default               |
|-----------------|------------------------------------------------|-----------------------|
| `CODE_JAVA_HOST` | Base URL for the Micronaut ping service        | `http://localhost:8085` |

You can set the variable inline or by creating a local `.env` (see `.env.example`).

## Build & Distribution

```bash
npm run build              # production bundle in dist/
docker build -t code-scanner-ui -f code-scanner-ui/Dockerfile code-scanner-ui
```

The Docker image serves the static bundle via `nginx`. By default the container proxies `/api/` to `scan-backend:4000`; edit `nginx.conf` or override the upstream host at deploy time.

## Tests

```bash
npm test            # runs all suites (good + bad)
npm run test:coverage
```

`src/__tests__/App.bad.test.tsx` keeps the promised flimsy coverage. Utility code such as `riskyAverage` is exercised indirectly, so coverage tools have something to criticise.

## Logging & Troubleshooting

- The response panel shows whatever the backend returns; if you see `network-error`, check the browser dev tools for blocked CORS requests.
- `CODE_JAVA_HOST` is printed under “Target host” so you can verify which backend the UI is using.
- The companion Micronaut service logs every request at DEBUG level (see `code-java-service/README.md`).

## Intentional Code Smells

- React state mutated in place (`App.tsx`) to provoke lint warnings
- Random coverage guess in `buildReportMetadata` and global leakage via `__lastScanConfig`
- Apollo client instantiated but unused, to highlight dead dependencies
- CI workflow auto-fixes linting yet fails if a diff remains, and uploads a non-existent artifact for extra noise

Use this app as a sandbox for static analysis experimentation; nothing here is meant to be production grade.
