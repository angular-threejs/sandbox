import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { NgtCanvas } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';

export const routeMeta: RouteMeta = {
    title: 'Simple Cubes',
    data: { asset: 'examples/cubes' },
};

@Component({
    selector: 'Cube',
    standalone: true,
    templateUrl: 'cube.html',
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
    templateUrl: 'scene.html',
    imports: [NgtsOrbitControls, Cube],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene { }

@Component({
    standalone: true,
    templateUrl: 'cubes.html',
    imports: [NgtCanvas],
})
export default class SimpleCubes {
    readonly scene = Scene;
}
