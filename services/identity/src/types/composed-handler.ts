import {ValidationChain} from 'express-validator';
import {Handler}         from 'express';

export type ComposedHandler = ValidationChain | ValidationChain[] | Handler;
