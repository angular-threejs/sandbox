import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, InjectionToken, Input } from '@angular/core';
import { Triplet } from '@pmndrs/cannon-worker-api';
import { injectBeforeRender, NgtArgs, NgtCanvas } from 'angular-three';
import { NgtcPhysics } from 'angular-three-cannon';
import { injectBox, injectPlane, injectSphere } from 'angular-three-cannon/services';
import { NgtsStats } from 'angular-three-soba/performance';
import * as THREE from 'three';
// @ts-ignore
import niceColors from 'nice-color-palettes';

export const routeMeta: RouteMeta = {
    title: 'Cube Heap',
};

@Component({
    selector: 'HeapPlane',
    standalone: true,
    template: `
        <ngt-mesh [ref]="plane.ref" [receiveShadow]="true" [rotation]="rotation">
            <ngt-plane-geometry *args="[5, 5]" />
            <ngt-shadow-material color="#171717" />
        </ngt-mesh>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Plane {
    readonly rotation = [-Math.PI / 2, 0, 0] as Triplet;
    readonly plane = injectPlane<THREE.Mesh>(() => ({ rotation: this.rotation }));
}

@Component({
    selector: 'HeapSpheres[colors][count]',
    standalone: true,
    template: `
        <ngt-instanced-mesh
            *args="[undefined, undefined, count]"
            [ref]="sphere.ref"
            [castShadow]="true"
            [receiveShadow]="true"
        >
            <ngt-sphere-geometry *args="[size, 48]">
                <ngt-instanced-buffer-attribute attach="attributes.color" *args="[colors, 3]" />
            </ngt-sphere-geometry>
            <ngt-mesh-lambert-material [vertexColors]="true" />
        </ngt-instanced-mesh>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Spheres {
    readonly size = 0.1;
    @Input() count!: number;
    @Input() colors!: Float32Array;

    readonly sphere = injectSphere<THREE.InstancedMesh>(() => ({
        args: [this.size],
        mass: 1,
        position: [Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5],
    }));

    constructor() {
        injectBeforeRender(() => {
            this.sphere.api.at(Math.floor(Math.random() * this.count)).position.set(0, Math.random() * 2, 0);
        });
    }
}

@Component({
    selector: 'HeapBoxes[colors][count]',
    standalone: true,
    template: `
        <ngt-instanced-mesh
            *args="[undefined, undefined, count]"
            [ref]="box.ref"
            [castShadow]="true"
            [receiveShadow]="true"
        >
            <ngt-box-geometry *args="args">
                <ngt-instanced-buffer-attribute attach="attributes.color" *args="[colors, 3]" />
            </ngt-box-geometry>
            <ngt-mesh-lambert-material [vertexColors]="true" />
        </ngt-instanced-mesh>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Boxes {
    readonly args = [0.1, 0.1, 0.1] as [number, number, number];
    @Input() count!: number;
    @Input() colors!: Float32Array;

    readonly box = injectBox<THREE.Mesh>(() => ({
        args: this.args,
        mass: 1,
        position: [Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5],
    }));

    constructor() {
        injectBeforeRender(() => {
            this.box.api.at(Math.floor(Math.random() * this.count)).position.set(0, Math.random() * 2, 0);
        });
    }
}

const CUBE_HEAP_API = new InjectionToken<{ geometry: 'box' | 'sphere'; toggle: () => void }>('CubeHeap API');

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [Plane, Spheres, Boxes, NgtArgs, NgIf, NgtcPhysics],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly api = inject(CUBE_HEAP_API);
    readonly count = 200;
    readonly colors = new Float32Array(this.count * 3);

    ngOnInit() {
        const color = new THREE.Color();
        for (let i = 0; i < this.count; i++) {
            color
                .set(niceColors[17][Math.floor(Math.random() * 5)])
                .convertSRGBToLinear()
                .toArray(this.colors, i * 3);
        }
    }
}

@Component({
    standalone: true,
    templateUrl: 'cube-heap.html',
    imports: [NgtCanvas, NgtsStats],
    providers: [
        {
            provide: CUBE_HEAP_API,
            useValue: {
                geometry: 'box',
                toggle() {
                    this.geometry = this.geometry === 'box' ? 'sphere' : 'box';
                },
            },
        },
    ],
})
export default class CubeHeap {
    readonly scene = Scene;
    readonly api = inject(CUBE_HEAP_API);
}
