import { RouteMeta } from '@analogjs/router';
import { NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { extend, injectNgtRef, NgtArgs, NgtCanvas, NgtStore } from 'angular-three';
import { NgtsDetailed } from 'angular-three-soba/performance';
import { FlyControls } from 'three-stdlib';

export const routeMeta: RouteMeta = {
    title: 'THREE.js LOD',
};

extend({ FlyControls });

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtsDetailed, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly store = inject(NgtStore);
    readonly camera = this.store.get('camera');
    readonly glDom = this.store.get('gl', 'domElement');

    readonly Math = Math;

    readonly geom1 = injectNgtRef<THREE.IcosahedronGeometry>();
    readonly geom2 = injectNgtRef<THREE.IcosahedronGeometry>();
    readonly geom3 = injectNgtRef<THREE.IcosahedronGeometry>();
    readonly geom4 = injectNgtRef<THREE.IcosahedronGeometry>();
    readonly geom5 = injectNgtRef<THREE.IcosahedronGeometry>();

    readonly positions = Array.from({ length: 1000 }, () => [
        10000 * (0.5 - Math.random()),
        7500 * (0.5 - Math.random()),
        10000 * (0.5 - Math.random()),
    ]);
}

@Component({
    standalone: true,
    templateUrl: 'lod.html',
    imports: [NgtCanvas],
})
export default class ThreeLod {
    readonly scene = Scene;
}
