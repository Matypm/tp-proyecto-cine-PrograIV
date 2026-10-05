import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CrearPelicula } from './crear-pelicula';

describe('CrearPelicula', () => {
  let component: CrearPelicula;
  let fixture: ComponentFixture<CrearPelicula>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearPelicula],
    }).compileComponents();

    fixture = TestBed.createComponent(CrearPelicula);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
