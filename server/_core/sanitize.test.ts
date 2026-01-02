import { describe, it, expect } from "vitest";
import {
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  sanitizeContent,
  sanitizeUrl,
  escapeHtml,
} from "../_core/sanitize";

describe("Input Sanitization", () => {
  describe("sanitizeInput", () => {
    it("should remove HTML tags", () => {
      const input = "<img src=x onerror='alert(1)'>";
      const result = sanitizeInput(input);
      expect(result).not.toContain("<");
      expect(result).not.toContain(">");
    });

    it("should remove script tags", () => {
      const input = "<script>alert('xss')</script>Hello";
      const result = sanitizeInput(input);
      expect(result).toBe("Hello");
    });

    it("should trim whitespace", () => {
      const input = "  Hello World  ";
      const result = sanitizeInput(input);
      expect(result).toBe("Hello World");
    });

    it("should return empty string for invalid input", () => {
      expect(sanitizeInput(null as any)).toBe("");
      expect(sanitizeInput(undefined as any)).toBe("");
    });

    it("should limit to max 1000 characters", () => {
      const input = "a".repeat(2000);
      const result = sanitizeInput(input);
      expect(result.length).toBeLessThanOrEqual(1000);
    });
  });

  describe("sanitizeEmail", () => {
    it("should remove HTML from email", () => {
      const input = "user<img>@example.com";
      const result = sanitizeEmail(input);
      expect(result).toBe("user@example.com");
    });

    it("should convert to lowercase", () => {
      const input = "USER@EXAMPLE.COM";
      const result = sanitizeEmail(input);
      expect(result).toBe("user@example.com");
    });
  });

  describe("sanitizePhone", () => {
    it("should keep digits and valid separators", () => {
      const input = "+55 (11) 99999-9999";
      const result = sanitizePhone(input);
      expect(result).toBe("+551199999999");
    });

    it("should remove invalid characters", () => {
      const input = "+55<script> (11) 99999-9999";
      const result = sanitizePhone(input);
      expect(result).toMatch(/^\+?[\d\-\s\(\)]*$/);
    });
  });

  describe("sanitizeContent", () => {
    it("should allow safe HTML tags", () => {
      const input = "<b>Bold</b> and <i>Italic</i>";
      const result = sanitizeContent(input);
      expect(result).toContain("<b>");
      expect(result).toContain("<i>");
    });

    it("should remove script tags", () => {
      const input = "<b>Safe</b><script>alert('xss')</script>";
      const result = sanitizeContent(input);
      expect(result).not.toContain("script");
      expect(result).toContain("<b>");
    });

    it("should allow formatted text", () => {
      const input = "<h2>Title</h2><p>Paragraph</p><ul><li>Item</li></ul>";
      const result = sanitizeContent(input);
      expect(result).toContain("<h2>");
      expect(result).toContain("<p>");
      expect(result).toContain("<ul>");
    });

    it("should limit to 50KB", () => {
      const input = "<p>" + "a".repeat(60000) + "</p>";
      const result = sanitizeContent(input);
      expect(result.length).toBeLessThanOrEqual(50000);
    });
  });

  describe("sanitizeUrl", () => {
    it("should allow http and https", () => {
      expect(sanitizeUrl("https://example.com")).toBe("https://example.com");
      expect(sanitizeUrl("http://example.com")).toBe("http://example.com");
    });

    it("should block javascript: protocol", () => {
      const url = "javascript:alert('xss')";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });

    it("should block data: protocol", () => {
      const url = "data:text/html,<script>alert('xss')</script>";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });

    it("should block vbscript: protocol", () => {
      const url = "vbscript:msgbox('xss')";
      const result = sanitizeUrl(url);
      expect(result).toBe("");
    });

    it("should allow mailto: protocol", () => {
      const url = "mailto:user@example.com";
      // Note: depends on config, but generally mailto is safe
      expect(sanitizeUrl(url)).toHaveLength(url.length);
    });
  });

  describe("escapeHtml", () => {
    it("should escape HTML special characters", () => {
      const input = "<script>alert('xss')</script>";
      const result = escapeHtml(input);
      expect(result).toBe("&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;");
    });

    it("should escape quotes", () => {
      const input = 'He said "Hello" & "World"';
      const result = escapeHtml(input);
      expect(result).toContain("&quot;");
      expect(result).toContain("&amp;");
    });

    it("should escape ampersand", () => {
      const input = "Tom & Jerry";
      const result = escapeHtml(input);
      expect(result).toBe("Tom &amp; Jerry");
    });
  });
});
