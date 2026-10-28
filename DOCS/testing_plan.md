# 🧪 TraceIntel AG-1 — Complete Testing Plan

## Overview

| Category | Test Cases | Framework |
|----------|-----------|-----------|
| Unit Tests (Service Layer) | 28 | JUnit 5 + Mockito |
| API / Integration Tests | 18 | Spring Boot Test + MockMvc |
| Security Tests | 8 | Spring Security Test |
| Database Tests | 5 | Flyway + Constraints |
| Manual QA Test Cases | 6 | Manual walkthrough |
| Performance Tests | 3 | Measured timing |
| **TOTAL** | **68** | |

---

## 1. UNIT TESTS (JUnit 5 + Mockito)

> Unit tests isolate business logic from database. We mock repositories and test only the service logic.

---

### 1.1 ScanServiceTest — 10 Test Cases ⭐

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| SC-01 | Valid part scan — ACCEPTED | Correct serial, correct batch, lot OK | `result = ACCEPTED`, scan event saved | 🔴 HIGH |
| SC-02 | Wrong part — BLOCKED | Serial belongs to Part-B, but batch needs Part-A | `result = BLOCKED`, `reason = "WRONG_PART"` | 🔴 HIGH |
| SC-03 | Lot ON_HOLD — BLOCKED | Serial's lot status = ON_HOLD | `result = BLOCKED`, `reason = "LOT_ON_HOLD"` | 🔴 HIGH |
| SC-04 | Duplicate serial — BLOCKED | Same serial scanned again in same batch | `result = BLOCKED`, `reason = "DUPLICATE_SERIAL"` | 🔴 HIGH |
| SC-05 | Serial not found — creates new | Unknown serial input | New serial created and scan proceeds | 🟡 MED |
| SC-06 | Manual entry without approval — BLOCKED | `manualEntry = true`, `approvedBy = null` | `result = BLOCKED`, `reason = "MANUAL_ENTRY_NOT_APPROVED"` | 🟡 MED |
| SC-07 | Manual entry with supervisor approval — ACCEPTED | `manualEntry = true`, `approvedBy = supervisorId` | `result = ACCEPTED` | 🟡 MED |
| SC-08 | Lot REJECTED status — BLOCKED | Serial's lot status = REJECTED | `result = BLOCKED`, `reason = "LOT_REJECTED"` | 🟡 MED |
| SC-09 | Scan event saved on ACCEPTED | Valid scan | ScanEvent record saved with `result = ACCEPTED` | 🟢 LOW |
| SC-10 | Scan event saved on BLOCKED | Invalid scan | ScanEvent record saved with `result = BLOCKED` + reason | 🟢 LOW |

```java
// ScanServiceTest.java — Example structure
@ExtendWith(MockitoExtension.class)
class ScanServiceTest {

    @Mock private SerialNumberRepository serialNumberRepo;
    @Mock private MaterialLotRepository materialLotRepo;
    @Mock private BomItemRepository bomItemRepo;
    @Mock private ScanEventRepository scanEventRepo;
    @Mock private ProductionBatchRepository batchRepo;

    @InjectMocks private ScanServiceImpl scanService;

    @Test
    @DisplayName("SC-01: Valid part scan returns ACCEPTED")
    void validPartScan_shouldReturnAccepted() {
        // Arrange: mock serial found, lot OK, part matches BOM
        // Act: call scanService.validateScan(request)
        // Assert: result == ACCEPTED, scanEvent saved
    }

    @Test
    @DisplayName("SC-02: Wrong part scan returns BLOCKED with reason")
    void wrongPart_shouldReturnBlocked() {
        // Arrange: serial belongs to Part-B, batch expects Part-A
        // Act: call scanService.validateScan(request)
        // Assert: result == BLOCKED, reason == "WRONG_PART"
    }

    @Test
    @DisplayName("SC-03: Part from ON_HOLD lot is blocked")
    void lotOnHold_shouldBlockScan() {
        // Arrange: lot status = ON_HOLD
        // Act & Assert: result == BLOCKED, reason contains "ON_HOLD"
    }

    @Test
    @DisplayName("SC-04: Duplicate serial is rejected")
    void duplicateSerial_shouldBeRejected() {
        // Arrange: serial already scanned in this batch
        // Act & Assert: throws DuplicateSerialException or returns BLOCKED
    }
}
```

---

### 1.2 TraceServiceTest — 8 Test Cases ⭐

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| TR-01 | Forward trace — returns affected batches | `lotId = 5` (used by 2 batches) | Returns 2 batches | 🔴 HIGH |
| TR-02 | Forward trace — returns affected customers | `lotId = 5` (shipped to Maruti) | Returns Maruti Suzuki | 🔴 HIGH |
| TR-03 | Forward trace — returns affected VINs | `lotId = 5` (linked to 3 VINs) | Returns 3 VIN strings | 🔴 HIGH |
| TR-04 | Forward trace — separates shipped vs in-factory | `lotId = 5` (1 shipped, 1 not) | `shippedBatches = 1`, `inFactoryBatches = 1` | 🔴 HIGH |
| TR-05 | Forward trace — records trace time | Any lot | `durationMs > 0`, TraceRun saved | 🟡 MED |
| TR-06 | Backward trace from VIN | `vin = "MA3FJEB1S00123456"` | Returns batch B-2026-003, lot LOT-005 | 🔴 HIGH |
| TR-07 | Backward trace from serial | `serial = "MTH-DH-001-00042"` | Returns batch and lot info | 🟡 MED |
| TR-08 | Trace with no results | `lotId = 999` (unused lot) | Returns empty result, no error | 🟡 MED |

```java
// TraceServiceTest.java — Example
@Test
@DisplayName("TR-01: Forward trace returns affected batches")
void forwardTrace_shouldReturnAffectedBatches() {
    // Arrange: lot 5 consumed by batch 3 and batch 7
    when(batchMaterialConsumptionRepo.findByLotId(5L))
        .thenReturn(List.of(consumption1, consumption2));

    // Act
    TraceResultDto result = traceService.forwardTrace(5L);

    // Assert
    assertThat(result.getAffectedBatches()).hasSize(2);
    assertThat(result.getTraceTimeMs()).isGreaterThan(0);
}
```

---

### 1.3 HoldServiceTest — 6 Test Cases ⭐

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| HD-01 | Hold request created successfully | `lotId = 5`, `requestedBy = userId1` | Hold created with `status = REQUESTED` | 🔴 HIGH |
| HD-02 | Same person cannot approve — FAILS | `requestedBy = user1`, `approvedBy = user1` | Throws `InvalidApprovalException` | 🔴 HIGH |
| HD-03 | Different person approves — SUCCESS | `requestedBy = user1`, `approvedBy = user2` | `status = APPROVED`, lot → ON_HOLD | 🔴 HIGH |
| HD-04 | Lot status changes to ON_HOLD after approval | After HD-03 | `materialLot.status = ON_HOLD` | 🔴 HIGH |
| HD-05 | Hold rejection works | `approvedBy = user2`, `approved = false` | `status = REJECTED`, lot stays OK | 🟡 MED |
| HD-06 | Cannot approve already resolved hold | Hold already APPROVED | Throws exception | 🟡 MED |

```java
// HoldServiceTest.java — Example
@Test
@DisplayName("HD-02: Same person requesting and approving throws exception")
void samePersonApproval_shouldThrowException() {
    // Arrange
    QualityHold hold = new QualityHold();
    hold.setRequestedBy(user1);  // user1 requested
    when(holdRepo.findById(1L)).thenReturn(Optional.of(hold));

    // Act & Assert
    assertThrows(InvalidApprovalException.class, () -> {
        holdService.approveHold(1L, user1.getId(), approvalDto);  // user1 tries to approve
    });
}

@Test
@DisplayName("HD-03: Different person can approve successfully")
void differentPersonApproval_shouldSucceed() {
    // Arrange
    QualityHold hold = new QualityHold();
    hold.setRequestedBy(user1);  // user1 requested
    when(holdRepo.findById(1L)).thenReturn(Optional.of(hold));

    // Act
    QualityHoldDto result = holdService.approveHold(1L, user2.getId(), approvalDto);

    // Assert
    assertThat(result.getStatus()).isEqualTo("APPROVED");
    verify(materialLotRepo).save(argThat(lot -> lot.getStatus().equals("ON_HOLD")));
}
```

---

### 1.4 EstimateServiceTest — 4 Test Cases

| ID | Test Case | Input | Expected Result | Priority |
|----|-----------|-------|----------------|----------|
| ES-01 | Vehicle estimate calculation | 800 affected parts, 1 part per vehicle | `estimatedVehicles = 800` | 🔴 HIGH |
| ES-02 | Vehicle estimate with multiple parts per vehicle | 800 parts, 4 parts per vehicle | `estimatedVehicles = 200` | 🔴 HIGH |
| ES-03 | Loss estimate calculation | 800 parts × ₹300 + ₹40000 scrap + ₹24000 rework | `totalLoss = ₹304,000` | 🔴 HIGH |
| ES-04 | Zero affected parts | 0 parts affected | `estimatedVehicles = 0`, `totalLoss = 0` | 🟡 MED |

```java
// EstimateServiceTest.java
@Test
@DisplayName("ES-01: Vehicle estimate = affected parts / parts per vehicle")
void vehicleEstimate_shouldCalculateCorrectly() {
    int affectedParts = 800;
    int partsPerVehicle = 1;

    int result = estimateService.calculateAffectedVehicles(affectedParts, partsPerVehicle);

    assertThat(result).isEqualTo(800);
}

@Test
@DisplayName("ES-03: Loss = (parts × cost) + scrap + rework")
void lossEstimate_shouldCalculateCorrectly() {
    BigDecimal costPerPart = new BigDecimal("300.00");
    BigDecimal scrapCost = new BigDecimal("40000.00");
    BigDecimal reworkCost = new BigDecimal("24000.00");
    int affectedParts = 800;

    BigDecimal result = estimateService.calculateLoss(affectedParts, costPerPart, scrapCost, reworkCost);

    assertThat(result).isEqualByComparingTo(new BigDecimal("304000.00"));
}
```

---

## 2. API / INTEGRATION TESTS (MockMvc)

> Tests the full request-response cycle through controllers. Uses `@WebMvcTest` or `@SpringBootTest`.

### 2.1 Auth API Tests

| ID | Test | Method + URL | Expected |
|----|------|-------------|----------|
| API-01 | Login with valid credentials | `POST /api/auth/login` | `200 OK` + JWT token |
| API-02 | Login with wrong password | `POST /api/auth/login` | `401 Unauthorized` |
| API-03 | Access protected endpoint without token | `GET /api/dashboard/stats` | `401 Unauthorized` |
| API-04 | Access with expired token | `GET /api/dashboard/stats` | `401 Unauthorized` |

### 2.2 Scan API Tests

| ID | Test | Method + URL | Expected |
|----|------|-------------|----------|
| API-05 | Validate scan — accepted | `POST /api/scan/validate` | `200 OK`, `result = ACCEPTED` |
| API-06 | Validate scan — blocked | `POST /api/scan/validate` | `200 OK`, `result = BLOCKED` |
| API-07 | Scan with missing fields | `POST /api/scan/validate` (empty body) | `400 Bad Request` |

### 2.3 Trace API Tests

| ID | Test | Method + URL | Expected |
|----|------|-------------|----------|
| API-08 | Forward trace | `POST /api/trace/forward` | `200 OK` + trace result JSON |
| API-09 | Backward trace | `POST /api/trace/backward` | `200 OK` + chain JSON |
| API-10 | Trace with invalid lot | `POST /api/trace/forward` | `404 Not Found` |

### 2.4 Hold API Tests

| ID | Test | Method + URL | Expected |
|----|------|-------------|----------|
| API-11 | Request hold | `POST /api/holds/request` | `201 Created` |
| API-12 | Approve hold (different user) | `PUT /api/holds/1/approve` | `200 OK`, lot → ON_HOLD |
| API-13 | Approve hold (same user) | `PUT /api/holds/1/approve` | `400 Bad Request` |

### 2.5 Admin CRUD API Tests

| ID | Test | Method + URL | Expected |
|----|------|-------------|----------|
| API-14 | Create part | `POST /api/admin/parts` | `201 Created` |
| API-15 | Get all parts | `GET /api/admin/parts` | `200 OK` + list |
| API-16 | Update part | `PUT /api/admin/parts/1` | `200 OK` |
| API-17 | Delete part | `DELETE /api/admin/parts/1` | `204 No Content` |
| API-18 | VIN CSV import | `POST /api/admin/vin/import` | `200 OK` + count imported |

---

## 3. SECURITY TESTS

| ID | Test | Description | Expected |
|----|------|------------|----------|
| SEC-01 | Operator cannot access admin endpoints | OPERATOR calls `/api/admin/parts` | `403 Forbidden` |
| SEC-02 | Operator can access scan endpoints | OPERATOR calls `/api/scan/validate` | `200 OK` |
| SEC-03 | Quality Engineer can access trace | QE calls `/api/trace/forward` | `200 OK` |
| SEC-04 | Quality Engineer cannot access admin | QE calls `/api/admin/users` | `403 Forbidden` |
| SEC-05 | Manager can view audit logs | MANAGER calls `/api/audit/logs` | `200 OK` |
| SEC-06 | Operator cannot view audit logs | OPERATOR calls `/api/audit/logs` | `403 Forbidden` |
| SEC-07 | JWT token tampering detected | Modified JWT token | `401 Unauthorized` |
| SEC-08 | No token = no access | Request without Authorization header | `401 Unauthorized` |

---

## 4. DATABASE TESTS

| ID | Test | What it checks | Expected |
|----|------|---------------|----------|
| DB-01 | Flyway migration runs successfully | All tables created | 18 application tables exist |
| DB-02 | Unique constraint on serial_numbers.serial | Insert duplicate serial | Constraint violation error |
| DB-03 | Unique constraint on batch_material_consumption | Insert duplicate (batch, lot) pair | Constraint violation error |
| DB-04 | Foreign key on production_batches.part_id | Insert batch with non-existent part | FK violation error |
| DB-05 | Indexes exist for trace performance | Check idx_bmc_lot, idx_shipment_items_batch | Indexes present |

---

## 5. MANUAL QA TEST CASES (Demo Flow)

### TC-01: Wrong Part Blocked ⭐
```
Precondition: Logged in as Operator, Batch B-2026-003 expects "Door Handle Assembly"

Steps:
1. Go to Scan Station page
2. Type serial "MTH-WH-002-00015" (this is a Wiring Harness, NOT Door Handle)
3. Select batch B-2026-003
4. Click "Scan" or press Enter

Expected:
✅ Screen shows RED BLOCKED animation
✅ Reason: "Part 'Wiring Harness' is not in BOM for batch B-2026-003"
✅ Scan event saved in database with result = BLOCKED
✅ Dashboard "Blocked Today" counter increases by 1
```

### TC-02: Valid Part Accepted
```
Steps:
1. Type serial "MTH-DH-001-00042" (Door Handle Assembly — correct for batch)
2. Select batch B-2026-003
3. Click "Scan"

Expected:
✅ Screen shows GREEN ACCEPTED animation
✅ Message: "Part validated successfully"
✅ Dashboard "Scans Today" counter increases by 1
```

### TC-03: Two-Person Hold Approval ⭐
```
Steps:
1. Login as Quality Engineer (priya / pass123)
2. Go to Hold Management
3. Click "Request Hold"
4. Select lot LOT-STL-2026-005
5. Enter reason: "Failed tensile strength test"
6. Submit → Hold status = REQUESTED
7. Logout
8. Login as Manager (vikram / pass123)
9. Go to Hold Management → Pending Approvals
10. Click "Approve" on the hold
11. Enter notes: "Confirmed. Quarantine immediately."
12. Submit → Hold status = APPROVED

Expected:
✅ Hold created by Priya (step 6)
✅ Approved by Vikram — different person (step 10)
✅ Lot LOT-STL-2026-005 status changed to ON_HOLD
✅ Any future scan using this lot → BLOCKED
```

### TC-04: Same Person Approval Rejected
```
Steps:
1. Login as Quality Engineer (priya)
2. Request hold on any lot
3. Try to approve the same hold (still as priya)

Expected:
✅ Error message: "Requester and approver cannot be the same person"
✅ Hold remains in REQUESTED status
```

### TC-05: Forward Trace ⭐
```
Steps:
1. Login as Quality Engineer or Manager
2. Go to Trace page
3. Select lot LOT-STL-2026-005 from dropdown
4. Click "Trace" button

Expected:
✅ Loading animation shows
✅ Results display:
   - Affected Batches: B-2026-003 (shipped), B-2026-007 (in factory)
   - Affected Shipments: SH-2026-001
   - Affected Customers: Maruti Suzuki India Ltd
   - Affected VINs: MA3FJEB1S00123456, MA3FJEB1S00123457, MA3FJEB1S00123458
   - In-Factory Batches: B-2026-007 (highlighted)
   - Estimates: ~800 affected parts, ~₹3,04,000 loss
✅ Trace time displayed: "Completed in XXms"
✅ TraceRun saved in database
```

### TC-06: Backward Trace
```
Steps:
1. Go to Backward Trace page
2. Enter VIN: MA3FJEB1S00123456
3. Click "Trace"

Expected:
✅ Chain displayed:
   VIN: MA3FJEB1S00123456
   → Customer: Maruti Suzuki India Ltd
   → Serial: MTH-DH-001-00042
   → Batch: B-2026-003
   → Lot: LOT-STL-2026-005
   → Supplier: Tata Steel Ltd
```

---

## 6. PERFORMANCE TESTS

| ID | Test | How to Measure | Target |
|----|------|---------------|--------|
| PF-01 | Forward trace response time | `traceRun.durationMs` from database | Measure and report actual time (don't claim a number) |
| PF-02 | Scan validation response time | Time from API call to response | Should feel instant (<500ms) |
| PF-03 | Dashboard load time | Browser devtools Network tab | All stats loaded within 1 second |

> ⚠️ **Important (from spec)**: "Measure the query time on your own data and do not quote a speed that has not been measured." Always report YOUR measured time, not a claimed number.

---

## How to Run Tests

### Run ALL unit tests:
```bash
cd backend
mvn test
```

### Run specific test class:
```bash
mvn test -Dtest=ScanServiceTest
mvn test -Dtest=TraceServiceTest
mvn test -Dtest=HoldServiceTest
mvn test -Dtest=EstimateServiceTest
```

### Run with coverage report:
```bash
mvn test jacoco:report
# Report at: target/site/jacoco/index.html
```

### Run only integration tests:
```bash
mvn test -Dtest="*IntegrationTest"
```

---

## Test Data Setup

### For Unit Tests (Mocked):
```java
// Common test fixtures
User operator = User.builder().id(1L).username("operator1").role(operatorRole).build();
User supervisor = User.builder().id(2L).username("supervisor1").role(supervisorRole).build();
User qualityEngineer = User.builder().id(3L).username("priya").role(qeRole).build();

Part doorHandle = Part.builder().id(1L).partNumber("MTH-DH-001").name("Door Handle Assembly")
    .costPerPart(new BigDecimal("300")).partsPerVehicle(1).build();

MaterialLot lot5 = MaterialLot.builder().id(5L).lotNumber("LOT-STL-2026-005")
    .status("OK").build();

ProductionBatch batch3 = ProductionBatch.builder().id(3L).batchNumber("B-2026-003")
    .part(doorHandle).build();
```

### For Integration Tests:
Uses `V2__seed_demo_data.sql` which pre-loads realistic demo data.

### For Manual Tests:
Login credentials (from seed data):
| Username | Password | Role |
|----------|---------|------|
| admin | admin123 | ADMIN |
| operator1 | pass123 | OPERATOR |
| operator2 | pass123 | OPERATOR |
| supervisor1 | pass123 | SUPERVISOR |
| priya | pass123 | QUALITY_ENGINEER |
| vikram | pass123 | MANAGER |

---

## Test Coverage Targets

| Layer | Target | What's tested |
|-------|--------|--------------|
| **Service Layer** | 90%+ | All business logic, validation rules, calculations |
| **Controller Layer** | 80%+ | Request/response mapping, validation, auth |
| **Repository Layer** | Tested via integration tests | Custom queries only |
| **Security Layer** | 100% role matrix | Every role × every endpoint combination |

---

## Interview Tips for Testing

> **Q: "Aapne testing kaise ki?"**
> 
> "Maine JUnit 5 aur Mockito use kiya hai. Service layer ke unit tests mein database ko mock kiya — sirf business logic test hoti hai. Scan validation mein 4 main scenarios test kiye: wrong part block, duplicate serial reject, lot on hold block, aur valid scan accept. Hold approval mein two-person rule test kiya — same person approve kare toh InvalidApprovalException aata hai. Trace mein verify kiya ki linked records sahi return hote hain. Total 28 unit tests aur 18 integration tests hain."

> **Q: "Trace ka performance kaise measure kiya?"**
> 
> "Har trace run ka time database mein save hota hai — `trace_runs.duration_ms`. Yeh system clock se measure hota hai, claimed nahi hai. Indexes lagaye hain lot_id, batch_id, shipment_id pe for fast JOINs."
