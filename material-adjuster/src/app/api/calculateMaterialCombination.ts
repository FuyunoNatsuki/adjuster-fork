import _ from "lodash";
import {
  EquipmentRawParam,
  JobName,
  STATUS_IDS,
  getEquipmentParams,
  FoodRawParam,
  getFoodParam,
} from "../constant/equipmentConstant";
import { getExpectedDamageValue, getLevelSub } from "./calculateStatusValue";

// 装備のサブステータス情報
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
export type GearItemInfo = {
  itemId: number;
  status: GearStatusInfo;
  slotNum: number;
  name: string;
  canAdvancedmelding: boolean;
};
type StatusType = "DET" | "DH" | "CRT" | "SKS" | "SPS" | "TEN";
type MaterialType =
  | { materialSize: 1; materialValue: 54 }
  | { materialSize: 2; materialValue: 18 };
const COMMON_SUB_STATUS: StatusType[] = ["CRT", "DH", "DET"];
const TANK_SUB_STATUS: StatusType[] = COMMON_SUB_STATUS.concat("TEN");

type StatusCombination = StatusType[];
type GearCombinationListArray = GearCombinationList;
const generateCombinations = (
  arrays: StatusCombination[]
): StatusCombination[] => {
  const result: StatusCombination[] = [];
  const stack: { index: number; current: StatusCombination }[] = [];

  stack.push({ index: 0, current: [] });

  while (stack.length > 0) {
    const { index, current } = stack.pop()!;

    if (index === arrays.length) {
      result.push([...current]);
    } else {
      for (const element of arrays[index]) {
        stack.push({ index: index + 1, current: [...current, element] });
      }
    }
  }

  return result;
};

const generateGearCombinations = (
  stackedGearList: GearCombinationList[],
  currentGearList: GearCombinationList,
  isPhysical: boolean
) => {
  var resultArray: GearCombinationList[] = [];
  var cachedStatusCombination: {
    CRT: number;
    DET: number;
    DH: number;
    TEN: number;
    SKS?: number;
    SPS?: number;
  }[] = [];
  var duplicatedCombination: {
    CRT: number;
    DET: number;
    DH: number;
    TEN: number;
    SKS?: number;
    SPS?: number;
  }[] = [];
  const speedStatus = isPhysical ? "SKS" : "SPS";
  const defaultStatus = isPhysical
    ? {
        CRT: 0,
        DET: 0,
        DH: 0,
        TEN: 0,
        SKS: 0,
      }
    : {
        CRT: 0,
        DET: 0,
        DH: 0,
        TEN: 0,
        SPS: 0,
      };

  for (let i = 0; i < stackedGearList.length; i++) {
    var stackedStatusSum = stackedGearList[i].reduce((acc, item) => {
      acc.CRT += item.gearStatus.CRT.value || 0;
      acc.DET += item.gearStatus.DET.value || 0;
      acc.DH += item.gearStatus.DH.value || 0;
      acc.TEN += item.gearStatus.TEN.value || 0;
      acc[speedStatus] += item.gearStatus[speedStatus].value || 0;
      return acc;
    }, Object.assign({}, defaultStatus));
    for (let j = 0; j < currentGearList.length; j++) {
      var currentStatusSum = isPhysical
        ? {
            CRT: stackedStatusSum.CRT + currentGearList[j].gearStatus.CRT.value,
            DET: stackedStatusSum.DET + currentGearList[j].gearStatus.DET.value,
            DH: stackedStatusSum.DH + currentGearList[j].gearStatus.DH.value,
            TEN: stackedStatusSum.TEN + currentGearList[j].gearStatus.TEN.value,
            SKS: stackedStatusSum.SKS + currentGearList[j].gearStatus.SKS.value,
          }
        : {
            CRT: stackedStatusSum.CRT + currentGearList[j].gearStatus.CRT.value,
            DET: stackedStatusSum.DET + currentGearList[j].gearStatus.DET.value,
            DH: stackedStatusSum.DH + currentGearList[j].gearStatus.DH.value,
            TEN: stackedStatusSum.TEN + currentGearList[j].gearStatus.TEN.value,
            SPS: stackedStatusSum.SPS + currentGearList[j].gearStatus.SPS.value,
          };
      const cachedNumber =
        currentStatusSum.CRT * 10000 +
        currentStatusSum.DET * 1000 +
        currentStatusSum.DH * 100 +
        currentStatusSum.TEN * 10 +
        (currentStatusSum.SKS || currentStatusSum.SPS || 0);
      const isAlreadyExist = cachedStatusCombination.includes(cachedNumber);
      if (!isAlreadyExist) {
        resultArray.push(stackedGearList[i].concat(currentGearList[j]));
        cachedStatusCombination.push(cachedNumber);
      }
    }
  }
  return resultArray;
};

const getGearMaterialCombinationList = ({
  roleName,
  baseGear,
  isPhysical,
}: {
  roleName: "TANK" | "OTHER";
  baseGear: GearItemInfo;
  isPhysical: boolean;
}) => {
  var currentStatus = {};
  Object.keys(STATUS_IDS).forEach((item) => {
    currentStatus[item] = {
      value: 0,
      maxValue: 999,
    };
  });
  const targetStatusList =
    roleName === "TANK" ? TANK_SUB_STATUS : COMMON_SUB_STATUS;
  const speedStatusName = isPhysical ? "SKS" : "SPS";
  //targetStatusList.push(speedStatusName);
  baseGear.status.subStatusList.forEach((item) => {
    currentStatus[item.statusType].value = item.statusValue;
    currentStatus[item.statusType].maxValue = item.statusValueMax;
  });
  var materialSlotList: MaterialType[] = [];
  for (let i = 0; i < baseGear.slotNum; i++) {
    materialSlotList.push({ materialSize: 1, materialValue: 54 });
  }
  if (baseGear.canAdvancedmelding) {
    for (let i = baseGear.slotNum; i < 5; i++) {
      materialSlotList.push(
        i === baseGear.slotNum
          ? { materialSize: 1, materialValue: 54 }
          : { materialSize: 2, materialValue: 18 }
      );
    }
  }

  var materialCombinationList = [];
  var criticalSum = 0;
  for (let i = 0; i < materialSlotList.length; i++) {
    if (
      currentStatus.CRT.value +
        criticalSum +
        materialSlotList[i].materialValue >
      currentStatus.CRT.maxValue
    ) {
      materialCombinationList.push(targetStatusList);
    } else {
      materialCombinationList.push(["CRT"]);
      criticalSum += materialSlotList[i].materialValue;
    }
  }
  var cachedMaterialParam = [];
  return generateCombinations(materialCombinationList)
    .filter((list) => {
      const currentGearStatus = Object.assign({}, currentStatus);
      return !list.some((item, index) => {
        if (currentGearStatus[item].value >= currentGearStatus[item].maxValue) {
          return true;
        } else {
          currentGearStatus[item] = Object.assign({}, currentGearStatus[item], {
            value:
              currentGearStatus[item].value +
              materialSlotList[index].materialValue,
          });
          return false;
        }
      });
    })
    .map((list) => {
      return {
        gearId: baseGear.itemId,
        gearName: baseGear.name,
        gearStatus: list.reduce((before, current, index) => {
          before[current] = {
            value: Math.min(
              before[current].value + materialSlotList[index].materialValue,
              before[current].maxValue
            ),
            maxValue: before[current].maxValue,
          };
          return before;
        }, Object.assign({}, currentStatus)),
        materiaList: materialSlotList.map((item, index) => {
          return { statusType: list[index], statusValue: item.materialValue };
        }),
      };
    })
    .filter((gearList) => {
      const isDuplicated = cachedMaterialParam.some((cachedItem) => {
        return _.isEqual(gearList.gearStatus, cachedItem);
      });
      if (!isDuplicated) {
        cachedMaterialParam.push(gearList.gearStatus);
      }
      return !isDuplicated;
    });
};

const subStatusParser = (equipment: EquipmentRawParam) => {
  return Object.entries(equipment.maxParams)
    .filter((item) => {
      if (Object.values(STATUS_IDS).includes(+item[0])) {
        return true;
      } else {
        return false;
      }
    })
    .map((item) => {
      const statusType = Object.entries(STATUS_IDS).find((data) => {
        return data[1] === +item[0];
      }) || ["ANY", 0];
      const equipmentParam = getEquipmentParams(equipment).find((n) => {
        return n.paramType === statusType[0];
      }) || {
        paramType: "ANY",
        paramValue: 0,
      };
      return {
        statusType: statusType[0] as StatusType,
        statusValue: equipmentParam.paramValue as number,
        statusValueMax: item[1],
      };
    });
};
export type GearCombinationList = {
  gearId: number;
  gearStatus: {};
  materiaList: {
    statusType: StatusType;
    statusValue: 54 | 18;
  }[];
}[];
export const getGearMaterialCombination = ({
  jobName,
  equipments,
  food,
}: {
  jobName: JobName;
  equipments: EquipmentRawParam[];
  food: FoodRawParam | null;
}) => {
  const isTank = ["GNB", "PLD", "DRK", "WAR"].includes(jobName);
  const isPhysical = [
    // TANK
    "PLD",
    "WAR",
    "DRK",
    "GNB",
    // Melee DPS
    "MNK",
    "DRG",
    "SAM",
    "RPR",
    "VPR",
    // Physical Ranged DPS
    "NIN",
    "BRD",
    "MCH",
    "DNC",
  ].includes(jobName);
  const materiaCombinationArray = equipments.reduce((stack, current, index) => {
    const equipmentStatus = getEquipmentParams(current);
    var startTime = performance.now();
    const currentCombination = getGearMaterialCombinationList({
      roleName: isTank ? "TANK" : "OTHER",
      baseGear: {
        itemId: +current.id,
        name: current.name,
        status: {
          subStatusList: subStatusParser(current),
          materialFrame: [],
          mainStatus: equipmentStatus.find((s) => {
            return ["STR", "DEX", "INT", "MND"].includes(s.paramType);
          })?.paramValue,
        },
        slotNum: +current.materiaSlotCount,
        canAdvancedmelding: current.advancedMelding,
      },
      isPhysical: isPhysical,
    });

    var endTime = performance.now();
    if (index === 0) {
      return currentCombination.map((item) => {
        return [item];
      });
    }
    startTime = performance.now();

    const resultCombination = generateGearCombinations(
      stack,
      currentCombination,
      isPhysical
    );
    endTime = performance.now();
    return resultCombination;
  }, []);
  const bestMaterialCombination = materiaCombinationArray.sort((a, b) => {
    const aStatus = getGearCombinationStatus({
      gearArray: a,
      food: food as FoodRawParam,
      isPhysical: isPhysical,
    });
    const bStatus = getGearCombinationStatus({
      gearArray: b,
      food: food as FoodRawParam,
      isPhysical: isPhysical,
    });
    return (
      getExpectedDamageValue({
        param: bStatus,
        playerLevel: 100,
        buffs: {},
      }) -
      getExpectedDamageValue({
        param: aStatus,
        playerLevel: 100,
        buffs: {},
      })
    );
  })[0];
  return materiaCombinationArray;
};

const getGearCombinationStatus = ({
  gearArray,
  food,
  isPhysical,
}: {
  gearArray: {
    gearId: number;
    gearName: string;
    gearStatus: {
      CRT: number;
      DET: number;
      DH: number;
      TEN: number;
      SKS: number;
      SPS: number;
    };
    materiaList: {
      statusType: StatusType;
      statusValue: 54 | 18;
    }[];
  }[];
  food: FoodRawParam;
  isPhysical: boolean;
}) => {
  const speedStatus = isPhysical ? "SKS" : "SPS";
  const defaultStatus = isPhysical
    ? {
        CRT: getLevelSub(100),
        DET: getLevelSub(100),
        DH: getLevelSub(100),
        TEN: getLevelSub(100),
        SKS: getLevelSub(100),
      }
    : {
        CRT: getLevelSub(100),
        DET: getLevelSub(100),
        DH: getLevelSub(100),
        TEN: getLevelSub(100),
        SPS: getLevelSub(100),
      };
  var statusSum = gearArray.reduce((acc, item) => {
    acc.CRT += item.gearStatus.CRT.value || 0;
    acc.DET += item.gearStatus.DET.value || 0;
    acc.DH += item.gearStatus.DH.value || 0;
    acc.TEN += item.gearStatus.TEN.value || 0;
    acc[speedStatus] += item.gearStatus[speedStatus].value || 0;
    return acc;
  }, Object.assign({}, defaultStatus));

  getFoodParam(food).forEach((item) => {
    statusSum[item.paramType] += Math.min(
      statusSum[item.paramType] * item.paramMultiplier,
      item.paramMaxValue
    );
  });
  return statusSum;
};
