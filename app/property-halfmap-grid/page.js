'use client'
import AdvancedFilter from "@/components/elements/AdvancedFilter"
import PropertyMap from "@/components/elements/PropertyMap"
import TabNav from "@/components/elements/TabNav"
import Layout from "@/components/layout/Layout"
import Link from "next/link"
import { useState } from "react"
export default function PropertyHalfmapGrid() {
	const [isTab, setIsTab] = useState(1)
	const [isVisible, setIsVisible] = useState(true)
	const handleTab = (i) => {
		setIsTab(i)
		setIsVisible(false)
		setTimeout(() => {
			setIsVisible(true)
		}, 200)
	}
	return (
		<>

			<Layout headerStyle={1}>
				<div>
					<section className="flat-filter-search-v2">
						<div className="flat-tab flat-tab-form">
							<ul className="nav-tab-form style-3" role="tablist">
								<TabNav />
							</ul>
							<div className="tab-content">
								<div className="tab-pane fade active show" role="tabpanel">
									<div className="form-sl">
										<form method="post">
											<AdvancedFilter />
										</form>
										{/* End Job  Search Form*/}
									</div>
								</div>
							</div>
						</div>
					</section>
					<section className="wrapper-layout layout-2">
						<div className="wrap-left">
							<div className="box-title-listing style-1">
								<h5>Property listing</h5>
								<div className="box-filter-tab">
									<ul className="nav-tab-filter" role="tablist">
										<li className="nav-tab-item" onClick={() => handleTab(1)}>
											<a className={isTab == 1 ? "nav-link-item active" : "nav-link-item"}><i className="icon icon-grid" /></a>
										</li>
										<li className="nav-tab-item" onClick={() => handleTab(2)}>
											<a className={isTab == 2 ? "nav-link-item active" : "nav-link-item"}><i className="icon icon-list" /></a>
										</li>
									</ul>
									<select className="nice-select">

										<option data-value="default" className="option selected">Sort by (Default)</option>
										<option data-value="new" className="option">Newest</option>
										<option data-value="old" className="option">Oldest</option>
									</select>
								</div>
							</div>
							<div className="tab-content">
								<div style={{ opacity: isVisible ? 1 : 0 }} className={isTab == 1 ? "tab-pane fade show active" : "tab-pane fade"}>
									<div className="row">
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-1.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">Studio</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link"> Casa Lomas de Machalí Machas</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>33 Maple Street, San Francisco, California</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>3</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-6.jpg" alt="avt" />
														</div>
														<span>Arlene McCoy</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$7250,00</h6>
														<span className="text-variant-1">/SqFT</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-2.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">Apartment</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Villa del Mar Retreat, Malibu</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>72 Sunset Avenue, Los Angeles, California</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-7.jpg" alt="avt" />
														</div>
														<span>Annette Black</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$250,00</h6>
														<span className="text-variant-1">/month</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-3.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">Villa</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Rancho Vista Verde, Santa Barbara</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>33 Maple Street, San Francisco, California</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-5.jpg" alt="avt" />
														</div>
														<span>Ralph Edwards</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$5050,00</h6>
														<span className="text-variant-1">/SqFT</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-4.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">House</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Sunset Heights Estate, Beverly Hills</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>1040 Ocean, Santa Monica, California</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>3</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-8.jpg" alt="avt" />
														</div>
														<span>Jacob Jones</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$250,00</h6>
														<span className="text-variant-1">/month</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-5.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">Office</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Coastal Serenity Cottage</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>21 Hillside Drive, Beverly Hills, California</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-9.jpg" alt="avt" />
														</div>
														<span>Kathryn Murphy</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$7250,00</h6>
														<span className="text-variant-1">/SqFT</span>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-6">
											<div className="homeya-box">
												<div className="archive-top">
													<Link href="/property-details-v1" className="images-group">
														<div className="images-style">
															<img src="/images/home/house-6.jpg" alt="img" />
														</div>
														<div className="top">
															<ul className="d-flex gap-8">
																<li className="flag-tag success">Featured</li>
																<li className="flag-tag style-1">For Sale</li>
															</ul>
															<ul className="d-flex gap-4">
																<li className="box-icon w-32">
																	<span className="icon icon-arrLeftRight" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-heart" />
																</li>
																<li className="box-icon w-32">
																	<span className="icon icon-eye" />
																</li>
															</ul>
														</div>
														<div className="bottom">
															<span className="flag-tag style-2">Studio</span>
														</div>
													</Link>
													<div className="content">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Lakeview Haven, Lake Tahoe</Link></div>
														<div className="desc"><i className="fs-16 icon icon-mapPin" /><p>8 Broadway, Brooklyn, New York</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
												</div>
												<div className="archive-bottom d-flex justify-content-between align-items-center">
													<div className="d-flex gap-8 align-items-center">
														<div className="avatar avt-40 round">
															<img src="/images/avatar/avt-6.jpg" alt="avt" />
														</div>
														<span>Floyd Miles</span>
													</div>
													<div className="d-flex align-items-center">
														<h6>$250,00</h6>
														<span className="text-variant-1">/SqFT</span>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div style={{ opacity: isVisible ? 1 : 0 }} className={isTab == 2 ? "tab-pane fade show active" : "tab-pane fade"}>
									<div className="row">
										<div className="col-md-12">
											<div className="homeya-box list-style-1 list-style-2">
												<Link href="/property-details-v1" className="images-group">
													<div className="images-style">
														<img src="/images/home/house-9.jpg" alt="img" />
													</div>
													<div className="top">
														<ul className="d-flex gap-4 flex-wrap">
															<li className="flag-tag style-1">For Sale</li>
														</ul>
														<ul className="d-flex gap-4">
															<li className="box-icon w-32">
																<span className="icon icon-arrLeftRight" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-heart" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-eye" />
															</li>
														</ul>
													</div>
													<div className="bottom">
														<span className="flag-tag style-2">Villa</span>
													</div>
												</Link>
												<div className="content">
													<div className="archive-top">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Casa Lomas de Machalí Machas</Link></div>
														<div className="desc"><i className="icon icon-mapPin" /><p>145 Brooklyn Ave, Califonia, New York</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
													<div className="d-flex justify-content-between align-items-center">
														<div className="d-flex gap-8 align-items-center">
															<div className="avatar avt-40 round">
																<img src="/images/avatar/avt-8.jpg" alt="avt" />
															</div>
															<span>Jacob Jones</span>
														</div>
														<div className="d-flex align-items-center">
															<div className="h7 fw-7">$5050,00</div>
															<span className="text-variant-1">/SqFT</span>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-12">
											<div className="homeya-box list-style-1 list-style-2">
												<Link href="/property-details-v1" className="images-group">
													<div className="images-style">
														<img src="/images/home/house-10.jpg" alt="img" />
													</div>
													<div className="top">
														<ul className="d-flex">
															<li className="flag-tag style-1">For Rent</li>
														</ul>
														<ul className="d-flex gap-4">
															<li className="box-icon w-32">
																<span className="icon icon-arrLeftRight" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-heart" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-eye" />
															</li>
														</ul>
													</div>
													<div className="bottom">
														<span className="flag-tag style-2">House</span>
													</div>
												</Link>
												<div className="content">
													<div className="archive-top">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Lakeview Haven, Lake Tahoe </Link></div>
														<div className="desc"><i className="icon icon-mapPin" /><p>145 Brooklyn Ave, Califonia, New York</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
													<div className="d-flex justify-content-between align-items-center">
														<div className="d-flex gap-8 align-items-center">
															<div className="avatar avt-40 round">
																<img src="/images/avatar/avt-10.jpg" alt="avt" />
															</div>
															<span>Floyd Miles</span>
														</div>
														<div className="d-flex align-items-center">
															<div className="h7 fw-7">$250,00</div>
															<span className="text-variant-1">/month</span>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-12">
											<div className="homeya-box list-style-1 list-style-2">
												<Link href="/property-details-v1" className="images-group">
													<div className="images-style">
														<img src="/images/home/house-6.jpg" alt="img" />
													</div>
													<div className="top">
														<ul className="d-flex">
															<li className="flag-tag style-1">For Sale</li>
														</ul>
														<ul className="d-flex gap-4">
															<li className="box-icon w-32">
																<span className="icon icon-arrLeftRight" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-heart" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-eye" />
															</li>
														</ul>
													</div>
													<div className="bottom">
														<span className="flag-tag style-2">House</span>
													</div>
												</Link>
												<div className="content">
													<div className="archive-top">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Sunset Heights Estate, Beverly Hills</Link></div>
														<div className="desc"><i className="icon icon-mapPin" /><p>145 Brooklyn Ave, Califonia, New York</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
													<div className="d-flex justify-content-between align-items-center">
														<div className="d-flex gap-8 align-items-center">
															<div className="avatar avt-40 round">
																<img src="/images/avatar/avt-5.jpg" alt="avt" />
															</div>
															<span>Ralph Edwards</span>
														</div>
														<div className="d-flex align-items-center">
															<div className="h7 fw-7">$5050,00</div>
															<span className="text-variant-1">/SqFT</span>
														</div>
													</div>
												</div>
											</div>
										</div>
										<div className="col-md-12">
											<div className="homeya-box list-style-1 list-style-2">
												<Link href="/property-details-v1" className="images-group">
													<div className="images-style">
														<img src="/images/home/house-5.jpg" alt="img" />
													</div>
													<div className="top">
														<ul className="d-flex">
															<li className="flag-tag style-1">For Rent</li>
														</ul>
														<ul className="d-flex gap-4">
															<li className="box-icon w-32">
																<span className="icon icon-arrLeftRight" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-heart" />
															</li>
															<li className="box-icon w-32">
																<span className="icon icon-eye" />
															</li>
														</ul>
													</div>
													<div className="bottom">
														<span className="flag-tag style-2">apartment</span>
													</div>
												</Link>
												<div className="content">
													<div className="archive-top">
														<div className="h7 text-capitalize fw-7"><Link href="/property-details-v1" className="link">Lakeview Haven, Lake Tahoe</Link></div>
														<div className="desc"><i className="icon icon-mapPin" /><p>145 Brooklyn Ave, Califonia, New York</p> </div>
														<ul className="meta-list">
															<li className="item">
																<i className="icon icon-bed" />
																<span>4</span>
															</li>
															<li className="item">
																<i className="icon icon-bathtub" />
																<span>2</span>
															</li>
															<li className="item">
																<i className="icon icon-ruler" />
																<span>600 SqFT</span>
															</li>
														</ul>
													</div>
													<div className="d-flex justify-content-between align-items-center">
														<div className="d-flex gap-8 align-items-center">
															<div className="avatar avt-40 round">
																<img src="/images/avatar/avt-9.jpg" alt="avt" />
															</div>
															<span>Annette Black</span>
														</div>
														<div className="d-flex align-items-center">
															<div className="h7 fw-7">$250,00</div>
															<span className="text-variant-1">/month</span>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="wrap-right">
							<PropertyMap />
						</div>
					</section>
				</div >

			</Layout >
		</>
	)
}