// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/components/app.component';
import { environment } from './environments/environment'; // ✅ IMPORTA ENVIRONMENT

console.log('🌍 Entorno actual:', environment); // ✅ CONFIRMAR ENTORNO

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
