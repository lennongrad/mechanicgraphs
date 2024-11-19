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

  rightClick(mechanic: Mechanic){
    var mechanicQuery = this.cardDataService.mechanicRules.get(mechanic.name)?.scryfall

    if(mechanicQuery != undefined){
      window.open("https://scryfall.com/search?q=s:" + this.set?.setCode + " " + mechanicQuery, '_blank');
    }
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
  
  /**
   * Draws a canvas graph showing the difference in prevalence of mechanics in certain groups.
   * The graph is drawn using the canvas context, width, height, and colors defined in the class.
   * It takes into account the selected mechanics and adjusts the graph accordingly.
   *
   * Edge cases:
   * - If the canvas context or set is not defined, the function returns early without drawing anything.
   * - If there are no active mechanics, the function will not draw any shapes.
   * - If the greatest value in accumulatedColors is 0, the yPosition calculation will result in NaN, causing the vertices to be incorrect.
   *   This can be mitigated by adding a check before calculating yPosition and handling the case when greatestValue is 0.
   */
  drawCanvas() {
    // Early return if canvasContext or set is not defined
    if (!this.canvasContext || !this.set) {
      return;
    }

    // Filter mechanics that are not in the selectedMechanics array
    const activeMechanics = this.getMechanics().filter((mechanic: Mechanic) => !this.selectedMechanics.includes(mechanic.name));

    // Clear the canvas before drawing new shapes
    this.canvasContext.clearRect(0, 0, this.width, this.height);

    // Initialize accumulatedColors object to keep track of the sum of colors for each mechanic
    const accumulatedColors = { w: 0, u: 0, b: 0, r: 0, g: 0, c: 0 };

    // Iterate over activeMechanics and update accumulatedColors
    activeMechanics.forEach(mechanic => {
      this.colors.forEach(color => {
        accumulatedColors[color] += mechanic.colors[color] + this.yBuffer;
      });
    });

    // Calculate the greatest value in accumulatedColors
    const greatestValue = Math.max(...Object.values(accumulatedColors));

    // Initialize lastStroked to false
    let lastStroked = false;

    // Iterate over activeMechanics and draw shapes
    activeMechanics.forEach(mechanic => {
      // Calculate vertices for the current mechanic
      const vertices = this.colors.map((color, index) => ({
        x: this._buffer + ((this.width - this._buffer * 2) / 5) * index,
        y: this.height - ((accumulatedColors[color] / greatestValue) * (this.height - 10)),
      }));

      // Add start and end points to vertices
      vertices.unshift({ x: 0, y: this.height });
      vertices.push({ x: this.width, y: this.height });

      // Set fillStyle based on mechanic name and lastHovered value
      this.canvasContext!.fillStyle = mechanic.name === this.lastHovered ? mechanic.displayColor.darkColor : mechanic.displayColor.lightColor;

      // Draw the filled shape using the vertices
      this.canvasContext!.beginPath();
      vertices.forEach(({ x, y }) => this.canvasContext!.lineTo(x, y));
      this.canvasContext!.closePath();
      this.canvasContext!.fill();

      // Draw the stroked shape if mechanic name matches lastHovered or lastStroked is true
      if (mechanic.name === this.lastHovered || lastStroked) {
        this.canvasContext!.beginPath();
        vertices.forEach(({ x, y }) => this.canvasContext!.lineTo(x, y));
        this.canvasContext!.closePath();
        this.canvasContext!.stroke();
      }

      // Update lastStroked based on mechanic name and lastHovered value
      lastStroked = mechanic.name === this.lastHovered;

      // Update accumulatedColors for the next iteration
      this.colors.forEach(color => {
        accumulatedColors[color] -= mechanic.colors[color] + this.yBuffer;
      });
    });

    // Set colors and lineWidth based on hoveredColor and _bars value
    const hoveredBarColor = this._bars === "Light" ? "#111" : this._bars === "Dark" ? "#000" : "#333";
    const unhoveredBarColor = this._bars === "Light" ? "#444" : this._bars === "Dark" ? "#111" : "#fff";
    const hoveredBarThickness = this._bars === "Light" ? 0.75 : this._bars === "Dark" ? 0.95 : 0.5;
    const unhoveredBarThickness = this._bars === "Light" ? 0.5 : this._bars === "Dark" ? 0.75 : 0.1;

    // Draw vertical lines for each color
    for (let i = 0; i < 6; i++) {
      this.canvasContext.strokeStyle = this.hoveredColor === i ? hoveredBarColor : unhoveredBarColor;
      this.canvasContext.lineWidth = this.hoveredColor === i ? hoveredBarThickness : unhoveredBarThickness;

      // Only draw the line if the lineWidth is greater than 0.2
      if (this.canvasContext.lineWidth > 0.2) {
        this.canvasContext.beginPath();
        this.canvasContext.moveTo(this._buffer + ((this.width - this._buffer * 2) / 5) * i, this.height);
        this.canvasContext.lineTo(this._buffer + ((this.width - this._buffer * 2) / 5) * i, 0);
        this.canvasContext.closePath();
        this.canvasContext.stroke();
      }
    }

    // Reset lineWidth and strokeStyle for future drawings
    this.canvasContext.lineWidth = 1;
    this.canvasContext.strokeStyle = 'black';
  }

  ngOnInit(): void {
    var canvasElement = this.canvas.nativeElement

    if(canvasElement != null && canvasElement.getContext){
      this.canvasContext = canvasElement.getContext("2d");


      this.drawCanvas();
    }
  }

}
