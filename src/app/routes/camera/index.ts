import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, HostListener, inject, ViewChild } from '@angular/core';
import { injectBeforeRender, NgtArgs, NgtCanvas, NgtPush, NgtRenderState, NgtState, NgtStore } from 'angular-three';
import * as THREE from 'three';

export const routeMeta: RouteMeta = {
    title: 'THREE.js Camera',
    data: { asset: 'examples/camera' },
};

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtPush],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly Math = Math;
    readonly aspect$ = inject(NgtStore).select('viewport', 'aspect');

    @ViewChild('perspectiveCamera', { static: true }) perspectiveCamera!: ElementRef<THREE.PerspectiveCamera>;
    @ViewChild('orthographicCamera', { static: true }) orthographicCamera!: ElementRef<THREE.OrthographicCamera>;
    @ViewChild('cameras', { static: true }) cameraGroup!: ElementRef<THREE.Group>;
    @ViewChild('mesh', { static: true }) mesh!: ElementRef<THREE.Mesh>;
    @ViewChild('perspectiveHelper') perspectiveHelper?: ElementRef<THREE.CameraHelper>;
    @ViewChild('orthographicHelper') orthographicHelper?: ElementRef<THREE.CameraHelper>;

    readonly vertices: number[] = [];

    private activeCamera?: THREE.Camera;
    private activeHelper?: THREE.CameraHelper;

    constructor() {
        injectBeforeRender(this.onBeforeRender.bind(this), 1);
    }

    ngOnInit() {
        for (let i = 0; i < 10000; i++) {
            this.vertices.push(THREE.MathUtils.randFloatSpread(2000));
            this.vertices.push(THREE.MathUtils.randFloatSpread(2000));
            this.vertices.push(THREE.MathUtils.randFloatSpread(2000));
        }
    }

    ngAfterViewInit() {
        this.activeCamera = this.perspectiveCamera.nativeElement;
        this.activeHelper = this.perspectiveHelper?.nativeElement;
    }

    @HostListener('document:keydown', ['$event'])
    onKeyDown({ key }: KeyboardEvent) {
        switch (key.toLowerCase()) {
            case 'o':
                this.activeCamera = this.orthographicCamera.nativeElement;
                this.activeHelper = this.orthographicHelper?.nativeElement;
                break;
            case 'p':
                this.activeCamera = this.perspectiveCamera.nativeElement;
                this.activeHelper = this.perspectiveHelper?.nativeElement;
        }
    }

    private onBeforeRender({ gl, size, camera, scene }: NgtRenderState) {
        if (!this.activeCamera || !this.activeHelper) return;
        const r = Date.now() * 0.0005;
        // reassign shorthands
        const mesh = this.mesh.nativeElement;
        const cameraGroup = this.cameraGroup.nativeElement;
        const perspectiveCamera = this.perspectiveCamera.nativeElement;
        const perspectiveHelper = this.perspectiveHelper?.nativeElement;
        const orthographicCamera = this.orthographicCamera.nativeElement;
        const orthographicHelper = this.orthographicHelper?.nativeElement;

        mesh.position.x = 700 * Math.cos(r);
        mesh.position.z = 700 * Math.sin(r);
        mesh.position.y = 700 * Math.sin(r);

        mesh.children[0].position.x = 70 * Math.cos(2 * r);
        mesh.children[0].position.y = 70 * Math.sin(r);

        if (perspectiveCamera && orthographicCamera && perspectiveHelper && orthographicHelper) {
            if (this.activeCamera === perspectiveCamera) {
                perspectiveCamera.fov = 35 + 30 * Math.sin(0.5 * r);
                perspectiveCamera.far = mesh.position.length();
                perspectiveCamera.updateProjectionMatrix();

                perspectiveHelper.update();
                perspectiveHelper.visible = true;

                orthographicHelper.visible = false;
            } else {
                orthographicCamera.far = mesh.position.length();
                orthographicCamera.updateProjectionMatrix();

                orthographicHelper.update();
                orthographicHelper.visible = true;

                perspectiveHelper.visible = false;
            }
        }

        cameraGroup.lookAt(mesh.position);

        gl.clear();

        this.activeHelper.visible = false;
        gl.setViewport(0, 0, size.width / 2, size.height);
        gl.render(scene, this.activeCamera);

        this.activeHelper.visible = true;

        gl.setViewport(size.width / 2, 0, size.width / 2, size.height);
        gl.render(scene, camera);
    }
}

@Component({
    standalone: true,
    templateUrl: 'camera.html',
    imports: [NgtCanvas],
})
export default class Camera {
    readonly scene = Scene;

    onCreated({ gl, camera, viewport }: NgtState) {
        gl.autoClear = false;
        (camera as THREE.PerspectiveCamera).aspect = viewport.aspect / 2;
    }
}
