import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, NO_ERRORS_SCHEMA, ViewChild } from '@angular/core';
import { injectBeforeRender, injectNgtRef, NgtArgs, NgtCanvas, NgtPush, NgtStore } from 'angular-three';
import { NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtpBloom, NgtpSSAO } from 'angular-three-postprocessing/effects';
import { NgtsText } from 'angular-three-soba/abstractions';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { NgtsAdaptiveDpr, NgtsStats } from 'angular-three-soba/performance';
import { BlendFunction } from 'postprocessing';
import { Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { FlakesTexture } from 'three/examples/jsm/textures/FlakesTexture';

export const routeMeta: RouteMeta = {
    title: 'Movement Regression',
};

function injectLerpedPointer() {
    const store = inject(NgtStore);
    const pointer = store.get('pointer');
    const pointerRef = injectNgtRef(pointer.clone());
    const previous = new THREE.Vector2();

    injectBeforeRender((state) => {
        previous.copy(pointerRef.nativeElement);
        pointerRef.nativeElement.lerp(state.pointer, 0.1);
        // Regress system when the mouse is moved
        if (!previous.equals(pointerRef.nativeElement)) state.performance.regress();
    });

    return pointerRef;
}

interface BotGLTF extends GLTF {
    nodes: {
        Alpha_Surface: THREE.Mesh;
        Alpha_Joints: THREE.Mesh;
    };
    materials: {
        Alpha_Body_MAT: THREE.MeshStandardMaterial;
        Alpha_Joints_MAT: THREE.MeshStandardMaterial;
    };
}

@Component({
    selector: 'Bot',
    standalone: true,
    templateUrl: 'bot.html',
    imports: [NgtArgs, NgIf, NgtPush],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Bot {
    private readonly pointer = injectLerpedPointer();
    readonly bot$ = injectNgtsGLTFLoader('untitled-draco2.glb') as Observable<BotGLTF>;
    readonly texture = new THREE.CanvasTexture(
        new FlakesTexture(),
        THREE.UVMapping,
        THREE.RepeatWrapping,
        THREE.RepeatWrapping
    );

    onBeforeRender(group: THREE.Group) {
        group.rotation.y = (this.pointer.nativeElement.x * Math.PI) / 10;
        group.rotation.x = (this.pointer.nativeElement.y * Math.PI) / 200;
    }
}

@Component({
    selector: 'Lights',
    standalone: true,
    templateUrl: 'lights.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Lights {
    private readonly pointer = injectLerpedPointer();

    onBeforeRender(group: THREE.Group) {
        group.rotation.x = (this.pointer.nativeElement.x * Math.PI) / 2;
        group.rotation.y = Math.PI * 0.25 - (this.pointer.nativeElement.y * Math.PI) / 2;
    }

    onAfterUpdate(light: THREE.RectAreaLight) {
        light.lookAt(0, 0, 0);
    }
}

@Component({
    selector: 'Effects',
    standalone: true,
    templateUrl: 'effects.html',
    imports: [NgtpEffectComposer, NgtpSSAO, NgtpBloom],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Effects {
    @ViewChild(NgtpSSAO, { static: true }) ssao!: NgtpSSAO;

    constructor() {
        injectBeforeRender(({ performance }) => {
            if (this.ssao && this.ssao.ssaoRef.nativeElement) {
                // disable SSAO on regress
                this.ssao.ssaoRef.nativeElement.blendMode.blendFunction =
                    performance.current < 1 ? BlendFunction.SKIP : BlendFunction.MULTIPLY;
            }
        });
    }
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [Lights, Bot, NgtsText, NgtsAdaptiveDpr, NgtArgs, Effects],
    schemas: [NO_ERRORS_SCHEMA],
})
class Scene {}

@Component({
    standalone: true,
    templateUrl: 'movement-regression.html',
    imports: [NgtCanvas, NgtsStats],
})
export default class MovementRegression {
    readonly scene = Scene;
}
