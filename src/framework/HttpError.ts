const NAMES: Record<number, string> = {
    401: "Bad Request"
};

export default class HttpError extends Error {
    private status: number;

    constructor(status: number, message?: string) {
        super();
        this.status = status;
        this.name = NAMES[status] || "Unexpected error";
        if (message) this.message = message;
    }
}
