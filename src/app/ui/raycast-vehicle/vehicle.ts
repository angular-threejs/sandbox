import { NgFor } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, HostListener, Input } from '@angular/core';
import { Triplet, WheelInfoOptions } from '@pmndrs/cannon-worker-api';
import { injectNgtDestroy, injectNgtRef } from 'angular-three';
import { injectBox, injectRaycastVehicle } from 'angular-three-cannon/services';
import { ReplaySubject } from 'rxjs';
import { Chassis } from './chassis';
import { Wheel } from './wheel';

const keyControlMap = {
    ' ': 'brake',
    ArrowDown: 'backward',
    ArrowLeft: 'left',
    ArrowRight: 'right',
    ArrowUp: 'forward',
    r: 'reset',
    w: 'forward',
    s: 'backward',
    a: 'left',
    d: 'right',
} as const;

type KeyCode = keyof typeof keyControlMap;

const keyCodes = Object.keys(keyControlMap) as KeyCode[];
const isKeyCode = (v: unknown): v is KeyCode => keyCodes.includes(v as KeyCode);

@Component({
    selector: 'Vehicle',
    standalone: true,
    templateUrl: 'vehicle.html',
    imports: [Chassis, Wheel, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class Vehicle {
    @Input() position: Triplet = [0, 0, 0];
    @Input() rotation: Triplet = [0, 0, 0];
    @Input() angularVelocity: Triplet = [0, 0, 0];

    readonly ngtDestroy = injectNgtDestroy();
    readonly chassisReady = new ReplaySubject<void>(1);

    readonly radius = 0.7;

    private back = -1.15;
    private force = 1500;
    private front = 1.3;
    private height = -0.04;
    private maxBrake = 50;
    private steer = 0.5;
    private width = 1.2;
    private backward = false;
    private brake = false;
    private forward = false;
    private left = false;
    private reset = false;
    private right = false;

    wheelInfo: WheelInfoOptions = {
        axleLocal: [-1, 0, 0], // This is inverted for asymmetrical wheel models (left v. right sided)
        customSlidingRotationalSpeed: -30,
        dampingCompression: 4.4,
        dampingRelaxation: 10,
        directionLocal: [0, -1, 0], // set to same as Physics Gravity
        frictionSlip: 2,
        maxSuspensionForce: 1e4,
        maxSuspensionTravel: 0.3,
        radius: this.radius,
        suspensionRestLength: 0.3,
        suspensionStiffness: 30,
        useCustomSlidingRotationalSpeed: true,
    };

    wheelInfo1: WheelInfoOptions = {
        ...this.wheelInfo,
        chassisConnectionPointLocal: [-this.width / 2, this.height, this.front],
        isFrontWheel: true,
    };
    wheelInfo2: WheelInfoOptions = {
        ...this.wheelInfo,
        chassisConnectionPointLocal: [this.width / 2, this.height, this.front],
        isFrontWheel: true,
    };
    wheelInfo3: WheelInfoOptions = {
        ...this.wheelInfo,
        chassisConnectionPointLocal: [-this.width / 2, this.height, this.back],
        isFrontWheel: false,
    };
    wheelInfo4: WheelInfoOptions = {
        ...this.wheelInfo,
        chassisConnectionPointLocal: [this.width / 2, this.height, this.back],
        isFrontWheel: false,
    };

    readonly wheels = [
        injectNgtRef<THREE.Group>(),
        injectNgtRef<THREE.Group>(),
        injectNgtRef<THREE.Group>(),
        injectNgtRef<THREE.Group>(),
    ];

    readonly chassis = injectBox<THREE.Mesh>(
        () => ({
            allowSleep: false,
            angularVelocity: this.angularVelocity,
            args: [1.7, 1, 4],
            mass: 500,
            onCollide: (e) => console.log('bonk', e.body.userData),
            position: this.position,
            rotation: this.rotation,
        }),
        { waitFor: this.chassisReady }
    );

    readonly vehicle = injectRaycastVehicle(() => ({
        chassisBody: this.chassis.ref,
        wheelInfos: [this.wheelInfo1, this.wheelInfo2, this.wheelInfo3, this.wheelInfo4],
        wheels: this.wheels,
    }));

    @HostListener('window:keyup', ['$event'])
    onKeyUp(event: KeyboardEvent) {
        if (!isKeyCode(event.key)) return;
        this[keyControlMap[event.key]] = false;
    }

    @HostListener('window:keydown', ['$event'])
    onKeyDown(event: KeyboardEvent) {
        if (!isKeyCode(event.key)) return;
        this[keyControlMap[event.key]] = true;
    }

    onBeforeRender() {
        const {
            forward,
            backward,
            force,
            left,
            right,
            steer,
            brake,
            maxBrake,
            position,
            angularVelocity,
            rotation,
            reset,
            chassis,
            vehicle,
            wheels,
        } = this;

        if (vehicle.ref.nativeElement && chassis.ref.nativeElement && wheels.every((wheel) => wheel.nativeElement)) {
            for (let e = 2; e < 4; e++) {
                vehicle.api.applyEngineForce(forward || backward ? force * (forward && !backward ? -1 : 1) : 0, 2);
            }

            for (let s = 0; s < 2; s++) {
                vehicle.api.setSteeringValue(left || right ? steer * (left && !right ? 1 : -1) : 0, s);
            }

            for (let b = 2; b < 4; b++) {
                vehicle.api.setBrake(brake ? maxBrake : 0, b);
            }

            if (reset) {
                chassis.api.position.set(...position);
                chassis.api.velocity.set(0, 0, 0);
                chassis.api.angularVelocity.set(...angularVelocity);
                chassis.api.rotation.set(...rotation);
            }
        }
    }
}
