# PT Calculator

A mobile-friendly pressure-temperature calculator for HVAC/R refrigerants.

PT Calculator converts saturation temperature to pressure and pressure to
saturation temperature using local refrigerant P/T datasets. The application
runs entirely in the browser and does not require an external calculation
service.

## Version

**Version 1.0.0**

## Features

- 34 HVAC/R refrigerants
- Temperature (°F) to pressure (PSIG) conversion
- Pressure (PSIG) to temperature (°F) conversion
- Linear interpolation between published P/T data points
- Bubble and dew calculations for applicable refrigerant blends
- Local CSV-based refrigerant database
- Source and validation information stored with the dataset
- Mobile-friendly responsive interface
- No external calculation engine required

## Refrigerants

Version 1.0.0 includes:

- R-12
- R-22
- R-23
- R-32
- R-123
- R-125
- R-134a
- R-143a
- R-152a
- R-170 (Ethane)
- R-227ea
- R-236fa
- R-245fa
- R-290 (Propane)
- R-404A
- R-407A
- R-407C
- R-407F
- R-410A
- R-422D
- R-448A
- R-449A
- R-452A
- R-454B
- R-454C
- R-502
- R-507A
- R-513A
- R-600a (Isobutane)
- R-717 (Ammonia)
- R-744 (CO₂)
- R-1233zd(E)
- R-1234yf
- R-1234ze(E)

## Bubble and Dew Points

Refrigerant blends with temperature glide include separate bubble and dew
data where applicable.

- **Dew point** is normally used when calculating superheat.
- **Bubble point** is normally used when calculating subcooling.

## Data

Refrigerant data is stored locally in individual CSV files inside the
`data` directory.

The application uses linear interpolation between adjacent P/T data points
when the requested value falls between values in the source table.

Pressure values used by the calculator are **PSIG**.

Some refrigerants have a smaller valid saturation range because their
critical temperature occurs below the application's normal upper
temperature range. The calculator does not intentionally extrapolate
saturation data beyond those limits.

## Data Sources

The Version 1.0.0 dataset was assembled from source-traceable refrigerant
property information, including manufacturer pressure-temperature tables
and thermodynamic property data based on NIST REFPROP.

Sources used in the dataset include:

- Copeland pressure-temperature data
- Arkema Forane refrigerant pressure-temperature data
- Danfoss refrigerant property data
- Honeywell Genetron refrigerant data
- Chemours Opteon refrigerant data
- NIST REFPROP-based property data

Detailed source and provenance information is stored in:

`data/sources.json`

## Validation

The refrigerant datasets are checked for structural problems such as:

- Missing values
- Incorrect temperature ordering
- Non-monotonic saturation pressure data
- Expected temperature ranges
- Selected known P/T reference points

The project includes:

`validate_data.py`

for dataset validation.

## Project Structure

    pt-calculator/
    ├── assets/
    │   ├── pressure-gauge.svg
    │   ├── refrigerant.svg
    │   ├── saturation.svg
    │   ├── snowflake.svg
    │   └── thermometer.svg
    │
    ├── data/
    │   ├── refrigerants.json
    │   ├── sources.json
    │   └── refrigerant CSV files
    │
    ├── app.js
    ├── index.html
    ├── README.md
    ├── start.bat
    ├── styles.css
    └── validate_data.py

## Running Locally

On Windows, run:

`start.bat`

Then open:

`http://localhost:8000`

The local Python server is only needed for local development and testing.
The published application can run directly through GitHub Pages.

## Important Data Note

Pressure-temperature data is safety-relevant HVAC/R reference information.
Although the datasets are source-traceable and validation checks are used,
no software dataset should be assumed to be completely error-free.

For service work, charging, commissioning, or other critical decisions,
verify values against current equipment and refrigerant manufacturer
documentation when appropriate.

## License

PT Calculator is an educational and HVAC/R reference project developed by
bcshinstudio.