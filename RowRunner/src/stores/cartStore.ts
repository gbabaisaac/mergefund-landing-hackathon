import { create } from 'zustand';

export type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
};

type CartState = {
  items: CartItem[];
  venueId: string | null;
  venueName: string | null;
  eventId: string | null;
  eventName: string | null;
  customerName: string;
  section: string;
  row: string;
  seat: string;
  phone: string;
  email: string;
  timingType: 'asap' | 'scheduled';
  scheduledAt: string | null;
  tipPercent: number;
  customTipDollars: number | null;
  notes: string;
  allergyNotes: string;

  setVenue: (id: string, name: string) => void;
  setEvent: (id: string, name: string) => void;
  setCustomerName: (name: string) => void;
  setSeat: (section: string, row: string, seat: string) => void;
  setPhone: (phone: string) => void;
  setEmail: (email: string) => void;
  setTiming: (type: 'asap' | 'scheduled', at?: string) => void;
  setTipPercent: (pct: number) => void;
  setCustomTipDollars: (amount: number | null) => void;
  setNotes: (notes: string) => void;
  setAllergyNotes: (notes: string) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  clearCart: () => void;
  subtotal: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  venueId: null,
  venueName: null,
  eventId: null,
  eventName: null,
  customerName: '',
  section: '',
  row: '',
  seat: '',
  phone: '',
  email: '',
  timingType: 'asap',
  scheduledAt: null,
  tipPercent: 20,
  customTipDollars: null,
  notes: '',
  allergyNotes: '',

  setVenue: (id, name) => set({ venueId: id, venueName: name, eventId: null, eventName: null }),
  setEvent: (id, name) => set({ eventId: id, eventName: name }),
  setCustomerName: (customerName) => set({ customerName }),
  setSeat: (section, row, seat) => set({ section, row, seat }),
  setPhone: (phone) => set({ phone }),
  setEmail: (email) => set({ email }),
  setTiming: (type, at) => set({ timingType: type, scheduledAt: at ?? null }),
  setTipPercent: (pct) => set({ tipPercent: pct, customTipDollars: null }),
  setCustomTipDollars: (amount) => set({ customTipDollars: amount, tipPercent: -1 }),
  setNotes: (notes) => set({ notes }),
  setAllergyNotes: (allergyNotes) => set({ allergyNotes }),

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return { items: state.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)) };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, qty) =>
    set((state) => ({
      items: qty <= 0
        ? state.items.filter((i) => i.id !== id)
        : state.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
    })),

  clearCart: () =>
    set({
      items: [],
      customerName: '',
      section: '',
      row: '',
      seat: '',
      phone: '',
      email: '',
      tipPercent: 20,
      customTipDollars: null,
      scheduledAt: null,
      timingType: 'asap',
      notes: '',
      allergyNotes: '',
    }),

  subtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
  itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
}));
