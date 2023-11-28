import { NextFunction, Response } from "express";

interface errorHandlerProps {
    err: any;
    req: Request;
    res: Response;
    next: NextFunction
}

const errorHandler = (
    {err,
    req,
    res,
    next}: errorHandlerProps
) => {
    console.log(err.stack);

    console.log(err);

    res.status(err.statusCode || 500).json({
        success: false,
        error: err.message,
    });
};

export default errorHandler;
