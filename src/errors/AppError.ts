import { Request } from 'express';

declare global {
    interface ErrorConstructor {
        captureStackTrace(targetObject: object, constructorOpt?: Function): void;
    }
}

export default class AppError extends Error {
    public statusCode: number;
    public isOperational: boolean;
    public request?: Request;

    constructor(message: string, statusCode: number, request?: Request) {
        super(message);
        
        this.statusCode = statusCode;
        this.isOperational = true; 
        this.request = request;

        Object.setPrototypeOf(this, AppError.prototype);
        
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
}