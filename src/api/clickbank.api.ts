import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseApiService } from './base-api.service';

export interface ClickBankProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  gravity: number; // ClickBank's popularity metric
  commission_rate: number;
  url: string;
}

export interface ClickBankApiResponse {
  products: ClickBankProduct[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class ClickBankApiService extends BaseApiService {
  constructor(configService: ConfigService) {
    super(configService, 'https://api.clickbank.com/rest/1.3', {
      Authorization: `Bearer ${configService.get<string>('CLICKBANK_API_KEY')}`,
    });
  }

  async getPopularProducts(limit: number = 50): Promise<ClickBankProduct[]> {
    try {
      const response = await this.get<ClickBankApiResponse>('/products', {
        params: {
          limit,
          sort: 'gravity',
          status: 'active',
        },
      });

      return response.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        gravity: product.gravity,
        commission_rate: product.commission_rate,
        url: `https://hop.clickbank.net/?affiliate=YOUR_ID&item=${product.id}`,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch popular products from ClickBank:', error);
      throw error;
    }
  }

  async getProductById(productId: string): Promise<ClickBankProduct> {
    try {
      const product = await this.get<ClickBankProduct>(`/products/${productId}`);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        gravity: product.gravity,
        commission_rate: product.commission_rate,
        url: `https://hop.clickbank.net/?affiliate=YOUR_ID&item=${product.id}`,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch product ${productId} from ClickBank:`, error);
      throw error;
    }
  }

  async searchProducts(query: string, category?: string): Promise<ClickBankProduct[]> {
    try {
      const params: any = { q: query };
      if (category) params.category = category;

      const response = await this.get<ClickBankApiResponse>('/products/search', { params });

      return response.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        gravity: product.gravity,
        commission_rate: product.commission_rate,
        url: `https://hop.clickbank.net/?affiliate=YOUR_ID&item=${product.id}`,
      }));
    } catch (error) {
      this.logger.error('Failed to search products on ClickBank:', error);
      throw error;
    }
  }

  async getCategories(): Promise<string[]> {
    try {
      const response = await this.get<{ categories: string[] }>('/categories');
      return response.categories;
    } catch (error) {
      this.logger.error('Failed to fetch categories from ClickBank:', error);
      throw error;
    }
  }
}
