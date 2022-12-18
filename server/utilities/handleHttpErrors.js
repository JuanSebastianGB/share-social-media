const handleHttpErrors = (res, message = 'Something went wrong', code = 403) =>
  res.status(code).json(message);

export { handleHttpErrors };
