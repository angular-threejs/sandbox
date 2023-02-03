import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, NO_ERRORS_SCHEMA } from '@angular/core';
import { NgtCanvas, NgtPush } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader, NgtsLoader } from 'angular-three-soba/loaders';
import { NgtsBakeShadows } from 'angular-three-soba/misc';
import { NgtsStage } from 'angular-three-soba/staging';
import { Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';

export const routeMeta: RouteMeta = {
    title: 'Reuse GLTF',
    data: { asset: 'examples/reuse-gltf' },
};

interface ShoeGLTF extends GLTF {
    nodes: {
        [key in 'shoe' | 'shoe_1' | 'shoe_2' | 'shoe_3' | 'shoe_4' | 'shoe_5' | 'shoe_6' | 'shoe_7']: THREE.Mesh;
    };
    materials: {
        [key in
            | 'laces'
            | 'mesh'
            | 'caps'
            | 'inner'
            | 'sole'
            | 'stripes'
            | 'band'
            | 'patch']: THREE.MeshStandardMaterial;
    };
}

@Component({
    selector: 'SandboxShoe',
    standalone: true,
    templateUrl: 'shoe.html',
    imports: [NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Shoe {
    @Input() color = 'white';

    readonly LinearEncoding = THREE.LinearEncoding;
    readonly shoe$ = injectNgtsGLTFLoader('shoe.gltf') as Observable<ShoeGLTF>;
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [Shoe, NgtsStage, NgtsOrbitControls, NgtsBakeShadows],
    schemas: [NO_ERRORS_SCHEMA],
})
class Scene {
    readonly Math = Math;
}

@Component({
    standalone: true,
    templateUrl: 'reuse-gltf.html',
    imports: [NgtCanvas, NgtsLoader],
})
export default class ReuseGLTF {
    readonly scene = Scene;
}
