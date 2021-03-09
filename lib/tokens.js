const jwt = require('jsonwebtoken');

const JWT_KEY = 'ASECRETKEYHERE';

const generateToken = (id) => {
	return jwt.sign({ id }, JWT_KEY, {
		algorithm: "HS256",
		expiresIn: 3600, // 1 hour
    });
};

const parseToken = (token) => {
    return jwt.verify(token, JWT_KEY);
};

const tokenValid = (event, context) => {
    const headers = event.headers;
    try {
        if (headers && headers.Authorization) {
            const parsedToken = parseToken(headers.Authorization);
            return { valid: true, id: parsedToken.id };
        }
        throw new Error('Token Missing');
    } catch(e) {
        return { valid: false };
    }

}

module.exports = { generateToken, tokenValid };