import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/ai/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { sendChatMessage, streamChatMessage } = await import("@/lib/ai-service.server");
        try {
          const body = (await request.json()) as {
            modelId?: string;
            messages?: { role: "system" | "user" | "assistant"; content: string }[];
            temperature?: number;
            maxTokens?: number;
            stream?: boolean;
          };
          const { modelId, messages, temperature, maxTokens, stream } = body;

          if (!modelId || !messages || !Array.isArray(messages)) {
            return Response.json(
              { error: "Paramètres manquants : modelId et messages sont requis" },
              { status: 400 },
            );
          }

          if (stream) {
            const encoder = new TextEncoder();
            const readable = new ReadableStream({
              async start(controller) {
                try {
                  const generator = streamChatMessage({
                    modelId,
                    messages,
                    temperature,
                    maxTokens,
                    stream: true,
                  });
                  for await (const chunk of generator) {
                    controller.enqueue(
                      encoder.encode(`data: ${JSON.stringify({ content: chunk })}\n\n`),
                    );
                  }
                  controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                  controller.close();
                } catch (error) {
                  controller.error(error);
                }
              },
            });

            return new Response(readable, {
              headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                Connection: "keep-alive",
              },
            });
          }

          const response = await sendChatMessage({
            modelId,
            messages,
            temperature,
            maxTokens,
            stream: false,
          });

          return Response.json(response);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur interne du serveur";
          console.error("[API AI Chat] Erreur:", message);
          return Response.json({ error: message }, { status: 500 });
        }
      },
    },
  },
});
