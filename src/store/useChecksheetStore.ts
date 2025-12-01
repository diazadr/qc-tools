import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SnapshotData {
  type: string;
  data: any;
  timestamp: number;
}

interface StoreState {
  snapshots: Record<string, SnapshotData>;
  setSnapshot: (type: string, data: any) => void;
  getSnapshot: (type: string) => SnapshotData | null;
  clearSnapshot: (type: string) => void;
  clearAllSnapshots: () => void;
}

export const useChecksheetStore = create<StoreState>()(
  persist(
    (set, get) => ({
      snapshots: {},

      setSnapshot: (type, data) => {
        set(state => ({
          snapshots: {
            ...state.snapshots,
            [type]: { type, data, timestamp: Date.now() }
          }
        }))
      },

      getSnapshot: (type) => {
        return get().snapshots[type] || null;
      },

      clearSnapshot: (type) => {
        set(state => {
          const updated = { ...state.snapshots };
          delete updated[type];
          return { snapshots: updated };
        });
      },

      clearAllSnapshots: () => {
        set({ snapshots: {} });
      }
    }),
    { name: "qc-checksheet-global" }
  )
)
