export interface RegisterDto {
    email: string;
    password: string;
    confirmPassword?: string;
}
export declare const validateRegisterDto: (dto: RegisterDto) => string | null;
