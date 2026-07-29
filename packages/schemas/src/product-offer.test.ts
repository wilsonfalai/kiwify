import { describe, expect, it } from "vitest";
import { createOfferSchema, createProductLessonSchema, createProductSchema } from "./index.js";

describe("product and offer schemas", () => {
  it("validates product slugs and defaults draft status", () => {
    expect(createProductSchema.parse({ title: "Course", slug: "course-one", description: "Description" })).toMatchObject({
      slug: "course-one",
      status: "draft"
    });

    expect(() => createProductSchema.parse({ title: "Course", slug: "Invalid Slug", description: "Description" })).toThrow();
  });

  it("validates lesson content requirements", () => {
    expect(() =>
      createProductLessonSchema.parse({
        title: "Lesson",
        contentType: "text",
        position: 1
      })
    ).toThrow();

    expect(
      createProductLessonSchema.parse({
        title: "Lesson",
        contentType: "video_url",
        videoUrl: "https://example.com/video",
        position: 1
      })
    ).toMatchObject({ contentType: "video_url" });
  });

  it("validates offer price and allowed methods", () => {
    expect(
      createOfferSchema.parse({
        name: "Launch",
        priceCents: 9900,
        allowedPaymentMethods: ["pix"]
      })
    ).toMatchObject({
      currency: "BRL",
      status: "active"
    });

    expect(() => createOfferSchema.parse({ name: "Free", priceCents: 0, allowedPaymentMethods: ["pix"] })).toThrow();
  });
});
