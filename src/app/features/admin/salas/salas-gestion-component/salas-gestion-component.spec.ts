import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SalasGestionComponent } from './salas-gestion-component';

describe('SalasGestionComponent', () => {
  let component: SalasGestionComponent;
  let fixture: ComponentFixture<SalasGestionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalasGestionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SalasGestionComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
