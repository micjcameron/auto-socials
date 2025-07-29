import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseApiService } from './base-api.service';

export interface WhopProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  url: string;
  trending_score: number;
  commission_rate: number;
  images?: string[]; // Product images
  thumbnail?: string; // Main product image
}

export interface WhopApiResponse {
  products: WhopProduct[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class WhopApiService extends BaseApiService {
  constructor(configService: ConfigService) {
    super(configService, 'https://api.whop.com/v2', {
      Authorization: `Bearer ${configService.get<string>('WHOP_API_KEY')}`,
    });
  }

  async getTrendingProducts(limit: number = 50): Promise<WhopProduct[]> {
    try {
      const response = await this.get<WhopApiResponse>('/products', {
        params: {
          limit,
          sort: 'trending',
          status: 'active',
        },
      });

      return response.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        url: `https://whop.com/products/${product.id}`,
        trending_score: product.trending_score,
        commission_rate: product.commission_rate,
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || null,
      }));
    } catch (error) {
      this.logger.error('Failed to fetch trending products from Whop:', error);
      throw error;
    }
  }

  async getProductById(productId: string): Promise<WhopProduct> {
    try {
      const product = await this.get<WhopProduct>(`/products/${productId}`);

      return {
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        url: `https://whop.com/products/${product.id}`,
        trending_score: product.trending_score,
        commission_rate: product.commission_rate,
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || null,
      };
    } catch (error) {
      this.logger.error(`Failed to fetch product ${productId} from Whop:`, error);
      throw error;
    }
  }

  async getAffiliateLink(productId: string): Promise<string> {
    try {
      // This would depend on Whop's affiliate API structure
      const response = await this.post<{ affiliate_url: string }>(`/products/${productId}/affiliate-link`);
      return response.affiliate_url;
    } catch (error) {
      this.logger.error(`Failed to get affiliate link for product ${productId}:`, error);
      // Fallback to regular product URL
      return `https://whop.com/products/${productId}`;
    }
  }

  async searchProducts(query: string, category?: string): Promise<WhopProduct[]> {
    try {
      const params: any = { q: query };
      if (category) params.category = category;

      const response = await this.get<WhopApiResponse>('/products/search', {
        params,
      });

      return response.products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category,
        url: `https://whop.com/products/${product.id}`,
        trending_score: product.trending_score,
        commission_rate: product.commission_rate,
        images: product.images || [],
        thumbnail: product.thumbnail || product.images?.[0] || null,
      }));
    } catch (error) {
      this.logger.error('Failed to search products on Whop:', error);
      throw error;
    }
  }
}
