import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { injectNgtRef, NgtArgs, NgtBeforeRenderEvent, NgtCanvas, NgtPush } from 'angular-three';
import { NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtpBloom, NgtpNoise, NgtpVignette } from 'angular-three-postprocessing/effects';
import { NgtsMeshDistortMaterial } from 'angular-three-soba/materials';
import * as THREE from 'three';

import { RouteMeta } from '@analogjs/router';
import distortVert from 'angular-three-soba/assets/distort.vert.glsl';
import { injectCubeTextureLoader, injectNgtsTextureLoader } from 'angular-three-soba/loaders';
import { MeshDistortMaterial, provideNgtsMeshDistortMaterialShader } from 'angular-three-soba/shaders';

export const routeMeta: RouteMeta = {
    title: 'Postprocessing Blob',
};

@Component({
    selector: 'MainSphere[material]',
    standalone: true,
    templateUrl: 'main-sphere.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class MainSphere {
    @Input() material!: THREE.Material;

    onBeforeRender({ state: { clock, pointer }, object: mesh }: NgtBeforeRenderEvent<THREE.Mesh>) {
        mesh.rotation.z = clock.getElapsedTime();
        mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, pointer.x * Math.PI, 0.1);
        mesh.rotation.x = THREE.MathUtils.lerp(mesh.rotation.x, pointer.y * Math.PI, 0.1);
    }
}

@Component({
    selector: 'SphereInstances[material]',
    standalone: true,
    templateUrl: 'sphere-instances.html',
    imports: [MainSphere, NgFor, NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class SphereInstances {
    @Input() material!: THREE.Material;

    readonly initialPositions = [
        [-4, 20, -12],
        [-10, 12, -4],
        [-11, -12, -23],
        [-16, -6, -10],
        [12, -2, -3],
        [13, 4, -12],
        [14, -2, -23],
        [8, 10, -20],
    ];

    onBeforeRender(mesh: THREE.Mesh) {
        mesh.position.y += 0.02;
        if (mesh.position.y > 19) mesh.position.y = -18;
        mesh.rotation.x += 0.06;
        mesh.rotation.y += 0.06;
        mesh.rotation.z += 0.02;
    }
}

@Component({
    selector: 'Environment',
    standalone: true,
    templateUrl: 'environment.html',
    imports: [SphereInstances, NgtsMeshDistortMaterial, NgIf, NgtPush],
    providers: [provideNgtsMeshDistortMaterialShader(distortVert)],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Environment {
    readonly bumpMap$ = injectNgtsTextureLoader('bump.jpg');
    readonly envMap$ = injectCubeTextureLoader(['px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png'], '/cube/');

    readonly materialRef = injectNgtRef<InstanceType<MeshDistortMaterial>>();
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtpEffectComposer, NgtpBloom, NgtpNoise, NgtpVignette, Environment],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {}

@Component({
    standalone: true,
    templateUrl: 'postprocessing-blob.html',
    imports: [NgtCanvas],
})
export default class PostprocessingBlob {
    readonly scene = Scene;
}
