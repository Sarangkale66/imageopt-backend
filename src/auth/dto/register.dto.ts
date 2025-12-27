// auth/dto/register.dto.ts
// Data transfer object for user registration

export interface RegisterDto {
  email: string;
  password: string;
  confirmPassword?: string;
}

export const validateRegisterDto = (dto: RegisterDto): string | null => {
  if (!dto.email || !dto.email.trim()) {
    return 'Email is required';
  }

  const emailRegex = /^\S+@\S+\.\S+$/;
  if (!emailRegex.test(dto.email)) {
    return 'Invalid email format';
  }

  if (!dto.password || dto.password.length < 8) {
    return 'Password must be at least 8 characters';
  }

  if (dto.confirmPassword && dto.password !== dto.confirmPassword) {
    return 'Passwords do not match';
  }

  return null; // No errors
};
