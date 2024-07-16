"use server";

import {
  FoodRawParam,
  JobName,
  RoleName,
  STATUS_IDS,
} from "../constant/equipmentConstant";

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

export const getCurrentJobEquipmentList = async (jobName: JobName) => {
  if (!jobName) {
    return [];
  }
  const equipmentResponse = await fetch(
    "https://etro.gg/api/equipment/?" + jobName + "=1&minLevel=90"
  );
  const equipmentResultJson = await equipmentResponse.json();
  return equipmentResultJson;
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
  return foodResultJson.sort((a, b) => {
    return b.itemLevel - a.itemLevel;
  });
};
