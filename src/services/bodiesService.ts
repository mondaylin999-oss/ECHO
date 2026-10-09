import { notFound } from "../errors";
import type { Body, Tool } from "../schemas/content";
import type { Content } from "./contentStore";

export type ToolSummary = Pick<Tool, "id" | "bodyId" | "name" | "modelType" | "location">;

export const toToolSummary = (tool: Tool): ToolSummary => ({
  id: tool.id,
  bodyId: tool.bodyId,
  name: tool.name,
  modelType: tool.modelType,
  location: tool.location,
});

export function createBodiesService(content: Content) {
  return {
    list(): Body[] {
      return content.bodies;
    },

    getWithTools(id: string): Body & { tools: ToolSummary[] } {
      const body = content.bodies.find((candidate) => candidate.id === id);
      if (!body) throw notFound(`No body with id "${id}"`);

      const tools = body.hasData
        ? content.tools.filter((tool) => tool.bodyId === body.id).map(toToolSummary)
        : [];
      return { ...body, tools };
    },
  };
}

export type BodiesService = ReturnType<typeof createBodiesService>;
