"use client";
import PropertyMap from "@/components/elements/PropertyMap";
import Layout from "@/components/layout/Layout";
import { useTranslations } from "@/lib/translations";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Contact() {
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState("en");
  const translate = useTranslations(currentLocale);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error");
      setIsSubmitting(false);
      return;
    }

    // Simulate API call
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });

      // Reset success message after 5 seconds
      setTimeout(() => setSubmitStatus(null), 5000);
    }, 1500);
  };

  return (
    <>
      <Layout
        headerStyle={1}
        footerStyle={1}
        breadcrumbTitle={translate("contact", "hero.title")}
        currentLocale={currentLocale}
      >
        {/* Main Content */}
        <section className="flat-section flat-contact py-6">
          <div className="container">
            <div className="row g-5">
              {/* Contact Form Column */}
              <div className="col-lg-8">
                <div className="contact-form-wrapper shadow-lg rounded-4 overflow-hidden">
                  <div className="bg-light p-5 border-bottom">
                    <h3 className="fw-bold mb-3">
                      {translate("contact", "contactForm.title")}
                    </h3>
                    <p className="text-muted mb-0">
                      {translate("contact", "contactForm.description")}
                    </p>
                  </div>

                  <div className="p-5">
                    <form onSubmit={handleSubmit} className="form-contact">
                      {submitStatus === "success" && (
                        <div
                          className="alert alert-success alert-dismissible fade show"
                          role="alert"
                        >
                          {translate("contact", "contactForm.success")}
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSubmitStatus(null)}
                          ></button>
                        </div>
                      )}

                      {submitStatus === "error" && (
                        <div
                          className="alert alert-danger alert-dismissible fade show"
                          role="alert"
                        >
                          {translate("contact", "contactForm.error")}
                          <button
                            type="button"
                            className="btn-close"
                            onClick={() => setSubmitStatus(null)}
                          ></button>
                        </div>
                      )}

                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label
                              htmlFor="name"
                              className="form-label fw-semibold mb-2"
                            >
                              {translate("contact", "contactForm.fullName")} *
                            </label>
                            <input
                              type="text"
                              id="name"
                              name="name"
                              className="form-control form-control-lg"
                              placeholder={translate(
                                "contact",
                                "contactForm.fullNamePlaceholder"
                              )}
                              value={formData.name}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label
                              htmlFor="email"
                              className="form-label fw-semibold mb-2"
                            >
                              {translate("contact", "contactForm.email")} *
                            </label>
                            <input
                              type="email"
                              id="email"
                              name="email"
                              className="form-control form-control-lg"
                              placeholder={translate(
                                "contact",
                                "contactForm.emailPlaceholder"
                              )}
                              value={formData.email}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="row g-4 mb-4">
                        <div className="col-md-6">
                          <div className="form-group">
                            <label
                              htmlFor="phone"
                              className="form-label fw-semibold mb-2"
                            >
                              {translate("contact", "contactForm.phone")}
                            </label>
                            <input
                              type="tel"
                              id="phone"
                              name="phone"
                              className="form-control form-control-lg"
                              placeholder={translate(
                                "contact",
                                "contactForm.phonePlaceholder"
                              )}
                              value={formData.phone}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <div className="form-group">
                            <label
                              htmlFor="subject"
                              className="form-label fw-semibold mb-2"
                            >
                              {translate("contact", "contactForm.subject")}
                            </label>
                            <input
                              type="text"
                              id="subject"
                              name="subject"
                              className="form-control form-control-lg"
                              placeholder={translate(
                                "contact",
                                "contactForm.subjectPlaceholder"
                              )}
                              value={formData.subject}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="form-group mb-4">
                        <label
                          htmlFor="message"
                          className="form-label fw-semibold mb-2"
                        >
                          {translate("contact", "contactForm.message")} *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          className="form-control form-control-lg"
                          rows="6"
                          placeholder={translate(
                            "contact",
                            "contactForm.messagePlaceholder"
                          )}
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>

                      <div className="d-grid">
                        <button
                          type="submit"
                          className="tf-btn primary btn-lg py-3"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <span
                                className="spinner-border spinner-border-sm me-2"
                                role="status"
                                aria-hidden="true"
                              ></span>
                              {translate("contact", "contactForm.loading")}
                            </>
                          ) : (
                            <>
                              <i className="icon icon-send me-2"></i>
                              {translate("contact", "contactForm.submit")}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Contact Information Column */}
              <div className="col-lg-4">
                <div className="contact-info-wrapper">
                  {/* Contact Info Card */}
                  <div className="card border-0 shadow-lg rounded-4 mb-4 overflow-hidden">
                    <div className="card-body p-5">
                      <h3 className="fw-bold mb-4">
                        {translate("contact", "contactInfo.title")}
                      </h3>

                      <div className="contact-item d-flex align-items-start mb-4">
                        <div className="icon-box me-3">
                          <span className="icon icon-mapPinLine text-primary fs-4"></span>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">
                            {translate("contact", "contactInfo.addressTitle")}
                          </h6>
                          <p className="text-muted mb-0">
                            {translate("contact", "contactInfo.address")}
                          </p>
                        </div>
                      </div>

                      <div className="contact-item d-flex align-items-start mb-4">
                        <div className="icon-box me-3">
                          <span className="icon icon-phone text-primary fs-4"></span>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">
                            {translate(
                              "contact",
                              "contactInfo.informationTitle"
                            )}
                          </h6>
                          <p className="text-muted mb-2">
                            <Link
                              href={`tel:${translate(
                                "contact",
                                "contactInfo.phone"
                              )}`}
                              className="text-decoration-none"
                            >
                              {translate("contact", "contactInfo.phone")}
                            </Link>
                          </p>
                          <p className="text-muted mb-0">
                            <Link
                              href={`mailto:${translate(
                                "contact",
                                "contactInfo.email"
                              )}`}
                              className="text-decoration-none"
                            >
                              {translate("contact", "contactInfo.email")}
                            </Link>
                          </p>
                        </div>
                      </div>

                      <div className="contact-item d-flex align-items-start mb-4">
                        <div className="icon-box me-3">
                          <span className="icon icon-clock-countdown text-primary fs-4"></span>
                        </div>
                        <div>
                          <h6 className="fw-bold mb-1">
                            {translate("contact", "contactInfo.hoursTitle")}
                          </h6>
                          <p className="text-muted mb-1">
                            {translate("contact", "contactInfo.weekdays")}
                          </p>
                          <p className="text-muted mb-0">
                            {translate("contact", "contactInfo.weekends")}
                          </p>
                          <small className="text-muted mt-2 d-block">
                            {translate("contact", "contactInfo.emergency")}
                          </small>
                        </div>
                      </div>

                      <div className="contact-item">
                        <h6 className="fw-bold mb-3">
                          {translate("contact", "contactInfo.followUs")}
                        </h6>
                        <div className="social-links d-flex gap-3">
                          <Link href="#" className="social-icon">
                            <i className="icon icon-facebook fs-5"></i>
                          </Link>
                          <Link href="#" className="social-icon">
                            <i className="icon icon-instagram fs-5"></i>
                          </Link>
                          <Link href="#" className="social-icon">
                            <i className="icon icon-twitter fs-5"></i>
                          </Link>
                          <Link href="#" className="social-icon">
                            <i className="icon icon-linkedin fs-5"></i>
                          </Link>
                          <Link href="#" className="social-icon">
                            <i className="icon icon-youtube fs-5"></i>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Links Card */}
                  <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="card-body p-5">
                      <h3 className="fw-bold mb-4">
                        {translate("contact", "quickLinks.title")}
                      </h3>
                      <div className="quick-links">
                        <Link
                          href="/properties"
                          className="d-flex align-items-center justify-content-between py-3 border-bottom"
                        >
                          <span>
                            {translate("contact", "quickLinks.properties")}
                          </span>
                          <span className="icon icon-arrow-right"></span>
                        </Link>
                        <Link
                          href="/services"
                          className="d-flex align-items-center justify-content-between py-3 border-bottom"
                        >
                          <span>
                            {translate("contact", "quickLinks.services")}
                          </span>
                          <span className="icon icon-arrow-right"></span>
                        </Link>
                        <Link
                          href="/faq"
                          className="d-flex align-items-center justify-content-between py-3 border-bottom"
                        >
                          <span>{translate("contact", "quickLinks.faq")}</span>
                          <span className="icon icon-arrow-right"></span>
                        </Link>
                        <Link
                          href="/booking"
                          className="d-flex align-items-center justify-content-between py-3"
                        >
                          <span>
                            {translate("contact", "quickLinks.booking")}
                          </span>
                          <span className="icon icon-arrow-right"></span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-6 bg-light">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">
                {translate("contact", "faq.title")}
              </h2>
              <p className="text-muted">
                Find quick answers to common questions
              </p>
            </div>

            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="accordion accordion-flush" id="faqAccordion">
                  {translate("contact", "faq.questions").map((item, index) => (
                    <div
                      className="accordion-item shadow-sm mb-3 rounded-3"
                      key={index}
                    >
                      <h3 className="accordion-header">
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#faq-${index}`}
                        >
                          {item.question}
                        </button>
                      </h3>
                      <div
                        id={`faq-${index}`}
                        className="accordion-collapse collapse"
                        data-bs-parent="#faqAccordion"
                      >
                        <div className="accordion-body">{item.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-5">
                  <Link
                    href="/faq"
                    className="btn btn-outline-primary btn-lg px-5"
                  >
                    View All FAQs
                    <i className="icon icon-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-6">
          <div className="container">
            <div className="text-center mb-5">
              <h2 className="fw-bold mb-3">
                {translate("contact", "map.title")}
              </h2>
              <p className="text-muted">
                {translate("contact", "map.description")}
              </p>
            </div>

            <div className="card border-0 shadow-lg rounded-4 overflow-hidden">
              <div className="card-body p-0">
                <PropertyMap singleMap />
                <div className="p-4 bg-light border-top">
                  <div className="row align-items-center">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-2">
                        {translate("contact", "contactInfo.addressTitle")}
                      </h6>
                      <p className="text-muted mb-0">
                        {translate("contact", "contactInfo.address")}
                      </p>
                    </div>
                    <div className="col-md-6 text-md-end">
                      <Link
                        href="https://maps.google.com/?q=Ouked+Shamaliya,+Salalah,+Dhofar,+Oman"
                        target="_blank"
                        className="btn btn-primary"
                      >
                        <i className="icon icon-navigation me-2"></i>
                        Get Directions
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6">
          <div className="container">
            <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-dark text-white">
              <div className="card-body p-5 text-center">
                <h2 className="fw-bold mb-4">Need Immediate Assistance?</h2>
                <p className="lead mb-5">
                  Call us directly for urgent inquiries or emergency support
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                  <Link
                    href={`tel:${translate("contact", "contactInfo.phone")}`}
                    className="btn btn-light btn-lg px-5"
                  >
                    <i className="icon icon-phone me-2"></i>
                    {translate("contact", "contactInfo.phone")}
                  </Link>
                  <Link
                    href="/booking"
                    className="btn btn-outline-light btn-lg px-5"
                  >
                    <i className="icon icon-calendar me-2"></i>
                    Book Now
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
