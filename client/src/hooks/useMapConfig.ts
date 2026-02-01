import { useEffect, useState } from 'react';

interface MapConfig {
  enabled: boolean;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
  phoneNumber?: string;
  hours?: string;
  zoom: number;
}

/**
 * Hook para obter configurações de mapa do admin
 * Recupera localização e detalhes para exibir no Google Maps
 */
export function useMapConfig() {
  const [config, setConfig] = useState<MapConfig>({
    enabled: false,
    latitude: -23.5505,
    longitude: -46.6333,
    title: 'Consultório de Psicologia',
    address: 'São Paulo, SP',
    phoneNumber: '(11) 99999-9999',
    hours: 'Seg-Sex: 09:00 - 18:00',
    zoom: 15,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapConfig = async () => {
      try {
        // Tentar obter configurações do backend
        const response = await fetch('/api/trpc/settings.getMapConfig');
        
        if (!response.ok) {
          // Usar valores padrão se não conseguir obter do backend
          setLoading(false);
          return;
        }

        const data = await response.json();
        
        if (data?.result?.data) {
          setConfig({
            enabled: data.result.data.enabled ?? true,
            latitude: data.result.data.latitude ?? -23.5505,
            longitude: data.result.data.longitude ?? -46.6333,
            title: data.result.data.title ?? 'Consultório de Psicologia',
            address: data.result.data.address ?? 'São Paulo, SP',
            phoneNumber: data.result.data.phoneNumber ?? '(11) 99999-9999',
            hours: data.result.data.hours ?? 'Seg-Sex: 09:00 - 18:00',
            zoom: data.result.data.zoom ?? 15,
          });
        }
      } catch (err) {
        console.error('[MapConfig] Error fetching config:', err);
        // Usar valores padrão em caso de erro
      } finally {
        setLoading(false);
      }
    };

    fetchMapConfig();
  }, []);

  return { config, loading, error };
}
