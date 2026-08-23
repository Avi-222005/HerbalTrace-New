package main

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// LabBatch represents a batch assigned to a laboratory for testing
type LabBatch struct {
	ID                string   `json:"id"`
	Type              string   `json:"type"` // "LabBatch"
	LabBatchNumber    string   `json:"labBatchNumber"`
	OriginalBatchID   string   `json:"originalBatchId"` // Reference to farmer batch
	OriginalBatchNumber string `json:"originalBatchNumber"`
	Species           string   `json:"species"`
	SampleQuantity    float64  `json:"sampleQuantity"`
	Unit              string   `json:"unit"`
	LabID             string   `json:"labId"`
	LabName           string   `json:"labName"`
	ReceivedDate      string   `json:"receivedDate"`
	TestType          string   `json:"testType"` // "quality", "pesticide", "heavy_metals", "microbial", "dna_barcode"
	Status            string   `json:"status"` // "received", "testing", "completed", "failed"
	Priority          string   `json:"priority"` // "normal", "high", "urgent"
	AssignedTester    string   `json:"assignedTester"`
	TestResults       []TestResult `json:"testResults,omitempty"`
	CertificateID     string   `json:"certificateId,omitempty"`
	QRCode            string   `json:"qrCode,omitempty"` // QR code for batch verification
	Notes             string   `json:"notes,omitempty"`
	CreatedBy         string   `json:"createdBy"`
	CreatedByName     string   `json:"createdByName"`
	CompletedDate     string   `json:"completedDate,omitempty"`
	Timestamp         string   `json:"timestamp"`
	UpdatedAt         string   `json:"updatedAt"`
}

// TestResult represents individual test results within a lab batch
type TestResult struct {
	TestName      string                 `json:"testName"`
	TestDate      string                 `json:"testDate"`
	Result        string                 `json:"result"` // "PASS", "FAIL", "PENDING"
	Value         string                 `json:"value,omitempty"`
	Unit          string                 `json:"unit,omitempty"`
	StandardRange string                 `json:"standardRange,omitempty"`
	TestedBy      string                 `json:"testedBy"`
	Parameters    map[string]interface{} `json:"parameters,omitempty"`
}

// CreateLabBatch creates a new lab batch on the blockchain
func (c *HerbalTraceContract) CreateLabBatch(ctx contractapi.TransactionContextInterface, labBatchJSON string) error {
	var labBatch LabBatch
	err := json.Unmarshal([]byte(labBatchJSON), &labBatch)
	if err != nil {
		return fmt.Errorf("failed to unmarshal lab batch: %v", err)
	}

	// Validate required fields
	if labBatch.ID == "" {
		return fmt.Errorf("lab batch ID is required")
	}
	if labBatch.LabBatchNumber == "" {
		return fmt.Errorf("lab batch number is required")
	}
	if labBatch.OriginalBatchID == "" {
		return fmt.Errorf("original batch ID is required")
	}
	if labBatch.Species == "" {
		return fmt.Errorf("species is required")
	}
	if labBatch.LabID == "" {
		return fmt.Errorf("lab ID is required")
	}
	if labBatch.SampleQuantity <= 0 {
		return fmt.Errorf("sample quantity must be greater than zero")
	}

	// Check if lab batch already exists
	existingBatch, err := ctx.GetStub().GetState(labBatch.ID)
	if err != nil {
		return fmt.Errorf("failed to read from world state: %v", err)
	}
	if existingBatch != nil {
		return fmt.Errorf("lab batch %s already exists", labBatch.ID)
	}

	// Verify original batch exists
	originalBatch, err := ctx.GetStub().GetState(labBatch.OriginalBatchID)
	if err != nil {
		return fmt.Errorf("failed to read original batch: %v", err)
	}
	if originalBatch == nil {
		return fmt.Errorf("original batch %s not found", labBatch.OriginalBatchID)
	}

	// Set default values
	labBatch.Type = "LabBatch"
	if labBatch.Status == "" {
		labBatch.Status = "received"
	}
	if labBatch.Priority == "" {
		labBatch.Priority = "normal"
	}
	if labBatch.Unit == "" {
		labBatch.Unit = "kg"
	}
	if labBatch.Timestamp == "" {
		labBatch.Timestamp = time.Now().UTC().Format(time.RFC3339)
	}
	labBatch.UpdatedAt = labBatch.Timestamp

	// Generate QR code if not provided
	if labBatch.QRCode == "" {
		labBatch.QRCode = fmt.Sprintf("LAB-%s-%s", labBatch.LabBatchNumber, labBatch.ID)
	}

	// Marshal to JSON and save to ledger
	labBatchBytes, err := json.Marshal(labBatch)
	if err != nil {
		return fmt.Errorf("failed to marshal lab batch: %v", err)
	}

	err = ctx.GetStub().PutState(labBatch.ID, labBatchBytes)
	if err != nil {
		return fmt.Errorf("failed to put lab batch to world state: %v", err)
	}

	return nil
}

// GetLabBatch retrieves a lab batch by ID
func (c *HerbalTraceContract) GetLabBatch(ctx contractapi.TransactionContextInterface, id string) (*LabBatch, error) {
	labBatchBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read from world state: %v", err)
	}
	if labBatchBytes == nil {
		return nil, fmt.Errorf("lab batch %s does not exist", id)
	}

	var labBatch LabBatch
	err = json.Unmarshal(labBatchBytes, &labBatch)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal lab batch: %v", err)
	}

	return &labBatch, nil
}

// UpdateLabBatchStatus updates the status of a lab batch
func (c *HerbalTraceContract) UpdateLabBatchStatus(ctx contractapi.TransactionContextInterface, 
	id string, newStatus string, updatedBy string) error {
	
	labBatch, err := c.GetLabBatch(ctx, id)
	if err != nil {
		return err
	}

	// Validate status transition
	validStatuses := map[string]bool{
		"received":  true,
		"testing":   true,
		"completed": true,
		"failed":    true,
	}
	if !validStatuses[newStatus] {
		return fmt.Errorf("invalid status: %s", newStatus)
	}

	// Update status
	labBatch.Status = newStatus
	labBatch.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	// Set completion date if completed
	if newStatus == "completed" && labBatch.CompletedDate == "" {
		labBatch.CompletedDate = labBatch.UpdatedAt
	}

	// Save updated lab batch
	labBatchBytes, err := json.Marshal(labBatch)
	if err != nil {
		return fmt.Errorf("failed to marshal lab batch: %v", err)
	}

	err = ctx.GetStub().PutState(labBatch.ID, labBatchBytes)
	if err != nil {
		return fmt.Errorf("failed to update lab batch: %v", err)
	}

	return nil
}

// AddLabBatchTestResult adds a test result to a lab batch
func (c *HerbalTraceContract) AddLabBatchTestResult(ctx contractapi.TransactionContextInterface,
	id string, testResultJSON string) error {
	
	labBatch, err := c.GetLabBatch(ctx, id)
	if err != nil {
		return err
	}

	var testResult TestResult
	err = json.Unmarshal([]byte(testResultJSON), &testResult)
	if err != nil {
		return fmt.Errorf("failed to unmarshal test result: %v", err)
	}

	// Validate test result
	if testResult.TestName == "" {
		return fmt.Errorf("test name is required")
	}
	if testResult.TestDate == "" {
		testResult.TestDate = time.Now().UTC().Format(time.RFC3339)
	}

	// Add test result
	if labBatch.TestResults == nil {
		labBatch.TestResults = []TestResult{}
	}
	labBatch.TestResults = append(labBatch.TestResults, testResult)
	labBatch.UpdatedAt = time.Now().UTC().Format(time.RFC3339)

	// Auto-update status to testing if still received
	if labBatch.Status == "received" {
		labBatch.Status = "testing"
	}

	// Save updated lab batch
	labBatchBytes, err := json.Marshal(labBatch)
	if err != nil {
		return fmt.Errorf("failed to marshal lab batch: %v", err)
	}

	err = ctx.GetStub().PutState(labBatch.ID, labBatchBytes)
	if err != nil {
		return fmt.Errorf("failed to update lab batch: %v", err)
	}

	return nil
}

// LinkLabBatchToCertificate links a QC certificate to a lab batch
func (c *HerbalTraceContract) LinkLabBatchToCertificate(ctx contractapi.TransactionContextInterface,
	labBatchID string, certificateID string) error {
	
	labBatch, err := c.GetLabBatch(ctx, labBatchID)
	if err != nil {
		return err
	}

	// Update certificate ID
	labBatch.CertificateID = certificateID
	labBatch.Status = "completed"
	labBatch.CompletedDate = time.Now().UTC().Format(time.RFC3339)
	labBatch.UpdatedAt = labBatch.CompletedDate

	// Save updated lab batch
	labBatchBytes, err := json.Marshal(labBatch)
	if err != nil {
		return fmt.Errorf("failed to marshal lab batch: %v", err)
	}

	err = ctx.GetStub().PutState(labBatch.ID, labBatchBytes)
	if err != nil {
		return fmt.Errorf("failed to update lab batch: %v", err)
	}

	return nil
}

// QueryLabBatches queries lab batches based on criteria
func (c *HerbalTraceContract) QueryLabBatches(ctx contractapi.TransactionContextInterface,
	queryString string) ([]LabBatch, error) {
	
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to get query result: %v", err)
	}
	defer resultsIterator.Close()

	var labBatches []LabBatch
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to iterate results: %v", err)
		}

		var labBatch LabBatch
		err = json.Unmarshal(queryResponse.Value, &labBatch)
		if err != nil {
			continue // Skip invalid records
		}

		// Only include LabBatch type records
		if labBatch.Type == "LabBatch" {
			labBatches = append(labBatches, labBatch)
		}
	}

	return labBatches, nil
}

// QueryLabBatchesByLab queries lab batches by lab ID
func (c *HerbalTraceContract) QueryLabBatchesByLab(ctx contractapi.TransactionContextInterface,
	labID string) ([]LabBatch, error) {
	
	queryString := fmt.Sprintf(`{"selector":{"type":"LabBatch","labId":"%s"}}`, labID)
	return c.QueryLabBatches(ctx, queryString)
}

// QueryLabBatchesByStatus queries lab batches by status
func (c *HerbalTraceContract) QueryLabBatchesByStatus(ctx contractapi.TransactionContextInterface,
	status string) ([]LabBatch, error) {
	
	queryString := fmt.Sprintf(`{"selector":{"type":"LabBatch","status":"%s"}}`, status)
	return c.QueryLabBatches(ctx, queryString)
}

// GetLabBatchHistory retrieves the history of a lab batch
func (c *HerbalTraceContract) GetLabBatchHistory(ctx contractapi.TransactionContextInterface,
	id string) ([]map[string]interface{}, error) {
	
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(id)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %v", err)
	}
	defer resultsIterator.Close()

	var history []map[string]interface{}
	for resultsIterator.HasNext() {
		modification, err := resultsIterator.Next()
		if err != nil {
			return nil, fmt.Errorf("failed to iterate history: %v", err)
		}

		var labBatch LabBatch
		if len(modification.Value) > 0 {
			err = json.Unmarshal(modification.Value, &labBatch)
			if err != nil {
				continue
			}
		}

		record := map[string]interface{}{
			"txId":      modification.TxId,
			"timestamp": modification.Timestamp,
			"isDelete":  modification.IsDelete,
			"labBatch":  labBatch,
		}
		history = append(history, record)
	}

	return history, nil
}

// VerifyLabBatchByQRCode verifies a lab batch by QR code
func (c *HerbalTraceContract) VerifyLabBatchByQRCode(ctx contractapi.TransactionContextInterface,
	qrCode string) (*LabBatch, error) {
	
	queryString := fmt.Sprintf(`{"selector":{"type":"LabBatch","qrCode":"%s"}}`, qrCode)
	labBatches, err := c.QueryLabBatches(ctx, queryString)
	if err != nil {
		return nil, err
	}

	if len(labBatches) == 0 {
		return nil, fmt.Errorf("no lab batch found with QR code: %s", qrCode)
	}

	return &labBatches[0], nil
}
