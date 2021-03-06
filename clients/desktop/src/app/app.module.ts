import 'reflect-metadata';
import '../polyfills';

import {BrowserModule}                from '@angular/platform-browser';
import {CUSTOM_ELEMENTS_SCHEMA, NgModule}                     from '@angular/core';
import {FormsModule}                  from '@angular/forms';
import {HttpClientModule, HttpClient} from '@angular/common/http';
import {CoreModule}                   from './core/core.module';

import {AppRoutingModule} from './app-routing.module';

// NG Translate
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader}              from '@ngx-translate/http-loader';

import {AppComponent}               from './app.component';
import {LoginComponent}             from './auth/login/login.component';
import {RegisterComponent}          from './auth/register/register.component';
import {HeaderComponent}            from './header/header.component';
import {MatButtonModule}            from '@angular/material/button';
import {MatToolbarModule}           from '@angular/material/toolbar';
import {MatIconModule}              from '@angular/material/icon';
import {MatSidenavModule}           from '@angular/material/sidenav';
import {MatListModule}              from '@angular/material/list';
import {BrowserAnimationsModule}    from '@angular/platform-browser/animations';
import {FooterComponent}            from './footer/footer.component';
import {MatInputModule}             from '@angular/material/input';
import {ChatBubbleComponent}        from './utils/chat-bubble/chat-bubble.component';
import {ChatViewComponent}          from './chat-view/chat-view.component';
import {ChatAppComponent}           from './chat-app/chat-app.component';
import {SidenavComponent}           from './sidenav/sidenav.component';
import {ForgotPasswordComponent}    from './auth/forgot-password/forgot-password.component';
import {ContactInfoComponent}       from './contact-info/contact-info.component';
import {MatDialogModule}            from '@angular/material/dialog';
import {MatCheckboxModule}          from '@angular/material/checkbox';
import {LogoutComponent}            from './auth/logout/logout.component';
import {ScrollingModule}            from '@angular/cdk/scrolling';
import {MessageBoxComponent}        from './message-box/message-box.component';
import {CallFunctionComponent}      from './voice-communication/call-function/call-function.component';
import {MicrophoneTestComponent}    from './microphone-test/microphone-test.component';
import {MatMenuModule}              from '@angular/material/menu';
import {LanguageselectComponent}    from './utils/languageselect/languageselect.component';
import {ParticlesComponent}         from './utils/particles/particles.component';
import {LoadingComponent}           from './utils/loading/loading.component';
import {VoiceMessageComponent}      from './message-box/voice-message/voice-message.component';
import {MatTooltipModule}           from '@angular/material/tooltip';
import {UpdateDisplayNameComponent} from './dialogs/update-display-name/update-display-name.component';
import {TimeAgoPipe}                from 'time-ago-pipe';
import {MatProgressSpinnerModule}   from '@angular/material/progress-spinner';

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
    CallFunctionComponent,
    MicrophoneTestComponent,
    LanguageselectComponent,
    ParticlesComponent,
    LoadingComponent,
    VoiceMessageComponent,
    UpdateDisplayNameComponent,
    TimeAgoPipe,
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
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  providers:    [],
  bootstrap:    [AppComponent],
  exports: [
    MatIconModule,
    TranslateModule,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA
  ]
})
export class AppModule {
}
