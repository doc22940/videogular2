import {Component, OnInit, Input, ElementRef} from 'angular2/core';
import {NgFor} from "angular2/common";

import {VgAPI} from '../../../services/vg-api';
import {ICuePoint} from "../../../vg-cue-points/icue-point";


@Component({
    selector: 'vg-scrub-bar-cue-points',
    directives: [NgFor],
    template: `
        <div class="cue-point-container">
            <span *ngFor="#cp of cuePoints" [style.width]="cp.$$style?.width" [style.left]="cp.$$style?.left" class="cue-point"></span>
        </div>
        `,
    styles: [`
        :host {
            display: flex;
            width: 100%;
            height: 5px;
            pointer-events: none;
            position: absolute;
        }

        :host .cue-point-container .cue-point {
            position: absolute;
            height: 5px;
            background-color: rgba(255, 204, 0, 0.7);
        }

        vg-controls :host {
            position: absolute;
            top: calc(50% - 3px);
        }
    `]
})
export class VgScrubBarCuePoints implements OnInit {
    elem:HTMLElement;
    vgFor: string;
    target: any;

    @Input('cuePoints') cuePoints:Array<ICuePoint>;

    constructor(ref:ElementRef, public API:VgAPI) {
        this.elem = ref.nativeElement;
    }

    ngOnInit() {
        this.vgFor = this.elem.getAttribute('vg-for');
        this.target = this.API.getMediaById(this.vgFor);

        var onTimeUpdate = this.target.subscriptions.loadedMetadata;
        onTimeUpdate.subscribe(this.onLoadedMetadata.bind(this));
    }

    onLoadedMetadata() {
        if (this.cuePoints) {
            for (var i = 0, l = this.cuePoints.length; i < l; i++) {
                var end = (this.cuePoints[i].end >= 0) ? this.cuePoints[i].end : this.cuePoints[i].start + 1;
                var cuePointDuration = (end - this.cuePoints[i].start) * 1000;
                var position:string = '0';
                var percentWidth:string = '0';

                if (typeof cuePointDuration === 'number' && this.target.time.total) {
                    percentWidth = ((cuePointDuration * 100) / this.target.time.total) + "%";
                    position = (this.cuePoints[i].start * 100 / (Math.round(this.target.time.total / 1000))) + "%";
                }

                this.cuePoints[i].$$style = {
                    width: percentWidth,
                    left: position
                };
            }
        }
    }
}