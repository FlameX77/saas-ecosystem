import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import ws from '@fastify/websocket'
import axios from 'axios'
import { z } from 'zod'

const fastify = Fastify({ logger: true })

// Middleware: CORS & Security
fastify.register(cors, { 
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://sentrix.ai', 'https://healthcare-os.app'] 
    : ['http://localhost:3000', 'http://localhost:3001'] 
})
fastify.register(helmet)
fastify.register(ws)

// Authentication Hook
fastify.addHook('preHandler', async (request, reply) => {
  // Allow health check without auth
  if (request.url === '/health') return
  
  const apiKey = request.headers['x-api-key']
  const validKey = process.env.SENTRIX_API_KEY
  
  // In production, we MUST have an API key set
  if (process.env.NODE_ENV === 'production' && !validKey) {
    fastify.log.error('CRITICAL: SENTRIX_API_KEY is not set in production!')
    return reply.status(500).send({ error: 'Internal Server Error', message: 'Security misconfiguration' })
  }

  const effectiveKey = validKey || 'sentrix_dev_key'
  
  if (apiKey !== effectiveKey) {
    fastify.log.warn({ ip: request.ip, url: request.url }, 'Unauthorized access attempt')
    return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing API Key' })
  }
})

// Configuration (Should be in env)
const POLICY_ENGINE_URL = process.env.POLICY_ENGINE_URL || 'http://localhost:8080'

// Health Check
fastify.get('/health', async () => ({ status: 'UP', service: 'SentrixGateway/1.0' }))

// Policy Check Proxy (Strict Low-Latency)
const PolicyCheckSchema = z.object({
  agentId: z.string(),
  toolName: z.string(),
  args: z.any().optional(),
  environment: z.string().optional(),
  timestamp: z.string().optional()
})

fastify.post('/v1/policy/check', async (request, reply) => {
  const body = PolicyCheckSchema.parse(request.body)
  
  try {
    const response = await axios.post(`${POLICY_ENGINE_URL}/v1/policy/check`, body, {
      timeout: 40 
    })
    
    // Asynchronous Sentinel Deep Scan if flagged by local engine
    if (response.data.action === 'flag' || response.data.action === 'block') {
      axios.post(process.env.SENTRIX_SENTINEL_URL || 'http://localhost:5678/webhook/sentrix-anomaly-detect', {
        request_payload: body,
        reason: response.data.reason,
        user_id: body.agentId
      }).catch(err => fastify.log.error('Sentinel deep scan trigger failed'))
    }

    return response.data
  } catch (error) {
    fastify.log.error(error, 'Sentrix: Policy Engine Unreachable')
    return { action: 'flag', reason: 'Upstream gateway timeout', traceId: `gw-err-${Date.now()}` }
  }
})

// Event Ingestion for ClickHouse (Background Logging)
fastify.post('/v1/events/ingest', async (request, reply) => {
  // TODO: Publish to Kafka for asynchronous ingestion to ClickHouse
  fastify.log.info({ body: request.body }, 'Sentrix: Received event for ingestion')
  return { status: 'queued' }
})

// WebSocket for Live Activity Timeline
fastify.register(async function (fastify) {
  fastify.get('/v1/live', { websocket: true }, (connection, req) => {
    fastify.log.info('Sentrix: New monitoring client connected')
    
    // Send a welcome message
    connection.socket.send(JSON.stringify({ 
      type: 'INIT', 
      message: 'Sentrix Sentinel Live Feed: CONNECTED' 
    }))

    // In a production scenario, we'd subscribe to Redis or Kafka here
    // For now, we mock the real-time activity stream
    const interval = setInterval(() => {
        connection.socket.send(JSON.stringify({
          type: 'ACTIVITY',
          data: {
            agentId: 'ag-' + Math.floor(Math.random() * 10),
            toolName: ['search_google', 'query_db', 'write_file', 'send_email'][Math.floor(Math.random() * 4)],
            action: ['allow', 'flag'][Math.floor(Math.random() * 2)],
            timestamp: new Date().toISOString()
          }
        }))
    }, 2000)

    connection.socket.on('close', () => {
      clearInterval(interval)
      fastify.log.info('Sentrix: Client disconnected')
    })
  })
})

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    console.log('Sentrix API Gateway running on port 3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()
