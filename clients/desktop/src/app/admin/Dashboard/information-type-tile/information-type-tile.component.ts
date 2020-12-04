import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-information-type-tile',
  templateUrl: './information-type-tile.component.html',
  styleUrls: ['./information-type-tile.component.scss']
})
export class InformationTypeTileComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() tileInformation = {name: '', id: '', amount: 0};
  @Input() active = false;

}
