import { injectActivatedRoute } from '@analogjs/router';
import { NgFor, NgIf } from '@angular/common';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { injectNgtDestroy, NgtArgs, NgtParent, NgtPush } from 'angular-three';
import { NgtsText } from 'angular-three-soba/abstractions';
import { filter, map, takeUntil } from 'rxjs';
import * as THREE from 'three';
import { RoutedRockService } from '../../../utils/routed-rock.service';

@Component({
    standalone: true,
    templateUrl: './rock-color.html',
    imports: [NgIf, NgtPush, NgtArgs, NgtParent, NgtsText, NgFor],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class RockColor {
    readonly Math = Math;
    readonly FrontSide = THREE.FrontSide;

    private readonly route = injectActivatedRoute();
    private readonly routedRockService = inject(RoutedRockService);

    private readonly ngtDestroy = injectNgtDestroy();

    readonly parent$ = this.routedRockService.parent$;
    readonly menu$ = this.routedRockService.menu$;

    readonly texts = Array.from({ length: 3 }, (_, index) => ({
        rotation: [0, ((360 / 3) * index * Math.PI) / 180, 0],
        position: [
            5 * Math.cos(((360 / 3) * index * Math.PI) / 180),
            0,
            5 * Math.sin(((360 / 3) * index * Math.PI) / 180),
        ],
    }));

    ngOnInit() {
        this.route.params
            .pipe(
                filter((params) => !!params['colorId']),
                map((params) => params['colorId']),
                takeUntil(this.ngtDestroy.destroy$)
            )
            .subscribe((colorId) => {
                this.routedRockService.contentId = colorId;
            });
    }
}
