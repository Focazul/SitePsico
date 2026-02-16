import { useEffect, useRef, useState } from "react";
import { MapPin, Loader } from "lucide-react";

interface MapProps {
  latitude?: number;
  longitude?: number;
  title?: string;
  address?: string;
  phoneNumber?: string;
  hours?: string;
  zoom?: number;
  height?: string;
  className?: string;
}

/**
 * Componente de Mapa do Google Maps - Fase 6.5
 * Renderiza um mapa interativo com marcador customizado
 * Inclui info window com detalhes de localização
 */
export default function Map({
  latitude = -23.5505,
  longitude = -46.6333,
  title = "Consultório de Psicologia",
  address = "São Paulo, SP",
  phoneNumber = "(11) 99999-9999",
  hours = "Seg-Sex: 09:00 - 18:00",
  zoom = 15,
  height = "400px",
  className = "",
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGoogleMaps = async () => {
      try {
        // Verifica se Google Maps já está carregado
        if ((window as any).google?.maps) {
          initMap();
          return;
        }

        // Criar script tag com bibliotecas necessárias
        const script = document.createElement("script");
        script.src = `https://maps.googleapis.com/maps/api/js?key=${
          import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ""
        }&libraries=marker,places,geocoding`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
          initMap();
        };

        script.onerror = () => {
          setError(
            "Falha ao carregar Google Maps. Verifique sua chave de API.",
          );
          setIsLoading(false);
          console.error("[Maps] Script loading failed");
        };

        document.head.appendChild(script);
      } catch (err) {
        setError("Erro ao carregar mapa");
        setIsLoading(false);
        console.error("[Maps] Error loading Google Maps:", err);
      }
    };

    const initMap = () => {
      if (!mapRef.current) return;

      try {
        // Criar mapa com estilo customizado
        const map = new (window as any).google.maps.Map(mapRef.current, {
          zoom,
          center: { lat: latitude, lng: longitude },
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          zoomControl: true,
          // Estilo minimalista e limpo
          styles: [
            {
              featureType: "all",
              elementType: "labels.text.fill",
              stylers: [{ color: "#616161" }],
            },
            {
              featureType: "all",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#f5f5f5" }],
            },
            {
              featureType: "administrative",
              elementType: "geometry.stroke",
              stylers: [{ color: "#c9c9c9" }],
            },
            {
              featureType: "administrative.land_parcel",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "poi",
              elementType: "geometry",
              stylers: [{ color: "#eeeeee" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#ffffff" }],
            },
            {
              featureType: "road.arterial",
              elementType: "geometry",
              stylers: [{ color: "#fafafa" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#e0f2fe" }],
            },
          ],
        });

        // Adicionar marcador customizado com icon azul
        const marker = new (window as any).google.maps.marker.AdvancedMarkerElement(
          {
            map,
            position: { lat: latitude, lng: longitude },
            title,
          },
        );

        // Criar info window com detalhes
        const infoWindowContent = `
          <div class="p-4 max-w-sm">
            <div class="flex items-start gap-3">
              <svg class="w-5 h-5 text-primary flex-shrink-0 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
              </svg>
              <div>
                <h3 class="font-bold text-gray-900">${title}</h3>
                <p class="text-sm text-gray-600 mt-1">${address}</p>
              </div>
            </div>
            <div class="mt-3 space-y-2 text-sm">
              <div class="flex items-center gap-2 text-gray-700">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.26.559.785 1.464 2.055 2.733 1.27 1.27 2.174 1.795 2.733 2.055l.773-1.548a1 1 0 011.06-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 4 14.18 4 9.5V5a1 1 0 011-1h2.153z"></path>
                </svg>
                <span>${phoneNumber}</span>
              </div>
              <div class="flex items-center gap-2 text-gray-700">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.5H7a1 1 0 100 2h4a1 1 0 001-1V7z"></path>
                </svg>
                <span>${hours}</span>
              </div>
            </div>
          </div>
        `;

        const infoWindow = new (window as any).google.maps.InfoWindow({
          content: infoWindowContent,
          maxWidth: 300,
        });

        // Abrir info window ao clicar no marcador
        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });

        // Abrir info window por padrão
        infoWindow.open(map, marker);

        mapInstanceRef.current = map;
        setIsLoading(false);

        // Rastrear visualização do mapa no Analytics
        const trackMapView = () => {
          try {
            if (typeof window !== "undefined" && (window as any).gtag) {
              (window as any).gtag("event", "map_view", {
                address,
                latitude,
                longitude,
              });
            }
          } catch {
            console.debug("[Maps] Analytics tracking not available");
          }
        };

        trackMapView();
      } catch (err) {
        setError("Erro ao inicializar mapa");
        setIsLoading(false);
        console.error("[Maps] Error initializing map:", err);
      }
    };

    loadGoogleMaps();

    return () => {
      // Cleanup
    };
  }, [latitude, longitude, zoom, title, address, phoneNumber, hours]);

  if (error) {
    return (
      <div
        className={`w-full flex flex-col items-center justify-center gap-4 bg-red-50 rounded-lg p-8 border border-red-200 ${className}`}
        style={{ height }}
      >
        <MapPin className="w-8 h-8 text-red-500" />
        <div className="text-center">
          <p className="text-gray-700 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mt-2">{address}</p>
          {phoneNumber && (
            <a
              href={`tel:${phoneNumber}`}
              className="text-primary hover:underline text-sm mt-2 inline-block"
            >
              {phoneNumber}
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full overflow-hidden rounded-lg shadow-lg ${className}`}
      style={{ height }}
    >
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader className="w-8 h-8 text-primary animate-spin" />
            <p className="text-sm text-gray-600">Carregando localização...</p>
          </div>
        </div>
      )}
      <div
        ref={mapRef}
        className="w-full h-full"
        style={{
          background: "linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)",
        }}
      />
    </div>
  );
}
