import mongoose from 'mongoose';
import { getRedisClient } from '../database';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  timestamp: string;
  services: {
    mongo: { status: string; latencyMs?: number };
    redis: { status: string; latencyMs?: number };
  };
}

export class HealthService {
  async check(): Promise<HealthStatus> {
    const mongoStatus = await this.checkMongo();
    const redisStatus = await this.checkRedis();

    const allUp = mongoStatus.status === 'up' && redisStatus.status === 'up';
    const allDown = mongoStatus.status === 'down' && redisStatus.status === 'down';

    let overallStatus: HealthStatus['status'] = 'healthy';
    if (allDown) overallStatus = 'unhealthy';
    else if (!allUp) overallStatus = 'degraded';

    return {
      status: overallStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      services: {
        mongo: mongoStatus,
        redis: redisStatus,
      },
    };
  }

  private async checkMongo() {
    try {
      const start = Date.now();
      await mongoose.connection.db?.admin().ping();
      return { status: 'up' as const, latencyMs: Date.now() - start };
    } catch {
      return { status: 'down' as const };
    }
  }

  private async checkRedis() {
    try {
      const start = Date.now();
      const client = getRedisClient();
      await client.ping();
      return { status: 'up' as const, latencyMs: Date.now() - start };
    } catch {
      return { status: 'down' as const };
    }
  }
}
