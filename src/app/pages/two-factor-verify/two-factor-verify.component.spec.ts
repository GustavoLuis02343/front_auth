import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TwoFactorVerifyComponent } from './two-factor-verify.component';

describe('TwoFactorVerifyComponent', () => {
  let component: TwoFactorVerifyComponent;
  let fixture: ComponentFixture<TwoFactorVerifyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TwoFactorVerifyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TwoFactorVerifyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});