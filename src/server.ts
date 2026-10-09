import { createApp } from "./app";
import { config } from "./config";
import { ContentError } from "./errors";
import { loadContent, type Content } from "./services/contentStore";

let content: Content;
try {
  content = loadContent();
} catch (err) {
  if (err instanceof ContentError) {
    console.error(`Cannot start: the seed data is invalid.\n${err.message}`);
    process.exit(1);
  }
  throw err;
}

const app = createApp(content);

app.listen(config.port, () => {
  console.log(`Solar System Explorer API listening on http://localhost:${config.port}`);
  console.log(`CORS allowed for: ${config.corsOrigins.join(", ")}`);
});
