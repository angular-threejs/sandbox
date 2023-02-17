import { injectActivatedRoute } from '@analogjs/router';
import { Component, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { RoutedRockService } from '../../../utils/routed-rock.service';

@Component({
    standalone: true,
    templateUrl: './rock-color.html',
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export default class RockColor {
    private readonly route = injectActivatedRoute();
    private readonly routedRockService = inject(RoutedRockService);

    ngOnInit() {
        this.routedRockService.id$.subscribe(console.log);
        console.log('in rock color', this.route);
    }
}
