import { TestBed } from '@angular/core/testing';
import { DOCUMENT } from '@angular/common';
import { QAnalyticsService } from './qanalytics-service.service';


const myObject = {
  someValue: 5, 
};

const spy = jest.spyOn(myObject, 'someValue'); // This will trigger the error