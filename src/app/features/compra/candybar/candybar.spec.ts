import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Candybar } from './candybar';

describe('Candybar', () => {
  let component: Candybar;
  let fixture: ComponentFixture<Candybar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Candybar],
    }).compileComponents();

    fixture = TestBed.createComponent(Candybar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
