import type { Request, Response, NextFunction } from "express";

const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {

	if (req.headers['accept-encoding']?.includes('br')) {
		req.url = req.url + '.br';
		res.set('Content-Encoding', 'br');
		res.set('Content-Type', 'application/javascript');
	}
	next()
}

export default compressionMiddleware;
