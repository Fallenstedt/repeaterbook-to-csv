const path = require('path')
const fsPromise = require('fs/promises');
const csvWriter = require('csv-writer');

readData()
    .then(getResults)
    .then(parseData)
    .then(createCSV)

function readData() {
    // https://www.repeaterbook.com/api/export.php?country=United%20States&state=Oregon

    return fsPromise.readFile(path.resolve(__dirname, "data.json"))
        .then(data => JSON.parse(data))
}

function getResults(data) {
    return data.results
}

function parseData(data) {
    return {
        header: Object.keys(data[0]).map(key => ({ id: key, title: key })),
        body: data
    }
}


function createCSV(parsedData) {
    const writer = csvWriter.createObjectCsvWriter({
        path: path.resolve(__dirname, 'oregon-repeaters.csv'),
        header: parsedData.header,
    });

    return writer.writeRecords(parsedData.body).then(() => console.log("Done"))

}
