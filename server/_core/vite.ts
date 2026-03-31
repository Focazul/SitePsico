import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";
import { getPostBySlug } from "../db";

const BASE_URL =
  process.env.FRONTEND_URL ||
  process.env.VITE_APP_URL ||
  process.env.VITE_FRONTEND_URL ||
  "http://localhost:5173";

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

async function injectDynamicSeo(url: string, template: string): Promise<string> {
  try {
    const pathname = new URL(url, "http://localhost").pathname;
    const match = pathname.match(/^\/blog\/([^/?#]+)/);
    if (!match) return template;

    const slug = decodeURIComponent(match[1] || "");
    if (!slug) return template;

    const post = await getPostBySlug(slug);
    if (!post) return template;

    const title = post.title;
    const description = (post.excerpt || stripHtml(post.content)).slice(0, 160);
    const canonical = `${BASE_URL}/blog/${post.slug}`;
    const image = post.coverImage || `${BASE_URL}/images/hero-psychologist.jpg`;
    const publishedIso = post.publishedAt ? new Date(post.publishedAt).toISOString() : "";
    const modifiedIso = post.updatedAt ? new Date(post.updatedAt).toISOString() : "";

    const seoBlock = `\n<!-- SEO_DYNAMIC_START -->\n<title>${escapeHtml(title)} | Blog</title>\n<meta name="description" content="${escapeHtml(description)}" />\n<link rel="canonical" href="${escapeHtml(canonical)}" />\n<meta property="og:type" content="article" />\n<meta property="og:locale" content="pt_BR" />\n<meta property="og:title" content="${escapeHtml(title)}" />\n<meta property="og:description" content="${escapeHtml(description)}" />\n<meta property="og:url" content="${escapeHtml(canonical)}" />\n<meta property="og:image" content="${escapeHtml(image)}" />\n<meta property="og:site_name" content="Consultório de Psicologia" />\n${publishedIso ? `<meta property="article:published_time" content="${escapeHtml(publishedIso)}" />\n` : ""}${modifiedIso ? `<meta property="article:modified_time" content="${escapeHtml(modifiedIso)}" />\n` : ""}<meta name="twitter:card" content="summary_large_image" />\n<meta name="twitter:title" content="${escapeHtml(title)}" />\n<meta name="twitter:description" content="${escapeHtml(description)}" />\n<meta name="twitter:image" content="${escapeHtml(image)}" />\n<!-- SEO_DYNAMIC_END -->\n`;

    return template.replace("</head>", `${seoBlock}</head>`);
  } catch {
    return template;
  }
}

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = await injectDynamicSeo(url, template);
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", async (req, res) => {
    try {
      const indexPath = path.resolve(distPath, "index.html");
      let template = await fs.promises.readFile(indexPath, "utf-8");
      template = await injectDynamicSeo(req.originalUrl || req.url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(template);
    } catch {
      res.sendFile(path.resolve(distPath, "index.html"));
    }
  });
}
