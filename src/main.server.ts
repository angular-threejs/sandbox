import { provideFileRouter } from '@analogjs/router';
import { enableProdMode } from '@angular/core';
import { renderApplication } from '@angular/platform-server';
import { withEnabledBlockingInitialNavigation } from '@angular/router';
import 'zone.js/node';

import { App } from './app/app';

if (import.meta.env.PROD) {
    enableProdMode();
}

export default async function render(url: string, document: string) {
    const html = await renderApplication(App, {
        appId: 'analog-app',
        document,
        url,
        providers: [provideFileRouter(withEnabledBlockingInitialNavigation())],
    });

    return html;
}
