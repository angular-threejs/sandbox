import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { injectBeforeRender, NgtArgs, NgtCanvas, NgtPush, NgtStore } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { map } from 'rxjs';
import * as THREE from 'three';
import { RoomEnvironment } from 'three-stdlib';
import Stats from 'three/examples/jsm/libs/stats.module.js';

export const routeMeta: RouteMeta = {
    title: 'THREE.js Animation keyframes',
    data: { asset: 'examples/animation-keyframes' },
};

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtPush, NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    private readonly stats = Stats();
    private readonly gl = inject(NgtStore).get('gl');
    private readonly pmremGenerator = new THREE.PMREMGenerator(this.gl);

    readonly texture = this.pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;

    private mixer?: THREE.AnimationMixer;

    readonly model$ = injectNgtsGLTFLoader('LittlestTokyo.glb').pipe(
        map((model) => {
            const scene = model.scene;
            this.mixer = new THREE.AnimationMixer(scene);
            this.mixer.clipAction(model.animations[0]).play();
            return scene;
        })
    );

    constructor() {
        injectBeforeRender(({ delta }) => {
            this.mixer?.update(delta);
            this.stats.update();
        });
        this.stats.dom.style.position = 'absolute';
        this.stats.dom.style.left = '';
        this.stats.dom.style.right = '0px';
        this.gl.domElement.parentElement?.appendChild(this.stats.dom);
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