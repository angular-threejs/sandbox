import { injectActivatedRoute } from '@analogjs/router';
import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject, OnInit } from '@angular/core';
import { NgtArgs, NgtParent, NgtPush, NgtRxStore } from 'angular-three';
import { NgtsText } from 'angular-three-soba/abstractions';
import { filter, map } from 'rxjs';
import * as THREE from 'three';
import { RoutedRockService } from '../../../utils/routed-rock.service';

@Component({
    standalone: true,
    templateUrl: './rock-color.html',
    imports: [NgIf, NgtPush, NgtArgs, NgtParent, NgtsText, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class RockColor extends NgtRxStore implements OnInit {
    readonly Math = Math;
    readonly FrontSide = THREE.FrontSide;

    private readonly route = injectActivatedRoute();
    private readonly routedRockService = inject(RoutedRockService);

    readonly parent$ = this.routedRockService.select('parent');
    readonly menu$ = this.routedRockService.select('currentMenu');

    readonly texts = Array.from({ length: 3 }, (_, index) => ({
        rotation: [0, ((360 / 3) * index * Math.PI) / 180, 0],
        position: [
            5 * Math.cos(((360 / 3) * index * Math.PI) / 180),
            0,
            5 * Math.sin(((360 / 3) * index * Math.PI) / 180),
        ],
    }));

    ngOnInit() {
        this.hold(
            this.route.params.pipe(
                filter((params) => !!params['colorId']),
                map((params) => params['colorId'])
            ),
            (colorId) => {
                this.routedRockService.contentId = colorId;
            }
        );
    }
}
