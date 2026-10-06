import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GestionCandybar } from './gestion-candybar';

describe('GestionCandybar', () => {
  let component: GestionCandybar;
  let fixture: ComponentFixture<GestionCandybar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GestionCandybar],
    }).compileComponents();

    fixture = TestBed.createComponent(GestionCandybar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
