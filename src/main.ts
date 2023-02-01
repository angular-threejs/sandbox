import { provideFileRouter } from '@analogjs/router';
import { bootstrapApplication } from '@angular/platform-browser';
import { extend } from 'angular-three';
import * as THREE from 'three';
import 'zone.js';

import { App } from './app/app';

extend(THREE);

bootstrapApplication(App, {
    providers: [provideFileRouter()],
});
