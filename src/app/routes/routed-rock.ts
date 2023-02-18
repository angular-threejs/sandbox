import { RouteMeta } from '@analogjs/router';
import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgtCanvas, NgtRoutedScene } from 'angular-three';

export const routeMeta: RouteMeta = {
    title: 'Routed Rock',
};

@Component({
    standalone: true,
    templateUrl: 'routed-rock.html',
    imports: [NgtCanvas],
})
export default class RoutedRock implements OnInit {
    readonly scene = NgtRoutedScene;
    readonly router = inject(Router);
    readonly route = inject(ActivatedRoute);
    readonly document = inject(DOCUMENT);

    ngOnInit() {
        if (this.document.URL.endsWith('routed-rock') || this.document.URL.endsWith('routed-rock/')) {
            this.router.navigate(['rock'], { relativeTo: this.route });
        }
    }
}
