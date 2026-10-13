import { z } from "zod";

const customerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  telebirr: z.string().trim().regex(/^09\d{8}$/, "Enter a valid 10-digit Telebirr number starting with 09."),
  area: z.string().trim().min(2, "Area is required."),
  notes: z.string().trim().optional().default(""),
});

const itemSchema = z.object({
  id: z.coerce.number().int().positive(),
  name: z.string().min(1),
  price: z.coerce.number().nonnegative(),
  quantity: z.coerce.number().int().positive(),
});

export const orderSchema = z.object({
  customer: customerSchema,
  items: z.array(itemSchema).min(1, "Your cart is empty."),
  total: z.coerce.number().nonnegative(),
});

export function zodFieldErrors(error) {
  const fieldErrors = {};

  for (const issue of error.issues ?? []) {
    const path = issue.path.join(".");
    if (path && !fieldErrors[path]) {
      fieldErrors[path] = issue.message;
    }
  }

  return fieldErrors;
}
