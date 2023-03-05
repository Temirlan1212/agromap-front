import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { AppModule } from './modules/app/app.module';

if (environment.production) {
  enableProdMode();
}

async function bootstrap() {
  try {
    const platformRef = platformBrowserDynamic();
    platformRef.bootstrapModule(AppModule);
  } catch (e) {
    console.error(e);
  }
}

bootstrap();
