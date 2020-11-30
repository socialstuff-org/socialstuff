import { Component, OnInit } from '@angular/core';
import {DebugService}        from '../services/debug.service';

@Component({
  selector: 'app-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent implements OnInit {

  constructor(
    private debug: DebugService
  ) { }

  ngOnInit(): void {
    this.debug.loadSession();
  }

}
