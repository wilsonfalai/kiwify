const errorResponse = {
  description: "Request failed",
  content: {
    "application/json": {
      schema: {
        $ref: "#/components/schemas/Error"
      }
    }
  }
};

const protectedResponses = {
  "401": {
    ...errorResponse,
    description: "Missing or invalid session"
  },
  "403": {
    ...errorResponse,
    description: "Authenticated user does not have the required role"
  }
};

export const runtimeOpenApiDocument = {
  openapi: "3.1.0",
  info: {
    title: "KiwifyClone API",
    version: "0.1.0",
    description:
      "Documentação executável dos endpoints disponíveis no runtime atual. O contrato de planejamento completo permanece em specs/001-infoproduct-platform/contracts/openapi.yaml."
  },
  servers: [
    {
      url: "/",
      description: "Mesmo host que serve esta documentação"
    }
  ],
  tags: [
    { name: "Health", description: "Disponibilidade do serviço" },
    { name: "Auth", description: "Sessão e autorização por perfil" },
    { name: "Products", description: "Catálogo público e produtos do produtor" },
    { name: "Offers", description: "Ofertas e elegibilidade de pagamento" },
    { name: "Checkout", description: "Criação de pedidos e pagamentos Pix/cartão" }
  ],
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Verificar a saúde da API",
        operationId: "getHealth",
        responses: {
          "200": {
            description: "API disponível",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/HealthResponse" }
              }
            }
          }
        }
      }
    },
    "/auth/session": {
      get: {
        tags: ["Auth"],
        summary: "Obter a sessão autenticada",
        operationId: "getSession",
        security: [{ sessionHeader: [] }],
        responses: {
          "200": {
            description: "Usuário da sessão atual",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SessionResponse" }
              }
            }
          },
          "401": protectedResponses["401"]
        }
      }
    },
    "/auth/producer": {
      get: {
        tags: ["Auth"],
        summary: "Verificar acesso de produtor",
        operationId: "checkProducerAccess",
        security: [{ sessionHeader: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleAccessResponse" }
              }
            }
          },
          ...protectedResponses
        }
      }
    },
    "/auth/platform-admin": {
      get: {
        tags: ["Auth"],
        summary: "Verificar acesso de administrador da plataforma",
        operationId: "checkPlatformAdminAccess",
        security: [{ sessionHeader: [] }],
        responses: {
          "200": {
            description: "Acesso permitido",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/RoleAccessResponse" }
              }
            }
          },
          ...protectedResponses
        }
      }
    },
    "/products/{slug}": {
      get: {
        tags: ["Products"],
        summary: "Consultar produto público ativo",
        operationId: "getPublicProduct",
        parameters: [
          {
            name: "slug",
            in: "path",
            required: true,
            schema: { type: "string" },
            example: "curso-de-typescript"
          }
        ],
        responses: {
          "200": {
            description: "Produto e suas ofertas ativas",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/PublicProduct" }
              }
            }
          },
          "404": {
            ...errorResponse,
            description: "Produto não encontrado ou inativo"
          }
        }
      }
    },
    "/producer/products": {
      get: {
        tags: ["Products"],
        summary: "Listar produtos do produtor",
        operationId: "listProducerProducts",
        security: [{ sessionHeader: [] }],
        responses: {
          "200": {
            description: "Produtos acessíveis ao usuário atual",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["items"],
                  properties: {
                    items: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" }
                    }
                  }
                }
              }
            }
          },
          ...protectedResponses
        }
      },
      post: {
        tags: ["Products"],
        summary: "Criar produto",
        operationId: "createProduct",
        security: [{ sessionHeader: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateProductRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Produto criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" }
              }
            }
          },
          "400": errorResponse,
          ...protectedResponses
        }
      }
    },
    "/producer/products/{productId}": {
      patch: {
        tags: ["Products"],
        summary: "Atualizar produto",
        operationId: "updateProduct",
        security: [{ sessionHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/ProductId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/UpdateProductRequest" }
            }
          }
        },
        responses: {
          "200": {
            description: "Produto atualizado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Product" }
              }
            }
          },
          "400": errorResponse,
          ...protectedResponses
        }
      }
    },
    "/producer/products/{productId}/modules": {
      post: {
        tags: ["Products"],
        summary: "Criar módulo no produto",
        operationId: "createProductModule",
        security: [{ sessionHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/ProductId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateModuleRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Módulo criado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductModule" }
              }
            }
          },
          "400": errorResponse,
          ...protectedResponses
        }
      }
    },
    "/producer/modules/{moduleId}/lessons": {
      post: {
        tags: ["Products"],
        summary: "Criar aula no módulo",
        operationId: "createProductLesson",
        security: [{ sessionHeader: [] }],
        parameters: [
          {
            name: "moduleId",
            in: "path",
            required: true,
            schema: { type: "string" }
          }
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateLessonRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Aula criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/ProductLesson" }
              }
            }
          },
          "400": errorResponse,
          ...protectedResponses
        }
      }
    },
    "/producer/products/{productId}/offers": {
      post: {
        tags: ["Offers"],
        summary: "Criar oferta para o produto",
        operationId: "createOffer",
        security: [{ sessionHeader: [] }],
        parameters: [{ $ref: "#/components/parameters/ProductId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateOfferRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Oferta criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Offer" }
              }
            }
          },
          "400": errorResponse,
          ...protectedResponses
        }
      }
    },
    "/offers/{offerId}/eligibility": {
      get: {
        tags: ["Offers"],
        summary: "Verificar elegibilidade da oferta e método",
        operationId: "checkOfferEligibility",
        parameters: [
          {
            name: "offerId",
            in: "path",
            required: true,
            schema: { type: "string" }
          },
          {
            name: "method",
            in: "query",
            required: true,
            schema: { $ref: "#/components/schemas/PaymentMethod" }
          }
        ],
        responses: {
          "200": {
            description: "Resultado da elegibilidade",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OfferEligibility" }
              }
            }
          }
        }
      }
    },
    "/checkout/offers/{offerId}": {
      get: {
        tags: ["Checkout"],
        summary: "Iniciar checkout de uma oferta",
        operationId: "startCheckout",
        parameters: [{ $ref: "#/components/parameters/OfferId" }],
        responses: {
          "200": {
            description: "Produto e oferta elegíveis para checkout",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutStartResponse" }
              }
            }
          },
          "409": {
            ...errorResponse,
            description: "Produto ou oferta indisponível"
          }
        }
      }
    },
    "/checkout/orders": {
      post: {
        tags: ["Checkout"],
        summary: "Criar pedido pendente",
        operationId: "createCheckoutOrder",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateCheckoutOrderRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Pedido pendente criado com snapshot da oferta",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CreateCheckoutOrderResponse" }
              }
            }
          },
          "400": errorResponse,
          "409": {
            ...errorResponse,
            description: "Oferta indisponível"
          }
        }
      }
    },
    "/checkout/orders/{orderId}": {
      get: {
        tags: ["Checkout"],
        summary: "Consultar status do pedido",
        operationId: "getCheckoutOrderStatus",
        parameters: [{ $ref: "#/components/parameters/OrderId" }],
        responses: {
          "200": {
            description: "Status atual do pedido e pagamento",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/OrderStatusResponse" }
              }
            }
          },
          "404": {
            ...errorResponse,
            description: "Pedido não encontrado"
          }
        }
      }
    },
    "/checkout/orders/{orderId}/payments/pix": {
      post: {
        tags: ["Checkout"],
        summary: "Criar pagamento Pix",
        operationId: "createPixPayment",
        parameters: [{ $ref: "#/components/parameters/OrderId" }],
        responses: {
          "201": {
            description: "Cobrança Pix criada",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutPaymentResponse" }
              }
            }
          },
          "400": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
          "502": {
            ...errorResponse,
            description: "Falha segura na comunicação com o provedor"
          }
        }
      }
    },
    "/checkout/orders/{orderId}/payments/credit-card": {
      post: {
        tags: ["Checkout"],
        summary: "Processar pagamento com cartão",
        description:
          "Os dados do cartão são transitórios e nunca são persistidos, exibidos em respostas ou registrados em logs.",
        operationId: "createCreditCardPayment",
        parameters: [{ $ref: "#/components/parameters/OrderId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreditCardPaymentRequest" }
            }
          }
        },
        responses: {
          "201": {
            description: "Pagamento processado pelo provider configurado",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/CheckoutPaymentResponse" }
              }
            }
          },
          "400": errorResponse,
          "404": errorResponse,
          "409": errorResponse,
          "502": {
            ...errorResponse,
            description: "Falha segura na comunicação com o provedor"
          }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      sessionHeader: {
        type: "apiKey",
        in: "header",
        name: "x-kiwifyclone-session",
        description:
          "Sessão JSON codificada em base64url. Use os helpers de @kiwifyclone/auth para gerar o valor durante o desenvolvimento."
      }
    },
    parameters: {
      ProductId: {
        name: "productId",
        in: "path",
        required: true,
        schema: { type: "string" }
      },
      OfferId: {
        name: "offerId",
        in: "path",
        required: true,
        schema: { type: "string" }
      },
      OrderId: {
        name: "orderId",
        in: "path",
        required: true,
        schema: { type: "string" }
      }
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: {
          error: { type: "string" }
        }
      },
      HealthResponse: {
        type: "object",
        required: ["status", "service"],
        properties: {
          status: { type: "string", const: "ok" },
          service: { type: "string", const: "api" }
        }
      },
      AuthRole: {
        type: "string",
        enum: ["buyer", "producer", "platform_admin"]
      },
      AuthUser: {
        type: "object",
        required: ["id", "email", "name", "role"],
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          role: { $ref: "#/components/schemas/AuthRole" }
        }
      },
      SessionResponse: {
        type: "object",
        required: ["user"],
        properties: {
          user: { $ref: "#/components/schemas/AuthUser" }
        }
      },
      RoleAccessResponse: {
        type: "object",
        required: ["allowed", "role"],
        properties: {
          allowed: { type: "boolean", const: true },
          role: { $ref: "#/components/schemas/AuthRole" }
        }
      },
      ProductStatus: {
        type: "string",
        enum: ["draft", "active", "inactive"]
      },
      Product: {
        type: "object",
        required: ["id", "producerId", "title", "slug", "description", "status", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string" },
          producerId: { type: "string" },
          title: { type: "string" },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          description: { type: "string" },
          imageUrl: { type: "string", format: "uri" },
          status: { $ref: "#/components/schemas/ProductStatus" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreateProductRequest: {
        type: "object",
        required: ["title", "slug", "description"],
        properties: {
          title: { type: "string", minLength: 1 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          description: { type: "string", minLength: 1 },
          imageUrl: { type: "string", format: "uri" },
          status: {
            allOf: [{ $ref: "#/components/schemas/ProductStatus" }],
            default: "draft"
          }
        }
      },
      UpdateProductRequest: {
        type: "object",
        properties: {
          title: { type: "string", minLength: 1 },
          slug: { type: "string", pattern: "^[a-z0-9]+(?:-[a-z0-9]+)*$" },
          description: { type: "string", minLength: 1 },
          imageUrl: { type: "string", format: "uri" },
          status: { $ref: "#/components/schemas/ProductStatus" }
        }
      },
      ProductModule: {
        type: "object",
        required: ["id", "productId", "title", "position", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string" },
          productId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          position: { type: "integer", minimum: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreateModuleRequest: {
        type: "object",
        required: ["title", "position"],
        properties: {
          title: { type: "string", minLength: 1 },
          description: { type: "string" },
          position: { type: "integer", minimum: 1 }
        }
      },
      ProductLesson: {
        type: "object",
        required: ["id", "moduleId", "title", "contentType", "position", "createdAt", "updatedAt"],
        properties: {
          id: { type: "string" },
          moduleId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
          contentType: { type: "string", enum: ["text", "video_url"] },
          textContent: { type: "string" },
          videoUrl: { type: "string", format: "uri" },
          position: { type: "integer", minimum: 1 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreateLessonRequest: {
        type: "object",
        required: ["title", "contentType", "position"],
        properties: {
          title: { type: "string", minLength: 1 },
          description: { type: "string" },
          contentType: { type: "string", enum: ["text", "video_url"] },
          textContent: { type: "string" },
          videoUrl: { type: "string", format: "uri" },
          position: { type: "integer", minimum: 1 }
        }
      },
      PaymentMethod: {
        type: "string",
        enum: ["pix", "credit_card"]
      },
      Offer: {
        type: "object",
        required: [
          "id",
          "productId",
          "name",
          "priceCents",
          "currency",
          "status",
          "allowedPaymentMethods",
          "createdAt",
          "updatedAt"
        ],
        properties: {
          id: { type: "string" },
          productId: { type: "string" },
          name: { type: "string" },
          priceCents: { type: "integer", minimum: 1 },
          currency: { type: "string", minLength: 3, maxLength: 3 },
          status: { type: "string", enum: ["active", "inactive"] },
          allowedPaymentMethods: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/PaymentMethod" }
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" }
        }
      },
      CreateOfferRequest: {
        type: "object",
        required: ["name", "priceCents", "allowedPaymentMethods"],
        properties: {
          name: { type: "string", minLength: 1 },
          priceCents: { type: "integer", minimum: 1 },
          currency: { type: "string", minLength: 3, maxLength: 3, default: "BRL" },
          status: { type: "string", enum: ["active", "inactive"], default: "active" },
          allowedPaymentMethods: {
            type: "array",
            minItems: 1,
            items: { $ref: "#/components/schemas/PaymentMethod" }
          }
        }
      },
      PublicProduct: {
        type: "object",
        required: ["product", "offers"],
        properties: {
          product: { $ref: "#/components/schemas/Product" },
          offers: {
            type: "array",
            items: { $ref: "#/components/schemas/Offer" }
          }
        }
      },
      OfferEligibility: {
        type: "object",
        required: ["eligible"],
        properties: {
          eligible: { type: "boolean" },
          reason: {
            type: "string",
            enum: ["offer_not_purchasable", "payment_method_not_allowed"]
          }
        }
      },
      CheckoutCustomer: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { type: "string", minLength: 2 },
          email: { type: "string", format: "email" },
          document: {
            type: "string",
            description: "CPF ou CNPJ, com 11 ou 14 dígitos"
          },
          phone: {
            type: "string",
            description: "Telefone com DDD"
          }
        }
      },
      CheckoutStartResponse: {
        type: "object",
        required: ["product", "offer"],
        properties: {
          product: { $ref: "#/components/schemas/Product" },
          offer: { $ref: "#/components/schemas/Offer" }
        }
      },
      CreateCheckoutOrderRequest: {
        type: "object",
        required: ["offerId", "customer"],
        properties: {
          offerId: { type: "string" },
          customer: { $ref: "#/components/schemas/CheckoutCustomer" }
        }
      },
      Order: {
        type: "object",
        required: [
          "id",
          "customerId",
          "status",
          "totalCents",
          "currency",
          "createdAt",
          "updatedAt"
        ],
        properties: {
          id: { type: "string" },
          customerId: { type: "string" },
          status: {
            type: "string",
            enum: ["pending", "paid", "refused", "canceled"]
          },
          totalCents: { type: "integer", minimum: 1 },
          currency: { type: "string", minLength: 3, maxLength: 3 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
          paidAt: { type: "string", format: "date-time" }
        }
      },
      OrderItem: {
        type: "object",
        required: [
          "id",
          "orderId",
          "offerId",
          "productId",
          "titleSnapshot",
          "priceCents",
          "currency"
        ],
        properties: {
          id: { type: "string" },
          orderId: { type: "string" },
          offerId: { type: "string" },
          productId: { type: "string" },
          titleSnapshot: { type: "string" },
          priceCents: { type: "integer", minimum: 1 },
          currency: { type: "string", minLength: 3, maxLength: 3 }
        }
      },
      CreateCheckoutOrderResponse: {
        type: "object",
        required: ["order", "item"],
        properties: {
          order: { $ref: "#/components/schemas/Order" },
          item: { $ref: "#/components/schemas/OrderItem" }
        }
      },
      CreditCardPaymentRequest: {
        type: "object",
        required: ["card"],
        properties: {
          card: {
            type: "object",
            description: "Dados transitórios enviados diretamente ao provider.",
            required: [
              "number",
              "holderName",
              "expiryMonth",
              "expiryYear",
              "ccv",
              "postalCode",
              "addressNumber"
            ],
            properties: {
              number: { type: "string", minLength: 12, maxLength: 19 },
              holderName: { type: "string" },
              expiryMonth: { type: "string", pattern: "^(0[1-9]|1[0-2])$" },
              expiryYear: { type: "string", pattern: "^\\d{4}$" },
              ccv: { type: "string", pattern: "^\\d{3,4}$" },
              postalCode: { type: "string", pattern: "^\\d{8}$" },
              addressNumber: { type: "string" },
              addressComplement: { type: "string" }
            }
          }
        }
      },
      CheckoutPaymentResponse: {
        type: "object",
        required: [
          "orderId",
          "paymentId",
          "orderStatus",
          "paymentStatus",
          "paymentMethod"
        ],
        properties: {
          orderId: { type: "string" },
          paymentId: { type: "string" },
          orderStatus: {
            type: "string",
            enum: ["pending", "paid", "refused", "canceled"]
          },
          paymentStatus: {
            type: "string",
            enum: ["pending", "approved", "refused", "canceled"]
          },
          paymentMethod: { $ref: "#/components/schemas/PaymentMethod" },
          pix: {
            type: "object",
            properties: {
              qrCode: { type: "string" },
              payload: { type: "string" },
              expirationDate: { type: "string", format: "date" }
            }
          }
        }
      },
      OrderStatusResponse: {
        type: "object",
        required: ["orderId", "orderStatus"],
        properties: {
          orderId: { type: "string" },
          orderStatus: {
            type: "string",
            enum: ["pending", "paid", "refused", "canceled"]
          },
          paymentId: { type: "string" },
          paymentStatus: {
            type: "string",
            enum: ["pending", "approved", "refused", "canceled"]
          }
        }
      }
    }
  }
} as const;
