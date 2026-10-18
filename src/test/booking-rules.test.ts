import { describe, expect, it } from "vitest";
import { BOOKING_RULES, timeSlots } from "@/lib/restaurant";

describe("booking rules", () => {
  it("offers 30-minute slots from 12:00 to 20:30", () => {
    const slots = timeSlots();
    expect(slots[0]).toBe("12:00");
    expect(slots.at(-1)).toBe("20:30");
    expect(slots).toHaveLength(18);
  });
  it("caps capacity at 40 seats and 10 guests per booking", () => {
    expect(BOOKING_RULES.totalSeats).toBe(40);
    expect(BOOKING_RULES.maxGuests).toBe(10);
  });
});
