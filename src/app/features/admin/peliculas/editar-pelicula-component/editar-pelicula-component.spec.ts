import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditarPeliculaComponent } from './editar-pelicula-component';

describe('EditarPeliculaComponent', () => {
  let component: EditarPeliculaComponent;
  let fixture: ComponentFixture<EditarPeliculaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPeliculaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPeliculaComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
