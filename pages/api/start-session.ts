import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Return the deployed Cloudflare Worker WebSocket URL
  res.status(200).json({ wsUrl: 'wss://deepgram-voice-agent-worker.m-hassouna-mk.workers.dev' });
}
