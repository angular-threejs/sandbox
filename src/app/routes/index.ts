import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { extend, NgtBeforeRenderEvent, NgtCanvas } from 'angular-three';
import {NgtsOrbitControls} from 'angular-three-soba/controls';
import * as THREE from 'three';

extend(THREE);

@Component({
    standalone: true,
    template: `
        <ngt-ambient-light />
        <ngt-directional-light />

        <ngt-mesh (beforeRender)="onBeforeRender($any($event))">
            <ngt-box-geometry />
            <ngt-mesh-standard-material color="hotpink" />
        </ngt-mesh>

        <ngts-orbit-controls />
    `,
    imports: [NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    onBeforeRender({ object: cube }: NgtBeforeRenderEvent<THREE.Mesh>) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
}

@Component({
    standalone: true,
    template: `
        <h1>Home</h1>
        <ngt-canvas [sceneGraph]="scene" />
        <router-outlet />
    `,
    imports: [NgtCanvas, RouterOutlet],
})
export default class Home {
    readonly scene = Scene;
}
