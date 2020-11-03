import {Component, OnInit} from '@angular/core';
import {FormArray, FormBuilder, FormGroup} from '@angular/forms';
import {Stage} from './models/Stage';
import {StageIdentifier} from './models/StageIdentifier';
import {ParentStage} from './models/ParentStage';
import {DayChanges} from './models/DayChanges';
import {DaySummary} from './models/DaySummary';
import {CookieService} from 'ngx-cookie-service';
import {ChartDataSets, ChartOptions, ChartType} from 'chart.js';
import {Label} from 'ng2-charts';

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

  public rNaughtAdditions: number[] = [];

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
  public rNaught = 1.5;
  public initiallyInfected = 350;
  public population = 67500000;
  public lengthOfDay = 0.3;
  public spreading = true;


  private interval;
  public aSymptomaticOn = false;
  public showProgression: boolean;
  public yesterday: DaySummary;

  public showDisclaimer = true;
  public showDiagram = false;
  public spreadingStoppedDeath = 0;


  public barChartOptions: ChartOptions = {
    responsive: true,
    animation: {
      duration: 0 // general animation time
    },
    scales: {
      yAxes: [{
        type: 'linear',
        display: true,
        position: 'left',
        id: 'people',
        gridLines: {
          display: false
        },
        ticks: {
          beginAtZero: true
        }
      }, {
        type: 'linear',
        display: true,
        position: 'right',
        id: 'r',
        offset: false,
        gridLines: {
          display: false
        },
        ticks: {
          beginAtZero: true
        }
      }]
    }
  };
  public barChartLabels: Label[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];
  public barChartSymptoms: number[] = [];
  public barChartHospital: number[] = [];
  public barChartIcu: number[] = [];
  public barChartDead: number[] = [];
  public barChartRNaught: number[] = [];
  public barChartROne: number[] = [];


  public barChartData: ChartDataSets[] = [
    {data: this.barChartSymptoms, label: 'Symptoms', stack: 'a'},
    {data: this.barChartHospital, label: 'Hospital', stack: 'a'},
    {data: this.barChartIcu, label: 'Icu', stack: 'a'},
    {data: this.barChartDead, label: 'dead', stack: 'a'},
    {data: this.barChartRNaught, label: 'R0', stack: 'b'},
    {data: this.barChartROne, label: 'R1', stack: 'b'},
  ];

  public daySpreadingStopped: DaySummary;
  public daySpreadingStoppedAdditions: DayChanges;
  public peakDeaths: DayChanges = new DayChanges(0);
  peakIcu: DaySummary = new DaySummary(0);
  peakHospitalised: DaySummary = new DaySummary(0);
  public rOne: number;

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
      r: this.rNaught,
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
    dayTotal.setRNaught(this.rNaught);
    dayTotal.setROne(this.rOne);
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
      dayAddition.asymptomatic = this.getNewCasesForDay();

    } else {
      dayAddition.asymptomatic = newCases;
    }

    this.setFutureRZeroAdditions(dayAddition.asymptomatic);
    this.rOne = this.rNaught * (1 - ((dayAddition.asymptomatic + this.totalEverInfected) / this.population));

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
      this.daySpreadingStopped = this.today;
      this.daySpreadingStoppedAdditions = dayAddition;
    }

    if (dayAddition.dead > this.peakDeaths.dead) {
      this.peakDeaths = dayAddition;
    }

    if (this.today.icu > this.peakIcu.icu) {
      this.peakIcu = this.today;
    }

    if (this.today.getTotalHospitalised() > this.peakHospitalised.getTotalHospitalised()) {
      this.peakHospitalised = this.today;
    }

    this.barChartLabels.push('Day ' + (this.day - 1));
    this.barChartSymptoms.push(Math.round(this.today.symptomatic));
    this.barChartHospital.push(Math.round(this.today.hospital + this.today.postIcuRecovery));
    this.barChartIcu.push(Math.round(this.today.icu));
    this.barChartDead.push(Math.round(this.today.dead));
    if (this.spreading) {
      this.barChartRNaught.push(this.today.rNaught);
      this.barChartROne.push(parseFloat(this.today.rOne.toPrecision(2)));
    } else {
      this.barChartRNaught.push(0);
      this.barChartROne.push(0);
    }
    this.barChartData = [
      {
        data: this.barChartRNaught,
        label: 'R0',
        stack: 'b',
        type: 'line',
        fill: false,
        backgroundColor: '#7777ee',
        borderColor: '#7777ee',
        hoverBackgroundColor: '#7777ee',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'r'
      },
      {
        data: this.barChartROne,
        label: 'R1',
        stack: 'b',
        type: 'line',
        fill: false,
        backgroundColor: '#f651ee',
        borderColor: '#f651ee',
        hoverBackgroundColor: '#f5a5f1',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'r'
      },
      {
        data: this.barChartSymptoms,
        label: 'Symptoms',
        stack: 'a',
        backgroundColor: '#88cc88',
        borderColor: '#88cc88',
        hoverBackgroundColor: '#eeffee',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'people'
      },
      {
        data: this.barChartHospital,
        label: 'Hospital',
        stack: 'a',
        backgroundColor: '#e7a32d',
        hoverBackgroundColor: '#fac54f',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'people'
      },
      {
        data: this.barChartIcu,
        label: 'Icu',
        stack: 'a',
        backgroundColor: '#e7582d',
        hoverBackgroundColor: '#f97a4f',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'people'
      },
      {
        data: this.barChartDead,
        label: 'Dead',
        stack: 'a',
        backgroundColor: '#000000',
        hoverBackgroundColor: '#555555',
        borderWidth: 0,
        hoverBorderWidth: 0,
        yAxisID: 'people'
      }
    ];

    if (
      this.day > 50
      && this.today.getTotalHospitalisedNonIcu() < 0.1
      && this.today.dayAddition.dead < 0.1
      && this.today.symptomatic < 0.1
      && this.today.asymptomatic < 0.1
    ) {
      this.pause();
    }
  }

  getNewCasesForDay(): number {
    if (this.spreading === false) {
      return 0;
    }

    if (!this.rNaughtAdditions.hasOwnProperty(this.day)) {
      return 0;
    }
    const newNumber = (this.rNaughtAdditions[this.day] * this.rNaught);
    const realNewNumber = newNumber * (1 - ((newNumber + this.totalEverInfected) / this.population));
    return Math.max(realNewNumber, 0);
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
    clearInterval(this.interval);
    this.dayTotal = [];
    this.dayAddition = [];
    this.daySubtraction = [];
    this.day = 1;
    this.rOne = this.rNaught;
    this.totalEverInfected = 0;
    this.totalEverSymptomatic = 0;
    this.spreadingStoppedDeath = 0;
    this.started = false;
    this.paused = false;
    this.spreading = true;
    this.showDailyTotal();

    this.barChartLabels = [];
    this.barChartSymptoms = [];
    this.barChartHospital = [];
    this.barChartIcu = [];
    this.barChartDead = [];
    this.barChartData = [];
    this.barChartROne = [];
    this.barChartRNaught = [];

    this.daySpreadingStopped = new DaySummary(0);
    this.peakDeaths = new DayChanges(0);
    this.peakHospitalised = new DaySummary(0);
    this.peakIcu = new DaySummary(0);
    this.daySpreadingStoppedAdditions = new DayChanges(0);
    this.rNaughtAdditions = [];
  }

  startInterval(): void {
    this.interval = setInterval(() => {
      this.addDay();
    }, Math.max(this.lengthOfDay * 1000, 100));
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
        const base = d3.randomBates(3)();
        let randDay = 0;
        if (base < 0.5) {
          randDay = Math.round(((2 * base) * (peakDays - minDays)) + minDays);
        } else {
          randDay = Math.round((base - 0.5) * 2 * (maxDays - peakDays) + (2 * minDays));
        }

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

  private setFutureRZeroAdditions(newCases: number): void {
    const distro: number[] = this.getDistributions(newCases, 2, 14, 4);
    for (const [key, newAdditions] of Object.entries(distro)) {
      const dayKey = parseInt(key, 10) + this.day;

      if (!this.rNaughtAdditions.hasOwnProperty(dayKey)) {
        this.rNaughtAdditions[dayKey] = 0;
      }
      this.rNaughtAdditions[dayKey] += newAdditions;
    }
  }
}
