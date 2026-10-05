import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InformacionEntrada } from './informacion-entrada';

describe('InformacionEntrada', () => {
  let component: InformacionEntrada;
  let fixture: ComponentFixture<InformacionEntrada>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InformacionEntrada],
    }).compileComponents();

    fixture = TestBed.createComponent(InformacionEntrada);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
