interface Token {
    exp: number;
    iat: number;
}
export type CustomToken<T> = Token & { [P in keyof T]: T[P] };
