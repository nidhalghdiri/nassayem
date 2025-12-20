import { useTranslations } from "../../../lib/translations";
import Link from "next/link";

export default function Footer1({ currentLocale }) {
  const translate = useTranslations(currentLocale);
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        {/* Top Footer */}
        <div className="top-footer">
          <div className="container">
            <div className="content-footer-top d-flex justify-content-between align-items-center">
              <div className="footer-logo">
                <img
                  src="/images/logo/logo-footer@2x.png"
                  alt="Nassayem Salalah Logo"
                  width={174}
                  height={44}
                />
              </div>
              <div className="wd-social">
                <span>{translate("footer", "topFooter.followUs")}</span>
                <ul className="list-social d-flex align-items-center">
                  <li>
                    <Link href="#" className="box-icon w-40 social">
                      <i className="icon icon-facebook" />
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="box-icon w-40 social">
                      <i className="icon icon-linkedin" />
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="box-icon w-40 social">
                      <i className="icon icon-twitter" />
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="box-icon w-40 social">
                      <i className="icon icon-instagram" />
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="box-icon w-40 social">
                      <i className="icon icon-youtube" />
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Inner Footer */}
        <div className="inner-footer">
          <div className="container">
            <div className="row">
              {/* About Us */}
              <div className="col-lg-4 col-md-6">
                <div className="footer-cl-1">
                  <p className="text-variant-2">
                    {translate("footer", "aboutUs.description")}
                  </p>
                  <ul className="mt-12">
                    <li className="mt-12 d-flex align-items-center gap-8">
                      <i className="icon icon-mapPinLine fs-20 text-variant-2" />
                      <p className="text-white">
                        {translate("footer", "aboutUs.address")}
                      </p>
                    </li>
                    <li className="mt-12 d-flex align-items-center gap-8">
                      <i className="icon icon-phone2 fs-20 text-variant-2" />
                      <Link
                        href="tel:+96898488802"
                        className="text-white caption-1"
                      >
                        {translate("footer", "aboutUs.phone")}
                      </Link>
                    </li>
                    <li className="mt-12 d-flex align-items-center gap-8">
                      <i className="icon icon-mail fs-20 text-variant-2" />
                      <p className="text-white">
                        {translate("footer", "aboutUs.email")}
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Categories */}
              <div className="col-lg-2 col-md-6 col-6">
                <div className="footer-cl-2">
                  <div className="fw-7 text-white">
                    {translate("footer", "categories.title")}
                  </div>
                  <ul className="mt-10 navigation-menu-footer">
                    <li>
                      <Link
                        href="/pricing"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "categories.pricingPlans")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/our-service"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "categories.ourServices")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/about-us"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "categories.aboutUs")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/contact"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "categories.contactUs")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Our Company */}
              <div className="col-lg-2 col-md-4 col-6">
                <div className="footer-cl-3">
                  <div className="fw-7 text-white">
                    {translate("footer", "ourCompany.title")}
                  </div>
                  <ul className="mt-10 navigation-menu-footer">
                    <li>
                      <Link
                        href="/properties/for-rent"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "ourCompany.propertiesForRent")}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/properties/for-sale"
                        className="caption-1 text-variant-2"
                      >
                        {translate("footer", "ourCompany.propertiesForSale")}
                      </Link>
                    </li>
                    <li>
                      <Link href="/agents" className="caption-1 text-variant-2">
                        {translate("footer", "ourCompany.ourAgents")}
                      </Link>
                    </li>
                    <li>
                      <Link href="/faq" className="caption-1 text-variant-2">
                        {translate("footer", "ourCompany.faqs")}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Newsletter */}
              <div className="col-lg-4 col-md-6">
                <div className="footer-cl-4">
                  <div className="fw-7 text-white">
                    {translate("footer", "newsletter.title")}
                  </div>
                  <p className="mt-12 text-variant-2">
                    {translate("footer", "newsletter.description")}
                  </p>
                  <form action="#" id="subscribe-form" className="mt-12">
                    <span className="icon-left icon-mail" />
                    <input
                      type="email"
                      placeholder={translate(
                        "footer",
                        "newsletter.placeholder"
                      )}
                      required
                      id="subscribe-email"
                    />
                    <button type="submit" id="subscribe-button">
                      <i className="icon icon-send" />
                      <span className="sr-only">
                        {translate("footer", "newsletter.button")}
                      </span>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="bottom-footer">
          <div className="container">
            <div className="content-footer-bottom d-flex justify-content-between align-items-center">
              <div className="copyright">
                {translate("footer", "bottomFooter.copyright").replace(
                  "{year}",
                  currentYear
                )}
              </div>
              <ul className="menu-bottom d-flex gap-16">
                <li>
                  <Link href="/terms-of-service">
                    {translate("footer", "bottomFooter.termsOfService")}
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy">
                    {translate("footer", "bottomFooter.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="/cookie-policy">
                    {translate("footer", "bottomFooter.cookiePolicy")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
