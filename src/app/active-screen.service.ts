import { Injectable } from '@angular/core';

export type ScreenVisible = "Set" | "EvergreenSet" | "EvergreenColor" | "Misc"

@Injectable({
  providedIn: 'root'
})
export class ActiveScreenService {
  activeScreen: ScreenVisible = "EvergreenSet"

  setActiveScreen(newActive: ScreenVisible){
    this.activeScreen = newActive
  }

  constructor() { }
}
