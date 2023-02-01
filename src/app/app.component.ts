import { NgFor } from '@angular/common';
import { Component, Directive, ElementRef, HostBinding, HostListener, inject, Input } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

const routes = import.meta.glob(['/src/app/routes/**/*.ts'], { eager: true });

interface RouteInfo {
    path: string;
    title: string;
    asset: string;
}

@Directive({
    selector: 'video[sandboxAutoplay]',
    standalone: true,
})
export class Autoplay {
    private readonly videoElementRef: ElementRef<HTMLVideoElement> = inject(ElementRef, { self: true });

    @HostListener('mouseover')
    onMouseOver() {
        this.videoElementRef.nativeElement.play().catch(() => {  });
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
    template: `
        <a
            class="w-full overflow-hidden"
            style="border-start-start-radius: inherit;border-start-end-radius: inherit;border-end-start-radius: unset;border-end-end-radius: unset;"
            [routerLink]="[route.path]"
        >
            <video
                sandboxAutoplay
                muted
                playsinline
                class="w-full h-full max-h-48 object-cover cursor-pointer"
                [title]="route.title"
                [poster]="isIOS ? route.asset + '.gif' : ''"
            >
                <source
                    *ngFor="let source of ['webm', 'mp4']"
                    [src]="route.asset + '.' + source"
                    [type]="'video/' + source"
                />
                <img
                    class="w-full h-full max-h-48 object-cover cursor-pointer"
                    [src]="route.asset + '.gif'"
                    [alt]="route.title"
                    loading="lazy"
                />
            </video>
        </a>

        <div class="card-body p-1">
            <code>{{ route.title }}</code>
        </div>
    `,
    imports: [NgFor, RouterLink, Autoplay],
})
export class RouteCard {
    @HostBinding('class') hostClass = 'card d-block w-72 bg-base-100 shadow-xl pl-0 pt-0 pr-0 gap-0';
    @Input() route!: RouteInfo;
    isIOS = false;
}

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NgFor, RouteCard],
    template: `
        <div class="drawer drawer-mobile">
            <input id="my-drawer-2" type="checkbox" class="drawer-toggle" />
            <div class="drawer-content flex flex-col items-center justify-center">
                <!-- Page content here -->
                <div class="h-full w-full relative">
                    <router-outlet />
                </div>
                <label
                    for="my-drawer-2"
                    class="btn btn-primary btn-circle drawer-button absolute top-4 left-4 lg:hidden"
                >
                    <svg
                        class="h-6 w-6"
                        xmlns="http://www.w3.org/2000/svg"
                        xmlns:xlink="http://www.w3.org/1999/xlink"
                        fill="#000000"
                        viewBox="0 0 50 50"
                    >
                        <path
                            d="M14 6C7.480469 6 2.214844 11.183594 2.03125 17.65625L0.1875 20.21875C-0.121094 20.660156 -0.0273438 21.269531 0.40625 21.59375C0.910156 21.972656 1.445313 22.265625 2 22.5L2 26.5625C0.804688 27.253906 0 28.519531 0 30C0 31.480469 0.804688 32.746094 2 33.4375L2 39C2 41.746094 4.253906 44 7 44L43 44C45.746094 44 48 41.746094 48 39L48 33.4375C49.195313 32.746094 50 31.480469 50 30C50 28.519531 49.195313 27.253906 48 26.5625L48 22.59375C48.636719 22.351563 49.242188 22.023438 49.8125 21.59375C50.023438 21.433594 50.164063 21.195313 50.199219 20.929688C50.234375 20.664063 50.164063 20.398438 50 20.1875L47.96875 17.625C47.765625 11.167969 42.507813 6 36 6 Z M 14 8L36 8C41.226563 8 45.445313 11.914063 45.9375 17L4.0625 17C4.554688 11.914063 8.773438 8 14 8 Z M 17.5 9C16.671875 9 16 9.671875 16 10.5C16 11.328125 16.671875 12 17.5 12C18.328125 12 19 11.328125 19 10.5C19 9.671875 18.328125 9 17.5 9 Z M 12.5 10C11.671875 10 11 10.671875 11 11.5C11 12.328125 11.671875 13 12.5 13C13.328125 13 14 12.328125 14 11.5C14 10.671875 13.328125 10 12.5 10 Z M 15.5 13C14.671875 13 14 13.671875 14 14.5C14 15.328125 14.671875 16 15.5 16C16.328125 16 17 15.328125 17 14.5C17 13.671875 16.328125 13 15.5 13 Z M 3.53125 19L46.5 19L47.6875 20.5C45.789063 21.457031 43.582031 21.328125 41.8125 20C41.492188 19.761719 41.0625 19.738281 40.71875 19.9375L39.125 20.84375C39.113281 20.84375 39.105469 20.84375 39.09375 20.84375C37.191406 21.96875 35.003906 21.949219 33.21875 20.84375C33.207031 20.84375 33.199219 20.84375 33.1875 20.84375L31.59375 19.9375C31.304688 19.773438 30.953125 19.761719 30.65625 19.90625L27.6875 21.40625L27.65625 21.40625C26.042969 22.160156 24.175781 22.160156 22.5625 21.40625L22.53125 21.40625L19.5625 19.90625C19.265625 19.761719 18.914063 19.773438 18.625 19.9375L17 20.84375C15.097656 21.96875 12.910156 21.949219 11.125 20.84375C11.113281 20.84375 11.105469 20.84375 11.09375 20.84375L9.5 19.9375C9.15625 19.738281 8.726563 19.761719 8.40625 20C6.621094 21.339844 4.378906 21.453125 2.46875 20.46875 Z M 8.96875 21.90625L10.09375 22.53125L10.0625 22.5625C12.476563 24.058594 15.503906 24.039063 18 22.5625L19.125 21.9375L21.65625 23.1875C21.667969 23.199219 21.675781 23.207031 21.6875 23.21875C23.855469 24.246094 26.363281 24.246094 28.53125 23.21875C28.542969 23.207031 28.550781 23.199219 28.5625 23.1875L31.09375 21.9375L32.1875 22.5625L32.21875 22.5625C34.628906 24.042969 37.605469 24.03125 40.09375 22.5625L41.21875 21.90625C42.683594 22.808594 44.363281 23.175781 46 23.03125L46 26L4 26L4 23.03125C5.695313 23.230469 7.441406 22.847656 8.96875 21.90625 Z M 4 28L46 28C47.191406 28 48 28.808594 48 30C48 31.191406 47.191406 32 46 32L4 32C2.808594 32 2 31.191406 2 30C2 28.808594 2.808594 28 4 28 Z M 4 34L46 34L46 39C46 40.65625 44.65625 42 43 42L7 42C5.34375 42 4 40.65625 4 39Z"
                        />
                    </svg>
                </label>
            </div>
            <div class="drawer-side border-r-zinc-300 border-r-2">
                <label for="my-drawer-2" class="drawer-overlay"></label>
                <ul class="menu gap-4 p-4 w-80 bg-base-100 text-base-content">
                    <!-- Sidebar content here -->
                    <li *ngFor="let route of routes">
                        <RouteCard [route]="route"/>
                    </li>
                </ul>
            </div>
        </div>
    `,
})
export class AppComponent {
    readonly isIOS = false;
    readonly routes: RouteInfo[] = Object.keys(routes).map((key) => {
        const route = routes[key] as Record<string, any>;
        return {
            ...route['routeMeta'],
            ...route['routeMeta']['data'],
            path: key.replace('/src/app/routes/', '').replace('.ts', ''),
        };
    });
    readonly router = inject(Router);

    ngOnInit() {
        this.router.navigate(['/animation-keyframes']);
    }
}
