import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input, Output } from '@angular/core';
import { injectNgtRef, NgtArgs, NgtPush } from 'angular-three';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable } from 'rxjs';
import { GLTF } from 'three-stdlib';

const beetleMaterials = [
    'Black paint',
    'Black plastic',
    'Chrom',
    'Glass',
    'Headlight',
    'Interior (dark)',
    'Interior (light)',
    'License Plate',
    'Orange plastic',
    'Paint',
    'Reflector',
    'Reverse lights',
    'Rubber',
    'Steel',
    'Tail lights',
    'Underbody',
] as const;
type BeetleMaterial = (typeof beetleMaterials)[number];

const beetleNodes = [
    'chassis_1',
    'chassis_2',
    'chassis_3',
    'chassis_4',
    'chassis_5',
    'chassis_6',
    'chassis_7',
    'chassis_8',
    'chassis_9',
    'chassis_10',
    'chassis_11',
    'chassis_12',
    'chassis_13',
    'chassis_14',
    'chassis_15',
    'chassis_16',
] as const;
type BeetleNode = (typeof beetleNodes)[number];

type BeetleGLTF = GLTF & {
    materials: Record<BeetleMaterial, THREE.Material>;
    nodes: Record<BeetleNode, THREE.Mesh>;
};

@Component({
    selector: 'Chassis',
    standalone: true,
    templateUrl: 'chassis.html',
    imports: [NgtArgs, NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Chassis {
    @Input() chassisRef = injectNgtRef<THREE.Mesh>();
    @Output() readonly beetle$ = injectNgtsGLTFLoader('Beetle.glb') as Observable<BeetleGLTF>;
}
