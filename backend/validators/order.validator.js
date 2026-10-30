import { z } from "zod";

export const checkoutSchema = z.object({
  components: z
    .array(
      z.object({
        component_id: z.string({ error: "component_id is required" }).min(1),
        component_type: z.string({ error: "component_type is required" }).min(1),
        quantity: z.number({ error: "quantity is required" }).int().min(1, "Quantity must be at least 1"),
      }),
      { error: "Order components array is required" }
    )
    .min(1, "Order must contain at least one item"),
  address: z
    .string({ error: "Shipping address is required" })
    .min(1, "Address cannot be empty"),
  total_price: z.number().nonnegative("Total price cannot be negative").optional(),
  idempotency_key: z.string().optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});
