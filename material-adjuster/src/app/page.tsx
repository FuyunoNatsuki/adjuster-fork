'use client';
import {
  useCallback,
  useEffect,
  useState,
  useTransition,
  useRef
} from "react";
import {
  getCurrentJobEquipmentList,
  FoodRawParam,
  fetchFoodList
} from "./api/fetchEtro";
import Image from "next/image";
import Select, { SingleValue } from "react-select";
import { Loading } from "@/components/Loading";
import { Accordion } from "@/components/Accordion";
import { getGearMaterialCombination} from "./api/calculateMaterialCombination";
import { EQUIPMENT_SLOT_LIST, EquipmentRawParam, EquipmentSlotList, JOB_LIST, JobName, getEquipmentParams, getFoodParam } from "./constant/equipmentConstant";
import { useRouter } from 'next/navigation';
import LZString from 'lz-string';

export default function Home({
  searchParams
}: {
  searchParams: { selectedJob: string };
}) {
  const defaultEquipmentList = {
    weapon: null,
    offHand: null,
    head: null,
    body: null,
    hands: null,
    legs: null,
    feet: null,
    onHand: null,
    ears: null,
    neck: null,
    wrists: null,
    fingerL: null,
    fingerR: null
  };
  const router = useRouter();
  const [cachedEquipmentList, setCachedEquipmentList] = useState({});
  const [isPending, startEtroTransition] = useTransition();
  const [isSubmit, startSubmitTransition] = useTransition();
  const [selectedJob, setSelectedjob] = useState('');
  const [foodList, setFoodList] = useState([] as FoodRawParam[]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [equipmentList, setEquipmentList] = useState([]);
  const [selectedEquipmentlist, setSelectedEquipmentList] = useState(Object.assign({}, defaultEquipmentList));
  const speedParam = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchCurrentJobEquipment(selectedJob);
    startEtroTransition(async () => {
      const etroFoodList = await fetchFoodList();
      setFoodList(etroFoodList);
    });
  }, []);

  const fetchCurrentJobEquipment = (jobName: string) => {
    startEtroTransition(async () => {
      if (Object.keys(cachedEquipmentList).includes(jobName)) {
        setEquipmentList(cachedEquipmentList[jobName]);
        return;
      }
      const currentJobEquipment = await getCurrentJobEquipmentList(jobName as JobName);
      const formattedObject = Object.groupBy(
        currentJobEquipment,
        (n: { [key: string]: string }) => n.slotName
      );
      var resultValue = {};
      Object.keys(formattedObject).forEach((key) => {
        resultValue[key] =
          formattedObject[key]?.sort(
            (a: { itemLevel: string }, b: { itemLevel: string }) => {
              if (+a.itemLevel > +b.itemLevel) {
                return -1;
              } else if (+a.itemLevel === +b.itemLevel) {
                return 0;
              } else {
                return 1;
              }
            }
          ) || [];
      });
      setEquipmentList(formattedObject);
      var additionalEquipmentList = {};
      additionalEquipmentList[jobName] = formattedObject;
      setCachedEquipmentList(Object.assign(cachedEquipmentList, additionalEquipmentList));
    });
  }
  const onChangeFoodSelect = useCallback((newValue: SingleValue<{ value: FoodRawParam }>) => {
    setSelectedFood(newValue.value || null);
  }, []);
  const onChangeJobSelect = useCallback((newValue: SingleValue<{ value: JobName }>) => {
    setSelectedjob(newValue?.value || 'PLD');
    fetchCurrentJobEquipment(newValue?.value || 'PLD');
    setSelectedEquipmentList(Object.assign({}, defaultEquipmentList));
  }, [searchParams]);

  const JobFormatOptionLabel = useCallback((option: {
    value: JobName,
    alt: JobName
  }) => {
    return (
      <div className="flex">
        <Image
          src={'https://etro.gg/s/icons/jobs/' + option.value + '.svg'}
          width={40}
          height={40}
          alt={option.value}
        ></Image>
        <div className="ml-2 leading-10">{option.value}</div>
      </div>
    );
  }, [searchParams]);

  const foodFormatOptionLabel = useCallback((options: {
    value: FoodRawParam,
    alt: string
  }) => {
    const foodParam = getFoodParam(options.value);
    return (
      <div className="flex">
        <Image
          className="w-10 h-10"
          src={options.value.iconPath ? 'https://etro.gg/s/icons' + options.value.iconPath : '/images/Dummy.png'}
          width={40}
          height={40}
          alt={options.value.name}
        ></Image>
        <div>
        <div className="ml-2 leading-5 text-xs">{options.value.name}</div>
        <div className="ml-2 leading-5 text-xs">
          {foodParam.map((item) => (
            <div>{item.paramType + ' +' + item.paramMultiplier + '%(max '+item.paramMaxValue+')'}</div>
          ))}
        </div>
      </div>
      </div>
    )
  }, []);
  const EquipmentOptionLabel = useCallback((option: {
    iconPath: string,
    alt: string,
    label: string,
    gearName: EquipmentSlotList,
    originValue: EquipmentRawParam
  }) => (
    <div className="h-11 text-xs relative whitespace-nowrap flex">
      <Image
        src={option.iconPath ? 'https://etro.gg/s/icons' + option.iconPath : '/images/' + option.originValue.slotName + 'Dummy.png'}
        alt={option.alt}
        width={40}
        height={40}
      ></Image>
      <div>
        <div className="ml-2 leading-5">{option.label}</div>
        <div className="ml-2 leading-5">
          {getEquipmentParams(option.originValue).map((item) => (
            <span className="ml-1">{item.paramType + ' +' + item.paramValue}</span>
          ))}
        </div>
      </div>
    </div>
  ), [searchParams]);

  const onChangeSelectEquipment = useCallback((newValue: SingleValue<{ originValue: EquipmentRawParam, gearName: EquipmentSlotList }>) => {
    var targetValue = {};
    var targetKey = newValue?.gearName || 'weapon';
    targetValue[targetKey] = newValue?.originValue || null;
    setSelectedEquipmentList(Object.assign(selectedEquipmentlist, targetValue));
  }, [searchParams]);

  const EquipmentSelectList = useCallback((option: {
    gearList: EquipmentRawParam[],
    gearName: EquipmentSlotList
  }) => (
    <div className="w-80 text-center">
      <p className="mt-3 text-left">{option.gearName}</p>
      <Select
        className="text-black w-80 text-left h-14"
        isClearable={true}
        onChange={onChangeSelectEquipment}
        options={option.gearList.map((n: EquipmentRawParam) => {
          return {
            value: n.name,
            label: 'IL:' + n.itemLevel + ' ' + n.name,
            iconPath: n.iconPath,
            alt: n.iconId,
            gearName: option.gearName,
            originValue: n
          };
        })}
        defaultValue={selectedEquipmentlist[option.gearName] ? {
          value: selectedEquipmentlist[option.gearName].name,
          label: 'IL:' + selectedEquipmentlist[option.gearName].itemLevel + ' ' + selectedEquipmentlist[option.gearName].name,
            iconPath: selectedEquipmentlist[option.gearName].iconPath,
            alt: selectedEquipmentlist[option.gearName].iconId,
            gearName: option.gearName,
            originValue: selectedEquipmentlist[option.gearName]
        }: null}
        formatOptionLabel={EquipmentOptionLabel}
      >
      </Select>
    </div>
  ), [searchParams]);

  const JobEquipmentForm = () => (
    <div>
      <div className="justify-center">
        {EQUIPMENT_SLOT_LIST.map((gear: EquipmentSlotList, gearIndex) => {
          const equipmentData = ['fingerL', 'fingerR'].includes(gear) ? equipmentList.finger : equipmentList[gear];
          return (
            <div key={gearIndex}>
              {equipmentData && <EquipmentSelectList gearList={equipmentData} gearName={gear} />}
            </div>
          );
        })}
      </div>
    </div>
  );

  const SelectEquipmentSubMenu = useCallback(() => {
    return (
      <div className="min-h-28 bg-sky-700 px-5 py-2 items-center justify-center flex">
        <div className="inline-block text-right">
          <div>
            <label className="text-md mr-2" htmlFor="speed">
              必要SS
            </label>
            <input
              ref={speedParam}
              className="rounded-md px-1 py-2 bg-white border mb-6 inline-block text-black"
              name="speed"
              placeholder="ex. 2.50 or 400"
              required
            />
          </div>
        </div>
      </div>
    );
  }, [searchParams]);

  const onClickSubmitEquipment = () => {
    startSubmitTransition(() => {
      const targetEquipmments = Object.values(selectedEquipmentlist).filter((item) => {
        return item;
      });
      const bestCombination = getGearMaterialCombination({
        jobName: selectedJob as JobName,
        equipments: targetEquipmments,
        food: selectedFood
      });
      if (sessionStorage.getItem('resultCombination')) {
        sessionStorage.removeItem('resultCombination');
      }
      sessionStorage.setItem('resultCombination', LZString.compress(JSON.stringify(bestCombination[0])))
      router.push('/result')
    });
  };

  return (
    <>
      <div className="bg-black text-white min-h-screen flex flex-col justify-start items-center mb-16 pb-6 mt-24 select-none">
        <header className="bg-black text-4xl font-bold fixed top-0 h-18 w-full text-center z-10">
          <div className="mt-3">
            <p className="">Material Adjuster</p>
            <p className="text-xl">選択した装備から最適なマテリアの組み合わせを提案します</p>
          </div>
        </header>
        <main className="text-lg text-left w-80">
          <div>
            <h1>Job</h1>
            <Select
              className="text-black"
              onChange={onChangeJobSelect}
              options={JOB_LIST.map((item) => {
                return {
                  value: item,
                  alt: item
                };
              })}
              formatOptionLabel={JobFormatOptionLabel}
            ></Select>
            <h1 className="mt-2">food</h1>
            <Select
              isClearable={true}
              className="text-black"
              onChange={onChangeFoodSelect}
              options={foodList.map((item) => {
                return {
                  value: item,
                  alt: item.name
                }
              })}
              formatOptionLabel={foodFormatOptionLabel}
            ></Select>
            {isPending ? <Loading /> : <JobEquipmentForm />}
          </div>
        </main>
        <footer className="fixed bottom-0 h-16 bg-black w-full text-center">
          <div className="relative">
            <Accordion
              parentClassName="absolute bottom-16 w-full"
              childClassName="absolute w-full bottom-6"
              titleClassName="bg-blue-400"
              title="追加オプション"
              children={<SelectEquipmentSubMenu />}
            />
            <div className="mt-3">
              <p className="mt-1">created by Akino Harusaki 2024.6 </p>
              <p className="mt-1">Thanks for <a className="text-yellow-400 hover:text-red-600" href="https://etro.gg/api/docs/">Etro</a></p>
            </div>
            {isSubmit ? <Loading /> :(
            <button
              className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded absolute bottom-24 right-1/4 active:scale-95"
              onClick={onClickSubmitEquipment}
            >
              計算開始
            </button>)}
          </div>
        </footer>
      </div>
    </>
  );
}