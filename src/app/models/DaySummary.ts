import {DayChanges} from './DayChanges';

export class DaySummary {
  public asymptomatic: number;
  public symptomatic: number;
  public recovered: number;
  public hospital: number;
  public icu: number;
  public dead: number;
  public postIcuRecovery: number;
  public r?: number;
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

  setR(r: number): void {
    this.r = r;
  }

  setSpreading(spreading: boolean): void {
    this.spreading = spreading;
  }


  getTotalInfected(): number {
    return this.asymptomatic + this.symptomatic + this.hospital + this.icu + this.postIcuRecovery;
  }

  getTotalHospitalised(): number {
    return this.hospital + this.icu + this.postIcuRecovery;
  }

  getTotalHospitalisedNonIcu(): number {
    return this.hospital + this.postIcuRecovery;
  }
}
