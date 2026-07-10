export interface GamePackage {
  n: string; // package name / diamonds / UC quantity
  p: number; // package price in RS
}

export interface UserData {
  name: string;
  email: string;
  uniqueId: string;
  balance: number;
  blocked?: boolean;
}

export interface DepositRequest {
  uid: string;
  email: string;
  amount: number;
  trx: string;
  status: "pending" | "approved" | "rejected";
}
