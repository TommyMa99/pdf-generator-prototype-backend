function validateRequiredParamsDocA  (requiredParams)  {
    return (req, res, next) => {
      const missingParams = requiredParams.filter(param => !(param in req.body.company));
  
      if (missingParams.length > 0) {
        const errorMessage = `Missing required parameters: ${missingParams.join(', ')}`;
        const error = new Error(errorMessage);
        error.status = 400; // Bad Request
        return next(error);
      }
  
      next();
    };
};
module.exports = {validateRequiredParamsDocA}