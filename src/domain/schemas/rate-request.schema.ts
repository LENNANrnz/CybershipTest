import { z } from "zod";

export const AddressSchema = z.object({
  name: z.string().optional(),
  street1: z.string().min(1),
  street2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  countryCode: z.string().length(2)
});

export const PackageSchema = z.object({
  dimensions: z.object({
    length: z.number().positive(),
    width: z.number().positive(),
    height: z.number().positive(),
    unit: z.enum(["CM", "IN"])
  }),
  weight: z.object({
    value: z.number().positive(),
    unit: z.enum(["KG", "LB"])
  })
});

export const RateRequestSchema = z.object({
  carrier: z.string(),
  origin: AddressSchema,
  destination: AddressSchema,
  packages: z.array(PackageSchema).min(1),
  serviceLevel: z.string().optional()
});