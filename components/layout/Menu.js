"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export default function Menu() {
  const pathname = usePathname();
  const [currentMenuItem, setCurrentMenuItem] = useState("");

  useEffect(() => {
    setCurrentMenuItem(pathname);
  }, [pathname]);

  const checkCurrentMenuItem = (path) =>
    currentMenuItem === path ? "current" : "";
  const checkParentActive = (paths) =>
    paths.some((path) => currentMenuItem.startsWith(path)) ? "current" : "";

  return (
    <>
      <ul className="navigation clearfix">
        <li className={`home`}>
          <Link href="/">Home</Link>
        </li>
        <li>
          <Link href="/about-us">About Us</Link>
        </li>
        {/* <li>
          <Link href="/sidebar-grid">Properties</Link>
        </li> */}
        <li>
          <Link href="/blog">Blog</Link>
        </li>
        <li>
          <Link href="/contact">Contact Us</Link>
        </li>
        {/* <li
          className={`dropdown2 ${checkParentActive([
            "/property-halfmap-grid",
            "/property-halfmap-list",
            "/topmap-grid",
            "/topmap-list",
            "/sidebar-grid",
            "/sidebar-list",
          ])}`}
        >
          <Link href="#">Listing</Link>

          <ul>
            <li className={`${checkCurrentMenuItem("/property-halfmap-grid")}`}>
              <Link href="/property-halfmap-grid">Property Half Map Grid</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/property-halfmap-list")}`}>
              <Link href="/property-halfmap-list">Property Half Map List</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/topmap-grid")}`}>
              <Link href="/topmap-grid">Find Topmap Grid</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/topmap-list")}`}>
              <Link href="/topmap-list">Find Topmap List</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/sidebar-grid")}`}>
              <Link href="/sidebar-grid">Find Sidebar Grid</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/sidebar-list")}`}>
              <Link href="/sidebar-list">Find Sidebar List</Link>
            </li>
          </ul>
        </li> */}
        {/* <li
          className={`dropdown2 ${checkParentActive([
            "/property-details-v1",
            "/property-details-v2",
            "/property-details-v3",
            "/property-details-v4",
          ])}`}
        >
          <Link href="#">Properties</Link>
          <ul>
            <li className={`${checkCurrentMenuItem("/property-details-v1")}`}>
              <Link href="/property-details-v1">Property Details 1</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/property-details-v2")}`}>
              <Link href="/property-details-v2">Property Details 2</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/property-details-v3")}`}>
              <Link href="/property-details-v3">Property Details 3</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/property-details-v4")}`}>
              <Link href="/property-details-v4">Property Details 4</Link>
            </li>
          </ul>
        </li>
        <li
          className={`dropdown2 ${checkParentActive([
            "/about-us",
            "/our-service",
            "/pricing",
            "/contact",
            "/faq",
            "/privacy-policy",
          ])}`}
        >
          <Link href="#">Pages</Link>
          <ul>
            <li className={`${checkCurrentMenuItem("/about-us")}`}>
              <Link href="/about-us">About Us</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/our-service")}`}>
              <Link href="/our-service">Our Services</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/pricing")}`}>
              <Link href="/pricing">Pricing</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/contact")}`}>
              <Link href="/contact">Contact Us</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/faq")}`}>
              <Link href="/faq">FAQs</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/privacy-policy")}`}>
              <Link href="/privacy-policy">Privacy Policy</Link>
            </li>
          </ul>
        </li>
        <li
          className={`dropdown2 ${checkParentActive([
            "/blog",
            "/blog-grid",
            "/blog-detail",
          ])}`}
        >
          <Link href="#">Blog</Link>
          <ul>
            <li className={`${checkCurrentMenuItem("/blog")}`}>
              <Link href="/blog">Blog Default</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/blog-grid")}`}>
              <Link href="/blog-grid">Blog Grid</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/blog-detail")}`}>
              <Link href="/blog-detail">Blog Post Details</Link>
            </li>
          </ul>
        </li>
        <li
          className={`dropdown2 ${checkParentActive([
            "/dashboard",
            "/my-favorites",
            "/my-invoices",
            "/my-favorites",
            "/reviews",
            "/my-profile",
            "/add-property",
          ])}`}
        >
          <Link href="#">Dashboard</Link>
          <ul>
            <li className={`${checkCurrentMenuItem("/dashboard")}`}>
              <Link href="/dashboard">Dashboard</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/my-favorites")}`}>
              <Link href="/my-favorites">My Properties</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/my-invoices")}`}>
              <Link href="/my-invoices">My Invoices</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/my-favorites")}`}>
              <Link href="/my-favorites">My Favorites</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/reviews")}`}>
              <Link href="/reviews">Reviews</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/my-profile")}`}>
              <Link href="/my-profile">My Profile</Link>
            </li>
            <li className={`${checkCurrentMenuItem("/add-property")}`}>
              <Link href="/add-property">Add Property</Link>
            </li>
          </ul>
        </li> */}
      </ul>
    </>
  );
}
