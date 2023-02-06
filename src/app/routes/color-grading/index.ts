import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { injectNgtLoader, NgtArgs, NgtCanvas, NgtPush, NgtStore } from 'angular-three';
import { NgtpEffectComposer } from 'angular-three-postprocessing';
import { NgtpLUT } from 'angular-three-postprocessing/effects';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { injectNgtsTextureLoader } from 'angular-three-soba/loaders';
import { NgtsStats } from 'angular-three-soba/performance';
import { NgtsEnvironment } from 'angular-three-soba/staging';
import { LookupTexture, LUTCubeLoader } from 'postprocessing';
import { Observable } from 'rxjs';

export const routeMeta: RouteMeta = {
    title: 'Color Grading',
};

@Component({
    selector: 'GradingSphere',
    standalone: true,
    templateUrl: 'sphere.html',
    imports: [NgtArgs, NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class GradingSphere {
    readonly texture$ = injectNgtsTextureLoader('terrazo.png');
}

@Component({
    selector: 'Grading',
    standalone: true,
    templateUrl: 'grading.html',
    imports: [NgtpLUT, NgtpEffectComposer, NgtPush, NgIf],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Grading {
    readonly texture$ = injectNgtLoader(() => LUTCubeLoader as any, 'cubicle-99.CUBE') as Observable<LookupTexture>;
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [GradingSphere, Grading, NgtsEnvironment, NgtsOrbitControls, NgtsStats],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly statsDom = inject(NgtStore).get('gl', 'domElement', 'parentElement');
}

@Component({
    standalone: true,
    templateUrl: 'color-grading.html',
    imports: [NgtCanvas],
    host: { class: 'block h-full w-full bg-gradient-to-br from-indigo-300 to-sky-700' },
})
export default class ColorGrading {
    readonly scene = Scene;
}
