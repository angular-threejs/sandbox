import { NgFor } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';

const routes = import.meta.glob(['/src/app/routes/**/*.ts'], { eager: true });

interface RouteInfo {
    title: string;
    path: string;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, RouterLink, NgFor],
    template: `
        <ul>
            <li *ngFor="let route of routes">
                <a [routerLink]="[route.path]">{{ route.title }}</a>
            </li>
        </ul>
        <router-outlet />
    `,
})
export class AppComponent {
    readonly routes: RouteInfo[] = Object.keys(routes).map((key) => {
        const route = routes[key] as Record<string, any>;
        return {
            ...route['routeMeta'],
            path: key.replace('/src/app/routes/', '').replace('.ts', ''),
        };
    });
}
