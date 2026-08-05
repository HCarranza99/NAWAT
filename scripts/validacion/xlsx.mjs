/**
 * Escritor mínimo de .xlsx (OOXML) sin dependencias.
 *
 * Un .xlsx es un ZIP con XML dentro. Aquí se generan las partes y se devuelve
 * la lista de entradas; el empaquetado en ZIP lo hace PowerShell (.NET
 * ZipArchive) porque Node no trae compresión de archivos en la librería
 * estándar. Se usan cadenas EN LÍNEA (t="inlineStr") para no tener que
 * mantener una tabla de cadenas compartidas.
 *
 * Estilos disponibles (índice de cellXfs):
 *   0 normal · 1 encabezado · 2 celda con borde · 3 celda editable (amarilla)
 *   4 título · 5 nota en cursiva · 6 celda con borde sin ajuste de texto
 */

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    // Excel rechaza los caracteres de control salvo tab/LF/CR
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '')

const colName = (n) => {
  let s = ''
  while (n > 0) {
    const r = (n - 1) % 26
    s = String.fromCharCode(65 + r) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

export const S = { NORMAL: 0, HEAD: 1, CELL: 2, INPUT: 3, TITLE: 4, NOTE: 5, TIGHT: 6 }

/** Celda: string | number | { v, s } */
function cellXml(ref, cell) {
  if (cell === null || cell === undefined || cell === '') return ''
  const obj = typeof cell === 'object' && !Array.isArray(cell) ? cell : { v: cell }
  const style = obj.s ?? S.NORMAL
  // Celda vacía CON estilo: se emite igual para conservar el relleno (así se ve
  // dónde hay que escribir), pero sin nodo de valor.
  if (obj.v === '' || obj.v === null || obj.v === undefined) return `<c r="${ref}" s="${style}"/>`
  if (typeof obj.v === 'number' && Number.isFinite(obj.v)) {
    return `<c r="${ref}" s="${style}"><v>${obj.v}</v></c>`
  }
  return `<c r="${ref}" s="${style}" t="inlineStr"><is><t xml:space="preserve">${esc(obj.v)}</t></is></c>`
}

/**
 * @param {object} sheet
 * @param {string} sheet.name
 * @param {Array<Array>} sheet.rows       filas (arrays de celdas)
 * @param {number[]} [sheet.widths]       ancho por columna
 * @param {number} [sheet.freeze]         nº de filas congeladas
 * @param {string} [sheet.autofilter]     rango, p. ej. "A3:K40"
 * @param {Array} [sheet.validations]     [{ ref, values: [] }]
 * @param {number[]} [sheet.tallRows]     filas (1-index) con alto doble
 */
function sheetXml(sheet) {
  const { rows, widths = [], freeze = 0, autofilter, validations = [], tallRows = [] } = sheet
  const cols = widths.length
    ? `<cols>${widths.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('')}</cols>`
    : ''

  const body = rows
    .map((row, r) => {
      const cells = row.map((c, i) => cellXml(`${colName(i + 1)}${r + 1}`, c)).join('')
      const ht = tallRows.includes(r + 1) ? ' ht="30" customHeight="1"' : ''
      return `<row r="${r + 1}"${ht}>${cells}</row>`
    })
    .join('')

  const pane = freeze
    ? `<pane ySplit="${freeze}" topLeftCell="A${freeze + 1}" activePane="bottomLeft" state="frozen"/><selection pane="bottomLeft"/>`
    : ''

  const dv = validations.length
    ? `<dataValidations count="${validations.length}">${validations
        .map(
          (v) =>
            `<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="${v.ref}"><formula1>"${v.values.join(',')}"</formula1></dataValidation>`,
        )
        .join('')}</dataValidations>`
    : ''

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" showGridLines="0">${pane}</sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/>${cols}<sheetData>${body}</sheetData>${autofilter ? `<autoFilter ref="${autofilter}"/>` : ''}${dv}<pageMargins left="0.5" right="0.5" top="0.6" bottom="0.6" header="0.3" footer="0.3"/></worksheet>`
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
<fonts count="4">
<font><sz val="11"/><name val="Calibri"/></font>
<font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font>
<font><b/><sz val="15"/><color rgb="FF1B4332"/><name val="Calibri"/></font>
<font><i/><sz val="10"/><color rgb="FF555555"/><name val="Calibri"/></font>
</fonts>
<fills count="4">
<fill><patternFill patternType="none"/></fill>
<fill><patternFill patternType="gray125"/></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FF2D6A4F"/><bgColor indexed="64"/></patternFill></fill>
<fill><patternFill patternType="solid"><fgColor rgb="FFFFF7CC"/><bgColor indexed="64"/></patternFill></fill>
</fills>
<borders count="2">
<border><left/><right/><top/><bottom/><diagonal/></border>
<border><left style="thin"><color rgb="FFD9D9D9"/></left><right style="thin"><color rgb="FFD9D9D9"/></right><top style="thin"><color rgb="FFD9D9D9"/></top><bottom style="thin"><color rgb="FFD9D9D9"/></bottom><diagonal/></border>
</borders>
<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
<cellXfs count="7">
<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="1" fillId="2" borderId="1" xfId="0" applyFont="1" applyFill="1" applyBorder="1" applyAlignment="1"><alignment horizontal="left" vertical="center" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="3" borderId="1" xfId="0" applyFill="1" applyBorder="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="center"/></xf>
<xf numFmtId="0" fontId="3" fillId="0" borderId="0" xfId="0" applyFont="1" applyAlignment="1"><alignment vertical="top" wrapText="1"/></xf>
<xf numFmtId="0" fontId="0" fillId="0" borderId="1" xfId="0" applyBorder="1" applyAlignment="1"><alignment vertical="top"/></xf>
</cellXfs>
</styleSheet>`

/** @returns {Array<{name: string, content: string}>} entradas del ZIP */
export function buildXlsx(sheets) {
  const files = []

  files.push({
    name: '[Content_Types].xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets
      .map(
        (_, i) =>
          `<Override PartName="/xl/worksheets/sheet${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
      )
      .join('')}<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`,
  })

  files.push({
    name: '_rels/.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
  })

  files.push({
    name: 'xl/workbook.xml',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets
      .map((s, i) => `<sheet name="${esc(s.name)}" sheetId="${i + 1}" r:id="rId${i + 1}"/>`)
      .join('')}</sheets></workbook>`,
  })

  files.push({
    name: 'xl/_rels/workbook.xml.rels',
    content: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets
      .map(
        (_, i) =>
          `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${i + 1}.xml"/>`,
      )
      .join('')}<Relationship Id="rId${sheets.length + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`,
  })

  files.push({ name: 'xl/styles.xml', content: STYLES })
  sheets.forEach((s, i) => files.push({ name: `xl/worksheets/sheet${i + 1}.xml`, content: sheetXml(s) }))

  return files
}
