import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { NgtArgs, NgtBeforeRenderEvent, NgtCanvas, NgtPush } from 'angular-three';
import { NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtpBloom, NgtpDotScreen } from 'angular-three-postprocessing/effects';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

export const routeMeta: RouteMeta = {
    title: 'Keen',
};

interface KeenGLTF extends GLTF {
    nodes: { mesh_0: THREE.Mesh };
    materials: { 'Scene_-_Root': THREE.MeshStandardMaterial };
}

@Component({
    standalone: true,
    template: `
        <ngt-color *args="['black']" attach="background" />

        <ngt-ambient-light />
        <ngt-directional-light [position]="[0, 1, 2]" />

        <ngt-group
            *ngIf="keen$ | ngtPush as keen"
            [position]="[0, -7, 0]"
            [rotation]="[-Math.PI / 2, 0, 0]"
            (beforeRender)="onBeforeRender($any($event))"
        >
            <ngt-mesh [material]="keen.materials['Scene_-_Root']" [geometry]="keen.nodes['mesh_0'].geometry" />
        </ngt-group>

        <ngtp-effect-composer>
            <ngtp-bloom [intensity]="5" />
            <ngtp-dot-screen [scale]="3" />
        </ngtp-effect-composer>

        <ngts-orbit-controls />
    `,
    imports: [NgtpEffectComposer, NgtpBloom, NgtpDotScreen, NgtPush, NgIf, NgtArgs, NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly Math = Math;
    readonly keen$ = injectNgtsGLTFLoader('keen/scene.gltf') as Observable<KeenGLTF>;

    onBeforeRender({ object, state: { clock } }: NgtBeforeRenderEvent<THREE.Group>) {
        object.rotation.z = clock.elapsedTime;
    }
}

@Component({
    standalone: true,
    template: `
        <ngt-canvas [sceneGraph]="scene" [camera]="{ position: [0, 0, 15], near: 5, far: 20 }" />
    `,
    imports: [NgtCanvas],
})
export default class Keen {
    readonly scene = Scene;
}
