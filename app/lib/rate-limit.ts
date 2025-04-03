import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

// Inicializa o cliente Redis
function getRedisClient() {
  if (redis) return redis;

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // Fallback para desenvolvimento local sem Redis
    console.warn('Variáveis de ambiente Redis não configuradas. Utilizando implementação mock para rate limit.');
    return null;
  }

  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  return redis;
}

// Implementação de fallback para desenvolvimento local sem Redis
const localRateLimitData: Record<string, { count: number, reset: number }> = {};

/**
 * Aplica rate limiting a uma operação
 * @param identifier Identificador único da operação (ex: user_123_create_ebook)
 * @param limit Número máximo de operações permitidas no período
 * @param windowInSeconds Janela de tempo em segundos (padrão: 1 hora)
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowInSeconds: number = 3600
): Promise<{
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}> {
  const redis = getRedisClient();
  const now = Date.now();

  // Se não houver Redis, usar implementação local
  if (!redis) {
    const key = identifier;
    const resetTimestamp = now + windowInSeconds * 1000;

    if (!localRateLimitData[key] || localRateLimitData[key].reset < now) {
      localRateLimitData[key] = { count: 1, reset: resetTimestamp };
      return {
        success: true,
        limit,
        remaining: limit - 1,
        reset: resetTimestamp
      };
    }

    const currentCount = localRateLimitData[key].count;
    if (currentCount >= limit) {
      return {
        success: false,
        limit,
        remaining: 0,
        reset: localRateLimitData[key].reset
      };
    }

    localRateLimitData[key].count += 1;
    return {
      success: true,
      limit,
      remaining: limit - localRateLimitData[key].count,
      reset: localRateLimitData[key].reset
    };
  }

  // Implementação com Redis
  const key = `rate_limit:${identifier}`;
  const resetTimestamp = now + windowInSeconds * 1000;
  const resetKey = `${key}:reset`;

  // Verificar se já existe uma janela de rate limit
  const [count, reset] = await Promise.all([
    redis.get<number>(key),
    redis.get<number>(resetKey)
  ]);

  // Se não existir uma janela ou a janela expirou, criar uma nova
  if (!reset || reset < now) {
    await Promise.all([
      redis.set(key, 1),
      redis.set(resetKey, resetTimestamp),
      redis.expire(key, windowInSeconds),
      redis.expire(resetKey, windowInSeconds)
    ]);

    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: resetTimestamp
    };
  }

  // Se o limite já foi atingido
  if (count && count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset
    };
  }

  // Incrementar o contador
  const newCount = await redis.incr(key);

  return {
    success: true,
    limit,
    remaining: limit - newCount,
    reset
  };
} 