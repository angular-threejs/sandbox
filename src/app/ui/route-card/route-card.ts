import { NgFor } from '@angular/common';
import { Component, Directive, ElementRef, HostBinding, HostListener, inject, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouteInfoWithPath } from '../../routes';

@Directive({
    selector: 'video[sandboxAutoplay]',
    standalone: true,
})
export class Autoplay {
    private readonly videoElementRef: ElementRef<HTMLVideoElement> = inject(ElementRef, { self: true });

    @HostListener('mouseover')
    onMouseOver() {
        this.videoElementRef.nativeElement.play().catch(() => {});
    }

    @HostListener('mouseout')
    onMouseOut() {
        this.videoElementRef.nativeElement.pause();
        this.videoElementRef.nativeElement.currentTime = 0;
    }
}

@Component({
    selector: 'RouteCard',
    standalone: true,
    templateUrl: 'route-card.html',
    imports: [NgFor, RouterLink, Autoplay],
})
export class RouteCard {
    @HostBinding('class') hostClass = 'card w-72 bg-base-100 shadow-xl pl-0 pt-0 pr-0 gap-0';
    @Input() route!: RouteInfoWithPath;
    isIOS = false;
}
