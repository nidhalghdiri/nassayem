"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Replace react-text-transition
import AdvancedFilter from "../elements/AdvancedFilter";
import TabNav from "../elements/TabNav";
import { useTranslations } from "@/lib/translations";

const TEXTS = ["Space", "Stay", "Rental"];
const TEXTS_AR = ["إقامتك", "راحتك", "شقتك"];

export default function Slider1({ currentLocale }) {
  const [index, setIndex] = useState(0);
  const translate = useTranslations(currentLocale);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % TEXTS.length);
    }, 3000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <>
      <section className="flat-slider home-1">
        <div className="container relative">
          <div className="row">
            <div className="col-lg-12">
              <div className="slider-content">
                <div className="heading text-center">
                  {currentLocale === "ar" ? (
                    <h1 className="text-white animationtext slide">
                      ابحث عن
                      <span className="tf-text s1 cd-words-wrapper ms-3">
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          style={{ color: "#2a7475", display: "inline-block" }}
                        >
                          &nbsp;{TEXTS_AR[index]}
                        </motion.span>
                      </span>
                      &nbsp;في صلالة
                    </h1>
                  ) : (
                    <h1 className="text-white animationtext slide">
                      Find Your
                      <span className="tf-text s1 cd-words-wrapper ms-3">
                        <motion.span
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ duration: 0.5 }}
                          style={{ color: "#2a7475", display: "inline-block" }}
                        >
                          {TEXTS[index]}
                        </motion.span>
                      </span>
                      &nbsp;in Salalah
                    </h1>
                  )}

                  <p
                    className="subtitle text-white body-1 wow fadeIn"
                    data-wow-delay=".8s"
                    data-wow-duration="2000ms"
                  >
                    {translate("home", "hero.subtitle")}
                  </p>
                </div>
                {/* Rest of your component */}
              </div>
            </div>
          </div>
        </div>
        <div className="overlay" />
      </section>
    </>
  );
}
