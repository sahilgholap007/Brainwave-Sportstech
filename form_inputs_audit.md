# Form Inputs Data Documentation

**Date:** January 24, 2026
**Scope:** Comprehensive breakdown of input fields, categorized by commonality across Court, Paddle, and Ball certification forms.

---

## 1. Field Scope Comparison

### 1.1 Common Fields (Present in All 3 Forms)
These fields are universal and share the same data type and purpose across all forms.

| Field Name | Description | Type | Required |
| :--- | :--- | :--- | :--- |
| `name` | Applicant Name | Text | Yes |
| `contactNumber` | Contact Number | Text | Yes |
| `email` | Email Address | Email | Yes |
| `mailingAddress` | Mailing Address | Textarea | Yes |
| `companyName` | Company/Brand Name | Text | Yes |
| `manufacturer` | Manufacturer Name | Text | Yes |
| `country` | Country | Text | Yes |
| `state` | State | Text | Yes |
| `gstin` | GST Number | Text | Yes (If India) |
| `certificationType` | Certification Body | Select | Yes (AIPA/IPF) |
| `paymentReceipt` | Payment Screenshot | File | Yes |
| `termsAccepted` | Terms Agreement | Checkbox | Yes |

### 1.2 Form-Specific (Uncommon) Fields
These fields are unique to specific forms or distinct in their usage.

#### 🏛️ Court Certification Only
| Field Name | Description | Purpose |
| :--- | :--- | :--- |
| `facilityName` | Name of the facility complex | Identification |
| `facilityLocation` | Physical location of the court | Logistics |
| `facilityType` | Indoor vs Outdoor | Classification |
| `numberOfCourts` | Count of courts for certification | Pricing |
| `constructionDate` | Date court was built | Validation |
| `renovationDate` | Date of last renovation | Validation |
| `baseType` | Concrete vs Asphalt | Technical |
| `surfaceType` | Acrylic vs Other | Technical |
| `otherSurfaceType` | Specifics if "Other" surface | Technical |
| `surfaceColorScheme`| Visual color of court | Aesthetic |
| `constructionCompany`| Builder name | Reference |
| `useType` | Recreational vs Professional | Usage |
| `checklistUploaded` | Signed PDF Checklist | **Mandatory Pre-requisite** |
| `courtImages` | **Multiple** Images (Array) | Visual Evidence |
| `isCourtBeingUsed` | Active Status | Operational |

#### 🏓 Paddle Testing Only
| Field Name | Description | Purpose |
| :--- | :--- | :--- |
| `modelName` | Model identifier | Product ID |
| `modelNumber` | Model stock number | Product ID |
| `submissionType` | New/Resubmission/Renewal | Process Logic |
| `paddleShape` | Shape specification | Technical |
| `coreMaterial` | Core composition | Technical |
| `coreThickness` | Core measurement | Technical |
| `honeycombCellSize` | Internal structure size | Technical |
| `surfaceMaterial` | Exterior material | Technical |
| `surfaceFinish` | Texture/Finish type | Technical |
| `currentlySold` | Market availability | Market Data |
| `previouslySubmitted`| Previous testing status | History |
| `paddleImage` | **Single** Image | Visual Evidence |

#### 🎾 Ball Testing Only
| Field Name | Description | Purpose |
| :--- | :--- | :--- |
| `modelName` | Model identifier | Product ID |
| `modelNumber` | Model stock number | Product ID |
| `submissionType` | New/Resubmission/Renewal | Process Logic |
| `ballType` | Seam/Seamless | Technical |
| `materialOfBall` | Composition material | Technical |
| `useType` | **Indoor vs Outdoor** | Usage (Note: Different meaning than Court) |
| `currentlySold` | Market availability | Market Data |
| `previouslySubmitted`| Previous testing status | History |
| `ballImage` | **Single** Image | Visual Evidence |

---

## 2. Detailed Data Tables Per Form

### 2.1 Court Certification Inputs
**Source:** `src/app/forms/court-certification/application-form/page.jsx`
*   **Unique Logic:** Requires `checklistUploaded` (PDF) and accepts multiple `courtImages`.
*   **Key Inputs:** `facilityName`, `numberOfCourts`, `surfaceType`, `baseType`.

### 2.2 Paddle Testing Inputs
**Source:** `src/app/forms/pickle-ball-paddle-testing/application-form/page.jsx`
*   **Unique Logic:** Extensive technical specs (`coreMaterial`, `honeycombCellSize`, etc.).
*   **Key Inputs:** `modelName`, `coreThickness`, `surfaceFinish`.

### 2.3 Ball Testing Inputs
**Source:** `src/app/forms/pickle-ball-testing/application-form/page.jsx`
*   **Unique Logic:** Simpler technical specs compared to paddle.
*   **Key Inputs:** `ballType`, `materialOfBall`.
