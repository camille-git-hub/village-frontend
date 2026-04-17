export type NetworkUser = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type ConnectionRequest = {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export type NetworkResponse = {
  connections: NetworkUser[];
  receivedCount: number;
  sentCount: number;
}

export type ConnectionRequestsResponse = {
  received: ConnectionRequest[];
  sent: ConnectionRequest[];
}

