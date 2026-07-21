import { Injectable, UnprocessableEntityException } from '@nestjs/common';

@Injectable()
export class GeocodingService {
  private readonly baseUrl = process.env.GEOCODING_BASE_URL || '';

  async geocodeAddress(addressParts: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  }): Promise<{
    latitude: number;
    longitude: number;
    address: string;
    score: string;
  }> {
    const address = [
      `${addressParts.street}, ${addressParts.number}`,
      addressParts.neighborhood,
      addressParts.city,
      addressParts.state,
      addressParts.zipCode,
    ]
      .filter(Boolean)
      .join(', ');

    const params = new URLSearchParams({
      q: address,
      apiKey: process.env.HERE_API_KEY!,
    });

    const response = await fetch(`${this.baseUrl}?${params}`, {
      headers: { 'User-Agent': 'motoboy-app (contato@seudominio.com)' },
    });

    if (!response.ok)
      throw new UnprocessableEntityException('Falha ao geocodificar endereço');

    const data = await response.json();

    if (!data.items.length)
      throw new UnprocessableEntityException('Endereço não encontrado');

    const location = data.items[0];

    return {
      latitude: location.position.lat,
      longitude: location.position.lng,
      address: location.address.label,
      score: location.scoring.queryScore,
    };
  }
}
