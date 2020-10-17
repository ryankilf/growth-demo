import {DayChanges} from './DayChanges';

export class DaySummary {
  public asymptomatic: number;
  public symptomatic: number;
  public recovered: number;
  public hospital: number;
  public icu: number;
  public dead: number;
  public postIcuRecovery: number;
  public doublingRate?: number;
  public spreading: boolean;
  public dayAddition: DayChanges;
  public daySubtraction: DayChanges;

  constructor(public day: number) {
    this.asymptomatic = 0;
    this.symptomatic = 0;
    this.recovered = 0;
    this.hospital = 0;
    this.icu = 0;
    this.dead = 0;
    this.postIcuRecovery = 0;
  }

  setAdditions(additions: DayChanges): void {
    this.dayAddition = additions;
  }

  setSubtractions(subtractions: DayChanges): void {
    this.daySubtraction = subtractions;
  }
  setDoublingRate(doublingRate: number): void {
    this.doublingRate = doublingRate;
  }

  setSpreading(spreading: boolean): void {
    this.spreading = spreading;
  }


  getTotalInfected(): number {
    return this.asymptomatic + this.symptomatic + this.hospital + this.icu + this.postIcuRecovery;
  }
}
