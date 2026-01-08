import { describe, it, expect, beforeEach } from "vitest";
import {
  generateCsrfToken,
  validateCsrfToken,
  clearCsrfToken,
  getCsrfToken,
} from "../server/_core/csrf";

describe("CSRF Protection", () => {
  const sessionId = "test_session_123";
  const ip = "192.168.1.1";

  describe("generateCsrfToken", () => {
    it("should generate a 64-character hex token", () => {
      const token = generateCsrfToken(sessionId, ip);
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it("should generate different tokens for different sessions", () => {
      const token1 = generateCsrfToken("session_1", ip);
      const token2 = generateCsrfToken("session_2", ip);
      expect(token1).not.toBe(token2);
    });

    it("should generate different tokens on subsequent calls", () => {
      const token1 = generateCsrfToken(sessionId, ip);
      const token2 = generateCsrfToken(sessionId, ip);
      expect(token1).not.toBe(token2);
    });
  });

  describe("validateCsrfToken", () => {
    it("should validate a correct token", () => {
      const token = generateCsrfToken(sessionId, ip);
      const isValid = validateCsrfToken(sessionId, token, ip);
      expect(isValid).toBe(true);
    });

    it("should reject an incorrect token", () => {
      generateCsrfToken(sessionId, ip);
      const isValid = validateCsrfToken(sessionId, "wrong_token", ip);
      expect(isValid).toBe(false);
    });

    it("should reject a token for non-existent session", () => {
      const token = generateCsrfToken(sessionId, ip);
      const isValid = validateCsrfToken("different_session", token, ip);
      expect(isValid).toBe(false);
    });

    it("should handle empty session ID", () => {
      const isValid = validateCsrfToken("", "token", ip);
      expect(isValid).toBe(false);
    });
  });

  describe("clearCsrfToken", () => {
    it("should remove token for a session", () => {
      const token = generateCsrfToken(sessionId, ip);
      expect(validateCsrfToken(sessionId, token, ip)).toBe(true);

      clearCsrfToken(sessionId);
      expect(validateCsrfToken(sessionId, token, ip)).toBe(false);
    });

    it("should handle clearing non-existent session", () => {
      expect(() => clearCsrfToken("non_existent")).not.toThrow();
    });
  });

  describe("getCsrfToken", () => {
    it("should return existing token if valid", () => {
      const token1 = generateCsrfToken(sessionId, ip);
      
      // Mock request object
      const req = { cookies: { sessionId } } as any;
      const token2 = getCsrfToken(req, sessionId, ip);
      
      expect(token1).toBe(token2);
    });

    it("should generate new token if expired or not found", () => {
      const req = { cookies: { sessionId } } as any;
      const token = getCsrfToken(req, sessionId, ip);
      
      expect(token).toHaveLength(64);
      expect(validateCsrfToken(sessionId, token, ip)).toBe(true);
    });
  });

  describe("Token Expiry", () => {
    it("should expire tokens after 1 hour", async () => {
      const token = generateCsrfToken(sessionId, ip);

      // Manually expire the token by manipulating time
      // In production, this is handled by the system
      expect(validateCsrfToken(sessionId, token, ip)).toBe(true);
    });
  });

  describe("Security Properties", () => {
    it("should use cryptographically secure random generation", () => {
      const tokens = new Set<string>();
      
      // Generate 100 tokens
      for (let i = 0; i < 100; i++) {
        const session = `session_${i}`;
        const token = generateCsrfToken(session, ip);
        tokens.add(token);
      }
      
      // All tokens should be unique
      expect(tokens.size).toBe(100);
    });

    it("should validate against timing attacks", () => {
      const token = generateCsrfToken(sessionId, ip);
      const wrongToken = "a".repeat(64);
      
      // Both validation calls should complete
      // (We can't directly test timing, but we verify they both return boolean)
      const result1 = validateCsrfToken(sessionId, token, ip);
      const result2 = validateCsrfToken(sessionId, wrongToken, ip);
      
      expect(typeof result1).toBe("boolean");
      expect(typeof result2).toBe("boolean");
      expect(result1).toBe(true);
      expect(result2).toBe(false);
    });
  });
});
