// D:\stylescapes\backend\src\middleware\errorHandler.js

const handleErrors = (err, req, res, next) => {
    // Set a default status code and message if none are provided
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';

    // Handle specific standard HTTP errors with simple messages
    switch (statusCode) {
        case 400:
            message = 'Bad Request';
            break;
        case 401:
            message = 'Unauthorized';
            break;
        case 403:
            message = 'Forbidden';
            break;
        case 404:
            message = 'Not Found';
            break;
        case 500:
            // The default message is already set above
            break;
    }

    // Log the error for debugging purposes
    console.error(err.stack);

    // Send the standardized error response to the client
    res.status(statusCode).json({
        success: false,
        status: statusCode,
        message: message,
    });
};

module.exports = handleErrors;