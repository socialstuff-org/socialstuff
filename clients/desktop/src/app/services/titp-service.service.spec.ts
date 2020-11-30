import { TestBed } from '@angular/core/testing';

import { TitpServiceService } from './titp-service.service';

describe('TitpServiceService', () => {
  let service: TitpServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TitpServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
