import { createFileRoute, Link } from "@tanstack/react-router";
import hero from "@/assets/hero.jpg";
import dishes from "@/assets/dishes.jpg";
import { CATEGORY_IMAGE, MENU, RESTAURANT, formatPrice } from "@/lib/restaurant";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Saffron Table — Indian Restaurant in Bengaluru" },
      { name: "description", content: "Home-style Indian cooking in Bengaluru. Browse the menu and reserve a table online." },
      { property: "og:title", content: "Saffron Table — Indian Restaurant in Bengaluru" },
      { property: "og:description", content: "Browse the menu and reserve a table online." },
    ],
  }),
  component: Home,
});

function Home() {
  const popular = MENU.filter((d) => d.popular);
  return (
    <>
      <section className="relative">
        <img src={hero} alt="Candlelit dining room at Saffron Table" width={1600} height={912} className="h-[70vh] min-h-[420px] w-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="absolute inset-0 mx-auto flex max-w-6xl flex-col justify-end px-5 pb-16 text-ink-foreground">
          <p className="text-sm font-semibold uppercase tracking-widest text-accent">Welcome to</p>
          <h1 className="mt-2 text-5xl font-semibold md:text-7xl">{RESTAURANT.name}</h1>
          <p className="mt-4 max-w-lg text-lg opacity-90">{RESTAURANT.tagline}</p>
          <Link to="/reserve" className="mt-8 w-fit rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:bg-primary/90">Reserve a Table</Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-5 py-16 md:grid-cols-2 md:items-center">
        <div>
          <h2 className="text-3xl font-semibold">About us</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Saffron Table is a 40-seat family restaurant serving recipes from across India — slow-cooked dals,
            dum biryanis and fresh tandoor grills. We keep the menu short so everything is made fresh each day.
          </p>
          <p className="mt-3 text-sm font-medium">{RESTAURANT.hours}</p>
        </div>
        <img src={dishes} alt="Four signature dishes" width={1200} height={800} loading="lazy" className="rounded-lg shadow-md" />
      </section>

      <section className="mx-auto max-w-6xl px-5">
        <div className="flex items-end justify-between">
          <h2 className="text-3xl font-semibold">Popular dishes</h2>
          <Link to="/menu" className="text-sm font-semibold text-primary hover:underline">Full menu →</Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {popular.map((d) => (
            <article key={d.name} className="overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
              <div className="h-40 bg-cover" style={{ backgroundImage: `url(${dishes})`, backgroundSize: "200%", backgroundPosition: CATEGORY_IMAGE[d.category] }} />
              <div className="p-4">
                <h3 className="text-lg font-semibold">{d.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d.description}</p>
                <p className="mt-3 font-semibold text-primary">{formatPrice(d.price)}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
