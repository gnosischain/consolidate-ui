import { ValidatorInfo } from '../hooks/useBeaconValidators';

interface ValidatorListProps {
  title: string;
  validators: ValidatorInfo[];
  actionLabel?: string;
  onAction?: (v: ValidatorInfo) => void;
}

export function ValidatorList({ title, validators, actionLabel, onAction }: ValidatorListProps) {
  return (
    <div className="collapse collapse-arrow border-base-300 border">
      <input type="checkbox" />
      <div className="collapse-title text-sm font-semibold">{title}</div>
      <div className="collapse-content text-sm">
        <ul className="list rounded-box max-h-60 overflow-y-auto">
          {validators.map((v) => (
            <li key={v.index} className="list-row flex justify-between">
              <span>{v.index} ({v.balanceEth} GNO)</span>
              {actionLabel && onAction && (
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => onAction(v)}
                >
                  {actionLabel}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}