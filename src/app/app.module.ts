import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';import { TestThingModule } from './test-thing/test-thing.module'; 

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, TestThingModule],
  bootstrap: [AppComponent],
})
export class AppModule {}
