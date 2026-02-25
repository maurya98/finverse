import { describe, it, expect } from "vitest";
import { maskPI, detectPIIType } from "../src/maskPI";

describe("detectPIIType", () => {
  it("detects PAN (5 letters, 4 digits, 1 letter)", () => {
    expect(detectPIIType("ABCDE1234F")).toBe("pan");
    expect(detectPIIType("abcde1234f")).toBe("pan");
  });

  it("detects mobile_no (10 digits, 6-9 start)", () => {
    expect(detectPIIType("9876543210")).toBe("mobile_no");
    expect(detectPIIType("+91 9876543210")).toBe("mobile_no");
    expect(detectPIIType("09876543210")).toBe("mobile_no");
    expect(detectPIIType("6123456789")).toBe("mobile_no");
  });

  it("detects aadhaar (12 digits with optional separators)", () => {
    expect(detectPIIType("123456789012")).toBe("aadhaar");
    expect(detectPIIType("1234 5678 9012")).toBe("aadhaar");
    expect(detectPIIType("1234-5678-9012")).toBe("aadhaar");
  });

  it("detects account_no (9-18 digits, but not 12 which is aadhaar)", () => {
    expect(detectPIIType("123456789")).toBe("account_no"); // 9 digits
    expect(detectPIIType("12345678901")).toBe("account_no"); // 11 digits
    expect(detectPIIType("123456789012345678")).toBe("account_no"); // 18 digits
    // 12 digits is aadhaar, not account_no
    expect(detectPIIType("123456789012")).toBe("aadhaar");
  });

  it("returns unknown for empty or invalid input", () => {
    expect(detectPIIType("")).toBe("unknown");
    expect(detectPIIType("   ")).toBe("unknown");
    expect(detectPIIType("short")).toBe("unknown");
    expect(detectPIIType("12345")).toBe("unknown"); // too short for account
    expect(detectPIIType("ABCDE123")).toBe("unknown"); // invalid PAN
    // 10 digits starting with 5 is not valid Indian mobile (6-9), so detected as account_no
    expect(detectPIIType("5123456789")).toBe("account_no");
  });
});

describe("maskPI", () => {
  describe("PAN", () => {
    it("masks PAN: first 2 + 6 asterisks + last 2", () => {
      expect(maskPI("ABCDE1234F")).toBe("AB******4F");
      expect(maskPI("abcde1234f")).toBe("ab******4f");
    });
  });

  describe("mobile_no", () => {
    it("masks 10-digit mobile: first 2 + **** + last 2", () => {
      expect(maskPI("9876543210")).toBe("98****10");
    });

    it("strips +91 / 0 prefix before masking", () => {
      expect(maskPI("+919876543210")).toBe("98****10");
      expect(maskPI("+91 9876543210")).toBe("98****10");
      expect(maskPI("09876543210")).toBe("98****10");
    });
  });

  describe("aadhaar", () => {
    it("masks aadhaar: first 2 + **** **** + last 2", () => {
      expect(maskPI("123456789012")).toBe("12**** ****12");
      expect(maskPI("1234 5678 9012")).toBe("12**** ****12");
      expect(maskPI("1234-5678-9012")).toBe("12**** ****12");
    });
  });

  describe("account_no", () => {
    it("masks account: all but last 4 as asterisks", () => {
      expect(maskPI("123456789")).toBe("*****6789"); // 9 digits
      expect(maskPI("12345678901")).toBe("*******8901"); // 11 digits (not aadhaar)
      expect(maskPI("123456789012345678")).toBe("**************5678"); // 18 digits
      // 12 digits is masked as aadhaar
      expect(maskPI("123456789012")).toBe("12**** ****12");
    });

    it("short account (5 or fewer digits) gets ****", () => {
      expect(maskPI("12345")).not.toBe("12345");
      expect(maskPI("12345")).toMatch(/\*+/);
    });
  });

  describe("edge cases and invalid input", () => {
    it("returns empty string for null, undefined, non-string", () => {
      expect(maskPI(null)).toBe("");
      expect(maskPI(undefined)).toBe("");
      expect(maskPI("")).toBe("");
      expect(maskPI("   ")).toBe("");
    });

    it("trims whitespace before processing", () => {
      expect(maskPI("  ABCDE1234F  ")).toBe("AB******4F");
      expect(maskPI("  9876543210  ")).toBe("98****10");
    });

    it("applies generic mask for unknown type (last 4 visible)", () => {
      expect(maskPI("hello-world")).toBe("*******orld");
      expect(maskPI("ab")).toBe("****");
    });

    it("long digit-only unknown (>=9 digits) is treated as account_no", () => {
      expect(maskPI("123456789012345")).toBe("***********2345");
    });
  });
});
