import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, ViewChild } from '@angular/core';
import {
    injectBeforeRender,
    NgtArgs,
    NgtCanvas,
    NgtPortal,
    NgtPortalContent,
    NgtPush,
    NgtRepeat,
    NgtStore,
    prepare,
} from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import * as THREE from 'three';

export const routeMeta: RouteMeta = {
    title: 'Heads Up Display with Portal',
};

@Component({
    selector: 'HeadsUpDisplay',
    standalone: true,
    templateUrl: 'heads-up-display.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NgtArgs, NgtPortal, NgtPortalContent, NgtPush, NgtRepeat],
})
class HeadsUpDisplay {
    readonly size = inject(NgtStore).get('size');

    private readonly matrix = new THREE.Matrix4();

    readonly position = [this.size.width / 2 - 80, this.size.height / 2 - 80, 0];
    readonly Math = Math;

    @ViewChild('cube') cube?: ElementRef<THREE.Mesh>;

    readonly camera = prepare(() => {
        const orthographic = new THREE.OrthographicCamera(
            this.size.width / -2,
            this.size.width / 2,
            this.size.height / 2,
            this.size.height / -2
        );
        orthographic.position.set(0, 0, 100);
        return orthographic;
    });

    hovered = -1;

    constructor() {
        injectBeforeRender(({ camera }) => {
            if (this.cube?.nativeElement) {
                this.matrix.copy(camera.matrix).invert();
                this.cube.nativeElement.quaternion.setFromRotationMatrix(this.matrix);
            }
        });
    }
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [HeadsUpDisplay, NgtsOrbitControls, NgtArgs],
})
class Scene {}

@Component({
    standalone: true,
    templateUrl: 'view-cube.html',
    imports: [NgtCanvas],
})
export default class ViewCube {
    readonly scene = Scene;
}
