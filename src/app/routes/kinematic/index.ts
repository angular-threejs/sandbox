import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, OnInit } from '@angular/core';
import { Triplet } from '@pmndrs/cannon-worker-api';
import { injectBeforeRender, NgtArgs, NgtCanvas, NgtRef } from 'angular-three';
import { NgtcPhysics } from 'angular-three-cannon';
import { injectBox, injectPlane, injectSphere } from 'angular-three-cannon/services';
import { NgtsStats } from 'angular-three-soba/performance';
// @ts-ignore
import niceColors from 'nice-color-palettes';
import * as THREE from 'three';

const niceColor = niceColors[Math.floor(Math.random() * niceColors.length)];

export const routeMeta: RouteMeta = {
    title: 'Kinematic Cube',
};

@Component({
    selector: 'KinematicSpheres',
    standalone: true,
    templateUrl: 'spheres.html',
    imports: [NgtArgs, NgtRef],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Spheres implements OnInit {
    @Input() count = 100;

    readonly radius = 1;
    colors!: Float32Array;

    readonly sphereBody = injectSphere<THREE.InstancedMesh>((index) => ({
        args: [this.radius],
        mass: 1,
        position: [Math.random() - 0.5, Math.random() - 0.5, index * 2],
    }));

    ngOnInit() {
        this.colors = new Float32Array(this.count * 3);
        const color = new THREE.Color();
        for (let i = 0; i < this.count; i++) {
            color
                .set(niceColor[Math.floor(Math.random() * 5)])
                .convertSRGBToLinear()
                .toArray(this.colors, i * 3);
        }
    }
}

@Component({
    selector: 'KinematicBox',
    standalone: true,
    templateUrl: 'box.html',
    imports: [NgtArgs, NgtRef],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Box {
    readonly boxSize = [4, 4, 4] as Triplet;
    readonly boxBody = injectBox<THREE.Mesh>(() => ({
        mass: 1,
        type: 'Kinematic',
        args: this.boxSize,
    }));

    constructor() {
        injectBeforeRender(({ clock }) => {
            const t = clock.getElapsedTime();
            this.boxBody.api.position.set(Math.sin(t * 2) * 5, Math.cos(t * 2) * 5, 3);
            this.boxBody.api.rotation.set(Math.sin(t * 6), Math.cos(t * 6), 0);
        });
    }
}

@Component({
    selector: 'KinematicPlane',
    standalone: true,
    templateUrl: 'plane.html',
    imports: [NgtArgs, NgtRef],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Plane {
    @Input() color!: THREE.ColorRepresentation;
    @Input() position: Triplet = [0, 0, 0];
    @Input() rotation: Triplet = [0, 0, 0];

    readonly args = [1000, 1000];
    readonly planeBody = injectPlane<THREE.Mesh>(() => ({
        args: this.args,
        position: this.position,
        rotation: this.rotation,
    }));
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtcPhysics, Plane, Box, Spheres],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly niceColor = niceColor;
}

@Component({
    standalone: true,
    templateUrl: 'kinematic.html',
    imports: [NgtCanvas, NgtsStats],
})
export default class KinematicCube {
    readonly scene = Scene;
}
