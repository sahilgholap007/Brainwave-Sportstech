'use client';

import { useState } from 'react';
import { handleClientError, logger } from '@/lib/errorHandler';
import { ValidationError } from '@/lib/errors';

/**
 * Example Client Component showing proper error handling patterns
 * This demonstrates how to use the error handling utilities in client components
 */
export default function ExampleClientComponent() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/example');

            if (!response.ok) {
                const errorData = await response.json();
                throw new ValidationError(errorData.error.message);
            }

            const result = await response.json();
            setData(result);
            logger.info('Data fetched successfully');
        } catch (err) {
            // Use handleClientError to get user-friendly message
            const errorMessage = handleClientError(err, 'Fetching data');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (formData) => {
        try {
            // Validate before sending
            if (!formData.email) {
                throw new ValidationError('Email is required');
            }

            const response = await fetch('/api/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message);
            }

            logger.info('Form submitted successfully');
        } catch (err) {
            const errorMessage = handleClientError(err, 'Submitting form');
            setError(errorMessage);
        }
    };

    return (
        <div>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
            {/* Rest of your component */}
        </div>
    );
}
