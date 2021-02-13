declare namespace Express {
    export interface Request {
        userData?: { userId: string };
    }
}

declare namespace NodeJS {
    interface ProcessEnv {
        JWT_SECURITY: string;
        DATABASE_URL: string;
        SEND_GRID_API: string;
    }
}
