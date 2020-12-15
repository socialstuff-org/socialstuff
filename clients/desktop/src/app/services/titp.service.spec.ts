import { TestBed } from '@angular/core/testing';

import { TitpService } from './titp.service';

describe('TitpServiceService', () => {
  let service: TitpService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitpService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
