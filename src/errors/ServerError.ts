import AppError from "./AppError.ts";
import { Request } from 'express';

export default class ServerError extends AppError {
    constructor(message: string = 'Internal Server Error', statusCode: number = 500, request?: Request) {
        super(message, statusCode, request);
        Object.setPrototypeOf(this, ServerError.prototype);
    }
}