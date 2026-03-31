import { useState, useEffect } from 'react';

function detect() {
  // window.navigator.standalone is true on iOS when launched from Home Screen
  // matchMedia('display-mode: standalone') covers Android PWA and some iOS cases
  return (
    window.navigator.standalone === true ||
    (!!window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
  );
}

export function useStandaloneMode() {
  const [standalone, setStandalone] = useState(detect);

  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia('(display-mode: standalone)');
    const onChange = () => setStandalone(detect());
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return standalone;
}
