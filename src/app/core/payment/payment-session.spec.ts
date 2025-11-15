import { TestBed } from '@angular/core/testing';

import { PaymentSession } from './payment-session';

describe('PaymentSession', () => {
  let service: PaymentSession;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentSession);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
