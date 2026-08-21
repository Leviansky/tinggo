const errorHandler = (err, req, res, next) => {
    console.error(err);

    // Default error status
    const status = err.status || 500;
    const message = err.message || 'Terjadi kesalahan pada server';

    res.status(status).json({
        code: status,
        status: false,
        message: message,
        data: process.env.NODE_ENV === 'development' ? err.stack : null
    });
};

module.exports = errorHandler;
