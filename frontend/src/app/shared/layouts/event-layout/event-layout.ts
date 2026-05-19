import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';

@Component({
  selector: 'app-event-layout',
  imports: [RouterOutlet, RouterLink, Navbar],
  templateUrl: './event-layout.html',
})
export class EventLayout {}
