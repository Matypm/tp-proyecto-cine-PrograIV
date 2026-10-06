import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DistribucionSala } from './distribucion-sala';

describe('DistribucionSala', () => {
  let component: DistribucionSala;
  let fixture: ComponentFixture<DistribucionSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistribucionSala],
    }).compileComponents();

    fixture = TestBed.createComponent(DistribucionSala);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
