export class Game{
    constructor(isEmpty: boolean = false){
        this._isEmpty = isEmpty;
    }

    private _isEmpty: boolean;
    tratorToInnocentRatio: number = 0.25;
    numberOfRounds: number = 3;
    currentRound?: number;
}