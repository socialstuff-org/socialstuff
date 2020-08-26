import {ValidationChain}                from 'express-validator';
import {RequestHandler}                 from 'express';
import {RequestWithDependenciesHandler} from './request-with-dependencies';

export type ComposedHandler = ValidationChain | ValidationChain[] | RequestHandler | RequestWithDependenciesHandler;
