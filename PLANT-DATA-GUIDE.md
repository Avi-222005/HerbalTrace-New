# HerbalTrace Plant Data Guide

## Available Herbal Species

The system supports these commonly-used medicinal herbs in India:

| Common Name | Scientific Name | Parts Collected | Best Season |
|------------|-----------------|-----------------|-------------|
| **Ashwagandha** | Withania somnifera | Roots | Oct-Mar |
| **Turmeric** | Curcuma longa | Rhizome | Jan-Mar |
| **Tulsi** | Ocimum sanctum | Leaves, Flowers | Year-round |
| **Brahmi** | Bacopa monnieri | Whole Plant | Jun-Oct |
| **Neem** | Azadirachta indica | Leaves, Bark | Year-round |
| **Giloy** | Tinospora cordifolia | Stem | Year-round |
| **Shatavari** | Asparagus racemosus | Roots | Oct-Feb |
| **Amla** | Phyllanthus emblica | Fruits | Nov-Feb |

---

## Sample Collection Data (for Farmer)

### Ashwagandha (Roots)
```
Species: Ashwagandha
Common Name: Indian Ginseng
Quantity: 15 kg
Unit: kg
Harvest Method: manual
Part Collected: roots
Harvest Date: 2025-01-15
Weather: Sunny
Soil Type: Sandy
```

### Tulsi (Leaves)
```
Species: Tulsi
Common Name: Holy Basil
Quantity: 5 kg
Unit: kg
Harvest Method: manual
Part Collected: leaves
Harvest Date: 2025-01-20
Weather: Sunny
Soil Type: Loamy
```

### Turmeric (Rhizome)
```
Species: Turmeric
Common Name: Haldi
Quantity: 25 kg
Unit: kg
Harvest Method: manual
Part Collected: rhizome
Harvest Date: 2025-02-10
Weather: Cloudy
Soil Type: Black Soil
```

---

## QR Code Generation Process (for Manufacturer)

### Step-by-Step:

1. **Login as Manufacturer** (e.g., manufacturer/manufacturer123)

2. **Go to Dashboard** - Click "Create Product" button (green, top right)

3. **Select Lab-Approved Batch**:
   - Choose a batch with "Approved" lab status
   - Batches without lab approval cannot be used

4. **Enter Product Details**:
   ```
   Product Name: Ashwagandha Powder 500g
   Product Type: powder
   Quantity: 100
   Unit: kg
   Manufacture Date: 2025-01-25
   Expiry Date: 2026-01-25
   ```

5. **Add Processing Step** (optional):
   - Process Type: Drying
   - Temperature: 45°C
   - Duration: 24 hours

6. **Click "Create Product"**:
   - System generates QR code automatically
   - QR code ID: `QR-[timestamp]-[random]`
   - Downloads QR image for packaging

---

## Lab Testing (Minimal Flow)

### Quick QC Test:
1. Login as Lab user
2. Go to QC Testing tab
3. Select pending batch
4. Enter basic test results:
   - Moisture: 8-12%
   - Purity: 95-99%
   - Heavy Metals: Pass/Fail
5. Click "Submit" or "Issue Certificate"

---

## Workflow Summary

```
Farmer → Creates Collection (GPS + species data)
   ↓
Admin → Creates Batch (groups collections)
   ↓
Lab → Tests Batch → Issues Certificate
   ↓
Manufacturer → Creates Product → Generates QR Code
   ↓
Consumer → Scans QR → Views Full Provenance
```

---

## Test Users

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Farmer | avinashverma | avinash123 |
| Lab | labtest | lab123 |
| Manufacturer | manufacturer | manufacturer123 |
