export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface ServiceConfig {
  port: number;
  serviceName: string;
  dbUrl: string;
}