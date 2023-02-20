import { inject, Injectable, NgZone } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { injectNgtRef, NgtInjectedRef, NgtRxStore, NgtStore } from 'angular-three';
import { gsap } from 'gsap';
import { filter, map, switchMap } from 'rxjs';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';

export interface Color {
    color: string;
    label: string;
    slug: string;
}

const colors: Color[] = [
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

export const menus = colors.map((color, index) => ({
    id: index + 1,
    label: color.label,
    path: `/routed-rock/rock/${color.slug}`,
    contentId: index + 1,
    color: color.color,
    angle: ((360 / colors.length) * index * Math.PI) / 180,
}));

const position = new THREE.Vector3();

@Injectable()
export class RoutedRockService extends NgtRxStore<{
    selectedId: number;
    controlsRef: NgtInjectedRef<OrbitControls>;
    currentMenu: (typeof menus)[number] | null;
    parent: string | null;
}> {
    private readonly store = inject(NgtStore);
    private readonly router = inject(Router);
    private readonly zone = inject(NgZone);

    override initialize() {
        super.initialize();
        this.set({ selectedId: 0, currentMenu: null, parent: null, controlsRef: injectNgtRef<OrbitControls>() });
    }

    constructor() {
        super();
        this.connect(
            'currentMenu',
            this.select('selectedId').pipe(
                map((selectedId) => {
                    if (!selectedId) return null;
                    return menus.find((menu) => menu.id === selectedId)!;
                })
            )
        );

        this.connect(
            'parent',
            this.select('selectedId').pipe(
                map((selectedId) => {
                    if (!selectedId) return null;
                    return `group-${selectedId}`;
                })
            )
        );

        this.hold(
            this.get('controlsRef').$.pipe(
                switchMap((controls) => {
                    return this.select('parent').pipe(
                        map((parent) => {
                            if (parent) {
                                const parentObject = this.store.get('scene').getObjectByName(parent);
                                if (parentObject) {
                                    position.copy(parentObject.position);
                                    position.setY(position.y + 6);
                                    return controls;
                                }
                            }
                            position.set(0, 6, 0);
                            return controls;
                        })
                    );
                })
            ),
            (controls) => {
                gsap.to(controls.target, { x: position.x, y: position.y, z: position.z, duration: 0.5 });
            }
        );

        this.hold(
            this.router.events.pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd)),
            (event) => {
                if (event.url.endsWith('/routed-rock/rock') || event.url.endsWith('/routed-rock/rock/')) {
                    this.set({ selectedId: 0 });
                }
            }
        );
    }

    set contentId(contentId: string) {
        const index = menus.findIndex((menu) => menu.path.includes(contentId));
        if (index !== -1) {
            this.set({ selectedId: index + 1 });
        }
    }

    navigateByMenu(menu: (typeof menus)[number] | null) {
        this.set({ selectedId: menu?.id ?? 0 });
        this.zone.run(() => {
            if (menu) {
                this.router.navigateByUrl(menu.path);
            } else {
                this.router.navigateByUrl('/routed-rock/rock');
            }
        });
    }
}
