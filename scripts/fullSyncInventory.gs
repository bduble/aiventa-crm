// fullSyncInventory.gs

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SUPABASE_REST  = 'https://ckdwsvviiuhyqzroswfe.supabase.co/rest/v1/inventory';
const SUPABASE_KEY   = PropertiesService.getScriptProperties().getProperty('AIVENTA_KEY');
const SHEET_NAME     = 'Sheet1';
const STATUS_COL     = 'lastSync';

// These Supabase columns expect numeric values
const INTEGER_FIELDS = [
  'year',
  'msrp',
  'mileage',
  'cylinders',
  'displacement',
  'sellingprice'
];

// ─── HEADER → COLUMN MAPPING ───────────────────────────────────────────────
// Only map sheet headers that correspond to real Supabase columns.
const HEADER_TO_COLUMN = {
  'drive_type':            'drive_type',
  'transmission':          'transmission',
  'vin':                   'vin',
  'stocknumber':           'stocknumber',
  'year':                  'year',
  'make':                  'make',
  'model':                 'model',
  'trim':                  'trim',
  'exterior_color':        'exterior_color',
  'interior_color':        'interior_color',
  'certified':             'certified',
  'msrp':                  'msrp',
  'sellingprice':          'sellingprice',
  'mileage':               'mileage',
  'engine':                'engine',
  'cylinders':             'cylinders',
  'displacement':          'displacement',
  'type':                  'type',
  'descriptions':          'descriptions',
  'dateadded':             'date_added',
  'version_mod.date':      'version_mod_date',
  'videoplayerurl':        'videoplayerurl',
  'link':                  'link',
  'image_link':            'image_link',
  'additional_image_link': 'additional_image_link',
  'vehicle_option':        'vehicle_option',
  'dealership_name':       'dealership_name',
  'dealership_address':    'dealership_address'
};

const NORMALIZED = {};
for (const [hdr, col] of Object.entries(HEADER_TO_COLUMN)) {
  NORMALIZED[hdr] = col;
}

function fullSyncInventory() {
  if (!SUPABASE_KEY) throw new Error('Missing Supabase API key (AIVENTA_KEY)');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) throw new Error(`Sheet "${SHEET_NAME}" not found`);

  const lastRow = sh.getLastRow();
  const lastCol = sh.getLastColumn();

  // Read all rows (header + data)
  const all = sh.getRange(1, 1, lastRow, lastCol).getValues();
  const headers = all.shift().map(h => String(h).trim().toLowerCase());

  // Ensure status column exists
  let statusIdx = headers.indexOf(STATUS_COL.toLowerCase());
  if (statusIdx < 0) {
    sh.insertColumnAfter(lastCol);
    statusIdx = lastCol;
    sh.getRange(1, statusIdx + 1).setValue(STATUS_COL);
    headers.push(STATUS_COL.toLowerCase());
  }

  // Find VIN column
  const vinIdx = headers.indexOf('vin');
  if (vinIdx < 0) throw new Error(`"vin" header not found`);

  // Build payloads only for rows with a VIN
  const payloads   = [];
  const rowNumbers = [];
  all.forEach((row, i) => {
    const rawVin = row[vinIdx];
    if (!rawVin) return;

    // Map row into a raw object
    const raw = {};
    headers.forEach((h, j) => raw[h] = row[j]);

    // Normalize fields according to HEADER_TO_COLUMN
    const obj = {};
    for (const [norm, col] of Object.entries(NORMALIZED)) {
      let val = raw[norm];
      if (val !== null && val !== '') {
        if (INTEGER_FIELDS.includes(col)) {
          val = Math.round(parseFloat(String(val).replace(/[^0-9.-]/g, '')));
          if (isNaN(val)) val = null;
        }
      } else {
        val = null;
      }
      obj[col] = val;
    }

    payloads.push(obj);
    rowNumbers.push(i + 2);
  });

  if (payloads.length === 0) return;  // nothing to sync

  // Bulk upsert: merge duplicates on primary key (vin)
  const res = UrlFetchApp.fetch(SUPABASE_REST, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=representation,resolution=merge-duplicates'
    },
    payload: JSON.stringify(payloads),
    muteHttpExceptions: true
  });

  const code = res.getResponseCode();
  if (code < 200 || code >= 300) {
    const errorDetails = res.getContentText();
    console.error(`Error during API request. Code: ${code}, Details: ${errorDetails}`);
    throw new Error(`API request failed with code ${code}: ${errorDetails}`);
  }

  const ts = new Date().toISOString();
  // Stamp each successfully processed row
  rowNumbers.forEach(r => {
    sh.getRange(r, statusIdx + 1).setValue(ts);
  });
}
