/**
 * Custom Error Classes for Application-wide Error Handling
 */

/**
 * Base Application Error
 * Extends the native Error class with HTTP status code support
 */
export class AppError extends Error {
    constructor(message, statusCode = 500, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        this.timestamp = new Date().toISOString();

        // Maintains proper stack trace for where our error was thrown
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Validation Error - 400 Bad Request
 * Used for input validation failures
 */
export class ValidationError extends AppError {
    constructor(message, errors = []) {
        super(message, 400);
        this.name = 'ValidationError';
        this.errors = errors;
    }
}

/**
 * Authentication Error - 401 Unauthorized
 * Used when authentication is required but not provided
 */
export class AuthenticationError extends AppError {
    constructor(message = 'Authentication required') {
        super(message, 401);
        this.name = 'AuthenticationError';
    }
}

/**
 * Authorization Error - 403 Forbidden
 * Used when user doesn't have permission
 */
export class AuthorizationError extends AppError {
    constructor(message = 'Insufficient permissions') {
        super(message, 403);
        this.name = 'AuthorizationError';
    }
}

/**
 * Not Found Error - 404 Not Found
 * Used when a resource is not found
 */
export class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}

/**
 * Database Error - 500 Internal Server Error
 * Used for database operation failures
 */
export class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500);
        this.name = 'DatabaseError';
        this.originalError = originalError;
    }
}

/**
 * External Service Error - 502 Bad Gateway
 * Used when external API/service calls fail
 */
export class ExternalServiceError extends AppError {
    constructor(service, message = 'External service error') {
        super(`${service}: ${message}`, 502);
        this.name = 'ExternalServiceError';
        this.service = service;
    }
}
