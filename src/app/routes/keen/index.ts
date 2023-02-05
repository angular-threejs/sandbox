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
    templateUrl: 'scene.html',
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
    templateUrl: 'keen.html',
    imports: [NgtCanvas],
})
export default class Keen {
    readonly scene = Scene;
}
