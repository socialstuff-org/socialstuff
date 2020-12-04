import {NgModule}             from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {RegisterComponent}    from './auth/register/register.component';
import {LoginComponent}       from './auth/login/login.component';
import {ChatViewComponent}    from './chat-view/chat-view.component';
import {ChatAppComponent}     from './chat-app/chat-app.component';
import {ForgotPasswordComponent} from './auth/forgot-password/forgot-password.component';
import {SettingsViewComponent} from './admin/settings-view/settings-view.component';
import {SecurityComponent} from './admin/security/security.component';
import {CreateInviteComponent} from './admin/usersManagement/CreateInvites/create-invite/create-invite.component';
import {UsersComponent} from './admin/usersManagement/users/users.component';
import {ReportSettingsComponent} from './admin/usersManagement/ReportSystem/ReportSettings/report-settings/report-settings.component';
import {ReportedUsersComponent} from './admin/usersManagement/ReportSystem/ReportedUsers/reported-users/reported-users.component';
import {BlockedUsersComponent} from './admin/usersManagement/blocked-users/blocked-users.component';
import {LogoutComponent} from './auth/logout/logout.component';
import {LandingComponent} from './landing/landing.component';
import {DashboardViewComponent} from './admin/Dashboard/dashboard-view/dashboard-view.component';
import {CallFunctionComponent}   from './voice-communication/call-function/call-function.component';
import {MicrophoneTestComponent} from './microphone-test/microphone-test.component';

export const routesChat: Routes = [
  {
    path:       '',
    redirectTo: 'login',
    pathMatch:  'full',
  },
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'forgot-password', component: ForgotPasswordComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'landing', component: LandingComponent},
  {path: 'chatview/:id', component: ChatViewComponent},
  {path: 'chap-app', component: ChatAppComponent},
  {path: 'call-function', component: CallFunctionComponent},
  {path: 'microphone-test', component: MicrophoneTestComponent}
  // {
  //   path: '**',
  //   component: PageNotFoundComponent
  // }
];

export const routesSettings: Routes = [
  {
    path: '',
    component: SettingsViewComponent,
    children: [
      {
        path: '',
        component: DashboardViewComponent,
        data: {
          name: 'Dashboard',
          icon: 'dashboard'
        }
      },
      {
        path: 'security',
        component: SecurityComponent,
        data: {
          name: 'Security',
          icon: 'https'
        }
      },
      {
        path: 'users',
        redirectTo: 'users/create-invite',
        data: {
          ignore: true
        }
      },
      {
        path: 'users',
        component: UsersComponent,
        data: {
          name: 'Users',
          icon: 'people'
        },
        children: [
          {
            path: 'create-invite',
            component: CreateInviteComponent,
            data: {
              name: 'Create Invite',
              icon: 'add_to_que',
              parent: 'users'
            },
          },
          {
            path: 'report-settings',
            component: ReportSettingsComponent,
            data: {
              name: 'Report Settings',
              icon: 'how_to_reg',
              parent: 'users'
            }
          },
          {
            path: 'reported-users',
            component: ReportedUsersComponent,
            data: {
              name: 'Reported Users',
              icon: 'report',
              parent: 'users'
            }
          },
          {
            path: 'blocked-users',
            component: BlockedUsersComponent,
            data: {
              name: 'Blocked Users',
              icon: 'block',
              parent: 'users'
            }
          },
        ]
      },
    ]
  },
];

const routes = routesChat.concat(routesSettings);

@NgModule({
  imports: [
    RouterModule.forRoot(routesSettings),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
