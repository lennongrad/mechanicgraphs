import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { SetGraphComponent } from './set-graph/set-graph.component';
import { GraphListComponent } from './graph-list/graph-list.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { API_KEY } from 'ng-google-sheets-db';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    SetGraphComponent,
    GraphListComponent,
    SidebarComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule
  ],
  providers: [{
    provide: API_KEY,
    useValue: "AIzaSyByA4ztVKLlcRdVgtoroqy1ltLoX8uGNxU"
  }],
  bootstrap: [AppComponent]
})
export class AppModule { }
