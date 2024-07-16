export type JobName =
  // TANK
  | "PLD"
  | "WAR"
  | "DRK"
  | "GNB"
  // HEALER
  | "WHM"
  | "SCH"
  | "AST"
  | "SGE"
  // Melee DPS
  | "MNK"
  | "DRG"
  | "SAM"
  | "RPR"
  // Physical Ranged DPS
  | "NIN"
  | "BRD"
  | "MCH"
  | "DNC"
  // Magical Ranged DPS
  | "BLM"
  | "SMN"
  | "RDM";
export const JOB_LIST: JobName[] = [
  // TANK
  "PLD",
  "WAR",
  "DRK",
  "GNB",
  // HEALER
  "WHM",
  "SCH",
  "AST",
  "SGE",
  // Melee DPS
  "MNK",
  "DRG",
  "SAM",
  "RPR",
  // Physical Ranged DPS
  "NIN",
  "BRD",
  "MCH",
  "DNC",
  // Magical Ranged DPS
  "BLM",
  "SMN",
  "RDM",
];
export type EquipmentSlotList =
  | "weapon"
  | "offHand"
  | "head"
  | "body"
  | "hands"
  | "legs"
  | "feet"
  | "offHand"
  | "ears"
  | "neck"
  | "wrists"
  | "fingerL"
  | "fingerR";

export const EQUIPMENT_SLOT_LIST: EquipmentSlotList[] = [
  "weapon",
  "offHand",
  "head",
  "body",
  "hands",
  "legs",
  "feet",
  "ears",
  "neck",
  "wrists",
  "fingerL",
  "fingerR",
];
export const TRIBE_DATA_LIST = [
  {
    name: "ヒューラン（ミッドランダー）",
    status: {
      STR: 22,
      DEX: 19,
      VIT: 20,
      INT: 23,
      MND: 19,
    },
  },
  {
    name: "ヒューラン（ハイランダー）",
    status: {
      STR: 23,
      DEX: 20,
      VIT: 22,
      INT: 18,
      MND: 20,
    },
  },
  {
    name: "エレゼン（フォレスター）",
    status: {
      STR: 20,
      DEX: 23,
      VIT: 19,
      INT: 22,
      MND: 19,
    },
  },
  {
    name: "エレゼン（シェーダー）",
    status: {
      STR: 20,
      DEX: 20,
      VIT: 19,
      INT: 23,
      MND: 21,
    },
  },
  {
    name: "ララフェル（プレーンフォーク）",
    status: {
      STR: 19,
      DEX: 23,
      VIT: 19,
      INT: 22,
      MND: 20,
    },
  },
  {
    name: "ララフェル（デューンフォーク）",
    status: {
      STR: 19,
      DEX: 21,
      VIT: 18,
      INT: 22,
      MND: 23,
    },
  },
  {
    name: "ミコッテ（サンシーカー）",
    status: {
      STR: 22,
      DEX: 23,
      VIT: 20,
      INT: 19,
      MND: 19,
    },
  },
  {
    name: "ミコッテ（ムーンキーパー）",
    status: {
      STR: 19,
      DEX: 22,
      VIT: 18,
      INT: 21,
      MND: 23,
    },
  },
  {
    name: "ルガディン（ゼーヴォルフ）",
    status: {
      STR: 22,
      DEX: 19,
      VIT: 23,
      INT: 18,
      MND: 21,
    },
  },
  {
    name: "ルガディン（ローエンガルデ）",
    status: {
      STR: 20,
      DEX: 18,
      VIT: 23,
      INT: 20,
      MND: 22,
    },
  },
  {
    name: "アウラ（アウラ・レン）",
    status: {
      STR: 19,
      DEX: 22,
      VIT: 19,
      INT: 20,
      MND: 23,
    },
  },
  {
    name: "アウラ（アウラ・ゼラ）",
    status: {
      STR: 23,
      DEX: 20,
      VIT: 22,
      INT: 20,
      MND: 18,
    },
  },
  {
    name: "ロスガル（ヘリオン）",
    status: {
      STR: 23,
      DEX: 17,
      VIT: 23,
      INT: 17,
      MND: 23,
    },
  },
  {
    name: "ロスガル（ロスト）",
    status: {
      STR: 23,
      DEX: 17,
      VIT: 23,
      INT: 17,
      MND: 23,
    },
  },
  {
    name: "ヴィエラ（ラヴァ・ヴィエラ）",
    status: {
      STR: 20,
      DEX: 23,
      VIT: 18,
      INT: 21,
      MND: 21,
    },
  },
  {
    name: "ヴィエラ（ヴィナ・ヴィエラ）",
    status: {
      STR: 19,
      DEX: 20,
      VIT: 19,
      INT: 23,
      MND: 22,
    },
  },
];
export const STATUS_IDS = {
  STR: 1,
  DEX: 2,
  VIT: 3,
  INT: 4,
  MND: 5,
  PIE: 6,
  TEN: 19,
  DH: 22,
  CRT: 27,
  DET: 44,
  SKS: 45,
  SPS: 46,
};

export type EquipmentParams = {
  param0: number | null;
  param1: number | null;
  param2: number | null;
  param3: number | null;
  param4: number | null;
  param5: number | null;
  param0Value: number | null;
  param1Value: number | null;
  param2Value: number | null;
  param3Value: number | null;
  param4Value: number | null;
  param5Value: number | null;
  maxParams: {
    [key: string]: number;
  };
};
export type EquipmentRawParam = {
  id: number;
  name: string;
  description: string;
  param0: number;
  param1: number;
  param2: number;
  param3: number;
  param4: number;
  param5: number;
  param0Value: number;
  param1Value: number;
  param2Value: number;
  param3Value: number;
  param4Value: number;
  param5Value: number;
  maxParams: {
    [key: string]: number;
  };
  advancedMelding: boolean;
  block: number;
  blockRate: number;
  canBeHq: boolean;
  damageMag: number;
  damagePhys: number;
  defenseMag: number;
  defensePhys: number;
  delay: number;
  iconId: number;
  iconPath: string;
  itemLevel: number;
  itemSpecialBonus: number;
  itemSpecialBonusParam: number;
  level: number;
  materiaSlotCount: number;
  materializeType: number;
  PVP: boolean;
  rarity: number;
  slotCategory: number;
  unique: boolean;
  untradable: boolean;
  weapon: boolean;
  canCustomize: boolean;
  itemLevelSync: number;
  slotName: EquipmentSlotList;
  jobName: JobName;
  itemUICategory: number;
  jobCategory: number;
};

export type RoleName =
  | "TANK"
  | "HEALER"
  | "Melee DPS"
  | "Physical Ranged DPS"
  | "Magical Ranged DPS";

export const getEquipmentParams = (equipment: EquipmentRawParam) => {
  var returnParam = [];
  for (let i = 0; i <= 5; i++) {
    if (equipment["param" + i]) {
      var param = Object.entries(STATUS_IDS).find((value) => {
        return value[1] === equipment["param" + i];
      }) || ["STR", STATUS_IDS.STR];
      returnParam.push({
        paramType: param[0],
        paramValue: equipment["param" + i + "Value"],
      });
    }
  }
  return returnParam;
};
export type FoodRawParam = {
  id: number;
  name: string;
  canBeHq: boolean;
  cooldownS: 0;
  description: string;
  item: number;
  iconId: number;
  iconPath: string;
  itemLevel: number;
  param0: number;
  param1: number;
  param2: number;
  isRelative0: boolean;
  isRelative1: boolean;
  isRelative2: boolean;
  maxHQ0: number;
  maxHQ1: number;
  maxHQ2: number;
  valueHQ0: number;
  valueHQ1: number;
  valueHQ2: number;
  isFood: boolean;
};
export const getFoodParam = (food: FoodRawParam) => {
  var returnParam = [];
  for (let i = 0; i <= 2; i++) {
    if (food["param" + i]) {
      const param = Object.entries(STATUS_IDS).find((value) => {
        return value[1] === food["param" + i];
      }) || ["STR", STATUS_IDS.STR];
      returnParam.push({
        paramType: param[0],
        paramMultiplier: food["valueHQ" + i],
        paramMaxValue: food["maxHQ" + i],
      });
    }
  }
  return returnParam;
};
