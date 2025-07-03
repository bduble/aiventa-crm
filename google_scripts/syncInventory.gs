const API_BASE = 'https://<your-deployment>/api/inventory';
const API_KEY  = PropertiesService.getScriptProperties().getProperty('AIVENTA_KEY');
const SHEET_NAME = 'Inventory';

function syncInventory() {
  const ss = SpreadsheetApp.getActive();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();

  data.forEach((row, i) => {
    const payload = {};
    headers.forEach((h, j) => payload[h] = row[j]);
    const url = payload.id ? `${API_BASE}/${payload.id}` : API_BASE;
    const options = {
      method      : payload.id ? 'put' : 'post',
      contentType : 'application/json',
      headers     : { 'Authorization': `Bearer ${API_KEY}` },
      payload     : JSON.stringify(payload),
      muteHttpExceptions: true,
    };

    const resp = UrlFetchApp.fetch(url, options);
    if (!payload.id && resp.getResponseCode() === 201) {
      const body = JSON.parse(resp.getContentText());
      sheet.getRange(i + 2, headers.indexOf('id') + 1).setValue(body.id);
    }
  });
}
