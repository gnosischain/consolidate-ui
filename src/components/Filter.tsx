interface Props {
	text: string;
	filter: string | undefined;
	setFilter: (value: string | undefined) => void;
	value: string | undefined;
}

export function Filter({ text, filter, setFilter, value }: Props) {
	return (
		<button
			className={`border-1 rounded-lg px-2 py-1 text-sm font-medium hover:text-white/80 hover:cursor-pointer ${
				filter === value ? 'text-white' : 'text-gray-400'
			}`}
			onClick={() => setFilter(value)}
		>
			{text}
		</button>
	);
}
