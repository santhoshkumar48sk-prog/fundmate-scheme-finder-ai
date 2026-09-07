/**
 * Fundmate — Smart Partner Router.
 * Finds the nearest eligible channel partner (SCA / Bank / NBFC-MFI) for the
 * user's top scheme using:
 *   1. the user's geolocation (browser API, with a Coimbatore demo fallback)
 *   2. Haversine distance ranking  (src/lib/partners.ts)
 *   3. live fund-utilisation eligibility — a partner is listed only if its
 *      uncommitted FY balance can cover the user's requested loan amount
 * Map: Leaflet + OpenStreetMap tiles (free, no API key).
 */
import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ExternalLink, Loader2, MapPin, Navigation, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLang } from "@/components/language";
import { StatusLed } from "@/components/terminal";
import {
  PARTNERS,
  rankPartners,
  type PartnerType,
  type RankedPartner,
} from "@/lib/partners";
import { inrCompact } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Coimbatore fallback so the demo works without geolocation permission. */
const DEMO_LOC = { lat: 11.0168, lng: 76.9558 };

const TYPE_COLOR: Record<PartnerType, string> = {
  SCA: "#16A34A", // success green
  BANK: "#2563EB", // info blue
  "NBFC-MFI": "#F59E0B", // warning amber
};

function markerIcon(type: PartnerType) {
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:14px;height:14px;border-radius:9999px;background:${TYPE_COLOR[type]};border:2px solid #fff;box-shadow:0 0 0 1px rgba(0,0,0,.35)"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

function Recenter({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], 10);
  }, [lat, lng, map]);
  return null;
}

type Props = {
  schemeId?: string;
  schemeName?: string;
  amount: number; // requested loan amount in ₹
  className?: string;
};

export function PartnerMap({ schemeId, schemeName, amount, className }: Props) {
  const { t } = useLang();
  const [loc, setLoc] = useState(DEMO_LOC);
  const [locating, setLocating] = useState(false);
  const [isDemo, setIsDemo] = useState(true);

  const ranked = useMemo(
    () => rankPartners(schemeId, amount, loc),
    [schemeId, amount, loc],
  );

  const locate = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setIsDemo(false);
        setLocating(false);
      },
      () => {
        setLocating(false);
        setIsDemo(true);
      },
      { timeout: 8000 },
    );
  };

  /* Fallback when the fund filter leaves nobody: ignore scheme binding but
     still respect funds, so users see the nearest funded offices. */
  const shown: RankedPartner[] = ranked.length > 0 ? ranked : rankPartners(undefined, amount, loc);
  const noFunds = shown.length === 0;

  return (
    <div className={cn("overflow-hidden rounded-md border border-border bg-card", className)}>
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-secondary/70 px-3 py-2">
        <Navigation className="size-3.5 text-primary" />
        <span className="font-mono text-[11px] font-semibold">{t("partners.title")}</span>
        {schemeName && (
          <span className="truncate rounded-[3px] border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            {schemeName}
          </span>
        )}
        <Button
          size="sm"
          variant="outline"
          className="ml-auto h-7 px-2 font-mono text-[10px]"
          onClick={locate}
          disabled={locating}
        >
          {locating ? <Loader2 className="size-3 animate-spin" /> : <MapPin className="size-3" />}
          {locating ? t("partners.locating") : t("partners.useLocation")}
        </Button>
      </div>

      <div className="grid gap-0 lg:grid-cols-[1fr_320px]">
        {/* Map */}
        <div className="relative h-64 lg:h-80">
          <MapContainer
            center={[loc.lat, loc.lng]}
            zoom={10}
            scrollWheelZoom={false}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Recenter lat={loc.lat} lng={loc.lng} />
            <Circle
              center={[loc.lat, loc.lng]}
              radius={8000}
              pathOptions={{ color: "#243B7A", weight: 1, fillOpacity: 0.05 }}
            />
            {shown.slice(0, 8).map((p) => (
              <Marker key={p.id} position={[p.lat, p.lng]} icon={markerIcon(p.type)}>
                <Popup>
                  <div className="font-mono text-[11px]">
                    <b>{p.name}</b>
                    <br />
                    {p.type} · {p.district}
                    <br />
                    {t("partners.fundUtilisation")}: {Math.round((p.available / p.funds.allocated) * 100)}% free
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
          {isDemo && (
            <span className="absolute left-2 top-2 z-[1000] rounded-[3px] border border-warning/40 bg-warning-light/90 px-2 py-0.5 font-mono text-[9px] text-warning-foreground">
              {t("partners.denied")}
            </span>
          )}
        </div>

        {/* Ranked list */}
        <div className="max-h-80 space-y-2 overflow-y-auto border-t border-border p-3 lg:border-l lg:border-t-0">
          {noFunds && (
            <p className="rounded-[3px] border border-warning/30 bg-warning-light p-2 font-mono text-[10px] leading-4 text-warning-foreground">
              {t("partners.noPartners")}
            </p>
          )}
          {shown.slice(0, 6).map((p, i) => (
            <div
              key={p.id}
              className={cn(
                "rounded-[3px] border p-2.5",
                i === 0 ? "border-primary/40 bg-primary/[0.06]" : "border-border bg-background",
              )}
            >
              <div className="flex items-center gap-2">
                <StatusLed
                  tone={p.status === "available" ? "green" : p.status === "low" ? "amber" : "red"}
                  pulse={p.status === "available"}
                />
                <span className="truncate font-mono text-[11px] font-semibold">{p.name}</span>
                <span className="ml-auto shrink-0 font-mono text-[10px] text-muted-foreground">
                  {p.distance < 10 ? p.distance.toFixed(1) : Math.round(p.distance)} km {t("partners.away")}
                </span>
              </div>
              <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                {p.type} · {p.address}
              </p>
              <p className="mt-0.5 font-mono text-[10px]">
                <span className="text-muted-foreground">{t("partners.fundsAvailable")}:</span>{" "}
                <span className={cn(p.status === "available" ? "text-primary" : "text-warning-foreground")}>
                  ₹{p.available}L
                </span>{" "}
                <span className="text-muted-foreground">
                  ({inrCompact(p.available * 100000)} uncommitted)
                </span>
                {i === 0 && (
                  <span className="ml-1.5 rounded-[2px] bg-primary px-1 py-0.5 text-[9px] font-semibold text-primary-foreground">
                    {t("partners.applyNow")}
                  </span>
                )}
              </p>
              <div className="mt-1.5 flex gap-1.5">
                <a
                  className="inline-flex h-6 items-center gap-1 rounded-[3px] border border-border bg-card px-2 font-mono text-[10px] hover:border-primary/40"
                  href={`https://www.openstreetmap.org/directions?from=${loc.lat},${loc.lng}&to=${p.lat},${p.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="size-3" /> {t("partners.directions")}
                </a>
                <a
                  className="inline-flex h-6 items-center gap-1 rounded-[3px] border border-border bg-card px-2 font-mono text-[10px] hover:border-primary/40"
                  href={`tel:${p.phone.replace(/\s/g, "")}`}
                >
                  <Phone className="size-3" /> {t("partners.call")}
                </a>
              </div>
            </div>
          ))}
          <p className="pt-1 font-mono text-[9px] leading-3 text-muted-foreground">
            {PARTNERS.length} partners tracked · funds ledger is prototype data · SCA
            <span style={{ color: TYPE_COLOR.SCA }}> ●</span> BANK
            <span style={{ color: TYPE_COLOR.BANK }}> ●</span> NBFC-MFI
            <span style={{ color: TYPE_COLOR["NBFC-MFI"] }}> ●</span>
          </p>
        </div>
      </div>
    </div>
  );
}
