# Kaggle datasets

These files were downloaded from the public Kaggle dataset pages on
2026-10-28 and staged for the planned Java/Spring Boot import workflow.

| Local file | Kaggle source | Data rows | Key columns |
|---|---|---:|---|
| `parts_mfg.csv` | `gabrielsantello/parts-manufacturing-industry-dataset` | 500 | `Item_No`, `Length`, `Width`, `Height`, `Operator` |
| `vehicle_sales.csv` | `syedanwarafridi/vehicle-sales-data` | 558,837 | `year`, `make`, `model`, `vin`, `sellingprice`, `saledate` |
| `defects.csv` | `rabieelkharoua/predicting-manufacturing-defects-dataset` | 3,240 | `ProductionVolume`, `DefectRate`, `DefectStatus`, `ProductionCost` |

## Status

The CSV files are available locally and have been checked for readable headers
and row counts. They are not imported into PostgreSQL yet. The current
Flyway seed data remains the controlled TraceIntel demo dataset.

The future import workflow must validate each source independently and must
not overwrite the controlled demo seed.

## Source links

- https://www.kaggle.com/datasets/gabrielsantello/parts-manufacturing-industry-dataset
- https://www.kaggle.com/datasets/syedanwarafridi/vehicle-sales-data
- https://www.kaggle.com/datasets/rabieelkharoua/predicting-manufacturing-defects-dataset