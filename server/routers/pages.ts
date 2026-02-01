import { z } from "zod";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { generateSlug } from "../_core/slug";
import {
  getPages,
  getPageById,
  getPageBySlug,
  createPage,
  updatePage,
  deletePage,
  pageExists,
} from "../db";

const slug = z.string().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras, números e hífens");

export const pagesRouter = router({
  // Public endpoints
  getBySlug: publicProcedure
    .input(z.object({ slug }))
    .query(async ({ input }) => {
      const page = await getPageBySlug(input.slug);
      if (!page || page.status !== 'published') {
        throw new Error("Página não encontrada");
      }
      return page;
    }),

  // Admin endpoints
  getAll: adminProcedure.query(async () => {
    const pages = await getPages();
    return { pages };
  }),

  getById: adminProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const page = await getPageById(input.id);
      if (!page) {
        throw new Error("Página não encontrada");
      }
      return page;
    }),

  create: adminProcedure
    .input(z.object({
      title: z.string().min(1, "Título é obrigatório"),
      slug: z.string().optional(),
      content: z.string().min(1, "Conteúdo é obrigatório"),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      status: z.enum(["draft", "published"]).default("draft"),
      order: z.number().default(0),
    }))
    .mutation(async ({ input }) => {
      // Gerar slug se não fornecido
      let finalSlug = input.slug || generateSlug(input.title);
      
      // Verificar se slug já existe
      if (await pageExists(finalSlug)) {
        finalSlug = `${finalSlug}-${Date.now()}`;
      }

      const page = await createPage({
        ...input,
        slug: finalSlug,
      });

      return page;
    }),

  update: adminProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().min(1).optional(),
      slug: z.string().optional(),
      content: z.string().optional(),
      metaTitle: z.string().optional(),
      metaDescription: z.string().optional(),
      status: z.enum(["draft", "published"]).optional(),
      order: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const { id, ...data } = input;

      // Se slug foi alterado, verificar se já existe
      if (data.slug && await pageExists(data.slug, id)) {
        throw new Error("Slug já está em uso");
      }

      await updatePage(id, data);
      return { success: true };
    }),

  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await deletePage(input.id);
      return { success: true };
    }),
});
