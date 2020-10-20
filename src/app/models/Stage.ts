import {StageIdentifier} from './StageIdentifier';

export class Stage {
  public label: string;
  constructor(
    public id: number,
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
    this.label = this.getLabelFromNumber(this.id);
  }

  getLabelFromNumber(stageId: number): string {
    switch (stageId) {
      case StageIdentifier.asymptomatic:
        return 'A-symptomatic';
        break;
      case StageIdentifier.symptomatic:
        return 'Symptomatic';
        break;
      case StageIdentifier.recovered:
        return 'Recovered';
        break;
      case StageIdentifier.hospital:
        return 'Hospital';
        break;
      case StageIdentifier.icu:
        return 'ICU';
        break;
      case StageIdentifier.dead:
        return 'Dead';
        break;
      case StageIdentifier.postIcuRecovery:
        return 'Post-ICU recovery';
        break;
    }
  }
}
