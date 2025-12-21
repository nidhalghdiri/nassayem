import { useTranslations } from "@/lib/translations";
import Link from "next/link";

export default function LatestNew3({ currentLocale }) {
  const translate = useTranslations(currentLocale);
  return (
    <>
      <section className="flat-section flat-latest-new-v2">
        <div className="container">
          <div
            className="box-title wow fadeInUpSmall"
            data-wow-delay=".2s"
            data-wow-duration="2000ms"
          >
            <div className="text-subtitle text-primary">
              {translate("home", "blog.latestNew")}
            </div>
            <h4 className="mt-4">{translate("home", "blog.recentArticles")}</h4>
          </div>
          <div
            className="row wow fadeInUpSmall"
            data-wow-delay=".4s"
            data-wow-duration="2000ms"
          >
            <div className="box col-lg-3 col-sm-6">
              <Link
                href="/blog-detail"
                className="flat-blog-item hover-img style-1"
              >
                <div className="img-style">
                  <img src="/images/blog/blog-10.jpg" alt="img-blog" />
                </div>
                <div className="content-box">
                  <span className="date-post">مايو 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    {translate("home", "blog.articles.article1.title")}
                  </div>
                  <div className="post-author">
                    <span className="fw-5">نضال الغديري</span>
                    <span>
                      {translate("home", "blog.articles.article1.category")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="box col-lg-3 col-sm-6">
              <Link
                href="/blog-detail"
                className="flat-blog-item hover-img style-1"
              >
                <div className="img-style">
                  <img src="/images/blog/blog-11.jpg" alt="img-blog" />
                </div>
                <div className="content-box">
                  <span className="date-post">مايو 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    {translate("home", "blog.articles.article2.title")}
                  </div>
                  <div className="post-author">
                    <span className="fw-5">نضال الغديري</span>
                    <span>
                      {translate("home", "blog.articles.article2.category")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="box col-lg-3 col-sm-6">
              <Link
                href="/blog-detail"
                className="flat-blog-item hover-img style-1"
              >
                <div className="img-style">
                  <img src="/images/blog/blog-12.jpg" alt="img-blog" />
                </div>
                <div className="content-box">
                  <span className="date-post">مايو 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    {translate("home", "blog.articles.article3.title")}
                  </div>
                  <div className="post-author">
                    <span className="fw-5">نضال الغديري</span>
                    <span>
                      {translate("home", "blog.articles.article3.category")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="box col-lg-3 col-sm-6">
              <Link
                href="/blog-detail"
                className="flat-blog-item hover-img style-1"
              >
                <div className="img-style">
                  <img src="/images/blog/blog-13.jpg" alt="img-blog" />
                </div>
                <div className="content-box">
                  <span className="date-post">مايو 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    {translate("home", "blog.articles.article4.title")}
                  </div>
                  <div className="post-author">
                    <span className="fw-5">نضال الغديري</span>
                    <span>
                      {translate("home", "blog.articles.article4.category")}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
