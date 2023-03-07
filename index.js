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
          station[header] = acc.length + 1;
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
          station[header] = Math.abs(
            findOffset(
              parseFloat(curr["Input Freq"]),
              parseFloat(curr["Frequency"])
            )
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
          break;
        case "DtcsPolarity":
          station[header] = "NN";
          break;
        case "RxDtcsCode":
          station[header] = "023";
          break;
        case "Mode":
          station[header] = "FM";
          break;
        case "TStep":
          //Wtf is this
          station[header] = 5;
          break;
        case "Skip":
          station[header] = "";
          break;
        case "Power":
          station[header] = "1.0W";
          break;
        case "Comment":
        case "URCALL":
        case "RPT1CALL":
        case "RPT2CALL":
          station[header] = "";
          break;
        default:
          station[header] = "";
          break;
      }
    });

    acc.push(station);
    return acc;
  }, []);

  return {
    header: headerKeys.map((key) => ({ id: key, title: key })),
    body: body,
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
    return "+";
  } else if (offset < 0) {
    return "-";
  } else {
    return "";
  }
}
