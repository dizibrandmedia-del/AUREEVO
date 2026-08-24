export interface ServiceabilityResult {
  serviceable: boolean;
  pincode: string;
  city: string;
  state: string;
  estimatedDeliveryDays: number;
  codAvailable: boolean;
  courierName: string;
}

export interface ShipmentInput {
  orderId: string;
  orderNumber: string;
  recipient: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  items: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  isCod: boolean;
  deliveryMethod?: string;
}

export interface ShipmentResult {
  success: boolean;
  awbNumber: string;
  courier: string;
  trackingUrl: string;
  labelUrl?: string;
  status: string;
  error?: string;
}

export interface TrackingCheckpoint {
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

export interface TrackingResult {
  awbNumber: string;
  courier: string;
  currentStatus: string;
  estimatedDeliveryDate?: string;
  timeline: TrackingCheckpoint[];
}

export interface CourierProvider {
  name: string;
  checkServiceability(pincode: string): Promise<ServiceabilityResult>;
  createShipment(input: ShipmentInput): Promise<ShipmentResult>;
  trackShipment(awbNumber: string): Promise<TrackingResult>;
  cancelShipment(awbNumber: string): Promise<{ success: boolean; error?: string }>;
}
