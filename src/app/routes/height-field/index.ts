import { Component, CUSTOM_ELEMENTS_SCHEMA, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { Triplet } from '@pmndrs/cannon-worker-api';
import { NgtArgs, NgtCanvas, NgtRxStore } from 'angular-three';
import { NgtcPhysics } from 'angular-three-cannon';
import { injectHeightfield, injectSphere } from 'angular-three-cannon/services';
import { NgtsOrbitControls } from 'angular-three-soba/controls';
// @ts-ignore
import niceColors from 'nice-color-palettes';
import * as THREE from 'three';

type GenerateHeightmapArgs = {
    height: number;
    number: number;
    scale: number;
    width: number;
};

/* Generates a 2D array using Worley noise. */
function generateHeightmap({ width, height, number, scale }: GenerateHeightmapArgs) {
    const data = [];

    const seedPoints = [];
    for (let i = 0; i < number; i++) {
        seedPoints.push([Math.random(), Math.random()]);
    }

    let max = 0;
    for (let i = 0; i < width; i++) {
        const row = [];
        for (let j = 0; j < height; j++) {
            let min = Infinity;
            seedPoints.forEach((p) => {
                const distance2 = (p[0] - i / width) ** 2 + (p[1] - j / height) ** 2;
                if (distance2 < min) {
                    min = distance2;
                }
            });
            const d = Math.sqrt(min);
            if (d > max) {
                max = d;
            }
            row.push(d);
        }
        data.push(row);
    }

    /* Normalize and scale. */
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < height; j++) {
            data[i][j] *= scale / max;
        }
    }
    return data;
}

@Component({
    selector: 'Spheres',
    standalone: true,
    templateUrl: 'spheres.html',
    imports: [NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Spheres implements OnInit {
    @Input() columns = 0;
    @Input() rows = 0;
    @Input() spread = 0;

    readonly sphereBody = injectSphere<THREE.InstancedMesh>((index) => ({
        args: [0.2],
        mass: 1,
        position: [
            ((index % this.columns) - (this.columns - 1) / 2) * this.spread,
            2.0,
            (Math.floor(index / this.columns) - (this.rows - 1) / 2) * this.spread,
        ],
    }));

    colors!: Float32Array;

    get number() {
        return this.columns * this.rows;
    }

    ngOnInit() {
        this.colors = new Float32Array(this.number * 3);
        const color = new THREE.Color();
        for (let i = 0; i < this.number; i++) {
            color
                .set(niceColors[17][Math.floor(Math.random() * 5)])
                .convertSRGBToLinear()
                .toArray(this.colors, i * 3);
        }
    }
}

@Component({
    selector: 'HeightMapGeometry',
    standalone: true,
    template: `
        <ngt-buffer-geometry #geometry />
    `,
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class HeightMapGeometry extends NgtRxStore<{ heights: number[][] }> {
    @Input() set elementSize(elementSize: number) {
        this.set({ elementSize });
    }

    @Input() set heights(heights: number[][]) {
        this.set({ heights });
    }

    @ViewChild('geometry', { static: true }) set geometry({
        nativeElement: geometry,
    }: ElementRef<THREE.BufferGeometry>) {
        this.hold(this.select('heights'), (heights) => {
            const elementSize = this.get('elementSize');

            const dx = elementSize;
            const dy = elementSize;

            /* create the vertex data from heights */
            const vertices = heights.flatMap((row, i) => row.flatMap((z, j) => [i * dx, j * dy, z]));

            /* create the faces */
            const indices = [];
            for (let i = 0; i < heights.length - 1; i++) {
                for (let j = 0; j < heights[i].length - 1; j++) {
                    const stride = heights[i].length;
                    const index = i * stride + j;
                    indices.push(index + 1, index + stride, index + stride + 1);
                    indices.push(index + stride, index + 1, index);
                }
            }

            geometry.setIndex(indices);
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            geometry.computeVertexNormals();
            geometry.computeBoundingBox();
            geometry.computeBoundingSphere();
        });
    }
}

@Component({
    selector: 'Field',
    standalone: true,
    templateUrl: 'field.html',
    imports: [HeightMapGeometry],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Field {
    @Input() elementSize = 0;
    @Input() heights: number[][] = [];
    @Input() position: Triplet = [0, 0, 0];
    @Input() rotation: Triplet = [0, 0, 0];

    readonly color = niceColors[17][4];

    readonly fieldBody = injectHeightfield<THREE.Mesh>(() => ({
        args: [this.heights, { elementSize: this.elementSize }],
        position: this.position,
        rotation: this.rotation,
    }));
}

@Component({
    standalone: true,
    templateUrl: 'scene.html',
    imports: [NgtsOrbitControls, NgtcPhysics, Field, Spheres, NgtArgs],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class Scene {
    readonly Math = Math;
    readonly scale = 10;
    readonly heights = generateHeightmap({ height: 128, width: 128, number: 10, scale: 1 });
}

@Component({
    standalone: true,
    templateUrl: 'height-field.html',
    imports: [NgtCanvas],
})
export default class HeightField {
    readonly scene = Scene;
}
