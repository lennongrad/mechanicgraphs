import { Component, OnInit } from '@angular/core';
import { ActiveScreenService } from './active-screen.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  title = 'mechanic-graphs';
  coverActive = true

  getActiveScreen(){
    return this.activeScreenService.activeScreen
  }

  constructor(private activeScreenService: ActiveScreenService){}

  ngOnInit(): void {  
                      
  }
}
