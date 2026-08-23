# Manufacturer Section Analysis - HerbalTrace Web-Portal

## 1. Location & File Structure

**Main Component File:**
- Location: `web-portal/src/components/manufacturer/ManufacturerLandingPage.jsx`
- Directory: `web-portal/src/components/manufacturer/`
- Size: ~2,200 lines of code
- Framework: React with Framer Motion animations

---

## 2. UI Sections / Tabs & Features

The manufacturer dashboard has **6 main navigation tabs**:

### A. **Overview Tab** (Default)
**Features:**
- Dashboard greeting with time-based message (Good morning/afternoon/evening)
- Statistics cards showing:
  - Available Batches (count from API)
  - Products Created (count from API)
  - QR Codes Generated (filtered count)
  - Process Efficiency (static 98%)
- **Active Processing Steps** section (displays empty activeProcesses array)
- **Quick Actions** sidebar:
  - Start New Process
  - Generate QR Code
  - View Provenance
  - Simulate Recall

### B. **Batch Management Tab**
**Features:**
- View incoming batches that are quality-tested or ready for processing
- Display batch details in cards:
  - Batch ID / Name
  - Herb/Species type
  - Quantity with unit (kg, units, etc.)
  - Farmer name
  - Lab Status (Approved/Pending)
  - Priority level (High/Medium/Low)
  - Received date
  - Expiry date
- Search functionality (input field present)
- Filter button
- Click batch to view details modal with "Start Processing" & "View Provenance" options

### C. **Processing Steps Tab**
**Features:**
- Create new processing steps form
- Input fields:
  - Batch ID select
  - Process Step dropdown (8 predefined types):
    - Cleaning & Sorting
    - Drying
    - Grinding
    - Extraction
    - Filtration
    - Concentration
    - Packaging
    - Quality Check
  - Temperature (°C)
  - Humidity (%)
  - Estimated Duration
  - Operator assignment
  - Additional Notes
- Submit to create process

### D. **Inventory Tracking Tab**
**Features:**
- Material inventory table showing:
  - Material name (herb species from API)
  - Available quantity (calculated from batches)
  - Reserved quantity
  - Location (Warehouse)
  - View Details action
- Add Material button

### E. **QR Generation Tab**
**Features:**
- Form to generate QR codes with inputs:
  - Lot ID (required)
  - Product Name (required)
  - Source Batch IDs
  - Manufacturing Date
  - Expiry Date
  - Quantity
- QR code display (simulated visual representation)
- Download QR Code button
- Reset button

### F. **Recall Simulation Tab**
**Features:**
- Test recall scenarios
- Input fields:
  - Product/Lot to Recall
  - Recall Reason dropdown:
    - Contamination detected
    - Quality issue
    - Labeling error
    - Regulatory requirement
- Simulate Recall button

---

## 3. API Endpoints Called

### **GET Requests**

| Endpoint | Purpose | Authentication | Response |
|----------|---------|-----------------|----------|
| `/api/v1/batches` | Fetch batches ready for processing | Bearer Token | Array of batch objects |
| `/api/v1/manufacturer/products` | Get all products created by manufacturer | Bearer Token | Array of product objects |

### **POST Requests**

| Endpoint | Purpose | Authentication | Payload |
|----------|---------|-----------------|---------|
| `/api/v1/manufacturer/products` | Create a new product from batch | Bearer Token | `{ batchId, productName, productType, quantity, unit, manufactureDate, expiryDate, ingredients[], certifications[], processingSteps[] }` |
| `/api/v1/manufacturer/products/{productId}/qr` | Generate QR code for product | Bearer Token | `{ lotNumber, productName }` |
| `/api/v1/complaints` | Submit complaint/issue | Bearer Token | `{ category, subject, message, priority }` |

---

## 4. Error Handling & Console Logs

### **Error States in Code:**

```javascript
// Line 57: Error state variable
const [error, setError] = useState('')

// Line 76, 103: Set error message
setError('Failed to fetch data')
console.error('Fetch error:', err)

// Line 104: Console error for fetch failures
console.error('Fetch error:', err)
```

### **Key Error Scenarios:**

1. **Data Fetch Failure (Line 102-104)**
   - Triggered when either `/api/v1/batches` or `/api/v1/manufacturer/products` fails
   - Sets error message: "Failed to fetch data"
   - Logs: `console.error('Fetch error:', err)`

2. **Product Creation Errors (Line ~1805)**
   - Checks response status and `result.success` flag
   - Throws error with: `result.message || 'Failed to create product'`
   - Sets `setError(err.message)`

3. **QR Generation Error (Line ~1365)**
   - Logs: `console.error('QR generation error:', err)`
   - Has fallback to local QR generation if API fails
   - Sets QR data locally even if API call fails

4. **Complaint Submission Error (Line ~1545-1548)**
   - Catches network errors with: `console.error('Error submitting complaint:', err)`
   - Shows alert: "Failed to submit complaint"
   - Checks `result.success` flag for API response validation

### **Warning/Debug Points:**

- Line 115: Silent catch when parsing stored user data: `} catch (e) {}`
- Line 1548: Generic alert for complaint errors

---

## 5. Data Structure & Models

### **Batch Object (from API)**
```javascript
{
  id: string/number,
  batch_number: string,
  species: string,
  total_quantity: number,
  unit: string (kg, g, L, etc),
  farmer_name: string,
  status: string (quality_tested, ready_for_processing, created),
  created_at: ISO timestamp
}
```

### **Product Object**
```javascript
{
  id: string/number,
  name: string / product_name: string,
  lot_number: string,
  productType: string,
  quantity: number,
  qr_code: string,
  qrCodeImage: base64 string,
  productId: string,
  blockchainTxId: string,
  processingSteps: Array<{
    processType: string,
    temperature: number,
    duration: number,
    equipment: string,
    notes: string
  }>
}
```

### **Inventory Item (Derived)**
```javascript
{
  id: number,
  material: string (species name),
  available: string (quantity with unit),
  reserved: string,
  location: string
}
```

---

## 6. Authentication & Storage

- **Auth Token**: Stored in `localStorage` as `herbaltrace_token`
- **User Data**: Stored in `localStorage` as `herbaltrace_user` (JSON)
- **Token Usage**: Passed in `Authorization: Bearer ${token}` header
- **Fallback**: If no token, data fetch won't execute

**Token Requirements:**
- All data fetches require valid JWT token
- API calls check: `const token = localStorage.getItem('herbaltrace_token')`
- If missing, operations are skipped

---

## 7. Modal Components

| Modal | Trigger | Purpose |
|-------|---------|---------|
| **CreateProductModal** | "Create Product" button | Create new product from batch with processing steps |
| **QRGenerationModal** | "Generate QR Code" quick action | Fast QR generation for products |
| **ComplaintModal** | "Raise Complaint" button | Submit issues/complaints to admin |
| **NewProcessModal** | Processing tab | Create manufacturing process steps |
| **BatchDetailModal** | Click batch card | View detailed batch information |
| **ProcessDetailModal** | Click process card | View processing step details |

---

## 8. Key State Variables

```javascript
// UI State
const [activeTab, setActiveTab] = useState('overview')
const [selectedBatch, setSelectedBatch] = useState(null)
const [selectedProcess, setSelectedProcess] = useState(null)
const [showNewProcessModal, setShowNewProcessModal] = useState(false)
const [showQRModal, setShowQRModal] = useState(false)
const [showComplaintModal, setShowComplaintModal] = useState(false)
const [showCreateProductModal, setShowCreateProductModal] = useState(false)

// Data State
const [batches, setBatches] = useState([])
const [products, setProducts] = useState([])
const [userData, setUserData] = useState(null)

// Status State
const [isLoading, setIsLoading] = useState(false)
const [error, setError] = useState('')
```

---

## 9. Common Issues & Debugging Tips

### **If Dashboard Shows Empty**
1. Check if token is valid: `localStorage.getItem('herbaltrace_token')`
2. Check API response: Browser DevTools → Network → Filter `/api/v1/batches`
3. Look for error message in console output
4. Verify backend is running on port 3000

### **If Products Not Showing**
1. Check `/api/v1/manufacturer/products` API response
2. Verify user role is 'Manufacturer'
3. Look for "Failed to fetch data" error message on page

### **If QR Generation Fails**
1. Check browser console for: `console.error('QR generation error:'...)`
2. API endpoint: POST `/api/v1/manufacturer/products/{productId}/qr`
3. Verify product ID is valid and exists
4. Check that lot number and product name are filled in

### **If Complaint Won't Submit**
1. Check console for error: `console.error('Error submitting complaint:'...)`
2. Verify all required fields are filled (category, subject, message)
3. Check network tab for POST `/api/v1/complaints` response
4. Check authentication token is valid

---

## 10. Dependencies & Imports

**Key Libraries:**
- React with Hooks (useState, useEffect, useMemo)
- Framer Motion (animations)
- Lucide React (icons)
- Custom hooks: `useEnums` (for dropdown options)
- Custom components: `DashboardNavbar`

**Icon Types Used:**
Package, Factory, QrCode, Plus, etc. from lucide-react

---

## 11. Summary Table

| Aspect | Details |
|--------|---------|
| **File Location** | `web-portal/src/components/manufacturer/ManufacturerLandingPage.jsx` |
| **Main Tabs** | 6 (Overview, Batches, Processing, Inventory, QR, Recall) |
| **API Endpoints** | 5 (2 GET, 3 POST) |
| **Error Handling** | try-catch blocks, console.error logging, user-facing alerts |
| **Auth Method** | JWT Bearer token from localStorage |
| **State Management** | React hooks (useState, useEffect, useMemo) |
| **Real-time Data** | Batches and Products from backend API |
| **Simulated Data** | QR visual, Active Processes (empty array), Recall simulation |
| **Critical Functions** | fetchData(), handleSubmit() (product creation), handleGenerate() (QR) |

