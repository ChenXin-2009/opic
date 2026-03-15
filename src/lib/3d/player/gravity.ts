import { AU_IN_KM } from '@/lib/astronomy/utils/constants';

const AU_KM_CUBED = AU_IN_KM * AU_IN_KM * AU_IN_KM;

const GM_KM3_S2: Record<string, number> = {
  sun: 1.32712440018e11,
  mercury: 2.2032e4,
  venus: 3.24859e5,
  earth: 3.986004418e5,
  moon: 4.902800066e3,
  mars: 4.282837e4,
  jupiter: 1.26686534e8,
  saturn: 3.7931187e7,
  uranus: 5.793939e6,
  neptune: 6.836529e6,
};

const GM_AU3_S2: Record<string, number> = Object.fromEntries(
  Object.entries(GM_KM3_S2).map(([name, mu]) => [name, mu / AU_KM_CUBED])
);

export function getGravitationalParameterAU(name: string): number | null {
  const key = name.toLowerCase();
  return GM_AU3_S2[key] ?? null;
}
