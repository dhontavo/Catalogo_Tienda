import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LostPassPage } from './lost-pass.page';

describe('LostPassPage', () => {
  let component: LostPassPage;
  let fixture: ComponentFixture<LostPassPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(LostPassPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
