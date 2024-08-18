import { Component, OnInit } from '@angular/core';
import { CardDataService, DEMechanic, Mechanic } from '../card-data.service';


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

  getMechanics(): Array<DEMechanic>{
    return this.cardDataService.deMechanics;
  }

  getCircleStyle(mechanic: DEMechanic): any{
    if(this.selectedMechanics.includes(mechanic.mechanicRule.name)){
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
        this.getMechanics().forEach((mechanic: DEMechanic) => {
          if(mechanic.mechanicRule.name != mechanicName){
            this.selectedMechanics.push(mechanic.mechanicRule.name)
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

  rightClick(mechanic: DEMechanic){
    var mechanicQuery = mechanic.mechanicRule.scryfall

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
