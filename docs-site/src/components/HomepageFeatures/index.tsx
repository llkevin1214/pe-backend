import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Remote Control',
    Svg: require('@site/static/img/remote-control.svg').default,
    description: (
      <>
        Remotely control chargers on/off with secure authentication and real-time status updates.
      </>
    ),
  },
  {
    title: 'High Performance',
    Svg: require('@site/static/img/performance.svg').default,
    description: (
      <>
        Support for 1 million chargers with sub-200ms response times and 99.9% uptime.
      </>
    ),
  },
  {
    title: 'Developer Friendly',
    Svg: require('@site/static/img/developer.svg').default,
    description: (
      <>
        Complete documentation, client libraries for JavaScript and Python, and comprehensive examples.
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
