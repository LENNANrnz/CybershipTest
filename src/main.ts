import dotenv from "dotenv";
dotenv.config();

import { starter } from './starter';
import { createShippingServiceStrategies } from './domain/bootstrap/StrategiesShippingService';

const shippingService = createShippingServiceStrategies();

starter(shippingService).catch(console.error);
