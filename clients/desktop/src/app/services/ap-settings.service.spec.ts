import { TestBed } from '@angular/core/testing';

import { AdminSettings } from './ap-settings.service';

describe('AuthService', () => {
  let service: AdminSettings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminSettings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
