import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Get Started - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Complete EV Charging API`}
      description="Comprehensive REST API for EV charging management. Support for 1 million chargers, real-time monitoring, and secure authentication.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <section className={styles.ctaSection}>
          <div className="container">
            <div className="row">
              <div className="col col--8 col--offset-2">
                <div className="text--center">
                  <Heading as="h2">Ready to Integrate?</Heading>
                  <p className="text--left">
                    Join thousands of developers who are already using our EV Charging API to build innovative charging solutions. 
                    Get started today with our comprehensive documentation and client libraries.
                  </p>
                  <div className={styles.ctaButtons}>
                    <Link
                      className="button button--primary button--lg"
                      to="/docs/api-endpoints">
                      View API Reference
                    </Link>
                    <Link
                      className="button button--outline button--lg"
                      to="/docs/architecture">
                      System Architecture
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
