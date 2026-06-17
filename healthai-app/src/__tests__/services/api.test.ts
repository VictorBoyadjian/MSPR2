import { ApiError, setToken, getToken, sendRequest, dishes } from '@/services/api';

global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('ApiError', () => {
  it('est une instance de Error', () => {
    const err = new ApiError(404, 'Not Found');
    expect(err).toBeInstanceOf(Error);
    expect(err.status).toBe(404);
    expect(err.message).toBe('Not Found');
    expect(err.name).toBe('ApiError');
  });
});

describe('setToken / getToken', () => {
  afterEach(() => setToken(null));

  it('stocke et retourne le token', () => {
    setToken('my-secret-token');
    expect(getToken()).toBe('my-secret-token');
  });

  it('efface le token avec null', () => {
    setToken('token');
    setToken(null);
    expect(getToken()).toBeNull();
  });
});

describe('sendRequest', () => {
  beforeEach(() => {
    setToken(null);
    mockFetch.mockReset();
  });

  it('effectue un GET avec les bons headers', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: 'ok' }),
    } as Response);

    const result = await sendRequest('GET', '/test');
    expect(result).toEqual({ data: 'ok' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/test'),
      expect.objectContaining({ method: 'GET' }),
    );
  });

  it('envoie le header Authorization si token présent', async () => {
    setToken('bearer123');
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({}),
    } as Response);

    await sendRequest('GET', '/protected');
    const [, options] = mockFetch.mock.calls[0];
    expect((options as RequestInit).headers).toMatchObject({
      Authorization: 'Bearer bearer123',
    });
  });

  it('retourne undefined pour une réponse 204', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
      json: async () => null,
    } as Response);

    const result = await sendRequest('DELETE', '/resource');
    expect(result).toBeUndefined();
  });

  it('lève ApiError si la réponse n\'est pas ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 422,
      statusText: 'Unprocessable Entity',
      json: async () => ({ message: 'Validation failed' }),
    } as Response);

    await expect(sendRequest('POST', '/resource', {})).rejects.toMatchObject({
      status: 422,
      message: 'Validation failed',
    });
  });

  it('lève ApiError 0 si le fetch échoue réseau', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));

    await expect(sendRequest('GET', '/unreachable')).rejects.toMatchObject({
      status: 0,
    });
  });

  it('lève ApiError avec message "expiré" sur AbortError', async () => {
    const abortErr = new Error('Aborted');
    abortErr.name = 'AbortError';
    mockFetch.mockRejectedValueOnce(abortErr);

    await expect(sendRequest('GET', '/slow')).rejects.toMatchObject({
      status: 0,
      message: 'La requête a expiré.',
    });
  });

  it('extrait le message quand le payload d\'erreur est une chaîne', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: async () => 'plain string error',
    } as Response);

    await expect(sendRequest('GET', '/x')).rejects.toMatchObject({
      message: 'plain string error',
    });
  });

  it('sérialise le body en JSON pour POST', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ created: ['id1'] }),
    } as Response);

    await sendRequest('POST', '/items', { name: 'test' });
    const [, options] = mockFetch.mock.calls[0];
    expect((options as RequestInit).body).toBe(JSON.stringify({ name: 'test' }));
  });
});

describe('resource()', () => {
  beforeEach(() => {
    setToken(null);
    mockFetch.mockReset();
  });

  it('search appelle POST sur /path/search', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ current_page: 1, data: [] }),
    } as Response);

    await dishes.search({ limit: 10 });
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/dishes/search');
    expect((opts as RequestInit).method).toBe('POST');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body).toMatchObject({ search: { limit: 10 } });
  });

  it('mutate appelle POST sur /path/mutate', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ created: ['1'], updated: [] }),
    } as Response);

    await dishes.mutate([{ operation: 'create', attributes: { name: 'Test' } }]);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/dishes/mutate');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.mutate[0].operation).toBe('create');
  });

  it('delete appelle DELETE sur /path avec resources', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ data: [] }),
    } as Response);

    await dishes.delete(['1', '2']);
    const [url, opts] = mockFetch.mock.calls[0];
    expect(url).toContain('/dishes');
    expect((opts as RequestInit).method).toBe('DELETE');
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body.resources).toEqual(['1', '2']);
  });

  it('search sans argument passe un objet vide', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ current_page: 1, data: [] }),
    } as Response);

    await dishes.search();
    const [, opts] = mockFetch.mock.calls[0];
    const body = JSON.parse((opts as RequestInit).body as string);
    expect(body).toEqual({ search: {} });
  });
});
