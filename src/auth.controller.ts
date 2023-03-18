import joi from "joi";

import { Controller, Post, Body } from "./framework/routes";

interface LoginProps {
    username: string;
    password: string;
    rep_pass: string;
}

@Controller("/auth")
export default class AuthController {

    @Post("/authorize")
    public authorize(@Body() props: LoginProps) {
        const schema = joi.object<LoginProps>({
            username: joi.string().alphanum().min(3).max(16).required(),
            password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-__+.]).{8,}$/).required(),
            rep_pass: joi.ref("password")
        });

        return schema.validate(props);
    }

    @Post("/token")
    public token(@Body() props: LoginProps) {
        const schema = joi.object<LoginProps>({
            username: joi.string().alphanum().min(3).max(16).required(),
            password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()\-__+.]).{8,}$/).required(),
            rep_pass: joi.ref("password")
        });

        return schema.validate(props);
    }

}
