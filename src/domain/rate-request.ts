import { Address } from './address';
import { Package } from './package';

export interface RateRequest {
  carrier: string;
  origin: Address;
  destination: Address;
  packages: Package[];
  serviceLevel?: string;
}