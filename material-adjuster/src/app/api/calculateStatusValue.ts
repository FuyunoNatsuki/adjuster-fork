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
          (130 *
            (getLevelSub(playerLevel) -
              speedParam -
              getLevelSub(playerLevel))) /
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
    DH?: number[];
  };
}) => {
  return (
    getExpectedCriticalValue({
      criticalBuffs: buffs.CRT || [],
      criticalParam: param.CRT || getLevelSub(playerLevel),
      playerLevel: playerLevel,
    }) *
    getExpectedDirectHitValue({
      directHitParam: param.DH || getLevelSub(playerLevel),
      directHitBuffs: buffs.DH || [],
      playerLevel: playerLevel,
    }) *
    getDeterminationMultiplier({
      determinationParam: param.DET || getLevelSub(playerLevel),
      playerLevel: playerLevel,
    }) *
    getTenacityMultiplier({
      tenacityParam: param.TEN || getLevelSub(playerLevel),
      playerLevel: playerLevel,
    })
  );
};

const getLevelMain = (level: number) => {
  return 440;
};
const getLevelSub = (level: number) => {
  return 420;
};
const getLevelDiv = (level: number) => {
  return 2780;
};

export {
  getCriticalHitRate,
  getCriticalHitStrength,
  getExpectedCriticalValue,
  getDeterminationMultiplier,
  getExpectedDirectHitValue,
  getDirectHitRate,
  getGcdSpeed,
  getDotMultiplier,
  getTenacityMultiplier,
  getExpectedDamageValue,
  getLevelMain,
  getLevelSub,
  getLevelDiv,
};
