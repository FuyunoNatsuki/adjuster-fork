"use server";
import _ from "lodash";
import { FoodRawParam } from "./fetchEtro";
import {
  EquipmentRawParam,
  JobName,
  STATUS_IDS,
  getEquipmentParams,
} from "../constant/equipmentConstant";

/** * Criticalの確立（5%〜）を返す */
const getCriticalHitRate = ({
  criticalParam,
  criticalBuffs,
  playerLevel,
}: {
  criticalParam: number;
  criticalBuffs: number[];
  playerLevel: number;
}) => {
  const criticalBuffRate =
    Math.floor(
      criticalBuffs.reduce((stack, current) => {
        return stack + current;
      }, 0)
    ) * 1000;
  return (
    (Math.floor(
      (200 * (criticalParam - getLevelSub(playerLevel))) /
        getLevelDiv(playerLevel)
    ) +
      50 +
      criticalBuffRate) /
    1000
  );
};
/** * Criticalのダメージ倍率（40%〜）を返す */
const getCriticalHitStrength = ({
  criticalParam,
  playerLevel,
}: {
  criticalParam: number;
  playerLevel: number;
}) => {
  return (
    (Math.floor(
      (200 * (criticalParam - getLevelSub(playerLevel))) /
        getLevelDiv(playerLevel)
    ) +
      400) /
    1000
  );
};
/** * CRTのダメージ期待値を返す */
const getExpectedCriticalValue = ({
  criticalParam,
  criticalBuffs,
  playerLevel,
}: {
  criticalParam: number;
  criticalBuffs: number[];
  playerLevel: number;
}) => {
  return (
    getCriticalHitRate({
      criticalParam: criticalParam,
      criticalBuffs: criticalBuffs,
      playerLevel: playerLevel,
    }) *
      getCriticalHitStrength({
        criticalParam: criticalParam,
        playerLevel: playerLevel,
      }) +
    1
  );
};
/** * DETのダメージ倍率を返す */
const getDeterminationMultiplier = ({
  determinationParam,
  playerLevel,
}: {
  determinationParam: number;
  playerLevel: number;
}) => {
  return (
    (Math.floor(
      (140 * (determinationParam - getLevelMain(playerLevel))) /
        getLevelDiv(playerLevel)
    ) +
      1000) /
    1000
  );
};
/** * DHのダメージ期待値を返す */
const getExpectedDirectHitValue = ({
  directHitParam,
  directHitBuffs,
  playerLevel,
}: {
  directHitParam: number;
  directHitBuffs: number[];
  playerLevel: number;
}) => {
  return (
    getDirectHitRate({
      directHitParam: directHitParam,
      directHitBuffs: directHitBuffs,
      playerLevel: playerLevel,
    }) *
      0.25 +
    1
  );
};
/** * DHの確率を返す */
const getDirectHitRate = ({
  directHitParam,
  directHitBuffs,
  playerLevel,
}: {
  directHitParam: number;
  directHitBuffs: number[];
  playerLevel: number;
}) => {
  const directHitBuffRate =
    Math.floor(
      directHitBuffs.reduce((stack, current) => {
        return stack + current;
      }, 0)
    ) * 1000;
  return (
    Math.floor(
      (550 * (directHitParam - getLevelSub(playerLevel))) /
        getLevelDiv(playerLevel) +
        directHitBuffRate
    ) / 1000
  );
};
/** * GCDの値を返す */
const getGcdSpeed = ({
  speedParam,
  playerLevel,
  basicGcdValue,
  speedBuffs,
}: {
  speedParam: number;
  playerLevel: number;
  basicGcdValue: number;
  speedBuffs: number[];
}) => {
  const speedBuffValue = speedBuffs.reduce((stack, current) => {
    return stack * current;
  }, 1);
  return (
    Math.floor(
      (basicGcdValue *
        speedBuffValue *
        (Math.ceil(
          (130 * (getLevelSub(playerLevel) - speedParam)) /
            getLevelDiv(playerLevel)
        ) +
          1000)) /
        10
    ) / 100
  );
};
/** * Dotおよびオートアタックの倍率を返す */
const getDotMultiplier = ({
  speedParam,
  playerLevel,
}: {
  speedParam: number;
  playerLevel: number;
}) => {
  return (
    (Math.floor(
      (130 * (speedParam - getLevelSub(playerLevel))) / getLevelDiv(playerLevel)
    ) +
      1000) /
    1000
  );
};
/** * TENのダメージ倍率を返す */
const getTenacityMultiplier = ({
  tenacityParam,
  playerLevel,
}: {
  tenacityParam: number;
  playerLevel: number;
}) => {
  return (
    (Math.floor(
      (112 * (tenacityParam - getLevelSub(playerLevel))) /
        getLevelDiv(playerLevel)
    ) +
      1000) /
    1000
  );
};
/** * 総合のダメージ期待値倍率を返す */
const getExpectedDamageValue = ({
  param,
  playerLevel,
  buffs,
}: {
  param: {
    CRT?: number;
    DET?: number;
    DH?: number;
    TEN?: number;
  };
  playerLevel: number;
  buffs: {
    CRT?: number[];
    DET?: number[];
    DH?: number[];
  };
}) => {};
/** * FIXME: 黄金が来たらLv100のパラメータを適用して正規のステータスを返す */
const getLevelMain = (level: number) => {
  return 440;
};
const getLevelSub = (level: number) => {
  return 420;
};
const getLevelDiv = (level: number) => {
  return 2780;
};
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
type StatusType = "DET" | "DH" | "CRT" | "SS" | "TEN";
type MaterialType =
  | { materialSize: 1; materialValue: 54 }
  | { materialSize: 2; materialValue: 18 };
const COMMON_SUB_STATUS: StatusType[] = ["CRT", "DH", "DET"];
const TANK_SUB_STATUS: StatusType[] = COMMON_SUB_STATUS.concat("TEN");

type StatusCombination = StatusType[];
type GearCombinationListArray = GearCombinationList;
const generateCombinations = (
  arrays: StatusCombination[],
  index = 0,
  current: StatusCombination = [],
  result: StatusCombination[] = []
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

const generateGearCombinations = (
  arrays: GearCombinationListArray[],
  index = 0,
  current: GearCombinationListArray = [],
  result: GearCombinationListArray[] = []
) => {
  if (index === arrays.length) {
    const defaultValue = {
      CRT: 0,
      DET: 0,
      DH: 0,
      TEN: 0,
      SS: 0,
    };
    const currentSum = current.reduce((stack, item) => {
      const additionalStatus = Array.isArray(item)
        ? {
            CRT: item.reduce((s, n) => {
              return s + n.gearStatus.CRT.value;
            }, 0),
            DET: item.reduce((s, n) => {
              return s + n.gearStatus.DET.value;
            }, 0),
            DH: item.reduce((s, n) => {
              return s + n.gearStatus.DH.value;
            }, 0),
            TEN: item.reduce((s, n) => {
              return s + n.gearStatus.TEN.value;
            }, 0),
            SS: item.reduce((s, n) => {
              return s + n.gearStatus.SS.value;
            }, 0),
          }
        : {
            CRT: item.gearStatus.CRT.value,
            DET: item.gearStatus.DET.value,
            DH: item.gearStatus.DH.value,
            TEN: item.gearStatus.TEN.value,
            SS: item.gearStatus.SS.value,
          };
      return {
        CRT: stack.CRT + additionalStatus.CRT,
        DET: stack.DET + additionalStatus.DET,
        DH: stack.DH + additionalStatus.DH,
        TEN: stack.TEN + additionalStatus.TEN,
        SS: stack.SS + additionalStatus.SS,
      };
    }, defaultValue);
    const isAlreadyExist = result.some((n) => {
      const resultSum = n.flat().reduce((stack, item) => {
        return {
          CRT: stack.CRT + item.gearStatus.CRT.value,
          DET: stack.DET + item.gearStatus.DET.value,
          DH: stack.DH + item.gearStatus.DH.value,
          TEN: stack.TEN + item.gearStatus.TEN.value,
          SS: stack.SS + item.gearStatus.SS.value,
        };
      }, defaultValue);
      return _.isEqual(currentSum, resultSum);
    });
    if (!isAlreadyExist) {
      result.push([...current]);
    }
    return result;
  }
  for (const element of arrays[index]) {
    current[index] = element;
    generateGearCombinations(arrays, index + 1, current, result);
  }
  return result;
};

const getGearMaterialCombinationList = ({
  roleName,
  baseGear,
}: {
  roleName: "TANK" | "OTHER";
  baseGear: GearItemInfo;
}) => {
  var currentStatus = {};
  Object.keys(STATUS_IDS).forEach((item) => {
    currentStatus[item] = {
      value: 0,
      maxValue: 999,
    };
  });
  const speedStatus = baseGear.status.subStatusList.find((n) => {
    return n.statusType === "SKS" || n.statusType === "SPS";
  });
  currentStatus["SS"] = {
    value: speedStatus ? speedStatus.statusValue : 0,
    maxValue: speedStatus ? speedStatus.statusValueMax : 999,
  };
  const targetStatusList =
    roleName === "TANK" ? TANK_SUB_STATUS : COMMON_SUB_STATUS;
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
  var criticalSlotList = [];
  materialSlotList.some((slot) => {
    const criticalSum = criticalSlotList.reduce((stack, n) => {
      return stack + n.statusValue;
    }, 0);
    if (
      currentStatus.CRT.value + criticalSum + slot.materialValue >=
      currentStatus.CRT.maxValue
    ) {
      return true;
    }
    criticalSlotList.push({
      statusType: "CRT",
      statusValue: slot.materialValue,
    });
    return false;
  });
  var materialCombinationList = [];
  for (let i = criticalSlotList.length; i < materialSlotList.length; i++) {
    if (materialSlotList[i].materialSize === 1) {
      materialCombinationList.push(
        targetStatusList.filter((n) => {
          return !["SS", "TEN"].includes(n);
        })
      );
    } else {
      materialCombinationList.push(targetStatusList);
    }
  }
  var cachedMaterialParam = [];
  const existCriticalSum = criticalSlotList.reduce((stack, n) => {
    return stack + n.statusValue;
  }, 0);
  if (!materialCombinationList.length) {
    return [
      {
        gearId: baseGear.itemId,
        gearName: baseGear.name,
        gearStatus: Object.assign({}, currentStatus, {
          CRT: {
            value: Math.min(
              currentStatus.CRT.value + existCriticalSum,
              currentStatus.CRT.maxValue || 999
            ),
          },
        }),
        materiaList: criticalSlotList,
      },
    ];
  }
  return generateCombinations(materialCombinationList)
    .filter((list) => {
      const currentGearStatus = Object.assign({}, currentStatus);
      return !list.some((item, index) => {
        const additionalValue = item === "CRT" ? existCriticalSum : 0;
        if (
          currentGearStatus[item].value + additionalValue >=
          currentGearStatus[item].maxValue
        ) {
          return true;
        } else {
          currentGearStatus[item] = Object.assign({}, currentGearStatus[item], {
            value:
              currentGearStatus[item].value +
              materialSlotList[index].materialValue +
              additionalValue,
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
          const additionalValue = current === "CRT" ? existCriticalSum : 0;
          before[current] = {
            value: Math.min(
              before[current].value +
                materialSlotList[index].materialValue +
                additionalValue,
              before[current].maxValue || 999
            ),
          };
          return before;
        }, Object.assign({}, currentStatus)),
        materiaList: criticalSlotList.concat(
          materialSlotList.map((item, index) => {
            return { statusType: list[index], statusValue: item.materialValue };
          })
        ),
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
type GearCombinationList = {
  gearId: number;
  gearStatus: {};
  materiaList: {
    statusType: StatusType;
    statusValue: 54 | 18;
  }[];
}[];
export const getGearMaterialCombination = async ({
  jobName,
  equipments,
  food,
}: {
  jobName: JobName;
  equipments: EquipmentRawParam[];
  food: FoodRawParam | null;
}) => {
  const materiaCombinationArray = equipments.reduce((stack, current, index) => {
    const isTank = ["GNB", "PLD", "DRK", "WAR"].includes(jobName);

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
    });

    var endTime = performance.now();
    console.log(
      "[Generate Combination" + (index + 1) + "] " + (endTime - startTime)
    );
    if (index === 0) {
      return currentCombination;
    }
    if (index < 2) {
      return generateCombinations([stack, currentCombination]);
    }
    startTime = performance.now();

    const resultCombination = generateGearCombinations([
      stack,
      currentCombination,
    ]).map((item) => {
      return item[0].concat(item[1]);
    });
    endTime = performance.now();
    console.log(
      "[Multiple(" +
        resultCombination.length +
        ") Combination Filtering] " +
        (endTime - startTime)
    );
    return resultCombination;
  }, []);
  return materiaCombinationArray;
};
