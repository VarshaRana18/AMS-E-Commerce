import { z } from "zod";

export const checkoutSchema = z.object({
  components: z
    .array(
      z.object({
        component_id: z.string({ required_error: "component_id is required" }).min(1),
        component_type: z.string({ required_error: "component_type is required" }).min(1),
        quantity: z.number({ required_error: "quantity is required" }).int().min(1, "Quantity must be at least 1"),
      })
    )
    .min(1, "Order must contain at least one item"),
  address: z
    .string({ required_error: "Shipping address is required" })
    .min(1, "Address cannot be empty"),
  total_price: z.number().nonnegative("Total price cannot be negative").optional(),
  idempotency_key: z.string().optional(),
});

export const orderIdParamSchema = z.object({
  id: z.string().min(1, "Order ID is required"),
});
