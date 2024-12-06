import { EdgeChange, NodeChange } from '@xyflow/react';
import { useCallback, useState } from 'react';

export type OnChange = (changes: (NodeChange | EdgeChange)[]) => void;

export function useSelection() {
  const [selected, setSelected] = useState(new Set<string>());

  const onSelectionChange: OnChange = useCallback((changes) => {
    changes.forEach(
      (change) =>
        change.type === 'select' &&
        (change.selected
          ? selected.add(change.id)
          : selected.delete(change.id)),
    );
    setSelected(new Set(selected));
  }, []);

  return [selected as ReadonlySet<string>, onSelectionChange] as const;
}
