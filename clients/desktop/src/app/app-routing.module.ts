import {NgModule}             from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RegisterComponent}    from './auth/register/register.component';
import {LoginComponent}       from './auth/login/login.component';
import {ChatViewComponent}    from './chat-view/chat-view.component';
import {ChatAppComponent}     from './chat-app/chat-app.component';
import {ForgotPasswordComponent} from "./auth/forgot-password/forgot-password.component";

const routes: Routes = [
  {
    path:       '',
    redirectTo: 'register',
    pathMatch:  'full',
  },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'chatview/:id', component: ChatViewComponent},
  {path: 'chap-app', component: ChatAppComponent}
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
