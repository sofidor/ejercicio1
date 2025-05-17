import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoComponent } from './yo.component';

describe('YoComponent', () => {
  let component: YoComponent;
  let fixture: ComponentFixture<YoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(YoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
