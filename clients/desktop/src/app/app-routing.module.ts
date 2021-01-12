import {Routes, RouterModule}    from '@angular/router';
import {CallFunctionComponent}   from './voice-communication/call-function/call-function.component';
import {ChatAppComponent}        from './chat-app/chat-app.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {LoginComponent}          from './auth/login/login.component';
import {LogoutComponent}         from './auth/logout/logout.component';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule}                from '@angular/core';
import {RegisterComponent}       from './auth/register/register.component';
import {MicrophoneTestComponent} from './microphone-test/microphone-test.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'chat-app', redirectTo: 'chat-app/', pathMatch: 'full'},
  {path: 'chat-app/:username', component: ChatAppComponent},
  {path: 'call-function', component: CallFunctionComponent},
  {path: 'microphone-test', component: MicrophoneTestComponent}
  // {
  //   path: '**',
  //   component: PageNotFoundComponent
  // }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes),
  ],
  exports: [RouterModule],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppRoutingModule {
}
