import type { ReactNode } from 'react';
import styles from './styles.module.css';
import RemindersSection from '../reminder/reminderSection';


export default function HomepageFeatures(): ReactNode {
  return (
    <>
      <section className={styles.features}>
        <div className="container">
          <RemindersSection />
        </div>
      </section>
    </>
  );
}

