"use client";
import VideoPopup from "../../../components/elements/VideoPopup";
import Layout from "../../../components/layout/Layout";
import { useTranslations } from "../../../lib/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  slidesPerView: 1,
  spaceBetween: 30,
  navigation: {
    clickable: true,
    nextEl: ".nav-prev-testimonial",
    prevEl: ".nav-next-testimonial",
  },
  pagination: {
    el: ".sw-pagination-testimonial",
    clickable: true,
  },
  breakpoints: {
    768: {
      slidesPerView: 2,
      spaceBetween: 20,
    },
    991: {
      slidesPerView: 2,
      spaceBetween: 20,
    },

    1550: {
      slidesPerView: 2,
      spaceBetween: 30,
    },
  },
};

const swiperOptions2 = {
  modules: [Autoplay, Pagination, Navigation],
  autoplay: {
    delay: 0,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  },
  slidesPerView: 2,
  loop: true,
  spaceBetween: 30,
  speed: 3000,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
  },
  breakpoints: {
    450: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
    768: {
      slidesPerView: 4,
      spaceBetween: 30,
    },

    992: {
      slidesPerView: 5,
      spaceBetween: 80,
    },
  },
};
export default function AboutUs() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");
  const translate = useTranslations(currentLocale);

  useEffect(() => {
    // Get locale from URL
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        breadcrumbTitle={translate("about", "introduction.title")}
        currentLocale={currentLocale}
      >
        {/* Hero Section with Video */}
        <section className="flat-section flat-banner-about">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6">
                <div className="hero-content">
                  <h1 className="display-4 fw-bold mb-4">
                    {translate("about", "hero.title")} <br />
                    <span className="text-primary">
                      {translate("about", "hero.companyName")}
                    </span>
                  </h1>
                  <p className="lead text-muted mb-5">
                    {translate("about", "hero.subtitle")}
                  </p>
                  <div className="d-flex gap-3">
                    <Link
                      href={`/${currentLocale}/contact`}
                      className="tf-btn primary"
                    >
                      {translate("about", "cta.contact")}
                    </Link>
                    <Link
                      href={`/${currentLocale}/properties`}
                      className="tf-btn secondary"
                    >
                      {translate("about", "cta.explore")}
                    </Link>
                  </div>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="banner-video position-relative rounded-4 overflow-hidden shadow-lg">
                  <img
                    src="/images/about/about-hero.png"
                    alt={translate("about", "hero.companyName")}
                    className="img-fluid"
                  />
                  <div className="video-overlay d-flex align-items-center justify-content-center">
                    <VideoPopup another />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="text-center mb-5">
                  <h2 className="fw-bold mb-4">
                    {translate("about", "introduction.title")}
                  </h2>
                  <div className="separator mx-auto mb-5">
                    <span className="line"></span>
                    <span className="square"></span>
                    <span className="line"></span>
                  </div>
                </div>
                <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                  <div className="card-body p-5">
                    <p className="fs-5 text-dark lh-lg text-center">
                      {translate("about", "introduction.content")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission Section */}
        <section className="py-5">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">
                {translate("about", "visionMission.title")}
              </h2>
              <p className="text-muted mb-5">
                Driving Excellence in Every Service We Provide
              </p>
            </div>

            <div className="row g-5">
              {/* Vision Card */}
              <div className="col-lg-6">
                <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden hover-lift">
                  <div className="card-body p-5">
                    <div className="icon-box mb-4">
                      <span className="icon icon-target text-primary fs-1"></span>
                    </div>
                    <h3 className="card-title fw-bold mb-4 text-primary">
                      {translate("about", "visionMission.vision.title")}
                    </h3>
                    <p className="card-text fs-5 lh-lg text-dark">
                      {translate("about", "visionMission.vision.content")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Card */}
              <div className="col-lg-6">
                <div className="card h-100 border-0 shadow-lg rounded-4 overflow-hidden hover-lift">
                  <div className="card-body p-5">
                    <div className="icon-box mb-4">
                      <span className="icon icon-mission text-success fs-1"></span>
                    </div>
                    <h3 className="card-title fw-bold mb-4 text-success">
                      {translate("about", "visionMission.mission.title")}
                    </h3>
                    <p className="card-text fs-5 lh-lg text-dark">
                      {translate("about", "visionMission.mission.content")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Values Section */}
        <section className="py-5 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">
                {translate("about", "values.title")}
              </h2>
              <p className="text-muted mb-5">
                The Principles That Guide Everything We Do
              </p>
            </div>

            <div className="row g-4">
              {/* Quality */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className="icon-box mb-3">
                      <span className="icon icon-quality text-primary fs-2"></span>
                    </div>
                    <h4 className="card-title fw-bold mb-3">
                      {translate("about", "values.quality.title")}
                    </h4>
                    <p className="card-text text-muted">
                      {translate("about", "values.quality.content")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Customer Satisfaction */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className="icon-box mb-3">
                      <span className="icon icon-heart text-success fs-2"></span>
                    </div>
                    <h4 className="card-title fw-bold mb-3">
                      {translate("about", "values.customerSatisfaction.title")}
                    </h4>
                    <p className="card-text text-muted">
                      {translate(
                        "about",
                        "values.customerSatisfaction.content"
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leadership */}
              <div className="col-md-4">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className="icon-box mb-3">
                      <span className="icon icon-leadership text-warning fs-2"></span>
                    </div>
                    <h4 className="card-title fw-bold mb-3">
                      {translate("about", "values.leadership.title")}
                    </h4>
                    <p className="card-text text-muted">
                      {translate("about", "values.leadership.content")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Responsibility */}
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className="icon-box mb-3">
                      <span className="icon icon-responsibility text-info fs-2"></span>
                    </div>
                    <h4 className="card-title fw-bold mb-3">
                      {translate("about", "values.responsibility.title")}
                    </h4>
                    <p className="card-text text-muted">
                      {translate("about", "values.responsibility.content")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Partnership */}
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm rounded-4 hover-lift">
                  <div className="card-body p-4 text-center">
                    <div className="icon-box mb-3">
                      <span className="icon icon-partnership text-danger fs-2"></span>
                    </div>
                    <h4 className="card-title fw-bold mb-3">
                      {translate("about", "values.partnership.title")}
                    </h4>
                    <p className="card-text text-muted">
                      {translate("about", "values.partnership.content")}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Us Section */}
        <section className="py-5">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0">
                <div className="pe-lg-5">
                  <h2 className="fw-bold mb-4">
                    {translate("about", "whyUs.title")}
                  </h2>
                  <p className="fs-5 lh-lg text-dark mb-4">
                    {translate("about", "whyUs.content")}
                  </p>

                  <div className="mt-5">
                    {translate("about", "whyUs.points").map((point, index) => (
                      <div
                        key={index}
                        className="d-flex align-items-start mb-3"
                      >
                        <span className="icon icon-check-circle-fill text-success me-3 mt-1"></span>
                        <span className="fs-5">{point}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="position-relative">
                  <div className="image-stack">
                    {/* <img
                      src="/images/about/why-us-1.jpg"
                      alt="Why Choose Us"
                      className="img-fluid rounded-4 shadow-lg mb-4"
                    /> */}
                    <img
                      src="/images/about/why-us-2.png"
                      alt="Our Services"
                      className="img-fluid rounded-4 shadow-lg position-absolute top-50 start-50 translate-middle"
                      style={{ width: "80%", zIndex: 1 }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Expansion Plans Section */}
        <section className="py-5 bg-white text-black">
          <div className="container">
            <div className="row align-items-center">
              <div className="col-lg-6 mb-5 mb-lg-0">
                <div className="position-relative">
                  <img
                    src="/images/about/expansion.jpg"
                    alt="Future Expansion"
                    className="img-fluid rounded-4 shadow"
                  />
                  <div className="position-absolute bottom-0 start-0 p-4">
                    <div className="bg-primary text-white p-3 rounded-3">
                      <h3 className="h2 mb-0">300+</h3>
                      <p className="mb-0">Units Managed</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-lg-6">
                <div className="ps-lg-5">
                  <h2 className="fw-bold mb-4">
                    {translate("about", "expansion.title")}
                  </h2>
                  <p className="fs-5 lh-lg mb-4">
                    {translate("about", "expansion.content")}
                  </p>

                  <div className="mt-4">
                    {translate("about", "expansion.points").map(
                      (point, index) => (
                        <div
                          key={index}
                          className="d-flex align-items-start mb-3"
                        >
                          <span className="icon icon-arrow-right-circle-fill text-warning me-3 mt-1"></span>
                          <span className="fs-5">{point}</span>
                        </div>
                      )
                    )}
                  </div>

                  <div className="mt-5">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <div className="text-center p-3 bg-white text-dark rounded-3">
                          <h3 className="h2 text-primary mb-1">200+</h3>
                          <p className="mb-0">New Units in 2 Years</p>
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <div className="text-center p-3 bg-white text-dark rounded-3">
                          <h3 className="h2 text-primary mb-1">24/7</h3>
                          <p className="mb-0">Customer Support</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-5 bg-primary">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="fw-bold text-white mb-4">
                  Ready to Experience Premium Accommodation in Salalah?
                </h2>
                <p className="text-white-50 mb-5 fs-5">
                  Join thousands of satisfied customers who have chosen Nassayem
                  Salalah for their stay.
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <Link
                    href="/contact"
                    className="btn btn-light btn-lg px-5 py-3 fw-bold"
                  >
                    {translate("about", "cta.contact")}
                  </Link>
                  <Link
                    href="/properties"
                    className="btn btn-outline-light btn-lg px-5 py-3 fw-bold"
                  >
                    {translate("about", "cta.explore")}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    </>
  );
}
