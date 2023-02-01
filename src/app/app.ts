import { NgFor } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { RouteInfo } from './interfaces/route-info';
import { RouteCard } from './ui/route-card/route-card';

const routes = import.meta.glob(['/src/app/routes/**/*.ts'], { eager: true });

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgFor, RouteCard],
    templateUrl: 'app.html',
})
export class App {
    readonly routes: RouteInfo[] = Object.keys(routes).map((key) => {
        const route = routes[key] as Record<string, any>;
        console.log(route, key);
        return {
            ...route['routeMeta'],
            ...route['routeMeta']['data'],
            path: key.replace('/src/app/routes/', '').replace('/index.ts', ''),
        };
    });
    readonly router = inject(Router);

    ngOnInit() {
        this.router.navigate(['/animation-keyframes']);
    }
}