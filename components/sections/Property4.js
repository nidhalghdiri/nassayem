'use client'
import { Autoplay, Navigation, Pagination } from "swiper/modules"
import { Swiper, SwiperSlide } from "swiper/react"

const swiperOptions = {
	modules: [Autoplay, Pagination, Navigation],
	slidesPerView: 1,
		spaceBetween: 30,
		navigation: {
			clickable: true,
			nextEl: ".nav-prev-property",
			prevEl: ".nav-next-property",
		},
		pagination: {
			el: ".sw-pagination-property",
			clickable: true,
		},
}
import Link from "next/link"

export default function Property4() {
	return (
		<>

			<section className="flat-section flat-property-v3 wow fadeInUpSmall" data-wow-delay=".2s" data-wow-duration="2000ms">
				<div className="container">
					<div className="box-title text-center">
						<div className="text-subtitle text-primary">Top Properties</div>
						<h4 className="mt-4">Recommended for you</h4>
					</div>
					<div className="wrap-sw-property">
						<div className="swiper tf-sw-property">
							<Swiper {...swiperOptions} className="swiper-wrapper">
								<SwiperSlide>
									<div className="wrap-property-v2 style-1">
										<div className="box-inner-left">
											<img src="/images/banner/properties.jpg" alt="img-property" />
										</div>
										<div className="box-inner-right">
											<div className="content-property">
												<ul className="box-tag">
													<li className="flag-tag success">Featured</li>
													<li className="flag-tag style-1">For Sale</li>
												</ul>
												<div className="box-name">
													<h5 className="title"><Link href="#" className="link">Rancho Vista Verde, Santa Barbara</Link></h5>
													<p className="location"><span className="icon icon-mapPin" />145 Brooklyn Ave, Califonia, New York</p>
												</div>
												<ul className="list-info">
													<li className="item">
														<span className="icon icon-bed" />
														4 Bed
													</li>
													<li className="item">
														<span className="icon icon-bathtub" />
														2 bath
													</li>
													<li className="item">
														<span className="icon icon-ruler" />
														6000 SqFT
													</li>
												</ul>
												<div className="box-avatar d-flex gap-12 align-items-center">
													<div className="avatar avt-60 round">
														<img src="/images/avatar/avt-12.jpg" alt="avatar" />
													</div>
													<div className="info">
														<p className="body-2 text-variant-1">Agent</p>
														<div className="mt-4 h7 fw-7">John Smith</div>
													</div>
												</div>
												<div className="pricing-property">
													<div className="d-flex align-items-center">
														<h5>$250,00</h5>
														<span className="body-2 text-variant-1">/month</span>
													</div>
													<ul className="d-flex gap-12">
														<li className="box-icon w-52"><span className="icon icon-heart" /></li>
														<li className="box-icon w-52"><span className="icon icon-arrLeftRight" /></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</SwiperSlide>
								<SwiperSlide>
									<div className="wrap-property-v2 style-1">
										<div className="box-inner-left">
											<img src="/images/banner/properties.jpg" alt="img-property" />
										</div>
										<div className="box-inner-right">
											<div className="content-property">
												<ul className="box-tag">
													<li className="flag-tag success">Featured</li>
													<li className="flag-tag style-1">For Sale</li>
												</ul>
												<div className="box-name">
													<h5 className="title"><Link href="#" className="link">Rancho Vista Verde, Santa Barbara</Link></h5>
													<p className="location"><span className="icon icon-mapPin" />145 Brooklyn Ave, Califonia, New York</p>
												</div>
												<ul className="list-info">
													<li className="item">
														<span className="icon icon-bed" />
														4 Bed
													</li>
													<li className="item">
														<span className="icon icon-bathtub" />
														2 bath
													</li>
													<li className="item">
														<span className="icon icon-ruler" />
														6000 SqFT
													</li>
												</ul>
												<div className="box-avatar d-flex gap-12 align-items-center">
													<div className="avatar avt-60 round">
														<img src="/images/avatar/avt-12.jpg" alt="avatar" />
													</div>
													<div className="info">
														<p className="body-2 text-variant-1">Agent</p>
														<div className="mt-4 h7 fw-7">John Smith</div>
													</div>
												</div>
												<div className="pricing-property">
													<div className="d-flex align-items-center">
														<h5>$250,00</h5>
														<span className="body-2 text-variant-1">/month</span>
													</div>
													<ul className="d-flex gap-12">
														<li className="box-icon w-52"><span className="icon icon-heart" /></li>
														<li className="box-icon w-52"><span className="icon icon-arrLeftRight" /></li>
													</ul>
												</div>
											</div>
										</div>
									</div>
								</SwiperSlide>
							</Swiper>
						</div>
						<div className="box-navigation">
							<div className="navigation swiper-nav-next nav-next-property"><span className="icon icon-arr-l" /></div>
							<div className="navigation swiper-nav-prev nav-prev-property"><span className="icon icon-arr-r" /></div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
