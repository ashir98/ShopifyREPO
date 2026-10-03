export function errorHandler(err, req, res, next){

   const statusCode =  err.statusCode || res.statusCode;

   res.status(statusCode).json({
    message: err.message,
    stack: err.stack
   })

}