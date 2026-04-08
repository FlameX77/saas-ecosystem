import axios from 'axios';
import { z } from 'zod';

// Define the policy decision schema
export const PolicyDecisionSchema = z.object({
  action: z.enum(['allow', 'block', 'flag']),
  reason: z.string().optional(),
  traceId: z.string(),
});

export type PolicyDecision = z.infer<typeof PolicyDecisionSchema>;

export class PolicyViolationError extends Error {
  constructor(public decision: PolicyDecision) {
    super(`Sentrix Policy Violation: ${decision.reason || 'Action blocked by governance policy.'}`);
    this.name = 'PolicyViolationError';
  }
}

export interface SentrixConfig {
  apiKey: string;
  baseUrl?: string;
  agentId: string;
  environment?: 'development' | 'production' | 'staging';
}

export class SentrixClient {
  private apiKey: string;
  private baseUrl: string;
  private agentId: string;
  private environment: string;

  constructor(config: SentrixConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl || 'https://api.sentrix.ai';
    this.agentId = config.agentId;
    this.environment = config.environment || 'development';
  }

  /**
   * Intercept a tool call and check for policy approval
   */
  async checkPolicy(toolName: string, args: any): Promise<PolicyDecision> {
    try {
      const response = await axios.post(`${this.baseUrl}/v1/policy/check`, {
        agentId: this.agentId,
        toolName,
        args,
        environment: this.environment,
        timestamp: new Date().toISOString(),
      }, {
        headers: { 'X-Sentrix-API-Key': this.apiKey },
        timeout: 50, // Strict 50ms timeout for policy check
      });

      return PolicyDecisionSchema.parse(response.data);
    } catch (error) {
      console.warn('Sentrix: Policy engine unreachable, defaulting to FLAG', error);
      return { action: 'flag', traceId: 'fallback-' + Date.now(), reason: 'Cloud unreachable' };
    }
  }

  /**
   * Log an event asynchronously (background trace)
   */
  async logEvent(eventType: string, data: any) {
    try {
      await axios.post(`${this.baseUrl}/v1/events/ingest`, {
        agentId: this.agentId,
        eventType,
        data,
        environment: this.environment,
        timestamp: new Date().toISOString(),
      }, {
        headers: { 'X-Sentrix-API-Key': this.apiKey },
      });
    } catch (error) {
      // Background logging failures should not crash the agent
      console.error('Sentrix: Failed to log background event', error);
    }
  }
}

/**
 * LangChain Callback for seamless Sentrix integration
 */
export class SentrixLangChainCallback {
  constructor(private client: SentrixClient) {}

  async on_tool_start(serialized: any, input: string) {
    const toolName = serialized.name;
    const decision = await this.client.checkPolicy(toolName, { input });

    if (decision.action === 'block') {
      throw new PolicyViolationError(decision);
    }

    if (decision.action === 'flag') {
      console.warn(`Sentrix [FLAG]: Tool ${toolName} triggered a policy flag. Trace: ${decision.traceId}`);
    }
  }

  async on_tool_end(output: string) {
    await this.client.logEvent('tool_end', { output });
  }

  async on_tool_error(error: any) {
    await this.client.logEvent('tool_error', { error: error.message });
  }
}
