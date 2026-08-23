package main

import (
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/hyperledger/fabric-chaincode-go/shim"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// HerbalTraceContract provides functions for managing the Ayurvedic herb supply chain
type HerbalTraceContract struct {
	contractapi.Contract
}

// CollectionEvent represents a harvest/collection event with GPS data
type CollectionEvent struct {
	ID                string  `json:"id"`
	Type              string  `json:"type"` // "CollectionEvent"
	FarmerID          string  `json:"farmerId"`
	FarmerName        string  `json:"farmerName"`
	Species           string  `json:"species"`
	CommonName        string  `json:"commonName"`
	ScientificName    string  `json:"scientificName"`
	Quantity          float64 `json:"quantity"`
	Unit              string  `json:"unit"`
	Latitude          float64 `json:"latitude"`
	Longitude         float64 `json:"longitude"`
	Altitude          float64 `json:"altitude,omitempty"`
	Accuracy          float64 `json:"accuracy,omitempty"` // GPS accuracy in meters
	HarvestDate       string  `json:"harvestDate"`
	Timestamp         string  `json:"timestamp"`
	HarvestMethod     string  `json:"harvestMethod"` // "manual", "mechanical"
	PartCollected     string  `json:"partCollected"` // "leaf", "root", "flower", "seed", etc.
	WeatherConditions string  `json:"weatherConditions,omitempty"`
	SoilType          string  `json:"soilType,omitempty"`
	Images            []string `json:"images,omitempty"` // IPFS hashes or URLs
	ApprovedZone      bool    `json:"approvedZone"`
	ZoneName          string  `json:"zoneName,omitempty"`
	ConservationStatus string `json:"conservationStatus,omitempty"` // "Endangered", "Vulnerable", "Least Concern"
	CertificationIDs  []string `json:"certificationIds,omitempty"` // Organic, Fair Trade, etc.
	Status            string  `json:"status"` // "pending", "verified", "rejected"
	NextStepID        string  `json:"nextStepId,omitempty"` // Link to quality test or processing
}

// QualityTest represents laboratory testing results
type QualityTest struct {
	ID                  string            `json:"id"`
	Type                string            `json:"type"` // "QualityTest"
	CollectionEventID   string            `json:"collectionEventId"`
	BatchID             string            `json:"batchId"`
	LabID               string            `json:"labId"`
	LabName             string            `json:"labName"`
	TestDate            string            `json:"testDate"`
	Timestamp           string            `json:"timestamp"`
	TestTypes           []string          `json:"testTypes"` // "moisture", "pesticide", "dna_barcode", "heavy_metals"
	MoistureContent     float64           `json:"moistureContent,omitempty"`
	PesticideResults    map[string]string `json:"pesticideResults,omitempty"` // pesticide name -> "pass"/"fail"
	HeavyMetals         map[string]float64 `json:"heavyMetals,omitempty"` // metal name -> ppm
	DNABarcodeMatch     bool              `json:"dnaBarcodeMatch,omitempty"`
	DNASequence         string            `json:"dnaSequence,omitempty"`
	MicrobialLoad       float64           `json:"microbialLoad,omitempty"` // CFU/g
	Aflatoxins          float64           `json:"aflatoxins,omitempty"` // ppb
	OverallResult       string            `json:"overallResult"` // "pass", "fail", "conditional"
	CertificateID       string            `json:"certificateId"`
	CertificateURL      string            `json:"certificateUrl,omitempty"`
	TesterName          string            `json:"testerName"`
	TesterSignature     string            `json:"testerSignature,omitempty"`
	Status              string            `json:"status"` // "pending", "approved", "rejected"
	NextStepID          string            `json:"nextStepId,omitempty"`
}

// ProcessingStep represents processing/manufacturing steps
type ProcessingStep struct {
	ID                string            `json:"id"`
	Type              string            `json:"type"` // "ProcessingStep"
	PreviousStepID    string            `json:"previousStepId"` // CollectionEvent or QualityTest ID
	BatchID           string            `json:"batchId"`
	ProcessorID       string            `json:"processorId"`
	ProcessorName     string            `json:"processorName"`
	ProcessType       string            `json:"processType"` // "drying", "grinding", "extraction", "formulation"
	ProcessDate       string            `json:"processDate"`
	Timestamp         string            `json:"timestamp"`
	InputQuantity     float64           `json:"inputQuantity"`
	OutputQuantity    float64           `json:"outputQuantity"`
	Unit              string            `json:"unit"`
	Temperature       float64           `json:"temperature,omitempty"` // Celsius
	Duration          float64           `json:"duration,omitempty"` // hours
	Equipment         string            `json:"equipment,omitempty"`
	Parameters        map[string]string `json:"parameters,omitempty"`
	QualityChecks     []string          `json:"qualityChecks,omitempty"`
	OperatorID        string            `json:"operatorId"`
	OperatorName      string            `json:"operatorName"`
	Location          string            `json:"location"`
	Latitude          float64           `json:"latitude,omitempty"`
	Longitude         float64           `json:"longitude,omitempty"`
	Status            string            `json:"status"` // "in_progress", "completed", "failed"
	NextStepID        string            `json:"nextStepId,omitempty"`
}

// QCCertificate represents a quality control certificate
type QCCertificate struct {
	ID              string                 `json:"id"`
	Type            string                 `json:"type"` // "QCCertificate"
	CertificateID   string                 `json:"certificateId"`
	TestID          string                 `json:"testId"`
	BatchID         string                 `json:"batchId"`
	BatchNumber     string                 `json:"batchNumber"`
	SpeciesName     string                 `json:"speciesName"`
	TestType        string                 `json:"testType"`
	LabID           string                 `json:"labId"`
	LabName         string                 `json:"labName"`
	OverallResult   string                 `json:"overallResult"` // "PASS", "FAIL", "CONDITIONAL"
	IssuedDate      string                 `json:"issuedDate"`
	TestedBy        string                 `json:"testedBy"`
	Results         []map[string]interface{} `json:"results"`
	Timestamp       string                 `json:"timestamp"`
}

// Product represents the final product with QR code
type Product struct {
	ID                string   `json:"id"`
	Type              string   `json:"type"` // "Product"
	ProductName       string   `json:"productName"`
	ProductType       string   `json:"productType"` // "powder", "extract", "capsule", "oil"
	ManufacturerID    string   `json:"manufacturerId"`
	ManufacturerName  string   `json:"manufacturerName"`
	BatchID           string   `json:"batchId"`
	ManufactureDate   string   `json:"manufactureDate"`
	ExpiryDate        string   `json:"expiryDate"`
	Quantity          float64  `json:"quantity"`
	Unit              string   `json:"unit"`
	QRCode            string   `json:"qrCode"` // Unique QR code for consumer scanning
	Ingredients       []string `json:"ingredients"`
	CollectionEventIDs []string `json:"collectionEventIds"` // Trace back to origins
	QualityTestIDs    []string `json:"qualityTestIds"`
	ProcessingStepIDs []string `json:"processingStepIds"`
	Certifications    []string `json:"certifications"` // "Organic", "Fair Trade", "AYUSH Certified"
	PackagingDate     string   `json:"packagingDate"`
	Status            string   `json:"status"` // "manufactured", "distributed", "sold"
	Timestamp         string   `json:"timestamp"`
}

// Provenance represents the complete supply chain history (FHIR-style bundle)
type Provenance struct {
	ID                string             `json:"id"`
	ProductID         string             `json:"productId"`
	QRCode            string             `json:"qrCode"`
	GeneratedDate     string             `json:"generatedDate"`
	CollectionEvents  []CollectionEvent  `json:"collectionEvents"`
	QualityTests      []QualityTest      `json:"qualityTests"`
	ProcessingSteps   []ProcessingStep   `json:"processingSteps"`
	Product           Product            `json:"product"`
	SustainabilityScore float64          `json:"sustainabilityScore"` // 0-100
	TotalDistance     float64            `json:"totalDistance,omitempty"` // km traveled
}

// InitLedger initializes the ledger with sample data
func (c *HerbalTraceContract) InitLedger(ctx contractapi.TransactionContextInterface) error {
	log.Println("Initializing HerbalTrace ledger...")
	return nil
}

// CreateCollectionEvent records a new harvest/collection event with comprehensive validation
func (c *HerbalTraceContract) CreateCollectionEvent(ctx contractapi.TransactionContextInterface, eventJSON string) error {
	var event CollectionEvent
	err := json.Unmarshal([]byte(eventJSON), &event)
	if err != nil {
		return fmt.Errorf("failed to unmarshal event: %v", err)
	}

	// 1. Validate season window
	isInSeason, err := c.ValidateSeasonWindow(ctx, event.Species, event.HarvestDate, event.ZoneName)
	if err != nil {
		return fmt.Errorf("season validation error: %v", err)
	}
	if !isInSeason {
		// Create season violation alert
		alertJSON := fmt.Sprintf(`{
			"id": "alert_season_%s",
			"alertType": "season_violation",
			"severity": "high",
			"entityId": "%s",
			"entityType": "CollectionEvent",
			"species": "%s",
			"zone": "%s",
			"message": "Harvest outside allowed season window",
			"details": "Species %s harvested on %s in %s is outside the permitted season window"
		}`, event.ID, event.ID, event.Species, event.ZoneName, event.Species, event.HarvestDate, event.ZoneName)
		c.CreateAlert(ctx, alertJSON)
		
		event.ApprovedZone = false
		event.Status = "rejected"
		return fmt.Errorf("harvest outside allowed season window for species: %s", event.Species)
	}

	// 2. Validate geo-fencing
	if !c.validateGeoFencing(event.Latitude, event.Longitude, event.Species) {
		// Create zone violation alert
		alertJSON := fmt.Sprintf(`{
			"id": "alert_zone_%s",
			"alertType": "zone_violation",
			"severity": "high",
			"entityId": "%s",
			"entityType": "CollectionEvent",
			"species": "%s",
			"zone": "%s",
			"message": "Collection location outside approved zone",
			"details": "Harvest at coordinates (%.6f, %.6f) is outside approved zone for species %s"
		}`, event.ID, event.ID, event.Species, event.ZoneName, event.Latitude, event.Longitude, event.Species)
		c.CreateAlert(ctx, alertJSON)
		
		event.ApprovedZone = false
		event.Status = "rejected"
		return fmt.Errorf("collection location outside approved zone for species: %s", event.Species)
	} else {
		event.ApprovedZone = true
		if event.Status == "" {
			event.Status = "pending"
		}
	}

	// 3. Validate harvest limit (check before tracking)
	currentSeason := getCurrentSeason()
	withinLimit, err := c.ValidateHarvestLimit(ctx, event.Species, event.ZoneName, currentSeason, event.Quantity)
	if err != nil {
		return fmt.Errorf("harvest limit validation error: %v", err)
	}
	if !withinLimit {
		// Create over-harvest alert
		alertJSON := fmt.Sprintf(`{
			"id": "alert_harvest_%s",
			"alertType": "over_harvest",
			"severity": "critical",
			"entityId": "%s",
			"entityType": "CollectionEvent",
			"species": "%s",
			"zone": "%s",
			"message": "Harvest limit exceeded",
			"details": "Attempting to harvest %.2f %s of %s in %s for season %s would exceed the limit"
		}`, event.ID, event.ID, event.Species, event.ZoneName, event.Quantity, event.Unit, event.Species, event.ZoneName, currentSeason)
		c.CreateAlert(ctx, alertJSON)
		
		event.Status = "rejected"
		return fmt.Errorf("harvest limit exceeded for species: %s in zone: %s", event.Species, event.ZoneName)
	}

	// 4. Track harvest quantity (update the limit)
	err = c.TrackHarvestQuantity(ctx, event.Species, event.ZoneName, currentSeason, event.Quantity)
	if err != nil {
		return fmt.Errorf("failed to track harvest quantity: %v", err)
	}

	// 5. Check if limit reached warning threshold
	harvestStats, err := c.GetHarvestStatistics(ctx, event.Species, event.ZoneName, currentSeason)
	if err == nil && harvestStats.Status == "warning" {
		// Create warning alert
		percentageUsed := (harvestStats.CurrentQuantity / harvestStats.MaxQuantity) * 100
		alertJSON := fmt.Sprintf(`{
			"id": "alert_warning_%s_%s_%s",
			"alertType": "over_harvest",
			"severity": "medium",
			"entityId": "%s",
			"entityType": "CollectionEvent",
			"species": "%s",
			"zone": "%s",
			"message": "Harvest limit warning",
			"details": "%.1f%% of harvest limit reached for %s in %s for season %s (%.2f / %.2f %s)"
		}`, event.Species, event.ZoneName, currentSeason, event.ID, event.Species, event.ZoneName, 
			percentageUsed, event.Species, event.ZoneName, currentSeason, 
			harvestStats.CurrentQuantity, harvestStats.MaxQuantity, harvestStats.Unit)
		c.CreateAlert(ctx, alertJSON)
	}

	// 6. Validate conservation status
	if err := c.validateConservationLimits(ctx, event.Species, event.Quantity); err != nil {
		// Create compliance alert
		alertJSON := fmt.Sprintf(`{
			"id": "alert_conservation_%s",
			"alertType": "compliance",
			"severity": "high",
			"entityId": "%s",
			"entityType": "CollectionEvent",
			"species": "%s",
			"zone": "%s",
			"message": "Conservation limit violation",
			"details": "Conservation limits exceeded for species: %s"
		}`, event.ID, event.ID, event.Species, event.ZoneName, event.Species)
		c.CreateAlert(ctx, alertJSON)
		return err
	}

	// 7. Save collection event
	eventBytes, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %v", err)
	}

	err = ctx.GetStub().PutState(event.ID, eventBytes)
	if err != nil {
		return fmt.Errorf("failed to save collection event: %v", err)
	}

	// 8. Emit event
	eventPayload := map[string]interface{}{
		"eventType":  "CollectionEventCreated",
		"eventId":    event.ID,
		"farmerId":   event.FarmerID,
		"species":    event.Species,
		"quantity":   event.Quantity,
		"unit":       event.Unit,
		"zone":       event.ZoneName,
		"status":     event.Status,
		"timestamp":  event.Timestamp,
	}
	eventPayloadBytes, _ := json.Marshal(eventPayload)
	ctx.GetStub().SetEvent("CollectionEventCreated", eventPayloadBytes)

	return nil
}

// GetCollectionEvent retrieves a collection event by ID
func (c *HerbalTraceContract) GetCollectionEvent(ctx contractapi.TransactionContextInterface, id string) (*CollectionEvent, error) {
	eventBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read event: %v", err)
	}
	if eventBytes == nil {
		return nil, fmt.Errorf("event not found: %s", id)
	}

	var event CollectionEvent
	err = json.Unmarshal(eventBytes, &event)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal event: %v", err)
	}

	return &event, nil
}

// CreateQualityTest records a new quality test result with validation and alerts
func (c *HerbalTraceContract) CreateQualityTest(ctx contractapi.TransactionContextInterface, testJSON string) error {
	var test QualityTest
	err := json.Unmarshal([]byte(testJSON), &test)
	if err != nil {
		return fmt.Errorf("failed to unmarshal test: %v", err)
	}

	// Validate quality gates
	if !c.validateQualityGates(test) {
		test.OverallResult = "fail"
		test.Status = "rejected"
		
		// Create quality failure alert
		alertJSON := fmt.Sprintf(`{
			"id": "alert_quality_%s",
			"alertType": "quality_failure",
			"severity": "high",
			"entityId": "%s",
			"entityType": "QualityTest",
			"message": "Quality test failed",
			"details": "Batch %s failed quality testing at lab %s. Overall result: fail"
		}`, test.ID, test.ID, test.BatchID, test.LabName)
		c.CreateAlert(ctx, alertJSON)
	} else {
		test.OverallResult = "pass"
		if test.Status == "" {
			test.Status = "approved"
		}
	}

	// Save quality test
	testBytes, err := json.Marshal(test)
	if err != nil {
		return fmt.Errorf("failed to marshal test: %v", err)
	}

	err = ctx.GetStub().PutState(test.ID, testBytes)
	if err != nil {
		return fmt.Errorf("failed to save quality test: %v", err)
	}

	// Auto-update batch status if batch ID is provided
	if test.BatchID != "" {
		err = c.UpdateBatchStatus(ctx, test.BatchID, "testing")
		if err != nil {
			log.Printf("Warning: Failed to update batch status: %v", err)
		}
	}

	// Emit event
	eventPayload := map[string]interface{}{
		"eventType":     "QualityTestCreated",
		"testId":        test.ID,
		"batchId":       test.BatchID,
		"labId":         test.LabID,
		"overallResult": test.OverallResult,
		"status":        test.Status,
		"timestamp":     test.Timestamp,
	}
	eventPayloadBytes, _ := json.Marshal(eventPayload)
	ctx.GetStub().SetEvent("QualityTestCreated", eventPayloadBytes)

	return nil
}

// GetQualityTest retrieves a quality test by ID
func (c *HerbalTraceContract) GetQualityTest(ctx contractapi.TransactionContextInterface, id string) (*QualityTest, error) {
	testBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read test: %v", err)
	}
	if testBytes == nil {
		return nil, fmt.Errorf("test not found: %s", id)
	}

	var test QualityTest
	err = json.Unmarshal(testBytes, &test)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal test: %v", err)
	}

	return &test, nil
}

// CreateProcessingStep records a processing step with automatic batch status update
func (c *HerbalTraceContract) CreateProcessingStep(ctx contractapi.TransactionContextInterface, stepJSON string) error {
	var step ProcessingStep
	err := json.Unmarshal([]byte(stepJSON), &step)
	if err != nil {
		return fmt.Errorf("failed to unmarshal step: %v", err)
	}

	if step.Status == "" {
		step.Status = "completed"
	}

	// Save processing step
	stepBytes, err := json.Marshal(step)
	if err != nil {
		return fmt.Errorf("failed to marshal step: %v", err)
	}

	err = ctx.GetStub().PutState(step.ID, stepBytes)
	if err != nil {
		return fmt.Errorf("failed to save processing step: %v", err)
	}

	// Auto-update batch status if batch ID is provided
	if step.BatchID != "" {
		err = c.UpdateBatchStatus(ctx, step.BatchID, "processing")
		if err != nil {
			log.Printf("Warning: Failed to update batch status: %v", err)
		}
	}

	// Emit event
	eventPayload := map[string]interface{}{
		"eventType":    "ProcessingStepCreated",
		"stepId":       step.ID,
		"batchId":      step.BatchID,
		"processType":  step.ProcessType,
		"processorId":  step.ProcessorID,
		"status":       step.Status,
		"timestamp":    step.Timestamp,
	}
	eventPayloadBytes, _ := json.Marshal(eventPayload)
	ctx.GetStub().SetEvent("ProcessingStepCreated", eventPayloadBytes)

	return nil
}

// GetProcessingStep retrieves a processing step by ID
func (c *HerbalTraceContract) GetProcessingStep(ctx contractapi.TransactionContextInterface, id string) (*ProcessingStep, error) {
	stepBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read step: %v", err)
	}
	if stepBytes == nil {
		return nil, fmt.Errorf("step not found: %s", id)
	}

	var step ProcessingStep
	err = json.Unmarshal(stepBytes, &step)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal step: %v", err)
	}

	return &step, nil
}

// RecordQCCertificate records a quality control certificate on the blockchain
func (c *HerbalTraceContract) RecordQCCertificate(ctx contractapi.TransactionContextInterface, 
	certificateId string, testId string, batchId string, batchNumber string,
	speciesName string, testType string, labId string, labName string,
	overallResult string, issuedDate string, testedBy string, resultsJSON string) error {
	
	// Parse results
	var results []map[string]interface{}
	if resultsJSON != "" {
		err := json.Unmarshal([]byte(resultsJSON), &results)
		if err != nil {
			log.Printf("Warning: Failed to unmarshal results: %v", err)
			results = []map[string]interface{}{}
		}
	}

	// Create certificate object
	certificate := QCCertificate{
		ID:            certificateId,
		Type:          "QCCertificate",
		CertificateID: certificateId,
		TestID:        testId,
		BatchID:       batchId,
		BatchNumber:   batchNumber,
		SpeciesName:   speciesName,
		TestType:      testType,
		LabID:         labId,
		LabName:       labName,
		OverallResult: overallResult,
		IssuedDate:    issuedDate,
		TestedBy:      testedBy,
		Results:       results,
		Timestamp:     issuedDate,
	}

	// Save certificate
	certBytes, err := json.Marshal(certificate)
	if err != nil {
		return fmt.Errorf("failed to marshal certificate: %v", err)
	}

	err = ctx.GetStub().PutState(certificateId, certBytes)
	if err != nil {
		return fmt.Errorf("failed to save certificate: %v", err)
	}

	// Update batch status if applicable
	if batchId != "" {
		err = c.UpdateBatchStatus(ctx, batchId, "quality_tested")
		if err != nil {
			log.Printf("Warning: Failed to update batch status: %v", err)
		}
	}

	// Emit event
	eventPayload := map[string]interface{}{
		"eventType":     "QCCertificateRecorded",
		"certificateId": certificateId,
		"testId":        testId,
		"batchId":       batchId,
		"labId":         labId,
		"overallResult": overallResult,
		"timestamp":     issuedDate,
	}
	eventPayloadBytes, _ := json.Marshal(eventPayload)
	ctx.GetStub().SetEvent("QCCertificateRecorded", eventPayloadBytes)

	log.Printf("QC Certificate recorded: %s for batch %s (result: %s)", certificateId, batchId, overallResult)
	return nil
}

// QueryQCCertificate retrieves a certificate by ID
func (c *HerbalTraceContract) QueryQCCertificate(ctx contractapi.TransactionContextInterface, certificateId string) (*QCCertificate, error) {
	certBytes, err := ctx.GetStub().GetState(certificateId)
	if err != nil {
		return nil, fmt.Errorf("failed to read certificate: %v", err)
	}
	if certBytes == nil {
		return nil, fmt.Errorf("certificate not found: %s", certificateId)
	}

	var certificate QCCertificate
	err = json.Unmarshal(certBytes, &certificate)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal certificate: %v", err)
	}

	return &certificate, nil
}

// QueryCertificatesByBatch retrieves all certificates for a specific batch
func (c *HerbalTraceContract) QueryCertificatesByBatch(ctx contractapi.TransactionContextInterface, batchId string) ([]*QCCertificate, error) {
	queryString := fmt.Sprintf(`{"selector":{"type":"QCCertificate","batchId":"%s"}}`, batchId)
	
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query certificates: %v", err)
	}
	defer resultsIterator.Close()

	var certificates []*QCCertificate
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var certificate QCCertificate
		err = json.Unmarshal(queryResponse.Value, &certificate)
		if err != nil {
			return nil, err
		}
		certificates = append(certificates, &certificate)
	}

	return certificates, nil
}

// GetCertificateHistory retrieves the modification history of a certificate
func (c *HerbalTraceContract) GetCertificateHistory(ctx contractapi.TransactionContextInterface, certificateId string) ([]map[string]interface{}, error) {
	resultsIterator, err := ctx.GetStub().GetHistoryForKey(certificateId)
	if err != nil {
		return nil, fmt.Errorf("failed to get history: %v", err)
	}
	defer resultsIterator.Close()

	var history []map[string]interface{}
	for resultsIterator.HasNext() {
		historyData, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var certificate QCCertificate
		if len(historyData.Value) > 0 {
			json.Unmarshal(historyData.Value, &certificate)
		}

		historyEntry := map[string]interface{}{
			"txId":      historyData.TxId,
			"timestamp": historyData.Timestamp,
			"isDelete":  historyData.IsDelete,
			"value":     certificate,
		}
		history = append(history, historyEntry)
	}

	return history, nil
}

// GetAllCertificates retrieves all certificates with pagination
func (c *HerbalTraceContract) GetAllCertificates(ctx contractapi.TransactionContextInterface, pageSize int, bookmark string) (map[string]interface{}, error) {
	queryString := `{"selector":{"type":"QCCertificate"}}`
	
	resultsIterator, responseMetadata, err := ctx.GetStub().GetQueryResultWithPagination(queryString, int32(pageSize), bookmark)
	if err != nil {
		return nil, fmt.Errorf("failed to query certificates: %v", err)
	}
	defer resultsIterator.Close()

	var certificates []*QCCertificate
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var certificate QCCertificate
		err = json.Unmarshal(queryResponse.Value, &certificate)
		if err != nil {
			return nil, err
		}
		certificates = append(certificates, &certificate)
	}

	result := map[string]interface{}{
		"certificates":    certificates,
		"fetchedCount":    responseMetadata.FetchedRecordsCount,
		"bookmark":        responseMetadata.Bookmark,
	}

	return result, nil
}

// CreateProduct creates a final product with QR code and automatic batch status update
func (c *HerbalTraceContract) CreateProduct(ctx contractapi.TransactionContextInterface, productJSON string) error {
	var product Product
	err := json.Unmarshal([]byte(productJSON), &product)
	if err != nil {
		return fmt.Errorf("failed to unmarshal product: %v", err)
	}

	if product.Status == "" {
		product.Status = "manufactured"
	}

	// Save product
	productBytes, err := json.Marshal(product)
	if err != nil {
		return fmt.Errorf("failed to marshal product: %v", err)
	}

	err = ctx.GetStub().PutState(product.ID, productBytes)
	if err != nil {
		return fmt.Errorf("failed to save product: %v", err)
	}

	// Auto-update batch status if batch ID is provided
	if product.BatchID != "" {
		err = c.UpdateBatchStatus(ctx, product.BatchID, "manufactured")
		if err != nil {
			log.Printf("Warning: Failed to update batch status: %v", err)
		}
	}

	// Emit event
	eventPayload := map[string]interface{}{
		"eventType":      "ProductCreated",
		"productId":      product.ID,
		"batchId":        product.BatchID,
		"qrCode":         product.QRCode,
		"manufacturerId": product.ManufacturerID,
		"status":         product.Status,
		"timestamp":      product.ManufactureDate,
	}
	eventPayloadBytes, _ := json.Marshal(eventPayload)
	ctx.GetStub().SetEvent("ProductCreated", eventPayloadBytes)

	return nil
}

// GetProduct retrieves a product by ID
func (c *HerbalTraceContract) GetProduct(ctx contractapi.TransactionContextInterface, id string) (*Product, error) {
	productBytes, err := ctx.GetStub().GetState(id)
	if err != nil {
		return nil, fmt.Errorf("failed to read product: %v", err)
	}
	if productBytes == nil {
		return nil, fmt.Errorf("product not found: %s", id)
	}

	var product Product
	err = json.Unmarshal(productBytes, &product)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal product: %v", err)
	}

	return &product, nil
}

// GetProductByQRCode retrieves a product by QR code (for consumer scanning)
func (c *HerbalTraceContract) GetProductByQRCode(ctx contractapi.TransactionContextInterface, qrCode string) (*Product, error) {
	queryString := fmt.Sprintf(`{"selector":{"type":"Product","qrCode":"%s"}}`, qrCode)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query product: %v", err)
	}
	defer resultsIterator.Close()

	if !resultsIterator.HasNext() {
		return nil, fmt.Errorf("product not found with QR code: %s", qrCode)
	}

	queryResponse, err := resultsIterator.Next()
	if err != nil {
		return nil, fmt.Errorf("failed to get next result: %v", err)
	}

	var product Product
	err = json.Unmarshal(queryResponse.Value, &product)
	if err != nil {
		return nil, fmt.Errorf("failed to unmarshal product: %v", err)
	}

	return &product, nil
}

// GenerateProvenance creates a complete FHIR-style provenance bundle
func (c *HerbalTraceContract) GenerateProvenance(ctx contractapi.TransactionContextInterface, productID string) (*Provenance, error) {
	// Get the product
	product, err := c.GetProduct(ctx, productID)
	if err != nil {
		return nil, err
	}

	provenance := &Provenance{
		ID:        "PROV-" + productID,
		ProductID: productID,
		QRCode:    product.QRCode,
		Product:   *product,
	}

	// Gather all collection events
	for _, eventID := range product.CollectionEventIDs {
		event, err := c.GetCollectionEvent(ctx, eventID)
		if err == nil {
			provenance.CollectionEvents = append(provenance.CollectionEvents, *event)
		}
	}

	// Gather all quality tests
	for _, testID := range product.QualityTestIDs {
		test, err := c.GetQualityTest(ctx, testID)
		if err == nil {
			provenance.QualityTests = append(provenance.QualityTests, *test)
		}
	}

	// Gather all processing steps
	for _, stepID := range product.ProcessingStepIDs {
		step, err := c.GetProcessingStep(ctx, stepID)
		if err == nil {
			provenance.ProcessingSteps = append(provenance.ProcessingSteps, *step)
		}
	}

	// Calculate sustainability score (simplified)
	provenance.SustainabilityScore = c.calculateSustainabilityScore(provenance)

	return provenance, nil
}

// GetProvenanceByQRCode retrieves provenance by scanning QR code
func (c *HerbalTraceContract) GetProvenanceByQRCode(ctx contractapi.TransactionContextInterface, qrCode string) (*Provenance, error) {
	product, err := c.GetProductByQRCode(ctx, qrCode)
	if err != nil {
		return nil, err
	}

	return c.GenerateProvenance(ctx, product.ID)
}

// QueryCollectionsByFarmer queries collection events by farmer ID
func (c *HerbalTraceContract) QueryCollectionsByFarmer(ctx contractapi.TransactionContextInterface, farmerID string) ([]*CollectionEvent, error) {
	queryString := fmt.Sprintf(`{"selector":{"type":"CollectionEvent","farmerId":"%s"}}`, farmerID)
	return c.queryCollectionEvents(ctx, queryString)
}

// QueryCollectionsBySpecies queries collection events by species
func (c *HerbalTraceContract) QueryCollectionsBySpecies(ctx contractapi.TransactionContextInterface, species string) ([]*CollectionEvent, error) {
	queryString := fmt.Sprintf(`{"selector":{"type":"CollectionEvent","species":"%s"}}`, species)
	return c.queryCollectionEvents(ctx, queryString)
}

// Helper function to query collection events
func (c *HerbalTraceContract) queryCollectionEvents(ctx contractapi.TransactionContextInterface, queryString string) ([]*CollectionEvent, error) {
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, fmt.Errorf("failed to query: %v", err)
	}
	defer resultsIterator.Close()

	var events []*CollectionEvent
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return nil, err
		}

		var event CollectionEvent
		err = json.Unmarshal(queryResponse.Value, &event)
		if err != nil {
			return nil, err
		}
		events = append(events, &event)
	}

	return events, nil
}

// validateGeoFencing checks if collection location is in approved zone
func (c *HerbalTraceContract) validateGeoFencing(lat, lon float64, species string) bool {
	// Basic coordinate validation
	if lat < -90 || lat > 90 || lon < -180 || lon > 180 {
		return false
	}
	
	// Define approved zones for specific species
	// Neem zone: Greater Noida area (30.268804, 77.993259) with 50km radius
	if species == "Neem" {
		neemLat := 30.268804
		neemLon := 77.993259
		radius := 0.5 // ~50km in degrees (approximate)
		
		latDiff := lat - neemLat
		lonDiff := lon - neemLon
		distance := (latDiff * latDiff) + (lonDiff * lonDiff)
		
		if distance <= (radius * radius) {
			return true
		}
		return false
	}
	
	// Ashwagandha zone: Keep existing zone (allow all for now)
	if species == "Ashwagandha" {
		return true
	}
	
	// Tulsi, Brahmi: Year-round herbs, allow all locations
	if species == "Tulsi" || species == "Brahmi" {
		return true
	}
	
	// Default: allow all other species for demo
	return true
}

// validateConservationLimits checks species conservation limits
func (c *HerbalTraceContract) validateConservationLimits(ctx contractapi.TransactionContextInterface, species string, quantity float64) error {
	// Simplified validation - in production, check against conservation database
	// and accumulated harvest quantities per season
	
	// Example: Block endangered species harvest
	endangeredSpecies := map[string]bool{
		"Aconitum heterophyllum": true,
		"Nardostachys jatamansi": true,
		"Picrorhiza kurroa":      true,
	}
	
	if endangeredSpecies[species] {
		return fmt.Errorf("species %s is endangered and requires special permit", species)
	}
	
	return nil
}

// validateQualityGates validates quality test results against thresholds
func (c *HerbalTraceContract) validateQualityGates(test QualityTest) bool {
	// Check moisture content (should be < 12% for most herbs)
	if test.MoistureContent > 12.0 {
		return false
	}

	// Check pesticide results (all should pass)
	for _, result := range test.PesticideResults {
		if result != "pass" {
			return false
		}
	}

	// Check heavy metals (example thresholds in ppm)
	heavyMetalLimits := map[string]float64{
		"lead":     10.0,
		"arsenic":  3.0,
		"mercury":  1.0,
		"cadmium":  0.3,
	}

	for metal, value := range test.HeavyMetals {
		if limit, exists := heavyMetalLimits[metal]; exists {
			if value > limit {
				return false
			}
		}
	}

	// Check aflatoxins (should be < 20 ppb)
	if test.Aflatoxins > 20.0 {
		return false
	}

	return true
}

// calculateSustainabilityScore calculates a sustainability score (0-100)
func (c *HerbalTraceContract) calculateSustainabilityScore(prov *Provenance) float64 {
	score := 100.0

	// Deduct points for non-approved zones
	for _, event := range prov.CollectionEvents {
		if !event.ApprovedZone {
			score -= 10.0
		}
	}

	// Deduct points for failed quality tests
	for _, test := range prov.QualityTests {
		if test.OverallResult == "fail" {
			score -= 15.0
		}
	}

	// Add points for certifications
	certificationBonus := float64(len(prov.Product.Certifications)) * 5.0
	score += certificationBonus

	if score < 0 {
		score = 0
	}
	if score > 100 {
		score = 100
	}

	return score
}

func main() {
	chaincode, err := contractapi.NewChaincode(&HerbalTraceContract{})
	if err != nil {
		log.Panicf("Error creating HerbalTrace chaincode: %v", err)
	}

	ccid := os.Getenv("CHAINCODE_ID")
	ccAddress := os.Getenv("CHAINCODE_SERVER_ADDRESS")
	if ccid != "" && ccAddress != "" {
		server := &shim.ChaincodeServer{
			CCID:    ccid,
			Address: ccAddress,
			CC:      chaincode,
			TLSProps: shim.TLSProperties{
				Disabled: true,
			},
		}

		if err := server.Start(); err != nil {
			log.Panicf("Error starting HerbalTrace chaincode server: %v", err)
		}
		return
	}

	if err := chaincode.Start(); err != nil {
		log.Panicf("Error starting HerbalTrace chaincode: %v", err)
	}
}
