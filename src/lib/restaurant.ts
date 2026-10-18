// Restaurant details and menu data in one place so they are easy to edit.
// Booking rules here must match the database trigger `validate_reservation`.

export const RESTAURANT = {
  name: "Saffron Table",
  tagline: "Home-style Indian cooking, served slowly.",
  address: "14 Residency Road, Bengaluru 560025",
  phone: "+91 80 4123 5678",
  email: "hello@saffrontable.in",
  hours: "Open daily, 12:00 – 22:00",
};

export const BOOKING_RULES = {
  totalSeats: 40,
  maxGuests: 10,
  firstSlot: "12:00",
  lastSlot: "20:30",
  slotMinutes: 30,
  durationHours: 2,
  maxDaysAhead: 60,
};

/** All bookable start times, e.g. ["12:00", "12:30", ... "20:30"]. */
export function timeSlots(): string[] {
  const slots: string[] = [];
  for (let m = 12 * 60; m <= 20 * 60 + 30; m += BOOKING_RULES.slotMinutes) {
    slots.push(`${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`);
  }
  return slots;
}

export type Dish = {
  name: string;
  description: string;
  price: number;
  category: "Mains" | "Biryani & Rice" | "From the Grill" | "Desserts";
  veg: boolean;
  popular?: boolean;
};

// The photo position for each category (one photo shows four plates).
export const CATEGORY_IMAGE: Record<Dish["category"], string> = {
  Mains: "0% 0%",
  "Biryani & Rice": "100% 0%",
  "From the Grill": "0% 100%",
  Desserts: "100% 100%",
};

export const MENU: Dish[] = [
  { name: "Paneer Makhani", description: "Cottage cheese in a buttery tomato and fenugreek gravy.", price: 340, category: "Mains", veg: true, popular: true },
  { name: "Dal Saffron", description: "Black lentils simmered overnight with cream and garlic.", price: 290, category: "Mains", veg: true },
  { name: "Kerala Chicken Curry", description: "Coconut milk, curry leaves and black pepper.", price: 380, category: "Mains", veg: false },
  { name: "Hyderabadi Chicken Biryani", description: "Dum-cooked basmati with saffron, mint and fried onions.", price: 420, category: "Biryani & Rice", veg: false, popular: true },
  { name: "Subz Biryani", description: "Seasonal vegetables layered with fragrant rice.", price: 340, category: "Biryani & Rice", veg: true },
  { name: "Jeera Rice", description: "Basmati tempered with cumin and ghee.", price: 160, category: "Biryani & Rice", veg: true },
  { name: "Tawa Fish Fry", description: "Seer fish in a red masala crust with onion salad.", price: 460, category: "From the Grill", veg: false, popular: true },
  { name: "Tandoori Broccoli", description: "Charred florets in a cheese and cardamom marinade.", price: 310, category: "From the Grill", veg: true },
  { name: "Mutton Seekh Kebab", description: "Minced lamb skewers with mint chutney.", price: 450, category: "From the Grill", veg: false },
  { name: "Mango Kulfi", description: "Slow-reduced milk ice cream with Alphonso mango.", price: 180, category: "Desserts", veg: true, popular: true },
  { name: "Gulab Jamun", description: "Two warm dumplings in rose and cardamom syrup.", price: 150, category: "Desserts", veg: true },
];

export const formatPrice = (n: number) => `₹${n}`;
