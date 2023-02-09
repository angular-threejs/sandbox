import { RouteMeta } from '@analogjs/router';
import { NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import { NgtArgs, NgtCanvas } from 'angular-three';
import { NgtcPhysics } from 'angular-three-cannon';
import { NgtcDebug } from 'angular-three-cannon/debug';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import { NgtsEnvironment } from 'angular-three-soba/staging';
import { Pillar } from '../../ui/raycast-vehicle/pillar';
import { Plane } from '../../ui/raycast-vehicle/plane';
import { Vehicle } from '../../ui/raycast-vehicle/vehicle';

export const routeMeta: RouteMeta = {
    title: 'Raycast Vehicle',
};

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtcPhysics, NgIf, Plane, Pillar, Vehicle, NgtcDebug, NgtsEnvironment, NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly Math = Math;
    isDebugDisabled = true;

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        if (event.key === '?') {
            this.isDebugDisabled = !this.isDebugDisabled;
        }
    }
}

@Component({
    standalone: true,
    template: `
        <ngt-canvas [sceneGraph]="scene" [shadows]="true" [camera]="{ position: [0, 5, 15], fov: 50 }" />
        <div class="text-white text-xl left-12 top-5 absolute">
            <pre>
* WASD to drive, space to brake
                <br />r to reset
                <br />? to debug
            </pre>
        </div>
    `,
    imports: [NgtCanvas],
})
export default class RaycastVehicle {
    readonly scene = Scene;
}
