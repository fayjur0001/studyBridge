import { z } from "zod";

// Preprocesses URL inputs: converts empty strings and nulls to undefined,
// and auto-prepends "https://" if the protocol was omitted by the user.
export function optionalUrl() {
  return z.preprocess((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    if (typeof v === "string") {
      const trimmed = v.trim();
      if (trimmed === "") return undefined;
      if (!/^https?:\/\//i.test(trimmed)) {
        return `https://${trimmed}`;
      }
      return trimmed;
    }
    return v;
  }, z.string().url().optional());
}

// Preprocesses date inputs: HTML date pickers send "" when unselected,
// which causes new Date("") -> Invalid Date when coerced directly.
export function optionalDate() {
  return z.preprocess((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return v;
  }, z.coerce.date().optional());
}

// Preprocesses UUID inputs: converts empty strings (e.g. unselected option dropdowns) to undefined.
export function optionalUuid() {
  return z.preprocess((v) => {
    if (v === null || v === undefined || v === "") return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return v;
  }, z.string().uuid().optional());
}

// Preprocesses integer inputs: converts empty strings to undefined to avoid coercion to 0.
export function optionalInt(options?: { min?: number; max?: number; positive?: boolean }) {
  return z.preprocess(
    (v) => {
      if (v === null || v === undefined || v === "") return undefined;
      if (typeof v === "string" && v.trim() === "") return undefined;
      return v;
    },
    (() => {
      let schema = z.coerce.number().int();
      if (options?.positive) schema = schema.positive();
      if (options?.min !== undefined) schema = schema.min(options.min);
      if (options?.max !== undefined) schema = schema.max(options.max);
      return schema.optional();
    })()
  );
}

// Preprocesses float/numeric inputs: converts empty strings to undefined to avoid coercion to 0.
export function optionalNumber(options?: { min?: number; max?: number; nonnegative?: boolean }) {
  return z.preprocess(
    (v) => {
      if (v === null || v === undefined || v === "") return undefined;
      if (typeof v === "string" && v.trim() === "") return undefined;
      return v;
    },
    (() => {
      let schema = z.coerce.number();
      if (options?.nonnegative) schema = schema.nonnegative();
      if (options?.min !== undefined) schema = schema.min(options.min);
      if (options?.max !== undefined) schema = schema.max(options.max);
      return schema.optional();
    })()
  );
}
