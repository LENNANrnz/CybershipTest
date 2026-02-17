import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { ShippingService } from './application/shipping.service';
import { ZodError } from 'zod';
import { RateRequestSchema } from './domain/schemas/rate-request.schema';

export async function starter(shippingService: ShippingService) {
  const rl = readline.createInterface({ input, output });

  console.log("Paste the JSON of the RateRequest and press ENTER:\n");

  const rawInput = await rl.question("> ");
  rl.close();

  try {
    const parsedInput = JSON.parse(rawInput);

    // Validate using Zod
    const validatedRequest = RateRequestSchema.parse(parsedInput);

    const result = await shippingService.getRates(validatedRequest);

    console.log("\nRETURNED QUOTES:");
    console.dir(result, { depth: null });

  } catch (error: any) {
    console.error("\nEXECUTION ERROR:");

    if (error instanceof ZodError) {
      console.error("RateRequest validation error:");
      for (const issue of error.issues) {
        console.error(`- ${issue.path.join(".")}: ${issue.message}`);
      }
    } else if (error.errors) {
      console.error(error.message);
      console.dir(error.errors, { depth: null });
    } else {
      console.error(error.message);
    }
  }
}
