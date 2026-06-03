import { create } from 'zustand';
import { GoogleDriveService } from '../services/googleDrive';
import { useStore } from './useStore';
import type { GraphState } from '../../../shared/types';

interface GoogleState {
  accessToken: string | null;
  userInfo: { name: string; email: string; picture: string } | null;
  isConnected: boolean;
  isLoading: boolean;
  cloudFiles: Array<{ id: string; name: string; createdTime: string }>;
  activeFileId: string | null;
  activeFileName: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  fetchCloudFiles: () => Promise<void>;
  saveCurrentGraph: (name: string) => Promise<void>;
  loadCloudGraph: (id: string) => Promise<void>;
  deleteCloudGraph: (id: string) => Promise<void>;
  shareCurrentGraphPublicly: (filename: string) => Promise<string>;
}

const service = new GoogleDriveService();

export const useGoogleStore = create<GoogleState>((set, get) => ({
  accessToken: null,
  userInfo: null,
  isConnected: false,
  isLoading: false,
  cloudFiles: [],
  activeFileId: null,
  activeFileName: null,

  connect: async () => {
    set({ isLoading: true });
    try {
      const token = await service.authorize();

      let profile = null;
      try {
        const res = await fetch(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          profile = {
            name: data.name || 'Theory Crafter',
            email: data.email || 'user@gmail.com',
            picture: data.picture || '',
          };
        }
      } catch {
        profile = {
          name: 'RPG Theorist',
          email: 'cloud-user@gmail.com',
          picture: '',
        };
      }

      set({
        accessToken: token,
        userInfo: profile,
        isConnected: true,
      });

      await get().fetchCloudFiles();
    } catch (err) {
      console.error('Failed to authorize with Google:', err);
      get().disconnect();
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  disconnect: () => {
    service.setAccessToken(null);
    set({
      accessToken: null,
      userInfo: null,
      isConnected: false,
      cloudFiles: [],
      activeFileId: null,
      activeFileName: null,
    });
  },

  fetchCloudFiles: async () => {
    set({ isLoading: true });
    try {
      const files = await service.listGraphs();
      set({ cloudFiles: files });
    } catch (err) {
      console.error('Failed to load file list:', err);
    } finally {
      set({ isLoading: false });
    }
  },

  saveCurrentGraph: async (name: string) => {
    set({ isLoading: true });
    try {
      const canvasState = useStore.getState().getGraphState();
      await service.saveGraph(name, canvasState);
      await get().fetchCloudFiles();

      const fullFilename = name.endsWith('.calc') ? name : `${name}.calc`;
      const file = get().cloudFiles.find((f) => f.name === fullFilename);
      set({
        activeFileId: file ? file.id : null,
        activeFileName: name,
      });
    } catch (err) {
      console.error('Failed to save graph:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  loadCloudGraph: async (id: string) => {
    set({ isLoading: true });
    try {
      const graph: GraphState = await service.loadGraph(id);

      const file = get().cloudFiles.find((f) => f.id === id);
      const cleanName = file
        ? file.name.endsWith('.calc')
          ? file.name.slice(0, -5)
          : file.name
        : 'Cloud Graph';

      const flowNodes = graph.nodes.map((n, idx) => {
        const col = idx % 4;
        const row = Math.floor(idx / 4);
        return {
          id: n.id,
          type: n.type,
          position: { x: 80 + col * 220, y: 80 + row * 140 },
          data: {
            label: n.label || '',
            value: n.value,
            isPercentage: n.isPercentage,
            operator: n.operator,
          },
          style: {
            width: n.type === 'operator' ? 56 : 180,
            height: n.type === 'operator' ? 56 : 90,
          },
        };
      });

      const flowEdges = graph.edges.map((e, idx) => {
        const edgeItem = e as {
          source: string;
          target: string;
          sourceHandle?: string;
          targetHandle?: string;
        };
        return {
          id: `e-${e.source}-${e.target}-${idx}`,
          source: e.source,
          target: e.target,
          sourceHandle: edgeItem.sourceHandle,
          targetHandle: edgeItem.targetHandle,
        };
      });

      useStore.getState().setNodes(flowNodes);
      useStore.getState().setEdges(flowEdges);
      useStore.getState().setSelectedNodeId(null);

      set({
        activeFileId: id,
        activeFileName: cleanName,
      });
    } catch (err) {
      console.error('Failed to load graph:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCloudGraph: async (id: string) => {
    set({ isLoading: true });
    try {
      await service.deleteGraph(id);
      await get().fetchCloudFiles();
    } catch (err) {
      console.error('Failed to delete graph:', err);
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  shareCurrentGraphPublicly: async (filename: string) => {
    // Save the graph first so the file exists on Drive
    await get().saveCurrentGraph(filename);

    const fullFilename = filename.endsWith('.calc')
      ? filename
      : `${filename}.calc`;
    const file = get().cloudFiles.find((f) => f.name === fullFilename);
    if (!file) {
      throw new Error('Could not find the saved file to share.');
    }

    // Grant public read access to the file
    await service.shareFilePublicly(file.id);

    // Return a hash-based URL that Canvas will intercept on load
    return `${window.location.origin}${window.location.pathname}#/drive/${file.id}`;
  },
}));
