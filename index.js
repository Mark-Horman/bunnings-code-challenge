const dataForgeFS = require('data-forge-fs');
const {DataFrame} = require("data-forge");

//Initial read of Company A & B Catalog and Barcodes
const catalogA = dataForgeFS.readFileSync('input/catalogA.csv').parseCSV();
const barcodesA = dataForgeFS.readFileSync('input/barcodesA.csv').parseCSV();
const catalogB = dataForgeFS.readFileSync('input/catalogB.csv').parseCSV();
const barcodesB = dataForgeFS.readFileSync('input/barcodesB.csv').parseCSV();

//Join Catalog and Barcodes for Company A into single file
const productsCompanyA = catalogA.join(
    barcodesA,
    catalog => catalog.SKU,
    barcode => barcode.SKU,
    (catalog, barcode) => {
        return {
            sku: catalog.SKU,
            description: catalog.Description,
            barcode: barcode.Barcode,
            supplierId: barcode.SupplierID,
            companyID: "A"
        };
    }
);

//Join Catalog and Barcodes for Company B into single file
const productsCompanyB = catalogB.join(
    barcodesB,
    catalog => catalog.SKU,
    barcode => barcode.SKU,
    (catalog, barcode) => {
        return {
            sku: catalog.SKU,
            description: catalog.Description,
            barcode: barcode.Barcode,
            supplierId: barcode.SupplierID,
            companyID: "B"
        };
    }
);

//Concatenate Products from Companies A and B
const concatProducts = DataFrame.concat([productsCompanyA, productsCompanyB]);

// Remove duplicate rows by Barcode. Will return only a single row per Barcode.
const distinctBarcode = concatProducts.distinct(barcode => barcode.barcode);

// Remove duplicate rows by SKU. Will return only a single row per SKU.
const distinctSKU = distinctBarcode.distinct(sku => sku.sku);

//Select relevant catalog columns
function transformRow (inputRow) {
    const outputRow = {
        SKU: inputRow.sku,
        Description: inputRow.description,
        Source: inputRow.companyID
    };

    return outputRow;
}

const mergedCatalog = distinctSKU.select(row => transformRow(row));
//console.log(mergedCatalog.toString());

//export result back to output folder
mergedCatalog.asCSV().writeFileSync('output/result_output.csv');
