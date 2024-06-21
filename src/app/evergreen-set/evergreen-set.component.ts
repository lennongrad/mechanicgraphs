import { Component, OnInit } from '@angular/core';
import { CardDataService, Mechanic } from '../card-data.service';


@Component({
  selector: 'app-evergreen-set',
  templateUrl: './evergreen-set.component.html',
  styleUrls: ['./evergreen-set.component.less']
})
export class EvergreenSetComponent implements OnInit {
  lastHovered?: string;
  selectedMechanics: Array<string> = []

  hover(mechanicName: string){
    this.lastHovered = mechanicName
    this.drawCanvas()
  }

  unhover(mechanicName: string){
    if(this.lastHovered == mechanicName){
      this.lastHovered = undefined
      this.drawCanvas()
    }
  }

  getMechanics(): Array<Mechanic>{
    return [];
    /*if(this.set?.mechanics == undefined){
      return []
    }
    return (this._sorted == "Deviation" ? this.set.mechanics : this.set.totalMechanics)*/
  }

  getCircleStyle(mechanic: Mechanic): any{
    if(this.selectedMechanics.includes(mechanic.name)){
      return {"borderColor": mechanic.displayColor.darkColor, "borderWidth": "2px"}
    }

    return {"backgroundColor": mechanic.displayColor.lightColor}
  }

  getStyleColorIcon(iconIndex: number): any{
    var xPosition = 0

    /*if(iconIndex != undefined){
        xPosition = this._buffer + ((this.width - this._buffer * 2) / 5) * iconIndex
    } */   

    return {'left': String(xPosition) + 'px'}
  }

  getMechanicTitle(mechanicName: string): string{
    var mechanicTitle = this.cardDataService.mechanicRules.get(mechanicName)
    return mechanicTitle ? mechanicTitle.name : mechanicName
  }

  getMechanicTooltip(mechanicName: string): string{
    var mechanicTitle = this.cardDataService.mechanicRules.get(mechanicName)
    return mechanicTitle ? mechanicTitle.scryfall : ""
  }

  selectMechanic(mechanicName: string, event: MouseEvent){
    if(event.ctrlKey){
      if(this.selectedMechanics.indexOf(mechanicName) == -1){
        this.getMechanics().forEach((mechanic: Mechanic) => {
          if(mechanic.name != mechanicName){
            this.selectedMechanics.push(mechanic.name)
          }
        })
      } else {
        this.selectedMechanics = []
      }
    } else {
      if(this.selectedMechanics.indexOf(mechanicName) != -1){
        this.selectedMechanics = this.selectedMechanics.filter((name: string) => name != mechanicName)
      } else {
        this.selectedMechanics.push(mechanicName)
      }
    }
    this.drawCanvas()
  }

  rightClick(mechanic: Mechanic){
    var mechanicQuery = this.cardDataService.mechanicRules.get(mechanic.name)?.scryfall

    if(mechanicQuery != undefined){
      window.open("https://scryfall.com/search?q=" + mechanicQuery, '_blank');
    }
  }

  drawCanvas(){

  }

  constructor(private cardDataService: CardDataService) { }

  ngOnInit(): void {
  }

}
