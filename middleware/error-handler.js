const errorHandler = (err, req, res, next) => {
    // 设置默认的状态码和错误消息
    const statusCode = err.status || 400; // 默认400，也可以根据实际需要使用 500 或其他
    const message = err.message || 'Request Failed';
    const errorCode = err.errorCode || 'UNKNOWN_ERROR'; // 自定义错误码
    const timestamp = new Date().toISOString(); // 当前时间戳
  
    // 统一返回错误格式
    res.status(statusCode).json({
      message,
      status: 'error', // 通常返回 "error"，也可以自定义
      data: null, // 错误时通常返回 null，表示没有有效数据
      errorCode,
      timestamp,
    });
  };
  
export default errorHandler;
  