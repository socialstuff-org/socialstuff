import {ActivatedRoute} from '@angular/router';


export function RouteParameter(name?: string) {
  return function (target: Object, propertyKey: string) {
    const paramName = name || propertyKey;
    let paramValue = undefined;

    const getter = function() {
      if (!this.activatedRoute) {
        throw new Error('Missing attribute \'activatedRoute\'!')
      } else if (!(this.activatedRoute instanceof ActivatedRoute)) {
        throw new Error('Property \'activatedRoute\' must be of type \'ActivatedRoute\'!');
      }
      console.log('params', this.activatedRoute.snapshot.params);
      if (paramValue === undefined) {
        paramValue = this.activatedRoute.snapshot.params[paramName];
      }
      return paramValue;
    };

    return Object.defineProperty(target, propertyKey, {
      get: getter
    });
  }
}
