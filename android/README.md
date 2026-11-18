# HVAC PT Companion — remove adjacent ± buttons

This is a focused UI correction to the previous minus-fix package. Both temperature and pressure fields once again have no adjacent ± button. The signed-decimal parsing remains in place, and the HTML still uses `inputmode="decimal"`.

Replace only these files in `C:\Users\baech\Projects\HVACPTCompanion\app\src\main\assets`:
- index.html
- app.js
- styles.css

Close the app before copying, back up the original files, then choose Build > Assemble Project and Run. Test the phone's minus key on your Samsung Galaxy, not just the emulator. **This change removes the extra buttons, but does NOT guarantee Samsung Keyboard will show a minus key.** The keyboard layout is controlled by the installed keyboard and Android version. If the Samsung keyboard still omits minus, we should test keyboard-specific input hints or an optional in-keyboard solution rather than adding buttons beside the input.
