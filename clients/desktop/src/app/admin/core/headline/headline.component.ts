import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import { Input } from '@angular/core';
import {emit} from 'cluster';

@Component({
  selector: 'app-headline',
  templateUrl: './headline.component.html',
  styleUrls: ['./headline.component.scss']
})
export class HeadlineComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

  @Input() headerText = ''
  @Input() showSave = false
  @Input() saveFn = () => {}
  @Input() revertFn = () => {}
  @Output() revert: EventEmitter<any> = new EventEmitter<any>()
  @Output() save: EventEmitter<any> = new EventEmitter<any>()

  public doRevert(): void {
    this.revert.emit(null);
  }

  public doSave(): void {
    this.save.emit(null);
  }

}
