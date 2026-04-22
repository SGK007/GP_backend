type Role = 'USER' | 'LAWYER';
interface SignupPayload {
    name: string;
    email: string;
    password: string;
    role: 'USER' | 'LAWYER';
}
interface SignupResponse {
    id: string;
    email: string;
    name: string;
    role: Role;
    token: string;
}
interface LoginPayload {
    email: string;
    password: string;
}
interface LoginResponse {
    id: string;
    email: string;
    name: string;
    role: Role;
    token: string;
}
export declare function signup(payload: SignupPayload): Promise<SignupResponse>;
export declare function login(payload: LoginPayload): Promise<LoginResponse>;
export {};
//# sourceMappingURL=authService.d.ts.map