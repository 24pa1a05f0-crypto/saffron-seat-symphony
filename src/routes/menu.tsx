import { createFileRoute } from "@tanstack/react-router";
import dishes from "@/assets/dishes.jpg";
import { PageTitle } from "@/components/SiteLayout";
import { CATEGORY_IMAGE, MENU, formatPrice, type Dish } from "@/lib/restaurant";

export const Route = createFileRoute("/menu")({
  head: () => ({
    meta: [
      { title: "Menu — Saffron Table" },
      { name: "description", content: "Mains, biryanis, grills and desserts at Saffron Table, with prices." },
      { property: "og:title", content: "Menu — Saffron Table" },
      { property: "og:description", content: "Mains, biryanis, grills and desserts with prices." },
    ],
  }),
  component: MenuPage,
});

const CATEGORIES: Dish["category"][] = ["Mains", "Biryani & Rice", "From the Grill", "Desserts"];

function MenuPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <PageTitle title="Our Menu" subtitle="Prices include GST. Please tell us about allergies when booking." />
      {CATEGORIES.map((cat) => (
        <section key={cat} className="mb-12">
          <div className="mb-5 flex items-center gap-4">
            <div className="h-16 w-16 shrink-0 rounded-full bg-cover" style={{ backgroundImage: `url(${dishes})`, backgroundSize: "200%", backgroundPosition: CATEGORY_IMAGE[cat] }} />
            <h2 className="text-2xl font-semibold">{cat}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {MENU.filter((d) => d.category === cat).map((d) => (
              <div key={d.name} className="flex justify-between gap-4 rounded-lg border bg-card p-4 transition-colors hover:border-primary/40">
                <div>
                  <h3 className="font-semibold">
                    <span className={`mr-2 inline-block h-2.5 w-2.5 rounded-full ${d.veg ? "bg-success" : "bg-destructive"}`} title={d.veg ? "Vegetarian" : "Non-vegetarian"} />
                    {d.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                </div>
                <p className="font-semibold text-primary">{formatPrice(d.price)}</p>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
