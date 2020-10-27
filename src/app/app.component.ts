import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Stage} from './models/Stage';
import {StageIdentifier} from './models/StageIdentifier';
import {ParentStage} from './models/ParentStage';
import {DayChanges} from './models/DayChanges';
import {DaySummary} from './models/DaySummary';
import {CookieService} from 'ngx-cookie-service';

const d3 = require('d3-random');


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'growth-demo-ng';
  settingsForm;
  stagesForm;
  public started = false;
  public paused = false;
  public day = 1;
  public dailyTotalOn = true;
  public changesOn = false;

  public enumsToFields: string[] = [];

  public symptomaticData: number[] = [];
  public hospitalData: number[] = [];
  public icuData: number[] = [];
  public recoveredData: number[] = [];
  public deadData: number[] = [];


  public today: DaySummary;
  public dayTotal: DaySummary[] = [];
  public dayAddition: DayChanges[] = [];
  public daySubtraction: DayChanges[] = [];

  public stages: Stage[] = [
    new Stage(
      StageIdentifier.asymptomatic,
      false,
      ParentStage.infected,
      StageIdentifier.symptomatic,
      StageIdentifier.recovered,
      0.6,
      2,
      12,
      5,
      null,
      null,
      null
    ),
    new Stage(
      StageIdentifier.recovered,
      true,
      ParentStage.recovered,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ),
    new Stage(
      StageIdentifier.symptomatic,
      false,
      ParentStage.infected,
      StageIdentifier.hospital,
      StageIdentifier.recovered,
      0.2,
      8,
      10,
      null,
      null,
      null,
      null
    ),
    new Stage(
      StageIdentifier.hospital,
      false,
      ParentStage.hospitalised,
      StageIdentifier.icu,
      StageIdentifier.recovered,
      0.27,
      7,
      14,
      null,
      null,
      null,
      null
    ),
    new Stage(
      StageIdentifier.icu,
      false,
      ParentStage.hospitalised,
      StageIdentifier.dead,
      StageIdentifier.postIcuRecovery,
      0.255,
      7,
      14,
      null,
      5,
      30,
      null
    ),
    new Stage(
      StageIdentifier.postIcuRecovery,
      false,
      ParentStage.hospitalised,
      StageIdentifier.recovered,
      StageIdentifier.recovered,
      0,
      7,
      14,
      null,
      null,
      null,
      null
    ),
    new Stage(
      StageIdentifier.dead,
      true,
      ParentStage.recovered,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      null
    ),
  ];
  public totalEverInfected = 0;
  public totalEverSymptomatic = 0;
  public doublingRate = 5;
  public initiallyInfected = 250;
  public population = 67500000;
  public lengthOfDay = 0.3;
  public spreading = true;

//  public lineChartData: ChartDataSets[] = [];

  private interval;
  public aSymptomaticOn = false;
  public showProgression: boolean;
  private yesterday: DaySummary;

  public showDisclaimer = true;
  public showDiagram = false;
  public spreadingStoppedDeath = 0;

  constructor(
    private formBuilder: FormBuilder,
    private cookieService: CookieService,
  ) {
    this.enumsToFields[StageIdentifier.asymptomatic] = 'asymptomatic';
    this.enumsToFields[StageIdentifier.symptomatic] = 'symptomatic';
    this.enumsToFields[StageIdentifier.recovered] = 'recovered';
    this.enumsToFields[StageIdentifier.hospital] = 'hospital';
    this.enumsToFields[StageIdentifier.icu] = 'icu';
    this.enumsToFields[StageIdentifier.dead] = 'dead';
    this.enumsToFields[StageIdentifier.postIcuRecovery] = 'postIcuRecovery';
    this.settingsForm = this.formBuilder.group({
      doublingRate: this.doublingRate,
      initiallyInfected: this.initiallyInfected,
      population: this.population,
      lengthOfDay: this.lengthOfDay,
      spreading: this.spreading,
      aSymptomaticOn: this.aSymptomaticOn
    });
    if (this.cookieService.get('seenDisclaimer')) {
      this.showDisclaimer = false;
    }
  }

  ngOnInit(): void {
    const cookieTimeout = new Date();
    cookieTimeout.setFullYear(cookieTimeout.getFullYear() + 2);

    this.cookieService.set('seenDisclaimer', 'true', {expires: cookieTimeout});
  }

  getDayTotal(day: number): DaySummary {
    let dayTotal = this.dayTotal.find(e => e.day === day);
    if (dayTotal === undefined) {
      dayTotal = new DaySummary(day);
      this.dayTotal.push(dayTotal);
    }
    return dayTotal;
  }

  getDayAddition(day: number): DayChanges {
    let addition = this.dayAddition.find(e => e.day === day);
    if (addition === undefined) {
      addition = new DayChanges(day);
      this.dayAddition.push(addition);
    }
    return addition;
  }

  getDaySubtraction(day: number): DayChanges {
    let subtraction = this.daySubtraction.find(e => e.day === day);
    if (subtraction === undefined) {
      subtraction = new DayChanges(day);
      this.daySubtraction.push(subtraction);
    }
    return subtraction;
  }

  addDay(): void {
    this.yesterday = this.today;
    const newCases = this.initiallyInfected;
    const dayAddition = this.getDayAddition(this.day);
    const daySubtraction = this.getDaySubtraction(this.day);
    const dayTotal = this.getDayTotal(this.day);
    dayTotal.setDoublingRate(this.doublingRate);
    dayTotal.setSpreading(this.spreading);
    if (this.day > 1) {
      const previousDay = this.getDayTotal(this.day - 1);
      dayTotal.asymptomatic = previousDay.asymptomatic;
      dayTotal.symptomatic = previousDay.symptomatic;
      dayTotal.recovered = previousDay.recovered;
      dayTotal.hospital = previousDay.hospital;
      dayTotal.icu = previousDay.icu;
      dayTotal.dead = previousDay.dead;
      dayTotal.postIcuRecovery = previousDay.postIcuRecovery;
      dayAddition.asymptomatic = this.calculateNewCases(previousDay.getTotalInfected());
    } else {
      dayAddition.asymptomatic = newCases;
    }

    this.totalEverInfected += dayAddition.asymptomatic;

    dayTotal.asymptomatic += dayAddition.asymptomatic;
    dayTotal.asymptomatic -= daySubtraction.asymptomatic;

    dayTotal.symptomatic += dayAddition.symptomatic;
    dayTotal.symptomatic -= daySubtraction.symptomatic;

    dayTotal.recovered += dayAddition.recovered;
    dayTotal.recovered -= daySubtraction.recovered;

    dayTotal.hospital += dayAddition.hospital;
    dayTotal.hospital -= daySubtraction.hospital;

    dayTotal.icu += dayAddition.icu;
    dayTotal.icu -= daySubtraction.icu;

    dayTotal.dead += dayAddition.dead;
    dayTotal.dead -= daySubtraction.dead;

    dayTotal.postIcuRecovery += dayAddition.postIcuRecovery;
    dayTotal.postIcuRecovery -= daySubtraction.postIcuRecovery;
    dayTotal.setAdditions(dayAddition);
    dayTotal.setSubtractions(daySubtraction);

    this.processAdditions();

    this.day++;
    this.today = dayTotal;

    if ((this.yesterday && this.yesterday.spreading) && !this.today.spreading) {
      this.spreadingStoppedDeath = this.today.dead;
    }

  }

  calculateNewCases(previousDayTotal: number): number {
    if (this.spreading === false) {
      return 0;
    }
    let increaseRate = ((2 ** (1 / this.doublingRate)) - 1);
    if (this.totalEverInfected / this.population > 0.5) {
      increaseRate = increaseRate * (1 - (this.totalEverInfected / this.population));
    }
    if (increaseRate < 0) {
      return 0;
    }
    return (previousDayTotal * increaseRate);
  }

  start(): void {
    this.reset();
    this.started = true;
    this.paused = false;


    this.addDay();
    this.startInterval();
  }

  pause(): void {
    this.paused = true;
    clearInterval(this.interval);
  }

  continue(): void {
    this.paused = false;
    this.startInterval();
  }

  reset(): void {
    this.dayTotal = [];
    this.dayAddition = [];
    this.daySubtraction = [];
    this.day = 1;
    this.totalEverInfected = 0;
    this.totalEverSymptomatic = 0;
    this.spreadingStoppedDeath = 0;
    this.started = false;
    this.paused = false;
    this.spreading = true;
    this.showDailyTotal();

    this.symptomaticData = [];
    this.hospitalData = [];
    this.icuData = [];
    this.recoveredData = [];
    this.deadData = [];
  }

  startInterval(): void {
    this.interval = setInterval(() => {
      this.addDay();
    }, this.lengthOfDay * 1000);
  }

  processAdditions(): void {
    const dayAddition = this.getDayAddition(this.day);
    let worseNumber = 0;
    let betterNumber = 0;
    let numberToProcess = 0;
    // tslint:disable-next-line:forin
    for (const i in this.stages) {
      const stage = this.stages[i];
      if (stage.complete) {
        continue;
      }


      switch (stage.id) {
        case StageIdentifier.asymptomatic:
          numberToProcess = dayAddition.asymptomatic;
          break;
        case StageIdentifier.symptomatic:
          this.totalEverSymptomatic += dayAddition.symptomatic;
          numberToProcess = dayAddition.symptomatic;
          break;
        case StageIdentifier.recovered:
          numberToProcess = dayAddition.recovered;
          break;
        case StageIdentifier.hospital:
          numberToProcess = dayAddition.hospital;
          break;
        case StageIdentifier.icu:
          numberToProcess = dayAddition.icu;
          break;
        case StageIdentifier.dead:
          numberToProcess = dayAddition.dead;
          break;
        case StageIdentifier.postIcuRecovery:
          numberToProcess = dayAddition.postIcuRecovery;
          break;
        default:
          break;
      }

      worseNumber = numberToProcess * stage.nextStageWorseChance;
      betterNumber = numberToProcess - worseNumber;
      const distributionWorse = this.getDistributions(
        worseNumber,
        stage.nextStageMinPeriod,
        stage.nextStateMaxPeriod,
        stage.nextStagePeakPeriod
      );

      // if (stage.id === StageIdentifier.symptomatic) {
      //   console.log('numberToProcess ' + numberToProcess);
      //   console.log('positive ' + betterNumber);
      //   console.log('negative ' + worseNumber);
      //   console.log('end');
      // }

      distributionWorse.forEach((numberToDistribute, day) => {
        const newDayAddition = this.getDayAddition(this.day + day);
        const newDaySubtraction = this.getDaySubtraction(this.day + day);
        const additionField = this.enumsToFields[stage.nextStageWorse];
        const subtractionField = this.enumsToFields[stage.id];
        newDayAddition[additionField] += numberToDistribute;
        newDaySubtraction[subtractionField] += numberToDistribute;
      });

      if (betterNumber > 0) {
        const distributionBetter = this.getDistributions(
          betterNumber,
          stage.nextStageBetterMinPeriod ?? stage.nextStageMinPeriod,
          stage.nextStateBetterMaxPeriod ?? stage.nextStateMaxPeriod,
          stage.nextStageBetterPeakPeriod ? (stage.nextStageBetterPeakPeriod) : null
        );

        distributionBetter.forEach((numberToDistribute, day) => {
          const newDayAddition = this.getDayAddition(this.day + day);
          const newDaySubtraction = this.getDaySubtraction(this.day + day);
          const additionField = this.enumsToFields[stage.nextStageBetter];
          const subtractionField = this.enumsToFields[stage.id];
          newDayAddition[additionField] += numberToDistribute;
          newDaySubtraction[subtractionField] += numberToDistribute;
        });

      }

    }
  }

  getDistributions(total: number, minDays: number, maxDays: number, peakDays: number): number[] {
    const numberOfRands = 100;
    const distributions: number[] = [];
    const valuePerSlot = total / numberOfRands;
    for (let i = minDays; i <= maxDays; i++) {
      distributions[i] = 0;
    }
    if (peakDays === null) {
      for (let i = 1; i <= numberOfRands; i++) {
        const nextRand = d3.randomInt(minDays, maxDays)();
        distributions[nextRand] += valuePerSlot;
      }
    } else {
      /**
       * Where we have a "peak" we need to make it the actual peak number.
       * There's probably better ways of doing this
       */
      for (let i = 1; i <= numberOfRands; i++) {
        const base = d3.randomInt(1, 100)();
        let randDay = 0;
        if (base > 40 && base < 60) {
          randDay = peakDays;
        } else if (base < 50) {
          randDay = Math.ceil(((base / 40) * (peakDays - minDays)) + minDays);
        } else {
          randDay = Math.floor(((base / 100) * (maxDays - peakDays)) + minDays);
        }

        randDay = Math.round(randDay);

        distributions[randDay] += valuePerSlot;
      }
    }
    return distributions;
  }

  showDailyTotal(): void {
    this.dailyTotalOn = true;
    this.changesOn = false;
  }

  showChanges(): void {
    this.dailyTotalOn = false;
    this.changesOn = true;
  }

  toggleProgression(): void {
    this.showProgression = !this.showProgression;
  }

  toggleDisclaimer(): void {
    this.showDisclaimer = !this.showDisclaimer;
  }
}
