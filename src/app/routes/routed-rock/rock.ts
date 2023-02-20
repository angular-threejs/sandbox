import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgtArgs, NgtPush } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { CursorPointer } from '../../ui/routed-rock/cursor';
import { menus, RoutedRockService } from '../../utils/routed-rock.service';

interface RockGLTF extends GLTF {
    nodes: { defaultMaterial: THREE.Object3D };
    materials: { '08___Default': THREE.MeshStandardMaterial };
}

@Component({
    standalone: true,
    templateUrl: './rock.html',
    imports: [NgtArgs, NgtsOrbitControls, NgtPush, NgFor, NgIf, RouterOutlet, CursorPointer],
    providers: [RoutedRockService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class Rock {
    readonly Math = Math;
    readonly DoubleSide = THREE.DoubleSide;
    readonly FrontSide = THREE.FrontSide;
    readonly menus = menus;

    readonly rock$ = injectNgtsGLTFLoader('rock2/scene.gltf') as Observable<RockGLTF>;

    protected readonly routedRockService = inject(RoutedRockService);
}
