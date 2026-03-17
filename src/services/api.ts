import type { ChatResponse } from '../types/chat';
import type { ChatSettings } from '../types/settings';

function buildChatUrl(settings: ChatSettings) {
  const baseUrl = settings.apiBaseUrl.replace(/\/+$/, '');
  const chatPath = settings.chatPath.startsWith('/') ? settings.chatPath : `/${settings.chatPath}`;
  return `${baseUrl}${chatPath}`;
}

export async function sendMessage(
  message: string,
  settings: ChatSettings,
): Promise<ChatResponse> {
  let response: Response;

  try {
    response = await fetch(buildChatUrl(settings), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    });
  } catch {
    throw new Error('Unable to reach the backend. Check that the API server is running.');
  }

  const responseText = await response.text();
  let parsedBody: unknown = {};

  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText) as unknown;
    } catch {
      if (!response.ok) {
        throw new Error(responseText);
      }

      throw new Error('Backend response was not valid JSON.');
    }
  }

  if (!response.ok) {
    const errorBody = parsedBody as { detail?: string; message?: string };
    const errorMessage =
      errorBody.detail ??
      errorBody.message ??
      `Request failed with status ${response.status}`;

    throw new Error(errorMessage);
  }

  const data = parsedBody as Partial<ChatResponse>;

  if (typeof data.answer !== 'string') {
    throw new Error('Backend response is missing a valid answer field.');
  }

  if (data.reasoning !== undefined && typeof data.reasoning !== 'string') {
    throw new Error('Backend response contains an invalid reasoning field.');
  }

  return {
    answer: data.answer,
    reasoning: data.reasoning,
  };
}
