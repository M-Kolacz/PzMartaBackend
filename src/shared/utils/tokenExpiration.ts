import { CustomToken } from '../ts/types';

export const isTokenExpired = (token: CustomToken<any>) => token.exp * 1000 < Date.now();
