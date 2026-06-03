import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GoogleDriveService } from '../services/googleDrive';
import type { GraphState } from '../../../shared/types';

// Declare types for globally stubbed callback
declare global {
  var googleCallback:
    | ((response: {
        access_token: string;
        expires_in: string;
        scope: string;
        token_type: string;
      }) => void)
    | undefined;
}

describe('GoogleDriveService (Unit Tests)', () => {
  beforeEach(() => {
    // Clear localStorage and fetch mock
    localStorage.clear();
    vi.stubGlobal('fetch', vi.fn());

    // Stub global google object
    const mockTokenClient = {
      requestAccessToken: vi.fn().mockImplementation(() => {
        // Trigger callback synchronously for successful auth testing
        if (globalThis.googleCallback) {
          globalThis.googleCallback({
            access_token: 'mock-access-token',
            expires_in: '3600',
            scope: 'https://www.googleapis.com/auth/drive.file',
            token_type: 'Bearer',
          });
        }
      }),
    };

    vi.stubGlobal('google', {
      accounts: {
        oauth2: {
          initTokenClient: vi
            .fn()
            .mockImplementation(
              (config: { callback: typeof globalThis.googleCallback }) => {
                globalThis.googleCallback = config.callback;
                return mockTokenClient;
              },
            ),
        },
      },
    });
  });

  afterEach(() => {
    // Restore globals and env stubs
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    globalThis.googleCallback = undefined;
  });

  const mockGraph: GraphState = {
    nodes: [
      {
        id: '1',
        type: 'input',
        value: 10,
        isPercentage: false,
      },
    ],
    edges: [],
  };

  describe('Real Google API Mode (With Client ID)', () => {
    beforeEach(() => {
      // Force real mode via clean Vitest stub
      vi.stubEnv('VITE_GOOGLE_CLIENT_ID', 'test-client-id-123');
    });

    it('should request token and authorize correctly', async () => {
      const service = new GoogleDriveService();

      const token = await service.authorize();
      expect(token).toBe('mock-access-token');
      expect(service.getAccessToken()).toBe('mock-access-token');
    });

    it('should make correct multipart request when saving a file', async () => {
      const service = new GoogleDriveService();
      // Set access token
      service.setAccessToken('mock-access-token');

      // Mock fetch response for files.create
      const mockFetch = vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({
          id: 'remote-file-id-789',
          name: 'Cloud Graph.calc',
        }),
      } as Response);

      await service.saveGraph('Cloud Graph', mockGraph);

      // Verify fetch was called with Google Drive upload endpoint in the calls history
      expect(mockFetch).toHaveBeenCalled();

      const postCall = mockFetch.mock.calls.find((call) => {
        const options = call[1];
        return options?.method === 'POST';
      });

      expect(postCall).toBeDefined();
      const [url, options] = postCall!;
      const urlStr =
        typeof url === 'string' ? url : (url as { href: string }).href;
      expect(urlStr).toContain('googleapis.com/upload/drive/v3/files');
      expect(options?.method).toBe('POST');
      const headers = options?.headers;
      if (headers instanceof Headers) {
        expect(headers.get('Authorization')).toBe('Bearer mock-access-token');
      } else {
        expect(headers).toHaveProperty(
          'Authorization',
          'Bearer mock-access-token',
        );
      }

      // Verify body format (multipart/related)
      const body = options?.body;
      expect(body).toBeDefined();
    });

    it('should fetch and parse files correctly when listing', async () => {
      const service = new GoogleDriveService();
      service.setAccessToken('mock-access-token');

      const mockFileList = {
        files: [
          {
            id: 'file-1',
            name: 'Graph A.calc',
            createdTime: '2026-05-25T00:00:00Z',
          },
          {
            id: 'file-2',
            name: 'Unrelated.txt',
            createdTime: '2026-05-25T01:00:00Z',
          },
        ],
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockFileList,
      } as Response);

      const files = await service.listGraphs();

      // Should filter out Unrelated.txt and keep .calc files
      expect(files.length).toBe(1);
      expect(files[0].id).toBe('file-1');
      expect(files[0].name).toBe('Graph A.calc');
    });

    it('should fetch and parse a specific graph content when loading', async () => {
      const service = new GoogleDriveService();
      service.setAccessToken('mock-access-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockGraph,
      } as Response);

      const loaded = await service.loadGraph('file-1');
      expect(loaded).toEqual(mockGraph);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining(
          'googleapis.com/drive/v3/files/file-1?alt=media',
        ),
        expect.any(Object),
      );
    });

    it('should recover from a 401 error by re-requesting access token and retrying request', async () => {
      const service = new GoogleDriveService();
      service.setAccessToken('expired-token');

      // First fetch returns 401, second returns 200 with graph
      let fetchCount = 0;
      vi.mocked(fetch).mockImplementation(async () => {
        fetchCount++;
        if (fetchCount === 1) {
          return {
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
          } as unknown as Response;
        }
        return {
          ok: true,
          json: async () => mockGraph,
        } as unknown as Response;
      });

      // Stub authorization behavior to update token on trigger
      vi.spyOn(service, 'authorize').mockImplementation(async () => {
        service.setAccessToken('new-fresh-token');
        return 'new-fresh-token';
      });

      const loaded = await service.loadGraph('file-1');

      expect(loaded).toEqual(mockGraph);
      expect(service.authorize).toHaveBeenCalled();
      expect(service.getAccessToken()).toBe('new-fresh-token');
      expect(fetchCount).toBe(2); // First failed, then retried
    });
  });
});
