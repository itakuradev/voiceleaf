import { GEMINI_API_KEY, GEMINI_MODEL, GEMINI_TIMEOUT_MS } from '@/config';

import { RECORDING_MIME_TYPE } from './audio';
import { SUMMARY_INSTRUCTION, SUMMARY_RESPONSE_SCHEMA } from './prompt';

const ENDPOINT_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

/** Gemini が生成したタイトルと要約。 */
export type SummaryResult = {
  title: string;
  summary: string;
};

/** AI処理の失敗。呼び出し元はこれをまとめて捕捉し、エラー表示に用いる。 */
export class GeminiError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = 'GeminiError';
  }
}

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
};

/**
 * 録音音声からタイトルと要約を生成する（FN-09, FN-10）。
 *
 * 要件により再試行は行わない。失敗した場合は `GeminiError` を投げる。
 *
 * @param base64Audio Base64エンコードした音声データ
 */
export async function generateSummary(base64Audio: string): Promise<SummaryResult> {
  if (!GEMINI_API_KEY) {
    throw new GeminiError('APIキーが設定されていません');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${ENDPOINT_BASE}/${GEMINI_MODEL}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY,
      },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { inline_data: { mime_type: RECORDING_MIME_TYPE, data: base64Audio } },
              { text: SUMMARY_INSTRUCTION },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: SUMMARY_RESPONSE_SCHEMA,
        },
      }),
    });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new GeminiError('要約がタイムアウトしました', { cause: error });
    }
    throw new GeminiError('Gemini APIへの通信に失敗しました', { cause: error });
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    console.warn(`[gemini] HTTP ${response.status}: ${detail.slice(0, 500)}`);
    throw new GeminiError(`Gemini APIがエラーを返しました (HTTP ${response.status})`);
  }

  const body = (await response.json()) as GeminiResponse;

  if (body.promptFeedback?.blockReason) {
    throw new GeminiError(`内容が処理できませんでした (${body.promptFeedback.blockReason})`);
  }

  const text = body.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.warn('[gemini] 応答にテキストが含まれていません', JSON.stringify(body).slice(0, 500));
    throw new GeminiError('Gemini APIの応答が空でした');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    console.warn('[gemini] JSONとして解釈できません', text.slice(0, 500));
    throw new GeminiError('Gemini APIの応答を解釈できませんでした', { cause: error });
  }

  const { title, summary } = parsed as Partial<SummaryResult>;
  if (typeof title !== 'string' || !title.trim() || typeof summary !== 'string' || !summary.trim()) {
    throw new GeminiError('Gemini APIの応答にタイトルまたは要約が含まれていません');
  }

  return { title: title.trim(), summary: summary.trim() };
}
