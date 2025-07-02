import React, { useEffect } from 'react';
import { motion, useSpring, useInView } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  label: string;
  duration?: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, label, duration = 1.5 }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const spring = useSpring(0, { duration, ease: [0.42, 0, 0.58, 1] });
  const [displayValue, setDisplayValue] = React.useState(0);

  useEffect(() => {
    if (inView) {
      spring.set(0);
      spring.set(value);
    }
  }, [inView, value, spring]);

  useEffect(() => {
    return spring.on('change', (latest) => {
      setDisplayValue(Math.floor(latest));
    });
  }, [spring]);

  return (
    <div ref={ref} className="flex flex-col items-center">
      <motion.span
        className="text-4xl font-bold text-primary"
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {displayValue.toLocaleString()}
      </motion.span>
      <span className="text-muted-foreground mt-2 text-lg font-medium">{label}</span>
    </div>
  );
};

export default AnimatedCounter; 