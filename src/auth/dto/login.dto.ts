// auth/dto/login.dto.ts
// Data transfer object for user login

export interface LoginDto {
  email: string;
  password: string;
}

export const validateLoginDto = (dto: LoginDto): string | null => {
  if (!dto.email || !dto.email.trim()) {
    return 'Email is required';
  }

  if (!dto.password || !dto.password.trim()) {
    return 'Password is required';
  }

  return null; // No errors
};
