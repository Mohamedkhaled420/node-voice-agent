
import React, { useState, useRef, useEffect } from 'react';

const IndexPage = () => {
  const [sessionUrl, setSessionUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcripts, setTranscripts] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch('/api/start-session')
      .then((res) => res.json())
      .then((data) => setSessionUrl(data.wsUrl))
      .catch(() => setError('Failed to get session URL'));
  }, []);

  // Start session: get mic, connect ws, start recording
  const startSession = async () => {
    setError(null);
    setTranscripts([]);
    if (!sessionUrl) {
      setError('Session URL not available.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const ws = new window.WebSocket(sessionUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        setIsRecording(true);
        // Use MediaRecorder for browser compatibility
        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0 && ws.readyState === WebSocket.OPEN) {
            event.data.arrayBuffer().then((buf) => ws.send(buf));
          }
        };

        mediaRecorder.start(250); // send audio every 250ms
      };

      ws.onmessage = (event) => {
        // Assume server sends transcript as text message
        if (typeof event.data === 'string') {
          setTranscripts((prev) => [...prev, event.data]);
        }
      };

      ws.onerror = (e) => {
        setError('WebSocket error.');
        stopSession();
      };

      ws.onclose = () => {
        setIsRecording(false);
        stopSession();
      };
    } catch (err) {
      setError('Microphone access denied or error starting session.');
      stopSession();
    }
  };

  // Stop session: stop recording, close ws, stop mic
  const stopSession = () => {
    setIsRecording(false);
    if (mediaRecorderRef.current) {
      if (mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  return (
    <div>
      <h1>Deepgram Voice Agent (Vercel/Next.js Demo)</h1>
      <p>This is a demo of the Deepgram Voice Agent, refactored for Vercel/Next.js.</p>
      <p>Session WebSocket URL: {sessionUrl ? <code>{sessionUrl}</code> : 'Loading...'}</p>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button onClick={isRecording ? stopSession : startSession} disabled={!sessionUrl} style={{ margin: '1em 0' }}>
        {isRecording ? 'Stop Session' : 'Start Session'}
      </button>
      <div style={{ marginTop: '2em' }}>
        <h2>Transcript</h2>
        <div style={{ background: '#f4f4f4', padding: '1em', minHeight: '3em' }}>
          {transcripts.length === 0 ? <em>No transcript yet.</em> : transcripts.map((t, i) => <div key={i}>{t}</div>)}
        </div>
      </div>
    </div>
  );
};

export default IndexPage;
