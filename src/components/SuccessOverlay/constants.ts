import { Dimensions } from 'react-native'

export const SW = Dimensions.get('window').width

export const CONF = [
  { id: 0,  tx: -75,  ty: -100, w: 9,  h: 4, color: '#075985', rot: 32,  delay: 460 },
  { id: 1,  tx: 55,   ty: -118, w: 6,  h: 3, color: '#34d399', rot: -22, delay: 480 },
  { id: 2,  tx: 108,  ty: -50,  w: 11, h: 4, color: '#0ea5e9', rot: 50,  delay: 450 },
  { id: 3,  tx: 94,   ty: 44,   w: 7,  h: 3, color: '#075985', rot: -40, delay: 500 },
  { id: 4,  tx: 40,   ty: 108,  w: 9,  h: 4, color: '#34d399', rot: 64,  delay: 470 },
  { id: 5,  tx: -44,  ty: 114,  w: 6,  h: 5, color: '#0ea5e9', rot: -54, delay: 490 },
  { id: 6,  tx: -104, ty: 50,   w: 8,  h: 3, color: '#075985', rot: 26,  delay: 462 },
  { id: 7,  tx: -116, ty: -30,  w: 7,  h: 4, color: '#34d399', rot: -44, delay: 515 },
  { id: 8,  tx: 20,   ty: -135, w: 5,  h: 3, color: '#fbbf24', rot: 60,  delay: 472 },
  { id: 9,  tx: 124,  ty: -10,  w: 6,  h: 4, color: '#fbbf24', rot: -28, delay: 530 },
  { id: 10, tx: 70,   ty: 95,   w: 8,  h: 3, color: '#fbbf24', rot: 44,  delay: 478 },
  { id: 11, tx: -84,  ty: -84,  w: 5,  h: 4, color: '#0ea5e9', rot: -64, delay: 508 },
  { id: 12, tx: -32,  ty: -128, w: 7,  h: 3, color: '#34d399', rot: 18,  delay: 494 },
  { id: 13, tx: 82,   ty: -90,  w: 6,  h: 4, color: '#075985', rot: -32, delay: 520 },
  { id: 14, tx: -118, ty: 12,   w: 8,  h: 3, color: '#fbbf24', rot: 52,  delay: 466 },
  { id: 15, tx: 32,   ty: 122,  w: 5,  h: 5, color: '#0ea5e9', rot: -72, delay: 510 },
] as const

export type ConfettiParticle = (typeof CONF)[number]
