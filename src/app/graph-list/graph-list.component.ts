import { Component, OnInit } from '@angular/core';
import { CardDataService, Set, SetCollection } from '../card-data.service';
import { SelectControlValueAccessor } from '@angular/forms';

export type sortedType = "Deviation" | "Total"
export type barsType = "Light" | "Dark" | "Hidden"
export type divisionType = "None" | "Year" | "Block"


@Component({
  selector: 'app-graph-list',
  templateUrl: './graph-list.component.html',
  styleUrls: ['./graph-list.component.less']
})
export class GraphListComponent implements OnInit {

  sorted: sortedType = "Deviation"
  bars: barsType = "Light"
  division: divisionType = "Year"

  buffer = 10
  buffer_value = 10

  hints = false

  bufferKeyUp(){
    if(!isNaN(Number(this.buffer)) && Number(this.buffer) <= 50 && Number(this.buffer) >= 0){
      this.buffer_value = Number(this.buffer)
    }
    this.buffer = this.buffer_value
  }

  clickSorted(v: sortedType){
    this.sorted = v
  }

  getSets(y: SetCollection): Array<Set>{
    return y.sets.filter((set) => set.total > 0);
  }

  clickBars(v: barsType){
    this.bars = v
  }

  clickDivision(v: divisionType){
    this.division = v
  }

  getSetsByYear(): Array<SetCollection>{
    if(this.division == "None"){
      return this.cardDataService.setsUndivided
    }
    if(this.division == "Block"){
      return this.cardDataService.setsByBlock
    }
    return this.cardDataService.setsByYear
  }

  constructor(private cardDataService: CardDataService) { }

  ngOnInit(): void {
  }

}
