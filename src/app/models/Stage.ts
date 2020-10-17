export class Stage {
  constructor(
    public id: number,
    public label: string,
    public complete: boolean,
    public parentGroup: number | null,
    public nextStageWorse: number | null,
    public nextStageBetter: number | null,
    public nextStageWorseChance: number | null,
    public nextStageMinPeriod: number | null,
    public nextStateMaxPeriod: number | null,
    public nextStagePeakPeriod: number | null,
    public nextStageBetterMinPeriod: number | null,
    public nextStateBetterMaxPeriod: number | null,
    public nextStageBetterPeakPeriod: number | null
  ) {
  }
}
