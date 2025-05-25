"use client";
import Layout from "@/components/layout/Layout";
import Link from "next/link";
import { useState } from "react";

export default function PrivacyPolicy() {
  const [isTab, setIsTab] = useState(1);
  const [isVisible, setIsVisible] = useState(true);

  const handleTab = (i) => {
    setIsTab(i);
    setIsVisible(false);
    setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  return (
    <Layout headerStyle={1} footerStyle={1} breadcrumbTitle="Privacy Policy">
      <section className="flat-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-5">
              <ul className="nav-tab-privacy" role="tablist">
                <li className="nav-tab-item" onClick={() => handleTab(1)}>
                  <a
                    className={
                      isTab == 1 ? "nav-link-item active" : "nav-link-item"
                    }
                    data-bs-toggle="tab"
                  >
                    1. Introduction
                  </a>
                </li>
                <li className="nav-tab-item" onClick={() => handleTab(2)}>
                  <a
                    className={
                      isTab == 2 ? "nav-link-item active" : "nav-link-item"
                    }
                    data-bs-toggle="tab"
                  >
                    2. Data Collection
                  </a>
                </li>
                <li className="nav-tab-item" onClick={() => handleTab(3)}>
                  <a
                    className={
                      isTab == 3 ? "nav-link-item active" : "nav-link-item"
                    }
                    data-bs-toggle="tab"
                  >
                    3. Data Usage
                  </a>
                </li>
                <li className="nav-tab-item" onClick={() => handleTab(4)}>
                  <a
                    className={
                      isTab == 4 ? "nav-link-item active" : "nav-link-item"
                    }
                    data-bs-toggle="tab"
                  >
                    4. Data Sharing
                  </a>
                </li>
                <li className="nav-tab-item" onClick={() => handleTab(5)}>
                  <a
                    className={
                      isTab == 5 ? "nav-link-item active" : "nav-link-item"
                    }
                    data-bs-toggle="tab"
                  >
                    5. User Rights
                  </a>
                </li>
              </ul>
            </div>

            <div className="col-lg-7">
              <h5 className="text-capitalize title">Privacy Policy</h5>
              <div className="tab-content content-box-privacy">
                {/* Tab 1: Introduction */}
                <div
                  className={
                    isTab == 1 ? "tab-pane fade show active" : "tab-pane fade"
                  }
                >
                  <h6>1. Introduction</h6>
                  <p>
                    Welcome to Nassayem Salalah Business. This Privacy Policy
                    explains how we collect, use, and protect your personal
                    information when you interact with our services, including
                    our website and WhatsApp Business account.
                  </p>
                  <p>
                    We are committed to safeguarding your privacy and ensuring
                    compliance with applicable data protection laws.
                  </p>
                </div>

                {/* Tab 2: Data Collection */}
                <div
                  className={
                    isTab == 2 ? "tab-pane fade show active" : "tab-pane fade"
                  }
                >
                  <h6>2. Data Collection</h6>
                  <p>We may collect the following types of information:</p>
                  <ul className="box-list">
                    <li>
                      <strong>Contact Information:</strong> Name, phone number,
                      email address, and other contact details provided by you.
                    </li>
                    <li>
                      <strong>Usage Data:</strong> Information about how you
                      interact with our services, such as pages visited and
                      features used.
                    </li>
                    <li>
                      <strong>Communication Data:</strong> Messages sent through
                      WhatsApp or other communication channels.
                    </li>
                    <li>
                      <strong>Technical Data:</strong> IP address, browser type,
                      device information, and other technical details.
                    </li>
                  </ul>
                  <p>
                    We only collect data that is necessary for providing our
                    services and improving your experience.
                  </p>
                </div>

                {/* Tab 3: Data Usage */}
                <div
                  className={
                    isTab == 3 ? "tab-pane fade show active" : "tab-pane fade"
                  }
                >
                  <h6>3. Data Usage</h6>
                  <p>We use your data for the following purposes:</p>
                  <ul className="box-list">
                    <li>
                      To respond to your inquiries and provide customer support.
                    </li>
                    <li>
                      To personalize your experience and improve our services.
                    </li>
                    <li>
                      To send updates, promotions, and marketing communications
                      (if you opt-in).
                    </li>
                    <li>
                      To analyze usage patterns and enhance website
                      functionality.
                    </li>
                  </ul>
                  <p>
                    We do not use your data for any purpose other than those
                    explicitly stated in this Privacy Policy.
                  </p>
                </div>

                {/* Tab 4: Data Sharing */}
                <div
                  className={
                    isTab == 4 ? "tab-pane fade show active" : "tab-pane fade"
                  }
                >
                  <h6>4. Data Sharing</h6>
                  <p>
                    We do not sell, trade, or otherwise transfer your personal
                    information to third parties without your consent, except in
                    the following cases:
                  </p>
                  <ul className="box-list">
                    <li>
                      To trusted service providers who assist us in operating
                      our business.
                    </li>
                    <li>
                      To comply with legal obligations or enforce our policies.
                    </li>
                    <li>
                      To protect the rights, property, or safety of our users or
                      others.
                    </li>
                  </ul>
                  <p>
                    All third-party service providers are obligated to keep your
                    information confidential and secure.
                  </p>
                </div>

                {/* Tab 5: User Rights */}
                <div
                  className={
                    isTab == 5 ? "tab-pane fade show active" : "tab-pane fade"
                  }
                >
                  <h6>5. User Rights</h6>
                  <p>
                    You have the following rights regarding your personal data:
                  </p>
                  <ul className="box-list">
                    <li>
                      <strong>Access:</strong> Request a copy of the data we
                      hold about you.
                    </li>
                    <li>
                      <strong>Correction:</strong> Update or correct inaccurate
                      information.
                    </li>
                    <li>
                      <strong>Deletion:</strong> Request the removal of your
                      data from our systems.
                    </li>
                    <li>
                      <strong>Opt-Out:</strong> Withdraw consent for marketing
                      communications.
                    </li>
                  </ul>
                  <p>
                    To exercise these rights, please contact us at{" "}
                    <a href="mailto:nssayemsalalah@gmail.com">
                      nssayemsalalah@gmail.com
                    </a>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
