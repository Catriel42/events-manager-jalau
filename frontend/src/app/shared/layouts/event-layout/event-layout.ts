import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-event-layout',
  imports: [RouterOutlet, Navbar],
  templateUrl: './event-layout.html',
})
export class EventLayout {}
