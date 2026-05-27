"use client";

import { useState } from "react";
import { motion } from "motion/react";
import CountUp from "react-countup";
import { SectionTitle } from "./primitives";
import { Reveal, slideInLeft, slideInRight } from "./motion";

export function Stats() {
  return <Calculator />;
}

function Calculator() {
  const [team, setTeam] = useState(15);
  const [orders, setOrders] = useState(80);

  const hoursSaved = Math.round(team * 1.4 + orders * 0.18);
  const ordersRecovered = Math.round(orders * 0.07);
  const moneyKzt =
    Math.round((hoursSaved * 5000 + ordersRecovered * 25000) / 5000) * 5000;
  const fmt = (n: number) => n.toLocaleString("ru-RU").replace(",", " ");

  return (
    <section className="relative py-24 sm:py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-14 items-center">
          <Reveal variants={slideInLeft}>
            <div>
              <SectionTitle
                eyebrow="Калькулятор"
                title={
                  <>
                    Сколько вы тратите
                    <br />
                    на{" "}
                    <span className="gradient-text">хаос?</span>
                  </>
                }
                sub="Сдвиньте ползунки под вашу команду — мы посчитаем, сколько часов и тенге возвращает CleanOps в месяц."
              />

              <motion.div
                className="mt-9 rounded-[20px] p-7 relative overflow-hidden"
                style={{
                  background: "var(--color-leaf)",
                  color: "var(--color-mint)",
                }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.3 }}
              >
                <div
                  className="absolute -right-10 -bottom-16 opacity-10 text-[220px] leading-none serif select-none pointer-events-none"
                  style={{ color: "var(--color-mint)" }}
                >
                  ₸
                </div>
                <div className="text-[12.5px] tracking-[0.04em] uppercase font-semibold opacity-70">
                  Вы экономите в месяц
                </div>
                <div
                  className="font-bold tracking-[-0.03em] leading-none mt-2 tnum"
                  style={{ fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}
                >
                  ≈ {fmt(moneyKzt)} ₸
                </div>
                <div className="flex gap-7 mt-6 text-[13px]">
                  <div>
                    <div className="opacity-70 text-[11px]">Часов менеджеров</div>
                    <div className="text-[22px] font-semibold mt-0.5 tnum">
                      {hoursSaved} ч
                    </div>
                  </div>
                  <div>
                    <div className="opacity-70 text-[11px]">Спасённых заказов</div>
                    <div className="text-[22px] font-semibold mt-0.5 tnum">
                      +{ordersRecovered}
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </Reveal>

          <Reveal variants={slideInRight}>
            <motion.div
              className="card p-7 sm:p-8"
              whileHover={{ boxShadow: "0 18px 40px -16px rgba(15, 42, 26, 0.18)" }}
            >
              <div className="flex flex-col gap-7">
                <CalcRow label="Размер команды" value={`${team} мастеров`}>
                  <input
                    type="range"
                    min={3}
                    max={50}
                    value={team}
                    onChange={(e) => setTeam(+e.target.value)}
                    className="cleanops-slider"
                  />
                </CalcRow>
                <CalcRow label="Заказов в неделю" value={`${orders} заказов`}>
                  <input
                    type="range"
                    min={20}
                    max={300}
                    value={orders}
                    onChange={(e) => setOrders(+e.target.value)}
                    className="cleanops-slider"
                  />
                </CalcRow>

                <div className="grid grid-cols-3 gap-2 pt-5 border-t">
                  {[
                    { l: "Среднее опоздание", v: 68, prefix: "−", suffix: "%" },
                    { l: "Жалоб клиентов", v: 73, prefix: "−", suffix: "%" },
                    { l: "Окупаемость", vStr: "21 день" },
                  ].map((x) => (
                    <div key={x.l} className="text-center">
                      <div className="text-[11px] text-[color:var(--color-muted)]">{x.l}</div>
                      <div
                        className="text-[18px] font-semibold mt-0.5 tnum"
                        style={{ color: "var(--color-moss)" }}
                      >
                        {x.vStr ? x.vStr : (
                          <CountUp
                            end={x.v!}
                            duration={2}
                            prefix={x.prefix}
                            suffix={x.suffix}
                            enableScrollSpy
                            scrollSpyOnce
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function CalcRow({
  label,
  value,
  children,
}: {
  label: string;
  value: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between mb-3">
        <span className="text-[13px] text-[color:var(--color-muted)] font-medium">{label}</span>
        <span className="text-[14px] font-semibold tnum">{value}</span>
      </div>
      {children}
    </div>
  );
}
