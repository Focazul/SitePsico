import { describe, it, expect, beforeEach } from "vitest";
import { 
  hashPassword, 
  verifyPassword, 
  generateToken, 
  isValidEmail, 
  isValidPassword 
} from "../_core/auth";

describe("Authentication Functions", () => {
  describe("hashPassword", () => {
    it("should hash a password", () => {
      const password = "SecurePass123";
      const hash = hashPassword(password);
      
      expect(hash).toContain(":");
      const [salt, hashedPart] = hash.split(":");
      expect(salt).toHaveLength(32); // 16 bytes = 32 hex chars
      expect(hashedPart).toHaveLength(128); // 64 bytes = 128 hex chars
    });

    it("should generate different hashes for the same password", () => {
      const password = "SecurePass123";
      const hash1 = hashPassword(password);
      const hash2 = hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
    });
  });

  describe("verifyPassword", () => {
    it("should verify correct password", () => {
      const password = "SecurePass123";
      const hash = hashPassword(password);
      
      const isValid = verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", () => {
      const password = "SecurePass123";
      const hash = hashPassword(password);
      
      const isValid = verifyPassword("WrongPassword", hash);
      expect(isValid).toBe(false);
    });

    it("should reject malformed hash", () => {
      const isValid = verifyPassword("password", "invalid_hash");
      expect(isValid).toBe(false);
    });
  });

  describe("generateToken", () => {
    it("should generate a token with default length", () => {
      const token = generateToken();
      expect(token).toHaveLength(64); // 32 bytes = 64 hex chars
    });

    it("should generate a token with custom length", () => {
      const token = generateToken(16);
      expect(token).toHaveLength(32); // 16 bytes = 32 hex chars
    });

    it("should generate different tokens", () => {
      const token1 = generateToken();
      const token2 = generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("isValidEmail", () => {
    it("should validate correct email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("test.email+tag@example.co.uk")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("invalid.email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user @example.com")).toBe(false);
    });

    it("should reject emails longer than 320 chars", () => {
      const longEmail = "a".repeat(300) + "@example.com";
      expect(isValidEmail(longEmail)).toBe(false);
    });
  });

  describe("isValidPassword", () => {
    it("should validate strong passwords", () => {
      expect(isValidPassword("SecurePass123")).toBe(true);
      expect(isValidPassword("MyP@ssw0rd")).toBe(true);
    });

    it("should reject passwords shorter than 8 characters", () => {
      expect(isValidPassword("Pass12")).toBe(false);
    });

    it("should reject passwords without letters", () => {
      expect(isValidPassword("12345678")).toBe(false);
    });

    it("should reject passwords without numbers", () => {
      expect(isValidPassword("OnlyLetters")).toBe(false);
    });

    it("should reject passwords with only special characters", () => {
      expect(isValidPassword("!@#$%^&*")).toBe(false);
    });
  });
});
