import jwt from "jsonwebtoken";

/**
 * It takes an object with an _id and a role property, and returns a JWT token that expires in 2 hours.
 */
const generateToken = ({ _id, role }) =>
	jwt.sign({ _id, role }, process.env.JWT_SECRET, { expiresIn: "2h" });
// jwt.sign({ _id, role }, process.env.JWT_SECRET, { expiresIn: '10s' });

/**
 * If the token is valid, return the decoded token, otherwise return null.
 * @param token - The token to verify
 * @returns The token is being verified.
 */
const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};

export { generateToken, verifyToken };
