/**
 * Standardized API response helper.
 * Ensures all API responses follow the same format.
 */
class ApiResponse {
  constructor(statusCode, message, data = null, pagination = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;

    if (pagination) {
      this.pagination = pagination;
    }
  }

  static success(res, { statusCode = 200, message = 'Success', data = null, pagination = null } = {}) {
    const response = new ApiResponse(statusCode, message, data, pagination);
    return res.status(statusCode).json(response);
  }

  static created(res, { message = 'Created successfully', data = null } = {}) {
    return ApiResponse.success(res, { statusCode: 201, message, data });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static error(res, { statusCode = 500, message = 'Internal Server Error', errors = [] } = {}) {
    return res.status(statusCode).json({
      success: false,
      statusCode,
      message,
      errors,
    });
  }
}

export { ApiResponse };
