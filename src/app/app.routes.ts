import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { TwoFactorSetupComponent } from './pages/two-factor-setup/two-factor-setup.component';
import { TwoFactorVerifyComponent } from './pages/two-factor-verify/two-factor-verify.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'two-factor-setup', component: TwoFactorSetupComponent },
  { path: 'two-factor-verify', component: TwoFactorVerifyComponent }
];