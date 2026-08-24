import { CourierProvider } from './provider';
import { BlueDartCourierProvider } from './bluedart';
import { DelhiveryCourierProvider } from './delhivery';

const courierProviders: Record<string, CourierProvider> = {
  BLUE_DART: new BlueDartCourierProvider(),
  DELHIVERY: new DelhiveryCourierProvider(),
};

export function getCourierProvider(courierName: string = 'BLUE_DART'): CourierProvider {
  const normalized = courierName.toUpperCase();
  if (courierProviders[normalized]) {
    return courierProviders[normalized];
  }
  return courierProviders['BLUE_DART'];
}

export * from './provider';
