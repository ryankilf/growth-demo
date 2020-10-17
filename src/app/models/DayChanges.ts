export class DayChanges {
  public asymptomatic: number;
  public symptomatic: number;
  public recovered: number;
  public hospital: number;
  public icu: number;
  public dead: number;
  public postIcuRecovery: number;

  constructor(public day: number) {
    this.asymptomatic = 0;
    this.symptomatic = 0;
    this.recovered = 0;
    this.hospital = 0;
    this.icu = 0;
    this.dead = 0;
    this.postIcuRecovery = 0;
  }
}
