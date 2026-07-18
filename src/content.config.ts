import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: ({ image }) =>
    z.object({
      title:                z.string().max(120),
      description:          z.string().max(300),
      pubDate:              z.coerce.date(),
      updatedDate:          z.coerce.date().optional(),
      category:             z.string().default("General"),
      tags:                 z.array(z.string()).default([]),
      draft:                z.boolean().default(false),
      ogImage:              image().optional(),
      author:               z.string().default("Alexis Morin"),
      blueskyPostUri:       z.string().optional(),
      standardDocumentUri:  z.string().optional(),
    }),
});

export const collections = { blog };
