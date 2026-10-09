import { notFound } from "../errors";
import type { Tool } from "../schemas/content";
import type { Content } from "./contentStore";

export function createToolsService(content: Content) {
  return {
    get(toolId: string): Tool {
      const tool = content.tools.find((candidate) => candidate.id === toolId);
      if (!tool) throw notFound(`No tool with id "${toolId}"`);
      return tool;
    },
  };
}

export type ToolsService = ReturnType<typeof createToolsService>;
