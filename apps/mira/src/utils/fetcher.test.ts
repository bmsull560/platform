import { fetcher } from './fetcher';
import { beforeEach, describe, expect, it, vi } from 'vitest';

describe('fetcher', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('should call fetch with the correct arguments and return JSON response', async () => {
    const mockJsonResponse = { data: 'test' };
    const mockFetch = vi.fn().mockResolvedValue({
      json: vi.fn().mockResolvedValue(mockJsonResponse),
    });

    global.fetch = mockFetch;

    const url = 'https://api.example.com/data';
    const options = { method: 'GET' };

    const result = await fetcher(url, options);

    expect(mockFetch).toHaveBeenCalledWith(url, options);
    expect(result).toEqual(mockJsonResponse);
  });

  it('should throw an error if fetch fails', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Fetch failed'));

    global.fetch = mockFetch;

    const url = 'https://api.example.com/data';
    const options = { method: 'GET' };

    await expect(fetcher(url, options)).rejects.toThrow('Fetch failed');
  });
});
