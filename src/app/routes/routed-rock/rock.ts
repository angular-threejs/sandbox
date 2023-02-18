import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { injectNgtDestroy, injectNgtRef, NgtArgs, NgtPush, NgtStore } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { gsap } from 'gsap';
import { map, Observable, switchMap, takeUntil, tap } from 'rxjs';
import * as THREE from 'three';
import { GLTF, OrbitControls } from 'three-stdlib';
import { RoutedRockService } from '../../utils/routed-rock.service';

interface RockGLTF extends GLTF {
    nodes: {
        defaultMaterial: THREE.Object3D;
    };
    materials: {
        '08___Default': THREE.MeshStandardMaterial;
    };
}

@Component({
    standalone: true,
    templateUrl: './rock.html',
    imports: [NgtArgs, NgtsOrbitControls, NgtPush, NgFor, NgIf, RouterOutlet],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class Rock {
    readonly Math = Math;
    readonly DoubleSide = THREE.DoubleSide;
    readonly FrontSide = THREE.FrontSide;

    readonly controlsRef = injectNgtRef<OrbitControls>();

    readonly rock$ = injectNgtsGLTFLoader('rock2/scene.gltf') as Observable<RockGLTF>;

    private readonly store = inject(NgtStore);
    private readonly routedRockService = inject(RoutedRockService);
    private readonly ngtDestroy = injectNgtDestroy();

    private readonly parent$ = this.routedRockService.parent$;

    readonly menus = this.routedRockService.menus;

    ngOnInit() {
        this.controlsRef.$.pipe(
            switchMap((controls) => {
                return this.parent$.pipe(takeUntil(this.ngtDestroy.destroy$)).pipe(
                    map((parent) => {
                        const defaultPosition = new THREE.Vector3(0, 5, 0);
                        if (parent) {
                            const parentObject = this.store.get('scene').getObjectByName(parent);
                            if (parentObject) {
                                defaultPosition.copy(parentObject.position);
                                defaultPosition.setY(defaultPosition.y + 6);
                                return defaultPosition;
                            }
                        }
                        return defaultPosition;
                    }),
                    tap((position) => {
                        gsap.to(controls.target, { x: position.x, y: position.y, z: position.z, duration: 0.5 });
                    })
                );
            }),
            takeUntil(this.ngtDestroy.destroy$)
        ).subscribe();
    }

    onCubeClick(menu: (typeof this.menus)[number]) {
        this.routedRockService.selectedId = menu.id;
        this.routedRockService.navigateByMenu(menu);
    }

    onRockClick() {
        this.routedRockService.selectedId = null;
        this.routedRockService.navigateByMenu(null);
    }
}
