'use client'; //TODO fetch directly with server component

import { use } from "react";
import { StatisticsTable } from "../../../components/StatisticsTable";
import { useStatistics } from "../../../hooks/useStatistics";

export default function Page({
    params,
}: {
    params: Promise<{ validatorIndex: string }>;
}) {
    const { validatorIndex } = use(params);
    const { statistics } = useStatistics(validatorIndex);

    if (!statistics) { return (<div>No statistics found</div>) }

    return (
        <div className="w-full flex items-center justify-center text-gray-500">
            Validator {validatorIndex}
            <StatisticsTable statistics={statistics} />
        </div>
    );
}
