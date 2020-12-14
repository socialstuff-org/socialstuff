import {Component}   from '@angular/core';
import {UtilService} from '../services/util.service';

/**
 * Footer component
 *
 * Responsible for displaying the footer
 */
@Component({
  selector:    'app-footer',
  templateUrl: './footer.component.html',
  styleUrls:   ['./footer.component.scss']
})
export class FooterComponent {

  constructor(
    public util: UtilService,
  ) {
  }

}
