import type { IncomingMessage, ServerResponse } from "node:http";
import { requireRole } from "../auth/session.guard.js";
import { readBody, sendJson } from "../http.js";
import { publicProductsService } from "./public-products.service.js";
import { productsService } from "./products.service.js";

function producerIdFor(result: Extract<ReturnType<typeof requireRole>, { ok: true }>): string {
  return result.session.user.id;
}

export function handleProductsRequest(request: IncomingMessage, response: ServerResponse): boolean {
  const method = request.method;
  const url = request.url ?? "";

  if (method === "GET" && url.startsWith("/products/")) {
    const slug = decodeURIComponent(url.replace("/products/", ""));
    const product = publicProductsService.getActiveProductBySlug(slug);

    if (!product) {
      sendJson(response, 404, { error: "product_not_found" });
      return true;
    }

    sendJson(response, 200, product);
    return true;
  }

  if (method === "GET" && url === "/producer/products") {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    const items = auth.session.user.role === "platform_admin" ? productsService.listAll() : productsService.listForProducer(auth.session.user.id);
    sendJson(response, 200, { items });
    return true;
  }

  if (method === "POST" && url === "/producer/products") {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    try {
      sendJson(response, 201, productsService.createProduct(producerIdFor(auth), readBody(request)));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "invalid_product" });
    }

    return true;
  }

  const productPatch = url.match(/^\/producer\/products\/([^/]+)$/);
  if (method === "PATCH" && productPatch) {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    try {
      sendJson(response, 200, productsService.updateProduct(producerIdFor(auth), productPatch[1], readBody(request)));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "invalid_product" });
    }

    return true;
  }

  const modulePost = url.match(/^\/producer\/products\/([^/]+)\/modules$/);
  if (method === "POST" && modulePost) {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    try {
      sendJson(response, 201, productsService.createModule(producerIdFor(auth), modulePost[1], readBody(request)));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "invalid_module" });
    }

    return true;
  }

  const lessonPost = url.match(/^\/producer\/modules\/([^/]+)\/lessons$/);
  if (method === "POST" && lessonPost) {
    const auth = requireRole(request, ["producer", "platform_admin"]);

    if (!auth.ok) {
      sendJson(response, auth.statusCode, { error: auth.error });
      return true;
    }

    try {
      sendJson(response, 201, productsService.createLesson(producerIdFor(auth), lessonPost[1], readBody(request)));
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : "invalid_lesson" });
    }

    return true;
  }

  return false;
}
