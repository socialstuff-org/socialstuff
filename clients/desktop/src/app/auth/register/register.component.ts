import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  public username = '';
  public password = '';
  public password_confirm = '';
  public hostname = '127.0.0.1';
  public port = 8080;

  constructor() { }

  ngOnInit(): void {
  }

  public register() {
    // TODO
  }

}
