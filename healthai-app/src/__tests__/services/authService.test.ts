import { authService } from '@/services/authService';
import * as api from '@/services/api';

jest.mock('@/services/api', () => ({
  ...jest.requireActual('@/services/api'),
  sendRequest: jest.fn(),
}));

const mockSendRequest = api.sendRequest as jest.MockedFunction<typeof api.sendRequest>;

describe('authService', () => {
  beforeEach(() => mockSendRequest.mockReset());

  describe('login', () => {
    it('appelle POST /login avec email et password', async () => {
      mockSendRequest.mockResolvedValueOnce({ bearer_token: 'token123' });
      const result = await authService.login('user@test.com', 'password');
      expect(mockSendRequest).toHaveBeenCalledWith('POST', '/login', {
        email: 'user@test.com',
        password: 'password',
      });
      expect(result).toEqual({ bearer_token: 'token123' });
    });
  });

  describe('register', () => {
    it('appelle POST /register avec les données utilisateur', async () => {
      mockSendRequest.mockResolvedValueOnce({ message: 'Created' });
      const payload = {
        email: 'new@test.com',
        password: 'secret123',
        first_name: 'Jean',
        last_name: 'Dupont',
      };
      await authService.register(payload);
      expect(mockSendRequest).toHaveBeenCalledWith('POST', '/register', payload);
    });
  });

  describe('logout', () => {
    it('appelle POST /logout', async () => {
      mockSendRequest.mockResolvedValueOnce({ message: 'Logged out' });
      await authService.logout();
      expect(mockSendRequest).toHaveBeenCalledWith('POST', '/logout');
    });
  });

  describe('me', () => {
    it('appelle GET /me et retourne l\'utilisateur', async () => {
      const user = { id: '1', email: 'test@test.com' };
      mockSendRequest.mockResolvedValueOnce(user);
      const result = await authService.me();
      expect(mockSendRequest).toHaveBeenCalledWith('GET', '/me');
      expect(result).toEqual(user);
    });
  });

  describe('deleteAccount', () => {
    it('appelle DELETE /me', async () => {
      mockSendRequest.mockResolvedValueOnce({ message: 'Deleted' });
      await authService.deleteAccount();
      expect(mockSendRequest).toHaveBeenCalledWith('DELETE', '/me');
    });
  });
});
