import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { getLocalState } from 'angular-three';

@Directive({ selector: '[cursorPointer]', standalone: true })
export class CursorPointer implements OnInit, OnDestroy {
    private readonly elementRef = inject(ElementRef) as ElementRef<THREE.Object3D>;
    private readonly renderer = inject(Renderer2);
    private readonly document = inject(DOCUMENT);

    private cleanUps: Array<() => void> = [];

    ngOnInit() {
        const localState = getLocalState(this.elementRef.nativeElement);
        if (localState.eventCount) {
            const originalPointerOver = localState.handlers.pointerover;
            const pointerOverCleanUp = this.renderer.listen(this.elementRef.nativeElement, 'pointerover', (event) => {
                this.document.body.style.cursor = 'pointer';
                originalPointerOver?.(event);
            });

            const originalPointerOut = localState.handlers.pointerout;
            const pointerOutCleanUp = this.renderer.listen(this.elementRef.nativeElement, 'pointerout', (event) => {
                this.document.body.style.cursor = 'auto';
                originalPointerOut?.(event);
            });
            this.cleanUps.push(pointerOverCleanUp, pointerOutCleanUp);
        }
    }

    ngOnDestroy(): void {
        this.cleanUps.forEach((cleanUp) => cleanUp());
    }
}
