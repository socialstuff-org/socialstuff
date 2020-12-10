import { Component, OnInit } from '@angular/core';
import {TranslateService}    from "@ngx-translate/core";

@Component({
  selector: 'app-languageselect',
  templateUrl: './languageselect.component.html',
  styleUrls: ['./languageselect.component.scss']
})
export class LanguageselectComponent implements OnInit {

  constructor(
    public translate: TranslateService,
  ) { }

  ngOnInit(): void {
  }

}
