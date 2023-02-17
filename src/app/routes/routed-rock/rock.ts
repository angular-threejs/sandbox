import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, NgZone } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NgtArgs, NgtPush, NgtStore } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
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

    readonly rock$ = injectNgtsGLTFLoader('rock2/scene.gltf') as Observable<RockGLTF>;

    private readonly store = inject(NgtStore);
    private readonly routedRockService = inject(RoutedRockService);
    private readonly router = inject(Router);
    private readonly zone = inject(NgZone);

    readonly menus = this.routedRockService.menus;

    ngOnInit() {
        console.log(this.store.get('scene'));
    }

    onCubeClick(menu: (typeof this.menus)[number]) {
        this.routedRockService.selectedId = menu.id;
        this.zone.run(() => {
            this.router.navigateByUrl(menu.path);
        });
    }

    onRockClick() {
        this.routedRockService.selectedId = null;
    }
}
