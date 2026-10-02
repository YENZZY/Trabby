import { useEffect } from 'react';
import { Pedometer } from 'expo-sensors';
import { useTrabby } from '../../store/useTrabby';

export function usePedometer() {
  const addSteps = useTrabby((s) => s.addSteps);
  useEffect(() => {
    let sub: { remove: () => void } | undefined;
    (async () => {
      const ok = await Pedometer.isAvailableAsync();
      if (!ok) return;
      const { granted } = await Pedometer.requestPermissionsAsync();
      if (!granted) return;
      let last = 0;
      sub = Pedometer.watchStepCount((r) => {
        const delta = r.steps - last;
        last = r.steps;
        if (delta > 0) addSteps(delta);
      });
    })();
    return () => sub?.remove();
  }, [addSteps]);
}
