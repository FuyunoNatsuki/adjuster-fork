"use server";
import fs from "fs";
import path from "path";
import { parse } from "csv-parse";

export const getCsvData = async (isFood: boolean) => {
  const csvName = isFood ? "extendFood.csv" : "extendEquipment.csv";
  const csvFilePath = path.join(process.cwd(), "public", "csv", csvName);
  var resultData: { id: string; name: string }[] = [];
  return new Promise<{ id: string; name: string }[]>((resolve) => {
    fs.readFile(csvFilePath, "utf-8", async (err, csvData) => {
      if (err) {
        return;
      }

      parse(
        csvData,
        {
          skip_empty_lines: true,
          delimiter: ",",
          columns: true,
        },
        (err, records: { id: string; name: string }[]) => {
          resultData = records;
          resolve(resultData);
        }
      );
    });
  });
};
