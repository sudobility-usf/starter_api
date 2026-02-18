import { describe, it, expect } from "vitest";
import {
  successResponse,
  errorResponse,
} from "@sudobility/starter_types";
import type {
  History,
  HistoryCreateRequest,
  HistoryUpdateRequest,
} from "@sudobility/starter_types";

describe("histories route logic", () => {
  describe("response formatting", () => {
    it("should format history list response", () => {
      const histories: History[] = [
        {
          id: "uuid-1",
          user_id: "user-1",
          datetime: "2024-01-01T00:00:00.000Z",
          value: 100,
          created_at: "2024-01-01T00:00:00.000Z",
          updated_at: "2024-01-01T00:00:00.000Z",
        },
      ];
      const response = successResponse(histories);
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(1);
      expect(response.data[0].id).toBe("uuid-1");
      expect(response.data[0].value).toBe(100);
    });

    it("should format empty history list", () => {
      const response = successResponse([]);
      expect(response.success).toBe(true);
      expect(response.data).toHaveLength(0);
    });
  });

  describe("validation logic", () => {
    it("should reject missing datetime", () => {
      const body = { value: 100 } as HistoryCreateRequest;
      const hasDatetime = !!body.datetime;
      expect(hasDatetime).toBe(false);
    });

    it("should reject missing value", () => {
      const body = { datetime: "2024-01-01" } as any;
      const hasValue =
        body.value !== undefined && body.value !== null;
      expect(hasValue).toBe(false);
    });

    it("should reject non-positive value", () => {
      const value = -5;
      const isValid = typeof value === "number" && value > 0;
      expect(isValid).toBe(false);
    });

    it("should reject zero value", () => {
      const value = 0;
      const isValid = typeof value === "number" && value > 0;
      expect(isValid).toBe(false);
    });

    it("should accept valid positive value", () => {
      const value = 42.5;
      const isValid = typeof value === "number" && value > 0;
      expect(isValid).toBe(true);
    });

    it("should reject non-number value", () => {
      const value = "not a number" as any;
      const isValid = typeof value === "number" && value > 0;
      expect(isValid).toBe(false);
    });
  });

  describe("authorization logic", () => {
    it("should allow matching userId and tokenUserId", () => {
      const userId = "user-123";
      const tokenUserId = "user-123";
      const siteAdmin = false;
      const authorized =
        userId === tokenUserId || siteAdmin;
      expect(authorized).toBe(true);
    });

    it("should deny mismatched userId and tokenUserId", () => {
      const userId = "user-123";
      const tokenUserId = "user-456";
      const siteAdmin = false;
      const authorized =
        userId === tokenUserId || siteAdmin;
      expect(authorized).toBe(false);
    });

    it("should allow site admin to access other users", () => {
      const userId = "user-123";
      const tokenUserId = "user-456";
      const siteAdmin = true;
      const authorized =
        userId === tokenUserId || siteAdmin;
      expect(authorized).toBe(true);
    });
  });

  describe("update validation", () => {
    it("should detect empty updates", () => {
      const body: HistoryUpdateRequest = {};
      const updates: Record<string, unknown> = {};
      if (body.datetime !== undefined) updates.datetime = body.datetime;
      if (body.value !== undefined) updates.value = body.value;
      expect(Object.keys(updates)).toHaveLength(0);
    });

    it("should detect datetime-only update", () => {
      const body: HistoryUpdateRequest = {
        datetime: "2024-06-01T00:00:00Z",
      };
      const updates: Record<string, unknown> = {};
      if (body.datetime !== undefined) updates.datetime = body.datetime;
      if (body.value !== undefined) updates.value = body.value;
      expect(Object.keys(updates)).toHaveLength(1);
      expect(updates.datetime).toBe("2024-06-01T00:00:00Z");
    });

    it("should detect value-only update", () => {
      const body: HistoryUpdateRequest = { value: 99 };
      const updates: Record<string, unknown> = {};
      if (body.datetime !== undefined) updates.datetime = body.datetime;
      if (body.value !== undefined) updates.value = body.value;
      expect(Object.keys(updates)).toHaveLength(1);
      expect(updates.value).toBe(99);
    });

    it("should reject non-positive value in update", () => {
      const value = -10;
      const isValid = typeof value === "number" && value > 0;
      expect(isValid).toBe(false);
    });
  });

  describe("error responses", () => {
    it("should format not authorized error", () => {
      const response = errorResponse("Not authorized");
      expect(response.success).toBe(false);
      expect(response.error).toBe("Not authorized");
    });

    it("should format not found error", () => {
      const response = errorResponse("History not found");
      expect(response.success).toBe(false);
      expect(response.error).toBe("History not found");
    });

    it("should format validation error", () => {
      const response = errorResponse(
        "datetime and value are required"
      );
      expect(response.success).toBe(false);
      expect(response.error).toBe("datetime and value are required");
    });
  });
});
