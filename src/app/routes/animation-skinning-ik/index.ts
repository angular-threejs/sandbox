import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, inject, ViewChild } from '@angular/core';
import {
    extend,
    injectBeforeRender,
    injectNgtRef,
    NgtArgs,
    NgtCanvas,
    NgtPush,
    NgtRenderState,
    NgtStore,
} from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { map } from 'rxjs';
import * as THREE from 'three';
import { CCDIKHelper, CCDIKSolver, IKS, OrbitControls, TransformControls } from 'three-stdlib';
// @ts-expect-error
import { GUI } from 'three/examples/jsm/libs/lil-gui.module.min.js';

export const routeMeta: RouteMeta = {
    title: 'Animation w/ IK Solver',
};

const iks = [
    {
        target: 22, // "target_hand_l"
        effector: 6, // "hand_l"
        links: [
            {
                index: 5, // "lowerarm_l"
                enabled: true,
                rotationMin: new THREE.Vector3(1.2, -1.8, -0.4),
                rotationMax: new THREE.Vector3(1.7, -1.1, 0.3),
            },
            {
                index: 4, // "Upperarm_l"
                enabled: true,
                rotationMin: new THREE.Vector3(0.1, -0.7, -1.8),
                rotationMax: new THREE.Vector3(1.1, 0, -1.4),
            },
        ],
    },
] as any satisfies IKS[];
const v0 = new THREE.Vector3();

extend({ TransformControls, CCDIKHelper });

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    imports: [NgtArgs, NgtPush, NgtsOrbitControls, NgIf],
})
class Scene {
    private readonly config = { followSphere: false, turnHead: true, ikSolver: true };
    private readonly gui = new GUI();

    readonly iks = iks;
    readonly cubeRenderTarget = new THREE.WebGLCubeRenderTarget(1024);

    readonly store = inject(NgtStore);
    readonly camera = this.store.get('camera');
    readonly glDom = this.store.get('gl', 'domElement');

    readonly orbitControlsRef = injectNgtRef<OrbitControls>();

    @ViewChild('controls') transformControls?: ElementRef<TransformControls>;
    @ViewChild('camera') cubeCamera?: ElementRef<THREE.CubeCamera>;

    solver?: CCDIKSolver;

    readonly ooi: { sphere: THREE.Mesh; kira: THREE.SkinnedMesh; [key: string]: THREE.Object3D } = {} as any;

    readonly model$ = injectNgtsGLTFLoader('kira.glb').pipe(
        map((gltf) => {
            gltf.scene.traverse((n) => {
                if (n.name === 'head') this.ooi['head'] = n;
                if (n.name === 'hand_l') this.ooi['hand_l'] = n;
                if (n.name === 'target_hand_l') this.ooi['target_hand_l'] = n;
                if (n.name === 'boule') this.ooi.sphere = n as THREE.Mesh;
                if (n.name === 'Kira_Shirt_left') this.ooi.kira = n as THREE.SkinnedMesh;
                if ((n as THREE.Mesh).isMesh) n.frustumCulled = false;
            });
            return gltf.scene;
        })
    );

    constructor() {
        this.gui.add(this.config, 'followSphere').name('follow sphere');
        this.gui.add(this.config, 'turnHead').name('turn head');
        this.gui.add(this.config, 'ikSolver').name('IK Auto update');

        injectBeforeRender(this.onBeforeRender.bind(this));
    }

    onAfterModelAttach() {
        const orbitControls = this.orbitControlsRef.nativeElement;
        if (orbitControls) orbitControls.target.copy(this.ooi.sphere.position);
        this.ooi['hand_l'].attach(this.ooi.sphere);
        this.ooi.sphere.material = new THREE.MeshBasicMaterial({ envMap: this.cubeRenderTarget.texture });

        if (this.transformControls) this.transformControls.nativeElement.attach(this.ooi['target_hand_l']);

        this.ooi.kira.add(this.ooi.kira.skeleton.bones[0]);
        this.solver = new CCDIKSolver(this.ooi.kira, this.iks);

        if (this.transformControls && orbitControls) {
            this.transformControls.nativeElement.addEventListener('mouseDown', () => (orbitControls.enabled = false));
            this.transformControls.nativeElement.addEventListener('mouseUp', () => (orbitControls.enabled = true));
        }
        this.gui.add(this.solver, 'update').name('IK Manual update()');
        this.gui.open();
    }

    private onBeforeRender({ gl, scene }: NgtRenderState) {
        const head = this.ooi['head'];
        const sphere = this.ooi.sphere;

        if (sphere && this.cubeCamera) {
            sphere.visible = false;
            sphere.getWorldPosition(this.cubeCamera.nativeElement.position);
            this.cubeCamera.nativeElement.update(gl, scene);
            sphere.visible = true;
        }

        if (sphere && this.config.followSphere) {
            sphere.getWorldPosition(v0);
            this.orbitControlsRef.nativeElement.target.lerp(v0, 0.1);
            this.orbitControlsRef.nativeElement.update();
        }

        if (head && sphere && this.config.turnHead) {
            sphere.getWorldPosition(v0);
            head.lookAt(v0);
            head.rotation.set(head.rotation.x, head.rotation.y + Math.PI, head.rotation.z);
        }

        if (this.config.ikSolver && this.solver) this.solver.update();
    }

    ngOnDestroy() {
        this.gui.domElement.remove();
    }
}

@Component({
    standalone: true,
    templateUrl: 'animation-skinning-ik.html',
    imports: [NgtCanvas],
})
export default class AnimationSkinningIK {
    readonly scene = Scene;
}
