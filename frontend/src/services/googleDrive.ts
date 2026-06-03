import type { GraphState } from '../../../shared/types';

export class GoogleDriveService {
  private accessToken: string | null = null;

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  async authorize(): Promise<string> {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    if (!clientId) {
      throw new Error(
        'VITE_GOOGLE_CLIENT_ID is not configured in the environment variables.',
      );
    }

    return new Promise((resolve, reject) => {
      try {
        const tokenClient = google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response) => {
            if (response.error) {
              reject(response);
              return;
            }
            this.accessToken = response.access_token;
            resolve(response.access_token);
          },
          error_callback: (err) => {
            reject(err);
          },
        });

        tokenClient.requestAccessToken({ prompt: 'consent' });
      } catch (err) {
        reject(err);
      }
    });
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    if (!this.accessToken) {
      throw new Error('Unauthorized: No access token configured.');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${this.accessToken}`);

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      const newToken = await this.authorize();
      headers.set('Authorization', `Bearer ${newToken}`);
      return fetch(url, { ...options, headers });
    }

    return response;
  }

  async saveGraph(filename: string, graph: GraphState): Promise<void> {
    const fullFilename = filename.endsWith('.calc')
      ? filename
      : `${filename}.calc`;

    const existingFiles = await this.searchFileOnDrive(fullFilename);

    if (existingFiles && existingFiles.length > 0) {
      const fileId = existingFiles[0].id;
      const updateUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      const response = await this.fetchWithRetry(updateUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(graph),
      });

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Failed to update file in Google Drive',
        );
      }
    } else {
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;

      const metadata = {
        name: fullFilename,
        mimeType: 'application/json',
      };

      const multipartBody =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        JSON.stringify(graph) +
        closeDelimiter;

      const createUrl =
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';
      const response = await this.fetchWithRetry(createUrl, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
        },
        body: multipartBody,
      });

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Failed to save file in Google Drive',
        );
      }
    }
  }

  async listGraphs(): Promise<
    Array<{ id: string; name: string; createdTime: string }>
  > {
    const listUrl = `https://www.googleapis.com/drive/v3/files?q=name contains '.calc' and trashed = false&fields=files(id, name, createdTime)&orderBy=createdTime desc`;
    const response = await this.fetchWithRetry(listUrl);

    if (!response.ok) {
      await this.handleErrorResponse(
        response,
        'Failed to list files from Google Drive',
      );
    }

    const data = await response.json();
    const files: Array<{ id: string; name: string; createdTime: string }> =
      data.files || [];
    return files.filter((f) => f.name.endsWith('.calc'));
  }

  async loadGraph(fileId: string): Promise<GraphState> {
    const loadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await this.fetchWithRetry(loadUrl);

    if (!response.ok) {
      await this.handleErrorResponse(
        response,
        'Failed to load file from Google Drive',
      );
    }

    return response.json();
  }

  /** Grants public read access to a Drive file so anyone with the link can view it. */
  async shareFilePublicly(fileId: string): Promise<void> {
    const permUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
    const response = await this.fetchWithRetry(permUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    if (!response.ok) {
      await this.handleErrorResponse(
        response,
        'Failed to share file publicly on Google Drive',
      );
    }
  }

  /**
   * Downloads a publicly shared Drive file without an Authorization header,
   * allowing visitors who have no Google token to load the graph.
   */
  async downloadPublicFile(fileId: string): Promise<GraphState> {
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    const response = await fetch(url);

    if (!response.ok) {
      await this.handleErrorResponse(
        response,
        'Failed to download public Drive file',
      );
    }

    return response.json() as Promise<GraphState>;
  }

  async deleteGraph(fileId: string): Promise<void> {
    const deleteUrl = `https://www.googleapis.com/drive/v3/files/${fileId}`;
    const response = await this.fetchWithRetry(deleteUrl, {
      method: 'DELETE',
    });

    if (!response.ok) {
      await this.handleErrorResponse(
        response,
        'Failed to delete file from Google Drive',
      );
    }
  }

  private async searchFileOnDrive(
    filename: string,
  ): Promise<Array<{ id: string; name: string }> | null> {
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name = '${filename}' and trashed = false&fields=files(id, name)`;
    const response = await this.fetchWithRetry(searchUrl);
    if (!response.ok) return null;
    const data = await response.json();
    return data.files || [];
  }

  private async handleErrorResponse(
    response: Response,
    defaultMessage: string,
  ): Promise<never> {
    let errorDetail = response.statusText;
    try {
      const errData = await response.json();
      if (errData?.error?.message) {
        errorDetail = errData.error.message;
      }
    } catch {
      // Ignore if response is not JSON or cannot be parsed
    }
    throw new Error(`${defaultMessage}: ${errorDetail || response.status}`);
  }
}
