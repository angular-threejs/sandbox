import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet, ROUTES } from '@angular/router';
import { RouteInfoWithPath } from './routes';
import { RouteCard } from './ui/route-card/route-card';

const routes = import.meta.glob(['/src/app/routes/**/*.ts']);

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgFor, RouteCard],
    templateUrl: 'app.html',
})
export class App {
    readonly routes: RouteInfoWithPath[] = Object.keys(routes)
        .filter((key) => !key.endsWith('routes/index.ts'))
        .map((key) => {
            const path = key.replace('/src/app/routes/', '').replace('/index.ts', '');
            return { asset: `https://github.com/angular-threejs/assets/blob/main/examples/${path}`, title: path, path };
        });

    readonly theRoutes = inject(ROUTES);

    ngOnInit() {
        console.log(this.theRoutes);
    }
}
