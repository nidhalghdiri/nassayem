"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LanguageSwitcher from "../../LanguageSwitcher";
import Menu from "../Menu";
import MobileMenu from "../MobileMenu";
import { useTranslations } from "@/lib/translations";

export default function Header1({
  scroll,
  isMobileMenu,
  handleMobileMenu,
  isLogin,
  handleLogin,
  hcls,
  handleRegister,
}) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentLocale, setCurrentLocale] = useState("en");
  const translate = useTranslations(currentLocale);

  useEffect(() => {
    // Get locale from URL
    const locale = pathname.split("/")[1] || "en";
    setCurrentLocale(locale);
  }, [pathname]);

  return (
    <>
      <header
        className={`main-header fixed-header ${hcls ? "header-style-2" : ""} ${
          scroll ? "fixed-header is-fixed" : ""
        } ${currentLocale === "ar" ? "rtl" : "ltr"}`}
        dir={currentLocale === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Lower */}
        <div className="header-lower">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-container d-flex justify-content-between align-items-center">
                {/* Logo Box */}
                <div className="logo-box">
                  <div className="logo">
                    <Link href={`/${currentLocale}`}>
                      {hcls ? (
                        <img
                          src="/images/logo/logo-footer@2x.png"
                          alt="logo"
                          width={174}
                          height={44}
                        />
                      ) : (
                        <img
                          src="/images/logo/logo@2x.png"
                          alt="logo"
                          width={174}
                          height={44}
                        />
                      )}
                    </Link>
                  </div>
                </div>
                <div className="nav-outer">
                  {/* Main Menu */}
                  <nav className="main-menu show navbar-expand-md">
                    <div
                      className="navbar-collapse collapse clearfix"
                      id="navbarSupportedContent"
                    >
                      <Menu currentLocale={currentLocale} />
                    </div>
                  </nav>
                  {/* Main Menu End*/}
                </div>
                <div className="header-account d-flex align-items-center gap-4">
                  {/* Language Switcher */}
                  <LanguageSwitcher />
                  {/* CTA Button */}
                  <div className="flat-bt-top d-none d-md-block">
                    <Link
                      className="tf-btn primary"
                      href={`/${currentLocale}/properties`}
                    >
                      {translate("common", "buttons.properties")}
                    </Link>
                  </div>
                  {/* <div className="register">
                    <ul className="d-flex">
                      <li>
                        <a onClick={handleLogin}>Login</a>
                      </li>
                      <li>/</li>
                      <li>
                        <a onClick={handleRegister}>Register</a>
                      </li>
                    </ul>
                  </div> */}
                  {/* <div className="flat-bt-top">
										<Link className="tf-btn primary" href="/add-property">Submit Property</Link>
									</div> */}
                </div>
                <div
                  className="mobile-nav-toggler mobile-button"
                  onClick={handleMobileMenu}
                >
                  <span />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* End Header Lower */}
        {/* Mobile Menu  */}
        <div className="close-btn" onClick={handleMobileMenu}>
          <span className="icon flaticon-cancel-1" />
        </div>
        <div className="mobile-menu">
          <div className="menu-backdrop" onClick={handleMobileMenu} />
          <nav className="menu-box">
            <div className="nav-logo">
              <Link href={`/${currentLocale}`}>
                <img
                  src="/images/logo/logo@2x.png"
                  alt="Nasaem Salalah"
                  width={174}
                  height={44}
                />
              </Link>
            </div>
            <div className="bottom-canvas">
              {/* <div className="login-box flex align-items-center">
                <Link href="#modalLogin" data-bs-toggle="modal">
                  Login
                </Link>
                <span>/</span>
                <Link href="#modalRegister" data-bs-toggle="modal">
                  Register
                </Link>
              </div> */}
              <MobileMenu />
              <div className="button-mobi-sell">
                <Link
                  className="tf-btn primary"
                  href={`/${currentLocale}/properties`}
                >
                  Properties
                </Link>
              </div>
              <div className="mobi-icon-box">
                <div className="box d-flex align-items-center">
                  <span className="icon icon-phone2" />
                  <div>+968 9899 4036</div>
                </div>
                <div className="box d-flex align-items-center">
                  <span className="icon icon-mail" />
                  <div>nssayemsalalah@gmail.com</div>
                </div>
              </div>
              {/* Language Switcher Mobile */}
              <div className="language-switcher-mobile mt-4">
                <LanguageSwitcher />
              </div>
            </div>
          </nav>
        </div>
        {/* End Mobile Menu */}
      </header>
    </>
  );
}
