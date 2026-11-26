import type { ChainOption } from './PropertySwitcher';

/** Sample data for stories (fictional properties). */
export const GMH: ChainOption = {
  id: 'gmh', name: 'Grand Metropolitan Hotels', properties: [
    { id: 'mum', name: 'Grand Hotel Mumbai', city: 'Mumbai' },
    { id: 'del', name: 'The Metropolitan Delhi', city: 'New Delhi' },
    { id: 'goa', name: 'Grand Hotel Goa', city: 'Goa', status: 'delayed' },
    { id: 'blr', name: 'Metropolitan Bengaluru', city: 'Bengaluru' },
    { id: 'jai', name: 'Grand Palace Jaipur', city: 'Jaipur' },
    { id: 'dxb', name: 'Grand Hotel Dubai', city: 'Dubai', status: 'offline' },
    { id: 'lon', name: 'The Metropolitan London', city: 'London' },
    { id: 'sgp', name: 'Grand Hotel Singapore', city: 'Singapore' },
  ],
};
export const AURORA: ChainOption = {
  id: 'aurora', name: 'Aurora Boutique Hotels', properties: [
    { id: 'lis', name: 'Aurora Lisbon', city: 'Lisbon' },
    { id: 'opo', name: 'Aurora Porto', city: 'Porto' },
    { id: 'mad', name: 'Aurora Madrid', city: 'Madrid' },
  ],
};
/** A GM-style user: one chain, a few properties */
export const ONE_CHAIN: ChainOption[] = [{ ...GMH, properties: GMH.properties.slice(0, 4) }];
/** RHIA onboarding staff / a user in two chains */
export const MULTI_CHAIN: ChainOption[] = [GMH, AURORA];
