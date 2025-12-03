import Link from "next/link";
import Menu from "../Menu";
import MobileMenu from "../MobileMenu";
import { usePathname, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

// Language Switcher Component
function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("header.language");

  const switchLanguage = (newLocale) => {
    const segments = pathname.split("/");
    segments[1] = newLocale;
    router.push(segments.join("/"));
  };

  return (
    <div className="language-switcher flex items-center ml-4">
      <button
        onClick={() => switchLanguage(locale === "en" ? "ar" : "en")}
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Switch language"
      >
        <span className="text-sm font-medium">
          {locale === "en" ? "عربي" : "English"}
        </span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
          />
        </svg>
      </button>
    </div>
  );
}

export default function Header1({
  scroll,
  isMobileMenu,
  handleMobileMenu,
  isLogin,
  handleLogin,
  hcls,
  handleRegister,
}) {
  const locale = useLocale();
  const t = useTranslations("header");
  const [currentMenuItem, setCurrentMenuItem] = useState("");
  const pathname = usePathname();

  useEffect(() => {
    setCurrentMenuItem(pathname);
  }, [pathname]);

  const checkCurrentMenuItem = (path) =>
    currentMenuItem === path ? "current" : "";
  return (
    <>
      <header
        className={`main-header fixed-header ${hcls ? "header-style-2" : ""} ${
          scroll ? "fixed-header is-fixed" : ""
        } ${locale === "ar" ? "rtl" : "ltr"}`}
        dir={locale === "ar" ? "rtl" : "ltr"}
      >
        {/* Header Lower */}
        <div className="header-lower">
          <div className="row">
            <div className="col-lg-12">
              <div className="inner-container d-flex justify-content-between align-items-center">
                {/* Logo Box */}
                <div className="logo-box">
                  <div className="logo">
                    <Link href={`/${locale}`}>
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
                      <Menu />
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
                      href={`/${locale}/properties`}
                    >
                      {t("cta.viewProperties")}
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
              <Link href={`/${locale}`}>
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
                <Link className="tf-btn primary" href={`/${locale}/properties`}>
                  {t("cta.viewProperties")}
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
