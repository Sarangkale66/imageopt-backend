export interface LoginDto {
    email: string;
    password: string;
}
export declare const validateLoginDto: (dto: LoginDto) => string | null;
