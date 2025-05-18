import Link from "next/link";

export default function LatestNew3() {
  return (
    <>
      <section className="flat-section flat-latest-new-v2">
        <div className="container">
          <div
            className="box-title wow fadeInUpSmall"
            data-wow-delay=".2s"
            data-wow-duration="2000ms"
          >
            <div className="text-subtitle text-primary">Latest New</div>
            <h4 className="mt-4">The Most Recent Articles</h4>
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
                  <span className="date-post">May 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    Top 5 Reasons to Rent a Property in Salalah...
                  </div>
                  <div className="post-author">
                    <span className="fw-5">Nidhal Ghdiri</span>
                    <span>Khareef</span>
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
                  <span className="date-post">May 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    A Guide to Finding Your Perfect Rental...
                  </div>
                  <div className="post-author">
                    <span className="fw-5">Nidhal Ghdiri</span>
                    <span>Rent</span>
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
                  <span className="date-post">May 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    Exploring Salalah's Best Neighborhoods...
                  </div>
                  <div className="post-author">
                    <span className="fw-5">Nidhal Ghdiri</span>
                    <span>Salalah</span>
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
                  <span className="date-post">May 17, 2025</span>
                  <div className="title h7 fw-7 link">
                    Tips for Travelers: What to Expect...
                  </div>
                  <div className="post-author">
                    <span className="fw-5">Nidhal Ghdiri</span>
                    <span>Travel</span>
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
