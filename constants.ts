
import { Service } from './types';

export const SERVICES: Service[] = [
  { id: '1', name: 'Signature Fade', price: 1000 },
  { id: '2', name: 'Classic Cut', price: 1000 },
  { id: '3', name: 'The Lineup', price: 500 },
  { id: '4', name: 'Full Hair Dye + Beard Sculpt', price: 1800 },
  { id: '5', name: 'The Fullup (Fade + Edges Only)', price: 1200 },
];

export const SPENDING_THRESHOLD = 5000;
export const BONUS_AMOUNT = 500;
export const VIP_SUBSCRIPTION_FEE = 2500;
export const ROOM_SERVICE_FEE = 500;

export const THEME = {
  black: '#000000',
  gold: '#D4AF37',
  white: '#FFFFFF',
};
