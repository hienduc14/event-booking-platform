export type TicketBookingInput = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  ticketType: "gold" | "silver" | "bronze" | "plastic" | "vip";
  quantity: number;
};
