import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearhBar } from './searh-bar';

describe('SearhBar', () => {
  let component: SearhBar;
  let fixture: ComponentFixture<SearhBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearhBar],
    }).compileComponents();

    fixture = TestBed.createComponent(SearhBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
