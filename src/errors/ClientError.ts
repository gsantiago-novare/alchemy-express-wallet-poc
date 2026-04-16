import AppError from "./AppError.ts"; 
import { Request } from 'express';

export default class ClientError extends AppError {
    constructor(message: string, statusCode: number = 400, request?: Request) {
        super(message, statusCode, request);
        Object.setPrototypeOf(this, ClientError.prototype);
    }
}

