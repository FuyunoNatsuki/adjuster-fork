// @ts-nocheck
'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LZString from 'lz-string';
import { BackLinkButton } from '@/components/BackLinkButton';
export default function Result({
    searchParams
  }: {
    searchParams: { resultCombination: string };
  }) {
    const router = useRouter();
    const [combination, setCombination] = useState([]);
    useEffect(() => {
        setCombination(JSON.parse(LZString.decompress(sessionStorage.getItem('resultCombination'))))
    }, [])

  return (
      <div className="bg-black text-white min-h-screen flex flex-col justify-start items-center mb-16 pb-6 mt-24 select-none">
            <header className="bg-black text-4xl font-bold fixed top-0 h-18 w-full text-center z-10">
              <div className="mt-3">
                  <BackLinkButton href={'/'} />
                <p className="">Material Adjuster</p>
                <p className="text-xl">計算結果</p>
            </div>
          </header>
          <main className="text-lg text-left w-80">
              <div>
                  {combination.map((item) => (
                    <>
                        <div className='mt-2'>{item.gearName}</div>
                        <div className=' border'>
                            {item.materiaList.map((n, index) => (
                                <div key={index +1}>{n.statusType + '+' + n.statusValue}</div>
                            ))}
                        </div>
                    </>
                ))}
              </div>
          </main>
    </div>
  );
};
