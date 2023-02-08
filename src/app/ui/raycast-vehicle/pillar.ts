import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CylinderArgs, Triplet } from '@pmndrs/cannon-worker-api';
import { NgtAnyRecord, NgtArgs } from 'angular-three';
import { injectCylinder } from 'angular-three-cannon/services';

@Component({
    selector: 'Pillar',
    standalone: true,
    template: `
        <ngt-mesh [ref]="cylinder.ref" [castShadow]="true">
            <ngt-cylinder-geometry *args="args" />
            <ngt-mesh-normal-material />
        </ngt-mesh>
    `,
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Pillar {
    @Input() position: Triplet = [0, 0, 0];
    @Input() userData: NgtAnyRecord = {};
    readonly args: CylinderArgs = [0.7, 0.7, 5, 16];
    readonly cylinder = injectCylinder<THREE.Mesh>(() => ({
        args: this.args,
        mass: 10,
        position: this.position,
        userData: this.userData,
    }));
}
