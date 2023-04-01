import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { injectNgtRef, NgtArgs, NgtCanvas, NgtPush, NgtStore } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { injectNgtsAnimations } from 'angular-three-soba/misc';
import { NgtsStats } from 'angular-three-soba/performance';
import { map } from 'rxjs';
import * as THREE from 'three';
import { RoomEnvironment } from 'three-stdlib';

export const routeMeta: RouteMeta = {
    title: 'THREE.js Animation keyframes',
};

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtPush, NgtsOrbitControls, NgtsStats],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    private readonly gl = inject(NgtStore).get('gl');
    private readonly pmremGenerator = new THREE.PMREMGenerator(this.gl);

    readonly statsDom = this.gl.domElement.parentElement as HTMLElement;
    readonly texture = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    readonly modelRef = injectNgtRef<THREE.Object3D>();

    // if we're not using injectNgtsAnimations, we can combine the map()
    private readonly gltf$ = injectNgtsGLTFLoader('LittlestTokyo.glb');
    private readonly animations$ = this.gltf$.pipe(map((gltf) => gltf.animations));
    readonly model$ = this.gltf$.pipe(map((gltf) => gltf.scene));

    constructor() {
        injectNgtsAnimations(this.animations$, this.modelRef);
    }
}

@Component({
    standalone: true,
    templateUrl: 'animation-keyframes.html',
    imports: [NgtCanvas],
})
export default class AnimationKeyframes {
    readonly SceneGraph = Scene;
}
