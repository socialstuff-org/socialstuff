import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor() { }

  /**
   * Convert a string to obtain first character of each word.
   * If more than two words are present only the first two characters are taken.
   * @param realName String to be transformed
   * @return acronym The acronym string
   */
  public generateAcronym(realName: string): string {
    let acronym = realName.split(' ').map(x => x.charAt(0)).join('');
    return acronym.charAt(0) + acronym.charAt(acronym.length - 1);
  }

}