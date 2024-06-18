import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { CardDataService, Mechanic, Set, mtgColor } from '../card-data.service';
import { barsType, divisionType, sortedType } from '../graph-list/graph-list.component';


@Component({
  selector: 'app-set-graph',
  templateUrl: './set-graph.component.html',
  styleUrls: ['./set-graph.component.less']
})
export class SetGraphComponent implements OnInit {

  @Input() set?: Set;

  _sorted: sortedType = "Deviation"
  @Input() set sorted(value: sortedType){
    this._sorted = value
    this.drawCanvas()
  }

  _division: divisionType = "None"
  @Input() set division(value: divisionType){
    this._division = value
  }

  _buffer: number = 10
  @Input() set buffer(value: number){
    this._buffer = value * .99
    this.drawCanvas()
  }

  _bars: barsType = "Light"
  @Input() set bars(value: barsType){
    this._bars = value
    this.drawCanvas()
  }

  @ViewChild("chartCanvas", {static: true})
  canvas!: ElementRef;

  canvasContext!: CanvasRenderingContext2D | null;

  width = 180;
  height = 180;
  yBuffer = 0

  lastHovered?: string;

  colorIcons = new Map<mtgColor, string>([
    ["w", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/8/8e/W.svg'],
    ["u", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/9/9f/U.svg/'],
    ["b", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/2/2f/B.svg'],
    ["r", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/8/87/R.svg'],
    ["g", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/8/88/G.svg'],
    ["c", 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/1/1a/C.svg']
  ])

  colors: Array<mtgColor> = ["w", "u", "b", "r", "g", "c"]

  lastClickedColor?: number
  hoveredColor?: number

  selectedMechanics: Array<string> = []

  constructor(private cardDataService: CardDataService) { }

  rightClick(mechanic: Mechanic){
    var mechanicQuery = this.cardDataService.mechanicRules.get(mechanic.name)?.scryfall

    if(mechanicQuery != undefined){
      window.open("https://scryfall.com/search?q=s:" + this.set?.setCode + " " + mechanicQuery, '_blank');
    }
  }

  hoverColor(colorIndex: number){
    this.hoveredColor = colorIndex
    this.drawCanvas()
  }

  unhoverColor(colorIndex: number){
    if(this.hoveredColor == colorIndex){
      this.hoveredColor = undefined
      this.drawCanvas()
    }
  }

  clickColor(colorIndex: number){
    if(this.lastClickedColor == undefined){
      this.lastClickedColor = colorIndex
    } else if(this.lastClickedColor != colorIndex){
      var holder = this.colors[this.lastClickedColor]
      this.colors[this.lastClickedColor] = this.colors[colorIndex]
      this.colors[colorIndex] = holder

      this.drawCanvas()

      this.lastClickedColor = undefined
    } else {
      this.lastClickedColor = undefined
    }
  }

  getCircleStyle(mechanic: Mechanic): any{
    if(this.selectedMechanics.includes(mechanic.name)){
      return {"borderColor": mechanic.displayColor.darkColor, "borderWidth": "2px"}
    }

    return {"backgroundColor": mechanic.displayColor.lightColor}
  }

  getStyleColorIcon(iconIndex: number): any{
    var xPosition = 0

    if(iconIndex != undefined){
        xPosition = this._buffer + ((this.width - this._buffer * 2) / 5) * iconIndex
    }    

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
        this.set?.mechanics.forEach((mechanic: Mechanic) => {
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
    if(this.set?.mechanics == undefined){
      return []
    }
    return (this._sorted == "Deviation" ? this.set.mechanics : this.set.totalMechanics)
  }

  drawCanvas(){
    if(this.canvasContext == null || this.set == undefined){
      return;
    }

    var activeMechanics = this.getMechanics().filter((mechanic: Mechanic) => !this.selectedMechanics.includes(mechanic.name))

    this.canvasContext.clearRect(0,0,this.width,this.height)

    var accumulatedColors = {"w": 0, "u": 0, "b": 0, "r": 0, "g": 0, "c": 0}

    activeMechanics.forEach(mechanic => {
      this.colors.forEach(color => {
        accumulatedColors[color] += mechanic.colors[color] + this.yBuffer
      })
    })

    var greatestValue = Math.max(accumulatedColors["w"], accumulatedColors["u"], accumulatedColors["b"], accumulatedColors["r"], accumulatedColors["g"], accumulatedColors["c"])

    var lastStroked = false

    activeMechanics.forEach(mechanic => {
      // find vertices to tracec
      var vertices: Array<{x: number,y:number}> = []
      var accumulatedXPosition = this._buffer
      vertices.push({x: 0, y: this.height})
      this.colors.forEach(color => {
        var yPosition = (accumulatedColors[color] / greatestValue) * (this.height - 10)

        vertices.push({x: accumulatedXPosition, y: this.height - yPosition});

        accumulatedXPosition += (this.width - this._buffer * 2) / 5
        accumulatedColors[color] -= mechanic.colors[color] + this.yBuffer
      })
      vertices.push({x: this.width, y: this.height})
      vertices.push({x: 0, y: this.height})


      this.canvasContext!.fillStyle = mechanic.name == this.lastHovered ? mechanic.displayColor.darkColor : mechanic.displayColor.lightColor;

      // fill in 
      this.canvasContext!.beginPath();
      this.canvasContext!.moveTo(vertices[0].x, vertices[0].y)
      vertices.slice(1).forEach(vertex => {
        this.canvasContext!.lineTo(vertex.x, vertex.y)
      })
      this.canvasContext!.closePath();
      this.canvasContext!.fill();

      // if need to stroke
      if(mechanic.name == this.lastHovered || lastStroked){
        this.canvasContext!.beginPath();
        this.canvasContext!.moveTo(vertices[0].x, vertices[0].y)
        vertices.slice(1).forEach(vertex => {
          this.canvasContext!.lineTo(vertex.x, vertex.y)
        })
        this.canvasContext!.closePath();
        this.canvasContext!.stroke();
      }

      lastStroked = mechanic.name == this.lastHovered 
    })

    var hoveredBarColor = this._bars == "Light" ? "#111" : (this._bars == "Dark" ? "#000" : "#333") 
    var unhoveredBarColor = this._bars == "Light" ? "#444" : (this._bars == "Dark" ? "#111" : "#fff")
    var hoveredBarThickness = this._bars == "Light" ? .75 : (this._bars == "Dark" ? .95 : .5)
    var unhoveredBarThickness = this._bars == "Light" ? .5 : (this._bars == "Dark" ? .75 : .1)

    // draw lines
    var accumulatedXPosition = this._buffer
    for(var i = 0; i < 6; i++){
      this.canvasContext!.strokeStyle = this.hoveredColor == i ? hoveredBarColor : unhoveredBarColor;
      this.canvasContext!.lineWidth = this.hoveredColor == i ? hoveredBarThickness : unhoveredBarThickness;

      if(this.canvasContext!.lineWidth > .2){
        this.canvasContext!.beginPath();
        this.canvasContext!.moveTo(accumulatedXPosition, this.height)
        this.canvasContext!.lineTo(accumulatedXPosition, 0)
        this.canvasContext!.closePath();
        this.canvasContext!.stroke();
      }
      accumulatedXPosition += (this.width - this._buffer * 2) / 5
    }
    this.canvasContext!.lineWidth = 1;
    this.canvasContext!.strokeStyle = 'black';
  }

  ngOnInit(): void {
    var canvasElement = this.canvas.nativeElement

    if(canvasElement != null && canvasElement.getContext){
      this.canvasContext = canvasElement.getContext("2d");


      this.drawCanvas();
    }
  }

}
