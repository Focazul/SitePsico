import { z } from "zod";
import {
  createCategory,
  createPost,
  createTag,
  deletePost,
  getCategories,
  getPostBySlug,
  getPublishedPosts,
  getRelatedPosts,
  getTags,
  searchPosts,
  updatePost,
  postExists,
} from "../db";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { generateSlug, generateUniqueSlug } from "../_core/slug";

const slug = z.string().regex(/^[a-z0-9-]+$/, "Slug deve conter apenas letras, números e hífens");

export const blogRouter = router({
  // Public endpoints
  getCategories: publicProcedure.query(async () => {
    const all = await getCategories();
    return all;
  }),

  getTags: publicProcedure.query(async () => {
    const all = await getTags();
    return all;
  }),

  getPosts: publicProcedure
    .input(
      z.object({
        limit: z.number().int().positive().default(10),
        offset: z.number().int().nonnegative().default(0),
        categoryId: z.number().int().optional(),
        tagId: z.number().int().optional(),
      })
    )
    .query(async ({ input }) => {
      const posts = await getPublishedPosts(input.limit, input.offset, input.categoryId, input.tagId);
      return { posts, count: posts.length };
    }),

  getPost: publicProcedure
    .input(z.object({ slug }))
    .query(async ({ input }) => {
      const post = await getPostBySlug(input.slug);
      if (!post) {
        throw new Error("Artigo não encontrado");
      }
      return post;
    }),

  searchPosts: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().int().positive().default(10),
        offset: z.number().int().nonnegative().default(0),
      })
    )
    .query(async ({ input }) => {
      const posts = await searchPosts(input.query, input.limit, input.offset);
      return { posts, count: posts.length };
    }),

  getRelatedPosts: publicProcedure
    .input(z.object({ postId: z.number().int(), limit: z.number().int().positive().default(3) }))
    .query(async ({ input }) => {
      const posts = await getRelatedPosts(input.postId, input.limit);
      return posts;
    }),

  // Admin endpoints
  createCategory: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug,
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const category = await createCategory(input);
      return category;
    }),

  createTag: adminProcedure
    .input(
      z.object({
        name: z.string().min(2),
        slug,
      })
    )
    .mutation(async ({ input }) => {
      const tag = await createTag(input);
      return tag;
    }),

  createPost: adminProcedure
    .input(
      z.object({
        title: z.string().min(5),
        slug: slug.optional(),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(50),
        coverImage: z.string().url().optional(),
        categoryId: z.number().int().optional(),
        tagIds: z.array(z.number().int()).default([]),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { tagIds, ...postData } = input;
      
      // Se slug não foi fornecido, gera automaticamente a partir do título
      let finalSlug = postData.slug;
      if (!finalSlug) {
        const baseSlug = generateSlug(postData.title);
        finalSlug = await generateUniqueSlug(baseSlug, postExists);
      }
      
      const post = await createPost({ ...postData, slug: finalSlug }, tagIds);
      return post;
    }),

  updatePost: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        title: z.string().min(5).optional(),
        slug: slug.optional(),
        excerpt: z.string().max(500).optional(),
        content: z.string().min(50).optional(),
        coverImage: z.string().url().optional(),
        categoryId: z.number().int().optional(),
        tagIds: z.array(z.number().int()).optional(),
        publishedAt: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, tagIds, ...postData } = input;
      await updatePost(id, postData, tagIds);
      return { success: true };
    }),

  deletePost: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      await deletePost(input.id);
      return { success: true };
    }),
});

export type BlogRouter = typeof blogRouter;
