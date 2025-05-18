"use client";
import dynamic from "next/dynamic";
const MapCluster = dynamic(() => import("./MapCluster"), {
  ssr: false,
});

export default function PropertyMap({ topmap, singleMap }) {
  return (
    <>
      {!singleMap ? (
        <MapCluster topmap={topmap} />
      ) : (
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3814.4136927081154!2d54.1549516!3d17.0524055!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3dd3e13814f4827b%3A0xb25d775f616abb80!2z2YbYs9in2KbZhSDYtdmE2KfZhNipINmE2YTYtNmC2YIg2KfZhNmB2YbYr9mC2YrYqSBOYXNzYXllbSBTYWxhbGFoIEhvdGVsIEFwYXJ0bWVudHM!5e0!3m2!1sfr!2som!4v1747152073981!5m2!1sfr!2som"
          height={570}
          style={{ border: 0, width: "100%" }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      )}
    </>
  );
}
