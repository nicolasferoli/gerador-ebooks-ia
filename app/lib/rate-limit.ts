/**
 * Implementação simplificada de rate limit para desenvolvimento local
 * Esta versão não depende de Redis ou outros serviços externos
 */

// Cache local para desenvolvimento
const localRateLimit: Record<string, { count: number, reset: number }> = {};

interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // timestamp em milissegundos
}

/**
 * Implementa um rate limit básico usando memória local
 * @param identifier Identificador único para o usuário/endpoint
 * @param limit Limite máximo de requisições
 * @param window Janela de tempo em segundos (padrão: 60 = 1 minuto)
 * @returns Objeto com informações do rate limit
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  window: number = 60
): Promise<RateLimitResult> {
  const now = Date.now();
  
  // Limpar entradas expiradas
  Object.keys(localRateLimit).forEach(key => {
    if (localRateLimit[key].reset < now) {
      delete localRateLimit[key];
    }
  });
  
  // Se não houver entrada ou estiver expirada, criar nova
  if (!localRateLimit[identifier] || localRateLimit[identifier].reset < now) {
    localRateLimit[identifier] = {
      count: 1,
      reset: now + window * 1000
    };
    
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: now + window * 1000
    };
  }
  
  // Verificar se atingiu o limite
  if (localRateLimit[identifier].count >= limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: localRateLimit[identifier].reset
    };
  }
  
  // Incrementar contador
  localRateLimit[identifier].count += 1;
  
  return {
    success: true,
    limit,
    remaining: limit - localRateLimit[identifier].count,
    reset: localRateLimit[identifier].reset
  };
} 