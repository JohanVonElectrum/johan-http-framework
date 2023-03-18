import { Request, Response, Router } from "express";
import "reflect-metadata";
import HttpError from "./HttpError";

interface RouteProps {
    method: "get" | "head" | "post" | "put" | "delete" | "connect" | "options" | "trace" | "patch";
    path: string;
}

type HandlerProps = RouteProps & { handler: (req: Request, res: Response) => void };

interface ParamMapFn {
    index: number;
    map: (...args: any[]) => any;
}

function isReqResMap(x: any): x is (req: Request, res: Response) => any {
    return (typeof x === "function") &&
    (
        (
            (x.length === 2) &&
            x.toString().startsWith("(req, res)")
        ) ||
        (
            (x.length === 1) &&
            (
                x.toString().startsWith("req") ||
                x.toString().startsWith("(req)")
            )
        )
    );
}

export function Controller(path: string): ClassDecorator {
    const router = Router();

    const handle = (handler: HandlerProps) => {
        router[handler.method](handler.path, handler.handler);
    };

    return (target) => {
        const handlers: Array<HandlerProps> = Reflect.getMetadata("handlers", target.prototype);
        if (handlers) {
            handlers.forEach(handle);
        }

        Reflect.defineMetadata("path", path, target);
        Reflect.defineMetadata("router", router, target);
        return target;
    };
}

export function Route({method, path}: RouteProps): MethodDecorator {
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        let handlers: Array<HandlerProps> = Reflect.getMetadata("handlers", target);
        if (!handlers) {
            Reflect.defineMetadata("handlers", handlers = [], target);
        }
        handlers.push({
            method,
            path,
            handler: (req: Request, res: Response) => {
                const params: Array<ParamMapFn> = Reflect.getMetadata("params", descriptor.value);
                
                const mappers = new Map<number, Array<(...args: any[]) => any>>();
                if (params !== undefined) params.forEach(param => {
                    if (!mappers.has(param.index)) mappers.set(param.index, []);

                    mappers.get(param.index)?.push(param.map);
                });

                const parsed = [...mappers.entries()]
                    .sort((o1, o2) => o1[0] - o2[0])
                    .map(mapper => {
                        mapper[1].sort((o1, o2) => {
                            if (isReqResMap(o1)) return -1;
                            if (isReqResMap(o2)) return 1;
                            return 0;
                        });
                        
                        let value: any = undefined;
                        mapper[1].forEach(fn => {
                            if (isReqResMap(fn))
                                value = fn(req, res);
                            else
                                value = (fn as (arg: any) => any)(value);
                        });
                        return value;
                    });

                const result = descriptor.value(...parsed);

                if (!res.headersSent) {
                    if (result instanceof String) res.send(result);
                    else res.json(result);
                }
            }
        });
    };
}

export function Get(path = "/"): MethodDecorator {
    return Route({
        method: "get",
        path
    });
}

export function Post(path = "/"): MethodDecorator {
    return Route({
        method: "post",
        path
    });
}

export function Parse(parser: (input: any) => any): ParameterDecorator {
    return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
        let params: Array<ParamMapFn> = Reflect.getMetadata("params", target[propertyKey.toString()]);
        if (!params) {
            Reflect.defineMetadata("params", params = [], target[propertyKey.toString()]);
        }
        params.push({
            index: parameterIndex,
            map: parser
        });
    };
}

export function Param(getter: (req: Request, res: Response) => any): ParameterDecorator {
    return (target: any, propertyKey: string | symbol, parameterIndex: number) => {
        let params: Array<ParamMapFn> = Reflect.getMetadata("params", target[propertyKey.toString()]);
        if (!params) {
            Reflect.defineMetadata("params", params = [], target[propertyKey.toString()]);
        }
        params.push({
            index: parameterIndex,
            map: getter
        });
    };
}

export function Query(field?: string): ParameterDecorator {
    return Param(req => {
        if (field !== undefined && req.query[field] === undefined) throw new HttpError(401);
        return field ? req.query[field] : req.query;
    });
}

export function Req(): ParameterDecorator {
    return Param(req => req);
}

export function Res(): ParameterDecorator {
    return Param((req, res) => res);
}

export function Body(field?: string): ParameterDecorator {
    return Param(req => {
        if (field !== undefined && req.body[field] === undefined) throw new HttpError(401);
        return field ? req.body[field] : req.body;
    });
}
