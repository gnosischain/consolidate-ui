'use client'; //TODO fetch directly without hook

import { StatisticsTable } from "../../../components/StatisticsTable";
import { useStatistics } from "../../../hooks/useStatistics";

export default async function Page({
    params,
}: {
    params: Promise<{ validatorIndex: string }>;
}) {
    const { validatorIndex } = await params;
    const { statistics } = useStatistics(validatorIndex);

    if (!statistics) { return (<div>No statistics found</div>) }

    return (
        <div className="w-full flex items-center justify-center text-gray-500">
            Validator {validatorIndex}
            <StatisticsTable statistics={statistics} />
        </div>
    );
}
