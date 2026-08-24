import crypto from 'crypto';
import {
  CourierProvider,
  ServiceabilityResult,
  ShipmentInput,
  ShipmentResult,
  TrackingResult,
} from './provider';

export class BlueDartCourierProvider implements CourierProvider {
  name = 'BLUE_DART';

  async checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const isServiceable = /^[1-9][0-9]{5}$/.test(pincode.trim());
    const isMetro = ['400', '110', '560', '700', '600', '500'].some((p) =>
      pincode.startsWith(p)
    );

    return {
      serviceable: isServiceable,
      pincode,
      city: isMetro ? 'Metro Luxury Hub' : 'Regional Express Zone',
      state: 'India',
      estimatedDeliveryDays: isMetro ? 1 : 3,
      codAvailable: true,
      courierName: 'Blue Dart Luxury Express',
    };
  }

  async createShipment(input: ShipmentInput): Promise<ShipmentResult> {
    const awbNumber = `BD-LUX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const trackingUrl = `https://www.bluedart.com/tracking/${awbNumber}`;

    return {
      success: true,
      awbNumber,
      courier: this.name,
      trackingUrl,
      labelUrl: `/api/admin/shipments/${awbNumber}/label`,
      status: 'CREATED',
    };
  }

  async trackShipment(awbNumber: string): Promise<TrackingResult> {
    const now = new Date();
    return {
      awbNumber,
      courier: this.name,
      currentStatus: 'IN_TRANSIT',
      estimatedDeliveryDate: new Date(now.getTime() + 86400000 * 2).toISOString().split('T')[0],
      timeline: [
        {
          status: 'Shipment Created',
          location: 'Central Vault Fulfillment Center, Mumbai',
          timestamp: new Date(now.getTime() - 86400000).toISOString(),
          description: 'Package picked up by Blue Dart Luxury Dispatch Officer',
        },
        {
          status: 'In Transit',
          location: 'Main Logistics Hub',
          timestamp: now.toISOString(),
          description: 'Package sorted and in transit to destination delivery center',
        },
      ],
    };
  }

  async cancelShipment(awbNumber: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
