import { parse, stringify, transform } from "csv";
import * as fs from "node:fs";

const parser = parse({
  bom: true,
  columns: true,
  encoding: "utf8",
  delimiter: ",",
  relaxQuotes: true,
});

const readStream = fs.createReadStream("./input/Childrens Play Area.csv");
const writeStream = fs.createWriteStream("./output/Test addresses.csv");

const transformer = transform({ parallel: 100 }, (record) => {
  // fetch(
  //   `https://maps.googleapis.com/maps/api/place/details/json?place_id=${record["Place Id"]}&key=${process.env.GOOGLE_MAPS_API_KEY}`
  // )
  //   .then((response) => response.json())
  //   .then((json) => {
  //     const place = json.result;
  //     console.log(json);
  //     const location = {
  //       subdivisions: [
  //         {
  //           code: "England",
  //           name: "England",
  //           type: "ADMINISTRATIVE_AREA_LEVEL_1",
  //         },
  //         {
  //           code: "East Riding of Yorkshire",
  //           name: "East Riding of Yorkshire",
  //           type: "ADMINISTRATIVE_AREA_LEVEL_2",
  //         },
  //         { code: "GB", name: "United Kingdom", type: "COUNTRY" },
  //       ],
  //       city: "Driffield",
  //       location: {
  //         latitude: place.geometry.location.lat,
  //         longitude: place.geometry.location.lng,
  //       },
  //       countryFullname: "United Kingdom",
  //       streetAddress: {
  //         number: "",
  //         name: "Northfield Road",
  //         apt: "",
  //         formattedAddressLine: "Northfield Road",
  //       },
  //       formatted: "Northfield Rd, Driffield YO25 5YL, UK",
  //       country: "GB",
  //       postalCode: "YO25 5YL",
  //     };

  //     const outputRecord = {
  //       Name: record.Name,
  //       Address: {
  //         location,
  //         formatted: place.formatted_address,
  //       },
  //     };
  //     callback(null, outputRecord);
  //   });
  return {
    Name: record.Name,
    Address: {
      subdivisions: [
        {
          code: "England",
          name: "England",
          type: "ADMINISTRATIVE_AREA_LEVEL_1",
        },
        {
          code: "East Riding of Yorkshire",
          name: "East Riding of Yorkshire",
          type: "ADMINISTRATIVE_AREA_LEVEL_2",
        },
        { code: "GB", name: "United Kingdom", type: "COUNTRY" },
      ],
      city: "Driffield",
      location: {
        latitude: Number(record.Latitude),
        longitude: Number(record.Longitude),
      },
      countryFullname: "United Kingdom",
      streetAddress: {
        number: "",
        name: "Northfield Road",
        apt: "",
        formattedAddressLine: "Northfield Road",
      },
      formatted: record.Fulladdress,
      country: "GB",
      postalCode: "YO25 5YL",
    },
  };
});

readStream
  .pipe(parser)
  .pipe(transformer)
  .pipe(
    stringify({
      header: true,
    })
  )
  .pipe(writeStream);
