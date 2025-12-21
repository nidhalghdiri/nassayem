"use client";
import PropertyMap from "@/components/elements/PropertyMap";
import RangeSlider from "@/components/elements/RangeSlider";
import SidebarFilter from "@/components/elements/SidebarFilter";
import TabNav from "@/components/elements/TabNav";
import VideoPopup from "@/components/elements/VideoPopup";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useState } from "react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useParams } from "next/navigation";
import properties from "@/data/properties.json";

const swiperOptions = {
  modules: [Autoplay, Pagination, Navigation],
  autoplay: {
    delay: 2000,
    disableOnInteraction: false,
    reverseDirection: false,
  },

  speed: 3000,
  slidesPerView: 1,
  loop: true,
  spaceBetween: 30,
  centeredSlides: true,
  breakpoints: {
    600: {
      slidesPerView: 2,
      spaceBetween: 20,
      centeredSlides: false,
    },
    991: {
      slidesPerView: 3,
      spaceBetween: 20,
      centeredSlides: false,
    },

    1550: {
      slidesPerView: 3,
      spaceBetween: 30,
    },
  },
};
export default function PropertyDetails() {
  const [isAccordion, setIsAccordion] = useState(1);
  const params = useParams();
  const { id } = params;

  // Find the property by ID
  const property = properties.find((p) => p.id === id);

  const handleAccordion = (key) => {
    setIsAccordion((prevState) => (prevState === key ? null : key));
  };
  if (!id) {
    return <div>Loading...</div>;
  }
  return (
    <Layout headerStyle={1} footerStyle={1}>
      <section className="flat-gallery-single">
        <div className="item1 box-img">
          <img src={property.images[0]} alt="Main Image" />
          <div className="box-btn">
            <Link href={property.video} target="_blank" className="box-icon">
              <span className="icon icon-play2" />
            </Link>
            <Link href="#" className="tf-btn primary">
              View All Photos
            </Link>
          </div>
        </div>
        {property.images.slice(1).map((image, index) => (
          <Link
            key={index + 2}
            href={image}
            className={`item${index + 2} box-img`}
          >
            <img src={image} alt={`Gallery Image ${index + 2}`} />
          </Link>
        ))}
      </section>

      <section className="flat-section-v6 flat-property-detail-v3">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              {/* Header Section */}
              <div className="header-property-detail">
                <div className="content-top d-flex justify-content-between align-items-center">
                  <div className="box-name">
                    <Link href="#" className="flag-tag primary">
                      {property.status}
                    </Link>
                    <h4 className="title link">{property.title}</h4>
                  </div>
                  <div className="box-price d-flex align-items-center">
                    <h4>{property.price}</h4>
                  </div>
                </div>
                <div className="content-bottom">
                  <div className="info-box">
                    <div className="label">FEATURES:</div>
                    <ul className="meta">
                      {property.features.map((feature, index) => (
                        <li key={index} className="meta-item">
                          <span className={`icon ${feature.icon}`} />{" "}
                          {feature.label}: {feature.value}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="single-property-element single-property-desc">
                <div className="h7 title fw-7">Description</div>
                <p className="body-2 text-variant-1">{property.description}</p>
              </div>

              {/* Nearby Amenities Section */}
              <div className="single-property-element single-property-nearby">
                <div className="h7 title fw-7">What’s nearby?</div>
                <div className="grid-2 box-nearby">
                  <ul className="box-left">
                    {property.nearby.slice(0, 4).map((item, index) => (
                      <li key={index} className="item-nearby">
                        <span className="label">{item.label}:</span>
                        <span className="fw-7">{item.distance}</span>
                      </li>
                    ))}
                  </ul>
                  <ul className="box-right">
                    {property.nearby.slice(4).map((item, index) => (
                      <li key={index} className="item-nearby">
                        <span className="label">{item.label}:</span>
                        <span className="fw-7">{item.distance}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Map Section */}
              <div className="single-property-element single-property-map">
                <div className="h7 title fw-7">Map</div>
                <iframe
                  src={`https://maps.google.com/maps?q= ${encodeURIComponent(
                    property.map.address
                  )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                  width="100%"
                  height="450"
                  frameBorder="0"
                  allowFullScreen
                ></iframe>
                <ul className="info-map">
                  <li>
                    <div className="fw-7">Address</div>
                    <span className="mt-4 text-variant-1">
                      {property.map.address}
                    </span>
                  </li>
                  <li>
                    <div className="fw-7">Downtown</div>
                    <span className="mt-4 text-variant-1">
                      {property.map.downtown}
                    </span>
                  </li>
                  <li>
                    <div className="fw-7">FLL</div>
                    <span className="mt-4 text-variant-1">
                      {property.map.fll}
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Sidebar Section */}
            <div className="col-lg-4">
              <div className="widget-sidebar fixed-sidebar wrapper-sidebar-right">
                <div className="widget-box single-property-contact bg-surface">
                  <div className="h7 title fw-7">Contact Seller</div>
                  <form action="#" className="contact-form">
                    <div className="ip-group">
                      <label htmlFor="fullname">Full Name:</label>
                      <input
                        type="text"
                        placeholder="Your name"
                        className="form-control"
                      />
                    </div>
                    <div className="ip-group">
                      <label htmlFor="phone">Phone Number:</label>
                      <input
                        type="text"
                        placeholder="ex 0123456789"
                        className="form-control"
                      />
                    </div>
                    <div className="ip-group">
                      <label htmlFor="email">Email Address:</label>
                      <input
                        type="email"
                        placeholder="your-email@example.com"
                        className="form-control"
                      />
                    </div>
                    <div className="ip-group">
                      <label htmlFor="message">Your Message:</label>
                      <textarea
                        rows={4}
                        placeholder="Message"
                        className="form-control"
                      />
                    </div>
                    <button className="tf-btn primary w-100">
                      Send Message
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
