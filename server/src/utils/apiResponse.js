export const sendSuccess = (res, {
  statusCode = 200,
  message,
  data,
  meta,
}) => {
  const payload = { success: true };
  if (message) payload.message = message;
  if (data !== undefined) payload.data = data;
  if (meta) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

export const sendCreated = (res, data, message = 'Created successfully') =>
  sendSuccess(res, { statusCode: 201, message, data });
