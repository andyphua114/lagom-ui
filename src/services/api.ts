import type { ChatResponse } from "../types/chat";
import type { ChatSettings } from "../types/settings";
import { parseErrorResponse, type AuthenticatedFetch } from "./http";

const PHASE_TYPES = new Set([
  "processing",
  "thinking",
  "retrieving",
  "generating",
]);

interface SendMessageOptions {
  onAnswerDelta?: (delta: string) => void;
  onStatusUpdate?: (status: string) => void;
}

interface StreamEvent {
  type?: string;
  delta?: string;
  answer?: string;
  reasoning?: string;
}

function parseJsonResponse(responseText: string): ChatResponse {
  let parsedBody: unknown = {};

  if (responseText) {
    try {
      parsedBody = JSON.parse(responseText) as unknown;
    } catch {
      throw new Error("Backend response was not valid JSON.");
    }
  }

  const data = parsedBody as Partial<ChatResponse>;

  if (typeof data.answer !== "string") {
    throw new Error("Backend response is missing a valid answer field.");
  }

  if (data.reasoning !== undefined && typeof data.reasoning !== "string") {
    throw new Error("Backend response contains an invalid reasoning field.");
  }

  return {
    answer: data.answer,
    reasoning: data.reasoning,
  };
}

function applyStreamEvent(
  event: StreamEvent,
  currentResponse: ChatResponse,
  onAnswerDelta?: (delta: string) => void,
  onStatusUpdate?: (status: string) => void,
) {
  if (typeof event.type === "string" && PHASE_TYPES.has(event.type)) {
    onStatusUpdate?.(event.type);
  }

  if (typeof event.reasoning === "string") {
    currentResponse.reasoning = event.reasoning;
  }

  if (typeof event.delta === "string") {
    currentResponse.answer += event.delta;
    onAnswerDelta?.(event.delta);
    return;
  }

  if (
    (event.type === "answer" || event.type === "final") &&
    typeof event.answer === "string"
  ) {
    currentResponse.answer = event.answer;
    return;
  }

  if (typeof event.answer === "string" && currentResponse.answer.length === 0) {
    currentResponse.answer = event.answer;
  }
}

function parseNdjsonBuffer(
  buffer: string,
  currentResponse: ChatResponse,
  onAnswerDelta?: (delta: string) => void,
  onStatusUpdate?: (status: string) => void,
) {
  const lines = buffer.split(/\r?\n/);
  const remainder = lines.pop() ?? "";
  let sawEvent = false;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      continue;
    }

    const event = JSON.parse(trimmedLine) as StreamEvent;
    sawEvent = true;

    if (event.type === "done") {
      continue;
    }

    applyStreamEvent(event, currentResponse, onAnswerDelta, onStatusUpdate);
  }

  return {
    sawEvent,
    remainder,
  };
}

function parseSseBuffer(
  buffer: string,
  currentResponse: ChatResponse,
  onAnswerDelta?: (delta: string) => void,
  onStatusUpdate?: (status: string) => void,
) {
  const normalizedBuffer = buffer.replace(/\r\n/g, "\n");
  const events = normalizedBuffer.split("\n\n");
  const remainder = events.pop() ?? "";
  let sawEvent = false;

  for (const eventBlock of events) {
    const dataLines = eventBlock
      .split("\n")
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart());

    if (dataLines.length === 0) {
      continue;
    }

    const data = dataLines.join("\n").trim();
    if (!data) {
      continue;
    }

    sawEvent = true;

    if (data === "[DONE]") {
      continue;
    }

    const event = JSON.parse(data) as StreamEvent;

    if (event.type === "done") {
      continue;
    }

    applyStreamEvent(event, currentResponse, onAnswerDelta, onStatusUpdate);
  }

  return {
    sawEvent,
    remainder,
  };
}

async function parseStreamingResponse(
  response: Response,
  options: SendMessageOptions,
) {
  if (!response.body) {
    const fallbackText = await response.text();
    return parseJsonResponse(fallbackText);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const useSse = contentType.includes("text/event-stream");
  let buffer = "";
  let sawStreamEvent = false;
  const chatResponse: ChatResponse = { answer: "" };

  while (true) {
    const { done, value } = await reader.read();

    buffer += decoder.decode(value, { stream: !done });

    const parsedChunk = useSse
      ? parseSseBuffer(
          buffer,
          chatResponse,
          options.onAnswerDelta,
          options.onStatusUpdate,
        )
      : parseNdjsonBuffer(
          buffer,
          chatResponse,
          options.onAnswerDelta,
          options.onStatusUpdate,
        );

    sawStreamEvent = sawStreamEvent || parsedChunk.sawEvent;
    buffer = parsedChunk.remainder;

    if (done) {
      break;
    }
  }

  const remainingText = buffer.trim();

  if (!sawStreamEvent) {
    return parseJsonResponse(remainingText);
  }

  if (remainingText) {
    const trailingEvent = useSse
      ? parseSseBuffer(
          `${remainingText}\n\n`,
          chatResponse,
          options.onAnswerDelta,
          options.onStatusUpdate,
        )
      : parseNdjsonBuffer(
          `${remainingText}\n`,
          chatResponse,
          options.onAnswerDelta,
          options.onStatusUpdate,
        );

    sawStreamEvent = sawStreamEvent || trailingEvent.sawEvent;

    if (trailingEvent.remainder.trim()) {
      throw new Error("Backend stream ended with an incomplete event.");
    }
  }

  if (!chatResponse.answer) {
    throw new Error("Backend stream did not contain a valid answer.");
  }

  return chatResponse;
}

export async function sendMessage(
  message: string,
  settings: ChatSettings,
  sessionId: string,
  authenticatedFetch: AuthenticatedFetch,
  options: SendMessageOptions = {},
): Promise<ChatResponse> {
  let response: Response;

  try {
    response = await authenticatedFetch(settings.chatPath, {
      method: "POST",
      body: JSON.stringify({ message, sessionId }),
    });
  } catch {
    throw new Error(
      "An error occurred. If the problem persists, contact helpdesk.",
    );
  }

  if (!response.ok) {
    await parseErrorResponse(response);
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";

  if (contentType.includes("application/json")) {
    const responseText = await response.text();
    return parseJsonResponse(responseText);
  }

  return parseStreamingResponse(response, options);
}
