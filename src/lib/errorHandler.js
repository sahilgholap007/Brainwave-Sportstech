import { NextResponse } from 'next/server';
import { AppError } from './errors';

/**
 * Logger utility for consistent logging across the application
 * In production, this could be replaced with a service like Sentry, LogRocket, etc.
 */
export const logger = {
    /**
     * Log informational messages
     */
    info: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            // In production, consider using a logging service instead of console.log
        }
        // TODO: Send to logging service in production
    },

    /**
     * Log warning messages
     */
    warn: (message, meta = {}) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${message}`, meta);
        }
        // TODO: Send to logging service in production
    },

    /**
     * Log error messages
     */
    error: (message, error = null, meta = {}) => {
        const errorLog = {
            message,
            timestamp: new Date().toISOString(),
            ...meta,
        };

        if (error) {
            errorLog.error = {
                name: error.name,
                message: error.message,
                stack: error.stack,
            };
        }

        if (process.env.NODE_ENV !== 'production') {
            console.error(`[ERROR] ${message}`, errorLog);
        }
        // TODO: Send to error tracking service (Sentry, etc.) in production
    },

    /**
     * Log debug messages (only in development)
     */
    debug: (message, meta = {}) => {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[DEBUG] ${message}`, meta);
        }
    },
};

/**
 * API Error Handler
 * Standardizes error responses from API routes
 */
export function handleApiError(error) {
    // Log the error
    logger.error('API Error', error, {
        isOperational: error.isOperational,
        statusCode: error.statusCode,
    });

    // If it's our custom AppError, use its status code and message
    if (error instanceof AppError) {
        return NextResponse.json(
            {
                success: false,
                error: {
                    message: error.message,
                    ...(error.errors && { errors: error.errors }),
                    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
                },
            },
            { status: error.statusCode }
        );
    }

    // For unknown errors, return generic 500 error
    return NextResponse.json(
        {
            success: false,
            error: {
                message: 'An unexpected error occurred',
                ...(process.env.NODE_ENV === 'development' && {
                    details: error.message,
                    stack: error.stack,
                }),
            },
        },
        { status: 500 }
    );
}

/**
 * Async handler wrapper for API routes
 * Catches errors and passes them to handleApiError
 */
export function asyncHandler(handler) {
    return async (req, context) => {
        try {
            return await handler(req, context);
        } catch (error) {
            return handleApiError(error);
        }
    };
}

/**
 * Client-side error handler
 * Standardizes error handling in client components
 */
export function handleClientError(error, context = '') {
    logger.error(`Client Error${context ? ` - ${context}` : ''}`, error);

    // Return user-friendly error message
    if (error instanceof AppError) {
        return error.message;
    }

    return 'An unexpected error occurred. Please try again.';
}
