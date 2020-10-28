import 'reflect-metadata';
import '../polyfills';

import {BrowserModule}                from '@angular/platform-browser';
import {NgModule}                     from '@angular/core';
import {FormsModule}                  from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {CoreModule}                   from './core/core.module';

import {AppRoutingModule} from './app-routing.module';

// NG Translate
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader}              from '@ngx-translate/http-loader';

import {AppComponent}            from './app.component';
import {LoginComponent}          from './auth/login/login.component';
import {RegisterComponent}       from './auth/register/register.component';
import {ChatListComponent}       from './chat-list/chat-list.component';
import {HeaderComponent}         from './header/header.component';
import {MatButtonModule}         from '@angular/material/button';
import {MatToolbarModule}        from '@angular/material/toolbar';
import {MatIconModule}           from '@angular/material/icon';
import {MatSidenavModule}        from '@angular/material/sidenav';
import {MatListModule}           from '@angular/material/list';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FooterComponent}         from './footer/footer.component';
import {MatInputModule}          from '@angular/material/input';
import {ChatBubbleComponent}     from './utils/chat-bubble/chat-bubble.component';
import {ChatViewComponent}       from './chat-view/chat-view.component';
import {ChatAppComponent}        from './chat-app/chat-app.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { SettingsViewComponent } from './admin/settings-view/settings-view.component';
import { NavigationContainerComponent } from './admin/SideNav/navigation-container/navigation-container.component';
import { NavigationItemComponent } from './admin/SideNav/navigation-item/navigation-item.component';
import { MatDividerModule } from '@angular/material/divider';
import { SecurityComponent } from './admin/security/security.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { CreateInviteComponent } from './admin/usersManagement/create-invite/create-invite.component';
import { ReportSettingsComponent } from './admin/usersManagement/report-settings/report-settings.component';
import { ReportedUsersComponent } from './admin/usersManagement/reported-users/reported-users.component';
import { BlockedUsersComponent } from './admin/usersManagement/blocked-users/blocked-users.component';
import { UsersComponent } from './admin/usersManagement/users/users.component';
import { HeadlineComponent } from './admin/core/headline/headline.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatCheckboxModule} from '@angular/material/checkbox';

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    ChatListComponent,
    HeaderComponent,
    FooterComponent,
    ChatBubbleComponent,
    ChatViewComponent,
    ChatAppComponent,
    SidenavComponent,
    ForgotPasswordComponent,
    SettingsViewComponent,
    NavigationContainerComponent,
    NavigationItemComponent,
    SecurityComponent,
    DashboardComponent,
    CreateInviteComponent,
    ReportSettingsComponent,
    ReportedUsersComponent,
    BlockedUsersComponent,
    UsersComponent,
    HeadlineComponent],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatDividerModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatCheckboxModule
  ],
  providers:    [],
  bootstrap:    [AppComponent],
})
export class AppModule {
}
