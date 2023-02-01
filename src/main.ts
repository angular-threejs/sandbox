import { provideFileRouter } from '@analogjs/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { extend } from 'angular-three';
import * as THREE from 'three';
import 'zone.js';

import { AppComponent } from './app/app.component';

extend(THREE);

bootstrapApplication(AppComponent, {
    providers: [provideFileRouter()],
});
