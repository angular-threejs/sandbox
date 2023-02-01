import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { NgtCanvas } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';

export const routeMeta: RouteMeta = {
    title: 'Simple Cubes',
    data: {
        asset: 'examples/cubes',
    },
};

@Component({
    selector: 'Cube',
    standalone: true,
    template: `
        <ngt-mesh [position]="position" (beforeRender)="onBeforeRender($any($event).object)">
            <ngt-box-geometry />
            <ngt-mesh-standard-material color="red" />
        </ngt-mesh>
    `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Cube {
    @Input() position: [number, number, number] = [0, 0, 0];

    onBeforeRender(cube: THREE.Mesh) {
        cube.rotation.x += 0.01;
        cube.rotation.y += 0.01;
    }
}

@Component({
    standalone: true,
    template: `
        <ngt-ambient-light />
        <ngt-directional-light />

        <Cube [position]="[1.5, 0, 0]" />
        <Cube [position]="[-1.5, 0, 0]" />

        <ngts-orbit-controls />
    `,
    imports: [NgtsOrbitControls, Cube],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {}

@Component({
    standalone: true,
    template: `
        <ngt-canvas [sceneGraph]="scene" />
    `,
    imports: [NgtCanvas],
})
export default class SimpleCubes {
    readonly scene = Scene;
}
