import * as express from "express";
// export abstract class Controller {
// 	public router: express.Router;
// 	public path: string;
// }

export interface Controller {
	path: string;
	router: express.Router;
}
