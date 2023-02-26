
const path = require('path')
const fsPromise = require('fs/promises');
const csvWriter = require('csv-writer');



readData()
    .then(getResults)
    .then(parseData)
    .then(createCSV)



function readData() {

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
    console.log(parsedData.header[0])
    const writer = csvWriter.createObjectCsvWriter({
        path: path.resolve(__dirname, 'oregon-repeaters.csv'),
        header: parsedData.header,
    });

    return writer.writeRecords(parsedData.body).then(() => console.log("Done"))

}



// const countries = [
//     { name: 'Cameroon', capital: 'Yaounde', countryCode: 'CM', phoneIndicator: 237 },
//     { name: 'France', capital: 'Paris', countryCode: 'FR', phoneIndicator: 33 },
//     { name: 'United States', capital: 'Washington, D.C.', countryCode: 'US', phoneIndicator: 1 },
//     { name: 'India', capital: 'New Delhi', countryCode: 'IN', phoneIndicator: 91 },
//     { name: 'Brazil', capital: 'Brasília', countryCode: 'BR', phoneIndicator: 55 },
//     { name: 'Japan', capital: 'Tokyo', countryCode: 'JP', phoneIndicator: 81 },
//     { name: 'Australia', capital: 'Canberra', countryCode: 'AUS', phoneIndicator: 61 },
//     { name: 'Nigeria', capital: 'Abuja', countryCode: 'NG', phoneIndicator: 234 },
//     { name: 'Germany', capital: 'Berlin', countryCode: 'DE', phoneIndicator: 49 },
// ];



// writer.writeRecords(countries).then(() => {
//     console.log('Done!');
// });