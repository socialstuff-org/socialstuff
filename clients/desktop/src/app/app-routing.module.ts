import {Routes, RouterModule} from '@angular/router';
import {CallFunctionComponent} from './voice-communication/call-function/call-function.component';
import {ChatAppComponent} from './chat-app/chat-app.component';
import {ChatViewComponent} from './chat-view/chat-view.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {LandingComponent} from './landing/landing.component';
import {LoginComponent} from './auth/login/login.component';
import {LogoutComponent} from './auth/logout/logout.component';
import {NgModule} from '@angular/core';
import {RegisterComponent} from './auth/register/register.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'chatview/1',
    pathMatch: 'full',
  },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'landing', component: LandingComponent},
  {path: 'chatview/:id', component: ChatViewComponent},
  {path: 'chap-app', component: ChatAppComponent},
  {path: 'call-function', component: CallFunctionComponent}
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
})
export class AppRoutingModule {
}
