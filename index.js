const path = require("path");
const fsPromise = require("fs/promises");
const csvWriter = require("csv-writer");

readData().then(getResults).then(parseData).then(createCSV);

function readData() {
  // https://www.repeaterbook.com/api/export.php?country=United%20States&state=Oregon

  return fsPromise
    .readFile(path.resolve(__dirname, "data.json"))
    .then((data) => JSON.parse(data));
}

function getResults(data) {
  return data.results;
}

function parseData(data) {
  const headerKeys = [
    "sLocation",
    "Name",
    "Frequency",
    "Duplex",
    "Offset",
    "Tone",
    "rToneFreq",
    "cToneFreq",
    "DtcsCode",
    "DtcsPolarity",
    "RxDtcsCode",
    "CrossMode",
    "Mode",
    "TStep",
    "Skip",
    "Power",
    "Comment",
    "URCALL",
    "RPT1CALL",
    "RPT2CALL",
    "DVCODE",
  ];

  const body = data.reduce((acc, curr) => {
    const station = {};
    headerKeys.forEach((header, index) => {
      switch (header) {
        case "sLocation":
          station[header] = index + 1;
          break;
        case "Name":
          station[header] = curr["Callsign"];
          break;
        case "Frequency":
          station[header] = curr["Frequency"];
          break;
        case "Duplex":
          station[header] = findDuplex(
            findOffset(
              parseFloat(curr["Input Freq"]),
              parseFloat(curr["Frequency"])
            )
          );
          break;
        case "Offset":
          station[header] = findOffset(
            parseFloat(curr["Input Freq"]),
            parseFloat(curr["Frequency"])
          );
          break;
        case "Tone":
          if (curr["PL"].includes("D")) {
            station[header] = "DCS";
            break;
          }

          if (curr["PL"] && curr["TSQ"]) {
            station[header] = "TSQL";
            break;
          }

          if (curr["PL"] && !curr["TSQ"]) {
            station[header] = "Tone";
            break;
          }

          station[header] = "";
          break;
        case "rToneFreq":
          station[header] = curr["PL"] || 127.3;
          break;
        case "cToneFreq":
          station[header] = curr["TSQ"] || 127.3;
          break;
        case "DtcsCode":
          if (curr["PL"].includes("D")) {
            station[header] = curr["PL"];
          } else {
            station[header] = "023";
          }
        default:
          break;
      }
    });
  }, []);

  return {
    header: Object.keys(data[0]).map((key) => ({ id: key, title: key })),
    body: data,
  };
}

function createCSV(parsedData) {
  const writer = csvWriter.createObjectCsvWriter({
    path: path.resolve(__dirname, "oregon-repeaters.csv"),
    header: parsedData.header,
  });

  return writer.writeRecords(parsedData.body).then(() => console.log("Done"));
}

function findOffset(inputFrequency, frequency) {
  return inputFrequency - frequency;
}

function findDuplex(offset) {
  if (offset > 0) {
    station[header] = "+";
  } else if (offset < 0) {
    station[header] = "-";
  } else {
    station[header] = "";
  }
}
