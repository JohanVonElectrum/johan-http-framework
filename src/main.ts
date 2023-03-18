import Framework from "./framework/Framework";
import AuthController from "./auth.controller";

const app = Framework.createApp({
    controllers: [ AuthController ]
});
app.listen(3000, () => {
    console.log("Listening on port 3000...");
});
