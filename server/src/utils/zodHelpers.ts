import { z } from "zod";

// Plain `z.string().url().optional()` rejects an empty string with a
// validation error, but frontend forms naturally send "" for an unset
// optional field (e.g. clearing a website input). This treats "" the same
// as "not provided".
export function optionalUrl() {
  return z.preprocess((v) => (v === "" ? undefined : v), z.string().url().optional());
}
