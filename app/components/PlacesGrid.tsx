import type { PlaceCard } from "../data/anniversaryData";

type PlacesGridProps = {
  places: PlaceCard[];
};

export default function PlacesGrid({ places }: PlacesGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {places.map((place) => (
        <div
          key={place.id}
          className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_0_30px_rgba(0,112,243,0.2)] backdrop-blur"
        >
          <div className="relative h-44 w-full bg-white/5">
            <iframe
              title={`Mapa ${place.title}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(
                place.mapQuery,
              )}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full w-full border-0"
            />
          </div>
          <div className="space-y-2 px-5 py-4">
            <h3 className="text-xl font-semibold text-white">
              {place.title}
            </h3>
            <p className="text-sm text-white/70">{place.description}</p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                place.mapQuery,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-xs font-semibold text-[#7ac4ff] hover:text-white"
            >
              Ver en Google Maps
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
