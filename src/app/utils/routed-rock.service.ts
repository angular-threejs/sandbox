import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Color {
    color: string;
    label: string;
    slug: string;
}

@Injectable({ providedIn: 'root' })
export class RoutedRockService {
    private selectedId$ = new BehaviorSubject<number | null>(null);
    readonly id$ = this.selectedId$.asObservable();

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
}
