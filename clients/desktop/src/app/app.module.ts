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
import { SidenavComponent }        from './sidenav/sidenav.component';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password.component';
import { ContactInfoComponent }    from './contact-info/contact-info.component';
import {MatDialogModule}           from "@angular/material/dialog";
import {MatCheckboxModule}         from "@angular/material/checkbox";
import { LogoutComponent }         from './auth/logout/logout.component';
import {ScrollingModule}           from "@angular/cdk/scrolling";
import { MessageBoxComponent }     from './message-box/message-box.component';
import {CallFunctionComponent}     from './voice-communication/call-function/call-function.component';
import { MicrophoneTestComponent } from './microphone-test/microphone-test.component';
import {MatMenuModule}             from "@angular/material/menu";
import { LanguageselectComponent } from './utils/languageselect/languageselect.component';
import { ParticlesComponent }      from './utils/particles/particles.component';
import { LoadingComponent }        from './utils/loading/loading.component';
import { VoiceMessageComponent }   from './message-box/voice-message/voice-message.component';
import {MatTooltipModule}          from "@angular/material/tooltip";
import { UpdateDisplayNameComponent } from './dialogs/update-display-name/update-display-name.component';

import { SettingsViewComponent } from './admin/settings-view/settings-view.component';
import { NavigationContainerComponent } from './admin/SideNav/navigation-container/navigation-container.component';
import { NavigationItemComponent } from './admin/SideNav/navigation-item/navigation-item.component';
import { MatDividerModule } from '@angular/material/divider';
import { SecurityComponent } from './admin/security/security.component';
import { CreateInviteComponent } from './admin/UsersManagement/CreateInvites/create-invite/create-invite.component';
import { ReportSettingsComponent } from './admin/UsersManagement/ReportSystem/ReportSettings/report-settings/report-settings.component';
import { ReportedUsersComponent } from './admin/UsersManagement/ReportSystem/ReportedUsers/reported-users/reported-users.component';
import { BlockedUsersComponent } from './admin/UsersManagement/blocked-users/blocked-users.component';
import { UsersComponent } from './admin/UsersManagement/users/users.component';
import { HeadlineComponent } from './admin/core/headline/headline.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import { CreateNewInviteComponent } from './admin/UsersManagement/CreateInvites/create-new-invite/create-new-invite.component';
import { InviteCodeListComponent } from './admin/UsersManagement/CreateInvites/InviteCodeList/invite-code-list/invite-code-list.component';
import { InviteCodeRowComponent } from './admin/UsersManagement/CreateInvites/InviteCodeList/invite-code-row/invite-code-row.component';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import {
  NgxMatDatetimePickerModule, NgxMatNativeDateModule,
  NgxMatTimepickerModule,
  NgxNativeDateModule
} from '@angular-material-components/datetime-picker';
import { ReportReasonsComponent } from './admin/UsersManagement/ReportSystem/ReportSettings/ReportReasons/report-reasons/report-reasons.component';
import { ReportReasonEntryComponent } from './admin/UsersManagement/ReportSystem/ReportSettings/ReportReasons/report-reason-entry/report-reason-entry.component';
import { ReportListComponent } from './admin/UsersManagement/ReportSystem/ReportedUsers/ReportList/report-list/report-list.component';
import { ReportRowComponent } from './admin/UsersManagement/ReportSystem/ReportedUsers/ReportList/report-row/report-row.component';
import { ReasonsForReportComponent } from './admin/UsersManagement/ReportSystem/ReportedUsers/ReportList/reasons-for-report/reasons-for-report.component';
import { InformationTypeTileComponent } from './admin/Dashboard/information-type-tile/information-type-tile.component';
import { DashboardViewComponent } from './admin/Dashboard/dashboard-view/dashboard-view.component';
import { ConfirmDialogComponent } from './admin/core/confirm-dialog/confirm-dialog.component';
import {InlineSVGModule} from "ng-inline-svg";

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    HeaderComponent,
    FooterComponent,
    ChatBubbleComponent,
    ChatViewComponent,
    ChatAppComponent,
    SidenavComponent,
    ForgotPasswordComponent,
    ContactInfoComponent,
    LogoutComponent,
    MessageBoxComponent,
    SettingsViewComponent,
    NavigationContainerComponent,
    NavigationItemComponent,
    SecurityComponent,
    CreateInviteComponent,
    ReportSettingsComponent,
    ReportedUsersComponent,
    BlockedUsersComponent,
    UsersComponent,
    HeadlineComponent,
    CreateNewInviteComponent,
    InviteCodeListComponent,
    InviteCodeRowComponent,
    ReportReasonsComponent,
    ReportReasonEntryComponent,
    ReportListComponent,
    ReportRowComponent,
    ReasonsForReportComponent,
    InformationTypeTileComponent,
    DashboardViewComponent,
    ConfirmDialogComponent,
    CallFunctionComponent,
    MicrophoneTestComponent,
    LanguageselectComponent,
    ParticlesComponent,
    LoadingComponent,
    VoiceMessageComponent,
    UpdateDisplayNameComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule,
    CoreModule,
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide:    TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps:       [HttpClient],
      },
    }),
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    BrowserAnimationsModule,
    MatInputModule,
    MatDialogModule,
    MatCheckboxModule,
    ScrollingModule,
    MatMenuModule,
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
    MatDialogModule,
    MatGridListModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    ScrollingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxMatDatetimePickerModule,
    NgxMatTimepickerModule,
    NgxNativeDateModule,
    NgxMatNativeDateModule,
    InlineSVGModule,
    MatTooltipModule,
  ],
  providers:    [],
  bootstrap:    [AppComponent],
})
export class AppModule {
}
