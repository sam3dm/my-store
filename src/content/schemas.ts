import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "industries": z.array(z.string()),
      "differentiators": z.array(z.object({
        "number": z.string(),
        "title": z.string(),
        "body": z.string(),
        "id": z.string()
      }))
    }),
    contact: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "methods": z.object({
        "form": z.object({
          "eyebrow": z.string(),
          "headline": z.string(),
          "body": z.string()
        }),
        "whatsapp": z.object({
          "label": z.string(),
          "description": z.string(),
          "number": z.string(),
          "href": z.string()
        }),
        "phone": z.object({
          "label": z.string(),
          "description": z.string(),
          "number": z.string(),
          "href": z.string()
        }),
        "email": z.object({
          "label": z.string(),
          "description": z.string(),
          "address": z.string(),
          "href": z.string()
        })
      }),
      "location": z.object({
        "label": z.string(),
        "city": z.string(),
        "country": z.string(),
        "detail": z.string()
      }),
      "social": z.object({
        "instagram": z.object({
          "label": z.string(),
          "href": z.string()
        })
      }),
      "services": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "budgets": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "contactMethods": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "privacy": z.object({
        "text": z.string(),
        "note": z.string()
      }),
      "success": z.object({
        "headline": z.string(),
        "body": z.string(),
        "whatsappLabel": z.string()
      }),
      "footer": z.object({
        "copyright": z.string()
      })
    }),
    about: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "story": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "paragraphs": z.array(z.object({
          "id": z.string(),
          "text": z.string()
        }))
      }),
      "vision": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string()
      }),
      "mission": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string()
      }),
      "expertise": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "intro": z.string(),
        "disciplines": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "medical": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "paragraphs": z.array(z.object({
          "id": z.string(),
          "text": z.string()
        })),
        "callout": z.string()
      }),
      "process": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "steps": z.array(z.object({
          "id": z.string(),
          "number": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "whyUs": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "points": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "cta": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "buttonLabel": z.string()
      })
    }),
    services: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string(),
        "body": z.string()
      }),
      "services": z.array(z.object({
        "id": z.string(),
        "number": z.string(),
        "title": z.string(),
        "tagline": z.string(),
        "description": z.string(),
        "deliverables": z.array(z.string())
      })),
      "cta": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "buttonLabel": z.string()
      })
    }),
    industries: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string()
      }),
      "industries": z.array(z.object({
        "id": z.string(),
        "number": z.string(),
        "title": z.string(),
        "tagline": z.string(),
        "description": z.string(),
        "capabilities": z.array(z.string())
      })),
      "cta": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "buttonLabel": z.string()
      })
    }),
    portfolio: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string()
      }),
      "categories": z.array(z.object({
        "id": z.string(),
        "label": z.string()
      })),
      "items": z.array(z.object({
        "id": z.string(),
        "category": z.string(),
        "slot": z.string(),
        "title": z.string(),
        "label": z.string(),
        "type": z.string()
      })),
      "cta": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "buttonLabel": z.string()
      })
    }),
    luxury_brands: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "intro": z.string()
      }),
      "gallery": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "disclaimer": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "slot": z.string(),
          "number": z.string(),
          "title": z.string(),
          "service": z.string(),
          "description": z.string(),
          "tags": z.array(z.string()),
          "note": z.string()
        }))
      }),
      "process": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "steps": z.array(z.object({
          "id": z.string(),
          "step": z.string(),
          "title": z.string(),
          "body": z.string()
        }))
      }),
      "services": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "body": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "capabilities": z.array(z.string()),
      "cta": z.object({
        "eyebrow": z.string(),
        "heading": z.string(),
        "body": z.string(),
        "primaryButton": z.string(),
        "secondaryButton": z.string(),
        "backLink": z.string()
      })
    })
  }
};
export type Schemas = typeof schemas;