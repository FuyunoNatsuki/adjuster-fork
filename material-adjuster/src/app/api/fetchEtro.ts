"use server";

import { result } from "lodash";
import {
  FoodRawParam,
  JobName,
  RoleName,
  STATUS_IDS,
} from "../constant/equipmentConstant";
import { getCsvData } from "./readCsv";

type GearSubStatus = {
  statusType: StatusType;
  statusValue: number;
  statusValueMax: number;
};
type GearStatusInfo = {
  mainStatus: number;
  subStatusList: GearSubStatus[];
  materialFrame: MaterialType[];
};
type GearItemInfo = {
  itemId: number;
  status: GearStatusInfo;
};
type StatusType = "DET" | "DH" | "CRT" | "SS" | "TEN";
type MaterialType =
  | {
      materialSize: 1;
      materialValue: 36;
    }
  | {
      materialSize: 2;
      materialValue: 12;
    };
type MaterialInfo = {
  statusType: StatusType;
  materialType: MaterialType;
  value: number;
};
type MaterialCombination = MaterialInfo[];

interface RoleGroupObject {
  [key: string]: JobName[];
}

const generateCombinations = (
  arrays: MaterialCombination[],
  index = 0,
  current: MaterialCombination = [],
  result: MaterialCombination[] = []
) => {
  if (index === arrays.length) {
    result.push([...current]);
    return result;
  }

  for (const element of arrays[index]) {
    current[index] = element;
    generateCombinations(arrays, index + 1, current, result);
  }

  return result;
};

export const getCurrentJobMaterialList = async ({
  roleName,
  minItemLevel = 0,
}: {
  roleName: RoleName;
  minItemLevel: number;
}) => {
  const materialResponse = await fetch("https://etro.gg/api/materia/");
  const materialResultJson = await materialResponse.json();

  var currentRoleRefsStatus: number[] = [
    STATUS_IDS.CRT,
    STATUS_IDS.DET,
    STATUS_IDS.DH,
  ];
  if (roleName === "TANK") {
    currentRoleRefsStatus.push(STATUS_IDS.TEN);
  }
  if (["TANK", "Melee DPS", "Physical Ranged DPS"].includes(roleName)) {
    currentRoleRefsStatus.push(STATUS_IDS.SKS);
  }
  if (["HEALER", "Magical Ranged DPS"].includes(roleName)) {
    currentRoleRefsStatus.push(STATUS_IDS.SPS);
  }

  const currentJobMaterialList = materialResultJson
    ?.filter((item: { param: string; "*": string }) => {
      return currentRoleRefsStatus.includes(+item.param);
    })
    .map(
      (item: {
        [key: string]: {
          itemLevel: string;
        };
      }) => {
        var returnObject = {};
        return Object.assign(returnObject, {
          materialArray: Object.values(item)
            .filter((n) => {
              return typeof n === "object";
            })
            .map((n, i) => {
              return Object.assign(n, {
                statusValue: item["tier" + (i + 1) + "Value"],
              });
            })
            .filter((n) => {
              return +n.itemLevel >= minItemLevel;
            }),
        });
      }
    );

  return currentJobMaterialList;
};
const EQUIPMENT_PARSER = {
  Head: "head",
  Shield: "offHand",
  Body: "body",
  Hands: "hands",
  Legs: "legs",
  Feet: "feet",
  Earrings: "ears",
  Necklace: "neck",
  Bracelets: "wrists",
  Ring: "finger",
};
export const getCurrentJobEquipmentList = async (jobName: JobName) => {
  if (!jobName) {
    return [];
  }
  const equipmentResponse = await fetch(
    "https://etro.gg/api/equipment/?" + jobName + "=1&minLevel=100"
  );
  const csvData = await getCsvData(false).then((result) => {
    return result
      .filter((item) => {
        return (
          +item.Level >= 100 &&
          (item.isHQ !== "False" ||
            item.IsAdvancedMeldingPermitted === "False") &&
          item.ClassJob.includes(jobName) &&
          item.isLatest !== "False"
        );
      })
      .map((item) => {
        const params = {
          STR: +item.STR,
          DEX: +item.DEX,
          INT: +item.INT,
          MND: +item.MND,
          VIT: +item.VIT,
          CRT: +item.Crit,
          DET: +item.Det,
          DH: +item.DH,
          SKS: +item.Sks,
          SPS: +item.Sps,
          TEN: +item.Ten,
          PIE: +item.Pie,
        };
        const maxParams = {};
        const paramKeys = [];
        const paramArray = [];
        const maxValue = Math.max(
          +item.Crit,
          +item.Det,
          +item.DH,
          +item.Sks,
          +item.Sps,
          +item.Ten,
          +item.Pie
        );
        Object.keys(params)
          .filter((n) => {
            maxParams["" + STATUS_IDS[n]] = maxValue;
            return +params[n] > 0;
          })
          .forEach((n) => {
            paramKeys.push(STATUS_IDS[n]);
            paramArray.push(params[n]);
          });
        return {
          id: item.Id,
          name: item["Name(JP)"],
          itemLevel: +item.ItemLevel,
          materiaSlotCount: +item.MateriaSlotCount,
          advancedMelding: item.IsAdvancedMeldingPermitted !== "False",
          slotName: item.Category.includes("Arm")
            ? "weapon"
            : EQUIPMENT_PARSER[item.Category],
          param0: paramKeys[0] || null,
          param1: paramKeys[1] || null,
          param2: paramKeys[2] || null,
          param3: paramKeys[3] || null,
          param4: paramKeys[4] || null,
          param5: paramKeys[5] || null,
          param0Value: paramArray[0] || 0,
          param1Value: paramArray[1] || 0,
          param2Value: paramArray[2] || 0,
          param3Value: paramArray[3] || 0,
          param4Value: paramArray[4] || 0,
          param5Value: paramArray[5] || 0,
          maxParams: maxParams,
        };
      });
  });
  const equipmentResultJson = await equipmentResponse.json();
  return csvData;
};

export type TribeData = {
  name: string;
  status: {
    STR: number;
    DEX: number;
    VIT: number;
    INT: number;
    MND: number;
  };
};

export const fetchFoodList = async () => {
  const foodResponse = await fetch(
    "https://etro.gg/api/food/?minItemLevel=660"
  );
  const foodResultJson: FoodRawParam[] = await foodResponse.json();
  const csvData = await getCsvData(true).then((result) => {
    return result
      .filter((item) => {
        return item.VIT >= 177;
      })
      .map((item) => {
        const params = {
          VIT: +item.VIT,
          CRT: +item.CRT,
          DET: +item.DET,
          DH: +item.DH,
          SKS: +item.SKS,
          SPS: +item.SPS,
          TEN: +item.TEN,
          PIE: +item.PIE,
        };
        const paramArray = [];
        const paramKeys = [];
        Object.keys(params)
          .filter((n) => {
            return +params[n] > 0;
          })
          .forEach((n) => {
            paramKeys.push(STATUS_IDS[n]);
            paramArray.push(params[n]);
          });
        return {
          name: item["name(JP)"],
          param0: paramKeys[0] || null,
          param1: paramKeys[1] || null,
          param2: paramKeys[2] || null,
          maxHQ0: paramArray[0] || 0,
          maxHQ1: paramArray[1] || 0,
          maxHQ2: paramArray[2] || 0,
          valueHQ0: 10,
          valueHQ1: 10,
          valueHQ2: 10,
        };
      });
  });
  return foodResultJson.concat(csvData);
};
