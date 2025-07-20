export default {
  async fetch(request: Request, env: any, ctx: any) {
	if (request.headers.get("Upgrade") !== "websocket") {
	  return new Response("Expected WebSocket", { status: 400 });
	}

	const [clientWs, clientWsServer] = Object.values(new WebSocketPair()) as [WebSocket, WebSocket];
	handleSession(clientWsServer, env).catch(console.error);
	return new Response(null, { status: 101, webSocket: clientWs });
  }
};

async function handleSession(clientWs: WebSocket, env: any) {
  const apiKey = env.DEEPGRAM_API_KEY;
  const deepgramUrl = "wss://api.deepgram.com/v1/agent";

  clientWs.accept();


  // Cloudflare Workers do not support the 'headers' option in WebSocket constructor.
  // Instead, pass the token as a query param (Deepgram supports this) or use a custom subprotocol if required.
  // Here, we use the query param approach for compatibility:
  const wsUrl = `${deepgramUrl}?access_token=${apiKey}`;
  const deepgramWs = new WebSocket(wsUrl);

  // Compatibility fix for Cloudflare WebSocket

  (deepgramWs as any).accept = () => {};

  (deepgramWs as any).onopen = () => {
	// 🧠 Send Agent config to Deepgram after connection opens
	const config = {
	  audio: {
		input: { encoding: 'linear16', sample_rate: 24000 },
		output: { encoding: 'linear16', sample_rate: 24000, container: 'none' }
	  },
	  agent: {
		listen: { provider: { type: 'deepgram', model: 'nova-3' } },
		think: {
		  provider: { type: 'open_ai', model: 'gpt-4o-mini' },
		  prompt: "You are a helpful AI voice assistant created by Deepgram. Respond clearly, concisely, and helpfully."
		},
		speak: { provider: { type: 'deepgram', model: 'aura-2-thalia-en' } },
		greeting: "Hi! How can I help you today?"
	  }
	};

	deepgramWs.send(JSON.stringify({ type: "Configure", config }));

	// 🔁 Forward audio from browser to Deepgram
	(clientWs as any).onmessage = (msg: MessageEvent) => {
	  if (deepgramWs.readyState === 1 && msg.data instanceof ArrayBuffer) {
		deepgramWs.send(msg.data);
	  }
	};

	// 🔁 Forward Deepgram messages back to browser
	(deepgramWs as any).onmessage = (msg: MessageEvent) => {
	  if (clientWs.readyState === 1) {
		clientWs.send(msg.data);
	  }
	};
  };

  // 🧼 Handle disconnects gracefully
  const closeAll = () => {
	try { clientWs.close(); } catch {}
	try { deepgramWs.close(); } catch {}
  };

  (clientWs as any).onclose = closeAll;
  (clientWs as any).onerror = closeAll;
  (deepgramWs as any).onclose = closeAll;
  (deepgramWs as any).onerror = closeAll;
}
