import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import 'rxjs/add/operator/switchMap';
import * as D3 from 'd3';
import { GameService, Game, KillFeedEntry, Stage, GameHero, GameEvent} from './game.service';
import { UserLoginService } from '../login/user-login.service';


@Component({
    selector: 'metagame',
    templateUrl: './metagame.component.html'
})
export class MetaGameComponent  implements OnInit {
    @Input() id: string;
    data: any;
    hide: boolean;
    
    constructor(private gameService: GameService) {}
    
    ngOnInit(): void {
        this.hide = true;
        this.gameService.getMetaGame(this.id).subscribe(
                res => {
                    const body = res.json();
                    this.data = body;
                },
                err => {
                    console.error(err);
                }
            );
    }
     
     toggleMeta() {
         this.hide = !this.hide;
     }
      
     keys(obj: any, remove: Array<string>) {
         if (obj) {
            return Object.keys(obj).filter((a) => !remove.includes(a));
         }
         return [];
     }
}

@Component({
    selector: 'game',
    templateUrl: './game.component.html',
    providers: [GameService]
})
export class GameComponent implements OnInit {
    game: Game;
    hideTimelineKey: boolean;

    constructor(public gameService: GameService, public route: ActivatedRoute, public loginService: UserLoginService) { }

    ngOnInit(): void {
        this.hideTimelineKey = true;
        this.route.params
            .switchMap((params: Params) =>
                       this.gameService.getGame(params['user'] + '/' + params['game']))
            .subscribe(
                res => {
                    this.game = this.gameService.toGame(res);
                },
                err => {
                    console.error(err);
                }
            );
    }
    
    toggleTimelineKey() {
        this.hideTimelineKey = !this.hideTimelineKey;
        D3.select('#timeline-key-header').classed('pull-right', this.hideTimelineKey);
    }

    normaliseString(str: string){
        return str.toLowerCase().replace(/\s/g, '_').replace(/\W/g, '').replace(/_/g, '-');
    }

    stageHref(stage: Stage){
        return 'stage_' + stage.index;
    }

    mapClass() {
        if (this.game === null) {
            return '';
        }
        return this.normaliseString(this.game.map);
    }
    
    wltClass() {
        if (this.game.result == 'UNKN' || !this.game.result){
            return 'text-unknown';
        } else if (this.game.result == 'DRAW'){
            return 'text-warning';
        } else if (this.game.result == 'WIN'){
            return 'text-success';
        } else if (this.game.result == 'LOSS'){
            return 'text-danger';
        }
        throw new Error('Unexpected game result: ' + this.game.result);
    }

    leftColor(kill: KillFeedEntry) {
        if (kill.isLeftRed) {
            return 'text-red';
        }
        return 'text-blue';
    }

    rightColor(kill: KillFeedEntry) {
        if (kill.isLeftRed) {
            return 'text-blue';
        }
        return 'text-red';
    }

    time(kill: KillFeedEntry) {
        let secs = Math.floor(kill.time / 1000);
        let mins = Math.floor(secs / 60);
        secs = secs - 60 * mins;
        let secd = secs < 10 ? '0' + secs : secs;
        return mins + ':' + secd;
    }
    
    displaySR(sr: number) {
        if (sr === null || sr == undefined) {
            return '?';
        }
        return '' + sr;
    }
    
    displayGameTime() {
        const time = this.game.duration;
        const min = D3.format('d')(Math.floor(time / 60));
        const sec = D3.format('02')(time - (Math.floor(time / 60) * 60));
        return min + ':' + sec;
    }
    
    displaySRChange() {
        if (this.game.startSR === null || this.game.startSR == undefined 
           || this.game.endSR === null || this.game.endSR == undefined) {
            return '?';
        }
        const diff = this.game.endSR - this.game.startSR;
        return diff > 0 ? '+' + diff : '' + diff;
    }
    
    rank(sr: number) {
        if (sr === null || sr == undefined) {
            return 'unknown';
        } else if (sr < 1500) {
            return 'bronze';
        } else if (sr < 2000) {
            return 'silver';
        } else if (sr < 2500) {
            return 'gold';
        } else if (sr < 3000) {
            return 'platinium';
        } else if (sr < 3500) {
            return 'diamond';
        } else if (sr < 4000) {
            return 'master';
        } else {
            return 'grandmaster';
        }
    }
}
