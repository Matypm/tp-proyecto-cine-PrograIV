import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ValidacionEmpleadoComponent } from './validacion-empleado-component';

describe('ValidacionEmpleadoComponent', () => {
  let component: ValidacionEmpleadoComponent;
  let fixture: ComponentFixture<ValidacionEmpleadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ValidacionEmpleadoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ValidacionEmpleadoComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
