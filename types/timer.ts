export interface TimerData {
  username: string;          // Twitter username as the key
  imagekey: string;          // Key for locally stored image, lowercase for PostgreSQL compatibility
  goaldescription: string;   // User's goal description, lowercase for PostgreSQL compatibility
  deadline: string;          // Deadline timestamp (ISO string)
  friendemail: string;       // Friend's email for notification, lowercase for PostgreSQL compatibility
  createdat: string;         // When the timer was created (ISO string), lowercase for PostgreSQL compatibility
  confirmationtoken: string; // UUID for email verification, lowercase for PostgreSQL compatibility
  isverified: boolean;       // Whether the timer has been verified, lowercase for PostgreSQL compatibility
}

export interface TimerResponse {
  success: boolean;
  data?: TimerData;
  error?: string;
}
