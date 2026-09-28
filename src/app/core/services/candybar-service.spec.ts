import { TestBed } from '@angular/core/testing';
import { CandybarService } from './candybar-service';

describe('CandybarService', () => {
  let service: CandybarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CandybarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
