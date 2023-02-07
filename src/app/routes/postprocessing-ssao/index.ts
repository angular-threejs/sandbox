import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { ChangeDetectorRef, Component, CUSTOM_ELEMENTS_SCHEMA, inject, Injectable, OnInit } from '@angular/core';
import { NgtArgs, NgtCanvas, NgtPush, NgtRxStore, prepare } from 'angular-three';
import { NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtpSSAO } from 'angular-three-postprocessing/effects';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsStats } from 'angular-three-soba/performance';
import { BlendFunction } from 'postprocessing';
import { map } from 'rxjs';
import * as THREE from 'three';

export const routeMeta: RouteMeta = {
    title: 'Postprocessing SSAO',
};

@Injectable()
class BlendFunctionStore extends NgtRxStore {
    override initialize(): void {
        super.initialize();
        this.set({ blendFunction: BlendFunction.NORMAL });
        this.connect(
            'blendFunctionName',
            this.select('blendFunction').pipe(
                map((blendFunction) => (blendFunction === BlendFunction.NORMAL ? 'NORMAL' : 'MULTIPLY'))
            )
        );
    }

    toggle() {
        this.set((s) => ({
            blendFunction: s.blendFunction === BlendFunction.NORMAL ? BlendFunction.MULTIPLY : BlendFunction.NORMAL,
        }));
    }
}

@Component({
    selector: 'Wall',
    standalone: true,
    templateUrl: 'wall.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Wall {
    readonly geometry = prepare(new THREE.BoxGeometry(16, 12, 1));
    readonly material = prepare(new THREE.MeshLambertMaterial({ color: 'pink' }));
    readonly Math = Math;
}

@Component({
    selector: 'SmallBox',
    standalone: true,
    templateUrl: 'small-box.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class SmallBox {}

@Component({
    selector: 'Box',
    standalone: true,
    templateUrl: 'box.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Box {}

@Component({
    selector: 'Ground',
    standalone: true,
    templateUrl: 'ground.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Ground {
    readonly Math = Math;
}

@Component({
    selector: 'Ball',
    standalone: true,
    templateUrl: 'ball.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Ball {}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [SmallBox, Box, Ground, Wall, Ball, NgtpEffectComposer, NgtpSSAO, NgtsOrbitControls, NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene implements OnInit {
    readonly blendFunctionStore = inject(BlendFunctionStore);
    private readonly cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.blendFunctionStore.triggerChangeDetection(this.cdr, ['blendFunction']);
    }
}

@Component({
    standalone: true,
    templateUrl: 'postprocessing-ssao.html',
    imports: [NgtCanvas, NgtsStats],
    providers: [BlendFunctionStore],
    host: { class: 'flex flex-col gap-4 w-full h-full justify-center items-center' },
})
export default class PostprocessingSSAO {
    readonly scene = Scene;
    readonly blendFunctionStore = inject(BlendFunctionStore);
}
