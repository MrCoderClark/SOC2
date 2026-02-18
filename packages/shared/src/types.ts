// Shared type definitions

export interface User {
  id: string;
  email: string;
  name: string;
  organizationId: string;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: Date;
}

export type ControlStatus = "not_started" | "in_progress" | "implemented" | "verified";

export interface Control {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ControlStatus;
}
