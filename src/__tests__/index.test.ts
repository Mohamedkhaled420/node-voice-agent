
describe('Cloudflare Worker Voice Agent Proxy', () => {
  const workerUrl = 'https://deepgram-voice-agent-worker.m-hassouna-mk.workers.dev';

  it('should respond to HTTP requests with 400 for non-WebSocket', async () => {
    const res = await fetch(workerUrl);
    expect(res.status).toBe(400);
    const text = await res.text();
    expect(text).toMatch(/Expected WebSocket/);
  });

  it('should accept WebSocket upgrade', async () => {
    // This test requires a WebSocket client library that works in Node.js
    // and can connect to the deployed Worker. Example using ws:
    const WebSocket = require('ws');
    const ws = new WebSocket(workerUrl.replace('https', 'wss'));
    await new Promise((resolve, reject) => {
      ws.on('open', resolve);
      ws.on('error', reject);
    });
    expect(ws.readyState).toBe(WebSocket.OPEN);
    ws.close();
  });
});