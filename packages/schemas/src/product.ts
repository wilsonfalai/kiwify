import { z } from "zod";

export const productStatusSchema = z.enum(["draft", "active", "inactive"]);
export const lessonContentTypeSchema = z.enum(["text", "video_url"]);

export const productSchema = z.object({
  id: z.string().min(1),
  producerId: z.string().min(1),
  title: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  status: productStatusSchema,
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const createProductSchema = z.object({
  title: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().min(1),
  imageUrl: z.string().url().optional(),
  status: productStatusSchema.default("draft")
});

export const updateProductSchema = createProductSchema.partial();

export const productModuleSchema = z.object({
  id: z.string().min(1),
  productId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().positive(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const createProductModuleSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  position: z.number().int().positive()
});

export const productLessonSchema = z.object({
  id: z.string().min(1),
  moduleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  contentType: lessonContentTypeSchema,
  textContent: z.string().optional(),
  videoUrl: z.string().url().optional(),
  position: z.number().int().positive(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1)
});

export const createProductLessonSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().optional(),
    contentType: lessonContentTypeSchema,
    textContent: z.string().optional(),
    videoUrl: z.string().url().optional(),
    position: z.number().int().positive()
  })
  .superRefine((value, context) => {
    if (value.contentType === "text" && !value.textContent) {
      context.addIssue({
        code: "custom",
        path: ["textContent"],
        message: "Text lessons require textContent."
      });
    }

    if (value.contentType === "video_url" && !value.videoUrl) {
      context.addIssue({
        code: "custom",
        path: ["videoUrl"],
        message: "Video lessons require videoUrl."
      });
    }
  });

export type ProductStatus = z.infer<typeof productStatusSchema>;
export type LessonContentType = z.infer<typeof lessonContentTypeSchema>;
export type Product = z.infer<typeof productSchema>;
export type CreateProductInput = z.input<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ProductModule = z.infer<typeof productModuleSchema>;
export type CreateProductModuleInput = z.input<typeof createProductModuleSchema>;
export type ProductLesson = z.infer<typeof productLessonSchema>;
export type CreateProductLessonInput = z.input<typeof createProductLessonSchema>;
