/**
 * Sistema Router - SEO endpoints
 * Responsável por servir sitemap.xml e robots.txt
 */

import { Router } from "express";
import { generateSitemap, generateRobotsTxt } from "./seo";

const router = Router();

/**
 * GET /sitemap.xml
 * Retorna sitemap XML para mecanismos de busca
 */
router.get("/sitemap.xml", async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.header("Content-Type", "application/xml");
    res.header("Cache-Control", "public, max-age=604800"); // 1 semana
    res.send(sitemap);
  } catch (error) {
    console.error("[SEO] Erro ao gerar sitemap:", error);
    res.status(500).send("Erro ao gerar sitemap");
  }
});

/**
 * GET /robots.txt
 * Retorna robots.txt otimizado para SEO
 */
router.get("/robots.txt", (req, res) => {
  try {
    const robotsTxt = generateRobotsTxt();
    res.header("Content-Type", "text/plain");
    res.header("Cache-Control", "public, max-age=604800"); // 1 semana
    res.send(robotsTxt);
  } catch (error) {
    console.error("[SEO] Erro ao gerar robots.txt:", error);
    res.status(500).send("Erro ao gerar robots.txt");
  }
});

export default router;
