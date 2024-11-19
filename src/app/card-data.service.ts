import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { GoogleSheetsDbService } from 'ng-google-sheets-db';
import { forkJoin, Observable } from 'rxjs';


/*
export interface Archetype{
  name: string,
  examples: Array<string>,
  description: string,
  analysis: string
}
  */


export type mtgColor = "w" | "u" | "b" | "r" | "g" | "c"

export interface SetCollection{
  title: string,
  enabled: boolean,
  sets: Array<Set>
}

export interface Set{
  setCode: string,
  mechanics: Array<Mechanic>,
  allMechanics: Array<Mechanic>,
  totalMechanics: Array<Mechanic>,
  name?: string,
  block?: string,
  symbol?: string,
  year?: number,
  total: number
}

export interface Mechanic{
  name: string,
  type: string,
  colors: {"w": number, "u": number, "b": number, "r": number, "g": number, "c": number},
  total: number,
  displayColor: DisplayColor
}

interface MechanicData{
  set: string,
  name: string,
  type: string,
  w: number,
  u: number,
  b: number,
  r: number,
  g: number,
  c: number,
  t: number
}

const mechanicAttributesMapping = {
  set: "Set",
  name: "Mechanic",
  type: "Type",
  w: "W",
  u: "U",
  b: "B",
  r: "R",
  g: "G",
  c: "C",
  t: "T"
}

interface SetData{
  setCode: string,
  name: string,
  block: string,
  setSymbol: string,
  year: number
}

const setAttributesMapping = {
  setCode: "Set Code",
  name: "Name",
  block: "Block",
  year: "Year"
}

export interface Chapter {
  title: string;
  author: string;
  year: number;
  chapterNumber: number;
  chapterText: string;
}
        

export interface DisplayColor{
  lightColor: string,
  darkColor: string
}

export interface DEMechanic{
  mechanicRule: MechanicRules,
  bySet: Array<number>,
  byColor: {"w": number, "u": number, "b": number, "r": number, "g": number, "c": number},
  displayColor: DisplayColor
}

// Keywords list
export interface MechanicRules{
  scryfall: string,
  name: string,
  type: string
}

export interface MechanicRuleExtraction{
  keyword: string,
  title: string,
  type: string,
  scryfall: string,
}

const rulesAttributesMapping = {
  keyword: "Keyword",
  title: "Title",
  type: "Type",
  scryfall: "Scryfall",
}

@Injectable({
  providedIn: 'root'
})
export class CardDataService {
  spreadsheetURL = "1KwEDqkyElcO7B4DBEyzWDFDLi0FSneRs2uw4P9xPIfg";
  private apiUrl = 'http://localhost:3000/api/chapters';


  sets: Array<Set> = [];
  displayColors: Array<DisplayColor> = [
    {lightColor: "#e6194B", darkColor: "#800000"},
    {lightColor: "#4363d8", darkColor: "#000075"},
    {lightColor: "#f58231", darkColor: "#9A6324"},
    {lightColor: "#bfef45", darkColor: "#8db035"},
    {lightColor: "#3cb44b", darkColor: "#2a7834"},
    {lightColor: "#42d4f4", darkColor: "#469990"},
    {lightColor: "#ffe119", darkColor: "#808000"},
    {lightColor: "#911eb4", darkColor: "#621c78"},

    {lightColor: "#e6196e", darkColor: "#800000"},
    {lightColor: "#4389d8", darkColor: "#000075"},
    {lightColor: "#f56931", darkColor: "#9A6324"},
    {lightColor: "#bfef45", darkColor: "#8db035"},
    {lightColor: "#d3ef45", darkColor: "#2a7834"},
    {lightColor: "#42d4f4", darkColor: "#469990"},
    {lightColor: "#fffb19", darkColor: "#808000"},
    {lightColor: "#821eb4", darkColor: "#621c78"},
  ]

  setsUndivided: Array<SetCollection> = [{title: "", sets: [], enabled: true}];
  setsByYear: Array<SetCollection> = [];
  setsByBlock: Array<SetCollection> = [];

  deMechanics: Array<DEMechanic> = [];

  mechanicRules = new Map<string, MechanicRules>();

  getStd(mechanic: Mechanic): number{
    var list: Array<number> = [mechanic.colors["w"], mechanic.colors["u"], mechanic.colors["b"], mechanic.colors["r"], mechanic.colors["g"]]

    
    const n = list.length
    const mean = list.reduce((a, b) => a + b) / n
    return Math.sqrt(list.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n)
  }

  getTotal(mechanic: Mechanic): number{
    return mechanic.colors["w"] + mechanic.colors["u"]+ mechanic.colors["b"] + mechanic.colors["r"] + mechanic.colors["g"] + mechanic.colors["c"]
  }

  shuffleArray(array: Array<any>) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
  }
  

  attemptLoadMechanics(): void{
    forkJoin([
      this.googleSheetsDbService.get<MechanicData>(this.spreadsheetURL, "Set Keywords", mechanicAttributesMapping),
      this.googleSheetsDbService.get<SetData>(this.spreadsheetURL, "Sets", setAttributesMapping),
      this.googleSheetsDbService.get<MechanicRuleExtraction>(this.spreadsheetURL, "Keywords", rulesAttributesMapping),
    ]).subscribe(([mechanicData, setData, mechanicRuleExtraction]) => { 
      // Keep track of current set that is receiving rows
      var currentSet : Set | undefined  = undefined;

      // Track the color of each mechanic
      var nextColor = 0;

      mechanicData.forEach((mechanic: MechanicData) => {
        // Establish new set
        if (currentSet == undefined || currentSet.setCode != mechanic.set) {
          currentSet = {
            setCode: mechanic.set,
            mechanics: [],
            allMechanics: [],
            totalMechanics: [],
            total: 0
          }

          this.sets.push(currentSet)
          nextColor = (nextColor + 1) % (this.displayColors.length / 2)
        }

        var mechanicValue: Mechanic = {
          name: mechanic.name,
          type: mechanic.type,
          colors: {w: Number(mechanic.w), u: Number(mechanic.u), b: Number(mechanic.b), r: Number(mechanic.r), g: Number(mechanic.g), c: Number(mechanic.c)},
          total: mechanic.t,
          displayColor: this.displayColors[nextColor]
        }
        
        // Add mechanic to the last added set
        currentSet.allMechanics.push(mechanicValue)

        if(mechanic.type == "s"){
          currentSet.mechanics.push(mechanicValue)
          currentSet.total += Number(mechanic.t)
          
          // Increment color so each mechanic has a different one
          nextColor = (nextColor + 1) % this.displayColors.length
        }

      })

      // Sort the mechanics of each color according to different criteria
      this.sets.forEach(set => {
        set.mechanics.sort((a, b) => this.getStd(b) - this.getStd(a));
        set.totalMechanics = set.mechanics.slice().sort((a, b) => this.getTotal(a) - this.getTotal(b));
      });

      // Establish criteria of each set that was identified from the mechanics
      setData.forEach((seDataItem: SetData) => {
        var matchedSet = this.sets.find(el => el.setCode.toUpperCase() == seDataItem.setCode.toUpperCase())
        
        if(matchedSet != undefined){
          matchedSet.block = seDataItem.block
          matchedSet.name = seDataItem.name
          matchedSet.symbol = "https://svgs.scryfall.io/sets/" + seDataItem.setCode + ".svg",
          matchedSet.year = seDataItem.year
        }
      })

      // Create a group containing all the sets
      this.setsUndivided[0].sets = this.sets

      // Initalize data to be used in the year and block grouping loop
      var lastYear = 2024
      var currentSetList: Array<Set> = []
      this.setsByYear.push({title: String(lastYear), sets: currentSetList, enabled: true})

      var lastBlock: string = this.sets[0]?.block!
      var currentSetListBlock: Array<Set> = []
      this.setsByBlock.push({title: lastBlock, sets: currentSetListBlock, enabled:true})

      // Iterate over sets to group them into years and blocks
      this.sets.forEach(set => {
        // If different fro mlast set, make new group
        if(set.year != lastYear){
          lastYear = set.year!
          currentSetList = []
          this.setsByYear.push({title: String(lastYear), sets: currentSetList, enabled: true})
        }

        // If different from last block, make new group
        if(set.block != lastBlock){
          lastBlock = set.block!
          currentSetListBlock = []
          this.setsByBlock.push({title: lastBlock, sets: currentSetListBlock, enabled: true})
        }

        currentSetList.push(set)
        currentSetListBlock.push(set)
      })

      this.mechanicRules = new Map(mechanicRuleExtraction.map(rule => [
        rule.keyword, 
        { scryfall: rule.scryfall, name: rule.title, type: rule.type }
      ]));

      var colorIndex = 0
      this.mechanicRules.forEach((rule: MechanicRules, key: string) => {
        if(rule.type == "d" || rule.type == "e"){
          var newMechanic: DEMechanic = {
            mechanicRule: rule,
            bySet: [],
            byColor: {"w": 0, "u": 0, "b": 0, "r": 0, "g": 0, "c": 0},
            displayColor: this.displayColors[colorIndex]
          }
          colorIndex = (colorIndex + 1) % this.displayColors.length
          this.deMechanics.push(newMechanic)

          this.sets.forEach(set => {
            var total = 0
            set.allMechanics.forEach(mechanic => {
              if(mechanic.name == key){
                newMechanic.byColor["w"] += mechanic.colors["w"]
                newMechanic.byColor["u"] += mechanic.colors["u"]
                newMechanic.byColor["b"] += mechanic.colors["b"]
                newMechanic.byColor["r"] += mechanic.colors["r"]
                newMechanic.byColor["g"] += mechanic.colors["g"]
                newMechanic.byColor["c"] += mechanic.colors["c"]
                total += mechanic.total
              }
            })
            newMechanic.bySet.push(total)
          })
        }
      })
    })
  }

  constructor(private googleSheetsDbService: GoogleSheetsDbService) {
    this.attemptLoadMechanics();
    var tCh: Chapter = {
      title: "Test title",
      author: "Test author",
      year: 10,
      chapterNumber: 15,
      chapterText:"Lorem ipsum"
    }
    console.log("H")
    console.log(tCh)
  }
}