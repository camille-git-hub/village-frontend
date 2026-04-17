import type { ConnectionRequestsResponse, NetworkResponse} from "../types/network.ts";

const AUTH_URL = import.meta.env.VITE_AUTH_URL || "http://localhost:4000";


// Get user's network (all connections)
export const getNetwork = async (token: string): Promise<NetworkResponse> => {
  try {
    const response = await fetch(`${AUTH_URL}/network`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch network');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching network:', error);
    throw error;
  }
};

// Get connection requests (both received and sent)
export const getConnectionRequests = async (token: string): Promise<ConnectionRequestsResponse> => {
  try {
    const response = await fetch(`${AUTH_URL}/network/requests`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch connection requests');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching connection requests:', error);
    throw error;
  }
};

// Send a connection request
export const sendConnectionRequest = async (
  targetUserId: string,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${AUTH_URL}/network/request/${targetUserId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to send connection request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending connection request:', error);
    throw error;
  }
};

// Accept a connection request
export const acceptConnectionRequest = async (
  fromUserId: string,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${AUTH_URL}/network/accept/${fromUserId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to accept connection request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error accepting connection request:', error);
    throw error;
  }
};

// Decline a connection request
export const declineConnectionRequest = async (
  fromUserId: string,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${AUTH_URL}/network/decline/${fromUserId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to decline connection request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error declining connection request:', error);
    throw error;
  }
};

// Remove a connection from network
export const removeConnection = async (
  userId: string,
  token: string
): Promise<{ message: string }> => {
  try {
    const response = await fetch(`${AUTH_URL}/network/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove connection');
    }

    return await response.json();
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
};