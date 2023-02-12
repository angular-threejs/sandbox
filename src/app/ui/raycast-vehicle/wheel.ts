import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { createRunInContext, injectNgtRef, NgtPush } from 'angular-three';
import { injectCompoundBody, NgtcBodyReturn } from 'angular-three-cannon/services';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable } from 'rxjs';
import { GLTF } from 'three-stdlib';

type WheelGLTF = GLTF & {
    materials: Record<'Chrom' | 'Rubber' | 'Steel', THREE.Material>;
    nodes: Record<'wheel_1' | 'wheel_2' | 'wheel_3', THREE.Mesh>;
};

@Component({
    selector: 'Wheel',
    standalone: true,
    templateUrl: 'wheel.html',
    imports: [NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Wheel {
    readonly wheel$ = injectNgtsGLTFLoader('wheel.glb') as Observable<WheelGLTF>;

    readonly Math = Math;

    @Input() radius = 0.7;
    @Input() leftSide = false;
    @Input() wheelRef = injectNgtRef<THREE.Group>();

    readonly runInContext = createRunInContext();

    compound?: NgtcBodyReturn<THREE.Group>;

    ngOnInit() {
        this.compound = this.runInContext(() => {
            return injectCompoundBody<THREE.Group>(
                () => ({
                    collisionFilterGroup: 0,
                    mass: 1,
                    material: 'wheel',
                    shapes: [
                        { args: [this.radius, this.radius, 0.5, 16], rotation: [0, 0, -Math.PI / 2], type: 'Cylinder' },
                    ],
                    type: 'Kinematic',
                }),
                { waitFor: this.wheel$, ref: this.wheelRef }
            );
        });
    }
}
