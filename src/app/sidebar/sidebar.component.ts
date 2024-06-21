import { Component, OnInit } from '@angular/core';
import { ActiveScreenService, ScreenVisible } from '../active-screen.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.less']
})
export class SidebarComponent implements OnInit {

  constructor(private activeScreenService: ActiveScreenService) { }

  getActiveScreen(){
    return this.activeScreenService.activeScreen
  }

  setActiveScreen(newActive: ScreenVisible){
    this.activeScreenService.setActiveScreen(newActive)
  }

  ngOnInit(): void {
  }
}
