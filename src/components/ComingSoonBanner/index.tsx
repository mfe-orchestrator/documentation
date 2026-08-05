import type {ReactNode} from 'react';
import styles from './styles.module.css';

type Props = {
  /** Name of the feature, used in the headline and the accessible label. */
  feature: string;
  /** What readers should do in the meantime. */
  children: ReactNode;
};

/**
 * A full-width banner announcing that a documented feature is not shipped yet.
 * Louder than an admonition on purpose: it has to be impossible to scroll past
 * before someone builds on a feature that is still coming.
 */
export default function ComingSoonBanner({feature, children}: Props): ReactNode {
  return (
    <aside
      className={styles.banner}
      role="note"
      aria-label={`${feature}: coming soon`}>
      <span className={styles.badge}>Coming soon</span>
      {/* Dash, not a verb: `feature` may be singular or plural. */}
      <p className={styles.title}>{feature} — not available yet</p>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}
