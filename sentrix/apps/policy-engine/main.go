package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/redis/go-redis/v9"
)

var ctx = context.Background()
var rdb *redis.Client

type PolicyCheckRequest struct {
	AgentID     string      `json:"agentId" binding:"required"`
	ToolName    string      `json:"toolName" binding:"required"`
	Args        interface{} `json:"args"`
	Environment string      `json:"environment"`
	Timestamp   string      `json:"timestamp"`
}

type PolicyCheckResponse struct {
	Action  string `json:"action"` // allow, block, flag
	Reason  string `json:"reason,omitempty"`
	TraceID string `json:"traceId"`
}

func initRedis() {
	rdb = redis.NewClient(&redis.Options{
		Addr: "localhost:6379", // Default for local dev, should be config-driven
	})
}

func main() {
	initRedis()

	r := gin.Default()

	// High-performance policy check endpoint
	r.POST("/v1/policy/check", func(c *gin.Context) {
		var req PolicyCheckRequest
		if err := c.ShouldBindJSON(&req); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		traceID := fmt.Sprintf("tr-%d", time.Now().UnixNano())

		// 1. Mock logic for policy evaluation (Real logic will query Redis/Postgres)
		// TODO: Implement actual rule matching based on AgentID and ToolName
		decision := PolicyCheckResponse{
			Action:  "allow",
			TraceID: traceID,
		}

		// Example rule: Block specific tools for specific agents
		if req.ToolName == "delete_all_files" {
			decision.Action = "block"
			decision.Reason = "Unauthorized file deletion attempt detected."
		}

		// 2. Log check result to Redis for the activity timeline
		logData, _ := json.Marshal(req)
		rdb.LPush(ctx, "sentrix:activity:live", logData)
		rdb.LTrim(ctx, "sentrix:activity:live", 0, 999) // Keep last 1000

		// Sub-5ms response time is the goal
		c.JSON(http.StatusOK, decision)
	})

	// Health check
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"status": "UP", "engine": "SentrixGo/1.0"})
	})

	log.Println("Sentrix Policy Engine running on :8080")
	r.Run(":8080")
}
