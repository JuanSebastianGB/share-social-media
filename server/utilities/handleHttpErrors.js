/**
 * If the response is not OK, then send a message to the client with the status code.
 * @param res - The response object
 * @param [message=Something went wrong] - The message you want to send to the client.
 * @param [code=403] - The HTTP status code to return.
 */
const handleHttpErrors = (res, message = 'Something went wrong', code = 403) =>
  res.status(code).json(message);

export { handleHttpErrors };
