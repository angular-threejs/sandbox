import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { Triplet } from '@pmndrs/cannon-worker-api';
import { NgtArgs } from 'angular-three';
import { injectPlane } from 'angular-three-cannon/services';

@Component({
    selector: 'RaycastVehiclePlane',
    standalone: true,
    template: `
        <ngt-group [ref]="plane.ref" [rotation]="rotation">
            <ngt-mesh [receiveShadow]="true">
                <ngt-plane-geometry *args="[100, 100]" />
                <ngt-mesh-standard-material color="#303030" />
            </ngt-mesh>
        </ngt-group>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Plane {
    @Input() rotation: Triplet = [0, 0, 0];
    readonly plane = injectPlane<THREE.Group>(() => ({
        material: 'ground',
        type: 'Static',
        rotation: this.rotation,
        userData: { id: 'floor' },
    }));
}
