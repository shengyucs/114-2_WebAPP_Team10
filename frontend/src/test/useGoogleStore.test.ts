import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGoogleStore } from '../store/useGoogleStore';
import { useStore } from '../store/useStore';
import { GoogleDriveService } from '../services/googleDrive';
import type { GraphState } from '../../../shared/types';

const {
  mockSaveGraph,
  mockListGraphs,
  mockLoadGraph,
  mockDeleteGraph,
  mockAuthorize,
  mockGetAccessToken,
  mockSetAccessToken,
} = vi.hoisted(() => ({
  mockSaveGraph: vi.fn(),
  mockListGraphs: vi.fn().mockResolvedValue([]),
  mockLoadGraph: vi.fn(),
  mockDeleteGraph: vi.fn(),
  mockAuthorize: vi.fn(),
  mockGetAccessToken: vi.fn(),
  mockSetAccessToken: vi.fn(),
}));

vi.mock('../services/googleDrive', () => {
  return {
    GoogleDriveService: class {
      getAccessToken = mockGetAccessToken;
      setAccessToken = mockSetAccessToken;
      authorize = mockAuthorize;
      saveGraph = mockSaveGraph;
      listGraphs = mockListGraphs;
      loadGraph = mockLoadGraph;
      deleteGraph = mockDeleteGraph;
    },
  };
});

describe('useGoogleStore (Zustand Unit Tests)', () => {
  let mockServiceInstance: GoogleDriveService;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset the useGoogleStore state manually
    useGoogleStore.setState({
      accessToken: null,
      userInfo: null,
      isConnected: false,
      isLoading: false,
      cloudFiles: [],
      activeFileId: null,
      activeFileName: null,
    });

    // Reset standard store state
    useStore.setState({
      nodes: [],
      edges: [],
    });

    mockServiceInstance = new GoogleDriveService();
  });

  const mockGraph: GraphState = {
    nodes: [
      {
        id: 'n1',
        type: 'input',
        value: 42,
        isPercentage: false,
      },
    ],
    edges: [],
  };

  it('should have initial disconnected state', () => {
    const state = useGoogleStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.accessToken).toBe(null);
    expect(state.userInfo).toBe(null);
    expect(state.cloudFiles.length).toBe(0);
  });

  it('should transition to connected when connect() is called successfully', async () => {
    vi.mocked(mockServiceInstance.authorize).mockResolvedValue(
      'mock-token-abc',
    );

    const mockFiles = [
      { id: 'id1', name: 'Crit Setup.calc', createdTime: '2026-05-25' },
    ];
    vi.mocked(mockServiceInstance.listGraphs).mockResolvedValue(mockFiles);

    // Mock fetch for userinfo endpoint
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          name: 'Test User',
          email: 'test@gmail.com',
          picture: '',
        }),
      }),
    );

    await useGoogleStore.getState().connect();

    const state = useGoogleStore.getState();
    expect(state.isConnected).toBe(true);
    expect(state.accessToken).toBe('mock-token-abc');
    expect(state.cloudFiles).toEqual(mockFiles);

    vi.unstubAllGlobals();
  });

  it('should disconnect cleanly and reset values when disconnect() is called', async () => {
    useGoogleStore.setState({
      isConnected: true,
      accessToken: 'token',
      userInfo: { name: 'Test', email: 'test@gmail.com', picture: '' },
      cloudFiles: [{ id: 'f1', name: 'g.calc', createdTime: 'now' }],
      activeFileId: 'f1',
      activeFileName: 'g',
    });

    useGoogleStore.getState().disconnect();

    const state = useGoogleStore.getState();
    expect(state.isConnected).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.userInfo).toBeNull();
    expect(state.cloudFiles.length).toBe(0);
  });

  it('should read current canvas state and trigger save in GoogleDriveService when saveCurrentGraph() is called', async () => {
    // Populate canvas store
    useStore.setState({
      nodes: [
        {
          id: 'n1',
          type: 'input',
          position: { x: 0, y: 0 },
          data: {
            label: '',
            value: 42,
            isPercentage: false,
          },
        },
      ],
      edges: [],
    });

    useGoogleStore.setState({
      isConnected: true,
    });

    vi.mocked(mockServiceInstance.listGraphs).mockResolvedValue([
      { id: 'f2', name: 'New Save.calc', createdTime: 'now' },
    ]);

    await useGoogleStore.getState().saveCurrentGraph('New Save');

    expect(mockServiceInstance.saveGraph).toHaveBeenCalledWith('New Save', {
      nodes: [
        {
          id: 'n1',
          type: 'input',
          label: '',
          value: 42,
          isPercentage: false,
        },
      ],
      edges: [],
      variables: {},
    });

    expect(useGoogleStore.getState().cloudFiles.length).toBe(1);
    expect(useGoogleStore.getState().cloudFiles[0].name).toBe('New Save.calc');
  });

  it('should fetch remote file and overwrite local canvas state when loadCloudGraph() is called', async () => {
    vi.mocked(mockServiceInstance.loadGraph).mockResolvedValue(mockGraph);

    await useGoogleStore.getState().loadCloudGraph('cloud-file-id');

    expect(mockServiceInstance.loadGraph).toHaveBeenCalledWith('cloud-file-id');

    const canvasNodes = useStore.getState().nodes;
    expect(canvasNodes.length).toBe(1);
    expect(canvasNodes[0].id).toBe('n1');
    expect(canvasNodes[0].type).toBe('input');
    expect(canvasNodes[0].data.value).toBe(42);
  });
});
