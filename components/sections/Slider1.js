"use client";
import { useEffect, useState } from "react";
import TextTransition, { presets } from "react-text-transition";
import AdvancedFilter from "../elements/AdvancedFilter";
import TabNav from "../elements/TabNav";
import { useTranslations } from "../../lib/translations";
const TEXTS = ["Space", "Stay ", "Rental"];
const TEXTS_AR = ["إقامتك", "راحتك ", "شقتك"];
export default function Slider1({ currentLocale }) {
  const [index, setIndex] = useState(1);
  const translate = useTranslations(currentLocale);

  useEffect(() => {
    const intervalId = setInterval(
      () => setIndex((index) => index + 1),
      3000 // every 3 seconds
    );
    return () => clearTimeout(intervalId);
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
                        <TextTransition
                          springConfig={presets.wobbly}
                          style={{ color: "#2a7475" }}
                        >
                          &nbsp;{TEXTS_AR[index % TEXTS.length]}
                        </TextTransition>
                      </span>
                      &nbsp;في صلالة
                    </h1>
                  ) : (
                    <h1 className="text-white animationtext slide">
                      Find Your
                      <span className="tf-text s1 cd-words-wrapper ms-3">
                        <TextTransition
                          springConfig={presets.wobbly}
                          style={{ color: "#2a7475" }}
                        >
                          {TEXTS[index % TEXTS.length]}
                        </TextTransition>
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
                <div className="flat-tab flat-tab-form">
                  {/* <ul className="nav-tab-form style-1 justify-content-center" role="tablist">
										<TabNav />
									</ul> */}
                  <div className="tab-content">
                    <div className="tab-pane fade active show" role="tabpanel">
                      <div className="form-sl">
                        <form method="post">
                          <AdvancedFilter
                            sidecls="shadow-st"
                            currentLocale={currentLocale}
                          />
                        </form>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="overlay" />
      </section>
    </>
  );
}
