# PT Calculator — verified-core dataset

This build intentionally enables only refrigerants whose CSV values were transcribed from one authoritative manufacturer P/T table and structurally validated.

Enabled in this release:
- R-22
- R-134a
- R-404A (bubble + dew)
- R-407A (bubble + dew)
- R-407C (bubble + dew)
- R-407F (bubble + dew)
- R-448A (bubble + dew)
- R-449A (bubble + dew)
- R-507A

Data range: -50°F through 150°F in 2°F increments.

Primary source:
Copeland, *Copeland scroll ZX condensing unit*, September 2024,
Pressure temperature chart at sea level, pp. 42–43.

The published chart is in bar gauge. CSV pressures are converted to PSIG with
1 bar = 14.503773773 psi.

Run `python validate_data.py` before publishing changes to the data.

Important:
No dataset can honestly be guaranteed “100% error-proof.” This project therefore
uses a fail-closed policy: a refrigerant stays disabled until its source has been
identified, transcribed, and validated. Do not fill pending CSV files from memory,
screenshots, or unverified web calculators.
