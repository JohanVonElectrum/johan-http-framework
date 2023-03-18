import express, { Express, Router } from "express";
import helmet from "helmet";
import cors from "cors";
import "reflect-metadata";

interface AppCreateOptions {
    controllers: Object[]
}

export default class Framework {
    private readonly app: Express;

    private constructor(options: AppCreateOptions) {
        this.app = express();

        this.app.use(express.json());
        this.app.use(helmet());
        this.app.use(cors());

        options.controllers.forEach(controller => {
            const path: string = Reflect.getMetadata("path", controller);
            const router: Router = Reflect.getMetadata("router", controller);
            if (!router) return;

            this.app.use(path, router);
        });
    }

    public static createApp(options: AppCreateOptions) {
        return new Framework(options);
    }

    public listen(port: number, callback?: () => void) {
        this.app.listen(port, callback);
    }

}
