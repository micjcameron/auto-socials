import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

@Injectable()
export class BaseApiService {
  protected readonly logger = new Logger(this.constructor.name);
  protected readonly axiosInstance: AxiosInstance;

  constructor(
    protected configService: ConfigService,
    baseURL?: string,
    defaultHeaders?: Record<string, string>
  ) {
    this.axiosInstance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...defaultHeaders,
      },
      timeout: 30000,
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      config => {
        this.logger.debug(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      error => {
        this.logger.error('API Request Error:', error);
        return Promise.reject(new Error(error.message));
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      response => {
        this.logger.debug(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      error => {
        this.logger.error('API Response Error:', error.response?.data || error.message);
        return Promise.reject(new Error(error.message));
      }
    );
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.get(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
    return response.data;
  }

  protected async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
    return response.data;
  }

  protected async upload<T>(url: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await this.axiosInstance.post(url, formData, {
      ...config,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...config?.headers,
      },
    });
    return response.data;
  }

  protected async download(url: string, config?: AxiosRequestConfig): Promise<Buffer> {
    const response: AxiosResponse<Buffer> = await this.axiosInstance.get(url, {
      ...config,
      responseType: 'arraybuffer',
    });
    return response.data;
  }
}
