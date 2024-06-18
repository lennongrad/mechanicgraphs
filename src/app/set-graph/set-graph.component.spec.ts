import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SetGraphComponent } from './set-graph.component';

describe('SetGraphComponent', () => {
  let component: SetGraphComponent;
  let fixture: ComponentFixture<SetGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SetGraphComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SetGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
