import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const FeatureList = [
  {
    title: '🚀 Seamless Integration',
    description: 'Easily integrate multiple microfrontends into a single cohesive application with minimal configuration.',
  },
  {
    title: '⚡ Performance Optimized',
    description: 'Built-in code splitting and lazy loading ensure optimal performance for your applications.',
  },
  {
    title: '🔒 Secure by Design',
    description: 'Robust security features to keep your microfrontends isolated and protected.',
  },
  {
    title: '🎯 Framework Agnostic',
    description: 'Works with React, Vue, Angular, or any other JavaScript framework.',
  },
  {
    title: '🔄 Real-time Updates',
    description: 'Update your microfrontends independently without full page reloads.',
  },
];

interface FeatureProps {
  title: string;
  description: string;
  key?: number;
}

function Feature({title, description}: FeatureProps) {
  return (
    <div className="col col--4 padding--md">
      <div className="card">
        <div className="card__header">
          <h3>{title}</h3>
        </div>
        <div className="card__body">
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className="hero hero--primary">
      <div className="container">
        <div className="row">
          <div className="col col--6">
            <Heading as="h1" className="hero__title">
              {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <div className="margin-top--lg">
              <Link
                className="button button--secondary button--lg"
                to="/docs/intro">
                Get Started - 5 min ⏱️
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout
      title="Home"
      description="Micro Frontend Orchestrator - A powerful solution for managing microfrontends at scale">
      <HomepageHeader />
      <main className="padding-vert--lg">
        <section className="container">
          <div className="row">
            <div className="col col--12 text--center margin-bottom--lg">
              <h2>Why Choose Micro Frontend Orchestrator?</h2>
              <p className="margin-top--md">
                Build scalable and maintainable frontend applications with our powerful microfrontend orchestration solution.
              </p>
            </div>
          </div>
          <div className="row">
            {FeatureList.map((props, idx) => (
              <Feature key={idx} {...props} />
            ))}
          </div>
        </section>
        
        <section className="container margin-vert--xl">
          <div className="row">
            <div className="col col--8 col--offset-2 text--center">
              <h2>Ready to Get Started?</h2>
              <p className="margin-vert--md">
                Join thousands of developers who have already streamlined their microfrontend architecture.
              </p>
              <Link
                className="button button--primary button--lg"
                to="/docs/intro">
                Get Started Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
