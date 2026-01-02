import sanitizeHtml from "sanitize-html";

/**
 * Sanitize user input to prevent XSS attacks
 * Removes all HTML tags and attributes
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") return "";

  return sanitizeHtml(input, {
    allowedTags: [], // No HTML tags allowed
    allowedAttributes: {},
  })
    .trim()
    .substring(0, 1000); // Max 1000 chars
}

/**
 * Sanitize email field
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== "string") return "";

  return sanitizeHtml(email, {
    allowedTags: [],
    allowedAttributes: {},
  })
    .trim()
    .toLowerCase();
}

/**
 * Sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== "string") return "";

  // Keep only digits and common phone separators
  return phone.replace(/[^\d\-\s\(\)\+]/g, "").trim();
}

/**
 * Sanitize content for blog posts / rich text
 * Allows safe formatting tags but removes scripts
 */
export function sanitizeContent(content: string): string {
  if (!content || typeof content !== "string") return "";

  return sanitizeHtml(content, {
    allowedTags: [
      "b",
      "i",
      "em",
      "strong",
      "p",
      "br",
      "ul",
      "ol",
      "li",
      "a",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "code",
      "pre",
    ],
    allowedAttributes: {
      a: ["href", "title", "target"],
      img: ["src", "alt", "title", "width", "height"],
      p: ["style"],
      div: ["style"],
    },
    allowedStyles: {
      "*": {
        color: [/^#(0x)?[0-9a-f]{3}([0-9a-f]{3})?$/i],
        "text-align": [/^left$|^right$|^center$|^justify$/],
      },
    },
    allowedSchemes: ["http", "https", "mailto"],
    disallowedTagsMode: "discard",
  })
    .trim()
    .substring(0, 50000); // Max 50KB for blog posts
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== "string") return "";

  const trimmed = url.trim().toLowerCase();

  // Block dangerous protocols
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("vbscript:")
  ) {
    return "";
  }

  return url;
}

/**
 * Escape HTML special characters for safe output
 * Use this when rendering user content as text (not HTML)
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") return "";

  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, char => map[char]);
}

/**
 * Validate and sanitize object input
 * Recursively sanitizes all string values in an object
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };

  for (const key in sanitized) {
    const value = sanitized[key];

    if (typeof value === "string") {
      // Apply appropriate sanitization based on field name
      if (key.includes("email")) {
        sanitized[key] = sanitizeEmail(value);
      } else if (key.includes("phone")) {
        sanitized[key] = sanitizePhone(value);
      } else if (key.includes("url") || key.includes("link")) {
        sanitized[key] = sanitizeUrl(value);
      } else if (key === "content" || key === "body" || key === "description") {
        sanitized[key] = sanitizeContent(value);
      } else {
        sanitized[key] = sanitizeInput(value);
      }
    } else if (typeof value === "object" && value !== null) {
      // Recursively sanitize nested objects
      sanitized[key] = sanitizeObject(value);
    }
  }

  return sanitized;
}
