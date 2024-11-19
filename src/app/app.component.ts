import { Component, OnInit } from '@angular/core';
import { ActiveScreenService } from './active-screen.service';

// Define an interface for a Stock
interface Stock {
  symbol: string; // Stock symbol (e.g., 'AAPL' for Apple)
  name: string; // Stock name
  currentPrice: number; // Current price of the stock
  history: PriceHistory[]; // Price history of the stock
}

// Define a type for the price history, which includes date and price
type PriceHistory = {
  date: Date;
  price: number;
};

// Define a class to manage the stocks
class StockMarket {
  private stocks: { [symbol: string]: Stock };

  constructor() {
      this.stocks = {};
  }

  // Add a new stock to the data structure
  addStock(symbol: string, name: string): void {
      if (!this.stocks[symbol]) {
          this.stocks[symbol] = {
              symbol,
              name,
              currentPrice: 0,
              history: []
          };
      }
  }

  // Update the current price of a stock
  updateStockPrice(symbol: string, price: number): void {
      if (this.stocks[symbol]) {
          this.stocks[symbol].currentPrice = price;
          this.stocks[symbol].history.push({ date: new Date(), price });
      }
  }

  // Get the current price of a stock
  getStockPrice(symbol: string): number | undefined {
      return this.stocks[symbol]?.currentPrice;
  }

  // Get the price history of a stock
  getStockHistory(symbol: string): PriceHistory[] | undefined {
      return this.stocks[symbol]?.history;
  }

  // List all stocks
  listStocks(): Stock[] {
      return Object.values(this.stocks);
  }
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent implements OnInit{
  title = 'mechanic-graphs';
  coverActive = true;

  getActiveScreen(){
    return this.activeScreenService.activeScreen
  }

  constructor(private activeScreenService: ActiveScreenService){}

  ngOnInit(): void {  
    setTimeout(() => {this.coverActive = false}, 300);
  }
}
