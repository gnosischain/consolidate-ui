'use client';

import { StatisticsTable } from '../../../../components/StatisticsTable';
import { useStatistics } from '../../../../hooks/useStatistics';

export function ValidatorView({ validatorIndex }: { validatorIndex: string }) {
	const { statistics } = useStatistics(validatorIndex);

	if (!statistics) {
		return <div>No statistics found</div>;
	}

	return (
		<div className="w-full flex items-center justify-center text-gray-500">
			Validator {validatorIndex}
			<StatisticsTable statistics={statistics} />
		</div>
	);
}
