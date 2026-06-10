export type User = {
  id: string;
  email: string;
  name: string;
  createdAt: string;
};

export type AuthToken = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type RegisterDto = {
  name: string;
  email: string;
  password: string;
};
