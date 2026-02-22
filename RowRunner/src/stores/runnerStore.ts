import { create } from 'zustand';

export type OrderStatus = 'pending' | 'claimed' | 'confirmed' | 'delivered' | 'cancelled';

export type RunnerOrder = {
  id: string;
  status: OrderStatus;
  section: string;
  row: string;
  seat: string;
  restaurant_name: string;
  items: { name: string; quantity: number }[];
  total: number;
  created_at: string;
};

type RunnerState = {
  runnerId: string | null;
  venueId: string | null;
  venueName: string | null;
  eventId: string | null;
  eventName: string | null;
  activeOrders: RunnerOrder[];
  setRunner: (id: string) => void;
  setVenue: (id: string, name: string) => void;
  setEvent: (id: string, name: string) => void;
  setOrders: (orders: RunnerOrder[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  clear: () => void;
};

export const useRunnerStore = create<RunnerState>((set) => ({
  runnerId: null,
  venueId: null,
  venueName: null,
  eventId: null,
  eventName: null,
  activeOrders: [],
  setRunner: (id) => set({ runnerId: id }),
  setVenue: (id, name) => set({ venueId: id, venueName: name }),
  setEvent: (id, name) => set({ eventId: id, eventName: name }),
  setOrders: (orders) => set({ activeOrders: orders }),
  updateOrderStatus: (orderId, status) =>
    set((state) => ({
      activeOrders: state.activeOrders.map((o) => (o.id === orderId ? { ...o, status } : o)),
    })),
  clear: () => set({ runnerId: null, venueId: null, venueName: null, eventId: null, eventName: null, activeOrders: [] }),
}));
