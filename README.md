
# Deepgram Voice Agent

A serverless, real-time voice agent app using Deepgram’s Voice Agent API. The frontend is deployed on Vercel (Next.js), and the backend audio proxy runs as a Cloudflare Worker.

---

## How It Works

- **Frontend (Vercel, Next.js):**
  - User visits the app and clicks “Start Session.”
  - The browser captures microphone audio and streams it via WebSocket to the backend Worker.
  - Live transcripts and agent responses are displayed in the UI.
- **Backend (Cloudflare Worker):**
  - Receives WebSocket audio from the browser.
  - Proxies audio to Deepgram’s Voice Agent API.
  - Relays agent responses (transcripts, events) back to the browser in real time.

---

## Deployment Instructions

### 1. Deploy the Cloudflare Worker
- Clone this repo and install [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/).
- In `voice-agent-worker/`, set your Deepgram API key:
  ```sh
  wrangler secret put DEEPGRAM_API_KEY
  ```
- Deploy the Worker:
  ```sh
  wrangler publish
  ```
- Note the deployed Worker WebSocket URL (e.g., `wss://your-worker.your-account.workers.dev`).

### 2. Deploy the Frontend to Vercel
- Import this repo into Vercel.
- Set the environment variable `WORKER_WS_URL` to your Worker’s WebSocket URL.
- Deploy!

---

## Environment Variables

- **Frontend (Vercel):**
  - `WORKER_WS_URL` — WebSocket URL of your deployed Cloudflare Worker
- **Backend (Cloudflare Worker):**
  - `DEEPGRAM_API_KEY` — Your Deepgram Voice Agent API key (set as a Wrangler secret)

---

## Local Development (Codespaces)

- Start the frontend:
  ```sh
  npm install
  npm run dev
  ```
- You can test the frontend locally, but the backend Worker must be deployed and reachable (set `WORKER_WS_URL` in `.env` or Vercel dashboard).
- To run tests:
  ```sh
  npm test
  ```

---

## Tech Stack
- Next.js (React) — Frontend UI
- Cloudflare Worker — Audio/WebSocket proxy backend
- Deepgram Voice Agent API — Real-time voice agent
- TypeScript, WebSocket, MediaRecorder API

---

## Credits
- Built by Mohamed Khaled
- Powered by [Deepgram](https://deepgram.com/) and [Cloudflare Workers](https://workers.cloudflare.com/)

This application can be modify as needed by using the [app-requirements.mdc](.cursor/rules/app-requirements.mdc) file. This file allows you to specify various settings and parameters for the application in a structured format that can be use along with [Cursor's](https://www.cursor.com/) AI Powered Code Editor.

### Using the `app-requirements.mdc` File

1. Clone or Fork this repo.
2. Modify the `app-requirements.mdc`
3. Add the necessary configuration settings in the file.
4. You can refer to the MDC file used to help build this starter application by reviewing  [app-requirements.mdc](.cursor/rules/app-requirements.mdc)

## Testing

Test the application with:

```bash
npm run test
```

## Getting Help

- Join our [Discord community](https://discord.gg/deepgram) for support
- Found a bug? [Create an issue](https://github.com/deepgram-starters/node-voice-agent/issues)
- Have a feature request? [Submit it here](https://github.com/deepgram-starters/node-voice-agent/issues)

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## Security

For security concerns, please review our [Security Policy](SECURITY.md).

## Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## License

This project is licensed under the terms specified in [LICENSE](LICENSE).