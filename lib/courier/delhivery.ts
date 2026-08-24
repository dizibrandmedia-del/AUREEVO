import crypto from 'crypto';
import {
  CourierProvider,
  ServiceabilityResult,
  ShipmentInput,
  ShipmentResult,
  TrackingResult,
} from './provider';

export class DelhiveryCourierProvider implements CourierProvider {
  name = 'DELHIVERY';

  async checkServiceability(pincode: string): Promise<ServiceabilityResult> {
    const isServiceable = /^[1-9][0-9]{5}$/.test(pincode.trim());
    return {
      serviceable: isServiceable,
      pincode,
      city: 'National Air Delivery',
      state: 'India',
      estimatedDeliveryDays: 3,
      codAvailable: true,
      courierName: 'Delhivery Direct Air',
    };
  }

  async createShipment(input: ShipmentInput): Promise<ShipmentResult> {
    const awbNumber = `DEL-${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingUrl = `https://www.delhivery.com/track/package/${awbNumber}`;

    return {
      success: true,
      awbNumber,
      courier: this.name,
      trackingUrl,
      status: 'CREATED',
    };
  }

  async trackShipment(awbNumber: string): Promise<TrackingResult> {
    return {
      awbNumber,
      courier: this.name,
      currentStatus: 'IN_TRANSIT',
      timeline: [
        {
          status: 'Manifest Generated',
          location: 'Delhivery Surface Hub',
          timestamp: new Date().toISOString(),
          description: 'Shipment received at primary fulfillment warehouse',
        },
      ],
    };
  }

  async cancelShipment(awbNumber: string): Promise<{ success: boolean; error?: string }> {
    return { success: true };
  }
}
