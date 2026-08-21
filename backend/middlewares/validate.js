const { ZodError } = require('zod');

const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        if (error instanceof ZodError) {
            return res.status(400).json({
                code: 400,
                status: false,
                message: error.issues[0].message,
                data: error.issues
            });
        }
        next(error);
    }
};

module.exports = validate;
