const authMiddleware = require('../middlewares/authMiddleware');

describe('Auth Middleware Unit Test', () => {
    let mockReq;
    let mockRes;
    let nextFunction;

    beforeEach(() => {
        mockReq = {
            headers: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        nextFunction = jest.fn();
    });

    it('should return 401 if no authorization header is provided', () => {
        authMiddleware(mockReq, mockRes, nextFunction);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized: No token provided' });
    });

    it('should return 401 if token is invalid or malformed', () => {
        mockReq.headers.authorization = 'Bearer invalidtoken123';
        authMiddleware(mockReq, mockRes, nextFunction);
        expect(mockRes.status).toHaveBeenCalledWith(401);
        expect(mockRes.json).toHaveBeenCalledWith({ message: 'Unauthorized: Invalid token' });
    });
});
