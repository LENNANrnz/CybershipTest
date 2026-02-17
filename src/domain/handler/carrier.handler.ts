import { RateQuote } from '../rate-quote';

export interface CarrierHandler<TResponse> {
  map(response: TResponse): RateQuote[];
}