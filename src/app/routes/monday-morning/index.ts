import { RouteMeta } from '@analogjs/router';
import { NgIf, NgTemplateOutlet } from '@angular/common';
import {
    Component,
    CUSTOM_ELEMENTS_SCHEMA,
    inject,
    InjectionToken,
    Input,
    NO_ERRORS_SCHEMA,
    OnInit,
    TemplateRef,
} from '@angular/core';
import { ConeTwistConstraintOpts, Triplet } from '@pmndrs/cannon-worker-api';
import {
    injectBeforeRender,
    injectNgtDestroy,
    injectNgtRef,
    NgtArgs,
    NgtBeforeRenderEvent,
    NgtCanvas,
    NgtInjectedRef,
    NgtPush,
    NgtThreeEvent,
} from 'angular-three';
import { NgtcPhysics } from 'angular-three-cannon';
import {
    injectBox,
    injectCompoundBody,
    injectConeTwistConstraint,
    injectCylinder,
    injectPlane,
    injectPointToPointConstraint,
    injectSphere,
} from 'angular-three-cannon/services';
import { injectNgtsGLTFLoader } from 'angular-three-soba/loaders';
import { Observable, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { GLTF } from 'three-stdlib';
import { createRagdoll, ShapeConfig } from '../../utils/monday-morning.config';

export const routeMeta: RouteMeta = {
    title: 'Monday Morning',
};

const { joints, shapes } = createRagdoll(4.8, Math.PI / 16, Math.PI / 16, 0);
const double = ([x, y, z]: Readonly<Triplet>): Triplet => [x * 2, y * 2, z * 2];

const MONDAY_CURSOR = new InjectionToken<NgtInjectedRef<THREE.Mesh>>('MondayMorning Cursor');

function injectDragConstraint(ref: NgtInjectedRef<THREE.Object3D>) {
    const cursorRef = inject(MONDAY_CURSOR);
    const { destroy$ } = injectNgtDestroy();

    const constraint = injectPointToPointConstraint(cursorRef, ref, () => ({
        pivotA: [0, 0, 0],
        pivotB: [0, 0, 0],
    }));

    // we stop the constraint by default
    ref.$.pipe(takeUntil(destroy$)).subscribe(() => {
        constraint.api.disable();
    });

    const onPointerDown = (e: NgtThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        // @ts-expect-error
        e.target.setPointerCapture(e.pointerId);
        constraint.api.enable();
    };

    const onPointerUp = () => {
        constraint.api.disable();
    };

    return { onPointerUp, onPointerDown };
}

@Component({
    selector: 'MondayBox',
    standalone: true,
    templateUrl: 'box.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Box {
    @Input() ref = injectNgtRef<THREE.Mesh>();
    @Input() args: ConstructorParameters<typeof THREE.BoxGeometry> = [1, 1, 1];
    @Input() color = 'white';
    @Input() opacity = 1;
    @Input() transparent = false;
}

@Component({
    selector: 'MondayBodyPart[name]',
    standalone: true,
    templateUrl: 'body-part.html',
    imports: [Box, NgIf, NgTemplateOutlet],
    schemas: [NO_ERRORS_SCHEMA],
})
class BodyPart implements OnInit {
    @Input() name!: keyof typeof shapes;
    @Input() position: Triplet = [0, 0, 0];
    @Input() config?: ConeTwistConstraintOpts;

    @Input() template?: TemplateRef<unknown>;
    // TODO we want ContentChild to work. Renderer is limited right now
    // @ContentChild(TemplateRef) template?: TemplateRef<unknown>;

    shape!: ShapeConfig;
    scale!: Triplet;

    readonly parent = inject(BodyPart, { skipSelf: true, optional: true });
    readonly box = injectBox<THREE.Mesh>(() => ({
        args: [...this.shape.args],
        linearDamping: 0.99,
        mass: this.shape.mass,
        position: [...this.shape.position],
    }));
    readonly coneTwist = this.parent
        ? injectConeTwistConstraint(this.box.ref, this.parent.box.ref, () => this.config!)
        : null;

    readonly dragConstraint = injectDragConstraint(this.box.ref);

    ngOnInit() {
        this.shape = shapes[this.name];
        this.scale = double(this.shape.args);
    }
}

@Component({
    selector: 'MondayRagdoll',
    standalone: true,
    templateUrl: 'ragdoll.html',
    imports: [BodyPart, Box],
    schemas: [NO_ERRORS_SCHEMA],
})
class Ragdoll {
    @Input() position: Triplet = [0, 0, 0];
    readonly joints = joints;

    readonly mouth = injectNgtRef<THREE.Mesh>();
    readonly eyes = injectNgtRef<THREE.Group>();

    constructor() {
        injectBeforeRender(({ clock }) => {
            if (!this.eyes.nativeElement || !this.mouth.nativeElement) return;
            this.eyes.nativeElement.position.y = Math.sin(clock.getElapsedTime() * 1) * 0.06;
            this.mouth.nativeElement.scale.y = (1 + Math.sin(clock.getElapsedTime())) * 1.5;
        });
    }
}

@Component({
    selector: 'MondayPlane',
    standalone: true,
    templateUrl: 'plane.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Plane {
    @Input() position: Triplet = [0, 0, 0];
    @Input() rotation: Triplet = [0, 0, 0];

    readonly plane = injectPlane<THREE.Mesh>(() => ({ position: this.position, rotation: this.rotation }));
}

@Component({
    selector: 'MondayChair',
    standalone: true,
    templateUrl: 'chair.html',
    imports: [Box],
    schemas: [NO_ERRORS_SCHEMA],
})
class Chair {
    readonly chair = injectCompoundBody(() => ({
        mass: 1,
        position: [-6, 0, 0],
        shapes: [
            { args: [1.5, 1.5, 0.25], mass: 1, position: [0, 0, 0], type: 'Box' },
            { args: [1.5, 0.25, 1.5], mass: 1, position: [0, -1.75, 1.25], type: 'Box' },
            { args: [0.25, 1.5, 0.25], mass: 10, position: [5 + -6.25, -3.5, 0], type: 'Box' },
            { args: [0.25, 1.5, 0.25], mass: 10, position: [5 + -3.75, -3.5, 0], type: 'Box' },
            { args: [0.25, 1.5, 0.25], mass: 10, position: [5 + -6.25, -3.5, 2.5], type: 'Box' },
            { args: [0.25, 1.5, 0.25], mass: 10, position: [5 + -3.75, -3.5, 2.5], type: 'Box' },
        ],
        type: 'Dynamic',
    }));
    readonly dragConstraint = injectDragConstraint(this.chair.ref);
}

interface CupGLTF extends GLTF {
    materials: { default: THREE.Material; Liquid: THREE.Material };
    nodes: { 'buffer-0-mesh-0': THREE.Mesh; 'buffer-0-mesh-0_1': THREE.Mesh };
}

@Component({
    selector: 'MondayMug',
    standalone: true,
    templateUrl: 'mug.html',
    imports: [NgIf, NgtPush],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Mug {
    readonly cup$ = injectNgtsGLTFLoader('cup.glb') as Observable<CupGLTF>;
    readonly cylinder = injectCylinder<THREE.Group>(() => ({
        args: [0.6, 0.6, 1, 16],
        mass: 1,
        position: [9, 0, 0],
        rotation: [Math.PI / 2, 0, 0],
    }));
    readonly dragConstraint = injectDragConstraint(this.cylinder.ref);
}

@Component({
    selector: 'MondayTable',
    standalone: true,
    templateUrl: 'table.html',
    imports: [Box, Mug],
    schemas: [NO_ERRORS_SCHEMA],
})
class Table {
    readonly seat = injectBox<THREE.Mesh>(() => ({ args: [2.5, 0.25, 2.5], position: [9, -0.8, 0], type: 'Static' }));
    readonly leg1 = injectBox<THREE.Mesh>(() => ({ args: [0.25, 2, 0.25], position: [7.2, -3, 1.8], type: 'Static' }));
    readonly leg2 = injectBox<THREE.Mesh>(() => ({ args: [0.25, 2, 0.25], position: [10.8, -3, 1.8], type: 'Static' }));
    readonly leg3 = injectBox<THREE.Mesh>(() => ({ args: [0.25, 2, 0.25], position: [7.2, -3, -1.8], type: 'Static' }));
    readonly leg4 = injectBox<THREE.Mesh>(() => ({
        args: [0.25, 2, 0.25],
        position: [10.8, -3, -1.8],
        type: 'Static',
    }));
}

@Component({
    selector: 'MondayLamp',
    standalone: true,
    templateUrl: 'lamp.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Lamp {
    readonly fixed = injectSphere(() => ({ args: [1], position: [0, 16, 0], type: 'Static' }));
    readonly lamp = injectBox<THREE.Mesh>(() => ({
        angulardamping: 1.99,
        args: [1, 0, 5],
        linearDamping: 0.9,
        mass: 1,
        position: [0, 16, 0],
    }));
    readonly constraint = injectPointToPointConstraint(this.fixed.ref, this.lamp.ref, () => ({
        pivotA: [0, 0, 0],
        pivotB: [0, 2, 0],
    }));
    readonly dragConstraint = injectDragConstraint(this.lamp.ref);
}

@Component({
    selector: 'MondayCursor',
    standalone: true,
    templateUrl: 'cursor.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Cursor {
    readonly cursorRef = inject(MONDAY_CURSOR);
    readonly sphere = injectSphere<THREE.Mesh>(
        () => ({
            args: [0.5],
            position: [0, 0, 10000],
            type: 'Static',
        }),
        { ref: this.cursorRef }
    );

    onBeforeRender({ state: { pointer, viewport } }: NgtBeforeRenderEvent<THREE.Mesh>) {
        const x = pointer.x * viewport.width;
        const y = (pointer.y * viewport.height) / 1.9 + -x / 3.5;
        this.sphere.api.position.set(x / 1.4, y, 0);
    }
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, NgtcPhysics, Cursor, Ragdoll, Plane, Chair, Table, Lamp],
    providers: [{ provide: MONDAY_CURSOR, useFactory: () => injectNgtRef<THREE.Mesh>() }],
    schemas: [NO_ERRORS_SCHEMA],
})
class Scene {
    readonly Math = Math;
}

@Component({
    standalone: true,
    templateUrl: 'monday-morning.html',
    imports: [NgtCanvas],
    host: { class: 'cursor-none' },
})
export default class MondayMorning {
    readonly scene = Scene;
}
