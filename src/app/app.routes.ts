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
  { path: 'two-factor-verify', component: TwoFactorVerifyComponent },
  
  // 🔑 AGREGAR ESTAS 3 RUTAS:
  {
    path: 'forgot-password',
    loadComponent: () => import('./pages/forgot-password/forgot-password.component')
      .then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'verify-recovery-code',
    loadComponent: () => import('./pages/verify-recovery-code/verify-recovery-code.component')
      .then(m => m.VerifyRecoveryCodeComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./pages/reset-password/reset-password.component')
      .then(m => m.ResetPasswordComponent)
  },
  
  { path: '**', redirectTo: '/login' }
];