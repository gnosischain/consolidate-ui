export default async function Page({
    params,
}: {
    params: Promise<{ validatorIndex: string }>;
}) {
    const { validatorIndex } = await params;

    return (
        <div className="w-full flex items-center justify-center text-gray-500">
            Validator {validatorIndex}
        </div>
    );
}
