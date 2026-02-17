import { RateQuote } from '../../domain/rate-quote';
import { RateRequest } from '../../domain/rate-request';

export interface Carrier {
  readonly name: string;
  getRates(request: RateRequest): Promise<RateQuote[]>;
}
