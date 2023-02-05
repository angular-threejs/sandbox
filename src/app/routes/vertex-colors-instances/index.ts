import { RouteMeta } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, ViewChild } from '@angular/core';
import { NgtArgs, NgtCanvas } from 'angular-three';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
import * as THREE from 'three';
// @ts-expect-error no type def for nice-color-palettes
import niceColors from 'nice-color-palettes';
const niceColor = niceColors[Math.floor(Math.random() * niceColors.length)];

export const routeMeta: RouteMeta = {
    title: 'Vertex Colors Instances',
};

@Component({
    selector: 'ColorsInstances',
    standalone: true,
    templateUrl: 'colors-instances.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class ColorsInstances {
    readonly length = 125000;

    private readonly o = new THREE.Object3D();
    private readonly c = new THREE.Color();
    private readonly colorsArr = Array.from({ length: this.length }, () => niceColor[Math.floor(Math.random() * 5)]);

    readonly colors = Float32Array.from(
        Array.from({ length: this.length }, (_, index) =>
            this.c.set(this.colorsArr[index]).convertSRGBToLinear().toArray()
        ).flat()
    );

    @ViewChild('instanced') set instanced({ nativeElement }: ElementRef<THREE.InstancedMesh>) {
        let i = 0;
        for (let x = 0; x < 50; x++) {
            for (let y = 0; y < 50; y++) {
                for (let z = 0; z < 50; z++) {
                    const id = i++;
                    this.o.position.set(25 - x, 25 - y, 25 - z);
                    this.o.updateMatrix();
                    nativeElement.setMatrixAt(id, this.o.matrix);
                }
            }
        }
    }
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtArgs, ColorsInstances, NgtsOrbitControls],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {}

@Component({
    standalone: true,
    templateUrl: 'vertex-colors-instances.html',
    imports: [NgtCanvas],
})
export default class VertexColorsInstances {
    readonly scene = Scene;
}
