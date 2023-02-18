import { inject, Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, map } from 'rxjs';

export interface Color {
    color: string;
    label: string;
    slug: string;
}

@Injectable({ providedIn: 'root' })
export class RoutedRockService {
    private readonly router = inject(Router);
    private readonly zone = inject(NgZone);

    private selectedId$ = new BehaviorSubject<number | null>(null);
    readonly id$ = this.selectedId$.asObservable();

    readonly menu$ = this.id$.pipe(
        map((id) => {
            if (id == null) return null;
            return this.menus.find((menu) => menu.id === id);
        })
    );

    readonly parent$ = this.id$.pipe(
        map((id) => {
            if (id == null) return null;
            return `group-${id}`;
        })
    );

    colors: Color[] = [
        {
            color: '#042A2B',
            label: 'Rich Black',
            slug: 'rich-black',
        },
        {
            color: '#5EB1BF',
            label: 'Maximum Blue',
            slug: 'maximum-blue',
        },
        {
            color: '#CDEDF6',
            label: 'Light Cyan',
            slug: 'light-cyan',
        },
        {
            color: '#EF7B45',
            label: 'Mandarin',
            slug: 'mandarin',
        },
        {
            color: '#D84727',
            label: 'Vermilion',
            slug: 'vermilion',
        },
    ];
    menus = this.colors.map((color, index) => ({
        id: index,
        label: color.label,
        path: `/routed-rock/rock/${color.slug}`,
        contentId: index,
        color: color.color,
        angle: ((360 / this.colors.length) * index * Math.PI) / 180,
    }));

    set selectedId(id: number | null) {
        this.selectedId$.next(id);
    }

    set contentId(contentId: string) {
        this.selectedId = this.menus.findIndex((menu) => menu.path.includes(contentId));
        console.log({ contentId, selected: this.selectedId, menus: this.menus });
    }

    navigateByMenu(menu: (typeof this.menus)[number] | null) {
        this.zone.run(() => {
            if (menu) {
                this.router.navigateByUrl(menu.path);
            } else {
                this.router.navigateByUrl('/routed-rock/rock');
            }
        });
    }
}
