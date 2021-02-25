import { CustomToken } from '../types/token';

export const isTokenExpired = (token: CustomToken<any>) => token.exp * 1000 < Date.now();
