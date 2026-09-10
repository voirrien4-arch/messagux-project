import { createFileRoute } from "@tanstack/react-router";
import { AI_PROVIDERS, type AIModelConfig } from "@/lib/ai-config";

export const Route = createFileRoute("/api/ai/models")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { discoverDynamicModels } = await import("@/lib/ai-service.server");
        try {
          const { searchParams } = new URL(request.url);
          const type = searchParams.get("type") as AIModelConfig["type"] | null;
          const family = searchParams.get("family");

          const staticModels: AIModelConfig[] = [];
          for (const provider of AI_PROVIDERS) {
            if (provider.isDynamic) continue;
            const apiKey = process.env[provider.envKey];
            if (apiKey && apiKey.length > 0) {
              staticModels.push(...provider.models);
            }
          }

          const hcnsecProvider = AI_PROVIDERS.find((p) => p.name === "HCNSEC");
          let dynamicModels: AIModelConfig[] = [];
          if (hcnsecProvider && process.env["HCNSEC_API_KEY"]) {
            dynamicModels = await discoverDynamicModels(hcnsecProvider);
          }

          let allModels = [...staticModels, ...dynamicModels];
          if (type) allModels = allModels.filter((m) => m.type === type);
          if (family) allModels = allModels.filter((m) => m.family === family);
          const chatModels = allModels.filter((m) => m.type === "llm");

          return Response.json({
            success: true,
            data: chatModels,
            count: chatModels.length,
            providers: {
              static: staticModels.length,
              dynamic: dynamicModels.length,
              hcnsec: dynamicModels.length,
            },
            hcnsecConfigured: !!process.env["HCNSEC_API_KEY"],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Erreur inconnue";
          console.error("[API AI Models] Erreur:", message);
          return Response.json(
            { success: false, error: "Impossible de récupérer la liste des modèles", details: message },
            { status: 500 },
          );
        }
      },
    },
  },
});
