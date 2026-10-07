import React, { useState } from 'react';
import { X, Code, Check, Copy, Terminal, Shield, Cpu, ExternalLink, Sparkles } from 'lucide-react';

interface ApiIntegrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiIntegrationModal: React.FC<ApiIntegrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const serverProxyCode = `// server.ts - Secure Backend Proxy for Remove.bg / Gemini / Cloud Vision
import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Endpoint: POST /api/remove-bg
app.post('/api/remove-bg', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image uploaded' });
    }

    // Securely use API Key on the server - NEVER exposed to browser!
    const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;
    
    // Example: Forward to Remove.bg API
    const formData = new FormData();
    formData.append('image_file', new Blob([req.file.buffer]), req.file.originalname);
    formData.append('size', 'auto');

    const response = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': REMOVE_BG_API_KEY || '',
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).send(errorText);
    }

    const arrayBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.send(Buffer.from(arrayBuffer));
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => console.log('Server running on port 3000'));`;

  const frontendIntegrationCode = `// src/utils/aiBackgroundRemoval.ts - Frontend caller
export async function removeBackgroundWithServerAPI(file: File): Promise<Blob> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch('/api/remove-bg', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Background removal failed: ' + (await response.text()));
  }

  return await response.blob();
}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <Code className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              AI Background Removal & API Integration
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Technical architecture and cloud API proxy integration guide.
            </p>
          </div>
        </div>

        {/* Current Architecture Status */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/80 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-800 dark:text-indigo-300">
            <Cpu className="w-4 h-4 text-indigo-500" />
            <span>Active Engine: In-Browser ONNX Neural Model (@imgly/background-removal)</span>
          </div>
          <p className="text-xs text-indigo-900/80 dark:text-indigo-300/80 leading-relaxed">
            BG Move utilizes a real on-device neural network model running directly inside your browser via WebAssembly (Wasm) and WebGPU. It executes high-fidelity semantic segmentation without sending any pixels to an external server.
          </p>
        </div>

        {/* Integration Instructions */}
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-500" />
            Connecting External AI APIs (Remove.bg / ClipDrop / Cloud Vision)
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            To connect paid high-throughput cloud APIs, follow the secure backend proxy pattern below so your secret API keys are never exposed in frontend client JavaScript:
          </p>

          <ol className="list-decimal list-inside space-y-2 text-xs text-slate-600 dark:text-slate-300 font-medium">
            <li>
              Add your API key to <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600">.env</code> (e.g., <code className="font-mono">REMOVE_BG_API_KEY="your_secret_key"</code>).
            </li>
            <li>
              Define a server-side route <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600">/api/remove-bg</code> in Express or Cloud Run.
            </li>
            <li>
              The frontend calls <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono text-indigo-600">removeBackgroundWithServerAPI(file)</code>, which proxies the request safely.
            </li>
          </ol>
        </div>

        {/* Code Snippet 1: Backend Proxy */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-indigo-500" />
              1. Secure Express Backend Proxy (<code className="font-mono text-[11px]">server.ts</code>)
            </span>
            <button
              onClick={() => copyToClipboard(serverProxyCode, 'server')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'server' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'server' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
            {serverProxyCode}
          </pre>
        </div>

        {/* Code Snippet 2: Frontend caller */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-violet-500" />
              2. Frontend API Caller (<code className="font-mono text-[11px]">src/utils/aiBackgroundRemoval.ts</code>)
            </span>
            <button
              onClick={() => copyToClipboard(frontendIntegrationCode, 'client')}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 transition-colors"
            >
              {copiedKey === 'client' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === 'client' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <pre className="p-4 rounded-2xl bg-slate-950 text-slate-200 text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
            {frontendIntegrationCode}
          </pre>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all"
          >
            Got it, close guide
          </button>
        </div>
      </div>
    </div>
  );
};
