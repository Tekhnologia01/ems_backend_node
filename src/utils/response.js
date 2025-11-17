class ApiResponse {
  constructor(success, message, data = null, statusCode = 200, accessToken = '', error = null) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.statusCode = statusCode;
    this.accessToken = accessToken;
    if (error) this.error = error;
  }
}

export class ResponseBuilder {
  static successWithPagination(message, data = null, currentPage, totalRecords, limit, statusCode = 200, accessToken = '') {
    const response = new ApiResponse(true, message, data, statusCode, accessToken);
    response.currentPage = currentPage;
    response.totalRecords = totalRecords;
    response.limit = limit;
    return response;
  }

  static success(message, data = null, accessToken = '') {
    return new ApiResponse(true, message, data, 200, accessToken);
  }

  static created(message, data = null, accessToken = '') {
    return new ApiResponse(true, message, data, 201, accessToken);
  }

  static badRequest(message, details = '', traceId = '') {
    return new ApiResponse(false, message, null, 400, '', { code: 'BAD_REQUEST', message, details, traceId });
  }

  static unauthorized(message, statusCode = 401, accessToken = '') {
    return new ApiResponse(false, message, null, statusCode, accessToken);
  }

  static notFound(message, statusCode = 404) {
    return new ApiResponse(false, message, null, statusCode);
  }

  static internalServerError(message, details = '', traceId = '') {
    return new ApiResponse(false, message, null, 500, '', { code: 'INTERNAL_SERVER_ERROR', message, details, traceId });
  }

  static error(message, code, statusCode = 500, details = '', traceId = '') {
    const errorDetails = { code, message, details, traceId };
    return new ApiResponse(false, message, null, statusCode, '', errorDetails);
  }
}
